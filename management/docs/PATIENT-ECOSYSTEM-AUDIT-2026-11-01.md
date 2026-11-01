# Patient ecosystem audit — 1 November 2026

Status: implemented repairs and verified local workflows; production email delivery is **not complete**. This report does not certify that every screen or every historical record has been manually reviewed.

## Root causes and repairs

| Finding | Repair |
|---|---|
| Form notifications used an inline FormSubmit request; converted status was incorrectly treated as evidence of email delivery. No durable retry queue existed. | Removed email delivery from `formulario`. A database outbox queues after association; a separate authenticated worker leases jobs, uses provider idempotency keys, retries, and records failures/acceptance. Both required recipients are fixed in the worker. |
| Patient creation, association and timeline evidence were separate writes and could race. Automatic association also populated human review timestamps. | Service-only `associate_completed_form` uses row and CPF advisory locks and a transaction. One marker per submission; existing patients and prior submissions remain intact. Automatic association does not mark professional review. |
| General health text was copied into both allergies and conditions in the initial assessment. | `intakeDefaults` keeps it in other health declarations. No diagnosis, allergy or medication is inferred. Latest submitted form prefills an unopened initial assessment; existing saved assessment data takes precedence. |
| Patient form history was an unpaginated query; documents used original upload names. | Paginated history; readable original answers; printable completed form; display names based on actual upload field, patient and date. Original names and storage paths are retained. |
| Consent values and health-history keys appeared as technical labels; clinical acceptance was labelled as email-provider acceptance. | Portuguese labels for all known form fields, consent choices, health-history fields, upload categories and clinical acceptance. Original database/API keys remain unchanged. |
| FHIR included only three resource types, omitted required relationships, and used unpaginated reads. | FHIR R4 graph includes Patient, Appointment participants, Procedure subjects, QuestionnaireResponse, Consent, Provenance, CarePlan and DocumentReference. Paginated application loader also retrieves clinical histories and relational treatment data. A second JSON export preserves application-specific records and metadata. |

## Field and document coverage

See [FORM-FIELD-MAP.md](FORM-FIELD-MAP.md) for every named static field, derived metadata and runtime fields. The original 21-section form was not redesigned. Scalar answers remain in `public_intakes.payload`; binary uploads remain in `intake-private` with `public_intake_files` metadata.

The real local submission test round-trips 51 scalar/structured answers and four upload classifications. It verifies repeated completion, subsequent submission with the same CPF, preservation of the original payload, private bytes, and anonymous access rejection. Synthetic local records are intentionally retained for inspection.

The current form does not collect a handwritten signature or separately structured allergies/medications. Checkbox acceptance and consent choices are preserved as submitted evidence. Free-text health notes are presented as patient declarations, not professional findings. No signature or structured clinical fact is fabricated.

Document names are computed for existing and future files only when field/category metadata supports classification. Unknown categories retain the original name. No stored filename, extension, object path or original metadata is renamed. Files remain subject to existing authenticated storage policies.

## Database and production configuration

- `202611010009_intake_notification_outbox.sql`: RLS-protected outbox, unique submission key, queue trigger and service-only claim RPC.
- `202611010010_atomic_form_association.sql`: service-only atomic patient association and clinical submission marker.
- Scheduler setup: `pg_net` extension, dedicated worker secret in Vault/Edge secrets, private dispatcher and minute-based `pg_cron` job. Setup script prints no secret values.
- No RLS policy was disabled. No legitimate patient history or storage object was deleted. No historical email backfill was performed.
- Production query found **zero `public_intakes` records** at audit time. Existing-patient form backfill could therefore not be verified against historical submissions in this project.
- Production secret-name inspection confirmed **`RESEND_API_KEY` and `EMAIL_FROM` are absent**. The worker returns 503 before claiming jobs until those are configured. Do not report emails as delivered.

## Verification

