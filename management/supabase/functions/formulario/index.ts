import { admin, ORG, endpoint, reply, clean, sha256, limit, bounded } from "../_shared/core.ts";

const MAX_FILE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const MAX_TOTAL_FILE_SIZE = 50 * 1024 * 1024;

function dateValue(value: unknown) {
  const text = clean(value, 10);
  // Date-only inputs arrive as YYYY-MM-DD. Checking the round trip avoids
  // accepting dates such as 2026-02-31, which PostgreSQL normalizes.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text
    ? null
    : text;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signUploadSession(value: Record<string, unknown>, salt: string) {
  const encoded = encodeBase64Url(new TextEncoder().encode(JSON.stringify(value)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(salt), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded)));
  return `${encoded}.${encodeBase64Url(signature)}`;
}

async function verifyUploadSession(token: unknown, salt: string) {
  if (typeof token !== "string" || token.length > 12000) throw Error("upload_session");
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) throw Error("upload_session");
  let value: Record<string, unknown>;
  try {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    value = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
  } catch { throw Error("upload_session"); }
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(salt), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const normalizedSignature = signature.replace(/-/g, "+").replace(/_/g, "/");
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(normalizedSignature.padEnd(Math.ceil(normalizedSignature.length / 4) * 4, "=")), (char) => char.charCodeAt(0)); }
  catch { throw Error("upload_session"); }
  if (!await crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(encoded)) || Number(value.expires_at) < Date.now()) throw Error("upload_session");
  return value;
}

function validatePayload(payload: Record<string, unknown>) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw Error("required");
  delete payload.email_already_sent;
  const approvals = ["initial_acknowledgement", "booking_fee_acknowledgement", "general_risk_acknowledgement", "truth_declaration", "marketing_revocation_acknowledgement", "lgpd_personal_data_consent", "lgpd_sensitive_data_consent", "final_acceptance"];
  if (approvals.some((key) => payload[key] !== "yes")) throw Error("consent_required");
  const selected = payload.selected_procedures;
  const allowed = ["harmony", "lightsheer", "toxina", "co2", "ultraformer", "radiofrequencia", "plasma", "mmp_capilar", "mmp_pele", "peim", "peeling_mecanico", "peeling_quimico", "peeling_ultrassonico", "peeling_cristal", "peeling_diamante", "enzimas", "limpeza_pele"];
  if (!Array.isArray(selected) || !selected.length || selected.length > allowed.length || new Set(selected).size !== selected.length || selected.some((key) => !allowed.includes(String(key)) || payload[`accepted_term_${key}`] !== "yes")) throw Error("consent_required");
  for (const key of ["technical_image_authorisation", "promotional_communication"]) if (!["yes", "no"].includes(String(payload[key]))) throw Error("consent_required");
  if (!["non_identifiable", "partial_approval", "full_approval", "no"].includes(String(payload.marketing_image_authorisation))) throw Error("consent_required");
  for (const key of ["birth_date", "appointment_date"]) if (payload[key] && !dateValue(payload[key])) throw Error("date");
  if (payload.birth_date && String(payload.birth_date) > new Date().toISOString().slice(0, 10)) throw Error("date");
  if (payload.appointment_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(payload.appointment_time))) throw Error("date");
  for (const [key, max] of Object.entries({full_name:200,preferred_name:200,email:254,phone:30,cpf:30,form_version:40,language:20,selected_procedure:1000})) {
    if (payload[key] != null && (typeof payload[key] !== "string" || String(payload[key]).length > max)) throw Error("field_size");
  }
  if (["form_version", "full_name"].some((key) => !String(payload[key] || "").trim())) throw Error("required");
  // Preserve the submitted CPF for staff review without blocking completion.
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email))) throw Error("email");
  if (!["adult", "minor_or_guardian", "minor", "legal_representative"].includes(String(payload.adult_status))) throw Error("guardian_required");
  if (payload.adult_status !== "adult" && (!String(payload.guardian_details || "").trim() || payload.guardian_details === "Não se aplica")) throw Error("guardian_required");
  // Older bundles remain accepted during rollout; the new version requires an explicit typed signature.
  if (String(payload.form_version).startsWith("2026-11-02")) {
    if (typeof payload.signature_name !== "string" || payload.signature_name.trim().length < 3 || payload.signature_name.length > 200 || payload.signature_method !== "typed_name") throw Error("signature_required");
  }
  if (payload.consent_texts != null && (typeof payload.consent_texts !== "object" || Array.isArray(payload.consent_texts) || Object.entries(payload.consent_texts).some(([key,value]) => !allowed.includes(key) || typeof value !== "string" || value.length > 100000))) throw Error("consent_required");
  if (payload.phone && !/^\d{10,15}$/.test(String(payload.phone).replace(/\D/g,""))) throw Error("phone");
  if (payload.birth_date && payload.adult_status === "adult") {
    const today = new Date(), adultBefore = new Date(Date.UTC(today.getUTCFullYear()-18,today.getUTCMonth(),today.getUTCDate())).toISOString().slice(0,10);
    if (String(payload.birth_date) > adultBefore) throw Error("guardian_required");
  }
  if (new TextEncoder().encode(JSON.stringify(payload)).length > 450000) throw Error("field_size");
}

