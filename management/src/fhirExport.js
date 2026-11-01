import { readPatientRows } from "./patientWorkspace.js";
import { intakeDocumentName } from "./intakePresentation.js";
// FHIR R4 (4.0.1). Free-text declarations remain QuestionnaireResponse answers,
// never inferred diagnoses, medication orders or professionally verified facts.
export function buildPatientFHIR(patient, tables, labels = {}) {
  const subject = { reference: `Patient/${patient.id}` };
  const resources = [{ resourceType: 'Patient', id: patient.id,
    identifier: [{system:'urn:oid:2.16.76.1.3.1',value:patient.cpf},{system:'https://app.francielesofiati.com/identifiers/rg',value:patient.rg},{system:'https://app.francielesofiati.com/identifiers/cns',value:patient.cns}].filter(x=>x.value),
    name:[{use:'official',text:patient.full_name}, ...(patient.preferred_name ? [{use:'usual',text:patient.preferred_name}] : [])],
    telecom:[{system:'phone',value:patient.phone},{system:'email',value:patient.email}].filter(x=>x.value),
    ...(patient.birth_date ? {birthDate:patient.birth_date}:{}),
    ...(patient.address?.raw ? {address:[{text:patient.address.raw,...(patient.address.postal_code?{postalCode:patient.address.postal_code}:{})}]}:{}) }];
  for (const a of tables.appointments || []) resources.push({resourceType:'Appointment',id:a.id,status:!a.starts_at || !a.ends_at?'proposed':({concluido:'fulfilled',cancelado:'cancelled',faltou:'noshow'})[a.status] || 'booked',...(a.starts_at && a.ends_at?{start:a.starts_at,end:a.ends_at}:{}),description:a.label || 'Atendimento',participant:[{actor:subject,status:'needs-action'}]});
  for (const p of tables.clinical_procedures || []) resources.push({resourceType:'Procedure',id:p.id,status:({finalizado:'completed',cancelado:'not-done',em_andamento:'in-progress'})[p.status] || 'preparation',subject,...(p.performed_at?{performedDateTime:p.performed_at}:{}),...(p.area?{bodySite:[{text:p.area}]}:{})});
  const items = (payload) => Object.entries(payload || {}).map(([key,value])=>({linkId:key,text:labels[key] || key,answer:(Array.isArray(value)?value:[value]).filter(x=>x!=null && x!=='').map(x=>typeof x==='boolean'?{valueBoolean:x}:typeof x==='number'?{valueDecimal:x}:{valueString:typeof x==='object'?JSON.stringify(x):String(x)})})).filter(x=>x.answer.length);
  for (const i of tables.public_intakes || []) resources.push({resourceType:'QuestionnaireResponse',id:i.id,status:'completed',subject,source:subject,authored:i.submitted_at,item:items(i.payload)});
  for (const intake of tables.public_intakes || []) {
    const decisions = Object.entries(intake.payload || {}).filter(([key]) => key.startsWith('accepted_term_') || key.includes('consent') || ['technical_image_authorisation','marketing_image_authorisation','promotional_communication','booking_fee_acknowledgement'].includes(key));
    decisions.forEach(([key,value],index) => resources.push({resourceType:'Consent',id:`${intake.id}-c${index}`,status:value==='no'?'rejected':'active',scope:{text:key.startsWith('accepted_term_')?'Consentimento para tratamento':'Privacidade e autorização'},category:[{text:labels[key] || key}],patient:subject,...(intake.submitted_at?{dateTime:intake.submitted_at}:{}),sourceReference:{reference:`QuestionnaireResponse/${intake.id}`},policyRule:{text:`Formulário ${intake.form_version || ''}; decisão original: ${value}`}}));
    if (intake.submitted_at) resources.push({resourceType:'Provenance',id:`${intake.id}-origin`,target:[{reference:`QuestionnaireResponse/${intake.id}`}],recorded:intake.submitted_at,agent:[{who:subject}],activity:{text:'Declaração enviada pelo paciente no formulário público'}});
  }
  for (const record of tables.entries || []) {
    const bytes = new TextEncoder().encode([record.title,record.content,JSON.stringify(record.data || {})].filter(Boolean).join('\n\n'));
    let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
    resources.push({resourceType:'DocumentReference',id:record.id,status:'current',subject,...(record.clinical_at || record.created_at ? {date:record.clinical_at || record.created_at}:{}),description:record.title || 'Registro clínico',content:[{attachment:{contentType:'text/plain; charset=utf-8',title:record.title || 'Registro clínico',data:btoa(binary)}}]});
  }
  for (const h of tables.patient_health_history || []) resources.push({resourceType:'QuestionnaireResponse',id:h.id,status:'completed',subject,authored:h.created_at,item:items(Object.fromEntries(Object.entries(h).filter(([k])=>!['id','patient_id','organization_id','created_at','created_by'].includes(k))))});
  for (const c of tables.consents || []) resources.push({resourceType:'Consent',id:c.id,status:({aceito:'active',recusado:'rejected',revogado:'inactive',pendente:'proposed'})[c.status] || 'draft',scope:{text:c.kind === 'procedimento' ? 'Consentimento para tratamento' : 'Privacidade e autorização'},category:[{text:labels[c.kind] || c.kind}],patient:subject,dateTime:c.accepted_at || c.created_at,policyRule:{text:`Versão ${c.template_version}`}});
  for (const plan of tables.treatment_plans || []) resources.push({resourceType:'CarePlan',id:plan.id,status:({planejado:'draft',em_andamento:'active',concluido:'completed',suspenso:'on-hold',cancelado:'revoked'})[plan.status] || 'unknown',intent:'plan',subject,title:plan.title || 'Plano de tratamento',...(plan.objectives?{description:plan.objectives}:{}),...(plan.created_at?{created:plan.created_at}:{})});
  for (const d of [...(tables.documents || []),...(tables.public_intake_files || []),...(tables.clinical_photos || [])]) resources.push({resourceType:'DocumentReference',id:d.id,status:'current',subject,...(d.created_at?{date:d.created_at}:{}),description:d.name || d.original_name || d.field_name || 'Documento',content:[{attachment:{contentType:d.mime_type || 'application/octet-stream',title:d.name || d.original_name || 'Documento',...(d.size_bytes?{size:d.size_bytes}:{})}}]});
  const unique = new Map(resources.map(r=>[`${r.resourceType}/${r.id}`,r]));
  return {resourceType:'Bundle',type:'collection',timestamp:new Date().toISOString(),entry:[...unique.entries()].map(([reference,resource])=>({fullUrl:`https://app.francielesofiati.com/fhir/${reference}`,resource}))};
}

