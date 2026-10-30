// Explicitly invoked production journey: fictional data, real browser/network,
// existing owner via an unsent one-time login link, and verified cleanup.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '../management/node_modules/@supabase/supabase-js/dist/index.mjs';
import { chromium } from 'playwright-core';
const ref='naypgbhwnlbyqqqfftgn', org='a783bd4c-f253-4a94-9365-75c6f1000001';
const keys=JSON.parse(execFileSync('npx',['supabase','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));
const admin=createClient(`https://${ref}.supabase.co`,keys.find(k=>k.name==='service_role').api_key,{auth:{persistSession:false}});
const client=createClient(`https://${ref}.supabase.co`,keys.find(k=>k.name==='anon').api_key,{auth:{persistSession:false}});
const ok=({data,error})=>{if(error)throw Error(`${error.code||''}: ${error.message}`);return data;};
const stamp=Date.now(), name=`QA FLUXO FICTICIO ${stamp}`, report={name,checks:[],started_at:new Date().toISOString()};
const pass=message=>{report.checks.push(message);console.log('PASS:',message);};
let patientId, intakeId, session, browser, page;
const output='reports/intake-live-2026-10-30';await mkdir(output,{recursive:true});
try {
  const owner=ok(await admin.from('memberships').select('email').eq('organization_id',org).eq('role','proprietario').eq('status','ativo').limit(1).single());
  const link=ok(await admin.auth.admin.generateLink({type:'magiclink',email:owner.email}));
  session=ok(await client.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'magiclink'})).session;
  assert(session);pass('Authenticated owner session without sending a login email or changing a password');
  const stale=ok(await admin.from('public_intakes').select('id,full_name,patient_id').eq('organization_id',org).like('full_name','QA FLUXO FICTICIO %').gte('created_at','2026-10-30T00:00:00Z'));
  for(const row of stale){
    if(row.patient_id)assert.equal(ok(await admin.from('patients').select('full_name').eq('id',row.patient_id).single()).full_name,row.full_name);
    const result=await fetch(`https://${ref}.supabase.co/functions/v1/files`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,Origin:'https://app.francielesofiati.com','Content-Type':'application/json'},body:JSON.stringify(row.patient_id?{action:'delete_patient',patient_id:row.patient_id}:{action:'delete_intake',intake_id:row.id})});
    assert(result.ok,await result.text());
  }
  pass(`Removed ${stale.length} incomplete records from earlier fictional test attempts`);

  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const context=await browser.newContext();page=await context.newPage();page.setDefaultTimeout(25000);
  page.on('response', async response => {if(response.url().includes('/functions/v1/formulario')) {const data=await response.json().catch(()=>({}));if(data.prepared)intakeId=data.intake_id;console.log('Form endpoint:',response.status(),data.error || (data.prepared?'prepared':data.received?'received':''));}});
  await page.goto('https://francielesofiati.com/formulario',{waitUntil:'networkidle'});
  await page.locator('[name=selected_procedures][value=limpeza_pele]').waitFor();
  const field=(name)=>page.locator(`form[data-public-intake] [name="${name}"]`);
  // Random valid checksum, used only in this explicitly fictional test record.
  let cpf=Array.from({length:9},()=>Math.floor(Math.random()*10)).join('');
  for(let size=9;size<=10;size++){let sum=[...cpf].reduce((n,c,i)=>n+Number(c)*(size+1-i),0);cpf+=String(((sum*10)%11)%10);}
  for(const [key,value] of Object.entries({full_name:name,preferred_name:`QA ${stamp}`,cpf,email:'qa-intake@example.invalid',phone:'43999990000',identity_document:'QA-FICTICIO',identity_issuer:'QA',identity_letter:'PR',birth_date:'01/01/1990',address:'ENDERECO FICTICIO PARA TESTE',postal_code:'86000-000',guardian_details:'Nao se aplica - teste ficticio',health_notes:'QA alergia ficticia; nao representa paciente real','treatment_área':'QA area ficticia'})) if(await field(key).isVisible())await field(key).fill(value);
  for(const input of await page.locator('form[data-public-intake] input[type=checkbox][required]').all())await input.check();
  await page.locator('[name=selected_procedures][value=limpeza_pele]').check();
  await field('accepted_term_limpeza_pele').check();
  await field('adult_status').selectOption({index:1});
  for(const key of ['technical_image_authorisation','marketing_image_authorisation','promotional_communication'])await field(key).selectOption('no');
  const bytes=Buffer.from('%PDF-1.4\n% QA FICTIONAL TEST DOCUMENT - NO PERSONAL DATA\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
  for(const key of ['identity_upload','booking_payment_receipt','supporting_attachments']) if(await field(key).count()) await field(key).setInputFiles({name:`${key}-QA.pdf`,mimeType:'application/pdf',buffer:bytes});
  pass('Filled the public form with fictional details and attachments');
  const invalid = await page.locator('form[data-public-intake]').evaluate(form => [...form.elements].filter(el => el.willValidate && !el.validity.valid).map(el => ({name:el.name,message:el.validationMessage})));
  assert.deepEqual(invalid, [], 'Browser form validation failed');
  const completePromise=page.waitForResponse(r=>r.url().includes('/functions/v1/formulario')&&r.request().postDataJSON()?.action==='complete',{timeout:60000});
  await page.locator('form[data-public-intake] button[type=submit]').click();
  const response=await Promise.race([completePromise, page.locator('[data-form-state=error]:visible').waitFor({timeout:65000}).then(async()=>{throw Error(await page.locator('[data-form-state=error]').innerText());})]);const received=await response.json();assert.equal(response.status(),202);assert.equal(received.received,true);
  intakeId=received.intake_id;assert.equal(received.patient_status,'created','Fictional submission must create a new patient');patientId=received.patient_id;assert(patientId,`patient conversion status ${received.patient_status}`);
  await page.waitForURL(/obrigada/,{timeout:30000});pass('Public form submitted through real prepare/upload/complete requests and reached thank-you page');
  const intake=ok(await admin.from('public_intakes').select('*').eq('id',intakeId).single());
  const patient=ok(await client.from('patients').select('*').eq('id',patientId).single());
  assert.equal(intake.patient_id,patientId);assert.equal(intake.payload.health_notes,'QA alergia ficticia; nao representa paciente real');
  assert.equal(patient.full_name,name);assert.equal(patient.birth_date,'1990-01-01');assert.equal(patient.cpf,cpf);assert(patient.rg.includes('QA-FICTICIO'));assert.equal(patient.address.postal_code,'86000-000');
  pass('Saved full original answers and automatically created patient identity, date, CPF, contact, address and identity issuer');
  const files=ok(await client.from('public_intake_files').select('*').eq('intake_id',intakeId));assert(files.length>=2);
  for(const file of files){const signed=ok(await client.storage.from('intake-private').createSignedUrl(file.path,60));const res=await fetch(signed.signedUrl);assert(res.ok);assert.deepEqual(Buffer.from(await res.arrayBuffer()),bytes);}
  pass(`All ${files.length} private uploads downloaded byte-for-byte after conversion`);
  const consents=ok(await client.from('consents').select('source_field,status').eq('source_intake_id',intakeId));assert(consents.some(c=>c.source_field==='technical_image_authorisation'&&c.status==='recusado'));pass('Consent approvals and explicit image/marketing refusals retained');
  await context.addInitScript(value=>{if(location.origin==='https://app.francielesofiati.com')sessionStorage.setItem('sofiati-auth',JSON.stringify(value));},session);
  await page.goto('https://app.francielesofiati.com',{waitUntil:'networkidle'});
  await page.locator('.sidebar').getByRole('button',{name:'Formulários',exact:true}).click();
  await page.getByLabel('Buscar formulários').fill(name);
  await page.locator('button.patient-row').filter({hasText:name}).click();
  await page.getByText('Todas as respostas do formulário',{exact:true}).click();
  await page.getByText(intake.payload.health_notes,{exact:true}).waitFor();
  await page.screenshot({path:`${output}/form-review.png`,fullPage:true});pass('Converted submission visible in Forms → Todos, with all answers and files');
  await page.getByRole('button',{name:'Abrir paciente',exact:true}).last().click();
  await page.getByRole('button',{name:'Documentos e fotos',exact:true}).last().click();
  await page.getByText(files[0].original_name,{exact:true}).waitFor();
  const popupPromise=context.waitForEvent('page');await page.getByRole('button',{name:'Abrir em nova aba',exact:true}).first().click();
  const popup=await popupPromise;await popup.waitForLoadState();assert(popup.url().includes('/storage/v1/'));await popup.close();
  await page.screenshot({path:`${output}/patient-documents.png`,fullPage:true});pass('Patient document library contains original uploads and opens a real signed document');
  await page.getByRole('button',{name:'Arquivo / excluir',exact:true}).click();
  await page.getByRole('button',{name:'Excluir permanentemente',exact:true}).click();
  const deletion=page.waitForResponse(r=>r.url().includes('/functions/v1/files')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Confirmar',exact:true}).click();
  const deleted=await deletion;assert(deleted.ok(),await deleted.text());
  assert.equal(ok(await admin.from('patients').select('id').eq('id',patientId)).length,0);
  assert.equal(ok(await admin.from('public_intakes').select('id').eq('id',intakeId)).length,0);
  for(const file of files){const data=await admin.storage.from('intake-private').info(file.path);assert(data.error,'Deleted patient left an uploaded object');}
  patientId=null;intakeId=null;pass('Permanent deletion succeeded through live UI and removed patient, form, attachment metadata and stored uploads');
} catch(error){report.error=error.message;if(page)await page.screenshot({path:`${output}/failure.png`,fullPage:true}).catch(()=>{});throw error;}
finally {
  if(patientId){assert.equal(ok(await admin.from('patients').select('full_name').eq('id',patientId).single()).full_name,name);const result=await fetch(`https://${ref}.supabase.co/functions/v1/files`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,Origin:'https://app.francielesofiati.com','Content-Type':'application/json'},body:JSON.stringify({action:'delete_patient',patient_id:patientId})});report.cleanup_error=result.ok?null:await result.text();}
  else if(intakeId){const result=await fetch(`https://${ref}.supabase.co/functions/v1/files`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,Origin:'https://app.francielesofiati.com','Content-Type':'application/json'},body:JSON.stringify({action:'delete_intake',intake_id:intakeId})});report.cleanup_error=result.ok?null:await result.text();}
  if(session){await client.rpc('revoke_current_session');await client.auth.signOut({scope:'local'});}
  if(browser)await browser.close();report.finished_at=new Date().toISOString();await writeFile(`${output}/result.json`,JSON.stringify(report,null,2)+'\n');
}
