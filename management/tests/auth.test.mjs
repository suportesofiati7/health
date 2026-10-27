import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, authCallback, acceptAuthCallback, authErrorMessage } from '../src/auth.js';
const t = (pt, en) => en;

test('professional email normalization', () => {
  assert.equal(normalizeEmail('  SUPPORT@Example.com  '), 'support@example.com');
});

test('query-token and implicit recovery links work and are removed from history', async () => {
  const calls = [];
  const auth = {
    verifyOtp: async (body) => { calls.push(body); return {}; },
    setSession: async (body) => { calls.push(body); return {}; }
  };
  let callback = authCallback('https://clinic.invalid/?token_hash=secret&type=recovery&lang=en');
  assert.equal(callback.cleanUrl, '/?lang=en');
  assert.equal(await acceptAuthCallback(auth, callback), 'recovery');
  assert.deepEqual(calls[0], { token_hash: 'secret', type: 'recovery' });
  callback = authCallback('https://clinic.invalid/#access_token=access&refresh_token=refresh&type=invite&expires_in=900');
  assert.equal(callback.cleanUrl, '/');
  assert.equal(await acceptAuthCallback(auth, callback), 'invite');
  assert.deepEqual(calls[1], { access_token: 'access', refresh_token: 'refresh' });
});

test('PKCE callback is exchanged and opens password setup', async () => {
  let code;
  const callback = authCallback('https://clinic.invalid/?code=private-code');
  const mode = await acceptAuthCallback({ exchangeCodeForSession: async value => { code = value; return {}; } }, callback);
  assert.equal(code, 'private-code');
  assert.equal(mode, 'setup');
  assert.equal(callback.cleanUrl, '/');
});

test('expired, malformed and failed callbacks cannot enter password setup', async () => {
  await assert.rejects(acceptAuthCallback({}, authCallback('https://clinic.invalid/#error_code=otp_expired')), { code: 'otp_expired' });
  await assert.rejects(acceptAuthCallback({}, authCallback('https://clinic.invalid/#access_token=missing-refresh&type=invite')), { code: 'callback_invalid' });
  await assert.rejects(acceptAuthCallback({ verifyOtp: async () => ({ error: { code: 'otp_expired' } }) }, authCallback('https://clinic.invalid/?token_hash=expired&type=recovery')), { code: 'otp_expired' });
  assert.equal(await acceptAuthCallback({}, authCallback('https://clinic.invalid/')), false);
});

test('credential errors differ from outages, access restrictions and throttling', () => {
  assert.match(authErrorMessage({code:'invalid_credentials'}, t), /Incorrect email/);
  assert.match(authErrorMessage({code:'credentials'}, t, true), /Incorrect CPF/);
  assert.match(authErrorMessage({code:'portal_unavailable'}, t, true), /service is unavailable/);
  assert.match(authErrorMessage({code:'membership_required'}, t), /no active clinic access/);
  assert.match(authErrorMessage({status:429}, t), /Too many attempts/);
  assert.match(authErrorMessage({code:'unexpected', status:503}, t), /service is unavailable/);
});