| Check | Result |
|---|---|
| Management unit tests | 36 passed, including upload ordering, naming, declaration defaults, FHIR relationships and worker authorization/failure behavior. |
| Full local PostgreSQL migration/security/workflow suite | Passed, including outbox retry uniqueness, lease exclusion, failure isolation, association idempotency and no automatic review timestamp. |
| Real local Supabase form workflow | Passed: 51 answers, four private upload fields, one patient across resubmission, original payload retained, one queued job per completion. |
| Real local application FHIR loader | Passed: both historical submissions, uploaded-document metadata, consent decisions and clinical markers retrieved. |
| Official HL7 R4 JSON schema | Zero schema errors on both an 11-resource fixture and the bundle produced from the local Supabase test. Validation runs locally; no patient data uploaded. |
| Real local clinical integration | Passed: versioned consultation/health history, clinical consent enforcement, uploads, procedure finalization, returns, plan scheduling, portal, payments and photo history/deletion. |
| Public form delivery unit tests | 5 passed. |
| Public form browser scenarios | Passed: saved, prepare failure, upload retry and older browser fallback. |
| CSP/printing/date/identity/consent regression suite | Passed. |
| Browser suite | Passed at desktop, tablet and mobile, with 16 responsive widths checked. |
| Production rollback smoke test | Passed; all fictional writes rolled back. |
| Production email receipt in both inboxes | Blocked by missing provider credentials and authorized sender; not tested. |

Initial failures were investigated: the isolated local clinical stack had an older procedure RPC, and accumulated fictional patients moved the current test patient beyond the first list page. The stack RPC was synchronized and the integration test now explicitly searches for its fixture. Browser runs during Vite source edits were interrupted by reloads; final results must be taken from a run without concurrent application edits.

## FHIR and export limits

Specification: [HL7 FHIR R4 / 4.0.1](https://hl7.org/fhir/R4/). Validation schema: [official JSON schema archive](https://hl7.org/fhir/R4/fhir.schema.json.zip). JSON schema validation checks structure; full terminology, implementation-guide/profile and FHIRPath invariant certification has not been run.

Clinical narrative and original patient responses remain narrative/QuestionnaireResponse resources. They are not converted into coded diagnoses, AllergyIntolerance or medication orders without reliable structured source semantics. App-specific treatment settings, versions, product usage, privacy requests and storage references remain in the complementary export. Binary uploaded documents are not embedded in the FHIR file; staff retrieve them through authenticated application storage. Print/save-PDF generation occurs in the authenticated browser and is not attached to ordinary email.

Both exports are sensitive local downloads. Browser policies may require allowing the second download. Database access audit is recorded before files are downloaded.

## Remaining requirements before claiming the master goal complete

1. Configure the existing provider integration with `RESEND_API_KEY` and a verified `EMAIL_FROM`; confirm acceptance and actual delivery to both requested inboxes using an authorized fictional production submission. Never paste credentials into chat or commit them.
2. Verify historical production forms if they exist in another environment/project. No historical public intakes were available in the connected production project.
3. Full official FHIR validator/terminology validation, specialist review of coded-resource mappings, and exhaustive manual review of every application screen remain outside the verified evidence above. The export intentionally documents unstructured/app-specific data rather than fabricating coded facts.
4. When association fails, the completed protected submission is preserved and staff can resolve it in Forms. Automatic retry of patient association itself is not implemented; email cannot be queued until association succeeds.
5. Permanent PDF archival/signature-certificate generation and generic persisted renaming of unrelated existing professional uploads are not implemented. The delivered PDF is browser-generated; intake display names use reliable metadata only.

## Files changed

Application: `src/main.jsx`, `src/fhirExport.js`, `src/intakeDefaults.js`, `src/intakePresentation.js`, `src/procedureLabels.js`, `src/clinicalText.js`, `src/i18n.js`, `src/public-intake-labels.json`.

Backend: `supabase/functions/formulario/index.ts`, `supabase/functions/intake-notifications/index.ts`, migrations `202611010009` and `202611010010`, `supabase/config.toml`.

Operations: `scripts/sync-backend.sh`, `scripts/configure-notification-worker.py`, `scripts/validate-fhir.py`, `package.json`, `docs/OPERATIONS.md`, field map and this report.

Tests: `tests/intake-upload.test.mjs`, `tests/intake-ecosystem.test.mjs`, `tests/intake-local.mjs`, `tests/notification-worker.test.mjs`, `tests/workflow-integrity.sql`, `tests/integration-local.mjs`, `tests/browser.mjs`, `tests/production-intake-smoke.sql`.

## Publication evidence

Backend migrations through `202611010010` were applied to the linked production project, migration parity was confirmed, and all Edge Functions were synchronized. The production scheduler is active. The production application and its five referenced JS/CSS assets returned HTTP 200; unauthenticated worker invocation returned 403. Both rollback smoke suites passed in production, including the new association/outbox test.

The final management build was deployed to the Cloudflare `app` production project. Source changes are committed and pushed separately from the backend migration and static deployment. Provider credentials remain the material blocker to end-to-end email delivery.
