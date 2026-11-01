// Real Auth + PostgREST + PostgreSQL + Storage + Edge + browser. No HTTP mocks.
// Refuses any API other than the isolated local audit stack.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright-core';
const status = JSON.parse(await readFile(process.env.SOFIATI_LOCAL_STATUS || '/tmp/sofiati-workflow-audit/status.json','utf8'));
assert.equal(new URL(status.API_URL).origin,'http://127.0.0.1:55421','isolated local stack required');
const org='a783bd4c-f253-4a94-9365-75c6f1000001', origin='http://127.0.0.1:5177';
const admin=createClient(status.API_URL,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ok=({data,error})=>{if(error)throw Error(`${error.code||''} ${error.message}`);return data;};
const wait=async(check,description)=>{for(let n=0;n<60;n++){const value=await check();if(value)return value;await new Promise(r=>setTimeout(r,100));}throw Error(`Timeout: ${description}`);};
const stamp=Date.now(),password='Local workflow audit 2026!';
const users=[],report={checks:[],consoleErrors:[],localOnly:true};
const pass=(message)=>{report.checks.push(message);console.log('PASS',message);};
let browser,server;
try{
  const staff={};
  for(const role of ['proprietario','profissional','recepcao','medico']){
    const email=`workflow-${role}-${stamp}@example.invalid`;
    const {user}=ok(await admin.auth.admin.createUser({email,password,email_confirm:true}));users.push(user.id);
    ok(await admin.from('memberships').insert({organization_id:org,user_id:user.id,name:`QA ${role}`,email,role,status:'ativo'}));
    const client=createClient(status.API_URL,status.ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    const session=ok(await client.auth.signInWithPassword({email,password})).session;
    staff[role]={client,session,user,email};
  }
  const owner=staff.proprietario.client;
  const patient=ok(await owner.from('patients').insert({organization_id:org,full_name:`QA Workflow ${stamp}`,preferred_name:`QA Workflow ${stamp}`,email:`workflow-patient-${stamp}@example.invalid`,status:'ativo'}).select().single());
  const other=ok(await owner.from('patients').insert({organization_id:org,full_name:`QA Other ${stamp}`,status:'ativo'}).select().single());
  const procedure=ok(await owner.from('procedures').insert({organization_id:org,name:`QA Workflow Treatment ${stamp}`,category:'QA',default_duration:30,interval_days:7,followup_days:14,required_consents:['procedimento'],consent_template_version:'qa-v1',lot_required:false}).select().single());
  const planId=ok(await owner.rpc('save_treatment_plan',{plan_payload:{organization_id:org,patient_id:patient.id,title:`QA plan ${stamp}`,responsible_user:staff.proprietario.user.id},item_payload:{procedure_id:procedure.id,sessions:2}}));
  ok(await owner.from('patient_health_history').insert({organization_id:org,patient_id:patient.id,allergies:'QA allergy retained',medications:'QA medication retained'}));
  server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5177','--strictPort'],{cwd:new URL('..',import.meta.url),env:{...process.env,VITE_SUPABASE_URL:status.API_URL,VITE_SUPABASE_PUBLISHABLE_KEY:status.ANON_KEY},stdio:['ignore','pipe','pipe']});
  let output='';server.stdout.on('data',c=>{output+=c;});server.stderr.on('data',c=>{output+=c;});
  await wait(async()=>{try{return(await fetch(origin)).ok;}catch{return false;}},'Vite');
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(15000);page.on('pageerror',e=>report.consoleErrors.push(e.message));
  await page.goto(origin);await page.getByLabel('Email',{exact:true}).fill(staff.proprietario.email);await page.getByLabel('Senha',{exact:true}).fill(password);await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.locator('.sidebar nav').getByRole('button',{name:'Pacientes',exact:true}).click();await page.getByRole('button').filter({hasText:patient.preferred_name}).first().click();
  await page.getByRole('heading',{name:patient.preferred_name,exact:true}).waitFor();
  assert.equal(await page.locator('.patient-workspace .tabs button').count(),5);await page.getByText('QA allergy retained',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Novo atendimento',exact:true}).click();await page.getByLabel('Registro livre / observações').fill(`QA consultation ${stamp}`);await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();await page.getByRole('dialog').waitFor({state:'detached'});
  const entry=await wait(async()=>ok(await owner.from('entries').select('*').eq('patient_id',patient.id).eq('content',`QA consultation ${stamp}`).maybeSingle()),'persisted consultation');
  assert(ok(await owner.from('entry_versions').select('id').eq('entry_id',entry.id)).length>0);pass('consultation persists with a version snapshot through real browser save');
  await page.getByRole('button',{name:'Prontuário',exact:true}).click();await page.locator('summary').filter({hasText:'Atualizar histórico de saúde'}).click();
  assert.equal(await page.getByLabel('Alergias',{exact:true}).inputValue(),'QA allergy retained');await page.getByLabel('Outras informações',{exact:true}).fill('QA health update');await page.getByRole('button',{name:'Salvar versão',exact:true}).click();
  await wait(async()=>ok(await owner.from('patient_health_history').select('*').eq('patient_id',patient.id)).length===2,'two health versions');
  const health=ok(await owner.from('patient_health_history').select('*').eq('patient_id',patient.id).order('created_at',{ascending:false}));assert.equal(health[0].allergies,'QA allergy retained');assert.equal(health[0].medications,'QA medication retained');
  pass('health updates preserve unchanged fields and both database versions');
  await page.getByRole('button',{name:'Tratamentos',exact:true}).click();await page.getByRole('button',{name:'Iniciar procedimento',exact:true}).click();
  await page.getByRole('button',{name:'Completar rascunho',exact:true}).waitFor();
  const draft=ok(await owner.from('clinical_procedures').select('*').eq('patient_id',patient.id).eq('plan_id',planId).single());
  pass('starting a plan item persists a linked draft and updates the procedure panel without navigation');
  const rejected=await owner.rpc('record_clinical_procedure',{procedure_payload:{...draft,consent_status:'aceito'},usage_payload:null});assert(rejected.error?.message.includes('procedure_consent_evidence_required'));
  assert.equal(ok(await owner.from('clinical_procedures').select('status').eq('id',draft.id).single()).status,'rascunho');pass('self-declared consent cannot finalize a procedure and failure leaves its draft intact');
  await page.getByRole('button',{name:'Verificar consentimento',exact:true}).click();const consent=page.getByRole('button',{name:'Salvar consentimento',exact:true}).locator('xpath=ancestor::form');await consent.waitFor({state:'visible'});await consent.locator('select').nth(3).selectOption('aceito');await consent.getByRole('button',{name:'Salvar consentimento',exact:true}).click();
  const evidence=await wait(async()=>ok(await owner.from('consents').select('*').eq('clinical_procedure_id',draft.id).maybeSingle()),'consent evidence');assert.equal(evidence.procedure_id,procedure.id);assert.equal(evidence.status,'aceito');assert.equal(evidence.template_version,'qa-v1');assert(evidence.accepted_at);assert(evidence.generated_content);await page.getByText('Último consentimento registrado:',{exact:false}).waitFor();pass('contextual consent persists evidence, catalogue snapshot and procedure linkage, and refreshes its procedure');
  await page.getByRole('button',{name:'Anexar fotos',exact:true}).click();const photo=page.getByRole('button',{name:'Enviar foto privada',exact:true}).locator('xpath=ancestor::form');await photo.waitFor({state:'visible'});await photo.locator('input[type=file]').setInputFiles({name:'qa-photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});await photo.getByRole('button',{name:'Enviar foto privada',exact:true}).click();
  const savedPhoto=await wait(async()=>ok(await owner.from('clinical_photos').select('*').eq('clinical_procedure_id',draft.id).maybeSingle()),'stored photo');assert(ok(await owner.storage.from('clinical-photos').download(savedPhoto.path)).size>0);pass('photo upload persists metadata, private bytes and procedure relationship');
  const fileRequest=async(role,kind,patientId=patient.id,procedureId=draft.id)=>{const body=new FormData();body.set('kind',kind);body.set('patient_id',patientId);body.set('clinical_procedure_id',procedureId);body.set('category','antes');body.set('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'qa-permissions.png');return fetch(`${status.API_URL}/functions/v1/files`,{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${staff[role].session.access_token}`},body});};
  let response=await fileRequest('recepcao','photo');assert.equal(response.ok,false);assert.match(await response.text(),/not_authorized/);
  response=await fileRequest('proprietario','photo',other.id);assert.equal(response.ok,false);assert.match(await response.text(),/patient_relationship_mismatch/);
  response=await fileRequest('medico','photo');assert.equal(response.ok,true,await response.text());pass('real Edge endpoint denies reception and cross-patient attachment, while accepting clinical role aliases');
  await page.getByRole('button',{name:'Completar rascunho',exact:true}).click();const finalForm=page.getByRole('button',{name:'Finalizar rascunho',exact:true}).locator('xpath=ancestor::form');await finalForm.locator('select').nth(2).selectOption('aceito');await finalForm.getByRole('button',{name:'Finalizar rascunho',exact:true}).click();
  await wait(async()=>ok(await owner.from('clinical_procedures').select('status').eq('id',draft.id).single()).status==='finalizado','finalized procedure');
  const followup=ok(await owner.from('follow_ups').select('*').eq('clinical_procedure_id',draft.id).single());assert.equal(followup.patient_id,patient.id);assert(ok(await owner.from('audit_events').select('id').eq('entity_id',draft.id)).length>=2);pass('procedure finalization persists, generates exactly one follow-up and emits clinical audit events');
  await page.getByRole('button',{name:'Arquivos',exact:true}).click();await page.locator('.document-row').filter({hasText:'Fotografia'}).first().waitFor();
  await page.getByRole('button',{name:'Anexar arquivo',exact:true}).click();const docDialog=page.getByRole('dialog');await docDialog.locator('input[type=file]').setInputFiles({name:'qa-document.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n% QA workflow document\n%%EOF')});await docDialog.locator('select').nth(1).selectOption(entry.id);await docDialog.getByLabel('Descrição',{exact:true}).fill('QA linked evidence');await docDialog.getByRole('button',{name:/Enviar|Anexar|Salvar/}).last().click();await docDialog.waitFor({state:'detached'});
  const document=ok(await owner.from('documents').select('*').eq('patient_id',patient.id).eq('name','qa-document.pdf').single());assert.equal(document.status,'pronto');assert.equal(ok(await owner.from('document_links').select('*').eq('document_id',document.id).single()).entry_id,entry.id);assert(ok(await owner.storage.from('patient-files').download(document.path)).size>0);
  pass('document upload persists bytes, metadata and the original consultation link');
  await page.reload();await page.locator('.sidebar nav').getByRole('button',{name:'Pacientes',exact:true}).click();await page.getByRole('button').filter({hasText:patient.preferred_name}).first().click();await page.getByText('QA allergy retained',{exact:true}).waitFor();await page.getByRole('button',{name:'Arquivos',exact:true}).click();await page.getByLabel('Buscar arquivos',{exact:true}).fill('qa-document');await page.getByText('qa-document.pdf',{exact:true}).waitFor();pass('full browser reload retrieves persisted health data and searchable attachments');
  const bookingId=crypto.randomUUID();const booking={payload:{organization_id:org,patient_id:patient.id,professional_id:null,starts_at:'2026-12-01T12:00:00Z',ends_at:'2026-12-01T12:30:00Z',status:'agendado',label:'QA return'},request_id:bookingId,follow_up_id:followup.id,session_count:2,interval_days:7};
  const first=ok(await owner.rpc('save_appointment_series',booking));assert.equal(ok(await owner.rpc('save_appointment_series',booking)),first);assert.equal(ok(await owner.from('appointments').select('id').eq('booking_request_id',bookingId)).length,2);assert.equal(ok(await owner.from('follow_ups').select('appointment_id,status').eq('id',followup.id).single()).appointment_id,first);pass('recurring return booking persists both sessions atomically and retry returns the same appointment');
  assert.equal(ok(await owner.rpc('schedule_treatment_plan',{p_plan:planId,p_start_date:'2026-12-10',p_start_time:'09:00'})),2);assert.equal(ok(await owner.rpc('schedule_treatment_plan',{p_plan:planId,p_start_date:'2026-12-10',p_start_time:'09:00'})),0);pass('plan scheduling is persistent and idempotent against real PostgreSQL');
  const failedShare=await owner.from('patient_portal_shares').insert({organization_id:org,patient_id:other.id,resource_type:'document',resource_id:document.id,shared_by:staff.proprietario.user.id});assert(failedShare.error?.message.includes('patient_relationship_mismatch'));
  for(const [resource_type,resource_id] of [['document',document.id],['photo',savedPhoto.id],['consent',evidence.id],['post_care',draft.id]])ok(await owner.from('patient_portal_shares').insert({organization_id:org,patient_id:patient.id,resource_type,resource_id,shared_by:staff.proprietario.user.id}));
  const cpf='52998224725',portalPassword='Local portal audit 2026!',salt=crypto.getRandomValues(new Uint8Array(16));
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(portalPassword),'PBKDF2',false,['deriveBits']);
  const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:240000,hash:'SHA-256'},material,256);
  const cpfHash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`isolated-workflow-audit-only:${cpf}-${stamp}`))).toString('hex');
  // The same dummy CPF can be reused only after retiring an earlier local run.
  const actualCpfHash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`isolated-workflow-audit-only:${cpf}`))).toString('hex');
  ok(await admin.from('patient_portal_accounts').delete().eq('cpf_hash',actualCpfHash));
  ok(await admin.from('patient_portal_accounts').insert({organization_id:org,patient_id:patient.id,cpf_hash:actualCpfHash,password_salt:Buffer.from(salt).toString('base64url'),password_hash:Buffer.from(hash).toString('base64url'),must_change_password:false}));
  const portal=async(body,token='')=>{const response=await fetch(`${status.API_URL}/functions/v1/portal`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token?{'x-portal-token':token}:{})},body:JSON.stringify(body)});return {response,data:await response.json()};};
  const login=await portal({action:'login',cpf,password:portalPassword});assert.equal(login.response.ok,true,JSON.stringify(login.data));assert.equal(login.data.patient.id,patient.id);assert(login.data.resources.some(r=>r.type==='document'&&r.id===document.id&&r.url));assert(login.data.resources.some(r=>r.type==='photo'&&r.id===savedPhoto.id&&r.url));assert(!login.data.resources.some(r=>r.patient_id===other.id));
  const portalRequest=await portal({action:'portal_action',action_type:'confirmar_agendamento',appointment_id:first},login.data.token);assert.equal(portalRequest.response.ok,true,JSON.stringify(portalRequest.data));
  const action=ok(await owner.from('patient_portal_actions').select('*').eq('patient_id',patient.id).eq('appointment_id',first).single());ok(await owner.from('patient_portal_actions').update({status:'concluida'}).eq('id',action.id));assert.equal(ok(await owner.from('appointments').select('status').eq('id',first).single()).status,'confirmado');
  assert.equal((await portal({action:'logout'},login.data.token)).response.ok,true);assert.equal((await portal({action:'refresh'},login.data.token)).response.ok,false);pass('real portal login resolves only valid patient shares, appointment requests synchronize, and logout revokes access');
  const invoice=ok(await admin.from('financial_records').insert({organization_id:org,patient_id:patient.id,procedure_name:'QA charge',total_cents:10000,created_by:staff.proprietario.user.id}).select().single());
  const payment=()=>admin.from('financial_payments').insert({organization_id:org,patient_id:patient.id,record_id:invoice.id,amount_cents:7000,method:'pix',status:'recebido',created_by:staff.proprietario.user.id}).select().single();
  const payments=await Promise.all([payment(),payment()]);assert.equal(payments.filter(p=>!p.error).length,1);assert(payments.find(p=>p.error).error.message.includes('finance_payment_over_total'));assert.equal(ok(await admin.from('financial_records').select('status').eq('id',invoice.id).single()).status,'parcial');
  ok(await admin.from('financial_payments').update({status:'estornado'}).eq('id',payments.find(p=>!p.error).data.id));assert.equal(ok(await admin.from('financial_records').select('status').eq('id',invoice.id).single()).status,'pendente');assert.equal(ok(await staff.recepcao.client.from('financial_records').select('id').eq('id',invoice.id)).length,0);pass('concurrent payments cannot overpay a charge, refunds synchronize its balance, and reception cannot retrieve it');
  const duplicateBooking={...booking,follow_up_id:null,request_id:crypto.randomUUID()};const bookings=await Promise.all([owner.rpc('save_appointment_series',duplicateBooking),owner.rpc('save_appointment_series',duplicateBooking)]);assert.equal(ok(bookings[0]),ok(bookings[1]));assert.equal(ok(await owner.from('appointments').select('id').eq('booking_request_id',duplicateBooking.request_id)).length,2);pass('concurrent retries produce one recurring booking');
  const replacement=new FormData();replacement.set('kind','photo_replace');replacement.set('patient_id',patient.id);replacement.set('photo_id',savedPhoto.id);replacement.set('category','depois');replacement.set('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'qa-after.png');
  let replaced=await fetch(`${status.API_URL}/functions/v1/files`,{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${staff.proprietario.session.access_token}`},body:replacement});assert.equal(replaced.ok,true,await replaced.text());
  const versions=ok(await owner.from('clinical_photo_versions').select('*').eq('photo_id',savedPhoto.id));assert.equal(versions.length,1);assert.equal(versions[0].snapshot.path,savedPhoto.path);assert(ok(await owner.storage.from('clinical-photos').download(savedPhoto.path)).size>0);
  const deletion=new FormData();deletion.set('kind','photo_delete');deletion.set('patient_id',patient.id);deletion.set('photo_id',savedPhoto.id);
  for(let attempt=0;attempt<2;attempt++){const removed=await fetch(`${status.API_URL}/functions/v1/files`,{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${staff.proprietario.session.access_token}`},body:deletion});assert.equal(removed.ok,true,await removed.text());}
  assert.equal(ok(await owner.from('clinical_photos').select('id').eq('id',savedPhoto.id)).length,0);assert((await admin.storage.from('clinical-photos').download(savedPhoto.path)).error);assert.equal(ok(await admin.from('pending_storage_deletions').select('id').eq('resource_id',savedPhoto.id)).length,0);pass('photo replacement preserves original bytes and history; deletion removes current and previous bytes and is retry-safe');
  assert.deepEqual(report.consoleErrors,[]);report.passed=true;
  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/integration-patient-library.png',fullPage:true});
}catch(error){report.passed=false;report.error=error.message;console.error(error);process.exitCode=1;
  if(browser){for(const context of browser.contexts())for(const page of context.pages()){await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/integration-failure.png',fullPage:true}).catch(()=>{});}}
}finally{
  await browser?.close();server?.kill();
  // Data is intentionally retained in this isolated stack for failure inspection.
  // Stopping it with `supabase stop --no-backup` removes the complete fixture DB.
  await mkdir('test-results',{recursive:true});await writeFile('test-results/integration-local.json',JSON.stringify(report,null,2)+'\n');
}
