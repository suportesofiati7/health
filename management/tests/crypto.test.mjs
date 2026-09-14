import test from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt, encryptPackets, decryptPackets } from '../src/crypto.js';
test('encrypted export round trip preserves long clinical text, Unicode and attachments',async()=>{
  const original={format:'sofiati-patient-v1',tables:{entries:[{content:'FICTÍCIO: evolução clínica. '.repeat(1000)}]},files:[{name:'fictional.pdf',base64:'JVBERi0xLjQ='}]};
  const packet=await encrypt(original,'fictional recovery phrase 123');
  assert.equal(JSON.stringify(packet).includes('FICTÍCIO'),false);
  assert.deepEqual(await decrypt(packet,'fictional recovery phrase 123'),original);
  await assert.rejects(decrypt(packet,'incorrect recovery phrase'));
  const tampered={...packet,ciphertext:(packet.ciphertext[0]==='A'?'B':'A')+packet.ciphertext.slice(1)};
  await assert.rejects(decrypt(tampered,'fictional recovery phrase 123'));
});
test('exports use distinct salt/nonce and reject weak passphrases',async()=>{
  await assert.rejects(encrypt({},'short'));
  const a=await encrypt({a:1},'fictional recovery phrase 123'),b=await encrypt({a:1},'fictional recovery phrase 123');
  assert.notEqual(a.salt,b.salt);assert.notEqual(a.iv,b.iv);assert.notEqual(a.ciphertext,b.ciphertext);
});
test('multipart email backup restores out of order and rejects missing or duplicated parts',async()=>{
  const original={format:'sofiati-patient-v1',content:'FICTÍCIO, evolução clínica. '.repeat(60)};
  const packets=await encryptPackets(original,'fictional recovery phrase 123',1000);
  assert(packets.length>1);
  assert.deepEqual(await decryptPackets([...packets].reverse(),'fictional recovery phrase 123'),original);
  await assert.rejects(decryptPackets(packets.slice(1),'fictional recovery phrase 123'));
  await assert.rejects(decryptPackets(packets.map(()=>packets[0]),'fictional recovery phrase 123'));
});
