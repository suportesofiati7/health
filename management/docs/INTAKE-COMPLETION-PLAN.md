# Public intake to patient: completion and production verification plan

Date: 2 November 2026. Scope: the 21-section public form, Supabase, professional Forms module, patient records, private files, notifications, and deployment.

This is an implementation plan, not a certification of production behavior. Previously passing checks must be rerun against the release under test. Completion requires evidence for each acceptance criterion below; a successful build or mocked browser test alone is insufficient.

## 1. Establish the baseline and test boundaries

- Record source commit, both Cloudflare production deployment commits, deployed Edge Function versions and migration parity in Supabase `naypgbhwnlbyqqqfftgn`.
- Inventory the actual rendered public form, including runtime procedure terms, hidden metadata, optional fields, unchecked checkboxes, repeated selections and every upload input. Reconcile against `FORM-FIELD-MAP.md`; do not assume the static inventory is current.
- Record existing database constraints, triggers, grants, RLS/storage policies, staff roles, worker schedule and notification configuration without exposing credentials or patient data.
- Create a run identifier and a manifest of newly created fictional test records. Use reserved test email addresses and clearly labelled synthetic attachments. Retain test records and evidence; never delete existing records or run broad cleanup queries.
- Repair the production journey harness before using it: `scripts/test-live-intake.mjs` currently deletes older fictional records and generates an owner magic link with service-role access. Remove all deletion/cleanup behavior and use an explicitly provisioned QA staff session with the required role. Never change an existing owner's password or impersonate staff as a testing shortcut.
- Store evidence outside public artifacts, with redacted logs. Keep service credentials and authenticated traces out of git.

Acceptance: a reproducible baseline and a production harness that cannot delete records, send login emails, change permissions, or weaken anti-abuse protections.

## 2. Make the workflow and field contract explicit

For every field, record section, field key, Portuguese label, type, cardinality, required/conditional rule, allowed values, normalization, size limits, original evidence destination, patient destination and test case. Include null, empty, false and multiple values explicitly.

Use the following workflow as the implementation target:

`preparing → uploading → submitted → awaiting review → reviewed → converted/linked`

Failures remain visible and retryable at the appropriate stage. Define these states against actual schema values before writing migrations. Submission completion, staff review, patient association and email delivery must have independent timestamps and status. Do not mark review complete merely because an automatic process ran.

Current implementation difference: `associate_completed_form` creates/links patients during public submission and sets `convertido`. This must be reconciled with the requested staff-review-before-conversion workflow. Preserve historical links; do not undo prior conversions. For future submissions, save completed forms first, then let authorised staff explicitly create or link the patient. Queue submission notifications when the completed form is durable, independently of patient conversion.

Signature requirement: the current form has final checkbox acceptance, not a captured handwritten signature. Preserve the existing acceptance evidence honestly. Implement a separate explicit signature capture if a signature is required, with a Portuguese acknowledgement, accessible alternative, signer identity, timestamp, document/form version and linkage to the exact submitted content. Do not represent a checkbox, typed name or signature image as a certified digital signature. Retain old forms under their original version.

Acceptance: no field without a destination and test; no automatic clinical or payment fact inferred from an applicant's declaration.

## 3. Validate and submit the whole public form

- Align browser and server validation for identity, CPF, contact details, dates, adult/responsible-person rules, appointment preferences, procedure selections, all consent choices and signature evidence.
- Validate required acknowledgements on the server, including dynamically generated procedure terms. Explicit refusal of optional marketing must remain a valid choice. Reject unknown enum values and invalid combinations without losing entered answers.
- Establish bounds for free text, arrays, payload size, file count, individual/total upload sizes and permitted formats. Never silently truncate accepted answers; reject with an actionable Portuguese message instead.
- Preserve original submitted values separately from normalized identity/search fields. Test Unicode, accents, multiline text and repeated selections.
- Use a stable submission request identifier across double clicks, retries and ambiguous timeouts, enforced server-side. An intentional subsequent form must get a new identifier even for the same CPF.
- Validate upload manifests, actual object sizes/types and content hashes. Handle interrupted uploads, expired upload sessions and partial completion. Never acknowledge a complete submission with missing required attachments.
- Audit public responses and error paths for patient/account enumeration or unnecessary patient identifiers. Preserve write-only public access and existing Turnstile/rate limits.

Acceptance: valid submissions round-trip every answer and attachment; invalid submissions explain the problem; retrying a completed request produces exactly one logical submission.

## 4. Guarantee durable storage and recoverable transitions

