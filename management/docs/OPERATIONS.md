# Operations Runbook

Status on 2026-09-14: local build and tests pass. Remote Supabase administrative
configuration is blocked in this terminal because no Supabase access token is
available. A publishable settings check still reports `disable_signup: false`,
so real patient data must wait.

## Required Origins

- Public site: `https://francielesofiati.com`
- Private app: `https://profissional.francielesofiati.com`
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
export MANAGEMENT_ORIGIN=https://profissional.francielesofiati.com
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
  MANAGEMENT_ORIGIN=https://profissional.francielesofiati.com \
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
- Remote migrations, owner bootstrap, function secrets, function deploys,
  Turnstile hostname verification, and remote fictional-data tests remain
  unevidenced here.
- Legal/professional scope, LGPD notices, processor review, and secure clinic
  device procedures still require clinic approval.
