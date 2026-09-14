# Recovery Runbook

The recovery plan has two layers: patient-level encrypted exports from the app
and project-level operational backups outside the repository. Supabase Free
backups do not replace clinic-owned recovery drills, and database backups do not
contain Storage binaries.

## Patient Export

From a patient profile, owner/professional users can prepare an encrypted export.
The export includes:

- patient identity and administrative fields
- clinical entries and version snapshots
- appointments, tasks, document metadata, and communications
- private files with SHA-256 integrity checks

The app encrypts the export in the browser with AES-GCM and a passphrase of at
least 16 characters. Large exports are split into numbered encrypted parts.

## Storage Rules

- Download every numbered part shown by the export dialog.
- Store the passphrase separately from the encrypted files.
- Do not place unencrypted exports, database dumps, or patient files inside the
  repository.
- The local `.gitignore` excludes `management/backups/`, `*.dump`, and
  `*.encrypted.json` as a last-resort guard, not as a security control.

## Email Backup

If `EMAIL_BACKUP_ENABLED=true`, the app can send the encrypted packet parts to
`suportesofiati@gmail.com` through the `email-backup` function. Plain clinical
content and the passphrase are not sent.

Treat email as a convenience copy only. A successful send means the provider
accepted the request, not that recovery is guaranteed.

## Opening a Backup

Owner users can open encrypted backup files in:

```text
Configuracoes -> Armazenamento e recuperacao -> Abrir backup criptografado
```

Select all numbered parts, enter the passphrase, and open the printable report.
Recovered attachments can be downloaded individually. Opening a backup does not
write anything back to Supabase.

## Monthly Drill

Run this drill with fictional data before production and at least monthly:

- Create a fictional patient with one finalized clinical entry and one attachment.
- Export the patient and save all encrypted parts.
- Store the passphrase separately.
- Open the backup in the recovery screen.
- Print or save the report to PDF.
- Download the recovered attachment.
- Confirm the attachment hash matches the original if the original is available.
- Record date, operator, result, and corrective actions outside this repo.

## Project-Level Recovery

Use Supabase dashboard or CLI access to maintain database dumps and deployment
metadata outside the repository. Store any dump encrypted at rest.

Minimum recovery inventory:

- Supabase project ref and organization id
- migration files from `management/supabase/migrations/`
- Edge Function source from `management/supabase/functions/`
- Cloudflare Pages project settings and domain mapping
- Turnstile widget hostname settings
- current owner account and recovery contact
- latest encrypted database dump if the clinic chooses to maintain one
- separate Storage export or patient-level encrypted exports for files

## Lost Passphrase

Patient-level encrypted exports cannot be decrypted without the passphrase. If a
passphrase is lost, create a new export from the live system while access still
exists and retire the unusable packet set.
