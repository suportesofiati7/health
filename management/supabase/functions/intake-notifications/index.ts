import { procedureSummary } from "../../../src/procedureLabels.js";
import { admin } from "../_shared/core.ts";
import { buildIntakeEmail } from "./email.js";

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
        .select("field_name,original_name,mime_type")
        .eq("intake_id", job.intake_id);
      if (attachments.error) throw Error("attachments_unavailable");

      const email = buildIntakeEmail(
        intake.data, attachments.data || [], job.intake_id, procedureSummary,
        Deno.env.get("BRAND_GOLD_LOGO_URL"),
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
