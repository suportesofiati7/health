import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliveryTracker, emailAccepted, sendEmail } from '../js/core/form-delivery.js';

test('only explicit FormSubmit confirmation counts as delivery', () => {
  for (const success of [true, 'true']) assert.equal(emailAccepted({ success }), true);
  for (const result of [null, {}, { success: false }, { success: 'false' }]) assert.equal(emailAccepted(result), false);
});

test('retry sends only failed channels; changed answers start a new submission', async () => {
  const track = deliveryTracker();
  let emails = 0, apps = 0;
  let deliver = track('answers');
  await deliver('email', async () => ++emails);
  await assert.rejects(deliver('app', async () => { apps++; throw Error('offline'); }));
  deliver = track('answers');
  assert.equal(deliver.has('email'), true);
  assert.equal(deliver.has('app'), false);
  await deliver('email', async () => ++emails);
  await deliver('app', async () => ++apps);
  assert.equal(emails, 1);
  assert.equal(apps, 2);
  await track('edited answers')('email', async () => ++emails);
  assert.equal(emails, 2);
});

test('HTTP 200 with HTML or a provider error is not a successful email', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const response of [new Response('<html>blocked</html>'), Response.json({ success: 'false' }), Response.json({ success: true }, { status: 503 })]) {
      globalThis.fetch = async () => response;
      await assert.rejects(sendEmail({ message: 'diagnostic' }));
    }
    globalThis.fetch = async () => Response.json({ success: 'true' });
    await sendEmail({ message: 'diagnostic' });
  } finally { globalThis.fetch = originalFetch; }
});
