# Operations Runbook

Status on 2026-09-14: local build, browser checks and database security tests pass. Remote Supabase administrative
configuration is blocked in this terminal because no Supabase access token is
available. A publishable settings check still reports `disable_signup: false`,
so real patient data must wait.

## Required Origins

- Public site: `https://francielesofiati.com`
- Private app: `https://app.francielesofiati.com`
- Supabase project ref: `naypgbhwnlbyqqqfftgn`
- Organization id: `a783bd4c-f253-4a94-9365-75c6f1000001`

Use exact origins, no trailing paths, when setting Supabase Auth URLs and Edge
Function secrets.

## Local Checks

```bash
cd management
npm test
npm run test:db
npm run build
```

For browser checks:

```bash
cd management
npm run dev
MANAGEMENT_TEST_URL=http://127.0.0.1:5173 npm run test:browser
```

If the dev server selects another port, use that URL for
`MANAGEMENT_TEST_URL`.

## Supabase Configuration

Keep all secret values out of git and chat. Use a local shell, a password
manager, or the Supabase dashboard.

Required local variables for the configuration scripts:

```bash
export MANAGEMENT_ORIGIN=https://app.francielesofiati.com
export PUBLIC_ORIGIN=https://francielesofiati.com
export SUPABASE_ACCESS_TOKEN=...
export SUPABASE_SERVICE_ROLE_KEY=...
```

The access token may also come from `npx supabase login`. The service-role key
is needed only for owner bootstrap.

Run a read-only project check first:

```bash
cd management
npm run configure
```

After reviewing the output, apply Auth settings and unapplied migrations:

```bash
npm run configure -- --apply
```

This sets public signup off, anonymous sign-ins off, 15 minute JWT expiry, 12
character minimum passwords, and applies `supabase/migrations/*.sql`.

## Edge Functions

Set function secrets in Supabase before deployment:

```bash
npx supabase secrets set \
  MANAGEMENT_ORIGIN=https://app.francielesofiati.com \
  PUBLIC_ORIGIN=https://francielesofiati.com \
  TURNSTILE_SECRET_KEY=... \
  RATE_LIMIT_SALT=... \
  EMAIL_BACKUP_ENABLED=false \
  --project-ref naypgbhwnlbyqqqfftgn
```

Use a high-entropy random value for `RATE_LIMIT_SALT`. Change
`EMAIL_BACKUP_ENABLED` to `true` only after the clinic accepts the FormSubmit
encrypted-packet behavior and completes a recovery drill.

Deploy functions:

```bash
bash scripts/deploy-functions.sh
```

## Public Preregistration

Create a free Cloudflare Turnstile widget for the public hostname. Put the site
key in `management/public-entry-config.js` for the public static page. The
private Vite app may also receive `VITE_TURNSTILE_SITE_KEY` at build time if its
internal preregistration route is used.

The public form must remain write-only. The intake function returns only
`{ "received": true }` and must not reveal duplicate, record, or account state.

## Owner Bootstrap

After migrations and Auth settings are applied:

```bash
cd management
npm run bootstrap
```

The activation or recovery link is written to
`~/.local/state/sofiati/owner-activation.txt` with file mode `0600`. Open it in a
private browser, set the owner password, verify the owner membership, then
delete the file.

## Cloudflare Pages

Build command:

```bash
npm run build
```

Build directory:

```text
management/dist
```

Attach the private domain only to the management Pages project. Do not point the
public site deployment at `management/dist`.

## Remote Smoke Test

Before real patient data:

- Confirm `disable_signup: true` in Supabase Auth settings.
- Confirm the migrations table shows all migration versions through
  `202609140003`.
- Confirm Edge Function secrets are set and functions deploy successfully.
- Activate the owner with a one-time link and delete the local link file.
- Use fictional data to create a patient, appointment, task, clinical draft,
  finalized entry, file upload, export, and recovery-opened backup.
- Verify reception can see administrative data but not clinical entries,
  documents, or exports.
- Verify preregistration works from the public hostname with Turnstile.

## Remaining Blockers

- No Supabase admin credentials are available in this terminal.
- Public signup is still reported as enabled by the publishable settings endpoint.
- Remote migrations through `202609140004_clinical_workflows.sql`, owner bootstrap, function secrets, function deploys,
  Turnstile hostname verification, and remote fictional-data tests remain
  unevidenced here.
- Legal/professional scope, LGPD notices, processor review, and secure clinic
  device procedures still require clinic approval.

## Clinical workflow additions

Migration `202609140004_clinical_workflows.sql` adds the owner-managed procedure
catalogue (seeded only from procedures found in the existing public site/form),
products/lots/devices, treatment plans, traceable attendances, private clinical
photo metadata, versioned consent references, follow-ups, adverse events and
privacy requests. The local test harness proves the new catalogue and follow-up
RLS paths, while clinical event tables remain restricted to OWNER/PROFESSIONAL.

The migration is additive. Apply it with the versioned configuration script;
do not paste it into a production SQL editor piecemeal. Photo binaries must be
uploaded through a server-side validating function before a `clinical_photos`
row is created; the private bucket and read policy are already declared.

## Form notification outbox (2026-11-01)

`formulario` confirms storage and calls the service-only atomic association RPC.
The database queues one notification per linked submission. Email delivery never
runs inside the public submission request. The `intake-notifications` worker
claims leased jobs and records attempts, failures and provider acceptance.

Set `RESEND_API_KEY` and `EMAIL_FROM` to a Resend key and an authorized sender on
a verified domain. These credentials are also used by `communication-email`.
Never commit them. The sender must be approved in the provider account; the code
cannot create that account authorization. Recipient inbox delivery must be
checked separately from provider acceptance.

After deploying the worker, run `python3 scripts/configure-notification-worker.py`
to configure its dedicated bearer secret in Edge Functions and Vault, enable
`pg_net`, and install the minute-based `pg_cron` job. The script rotates the
worker secret and never prints it. It requires Supabase CLI administrative login.
Re-running is safe; execute it without concurrent runs. Backend sync includes
worker deployment; scheduler setup is a separate administrative operation.

Without provider configuration the worker returns 503 **before claiming jobs**;
submissions remain safely queued. Jobs use a five-minute lease, exponential
backoff capped at one hour, and at most twelve attempts. Provider requests use
one idempotency key per submission. Automatic attempts stay inside Resend's
24-hour idempotency window. Do not manually reset old uncertain deliveries
without checking provider logs; an acceptance followed by a failed database
update can otherwise become a duplicate after that window.

No documents or detailed clinical declarations are attached to ordinary email.
The summary links to the authenticated application. Staff can open a completed
form and print/save a PDF from Arquivos. Uploaded bytes remain in private buckets.

Inspect `public.intake_notification_outbox` using an administrative connection for
pending/failed jobs and `cron.job_run_details` for scheduler execution. That table
has RLS enabled and no anonymous or regular staff grants. Existing historical
submissions are not mailed automatically during migration.

Validate an exported bundle locally with
`python3 scripts/validate-fhir.py /secure/path/paciente-fhir.json`.
This downloads only the official schema; it sends no patient data. JSON schema
validation does not replace profile, terminology or full FHIR invariant checks.
Read `FORM-FIELD-MAP.md` and `PATIENT-ECOSYSTEM-AUDIT-2026-11-01.md` for scope and
remaining verification requirements.
