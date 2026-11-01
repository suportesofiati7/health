import test from 'node:test';
import assert from 'node:assert/strict';
import { intakeDocumentName, intakeAnswer } from '../src/intakePresentation.js';
import { buildPatientFHIR } from '../src/fhirExport.js';
test('document classification uses upload field, preserves extension and avoids guessing',()=>{
 assert.equal(intakeDocumentName({field_name:'booking_payment_receipt',original_name:'identity.PDF'}, {full_name:'Paciente fictícia'},'2026-10-30T15:00:00Z'),'Comprovante de pagamento - Paciente fictícia - 30-10-2026.PDF');
 assert.equal(intakeDocumentName({original_name:'desconhecido.jpg'}, {}),'desconhecido.jpg');
 assert.equal(intakeAnswer('non_identifiable'),'Autorização para imagens sem identificação');
});
test('FHIR links appointments/procedures and retains every original answer without inferring diagnoses',()=>{
 const p={id:'patient-1',full_name:'Teste',cpf:'00000000000',address:{raw:'Endereço fictício'}};
 const bundle=buildPatientFHIR(p,{appointments:[{id:'appt-1',status:'agendado',starts_at:'2026-11-01T12:00:00Z',ends_at:'2026-11-01T13:00:00Z'}],clinical_procedures:[{id:'proc-1'}],public_intakes:[{id:'intake-1',submitted_at:'2026-11-01T12:00:00Z',payload:{health_notes:'Relato não verificado',selected_procedures:['a','b'],consent:'yes',nested:{signature:'evidência'}}}]});
 const resources=bundle.entry.map(x=>x.resource);
 assert.equal(resources.find(x=>x.resourceType==='Appointment').participant[0].actor.reference,'Patient/patient-1');
 assert.equal(resources.find(x=>x.resourceType==='Procedure').subject.reference,'Patient/patient-1');
 assert.equal(resources.find(x=>x.resourceType==='QuestionnaireResponse').item.length,4);
 assert.equal(resources.find(x=>x.resourceType==='QuestionnaireResponse').item[1].answer.length,2);
 assert.equal(resources.some(x=>x.resourceType==='Condition'),false);
 assert.equal(new Set(bundle.entry.map(x=>x.fullUrl)).size,bundle.entry.length);
});

test('clinical defaults preserve free-text declarations without manufacturing allergies or diagnoses',async()=>{
 const {intakeDefaults}=await import('../src/intakeDefaults.js');
 const defaults=intakeDefaults({full_name:'Cadastro existente'},{full_name:'Nome enviado',health_notes:'Texto livre fictício',selected_procedures:['toxina'],lgpd_personal_data_consent:'yes'});
 assert.equal(defaults.identity.full_name,'Cadastro existente');assert.equal(defaults.health.allergies,'');assert.equal(defaults.health.conditions,'');assert.equal(defaults.health.other_notes,'Texto livre fictício');assert.equal(defaults.consents.privacy,'Sim');assert.equal(defaults.visit.selected_procedure,'Toxina botulínica');
});
