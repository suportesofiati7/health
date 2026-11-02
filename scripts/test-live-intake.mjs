// Real browser/Auth/Edge/Postgres/Storage journey. Fictional records are retained.
// No request interception, owner impersonation, record deletion or security changes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '../management/node_modules/@supabase/supabase-js/dist/index.mjs';
import { chromium } from 'playwright-core';
const local=Boolean(process.env.SOFIATI_LOCAL_STATUS);
const ref='naypgbhwnlbyqqqfftgn',org='a783bd4c-f253-4a94-9365-75c6f1000001';
let api,adminKey,anonKey;
if(local){const status=JSON.parse(await readFile(process.env.SOFIATI_LOCAL_STATUS,'utf8'));assert.equal(status.API_URL,'http://127.0.0.1:55421');api=status.API_URL;adminKey=status.SERVICE_ROLE_KEY;anonKey=status.ANON_KEY;}
else {const keys=JSON.parse(execFileSync('npx',['supabase','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));api=`https://${ref}.supabase.co`;adminKey=keys.find(k=>k.name==='service_role').api_key;anonKey=keys.find(k=>k.name==='anon').api_key;}
const publicOrigin=process.env.PUBLIC_TEST_URL||'https://francielesofiati.com',appOrigin=process.env.MANAGEMENT_TEST_URL||'https://app.francielesofiati.com';
const admin=createClient(api,adminKey,{auth:{persistSession:false,autoRefreshToken:false}});
const staff=createClient(api,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
const anon=createClient(api,anonKey,{auth:{persistSession:false}});
const ok=({data,error})=>{if(error)throw Error(`${error.code||''}: ${error.message}`);return data;};
const run=randomUUID(),name=`QA FICTICIO FLUXO ${run.slice(0,8)}`,password=`QA-${randomUUID()}-aA9!`;
const output=process.env.INTAKE_EVIDENCE_DIR||`/tmp/sofiati-intake-evidence/${run}`;
await mkdir(output,{recursive:true,mode:0o700});
const report={run,environment:local?'local-real-services':'production',checks:[],retained:{},started_at:new Date().toISOString()};
const pass=message=>{report.checks.push(message);console.log('PASS:',message);};
const wait=async(check,description)=>{for(let i=0;i<80;i++){const v=await check();if(v)return v;await new Promise(r=>setTimeout(r,250));}throw Error(`Timeout: ${description}`);};
let browser,context,page,qaUser;
const receivedPayloads=[];
const bytes=Buffer.from('%PDF-1.4\n% QA FICTIONAL DOCUMENT - NO REAL PERSONAL DATA\n%%EOF');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
const hash=b=>createHash('sha256').update(b).digest('hex');
let cpf=Array.from({length:9},()=>Math.floor(Math.random()*10)).join('');
for(let size=9;size<=10;size++){const sum=[...cpf].reduce((n,c,i)=>n+Number(c)*(size+1-i),0);cpf+=String(((sum*10)%11)%10);}
try {
 const email=`qa-intake-${run}@example.invalid`;
 qaUser=ok(await admin.auth.admin.createUser({email,password,email_confirm:true})).user;
 report.retained.qa_user=qaUser.id;
 ok(await admin.from('memberships').insert({organization_id:org,user_id:qaUser.id,name:`QA TEMPORARIO ${run.slice(0,8)}`,email,role:'proprietario',status:'ativo'}));
 ok(await staff.auth.signInWithPassword({email,password}));
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 context=await browser.newContext();page=await context.newPage();page.setDefaultTimeout(20000);
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});report.console_errors=errors;
 page.on('requestfailed',r=>{if(r.url().includes('formulario')||r.url().includes('/upload/'))console.log('REQUEST FAILED',r.failure()?.errorText);});
 page.on('response',r=>{if(r.url().includes('/functions/v1/formulario'))console.log('Form response',r.status());});
 page.on('request',request=>{if(request.url()===`${api}/functions/v1/formulario` && request.method()==='POST'){try{const body=request.postDataJSON();if(body.action==='prepare')receivedPayloads.push(body);}catch{}}});
 await page.goto(appOrigin,{waitUntil:'networkidle'});
 await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Senha',{exact:true}).fill(password);await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.locator('.sidebar nav').getByRole('button',{name:'Formulários',exact:true}).waitFor();
 pass('QA reviewer authenticated through the real professional login form');
 const submit=async(note)=>{
  await page.goto(`${publicOrigin}/formulario.html`,{waitUntil:'networkidle'});
  const field=name=>page.locator(`form[data-public-intake] [name="${name}"]`);
  await field('signature_name').waitFor();
  for(const [key,value]of Object.entries({full_name:name,preferred_name:name,cpf,email:'qa-patient@example.invalid',phone:'43999990000',identity_document:'QA-FICTICIO',identity_issuer:'QA',identity_letter:'PR',birth_date:'01/01/1990',address:'ENDERECO FICTICIO DE TESTE',postal_code:'86000-000',health_notes:note,'treatment_área':'Área fictícia',appointment_date:'01/12/2026',appointment_time:'10:30',signature_name:name}))await field(key).fill(value);
  await field('adult_status').selectOption('adult');
  for(const key of ['technical_image_authorisation','marketing_image_authorisation','promotional_communication'])await field(key).selectOption('no');
  for(const key of ['toxina','harmony','limpeza_pele']){await page.locator(`[name=selected_procedures][value=${key}]`).check();await field(`accepted_term_${key}`).check();}
  for(const input of await page.locator('form[data-public-intake] input[type=checkbox][required]').all())await input.check();
  for(const key of ['identity_upload','booking_payment_receipt'])await field(key).setInputFiles({name:'documento-ficticio.pdf',mimeType:'application/pdf',buffer:bytes});
  await field('supporting_attachments').setInputFiles([{name:'anexo-ficticio.pdf',mimeType:'application/pdf',buffer:bytes},{name:'foto-ficticia.png',mimeType:'image/png',buffer:png}]);
  assert.deepEqual(await page.locator('form[data-public-intake]').evaluate(f=>[...f.elements].filter(e=>e.willValidate&&!e.validity.valid).map(e=>e.name)),[]);
  const response=page.waitForResponse(r=>r.url()===`${api}/functions/v1/formulario`&&r.request().postDataJSON()?.action==='complete',{timeout:90000});
  await page.locator('form[data-public-intake] button[type=submit]').click();
  const saved=await Promise.race([response,page.locator('[data-form-state=error]:visible').waitFor().then(async()=>{throw Error(await page.locator('[data-form-state=error]').innerText());})]);assert.equal(saved.status(),202,await saved.text());
  const result=await saved.json();assert.deepEqual(Object.keys(result).sort(),['attachments','received']);
  await page.waitForURL('**/obrigada*');
  const sent=receivedPayloads.at(-1);assert(sent?.request_id);
  const intake=ok(await admin.from('public_intakes').select('*').eq('request_id',sent.request_id).single());
  assert.deepEqual(intake.payload,sent.payload);assert(intake.completed_at);assert.equal(intake.patient_id,null);assert.equal(intake.reviewed_at,null);
  const files=ok(await admin.from('public_intake_files').select('*').eq('intake_id',intake.id));assert.equal(files.length,4);
  for(const file of files){const downloaded=ok(await staff.storage.from('intake-private').download(file.path));const actual=Buffer.from(await downloaded.arrayBuffer());assert.equal(hash(actual),file.sha256);assert.equal(file.sha256,sent.attachments.find(a=>a.name===file.original_name && a.field_name===file.field_name).sha256);}
  assert.equal(ok(await admin.from('intake_notification_outbox').select('id').eq('intake_id',intake.id)).length,1);
  const retry=await fetch(`${api}/functions/v1/formulario`,{method:'POST',headers:{Origin:publicOrigin,'Content-Type':'application/json'},body:JSON.stringify({action:'prepare',...sent})});assert(retry.ok,await retry.clone().text());
  assert.equal(ok(await admin.from('public_intakes').select('id').eq('request_id',sent.request_id)).length,1);
  assert((await anon.storage.from('intake-private').download(files[0].path)).error);
  const hidden=await anon.from('public_intakes').select('id').eq('id',intake.id);assert(hidden.error||hidden.data.length===0);
  report.retained.intakes||=[];report.retained.intakes.push(intake.id);
  return {intake,files,sent};
 };
 const first=await submit('QA declaração original fictícia; sem diagnóstico');
 pass('Real public submission round-trips every submitted answer, explicit refusals, signature and four hash-verified private uploads; no patient/reviewer is created automatically');
 pass('Prepare replay creates one submission; notification queued once before conversion; anonymous form/document reads rejected');
 const forms=async()=>{await page.goto(appOrigin,{waitUntil:'networkidle'});await page.locator('.sidebar nav').getByRole('button',{name:'Formulários',exact:true}).click();await page.getByLabel('Buscar formulários').fill(name);};
 const open=async(id)=>{await forms();await page.locator('button.patient-row').filter({hasText:name}).first().click();await page.getByRole('heading',{name:'Revisar formulário',exact:true}).waitFor();};
 await open(first.intake.id);
 await page.getByText('Todas as respostas do formulário',{exact:true}).click();await page.getByText(first.intake.payload.health_notes,{exact:true}).waitFor();
 assert.equal(await page.getByRole('dialog').locator('h4').count(),22); // 21 sections plus metadata group.
 await page.getByRole('dialog').getByRole('button',{name:/Documento de identidade -/}).waitFor();
 await page.getByRole('button',{name:'Converter em paciente',exact:true}).click();await page.locator('.sf-action-dialog').getByRole('button',{name:'Cancelar',exact:true}).click();await page.locator('.sf-action-dialog').waitFor({state:'detached'});
 assert.equal(ok(await admin.from('public_intakes').select('patient_id').eq('id',first.intake.id).single()).patient_id,null);
 await page.getByRole('button',{name:'Converter em paciente',exact:true}).click();await page.locator('.sf-action-dialog').getByRole('button',{name:'Confirmar',exact:true}).click();
 const linked=await wait(async()=>{const row=ok(await admin.from('public_intakes').select('*').eq('id',first.intake.id).single());return row.patient_id&&row;},'conversion');
 const patientId=linked.patient_id;report.retained.patient=patientId;assert(linked.reviewed_at);assert.equal(linked.converted_by,qaUser.id);
 const patient=ok(await staff.from('patients').select('*').eq('id',patientId).single());assert.equal(patient.cpf,cpf);assert.equal(patient.address.postal_code,'86000-000');assert.equal(patient.rg,'QA-FICTICIO · QA · PR');
 const consents=ok(await staff.from('consents').select('*').eq('source_intake_id',first.intake.id));assert(consents.some(c=>c.source_field==='technical_image_authorisation'&&c.status==='recusado'));assert(consents.some(c=>c.source_field==='accepted_term_toxina'&&c.status==='aceito'));
 const health=ok(await staff.from('patient_health_history').select('*').eq('source_intake_id',first.intake.id).single());assert.equal(health.other_notes,first.intake.payload.health_notes);assert.equal(health.allergies,'');
 const preference=ok(await staff.from('communication_preferences').select('*').eq('patient_id',patientId).single());assert.equal(preference.relationship_allowed,false);
 assert.equal(ok(await staff.rpc('convert_public_intake',{enquiry:first.intake.id})),patientId);
 pass('Review cancellation writes no patient; explicit conversion transfers identity, declared health, procedure consents/refusals and contact preference; retry returns the same patient');
 await page.reload();await page.locator('.sidebar nav').getByRole('button',{name:'Pacientes',exact:true}).click();await page.getByLabel('Buscar pacientes',{exact:true}).fill(name);await page.getByRole('button').filter({hasText:name}).first().click();
 await page.getByRole('button',{name:'Arquivos',exact:true}).click();await page.getByText('Formulários recebidos',{exact:true}).waitFor();await page.getByText('Documento de identidade -',{exact:false}).first().waitFor();
 await page.screenshot({path:`${output}/patient-files.png`,fullPage:true});
 pass('Real patient profile reload displays original form history and meaningfully named private documents');
 ok(await admin.from('memberships').update({role:'suporte_ti'}).eq('user_id',qaUser.id));
 const second=await submit('QA nova declaração fictícia; preservar o histórico anterior');
 await open(second.intake.id);
 await page.getByRole('dialog').locator('.patient-picker input').fill(name);await page.getByRole('dialog').getByRole('option',{name:new RegExp(name)}).click();
 await page.getByRole('button',{name:'Vincular ao paciente selecionado',exact:true}).click();await page.locator('.sf-action-dialog').getByRole('button',{name:'Confirmar',exact:true}).click();
 await wait(async()=>ok(await admin.from('public_intakes').select('patient_id').eq('id',second.intake.id).single()).patient_id===patientId,'explicit existing-patient link');
 assert.equal(ok(await admin.from('patients').select('id').eq('cpf',cpf)).length,1);
 assert.deepEqual(ok(await admin.from('public_intakes').select('payload').eq('id',first.intake.id).single()).payload,first.sent.payload);
 assert.equal(ok(await staff.from('patient_health_history').select('id').eq('patient_id',patientId)).length,2);
 assert.equal(ok(await staff.from('public_intake_files').select('id').in('intake_id',[first.intake.id,second.intake.id])).length,8);
 assert(ok(await admin.from('audit_events').select('id').eq('entity_id',first.intake.id)).length>=3);
 assert.deepEqual(errors,[]);
 pass('Software-owner role (suporte_ti) links the second real form to the existing patient without duplicate identity or overwritten answers, clinical declarations, files or audit history');
 report.notification_status=ok(await admin.from('intake_notification_outbox').select('status,last_error').in('intake_id',report.retained.intakes));
 report.inbox_delivery='requires actual receipt evidence from both configured inboxes';
} catch(error){report.error=error.message;if(page)await page.screenshot({path:`${output}/failure.png`,fullPage:true}).catch(()=>{});throw error;}
finally {
 if(qaUser){ // Keep the QA account and records, but remove its ability to access patient data.
  const result=await admin.from('memberships').update({status:'inativo'}).eq('user_id',qaUser.id).eq('organization_id',org);if(result.error)report.qa_deactivation_error=result.error.code;
 }
 await staff.auth.signOut().catch(()=>{});
 if(browser)await browser.close();report.finished_at=new Date().toISOString();await writeFile(`${output}/result.json`,JSON.stringify(report,null,2)+'\n',{mode:0o600});console.log('Evidence:',output);
}