function publicIntakeRow(payload: Record<string, unknown>, status = "novo") {
  const cpf = clean(payload.cpf, 30).replace(/\D/g, "");
  return {
    organization_id: ORG,
    full_name: clean(payload.full_name, 200) || "Cadastro sem nome",
    preferred_name: clean(payload.preferred_name, 200),
    email: clean(payload.email, 254).toLowerCase(),
    phone: clean(payload.phone, 30),
    cpf,
    selected_procedure: clean(payload.selected_procedure, 1000),
    form_version: clean(payload.form_version, 40),
    language: clean(payload.language, 20) || "pt-BR",
    payload,
    status,
  };
}

const FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
async function verifyBytes(db: ReturnType<typeof admin>, path: string, file: Record<string, unknown>) {
  const downloaded = await db.storage.from("intake-private").download(path);
  if (downloaded.error || !downloaded.data || downloaded.data.size !== Number(file.size)) throw Error("upload");
  const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
  const hash = await sha256(bytes);
  if (file.sha256 && hash !== file.sha256) throw Error("file_checksum");
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from,to));
  const type = String(file.type);
  if ((type === "application/pdf" && ascii(0,5) !== "%PDF-") ||
      (type === "image/png" && ![137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) ||
      (type === "image/jpeg" && !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)) ||
      (type === "image/webp" && !(ascii(0,4) === "RIFF" && ascii(8,12) === "WEBP")) ||
      (["image/heic","image/heif"].includes(type) && !(ascii(4,8) === "ftyp" && /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(ascii(8,12))))) throw Error("file_type");
  return hash;
}

async function prepareSubmission(req: Request, body: Record<string, unknown>, db: ReturnType<typeof admin>, salt: string) {
  const payload = body.payload;
  const manifests = body.attachments;
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !Array.isArray(manifests) || manifests.length > MAX_FILES) throw Error("required");
  validatePayload(payload as Record<string, unknown>);
  const total = manifests.reduce((sum, item) => sum + Number((item as Record<string, unknown>)?.size || 0), 0);
  if (total > MAX_TOTAL_FILE_SIZE) throw Error("file");
  const fields = new Set(["identity_upload", "booking_payment_receipt", "marketing_authorization_files", "supporting_attachments"]);
  const normalized = manifests.map((item) => {
    const file = item as Record<string, unknown>;
    const field = clean(file.field_name, 80), name = clean(file.name, 255), size = Number(file.size), type = clean(file.type, 120);
    if (!fields.has(field) || !name || !Number.isInteger(size) || size < 1 || size > MAX_FILE || !FILE_TYPES.has(type)) throw Error("file");
    if (file.sha256 && !/^[a-f0-9]{64}$/.test(String(file.sha256))) throw Error("file_checksum");
    return { field, name, size, type, sha256: file.sha256 || null, kind: field === "identity_upload" ? "identity" : field === "booking_payment_receipt" ? "payment" : field === "marketing_authorization_files" ? "marketing_authorization" : "attachment" };
  });
  const requestId = body.request_id || crypto.randomUUID();
  if (!/^[a-f0-9-]{36}$/i.test(String(requestId))) throw Error("required");
  const inserted = await db.rpc("prepare_public_form", { request: requestId, row_data: publicIntakeRow(payload as Record<string, unknown>), manifest: normalized });
  if (inserted.error || !inserted.data?.id) throw Error(inserted.error?.message?.includes("request_conflict") ? "request_conflict" : "save");
  const intakeId = inserted.data.id as string;
  const files = [];
  for (const [index,file] of normalized.entries()) {
    const path = `${ORG}/${intakeId}/${index}`;
    const existing = await db.storage.from("intake-private").info(path);
    if (!existing.error) {
      await verifyBytes(db,path,file);
      files.push({ ...file, path, uploaded: true });
      continue;
    }
    const signed = await db.storage.from("intake-private").createSignedUploadUrl(path, { upsert: false });
    if (signed.error || !signed.data?.signedUrl) throw Error("upload");
    const uploadUrl = new URL(signed.data.signedUrl);
    // Local Edge containers address Storage as kong; browsers need the exposed API origin.
    const publicApi = Deno.env.get("PUBLIC_SUPABASE_URL");
    const upload_url = publicApi ? new URL(uploadUrl.pathname + uploadUrl.search, publicApi).href : uploadUrl.href;
    files.push({ ...file, path, upload_url });
  }
  const session = await signUploadSession({ intake_id: intakeId, files: files.map(({ upload_url: _url, ...file }) => file), expires_at: Date.now() + 2 * 60 * 60 * 1000 }, salt);
  return reply(req, { prepared: true, session, files }, 200);
}

