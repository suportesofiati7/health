# Security Runbook

This system handles sensitive clinical data. The default rule is simple: no real
patient data until Supabase Auth, database RLS, Edge Functions, Turnstile,
backups, and owner access are verified on the remote project.

## Access Model

- `owner`: full clinical access, staff administration, audit log, storage usage,
  exports, and recovery tools.
- `professional`: clinical patient records, documents, appointments, tasks, and
  exports.
- `reception`: administrative patients, appointments, tasks, and enquiries only.
- `readonly`: administrative read-only access only.

The browser never decides access by itself. Row-level security checks the current
Supabase user, active membership, session id, expiry, and revoked sessions.

## Data Boundaries

- Clinical entries, entry versions, document metadata, Storage objects,
  communications, and patient exports are owner/professional only.
- Reception can convert enquiries and manage administrative workflow but cannot
  read clinical record content.
- Finalized clinical entries are immutable. Corrections are new amendment
  entries.
- Patient deletion is intentionally absent. Retention and destruction decisions
  require clinic/legal review.
- Public preregistration stores only contact details and consent timestamp.

## Public Entry Controls

- Public intake uses Cloudflare Turnstile, a honeypot field, strict JSON fields,
  origin checks, hostname checks, and database-backed rate limits.
- Anonymous browsers cannot insert directly into Supabase tables.
- The intake function never returns record ids, duplicate signals, account state,
  or patient data.

## Files

- Browser clients cannot upload directly to Storage.
- The `files` Edge Function validates auth, role, patient access, size, declared
  MIME type, magic bytes, PDF active-content markers, SHA-256, deduplication, and
  storage quota before writing private Storage objects.
- Downloads are authorized by RLS and logged through `record_access`.

## Sessions

- Supabase JWT expiry is intended to be 900 seconds in production.
- The app polls active membership and signs out when membership status or role
  changes.
- `revoke_current_session()` records the current session id so logout invalidates
  an otherwise unexpired token for RLS-protected data.

## Secrets

Never commit or paste these values:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RATE_LIMIT_SALT`

The publishable Supabase key and Turnstile site key are browser-safe. They are
not authorization boundaries.

## Email Backup

Email backup sends encrypted JSON packets only. The passphrase is never sent.
Email acceptance is not proof of delivery and is not the only backup. Keep the
passphrase in a separate clinic-controlled location.

## Production Gates

- Supabase public signup disabled and verified.
- Anonymous sign-ins disabled and verified.
- All migrations applied, including `202609140003_validation_grants.sql`.
- Edge Functions deployed with secrets set.
- Cloudflare Pages private app deployed with no-cache, noindex headers.
- Turnstile site key and secret tested on the public hostname.
- Owner activation completed and local activation link deleted.
- Recovery drill completed with fictional data.
- Clinic approves LGPD notice, professional scope, retention practice, devices,
  staff training, and processor relationships.
