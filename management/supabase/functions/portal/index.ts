import { admin, ORG, endpoint, json, reply, clean, limit, sha256 } from "../_shared/core.ts";

const ITERATIONS = 240000;
const encoder = new TextEncoder();
const b64 = (bytes: Uint8Array) => {
  let value = "";
  for (let i = 0; i < bytes.length; i += 8192) value += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64 = (value: string) => Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4)), (c) => c.charCodeAt(0));
const random = (size = 32) => { const bytes = crypto.getRandomValues(new Uint8Array(size)); return b64(bytes); };
const equal = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.reduce((ok, value, index) => ok & (value ^ b[index]) === 0 ? 1 : 0, 1) === 1;
const cpfDigits = (value: unknown) => clean(value, 30).replace(/\D/g, "");
async function passwordHash(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, material, 256));
}
async function cpfHash(cpf: string) { return sha256(encoder.encode(`${Deno.env.get("RATE_LIMIT_SALT") || "portal"}:${cpf}`)); }
async function session(req: Request) {
  const token = clean(req.headers.get("x-portal-token"), 256);
  if (!token) throw Error("auth");
  const db = admin(), hash = await sha256(encoder.encode(token));
  const { data } = await db.from("patient_portal_sessions").select("*,patient_portal_accounts(*,patients(id,full_name,preferred_name,email,phone))").eq("token_hash", hash).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!data?.patient_portal_accounts || data.patient_portal_accounts.status !== "ativo") throw Error("auth");
  await db.from("patient_portal_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);
  return { db, row: data, account: data.patient_portal_accounts, patient: data.patient_portal_accounts.patients };
}
async function resources(db: ReturnType<typeof admin>, patientId: string) {
  const { data: shares } = await db.from("patient_portal_shares").select("*").eq("organization_id", ORG).eq("patient_id", patientId).eq("status", "shared").order("shared_at", { ascending: false });
  const output: Record<string, unknown>[] = [];
  const { data: appointments } = await db.from("appointments").select("id,starts_at,ends_at,status,label,procedure_id").eq("organization_id", ORG).eq("patient_id", patientId).gte("starts_at", new Date().toISOString()).order("starts_at").limit(20);
  for (const appointment of appointments || []) output.push({ type: "appointment", ...appointment });
  const { data: plans } = await db.from("treatment_plans").select("id,title,objectives,areas,status,expected_followup,treatment_plan_items(id,sequence_no,sessions,area,notes,procedures(name))").eq("organization_id", ORG).eq("patient_id", patientId).in("status", ["planejado", "em_andamento"]).order("created_at", { ascending: false });
  for (const plan of plans || []) output.push({ type: "treatment_plan", ...plan });
  for (const share of shares || []) {
    if (!share.resource_id && share.resource_type !== "post_care") continue;
    if (share.resource_type === "document") {
      const { data } = await db.from("documents").select("id,name,category,description,document_date,path,mime_type").eq("id", share.resource_id).eq("patient_id", patientId).eq("status", "pronto").maybeSingle();
      if (data) { const signed = await db.storage.from("patient-files").createSignedUrl(data.path, 300); output.push({ type: share.resource_type, id: data.id, name: data.name, category: data.category, description: data.description, document_date: data.document_date, url: signed.data?.signedUrl || null }); }
    } else if (share.resource_type === "photo") {
      const { data } = await db.from("clinical_photos").select("id,category,area,description,created_at,path").eq("id", share.resource_id).eq("patient_id", patientId).maybeSingle();
      if (data) { const signed = await db.storage.from("clinical-photos").createSignedUrl(data.path, 300); output.push({ type: share.resource_type, id: data.id, category: data.category, area: data.area, description: data.description, created_at: data.created_at, url: signed.data?.signedUrl || null }); }
    } else if (share.resource_type === "consent") {
      const { data } = await db.from("consents").select("id,kind,template_version,language,status,method,accepted_at,document_id").eq("id", share.resource_id).eq("patient_id", patientId).maybeSingle();
      if (data) output.push({ type: share.resource_type, ...data });
    } else if (share.resource_type === "appointment") {
      const { data } = await db.from("appointments").select("id,starts_at,ends_at,status,label").eq("id", share.resource_id).eq("patient_id", patientId).maybeSingle();
      if (data) output.push({ type: share.resource_type, ...data });
    } else if (share.resource_type === "post_care") {
      const { data } = await db.from("clinical_procedures").select("id,post_care,performed_at,area").eq("id", share.resource_id).eq("patient_id", patientId).maybeSingle();
      if (data?.post_care) output.push({ type: share.resource_type, ...data });
    }
  }
  return output;
}