- Make the database completion transition transactional and idempotent after verified uploads. Object storage is outside a PostgreSQL transaction: account explicitly for uploaded objects awaiting metadata and recorded manifests awaiting completion.
- Preserve the original payload, form version, consent evidence, timestamps, upload manifest and immutable attachment hashes. Prevent staff edits from modifying original submitted evidence; corrections become separate attributed versions or notes.
- Serialize conversion and same-identity creation using row/advisory locks and database uniqueness, not browser checks alone. Test concurrent requests with separate connections.
- Keep incomplete submissions distinguishable from completed submissions in Forms. Surface actionable recovery information to authorised staff without leaking secrets.
- Implement bounded, observable recovery for interrupted completion/association, including attempts, last failure and explicit retry. Do not rely on the applicant leaving the browser open.
- Review migration compatibility with existing records before applying constraints. Use additive migrations and non-destructive remediation; never discard records to make a constraint pass.

Acceptance: injected failure at each write boundary preserves recoverable evidence; no duplicate patients/conversions from concurrency; no false success for missing bytes.

## 5. Finish the Brazilian Portuguese Forms review experience

- Every completed submission appears automatically, including a submission with no patient link and one whose conversion failed. Verify filters, sort order, counts, pagination, realtime/polling refresh and reload behavior.
- Organise all answers under the same 21 section labels, with readable procedure and consent names. Show both answers and explicit refusals; distinguish not answered from not applicable.
- Display original submission time, form version, review state, reviewer and conversion/link history. Support search by normalized identity fields without exposing clinical data to roles lacking access.
- Verify attachment previews/downloads, complete-form print/export and empty/optional states. The repaired `row is not defined` attachment case stays covered by a browser regression test.
- Provide clear create-patient, link-existing, cancel, retry and open-patient actions. Disable duplicate actions while pending and restore them after errors.
- Repair the current full-browser-suite patient-picker timeout before accepting a green release; do not remove or skip its linking assertions.

Acceptance: Franciele and Ashtra can independently review the same complete form in Portuguese; refresh and reopen retrieve the persisted result; unauthorised users cannot perform restricted actions.

## 6. Convert or link without losing history

Implement a single authorised transactional conversion command with an audit event and idempotent result. Verify actual active memberships and permissions for Franciele and Ashtra; do not infer permissions from a display name.

| Submitted information | Patient destination and handling |
|---|---|
| Identity/contact/address/responsible person | Populate the new patient identity fields using validated normalization; keep the original form unchanged. |
| Clinical declarations | Add a dated source-linked health declaration. Free text remains a declaration, not an inferred allergy, diagnosis or prescription. |
| Selected procedures and treatment areas | Add requested procedures/source-linked intake information. Do not create performed/finalised procedures or approved treatment plans automatically. |
| Consent and signature evidence | Preserve each answer, refusal, term version, signer/acceptance evidence and timestamp, linked to the source form. Do not imply professional approval. |
| Identity documents/photos/PDFs | Expose source-linked private documents in the correct patient categories without losing original object paths or metadata. |
| Payment receipt and fee acknowledgement | Store evidence as awaiting financial verification; do not manufacture a received payment, receipt or paid balance. |
| Appointment dates/times/preferences | Populate requested scheduling information; do not silently create a confirmed appointment or bypass availability checks. |
| Original complete form | Maintain a patient-accessible source form with all 21 sections and all attachments. |

For existing patients, exact normalized CPF is a strong matching signal; email, phone and name identify candidates for human review, not automatic merges. Scope all matches to the organisation. Test shared phone/email, conflicting identity, archived records, absent CPF and concurrent submissions.

Show the selected patient's identity before linking. Append source-linked declarations/evidence; never replace existing identity, clinical histories, consents, appointments or financial records silently. Any deliberate correction requires an explicit field-level decision and audit trail. Canceling a confirmation must perform no conversion writes.

Acceptance: new and existing patient journeys preserve the original form byte-for-byte/semantically as appropriate; repeat conversion returns the same patient; linking leaves previous patient information intact.

## 7. Validate secure document access

- Test identity documents, receipts, photographs and PDFs separately, including multiple attachments and duplicate original filenames.
- Use meaningful display names such as `Documento de identidade - Nome - DD-MM-AAAA.pdf`, derived from trusted category metadata. Retain original names and storage paths, and preserve the genuine file extension/type.
- Check byte hashes after upload, completion, conversion/linking, reload and authorised download. Preview failures must offer a download/retry without crashing the page.
- Verify short-lived signed URL expiry, private bucket configuration, anonymous rejection, cross-patient/organisation rejection and role-specific access. Do not log or email signed URLs.
- Exclude incomplete or unrelated objects from a patient's document list. Surface missing-object corruption for repair rather than hiding it.

Acceptance: each manifest entry has exactly one expected accessible private object and readable category; unauthorised access fails through the real API/storage layer.

## 8. Verify notifications independently

