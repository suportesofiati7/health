import { notifySupport } from "../_shared/support-notification.ts";
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

async function createOrLinkPatient(
  db: ReturnType<typeof admin>,
  intake: { id: string },
  cpf: string,
  payload: Record<string, unknown>,
) {
  const existingResult = await db.from("patients")
    .select("id")
    .eq("organization_id", ORG)
    .eq("cpf", cpf)
    .maybeSingle();
  if (existingResult.error) throw Error("patient_lookup");

  let patientId = existingResult.data?.id;
  let status = patientId ? "linked" : "created";
  let actorId: string | null = null;

  if (!patientId) {
    // Patient and clinical-entry records require an accountable staff author.
    // The public request is anonymous, so use the clinic owner rather than
    // pretending that the visitor is an authenticated staff user.
    const owner = await db.from("memberships")
      .select("user_id")
      .eq("organization_id", ORG)
      .eq("role", "proprietario")
      .limit(1)
      .maybeSingle();
    if (owner.error || !owner.data?.user_id) throw Error("patient_author");
    actorId = owner.data.user_id;

    const phone = clean(payload.phone, 30).replace(/\D/g, "");
    const inserted = await db.from("patients").insert({
      organization_id: ORG,
      full_name: clean(payload.full_name, 200) || "Cadastro sem nome",
      preferred_name: clean(payload.preferred_name, 200),
      birth_date: dateValue(payload.birth_date),
      cpf,
      rg: [clean(payload.identity_document, 100), clean(payload.identity_issuer, 60), clean(payload.identity_letter, 30)].filter(Boolean).join(" · "),
      phone: phone.length >= 10 && phone.length <= 13 ? phone : "",
      email: clean(payload.email, 254).toLowerCase(),
      address: { raw: clean(payload.address, 2000), postal_code: clean(payload.postal_code, 20) },
      guardian: { raw: clean(payload.guardian_details, 2000) },
      status: "ativo",
      created_by: actorId,
    }).select("id").single();

    if (inserted.error?.code === "23505") {
      // A simultaneous submission with the same CPF won the race. Link to it
      // instead of creating a second patient or failing the completed form.
      const concurrent = await db.from("patients").select("id")
        .eq("organization_id", ORG).eq("cpf", cpf).maybeSingle();
      if (concurrent.error || !concurrent.data?.id) throw Error("patient_save");
      patientId = concurrent.data.id;
      status = "linked";
    } else if (inserted.error || !inserted.data?.id) {
      throw Error("patient_save");
    } else {
      patientId = inserted.data.id;
    }
  }

  const linked = await db.from("public_intakes").update({
    patient_id: patientId,
    status: "convertido",
    converted_by: actorId,
    converted_at: new Date().toISOString(),
    reviewed_by: actorId,
    reviewed_at: new Date().toISOString(),
  }).eq("id", intake.id).eq("organization_id", ORG);
  if (linked.error) throw Error("patient_link");

  // Keep a compact, immutable timeline marker. The complete, potentially
  // large form stays in the protected intake record and its file bucket.
  if (actorId) {
    const entry = await db.from("entries").insert({
      organization_id: ORG,
      patient_id: patientId,
      kind: "consentimento",
      title: `Formulário público ${clean(payload.form_version, 40)}`,
      content: "Formulário público recebido e associado automaticamente ao paciente.",
      data: { intake_id: intake.id, form_version: clean(payload.form_version, 40), language: clean(payload.language, 20) || "pt-BR" },
      status: "finalizado",
      created_by: actorId,
    });
    if (entry.error) console.error("FORMULARIO_PATIENT_ENTRY_FAILED", intake.id);
  }
  return { patientId, status };
}

