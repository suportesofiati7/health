import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
const original=await readFile(new URL('../supabase/functions/formulario/index.ts',import.meta.url),'utf8');
const source=original.replace(/^import .*;\n/gm,'').split('Deno.serve(')[0]+ '\nexport {completeSubmission,signUploadSession};';
const helpers=`const ORG='qa';const clean=(value,max)=>String(value??'').slice(0,max);const notifySupport=async()=>true;const reply=(req,data,status)=>({data,status});\n`;
const {code}=await transform(helpers+source,{loader:'ts',format:'esm'});
const {completeSubmission,signUploadSession}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
function fixture(info){
  const writes=[];
  const db={from(table){const chain={select(){return chain;},eq(){return chain;},update(value){writes.push({table,value});return chain;},insert(value){writes.push({table,value});return Promise.resolve({error:null});},async single(){return {data:{id:'intake',payload:{cpf:'52998224725',full_name:'QA'},status:'novo'},error:null};},async maybeSingle(){return {data:table==='patients'?{id:'patient'}:null,error:null};},then(resolve,reject){return Promise.resolve({error:null}).then(resolve,reject);}};return chain;},storage:{from:()=>({info:async()=>info})}};
  return {db,writes};
}
const session=await signUploadSession({intake_id:'intake',expires_at:Date.now()+60000,files:[{path:'qa/intake/file.pdf',size:42,kind:'identity',field:'identity_upload',name:'qa.pdf',type:'application/pdf'}]},'test-salt');
test('completed signed upload accepts current Storage info size and records the attachment before linking',async()=>{
  const {db,writes}=fixture({data:{size:42},error:null});
  const result=await completeSubmission(new Request('https://qa.invalid'),{session},db,'test-salt');
  assert.equal(result.status,202);assert.equal(result.data.attachments,1);
  assert.equal(writes[0].table,'public_intake_files');assert.equal(writes[0].value.size_bytes,42);
  assert.equal(writes[1].table,'public_intakes');assert.equal(writes[1].value.patient_id,'patient');
});
test('incomplete or wrong-sized uploads never link the patient or save attachment metadata',async()=>{
  for(const info of [{data:{size:41},error:null},{data:null,error:{message:'not found'}}]){
    const {db,writes}=fixture(info);await assert.rejects(()=>completeSubmission(new Request('https://qa.invalid'),{session},db,'test-salt'),/upload/);assert.deepEqual(writes,[]);
  }
});