Deno.serve(endpoint(async (req) => {
  const body = await json(req, 12000), action = clean(body.action, 30), db = admin();
  if (action === "login") {
    const cpf = cpfDigits(body.cpf), password = clean(body.password, 200);
    if (cpf.length !== 11 || password.length < 1) throw Error("credentials");
    const cpfKey = await cpfHash(cpf);
    await limit(db, `portal:cpf:${cpfKey}`, 8, 900);
    const { data: account } = await db.from("patient_portal_accounts").select("*,patients(id,full_name,preferred_name,email,phone)").eq("organization_id", ORG).eq("cpf_hash", cpfKey).maybeSingle();
    const salt = account?.password_salt ? fromB64(account.password_salt) : crypto.getRandomValues(new Uint8Array(16));
    const candidate = await passwordHash(password, salt);
    const valid = !!account && account.status === "ativo" && (!account.locked_until || new Date(account.locked_until) < new Date()) && equal(candidate, fromB64(account.password_hash));
    if (!valid) { if (account) await db.from("patient_portal_accounts").update({ failed_attempts: Math.min(10, account.failed_attempts + 1), locked_until: account.failed_attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null }).eq("id", account.id); throw Error("credentials"); }
    const raw = random(32), tokenHash = await sha256(encoder.encode(raw)), expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await db.from("patient_portal_sessions").insert({ organization_id: ORG, account_id: account.id, token_hash: tokenHash, expires_at: expires });
    await db.from("patient_portal_accounts").update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() }).eq("id", account.id);
    return reply(req, { token: raw, expires_at: expires, must_change_password: account.must_change_password, patient: account.patients, resources: await resources(db, account.patient_id) });
  }
  const current = await session(req);
  if (action === "logout") { await db.from("patient_portal_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", current.row.id); return reply(req, { ok: true }); }
  if (action === "change_password") {
    const password = clean(body.password, 200); if (password.length < 12) throw Error("password");
    const salt = crypto.getRandomValues(new Uint8Array(16)); const hash = await passwordHash(password, salt);
    await db.from("patient_portal_accounts").update({ password_salt: b64(salt), password_hash: b64(hash), must_change_password: false, failed_attempts: 0, updated_at: new Date().toISOString() }).eq("id", current.account.id);
    return reply(req, { ok: true });
  }
  if (action === "portal_action") {
    const actionType = clean(body.action_type, 40);
    if (!["confirmar_agendamento", "solicitar_reagendamento", "cancelar_agendamento", "solicitar_retorno", "reportar_sintoma"].includes(actionType)) throw Error("action_type");
    const appointmentId = clean(body.appointment_id, 80) || null;
    const procedureId = clean(body.clinical_procedure_id, 80) || null;
    if (appointmentId) {
      const { data } = await db.from("appointments").select("id").eq("organization_id", ORG).eq("patient_id", current.patient.id).eq("id", appointmentId).maybeSingle();
      if (!data) throw Error("appointment");
    }
    if (procedureId) {
      const { data } = await db.from("clinical_procedures").select("id").eq("organization_id", ORG).eq("patient_id", current.patient.id).eq("id", procedureId).maybeSingle();
      if (!data) throw Error("procedure");
    }
    const { error } = await db.from("patient_portal_actions").insert({ organization_id: ORG, patient_id: current.patient.id, action_type: actionType, appointment_id: appointmentId, clinical_procedure_id: procedureId, notes: clean(body.notes, 3000) });
    if (error) throw error;
    return reply(req, { ok: true });
  }
  if (action === "refresh") return reply(req, { patient: current.patient, resources: await resources(db, current.patient.id), must_change_password: current.account.must_change_password });
  throw Error("action");
}));
