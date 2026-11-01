import test from 'node:test';
import assert from 'node:assert/strict';
import { isDataMutation, publishDataChange, DATA_CHANGED } from '../src/dataSync.js';
test('writes invalidate data while ordinary reads and access auditing do not reload views', () => {
  for (const method of ['GET','HEAD']) assert.equal(isDataMutation({method,url:new URL('https://qa.invalid/rest/v1/patients')}),false);
  for (const method of ['POST','PATCH','DELETE']) assert.equal(isDataMutation({method,url:new URL('https://qa.invalid/rest/v1/consents')}),true);
  for (const name of ['save_appointment_series','record_clinical_procedure','save_treatment_plan','schedule_treatment_plan']) assert.equal(isDataMutation({method:'POST',url:new URL(`https://qa.invalid/rest/v1/rpc/${name}`)}),true);
  for (const name of ['record_access','storage_usage','generate_action_centre_tasks','can_patient_operation']) assert.equal(isDataMutation({method:'POST',url:new URL(`https://qa.invalid/rest/v1/rpc/${name}`)}),false);
});
test('refresh messages carry no clinical data and work without a browser', () => {
  assert.doesNotThrow(publishDataChange);
  const previousWindow=globalThis.window, previousChannel=globalThis.BroadcastChannel;
  const target=new EventTarget();let changes=0,posted;
  target.addEventListener(DATA_CHANGED,()=>changes++);
  globalThis.window=target;globalThis.BroadcastChannel=class {postMessage(message){posted=message;}close(){}};
  try{publishDataChange();assert.equal(changes,1);assert.equal(posted,'committed');}finally{globalThis.window=previousWindow;globalThis.BroadcastChannel=previousChannel;}
});
