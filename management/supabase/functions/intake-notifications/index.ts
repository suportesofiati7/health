import { procedureSummary } from "../../../src/procedureLabels.js";
import { admin } from "../_shared/core.ts";
import { buildIntakeEmail } from "./email.js";

// Extra: arquivos físicos por email são opt-in por conterem RG/CPF/saúde.
// O limite de 20 MiB (antes do Base64) deixa margem sob o limite do Resend.
const MAX_EMAIL_FILE_BYTES = 20 * 1024 * 1024;
const EMAIL_MIME_TYPES = new Set(["application/pdf","image/jpeg","image/png","image/webp","image/heic","image/heif"]);
async function optionalEmailFiles(db, rows, enabled) {
  if (!enabled || !rows.length) return [];
  const total = rows.reduce((sum, row) => sum + Number(row.size_bytes || 0), 0);
  if (rows.length > 10 || !Number.isFinite(total) || total > MAX_EMAIL_FILE_BYTES ||
    rows.some(row => !row.path || !EMAIL_MIME_TYPES.has(String(row.mime_type)) ||
      Number(row.size_bytes) < 1 || Number(row.size_bytes) > 10 * 1024 * 1024)) {
    console.warn("intake_email_attachments_skipped_limits");
    return [];
  }
  const result = [];
  for (const row of rows) {
    const download = await db.storage.from("intake-private").download(row.path);
    if (download.error || !download.data) {
      console.warn("intake_email_attachments_skipped_unavailable");
      return [];
    }
    const bytes = new Uint8Array(await download.data.arrayBuffer());
    if (bytes.byteLength !== Number(row.size_bytes)) {
      console.warn("intake_email_attachments_skipped_mismatch");
      return [];
    }
    let raw = "";
    for (let i = 0; i < bytes.length; i += 32768) {
      raw += String.fromCharCode(...bytes.subarray(i, i + 32768));
    }
    result.push({
      filename: String(row.original_name || "documento").replace(/[\\/\r\n]/g, "_").slice(0, 255),
      content: btoa(raw),
      content_type: String(row.mime_type),
    });
  }
  return result;
}

Deno.serve(async (req) => {
  const workerSecret = Deno.env.get("NOTIFICATION_WORKER_SECRET");
  if (!workerSecret || req.method !== "POST" || req.headers.get("Authorization") !== `Bearer ${workerSecret}`) {
    return new Response(null, { status: 403 });
  }
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) return Response.json({ error: "notification_unconfigured" }, { status: 503 });
  const db = admin();
  const claimed = await db.rpc("claim_intake_notifications");
  if (claimed.error) return Response.json({ error: "queue_unavailable" }, { status: 503 });
  let sent = 0;
  for (const job of claimed.data || []) {
    try {
      if (job.attempts > 1 && Date.now() - Date.parse(job.created_at) > 23 * 60 * 60 * 1000) {
        throw Error("notification_requires_review");
      }
      const intake = await db.from("public_intakes")
        .select("full_name,submitted_at,selected_procedure,completed_at,payload")
        .eq("id", job.intake_id).single();
      if (intake.error || !intake.data?.completed_at) throw Error("intake_unavailable");

      // Arquivos não fazem parte do JSON do formulário: são persistidos numa tabela separada.
      const attachments = await db.from("public_intake_files")
        .select("field_name,original_name,mime_type,path,size_bytes")
        .eq("intake_id", job.intake_id);
      if (attachments.error) throw Error("attachments_unavailable");

      const email = buildIntakeEmail(
        intake.data, attachments.data || [], job.intake_id, procedureSummary,
        Deno.env.get("BRAND_GOLD_LOGO_URL"),
      );
      const emailFiles = await optionalEmailFiles(
        db, attachments.data || [],
        Deno.env.get("EMAIL_ATTACH_CLINICAL_FILES") === "true",
      );
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `intake-${job.intake_id}`,
        },
        body: JSON.stringify({
          from,
          to: ["suportesofiati@gmail.com", "sofiatimendonca@gmail.com"],
          subject: `Novo cadastro clínico — ${String(intake.data.full_name || "Franciele Sofiati").replace(/[\r\n]/g, " ").slice(0, 120)}`,
          html: email.html,
          text: email.text,
          ...(emailFiles.length ? { attachments: emailFiles } : {}),
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw Error(`provider_${response.status}`);
      const result = await db.from("intake_notification_outbox")
        .update({ status: "sent", sent_at: new Date().toISOString(), last_error: null })
        .eq("id", job.id);
      if (result.error) throw Error("delivery_record_failed");
      sent++;
    } catch (error) {
      await db.from("intake_notification_outbox")
        .update({
          ...(error instanceof Error && error.message === "notification_requires_review" ? { attempts: 12 } : {}),
          status: "failed",
          last_error: error instanceof Error ? error.message : "delivery_failed",
          available_at: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts)).toISOString(),
        }).eq("id", job.id);
    }
  }
  return Response.json({ sent });
});
