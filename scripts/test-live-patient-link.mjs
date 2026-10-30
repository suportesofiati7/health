// Explicit production linking regression. Creates only labeled fictional records
// and verifies cleanup without modifying existing patients.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createClient} from '../management/node_modules/@supabase/supabase-js/dist/index.mjs';
import {chromium} from 'playwright-core';
const ref='naypgbhwnlbyqqqfftgn',org='a783bd4c-f253-4a94-9365-75c6f1000001';
const origin=process.env.MANAGEMENT_TEST_URL||'https://app.francielesofiati.com';
const keys=JSON.parse(execFileSync('npx',['supabase','projects','api-keys','--project-ref',ref,'--output','json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));
const admin=createClient(`https://${ref}.supabase.co`,keys.find(k=>k.name==='service_role').api_key,{auth:{persistSession:false}});
const client=createClient(`https://${ref}.supabase.co`,keys.find(k=>k.name==='anon').api_key,{auth:{persistSession:false}});
const ok=({data,error})=>{if(error)throw Error(`${error.code||''}: ${error.message}`);return data;};
const stamp=Date.now(),name=`QA VINCULO FICTICIO ${stamp}`,email=`qa-link-${stamp}@example.invalid`;
let session,patient,intake,browser,page;const report={origin,started_at:new Date().toISOString(),checks:[]};
const pass=text=>{report.checks.push(text);console.log('PASS:',text);};
const output='reports/patient-link-2026-10-30';await mkdir(output,{recursive:true});
async function remove(body){const result=await fetch(`https://${ref}.supabase.co/functions/v1/files`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,Origin:'https://app.francielesofiati.com','Content-Type':'application/json'},body:JSON.stringify(body)});assert(result.ok,await result.text());}
try{
 const owner=ok(await admin.from('memberships').select('email').eq('organization_id',org).eq('role','proprietario').eq('status','ativo').limit(1).single());
 const link=ok(await admin.auth.admin.generateLink({type:'magiclink',email:owner.email}));session=ok(await client.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'magiclink'})).session;
 patient=ok(await client.from('patients').insert({organization_id:org,full_name:name,preferred_name:name,email,status:'ativo'}).select().single());
 intake=ok(await admin.from('public_intakes').insert({organization_id:org,full_name:name,email,form_version:'QA-link-2026-10-30',payload:{full_name:name,email,health_notes:'Fictional linking evidence only',lgpd_personal_data_consent:'yes'}}).select().single());
 const bytes=Buffer.from('%PDF-1.4\n% Fictional linking regression\n%%EOF');const path=`${org}/${intake.id}/qa-link.pdf`;
 ok(await admin.storage.from('intake-private').upload(path,bytes,{contentType:'application/pdf'}));
 ok(await admin.from('public_intake_files').insert({organization_id:org,intake_id:intake.id,path,kind:'attachment',field_name:'supporting_attachments',original_name:'qa-link.pdf',mime_type:'application/pdf',size_bytes:bytes.length}));
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addInitScript(({origin,session})=>{if(location.origin===origin)sessionStorage.setItem('sofiati-auth',JSON.stringify(session));},{origin,session});
 page=await context.newPage();page.setDefaultTimeout(20000);await page.goto(origin,{waitUntil:'networkidle'});
 const forms=async()=>{await page.locator('.sidebar nav').getByRole('button',{name:'Formulários',exact:true}).click();await page.getByLabel('Buscar formulários').fill(name);await page.locator('button.patient-row').filter({hasText:name}).click();};
 await forms();const dialog=page.getByRole('dialog',{name:'Revisar formulário'});const button=dialog.getByRole('button',{name:'Vincular',exact:true});await button.waitFor();assert(await button.isEnabled());
 await button.click();await page.getByRole('button',{name:'Cancelar',exact:true}).last().click();
 assert.equal(ok(await admin.from('public_intakes').select('patient_id').eq('id',intake.id).single()).patient_id,null);pass('Duplicate Vincular opens confirmation; cancellation leaves the form unlinked');
 await button.click();const conversion=page.waitForResponse(r=>r.url().includes('/rpc/convert_public_intake')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Confirmar',exact:true}).click();const response=await conversion;assert(response.ok(),await response.text());
 await page.getByRole('heading',{name,exact:true}).waitFor();const saved=ok(await client.from('public_intakes').select('patient_id,status,payload').eq('id',intake.id).single());
 assert.equal(saved.patient_id,patient.id);assert.equal(saved.status,'convertido');assert.equal(saved.payload.health_notes,'Fictional linking evidence only');
 assert.equal(ok(await client.from('patients').select('id').eq('email',email)).length,1);pass('Confirming Vincular links to the chosen patient and opens the record without creating a duplicate patient');
 await page.getByRole('button',{name:'Documentos e fotos',exact:true}).click();await page.getByText('qa-link.pdf',{exact:true}).waitFor();pass('Linked patient retains access to the original form attachment');
 await forms();await dialog.getByText(/Este formulário já está vinculado a um paciente/).waitFor();assert.equal(await dialog.getByRole('button',{name:'Vincular',exact:true}).count(),0);
 await page.screenshot({path:`${output}/linked-form.png`,fullPage:true});await dialog.getByRole('button',{name:'Abrir paciente',exact:true}).click();await page.getByRole('heading',{name,exact:true}).waitFor();pass('Already-linked form explains its state and opens the patient instead of showing disabled Vincular buttons');
 report.passed=true;
}catch(error){report.error=error.message;throw error;}
finally{
 try{
  if(intake){const row=ok(await admin.from('public_intakes').select('full_name,patient_id').eq('id',intake.id).maybeSingle());if(row){assert.equal(row.full_name,name);if(!row.patient_id)await remove({action:'delete_intake',intake_id:intake.id});else assert.equal(row.patient_id,patient.id);}}
  if(patient){assert.equal(ok(await admin.from('patients').select('full_name').eq('id',patient.id).single()).full_name,name);await remove({action:'delete_patient',patient_id:patient.id});}
  if(patient)assert.equal(ok(await admin.from('patients').select('id').eq('id',patient.id)).length,0);
  if(intake)assert.equal(ok(await admin.from('public_intakes').select('id').eq('id',intake.id)).length,0);
  report.cleanup_verified=true;
 }catch(error){report.cleanup_error=error.message;report.passed=false;process.exitCode=1;}
 if(session){await client.rpc('revoke_current_session');await client.auth.signOut({scope:'local'});}if(browser)await browser.close();
 report.finished_at=new Date().toISOString();await writeFile(`${output}/result.json`,JSON.stringify(report,null,2)+'\n');
}
