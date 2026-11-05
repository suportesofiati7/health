import { admin, endpoint, json, reply, sha256, limit } from "../_shared/core.ts";

// Public write-only collector. Reports use owner-only RLS and a separate RPC.
Deno.serve(endpoint(async (req) => {
  const body = await json(req, 256);
  if (!body || Object.keys(body).some((key) => !["event_id", "consent"].includes(key)) ||
      body.consent !== true || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.event_id || "")) {
    return reply(req, { error: "invalid_click" }, 400);
  }
  const salt = Deno.env.get("RATE_LIMIT_SALT");
  if (!salt) return reply(req, { error: "unconfigured" }, 503);
  const db = admin();
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  // Daily salted bucket is only used by the existing short-lived rate limiter.
  const bucket = await sha256(new TextEncoder().encode(`${salt}:whatsapp:${new Date().toISOString().slice(0,10)}:${ip}`));
  await limit(db, `whatsapp:${bucket}`, 30, 60);
  const { error } = await db.from("whatsapp_widget_clicks").insert({ event_id: body.event_id });
  if (error && error.code !== "23505") return reply(req, { error: "counter_unavailable" }, 503);
  return reply(req, { received: true }, 202);
}));
