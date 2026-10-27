import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliveryTracker, emailAccepted, sendEmail, fetchWithTimeout, intakeErrorMessage } from '../js/core/form-delivery.js';

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


test('delivery works without AbortSignal.timeout and aborts slow requests', async () => {
  const originalFetch = globalThis.fetch;
  const timeout = AbortSignal.timeout;
  try {
    AbortSignal.timeout = undefined;
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.signal instanceof AbortSignal, true);
      return Response.json({ success: 'true' });
    };
    await sendEmail({ message: 'fixture' });
    globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('timeout'), { name: 'AbortError' })));
    });
    await assert.rejects(fetchWithTimeout('https://fixture.invalid', {}, 5), { name: 'AbortError' });
  } finally { globalThis.fetch = originalFetch; AbortSignal.timeout = timeout; }
});

test('validation errors remain actionable in both languages', () => {
  assert.match(intakeErrorMessage({ code: 'cpf' }), /11 dígitos/);
  assert.match(intakeErrorMessage({ code: 'cpf' }, true), /11 digits/);
  assert.match(intakeErrorMessage({ code: 'rate_limit' }), /Aguarde/);
});
