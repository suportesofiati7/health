# Intake repair release — 2 November 2026

Implemented the review-first workflow in `INTAKE-COMPLETION-PLAN.md`. This report distinguishes tested behavior from pending external delivery evidence.

## Repairs

- Public form: explicit adult/guardian and communication choices, typed-name electronic acceptance, selected-procedure terms, original term text snapshots and file hashes. Server checks CPF digits/checksums, dates, selected consent terms, required acknowledgements, field/payload bounds and permitted document/photo formats. General health declarations remain unstructured declarations.
- Resumable persistence: unique request identifier and comparison of original payload/manifest; deterministic object paths; verified reuse of previously uploaded bytes; final metadata/completion/outbox transition protected by a transaction. Completion responses reveal no patient identifiers.
- Forms: completed submissions await review; historical records remain visible; the full original answers are grouped into 21 review sections with Portuguese labels. Fixed empty-CPF search matching all records, cancellation timing in the linking test and stale attachment/duplicate responses when changing forms.
- Patient conversion: explicit reviewer action, transactional locks, same-CPF duplicate rejection with explicit existing-patient linking, preserved historical answers, one source marker per submission, source-linked health declarations, consent/signature evidence and contact preferences. Receipts and scheduling preferences remain evidence rather than fabricated confirmed payments or appointments.
- Notifications: completion queues once before conversion; worker no longer requires a patient link. Provider retries remain independent of patient operations and stop for administrative review outside the safe idempotency window.
- Production harness: real browser/Auth/Edge/DB/Storage, retained fictional records, actual QA login, clinic-owner creation and software-owner linking, automatic QA membership deactivation. Removed all prior deletion and owner-impersonation behavior.
- Release checks: repaired obsolete public test assumptions and the terms page's missing analytics attributes without enabling analytics on sensitive intake fields.

## Verified before publication

- 38 unit tests; full ephemeral PostgreSQL migrations/security/workflow tests, including the new completion/immutability/review-first conversion cases.
- Professional browser suite at desktop/tablet/mobile and 16 responsive widths; public interaction, workflow and printing/date/identity regressions.
- Real isolated Supabase integration: clinical saves, versions, consent, private files, portal isolation, scheduling and concurrent financial/booking operations.
- Real isolated intake API round-trip and original-form export; complete browser journey through public submission, review, cancellation, new patient creation, reload, documents and second-form linking. Exact answer comparison, attachment hashes, explicit refusal records, request replay, anonymous denial and retained history were checked.
- Repository validation: assets, Portuguese, SEO and analytics. Public and professional production builds pass.

## Production publication and remaining evidence

Migration `202611020001` has been applied to the linked production project. Only the changed `formulario` and `intake-notifications` functions are being synchronized; RLS policies and private storage access are retained. Both configured real owner memberships were read and confirmed active without impersonating them.

Production browser/deployment evidence will be recorded after publication. Before the controlled test, the connected production project contained zero public intake records; the release does not claim to have verified historical forms in a different environment.

**External blocker:** Supabase's configured secret names do not include `RESEND_API_KEY` or `EMAIL_FROM`. Actual acceptance and receipt in both inboxes cannot be certified until the provider key and verified sender are configured. Pending notifications remain durable; no conversion is rolled back because email is unavailable. Ordinary notifications contain no uploaded files.

Typed-name acceptance is not a handwritten signature or certified digital signature. No clinical findings, received payments or confirmed appointments are inferred from public declarations. Test evidence is case-based; this report does not claim every theoretically possible input or every unrelated application screen was exhaustively tested.
