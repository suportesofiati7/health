// Uses the isolated local Supabase stack only. All values and uploads are fictional.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {loadPatientFHIR} from '../src/fhirExport.js';
import {createClient} from '@supabase/supabase-js';
const status=JSON.parse(await readFile('/tmp/sofiati-workflow-audit/status.json','utf8'));
assert.equal(new URL(status.API_URL).origin,'http://127.0.0.1:55421');
const db=createClient(status.API_URL,status.SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const ok=({data,error})=>{if(error)throw error;return data;};
const org='a783bd4c-f253-4a94-9365-75c6f1000001';
const email=`intake-local-${Date.now()}@example.invalid`,password='Fictional intake password 2026!';
const {user}=ok(await db.auth.admin.createUser({email,password,email_confirm:true}));
ok(await db.from('memberships').insert({organization_id:org,user_id:user.id,name:'QA LOCAL formulário',role:'proprietario',status:'ativo',email:user.email}));
const staff=createClient(status.API_URL,status.ANON_KEY,{auth:{persistSession:false}});ok(await staff.auth.signInWithPassword({email,password}));
let digits=String(Date.now()).slice(-9).split('').map(Number);
for(let n=9;n<=10;n++){const sum=digits.reduce((s,d,i)=>s+d*(n+1-i),0);const r=11-sum%11;digits.push(r>=10?0:r);}
const cpf=digits.join('');
const labels=JSON.parse(await readFile(new URL('../src/public-intake-labels.json',import.meta.url),'utf8'));
const payload=Object.fromEntries(Object.keys(labels).filter(k=>!['identity_upload','booking_payment_receipt','supporting_attachments','marketing_authorization_files'].includes(k)).map(k=>[k,'Informação fictícia de teste']));
Object.assign(payload,{cpf,full_name:'QA LOCAL Integração do formulário',preferred_name:'QA LOCAL',email:'qa-intake@example.invalid',phone:'43999990000',birth_date:'1990-05-12',appointment_date:'2026-12-01',appointment_time:'10:00',form_version:'QA-2026-11-01',language:'pt-BR',health_notes:'Declaração fictícia; sem avaliação profissional',selected_procedures:['toxina'],selected_procedure:'Toxina botulínica',technical_image_authorisation:'yes',marketing_image_authorisation:'non_identifiable',promotional_communication:'no',adult_status:'adult',signature_method:'typed_name',signature_name:'QA LOCAL fictício',consent_texts:{toxina:'Termo inteiramente fictício'}});
for(const k of Object.keys(payload))if(k.includes('acknowledgement')||k.startsWith('accepted_term_')||k.includes('consent')||['truth_declaration','final_acceptance'].includes(k))payload[k]='yes';
const post=async(body)=>{const r=await fetch(`${status.API_URL}/functions/v1/formulario`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:5177'},body:JSON.stringify(body)});const data=await r.json();assert.equal(r.ok,true,JSON.stringify(data));return data;};
const bytes=Buffer.from('%PDF-1.4\n% Documento inteiramente fictício\n%%EOF');
const fields=['identity_upload','booking_payment_receipt','marketing_authorization_files','supporting_attachments'];
const requestId=crypto.randomUUID();
const prepared=await post({action:'prepare',request_id:requestId,payload,attachments:fields.map(field_name=>({field_name,name:'ficticio.pdf',size:bytes.length,type:'application/pdf'}))});
for(const file of prepared.files){const r=await fetch(file.upload_url.replace(/^https?:\/\/kong(?::8000)?/,status.API_URL),{method:'PUT',headers:{'Content-Type':'application/pdf'},body:bytes});assert.equal(r.ok,true,await r.text());}
const completed=await post({action:'complete',session:prepared.session});assert.deepEqual(completed,{received:true,attachments:4});
const saved=ok(await db.from('public_intakes').select('*').eq('request_id',requestId).single());assert.equal(saved.patient_id,null);assert.equal(saved.reviewed_at,null);
completed.intake_id=saved.id;completed.patient_id=ok(await staff.rpc('convert_public_intake',{enquiry:saved.id}));
const retry=await post({action:'complete',session:prepared.session});assert.equal(retry.received,true);assert.equal(Object.hasOwn(retry,'patient_id'),false);
const stored=ok(await db.from('public_intakes').select('*').eq('id',completed.intake_id).single());assert.deepEqual(stored.payload,payload);
const files=ok(await db.from('public_intake_files').select('*').eq('intake_id',completed.intake_id));assert.equal(files.length,4);assert.deepEqual(files.map(f=>f.field_name).sort(),fields.sort());
for(const file of files){assert.equal(ok(await db.storage.from('intake-private').download(file.path)).size,bytes.length);}
assert.equal(ok(await db.from('intake_notification_outbox').select('*').eq('intake_id',completed.intake_id)).length,1);
const secondId=crypto.randomUUID();const second=await post({action:'prepare',request_id:secondId,payload:{...payload,health_notes:'Segunda declaração fictícia'},attachments:[]});await post({action:'complete',session:second.session});
const secondRow=ok(await db.from('public_intakes').select('id').eq('request_id',secondId).single());
assert.equal((await staff.rpc('convert_public_intake',{enquiry:secondRow.id})).error?.message,'patient_exists');
assert.equal(ok(await staff.rpc('convert_public_intake',{enquiry:secondRow.id,existing_patient:completed.patient_id})),completed.patient_id);
assert.deepEqual(ok(await db.from('public_intakes').select('payload').eq('id',completed.intake_id).single()).payload,payload);
assert.equal(ok(await db.from('patients').select('id').eq('cpf',cpf)).length,1);
const anon=createClient(status.API_URL,status.ANON_KEY,{auth:{persistSession:false}});
assert.equal((await anon.storage.from('intake-private').download(files[0].path)).error!=null,true);
const hidden=await anon.from('public_intakes').select('id').eq('id',completed.intake_id);assert(hidden.error || hidden.data.length===0);
console.log(`PASS: ${Object.keys(payload).length} submitted answers round-trip; four private upload classifications; retry queues once; repeat CPF links one patient; originals preserved; anonymous reads denied. Local fictional fixtures retained for inspection.`);

const exported = await loadPatientFHIR(db, completed.patient_id, labels);
assert.equal(exported.tables.public_intakes.length,2);
assert.equal(exported.tables.public_intake_files.length,4);
assert.deepEqual(exported.tables.public_intakes.find(row=>row.id===completed.intake_id).payload,payload);
assert.equal(new Set(exported.bundle.entry.map(entry=>entry.fullUrl)).size,exported.bundle.entry.length);
await writeFile('/tmp/sofiati-fhir-local.json',JSON.stringify(exported.bundle,null,2));
console.log('PASS: application FHIR loader exports all local submission histories, private-document metadata, consent decisions and clinical markers without duplicated resources.');

await staff.auth.signOut();ok(await db.from('memberships').update({status:'inativo'}).eq('user_id',user.id));
