import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from '../../node_modules/esbuild/lib/main.js';

// Execute the production Deno handler with mocked I/O; no hosted writes.
test('collector validates consent, minimizes data, rate limits and deduplicates retries', async () => {
  let handler, salt = 'fictional-test-salt', insertError = null;
  const inserts = [], limits = [];
  const oldDeno = globalThis.Deno;
  globalThis.Deno = { serve: value => { handler = value; }, env:{ get: () => salt } };
  globalThis.__waMocks = {
    endpoint: fn => fn,
    json: req => req.json(),
    reply: (_req, body, status=200) => Response.json(body, {status}),
    sha256: async () => 'hashed-test-bucket',
    limit: async (_db, key, max, seconds) => limits.push({key,max,seconds}),
    admin: () => ({ from: table => ({ insert: async values => { inserts.push({table,values}); return {error:insertError}; } }) }),
  };
  try {
    const source = (await readFile(new URL('../supabase/functions/whatsapp-click/index.ts', import.meta.url),'utf8'))
      .replace(/^import[^;]+;/, 'const { admin, endpoint, json, reply, sha256, limit } = globalThis.__waMocks;');
    const {code} = await transform(source,{loader:'ts',format:'esm'});
    await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    const id = '49000000-0000-4000-8000-000000000001';
    const call = body => handler(new Request('https://example.invalid/whatsapp-click', {method:'POST',body:JSON.stringify(body)}));
    assert.equal((await call({event_id:id,consent:false})).status,400);
    assert.equal((await call({event_id:id,consent:true,message:'must not store'})).status,400);
    assert.equal((await call({event_id:'not-a-uuid',consent:true})).status,400);
    assert.equal(inserts.length,0);
    salt = '';
    assert.equal((await call({event_id:id,consent:true})).status,503);
    salt = 'fictional-test-salt';
    assert.equal((await call({event_id:id,consent:true})).status,202);
    assert.deepEqual(inserts[0],{table:'whatsapp_widget_clicks',values:{event_id:id}});
    assert.deepEqual(limits[0],{key:'whatsapp:hashed-test-bucket',max:30,seconds:60});
    insertError = {code:'23505'};
    assert.equal((await call({event_id:id,consent:true})).status,202);
    insertError = {code:'42P01'};
    assert.equal((await call({event_id:id,consent:true})).status,503);
  } finally { globalThis.Deno = oldDeno; delete globalThis.__waMocks; }
});
