import { admin, ORG, endpoint, reply, clean, sha256, limit } from "../_shared/core.ts";

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

Deno.serve(endpoint(async (req) => {
  const form = await req.formData();
  const salt = Deno.env.get("RATE_LIMIT_SALT");
  if (!salt) throw Error("unconfigured");

  const ip = (req.headers.get("x-forwarded-for") || "nao_confirmado").split(",")[0].trim();
  await limit(admin(), "formulario:ip:" + await sha256(new TextEncoder().encode(salt + ip)), 20, 3600);
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
  const payload = JSON.parse(rawPayload);
  delete payload.email_already_sent;
  const required = ["cpf", "form_version", "full_name", "email", "birth_date"];
  const approvals = ["initial_acknowledgement", "booking_fee_acknowledgement", "general_risk_acknowledgement", "truth_declaration", "lgpd_personal_data_consent", "lgpd_sensitive_data_consent", "final_acceptance"];
  if (approvals.some((key) => payload[key] !== "yes")) throw Error("consent_required");
  const selected = payload.selected_procedures;
  const allowed = ["harmony", "lightsheer", "toxina", "co2", "ultraformer", "radiofrequencia", "plasma", "mmp_capilar", "mmp_pele", "peim", "peeling_mecanico", "peeling_quimico", "peeling_ultrassonico", "peeling_cristal", "peeling_diamante", "enzimas", "limpeza_pele"];
  if (!Array.isArray(selected) || !selected.length || selected.some((key) => !allowed.includes(key) || payload[`accepted_term_${key}`] !== "yes")) throw Error("consent_required");
  for (const key of ["technical_image_authorisation", "promotional_communication"]) {
    if (!["yes", "no"].includes(payload[key])) throw Error("consent_required");
  }
  if (!["non_identifiable", "partial_approval", "full_approval", "no"].includes(payload.marketing_image_authorisation)) throw Error("consent_required");
  if (!dateValue(payload.birth_date)) throw Error("date");
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
  let emailStatus = "not_sent";
  try {
    const notification = "suportesofiati@gmail.com";
    const message = new FormData();
    message.set("_subject", "Novo formulário recebido - Franciele Sofiati");
    message.set("_template", "table");
    message.set("_cc", Deno.env.get("SUPPORT_SECONDARY_EMAIL") || "sofiatimendonca@gmail.com");
    for (const [key, value] of Object.entries(payload)) {
      if (key.startsWith("_") || ["token", "cf-turnstile-response", "website"].includes(key)) continue;
      message.set(key, Array.isArray(value) ? value.join(", ") : String(value ?? ""));
    }
    message.set("resumo_envio", [
      "Novo pré-cadastro recebido no sistema.",
      `Nome: ${clean(payload.full_name, 200) || "Não informado"}`,
      `Email: ${clean(payload.email, 254) || "Não informado"}`,
      `Telefone: ${clean(payload.phone, 30) || "Não informado"}`,
      `Procedimentos: ${clean(payload.selected_procedure, 120) || "Não informado"}`,
      `Arquivos anexados: ${attachments.length}`,
      `ID interno: ${intake.id}`,
      "Abra o aplicativo de gestão para revisar os dados completos com autenticação.",
    ].join("\n"));
    const emailResponse = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(notification)}`,
      {
        method: "POST",
        body: message,
        headers: {
          Accept: "application/json",
          Origin: "https://francielesofiati.com",
          Referer: "https://francielesofiati.com/formulario",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0 (Sofiati public intake)",
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    const emailBody = await emailResponse.text();
    let emailResult: { success?: boolean | string } | null = null;
    try {
      emailResult = JSON.parse(emailBody);
    } catch {
      // Treat a non-JSON response as a failed notification even when the
      // provider incorrectly returns HTTP 200.
    }

    if (!emailResponse.ok || (emailResult?.success !== true && emailResult?.success !== "true")) {
      emailStatus = "error";
      console.error(
        "FORMULARIO_EMAIL_FAILED",
        emailResponse.status,
        emailBody.slice(0, 500),
      );
    } else {
      emailStatus = "sent";
      console.log(
        "FORMULARIO_EMAIL_SENT",
        intake.id,
        emailResponse.status,
      );
    }
  } catch (error) {
    emailStatus = "error";
    console.error(
      "FORMULARIO_EMAIL_EXCEPTION",
      error instanceof Error ? error.message : "unknown",
    );
  }

  return reply(req, {
    received: true,
    intake_id: intake.id,
    patient_id: patientId,
    patient_status: patientStatus,
    attachments: attachments.length,
    email_status: emailStatus,
  }, 202);
}));
