import { createClient } from "npm:@supabase/supabase-js@2.116.0";

export const ORG = "a783bd4c-f253-4a94-9365-75c6f1000001";
export const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
export function headers(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = [
    Deno.env.get("MANAGEMENT_ORIGIN"),
    Deno.env.get("PUBLIC_ORIGIN"),
  ].filter(Boolean);
  return {
    "Content-Type": "application/json",
    "Cache-Control": "private, no-store, max-age=0",
    "CDN-Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "null",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "X-Content-Type-Options": "nosniff",
  };
}
export function reply(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: headers(req) });
}
export function endpoint(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    if (req.method === "OPTIONS")
      return new Response(null, { headers: headers(req) });
    if (req.method !== "POST") return reply(req, { error: "method" }, 405);
    if (headers(req)["Access-Control-Allow-Origin"] === "null")
      return reply(req, { error: "origin" }, 403);
    try {
      return await handler(req);
    } catch {
      return reply(req, { error: "request_failed" }, 400);
    }
  };
}
export async function json(req: Request, max = 12000) {
  const bytes = await bounded(req, max);
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function bounded(req: Request, max: number) {
  if (Number(req.headers.get("content-length")) > max) throw Error("size");
  const reader = req.body?.getReader();
  if (!reader) throw Error("body");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) {
      await reader.cancel();
      throw Error("size");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
export async function identity(
  req: Request,
  roles = ["owner", "professional"],
) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) throw Error("auth");
  const db = admin();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw Error("auth");
  // A caller-scoped query uses the same current-session and membership checks as RLS.
  const scoped = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    },
  );
  const { data: member } = await scoped
    .from("memberships")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("organization_id", ORG)
    .single();
  if (!member || !roles.includes(member.role)) throw Error("forbidden");
  return { db, scoped, user: data.user, member };
}
export async function limit(
  db: ReturnType<typeof admin>,
  key: string,
  max: number,
  seconds: number,
) {
  const { data, error } = await db.rpc("consume_rate_limit", {
    rate_key: key,
    max_hits: max,
    seconds,
  });
  if (error || !data) throw Error("rate_limit");
}
export async function sha256(bytes: Uint8Array) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes))) ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
