import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
const source=(await readFile(new URL('../supabase/functions/intake-notifications/index.ts',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('Deno.serve(', 'export const handler = (');
const procedureSource=(await readFile(new URL('../src/procedureLabels.js',import.meta.url),'utf8')).replaceAll('export ', '');
const {code}=await transform('const admin=()=>globalThis.notificationTestDB;\n'+procedureSource+'\n'+source,{loader:'ts',format:'esm'});
const {handler}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('worker denies unauthenticated requests; missing provider leaves jobs unclaimed; retries share idempotency key',async()=>{
 const oldDeno=globalThis.Deno,oldFetch=globalThis.fetch;
 const env={NOTIFICATION_WORKER_SECRET:'test-secret'};
 globalThis.Deno={env:{get:key=>env[key]}};
 const writes=[]; let claims=0,fail=false;
 globalThis.notificationTestDB={rpc:async()=>{claims++;return {data:[{id:'job',intake_id:'intake',attempts:1}]};},from:table=>{const chain={select(){return chain;},single:async()=>({data:{completed_at:'2026-11-01T12:00:00Z',patient_id:null,full_name:'Paciente fictício',submitted_at:'2026-11-01T12:00:00Z'}}),update(value){writes.push({table,value});return chain;},eq(){return chain;},then(resolve){return Promise.resolve({error:null}).then(resolve);}};return chain;}};
 const request=()=>new Request('https://qa.invalid',{method:'POST',headers:{Authorization:'Bearer test-secret'}});
 try {
  assert.equal((await handler(new Request('https://qa.invalid',{method:'POST'}))).status,403);
  assert.equal((await handler(request())).status,503); assert.equal(claims,0);
  env.RESEND_API_KEY='fictional';env.EMAIL_FROM='teste@example.invalid';
  globalThis.fetch=async(url,options)=>{assert.equal(options.headers['Idempotency-Key'],'intake-intake');assert.deepEqual(JSON.parse(options.body).to,['suportesofiati@gmail.com','sofiatimendonca@gmail.com']);return Response.json({}, {status:fail?503:200});};
  assert.equal((await (await handler(request())).json()).sent,1);assert.equal(writes.at(-1).value.status,'sent');
  fail=true;assert.equal((await (await handler(request())).json()).sent,0);assert.equal(writes.at(-1).value.status,'failed');
  assert.equal(writes.some(x=>x.table==='public_intakes' && x.value),false);
 } finally {globalThis.Deno=oldDeno;globalThis.fetch=oldFetch;delete globalThis.notificationTestDB;}
});