function ext(name: string, type: string) {
  const original = name.toLowerCase().match(/\.([a-z0-9]{1,12})$/)?.[1];
  if (original) return original;
  const mime = type.split("/").pop()?.replace(/[^a-z0-9]/g, "");
  return mime?.slice(0, 12) || "bin";
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
  delete payload.email_already_sent;
  const approvals = ["initial_acknowledgement", "booking_fee_acknowledgement", "general_risk_acknowledgement", "truth_declaration", "lgpd_personal_data_consent", "lgpd_sensitive_data_consent", "final_acceptance"];
  if (approvals.some((key) => payload[key] !== "yes")) throw Error("consent_required");
  const selected = payload.selected_procedures;
  const allowed = ["harmony", "lightsheer", "toxina", "co2", "ultraformer", "radiofrequencia", "plasma", "mmp_capilar", "mmp_pele", "peim", "peeling_mecanico", "peeling_quimico", "peeling_ultrassonico", "peeling_cristal", "peeling_diamante", "enzimas", "limpeza_pele"];
  if (!Array.isArray(selected) || selected.some((key) => !allowed.includes(key) || payload[`accepted_term_${key}`] !== "yes")) throw Error("consent_required");
  for (const key of ["technical_image_authorisation", "promotional_communication"]) if (!["yes", "no"].includes(String(payload[key]))) throw Error("consent_required");
  if (!["non_identifiable", "partial_approval", "full_approval", "no"].includes(String(payload.marketing_image_authorisation))) throw Error("consent_required");
  if (clean(payload.birth_date, 20) && !dateValue(payload.birth_date)) throw Error("date");
  if (["cpf", "form_version", "full_name"].some((key) => !clean(payload[key], 300))) throw Error("required");
  if (!/^\d{11}$/.test(clean(payload.cpf, 30).replace(/\D/g, ""))) throw Error("cpf");
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
    selected_procedure: clean(payload.selected_procedure, 120),
    form_version: clean(payload.form_version, 40),
    language: clean(payload.language, 20) || "pt-BR",
    payload,
    status,
  };
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
    const field = clean(file.field_name, 80);
    const name = clean(file.name, 255);
    const size = Number(file.size);
    const type = clean(file.type, 120) || "application/octet-stream";
    if (!fields.has(field) || !name || !Number.isInteger(size) || size < 1 || size > MAX_FILE) throw Error("file");
    return { field, name, size, type, kind: field === "identity_upload" ? "identity" : field === "booking_payment_receipt" ? "payment" : field === "marketing_authorization_files" ? "marketing_authorization" : "attachment" };
  });
  const inserted = await db.from("public_intakes").insert(publicIntakeRow(payload as Record<string, unknown>, "aguardando")).select("id").single();
  if (inserted.error || !inserted.data?.id) throw Error("save");
  const intakeId = inserted.data.id as string;
  const files = [];
  try {
    for (const file of normalized) {
      const path = `${ORG}/${intakeId}/${crypto.randomUUID()}.${ext(file.name, file.type)}`;
      const signed = await db.storage.from("intake-private").createSignedUploadUrl(path, { upsert: false });
      if (signed.error || !signed.data?.signedUrl) throw Error("upload");
      files.push({ ...file, path, upload_url: signed.data.signedUrl });
    }
  } catch (error) {
    await db.from("public_intakes").delete().eq("id", intakeId);
    throw error;
  }
  const session = await signUploadSession({ intake_id: intakeId, files: files.map(({ upload_url: _url, ...file }) => file), expires_at: Date.now() + 2 * 60 * 60 * 1000 }, salt);
  return reply(req, { prepared: true, intake_id: intakeId, session, files }, 200);
}

async function completeSubmission(req: Request, body: Record<string, unknown>, db: ReturnType<typeof admin>, salt: string) {
  const session = await verifyUploadSession(body.session, salt);
  const intakeId = clean(session.intake_id, 80);
  const manifests = session.files;
  if (!intakeId || !Array.isArray(manifests) || manifests.length > MAX_FILES) throw Error("upload_session");
  const { data: intake, error: intakeError } = await db.from("public_intakes").select("id,payload,status").eq("id", intakeId).eq("organization_id", ORG).single();
  if (intakeError || !intake?.payload) throw Error("save");
  for (const item of manifests) {
    const file = item as Record<string, unknown>;
    const path = clean(file.path, 600);
    if (!path.startsWith(`${ORG}/${intakeId}/`)) throw Error("upload_session");
    const existing = await db.from("public_intake_files").select("id").eq("path", path).maybeSingle();
    if (existing.error) throw Error("file_record");
    if (existing.data) continue;
    const info = await db.storage.from("intake-private").info(path);
    if (info.error || Number(info.data?.size ?? info.data?.metadata?.size) !== Number(file.size)) throw Error("upload");
    const saved = await db.from("public_intake_files").insert({
      organization_id: ORG, intake_id: intakeId, kind: clean(file.kind, 40), path,
      mime_type: clean(file.type, 120) || "application/octet-stream", size_bytes: Number(file.size),
      original_name: clean(file.name, 255), field_name: clean(file.field, 80),
    });
    if (saved.error) throw Error("file_record");
  }
  const payload = intake.payload as Record<string, unknown>;
  let patientId: string | null = null;
  let patientStatus = "pending";
  try {
    const patient = await createOrLinkPatient(db, { id: intakeId }, clean(payload.cpf, 30).replace(/\D/g, ""), payload);
    patientStatus = patient.status;
    patientId = patient.patientId;
  } catch (error) {
    console.error("FORMULARIO_PATIENT_CONVERSION_FAILED", intakeId, error instanceof Error ? error.message : "unknown");
  }
  const notified = intake.status === "convertido" ? true : await notifySupport({
    nome: clean(payload.full_name, 200), email: clean(payload.email, 254), telefone: clean(payload.phone, 30),
    procedimentos: clean(payload.selected_procedure, 120), arquivos_anexados: manifests.length, id_interno: intakeId,
    mensagem: "Novo formulário salvo. Revise os dados completos no aplicativo autenticado.",
  });
  if (!notified) console.error("FORMULARIO_EMAIL_FAILED", intakeId);
  return reply(req, { received: true, intake_id: intakeId, patient_id: patientId, patient_status: patientStatus, attachments: manifests.length, email_status: notified ? "sent" : "error" }, 202);
}