export async function loadPatientFHIR(db, patientId, labels = {}) {
  const checked = async (request) => { const {data,error} = await request; if (error) throw error; return data; };
  const p = await checked(db.from("patients").select("*").eq("id", patientId).single());
  const tables = {};
  for (const table of ["appointments", "clinical_procedures", "entries", "entry_versions", "patient_health_history", "consents", "consent_versions", "documents", "clinical_photos", "clinical_photo_versions", "document_links", "admin_notes", "tasks", "follow_ups", "adverse_events", "treatment_plans", "master_intakes", "privacy_requests", "public_intakes"]) {
    tables[table] = await readPatientRows((from, to) => checked(db.from(table).select("*").eq("patient_id", patientId).order("id").range(from, to)));
  }
  tables.master_intake_versions = await readPatientRows((from, to) => checked(db.from("master_intake_versions").select("*,master_intakes!inner(patient_id)").eq("master_intakes.patient_id", patientId).order("id").range(from, to)));
  tables.product_usages = await readPatientRows((from, to) => checked(db.from("product_usages").select("*,clinical_procedures!inner(patient_id)").eq("clinical_procedures.patient_id", patientId).order("id").range(from, to)));
  tables.treatment_plan_items = await readPatientRows((from, to) => checked(db.from("treatment_plan_items").select("*,treatment_plans!inner(patient_id)").eq("treatment_plans.patient_id", patientId).order("id").range(from, to)));
  tables.public_intake_files = await readPatientRows((from, to) => checked(db.from("public_intake_files").select("*,public_intakes!inner(patient_id)").eq("public_intakes.patient_id", patientId).order("id").range(from, to)));
  tables.public_intake_files = tables.public_intake_files.map(file => ({...file, name:intakeDocumentName(file, p)}));
  return {patient:p,tables,bundle:buildPatientFHIR(p,tables,labels)};
}