async function completeSubmission(req: Request, body: Record<string, unknown>, db: ReturnType<typeof admin>, salt: string) {
  const session = await verifyUploadSession(body.session, salt);
  const intakeId = clean(session.intake_id, 80), manifests = session.files;
  if (!intakeId || !Array.isArray(manifests) || manifests.length > MAX_FILES) throw Error("upload_session");
  const { data: intake, error: intakeError } = await db.from("public_intakes").select("id,payload,completed_at").eq("id", intakeId).eq("organization_id", ORG).single();
  if (intakeError || !intake?.payload) throw Error("save");
  if (intake.completed_at) return reply(req, { received: true, attachments: manifests.length }, 202);
  for (const item of manifests) {
    const file = item as Record<string, unknown>, path = clean(file.path, 600);
    if (!path.startsWith(`${ORG}/${intakeId}/`)) throw Error("upload_session");
    const hash = await verifyBytes(db,path,file);
    const saved = await db.from("public_intake_files").upsert({
      organization_id: ORG, intake_id: intakeId, kind: clean(file.kind, 40), path,
      mime_type: clean(file.type, 120), size_bytes: Number(file.size), sha256: hash,
      original_name: clean(file.name, 255), field_name: clean(file.field, 80),
    }, { onConflict: "path", ignoreDuplicates: true });
    if (saved.error) throw Error("file_record");
  }
  const completed = await db.rpc("complete_public_form", { enquiry: intakeId });
  if (completed.error) throw Error("save");
  return reply(req, { received: true, attachments: manifests.length }, 202);
}

Deno.serve(endpoint(async (req) => {
  const salt = Deno.env.get("RATE_LIMIT_SALT");
  if (!salt) throw Error("unconfigured");
  const db = admin();
  const rateLimit = async () => {
    const ip = (req.headers.get("x-forwarded-for") || "nao_confirmado").split(",")[0].trim();
    await limit(db, "formulario:ip:" + await sha256(new TextEncoder().encode(salt + ip)), 20, 3600);
  };
  if (req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    const body = JSON.parse(new TextDecoder().decode(await bounded(req, 600000))) as Record<string, unknown>;
    if (body.action === "prepare") { await rateLimit(); return await prepareSubmission(req, body, db, salt); }
    if (body.action === "complete") return await completeSubmission(req, body, db, salt);
    throw Error("request_failed");
  }
  // Compatibility transport uses the same validated, resumable persistence path.
  const form = await req.formData();
  await rateLimit();
  const payload = JSON.parse(String(form.get("payload") || "{}"));
  const fields = form.getAll("attachment_field").map(String);
  const attachments = form.getAll("attachments").filter((file): file is File => file instanceof File && file.size > 0);
  for (const field of ["identity_upload", "booking_payment_receipt"]) {
    const file = form.get(field);
    if (file instanceof File && file.size > 0) { attachments.push(file); fields.push(field); }
  }
  if (fields.length !== attachments.length) throw Error("file");
  const manifests = [];
  for (const [index,file] of attachments.entries()) manifests.push({field_name: fields[index],name:file.name,size:file.size,type:file.type,sha256:await sha256(new Uint8Array(await file.arrayBuffer()))});
  const preparedResponse = await prepareSubmission(req,{payload,attachments:manifests,request_id:form.get("request_id") || undefined},db,salt);
  const prepared = await preparedResponse.json();
  for (const [index,file] of attachments.entries()) {
    const path = prepared.files[index].path;
    const existing = await db.storage.from("intake-private").info(path);
    if (!existing.error) continue; // Complete verifies bytes, not just existence.
    const result = await db.storage.from("intake-private").upload(path,file,{contentType:file.type,upsert:false});
    if (result.error) throw Error("upload");
  }
  return await completeSubmission(req,{session:prepared.session},db,salt);
}));
