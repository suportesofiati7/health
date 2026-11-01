import {intakeAnswer} from './intakePresentation.js';
// A free-text health declaration is not an allergy or a diagnosis.
export function intakeDefaults(patient, source = {}, clinical = true) {
 return {
  identity:{full_name:patient.full_name || source.full_name || '',preferred_name:patient.preferred_name || source.preferred_name || '',birth_date:patient.birth_date || source.birth_date || '',cpf:patient.cpf || source.cpf || '',rg:patient.rg || source.identity_document || ''},
  contact:{phone:patient.phone || source.phone || '',email:patient.email || source.email || '',address:Object.values(patient.address || {}).join(' · ') || source.address || '',emergency_contact:Object.values(patient.emergency_contact || {}).join(' · ') || source.emergency_contact || source.guardian_details || ''},
  visit:{selected_procedure:source.selected_procedure || intakeAnswer(source.selected_procedures || ''),occupation:patient.occupation || '',insurance:patient.insurance || '',internal_notes:''},
  ...(clinical?{health:{allergies:source.allergies || '',medications:source.medications || '',conditions:source.conditions || '',pregnancy_breastfeeding:source.pregnancy_breastfeeding || '',other_notes:[source.health_notes,source.other_health_notes].filter(Boolean).join('\n')},clinical:{concern:source.treatment_área || source.treatment_area || ''},consents:{privacy:intakeAnswer(source.lgpd_personal_data_consent),clinical_photo:intakeAnswer(source.technical_image_authorisation),communication:intakeAnswer(source.promotional_communication)}}:{})
 };
}