- Inspect the two configured recipient addresses privately; do not assume their values from documentation alone.
- Queue one durable event per completed submission, independently of conversion. Reconcile this with the existing outbox's association-dependent trigger.
- Verify provider credentials, verified sender, scheduled authenticated worker, leases, bounded retries, provider idempotency and monitoring. Test provider outage, timeout, accepted-but-status-write-failed and exhausted retries.
- Record provider acceptance separately from inbox delivery. Confirm actual receipt in both inboxes using authorised inbox access or recipient evidence; provider HTTP success alone cannot satisfy delivery.
- Include only the necessary summary and authenticated app link, with no sensitive attachments or public access tokens.

Acceptance: both inboxes receive the controlled notification; delivery failure never rolls back submission/conversion; retries do not create duplicate logical notification jobs.

## 9. Execute the verification matrix

Run unit, real local database/RLS/Edge integration and browser tests first, then run the real deployed browser journey. Mocked public submission tests and production SQL transactions that roll back are useful supplementary checks, not substitutes for a durable production submission.

Production scenarios use new fictional records only, retained with the run identifier:

1. New adult applicant: complete all applicable fields, several procedures, consent choices and all document categories; submit on the real public origin with anti-abuse controls active.
2. Verify server response, durable original payload, manifest/byte hashes, completed state and exactly one notification job.
3. Sign into the real professional app as the authorised reviewer; locate the new submission without a hard reload, review every section, open files and save review.
4. Create the patient, open each mapped profile section, reload, sign out/in and reopen; compare all data and evidence against the submitted manifest.
5. Submit a new form for the same fictional identity; link to the existing patient and prove earlier history is unchanged.
6. Attempt duplicate clicks, completion replay, response timeout/retry, concurrent conversion and concurrent same-CPF creation. Verify exact counts and stable resulting IDs.
7. Exercise validation failures, missing/invalid attachments, interrupted upload, expired session/URL, stale updates, permission denial, cancellation, conversion failure and notification outage. Keep destructive/fault-injection cases in the isolated environment unless they can be safely scoped to new QA records without changing shared production configuration.
8. Test required roles and cross-patient/organisation isolation through real APIs, not hidden buttons alone.
9. Verify desktop, tablet and mobile, every intake-related button/action, keyboard access, loading/errors, pagination, filters, printable form and date/time display in Brazilian Portuguese.
10. Confirm both inbox receipts and redacted delivery evidence. Leave genuine user data and historical QA records untouched.

For each case record environment, deployment commit, expected/actual result, run/record IDs, time, redacted screenshots and assertion outcome. Separate local-only failure injection from production evidence. Fix discovered defects and rerun affected cases plus relevant regression suites. Maintain an explicit untested/blocked list; do not claim exhaustive testing without a traceable case inventory.

## 10. Release, synchronize and close

Required repository checks from `docs/deployment.md`:

```sh
npm run validate
npm test --prefix management
npm run test:db --prefix management
npm run test:regressions --prefix management
npm run test:public-browser
npm run test:workflows
npm run build
npm run build --prefix management
```

Also run the management browser suite against a stable local server and the real local intake/clinical integration harnesses with the required local services. No browser-suite skips to obtain a green result.

For backend changes: inspect linked-project migration status and `supabase db push --dry-run` from `management`; review every pending migration before applying. Deploy changed functions with their existing authentication settings. Verify worker/scheduler configuration independently. Do not run the broad sync script blindly: it applies every pending migration and deploys all functions.

Commit only intended source/tests/docs; exclude credentials, patient data and private test evidence. Fetch and integrate remote changes, rerun impacted checks, then push `main`. Verify both Cloudflare deployments reference that commit and production assets/Edge Functions match the release. Run the retained-fictional-data production journey after deployment. Record forward-repair/rollback instructions that preserve submitted records; do not roll back by dropping new patient data or disabling RLS.

## Definition of done

- Every current rendered form field has a verified persistence and display mapping.
- Durable production submission, staff review, new patient conversion and existing-patient linking pass with retained fictional evidence.
- Original answers, evidence, attachments, histories and audit events remain intact.
- Byte verification, concurrency/idempotency and role/storage isolation checks pass.
- Both notification inbox receipts are evidenced, separately from provider acceptance.
- All required checks pass; every discovered defect is repaired or explicitly reported as unresolved, with no claim of completion while an acceptance criterion remains blocked.
- Supabase parity, pushed source commit and successful production deployments are recorded.

Initial confirmed gaps to resolve: automatic conversion precedes staff review; notifications depend on association; handwritten signature is not captured; recovery of failed association is not automated; full browser linking test recently timed out; live test harness deletes old QA records. Re-audit before implementation because these are source observations, not a fresh production certification.
