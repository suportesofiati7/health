import { identity, endpoint, json, reply } from "../_shared/core.ts";

const cleanText = (value: unknown, max: number) => String(value || "").trim().slice(0, max);

Deno.serve(endpoint(async (req) => {
  const { scoped } = await identity(req);
  const body = await json(req, 120000);
  const recipient = cleanText(body.recipient, 254).toLowerCase();
  const subject = cleanText(body.subject, 200);
  const message = cleanText(body.body, 100000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || !subject || !message) throw Error("email_invalid");
  const { data: patient } = await scoped.from("patients").select("id,organization_id").eq("email", recipient).maybeSingle();
  if (!patient) throw Error("email_recipient_not_patient");
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!key || !from) return reply(req, { status: "unconfigured", error: "email_provider_unconfigured" }, 503);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [recipient], subject, text: `Franciele Sofiati\n\n${message}` }),
  });
  const result = await response.json().catch(() => ({}));
  const status = response.ok && result?.id ? "sent" : "failed";
  if (status !== "sent") return reply(req, { status, error: result?.message || "email_provider_rejected" }, 502);
  return reply(req, { status, provider_id: result.id });
}));
