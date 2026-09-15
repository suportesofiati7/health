import {
  admin,
  ORG,
  identity,
  endpoint,
  json,
  reply,
  clean,
  limit,
} from "../_shared/core.ts";

Deno.serve(
  endpoint(async (req) => {
    const b = await json(req);
    if (b.action === "activate") {
      const db = admin(),
        token =
          req.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
      const {
        data: { user },
        error,
      } = await db.auth.getUser(token);
      const email = clean(b.email, 254).toLowerCase();
      if (error || !user?.email_confirmed_at || !email || user.email?.toLowerCase() !== email) throw Error("auth");
      const { error: updateError } = await db
        .from("memberships")
        .update({ status: "ativo", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("organization_id", ORG)
        .eq("status", "convidado");
      if (updateError) throw Error("activate");
      return reply(req, { activated: true });
    }
    const { db, user } = await identity(req, ["proprietario"]);
    await limit(db, "staff:" + user.id, 20, 3600);
    const origin = Deno.env.get("MANAGEMENT_ORIGIN")!;
    if (b.action === "portal_credentials") {
      const patientId = clean(b.patient_id, 80);
      const { data: patient } = await db.from("patients").select("id,cpf").eq("organization_id", ORG).eq("id", patientId).single();
      const cpf = String(patient?.cpf || "").replace(/\D/g, "");
      if (!patient || cpf.length !== 11) throw Error("patient_cpf");
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const temporaryPassword = `Fsofiati-${random(9)}`;
      const hash = await passwordHash(temporaryPassword, salt);
      const cpfHash = await sha256(new TextEncoder().encode(`${Deno.env.get("RATE_LIMIT_SALT") || "portal"}:${cpf}`));
      const { error } = await db.from("patient_portal_accounts").upsert({ organization_id: ORG, patient_id: patient.id, cpf_hash: cpfHash, password_salt: b64(salt), password_hash: b64(hash), status: "ativo", must_change_password: true, failed_attempts: 0, locked_until: null, created_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "organization_id,patient_id" });
      if (error) throw Error("portal_account");
      await db.from("audit_events").insert({ organization_id: ORG, actor_id: user.id, action: "portal_credenciais_geradas", entity_type: "patients", entity_id: patient.id });
      return reply(req, { patient_id: patient.id, temporary_password: temporaryPassword });
    }
    if (b.action === "portal_revoke") {
      const patientId = clean(b.patient_id, 80);
      const { error } = await db.from("patient_portal_accounts").update({ status: "revogado", updated_at: new Date().toISOString() }).eq("organization_id", ORG).eq("patient_id", patientId);
      if (error) throw Error("portal_revoke");
      await db.from("patient_portal_sessions").update({ revoked_at: new Date().toISOString() }).eq("organization_id", ORG).in("account_id", (await db.from("patient_portal_accounts").select("id").eq("organization_id", ORG).eq("patient_id", patientId)).data?.map((row) => row.id) || []);
      return reply(req, { revoked: true });
    }
    if (b.action === "convite") {
      const email = clean(b.email, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error("email");
      if (!["profissional", "recepcao", "leitura"].includes(b.role))
        throw Error("role");
      const { data: invited, error: inviteError } = await db.auth.admin.inviteUserByEmail(email, {
        redirectTo: origin,
      });
      if (inviteError || !invited.user) throw Error("convite");
      const { data, error } = await db.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: origin },
      });
      if (error || !data.user) throw Error("convite");
      const { error: insertError } = await db
        .from("memberships")
        .insert({
          organization_id: ORG,
          user_id: data.user.id,
          email,
          name: clean(b.name, 200),
          role: b.role,
          profession: clean(b.profession, 100),
          council: clean(b.council, 30),
          registration: clean(b.registration, 50),
          state: clean(b.state, 2),
          specialty: clean(b.specialty, 100),
        });
      if (insertError) throw Error("membership");
      await db
        .from("audit_events")
        .insert({
          organization_id: ORG,
          actor_id: user.id,
          action: "convite",
          entity_type: "memberships",
          entity_id: data.user.id,
        });
      await notifyStaff({
        subject: "Novo acesso profissional criado - Franciele Sofiati",
        lines: [
          "Um novo acesso profissional foi criado.",
          `Nome: ${clean(b.name, 200) || "Não informado"}`,
          `Email: ${email}`,
          `Papel: ${b.role}`,
          `Responsabilidade: ${[clean(b.profession, 100), clean(b.specialty, 100)].filter(Boolean).join(" · ") || "Não informada"}`,
          `Link de primeiro cadastro: ${activationLink(origin, data.properties.hashed_token, "invite")}`,
          "A pessoa deverá informar o próprio email e criar/confirmar a senha no link.",
          "Por segurança, nenhuma senha é enviada ou armazenada em texto.",
        ],
      });
      return reply(req, {
        link: activationLink(origin, data.properties.hashed_token, "invite"),
      });
    }
    const { data: member } = await db
      .from("memberships")
      .select("*")
      .eq("organization_id", ORG)
      .eq("user_id", b.user_id)
      .single();
    if (!member || member.user_id === user.id)
      throw Error("protected_owner");
    if (b.action === "recovery") {
      if (!["ativo", "convidado"].includes(member.status))
        throw Error("inativo");
      const linkType = member.status === "convidado" ? "invite" : "recovery";
      const { data, error } = await db.auth.admin.generateLink({
        type: linkType,
        email: member.email,
        options: { redirectTo: origin },
      });
      if (error) throw Error("recovery");
      await db
        .from("audit_events")
        .insert({
          organization_id: ORG,
          actor_id: user.id,
          action: "link_recuperacao",
          entity_type: "memberships",
          entity_id: member.id,
        });
      await notifyStaff({
        subject: "Novo link de acesso profissional - Franciele Sofiati",
        lines: [
          "Um novo link de acesso foi gerado.",
          `Nome: ${member.name || "Não informado"}`,
          `Email: ${member.email}`,
          `Papel: ${member.role}`,
          `Responsabilidade: ${[member.profession, member.specialty].filter(Boolean).join(" · ") || "Não informada"}`,
          `Link: ${activationLink(origin, data.properties.hashed_token, linkType)}`,
          "A pessoa deverá informar o próprio email e criar/confirmar a senha no link.",
          "Por segurança, nenhuma senha é enviada ou armazenada em texto.",
        ],
      });
      return reply(req, {
        link: activationLink(origin, data.properties.hashed_token, linkType),
      });
    }
    if (b.action === "delete") {
      await db.from("audit_events").insert({ organization_id: ORG, actor_id: user.id, action: "usuario_excluido", entity_type: "memberships", entity_id: member.id });
      await db.from("staff_permissions").delete().eq("organization_id", ORG).eq("user_id", member.user_id);
      const { error: membershipError } = await db.from("memberships").delete().eq("id", member.id);
      if (membershipError) throw Error("delete_membership");
      const { error: authError } = await db.auth.admin.deleteUser(member.user_id);
      if (authError) throw Error("delete_auth");
      return reply(req, { deleted: true });
    }
    if (
      b.action !== "update" ||
      member.role === "proprietario" ||
      !["ativo", "inativo", "suspenso"].includes(b.status) ||
      !["profissional", "recepcao", "leitura"].includes(b.role)
    )
      throw Error("action");
    const { error } = await db
      .from("memberships")
      .update({
        role: b.role,
        status: b.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);
    if (error) throw Error("update");
    await db
      .from("audit_events")
      .insert({
        organization_id: ORG,
        actor_id: user.id,
        action: "acesso_alterado",
        entity_type: "memberships",
        entity_id: member.id,
      });
    // Membership RLS revokes data access immediately, including already-issued JWTs.
    return reply(req, { saved: true });
  }),
);

function activationLink(origin: string, hash: string, type: string) {
  return `${origin}/#token_hash=${encodeURIComponent(hash)}&type=${type}`;
}

async function notifyStaff({ subject, lines }: { subject: string; lines: string[] }) {
  try {
    const message = new FormData();
    message.set("_subject", subject);
    message.set("message", lines.join("\n"));
    const response = await fetch("https://formsubmit.co/ajax/suportesofiati%40gmail.com", {
      method: "POST",
      body: message,
      headers: { Accept: "application/json", Origin: "https://francielesofiati.com", Referer: "https://francielesofiati.com/" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) console.error("STAFF_NOTIFICATION_FAILED", response.status);
  } catch (error) {
    console.error("STAFF_NOTIFICATION_EXCEPTION", error instanceof Error ? error.message : "unknown");
  }
}

function random(size = 9) { const bytes = crypto.getRandomValues(new Uint8Array(size)); return btoa(String.fromCharCode(...bytes)).replace(/[^A-Za-z0-9]/g, "").slice(0, size); }
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
async function passwordHash(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 240000, hash: "SHA-256" }, material, 256));
}
