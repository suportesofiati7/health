import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import { createHash } from 'node:crypto';
const original=await readFile(new URL('../supabase/functions/formulario/index.ts',import.meta.url),'utf8');
const source=original.replace(/^import .*;\n/gm,'').split('Deno.serve(')[0]+ '\nexport {completeSubmission,signUploadSession,validatePayload};';
const helpers=`const ORG='qa';const clean=(value,max)=>String(value??'').slice(0,max);const sha256=async(bytes)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');const reply=(req,data,status)=>({data,status});\n`;
const {code}=await transform(helpers+source,{loader:'ts',format:'esm'});
const {completeSubmission,signUploadSession,validatePayload}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const bytes=Buffer.from('%PDF-1.4\n% fictional evidence\n%%EOF');
const hash=createHash('sha256').update(bytes).digest('hex');
function fixture(content=bytes, completed=false){
 const writes=[];
 const db={async rpc(name,args){writes.push({table:name,value:args});return {error:null};},from(table){const chain={select(){return chain;},eq(){return chain;},async single(){return {data:{id:'intake',payload:{cpf:'52998224725'},completed_at:completed?'2026-11-02':null}};},async upsert(value){writes.push({table,value});return {error:null};}};return chain;},storage:{from:()=>({download:async()=>content?{data:new Blob([content])}:{error:{message:'missing'}}})}};
 return {db,writes};
}
const session=await signUploadSession({intake_id:'intake',expires_at:Date.now()+60000,files:[{path:'qa/intake/0',size:bytes.length,sha256:hash,kind:'identity',field:'identity_upload',name:'qa.pdf',type:'application/pdf'}]},'test-salt');
test('completion verifies private bytes and checksum, then completes once without creating a patient or revealing identifiers',async()=>{
 const {db,writes}=fixture();const result=await completeSubmission(new Request('https://qa.invalid'),{session},db,'test-salt');
 assert.deepEqual(result,{status:202,data:{received:true,attachments:1}});
 assert.equal(writes[0].value.sha256,hash);assert.equal(writes[1].table,'complete_public_form');
 assert.equal(writes.some(w=>w.table==='associate_completed_form'),false);
 const retry=fixture(bytes,true);await completeSubmission(new Request('https://qa.invalid'),{session},retry.db,'test-salt');assert.deepEqual(retry.writes,[]);
});
test('missing, truncated and same-size corrupted bytes cannot complete the form',async()=>{
 for(const content of [null,bytes.subarray(1),Buffer.alloc(bytes.length,65)]){
  const {db,writes}=fixture(content);await assert.rejects(()=>completeSubmission(new Request('https://qa.invalid'),{session},db,'test-salt'),/upload|file_checksum/);assert.deepEqual(writes,[]);
 }
});
const valid={full_name:'Pessoa fictícia',cpf:'52998224725',form_version:'2026-11-02',signature_name:'Pessoa fictícia',signature_method:'typed_name',adult_status:'adult',selected_procedures:['toxina'],accepted_term_toxina:'yes',technical_image_authorisation:'no',promotional_communication:'no',marketing_image_authorisation:'no'};
for(const k of ['initial_acknowledgement','booking_fee_acknowledgement','general_risk_acknowledgement','truth_declaration','marketing_revocation_acknowledgement','lgpd_personal_data_consent','lgpd_sensitive_data_consent','final_acceptance'])valid[k]='yes';
test('server validates signatures, CPF checksums, conditional guardians, dates, explicit refusals and procedure terms',()=>{
 validatePayload({...valid});
 for(const changes of [{signature_name:''},{cpf:'52998224724'},{adult_status:'minor_or_guardian'},{selected_procedures:[]},{marketing_image_authorisation:''},{birth_date:'2026-02-31'},{appointment_time:'25:00'},{full_name:'x'.repeat(201)},{accepted_term_toxina:'no'},{marketing_revocation_acknowledgement:'no'}])assert.throws(()=>validatePayload({...valid,...changes}));
 validatePayload({...valid,adult_status:'minor_or_guardian',guardian_details:'Responsável fictício'});
});
