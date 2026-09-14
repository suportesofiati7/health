import { admin, ORG, endpoint, reply, clean, sha256, limit } from "../_shared/core.ts";

const MAX_FILE = 10 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function ext(type: string) {
  return type === "application/pdf" ? "pdf" : type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}

Deno.serve(endpoint(async (req) => {
  const form = await req.formData();
  const token = clean(form.get("token"), 2048);
  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
  const salt = Deno.env.get("RATE_LIMIT_SALT");
  if (!turnstileSecret || !salt) throw Error("unconfigured");
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: turnstileSecret, response: token }),
  }).then((r) => r.json());
  const allowedHosts = [Deno.env.get("PUBLIC_ORIGIN"), Deno.env.get("MANAGEMENT_ORIGIN")]
    .filter(Boolean).map((value) => new URL(value!).hostname);
  if (!verification.success || !allowedHosts.includes(verification.hostname) || verification.action !== "formulario") throw Error("challenge");

  const ip = (req.headers.get("x-forwarded-for") || "nao_confirmado").split(",")[0].trim();
  await limit(admin(), "formulario:ip:" + await sha256(new TextEncoder().encode(salt + ip)), 3, 3600);
  const identity = form.get("identity_upload");
  const payment = form.get("booking_payment_receipt");
  const files = [identity, payment].filter((file): file is File => file instanceof File && file.size > 0);
  for (const file of files) {
    if (!allowedTypes.has(file.type) || file.size < 1 || file.size > MAX_FILE) throw Error("file");
  }
  const rawPayload = clean(form.get("payload"), 500000);
  const payload = JSON.parse(rawPayload);
  const required = ["cpf", "form_version"];
  if (required.some((key) => !clean(payload[key], 300))) throw Error("required");
  const cpf = clean(payload.cpf, 30).replace(/\D/g, "");
  if (!/^\d{11}$/.test(cpf)) throw Error("cpf");
  const db = admin();
  const { data: intake, error } = await db.from("public_intakes").insert({
    organization_id: ORG,
    full_name: clean(payload.full_name, 200) || "Cadastro sem nome", preferred_name: clean(payload.preferred_name, 200),
    email: clean(payload.email, 254).toLowerCase(), phone: clean(payload.phone, 30), cpf,
    selected_procedure: clean(payload.selected_procedure, 120), form_version: clean(payload.form_version, 40),
    language: clean(payload.language, 20) || "pt-BR", payload,
  }).select("id").single();
  if (error || !intake) throw Error("save");
  const uploaded: string[] = [];
  try {
    for (const [kind, file] of [["identity", identity], ["payment", payment]] as const) {
      if (!(file instanceof File) || file.size === 0) continue;
      const path = `${ORG}/${intake.id}/${crypto.randomUUID()}.${ext(file.type)}`;
      const result = await db.storage.from("intake-private").upload(path, file, { contentType: file.type, upsert: false });
      if (result.error) throw Error("upload");
      uploaded.push(path);
      const saved = await db.from("public_intake_files").insert({ organization_id: ORG, intake_id: intake.id, kind, path, mime_type: file.type, size_bytes: file.size });
      if (saved.error) throw Error("file_record");
    }
  } catch (error) {
    await Promise.all(uploaded.map((path) => db.storage.from("intake-private").remove([path])));
    await db.from("public_intakes").delete().eq("id", intake.id);
    throw error;
  }
  return reply(req, { received: true }, 202);
}));