Deno.serve(endpoint(async (req) => {
  const salt = Deno.env.get("RATE_LIMIT_SALT");
  if (!salt) throw Error("unconfigured");
  const db = admin();
  if (req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    const body = JSON.parse(new TextDecoder().decode(await bounded(req, 600000))) as Record<string, unknown>;
    if (body.action === "prepare") {
      const ip = (req.headers.get("x-forwarded-for") || "nao_confirmado").split(",")[0].trim();
      await limit(db, "formulario:ip:" + await sha256(new TextEncoder().encode(salt + ip)), 20, 3600);
      return await prepareSubmission(req, body, db, salt);
    }
    if (body.action === "complete") return await completeSubmission(req, body, db, salt);
    throw Error("request_failed");
  }
  const form = await req.formData();
  const ip = (req.headers.get("x-forwarded-for") || "nao_confirmado").split(",")[0].trim();
  await limit(db, "formulario:ip:" + await sha256(new TextEncoder().encode(salt + ip)), 20, 3600);
  const attachmentFields = form.getAll("attachment_field").map((field) => clean(field, 80));
  const attachments = form.getAll("attachments").filter((file): file is File => file instanceof File && file.size > 0);
  // Accept one older browser bundle during rollout without weakening limits.
  for (const name of ["identity_upload", "booking_payment_receipt"] as const) {
    const legacy = form.get(name);
    if (legacy instanceof File && legacy.size > 0 && !attachments.includes(legacy)) {
      attachments.push(legacy);
      attachmentFields.push(name);
    }
  }
  if (attachments.length > MAX_FILES || attachments.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_FILE_SIZE) throw Error("file");
  for (const file of attachments) if (file.size > MAX_FILE) throw Error("file");
  if (attachmentFields.length !== attachments.length) throw Error("file");
  const rawPayload = clean(form.get("payload"), 500000);
  const payload = JSON.parse(rawPayload) as Record<string, unknown>;
  validatePayload(payload);
  const cpf = clean(payload.cpf, 30).replace(/\D/g, "");
  const { data: intake, error } = await db.from("public_intakes").insert(publicIntakeRow(payload)).select("id").single();
  if (error || !intake) throw Error("save");
  const uploaded: string[] = [];
  try {
    for (const [index, file] of attachments.entries()) {
      const field = attachmentFields[index] || "attachment";
      const kind = field === "identity_upload" ? "identity" : field === "booking_payment_receipt" ? "payment" : field === "marketing_authorization_files" ? "marketing_authorization" : "attachment";
      const path = `${ORG}/${intake.id}/${crypto.randomUUID()}.${ext(file.name, file.type)}`;
      const result = await db.storage.from("intake-private").upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (result.error) throw Error("upload");
      uploaded.push(path);
      const saved = await db.from("public_intake_files").insert({ organization_id: ORG, intake_id: intake.id, kind, path, mime_type: file.type || "application/octet-stream", size_bytes: file.size, original_name: clean(file.name, 255), field_name: field });
      if (saved.error) throw Error("file_record");
    }
  } catch (error) {
    await Promise.all(uploaded.map((path) => db.storage.from("intake-private").remove([path])));
    await db.from("public_intakes").delete().eq("id", intake.id);
    throw error;
  }
  // The form first becomes a protected application record, then creates (or
  // links) the patient. A conversion problem must never discard the completed
  // intake: staff can still see and resolve it in the Forms queue.
  let patientStatus = "pending";
  let patientId: string | null = null;
  try {
    const patient = await createOrLinkPatient(db, intake, cpf, payload);
    patientStatus = patient.status;
    patientId = patient.patientId;
  } catch (error) {
    console.error("FORMULARIO_PATIENT_CONVERSION_FAILED", intake.id,
      error instanceof Error ? error.message : "unknown");
  }
  // Keep the saved intake even if the email relay is unavailable. The browser
  // can retry email delivery without creating another intake.
  const notified = await notifySupport({
    nome: clean(payload.full_name, 200),
    email: clean(payload.email, 254),
    telefone: clean(payload.phone, 30),
    procedimentos: clean(payload.selected_procedure, 120),
    arquivos_anexados: attachments.length,
    id_interno: intake.id,
    mensagem: "Novo formulário salvo. Revise os dados completos no aplicativo autenticado.",
  });
  const emailStatus = notified ? "sent" : "error";
  if (!notified) console.error("FORMULARIO_EMAIL_FAILED", intake.id);

  return reply(req, {
    received: true,
    intake_id: intake.id,
    patient_id: patientId,
    patient_status: patientStatus,
    attachments: attachments.length,
    email_status: emailStatus,
  }, 202);
}));
