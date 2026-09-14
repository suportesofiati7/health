import {
  ORG,
  identity,
  endpoint,
  json,
  reply,
  sha256,
  limit,
} from "../_shared/core.ts";

Deno.serve(
  endpoint(async (req) => {
    const { db, scoped, user } = await identity(req);
    if (Deno.env.get("EMAIL_BACKUP_ENABLED") !== "true")
      return reply(req, { error: "email_unconfigured" }, 503);
    await limit(db, "email:" + user.id, 30, 3600);
    const b = await json(req, 9500000);
    const { data: patient } = await scoped
      .from("patients")
      .select("id")
      .eq("id", b.patient_id)
      .single();
    if (
      !patient ||
      !b.packet ||
      b.packet.format !== "sofiati-encrypted-v1" ||
      b.packet.algorithm !== "AES-GCM" ||
      !/^[A-Za-z0-9+/=]+$/.test(b.packet.ciphertext || "") ||
      b.packet.iterations !== 600000 ||
      !/^[A-Za-z0-9+/=]{24}$/.test(b.packet.salt || "") ||
      !/^[A-Za-z0-9+/=]{16}$/.test(b.packet.iv || "")
    )
      throw Error("packet");
    // Reconstruct the allowlist: no caller-controlled subject, patient name or message
    // is forwarded to the email provider. Only encrypted clinical content leaves.
    const packet = JSON.stringify({
      format: b.packet.format,
      algorithm: "AES-GCM",
      iterations: 600000,
      salt: b.packet.salt,
      iv: b.packet.iv,
      ciphertext: b.packet.ciphertext,
    });
    const digest = await sha256(new TextEncoder().encode(packet));
    const { data: send, error } = await db
      .from("communications")
      .insert({
        organization_id: ORG,
        patient_id: patient.id,
        created_by: user.id,
        packet_sha256: digest,
      })
      .select("id")
      .single();
    if (error) throw Error("history");
    const body = new FormData();
    body.set("_subject", "Franciele Sofiati - backup criptografado");
    body.set(
      "message",
      "Arquivo criptografado. A chave de recuperacao e mantida separadamente pela clinica.",
    );
    body.set(
      "attachment",
      new Blob([packet], { type: "application/json" }),
      "backup.encrypted.json",
    );
    let status = "nao_confirmado";
    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/suportesofiati@gmail.com",
        { method: "POST", body, signal: AbortSignal.timeout(25000) },
      );
      const result = await response.json();
      status =
        response.ok && (result.success === true || result.success === "true")
          ? "aceito"
          : "falha";
    } catch {
      status = "nao_confirmado";
    }
    const { error: historyError } = await db
      .from("communications")
      .update({ status })
      .eq("id", send.id);
    if (historyError)
      return reply(req, { status: "nao_confirmado", id: send.id }, 502);
    return reply(
      req,
      { status, id: send.id },
      status === "aceito" ? 200 : 502,
    );
  }),
);
