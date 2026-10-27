# Form delivery investigation — 2026-10-27

## Live observations

- `https://francielesofiati.com/formulario` loads and runs its separate public-intake controller.
- The Portuguese footer rendered “Forma” and linked to `/en/form.html`.
- The public Supabase `formulario` endpoint answered OPTIONS with the correct public-site CORS origin.
- Two deliberately invalid, no-record POST probes returned `{"error":"request_failed"}` instead of an actionable validation error. These probes do not establish whether a complete valid submission can be saved. No patient record or live email was intentionally created during this investigation.
- Supabase CLI function discovery returned HTTP 403: the connected account lacks privileges. Function logs, remote configuration, database state, and backend deployment could not be inspected or changed. The underlying live app failure remains unconfirmed.

## Code findings and changes

- General contact forms coupled email and app delivery with `Promise.all`; an app error could report total failure after email succeeded. Delivery now settles independently and reports partial completion.
- The separate interest controller attempted email only after the app returned 202. It now attempts both destinations independently, validates required fields, and does not block email on an unavailable Turnstile challenge.
- The clinical controller attempted only the app endpoint. It now sends completed answers directly to FormSubmit if the app or its server-side email delivery fails.
- Clinical server email previously included only a summary. It now includes completed text answers, excludes security tokens, and retains private file storage in the app. Email lists attachment names; it does not attach file contents.
- FormSubmit responses must explicitly confirm `success: true` or `success: "true"`. False strings, missing confirmation, and HTML responses are failures. Provider acceptance does not prove inbox receipt.
- Confirmed channels are cached for retries of unchanged answers in the same open page. The clinical retry tells the updated backend when email was already confirmed. Reloading, editing answers, or an ambiguous network timeout can still produce duplicates; this is not persistent server-side idempotency.
- Added bounded network waits; fixed Turnstile widget ID 0 handling and token polling cleanup.
- Footer now shows “Formulário” linking to the Portuguese form, and “Form” for English. Corrected the translation memory and glossary to prevent regeneration of “Forma”.
- Production packaging now includes both standalone controllers and their shared delivery module.

## Verification

- `node --test tests/form-delivery.test.mjs`: 3 passed.
- Local Playwright checks with intercepted delivery endpoints: clinical app failure + retry, email failure + retry, and full success; general contact app failure + retry; interest app failure + retry; English and Portuguese footer links and labels passed.
- `npm run check:assets`: passed.
- `npm run check:analytics`: passed (178 pages, 149 forms).
- `git diff --check`: passed.
- All three JavaScript entry points bundled successfully with esbuild; the Edge Function TypeScript syntax check passed.
- The full production build was stopped during the unrelated site-wide image optimization step; no complete production build is claimed. The live public project deploys the static source without a build.
- `npm run check:pt`: 621 errors, 1 warning. A separate baseline view using the original tracked files returned the identical count, so the site-wide parity failures precede this change.

## Rollout still required

Publish the changed static files through the public site's existing Cloudflare deployment and deploy the updated `formulario` function to project `naypgbhwnlbyqqqfftgn`. The current Supabase account needs the appropriate project privileges to inspect logs and deploy. This work has not been published.

After rollout, submit an explicitly identified test from the live site, confirm the record in the management app's received-forms queue, and confirm the complete email in `suportesofiati@gmail.com`. If FormSubmit requests recipient activation, complete it from that mailbox. Inbox delivery and activation status were not verified here.
