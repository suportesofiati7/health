# Clinic management system audit

Date: 15 September 2026  
Scope: `management/src`, `management/supabase`, management tests, runbooks and the existing production workflow implementation.

## Executive summary

The management application is a patient-centred React/Supabase system with a strong canonical model. The patient is the shared anchor for identity, intake, clinical entries, plans, procedures, documents, consent, follow-up, agenda and finance. RLS, version columns, immutable finalized clinical records, audit triggers, private storage and encrypted backup flows are already present. The largest operational risk was not missing storage: it was that Home presented only a partial and duplicated view of the available workflow.

Home was updated to read the existing tables directly. It now combines operational and clinical signals into one prioritized `Precisa de atenção` queue, links every metric to its owning module, shows today's flow and status, exposes the intake-to-return journey, uses a seven-day capacity estimate based on existing appointments, and shows finance only for the existing owner-only finance role. No dashboard table, cache, duplicate patient, or duplicate appointment was introduced.

## Inventory and relationships

| Area | Canonical source | Existing workflow / relationship |
| --- | --- | --- |
| Identity | `patients` | CPF/CNS validation, duplicate warning, versioned edits, private profile photo |
| Access | `memberships`, `staff_permissions` | Supabase Auth session plus organization membership, role and granular area permissions |
| Public acquisition | `public_intakes`, `public_intake_files` | Edge function accepts public submission; staff reviews and converts it |
| Working intake | `master_intakes`, `master_intake_versions` | One editable intake per patient, provenance and versions; finalization writes a canonical clinical entry and syncs identity/contact fields |
| Clinical record | `entries`, `entry_versions` | Patient timeline with immutable finalized records and amendments |
| Care plan | `treatment_plans`, `treatment_plan_items` | Patient-linked plans reference catalog `procedures` |
| Delivery | `clinical_procedures` | Links patient, appointment, plan, procedure and professional; can link products/lots, devices, photos, consent and follow-up |
| Operations | `appointments`, `tasks`, `follow_ups`, `adverse_events` | Agenda and task centre derive operational and clinical action queues from shared patient records |
| Documents | `documents`, `document_links` | Private files can be linked to patient entries and clinical procedures |
| Patient access | `patient_portal_accounts`, `patient_portal_sessions`, `patient_portal_shares` | Separate portal token/session model; staff explicitly shares resources |
| Finance | `financial_records`, `financial_payments` | Owner-only access with charge, payment, invoice, refund/correction and audit workflow |
| Continuity | `audit_events`, encrypted export/recovery | Audit trail plus encrypted off-site recovery packet flow; Storage binaries are not covered by database backups |

## Findings

### Duplicated or overlapping functionality

1. Home previously rendered both `Precisa de atenção` and `Fila de atenção`; tasks appeared in one while intakes, follow-ups and adverse events appeared in the other. This was a presentation duplicate with different coverage, not duplicate database data. It is now one queue.
2. `Tasks` intentionally derives suggestions from completed appointments and clinical procedure follow-up dates. The deduplication is title/patient based and can miss semantically equivalent manually created tasks with different wording. This is an automation opportunity; do not silently create records without user confirmation.
3. Finance has a legacy implementation in `main.jsx` and the active `FinanceiroRebuilt.jsx` implementation. Both use the same tables, but maintaining both increases regression risk. The active route uses the rebuilt module; the older implementation should be removed only after a targeted regression comparison.
4. Intake has immutable public submission data and an editable master intake by design. This is appropriate provenance, but UI must always explain which fields are canonical patient identity versus source submission versus working clinical data to prevent retyping.

### Disconnected or incomplete workflows

1. Existing Home did not surface check-in/current flow, confirmation workload, incomplete master intakes, plan/procedure progression, seven-day capacity, recent activity or owner finance balance.
2. The agenda is correctly linked to patients, but Home's former appointment rows did not provide a compact operational status summary. The new Home metrics link back to Agenda rather than inventing a check-in record.
3. Public intake conversion is protected by a database function and guard, but the conversion path depends on staff seeing the Forms queue. Home now deep-links pending forms into Forms.
4. Treatment procedure follow-up is available to Tasks and clinical panels but was not visible on Home. Home now includes the existing follow-up table and open adverse-event table in the unified queue.
5. The public website form and the private management intake are separate submission surfaces. This is a deliberate privacy/infrastructure boundary, but staff should use conversion/master intake instead of manually creating a second patient.

### Data consistency and duplicate-entry risks

1. Patient creation already warns on matching CPF, phone or name and the database uniquely constrains CPF. Keep this protection in any future import or conversion path.
2. `save_master_intake` synchronizes identity/contact fields into `patients`, while clinical sections remain in clinical records. Future forms must call this function, not insert a second patient or copy clinical JSON into `patients`.
3. Appointments, clinical procedures and treatment plans each retain their own status. This is necessary because scheduling, care planning and delivery are different lifecycle entities; do not collapse them into one status column.
4. Financial payments are separate immutable-ish events linked to a financial record. The rebuilt finance flow enforces balance checks and refund status. Home uses the record plus active payment totals and does not recalculate or persist a new financial summary.
5. Follow-ups can exist both as a clinical `follow_ups` record and as an operational `tasks` record. The task centre's suggestion guard reduces duplicates but does not establish a database-level source link. A future additive `source_type/source_id` link would improve traceability without replacing existing records.

### Permissions and security

1. RLS is the authority and is substantially granular. Owner finance access also has a defense-in-depth account email check. Home follows this boundary: finance queries and finance metrics are rendered only for the owner role, and failed optional queries collapse instead of exposing data.
2. Reception has broad day-to-day operational permissions but cannot administer users/settings, bulk export, delete clinical records or clinically finalize records. Home offers operational actions based on the existing `writable` capability; clinical finalization remains inside the clinical workflow.
3. The app has inactivity logout and periodically rechecks active membership and role. Preserve this behavior when adding realtime or background refresh.
4. Production blockers documented in `docs/AUDIT.md` remain blockers: remote migration evidence, disabling public signup, owner bootstrap, function secrets, Turnstile hostname verification, deployment origin, remote authorization tests, recovery drill and legal/professional review.
5. Sensitive health data appears in the public FormSubmit architecture described by the existing audit. This is outside the Home change and needs a clinic/legal processor review; do not expand that channel.

### UX and complexity opportunities

1. Home is now intentionally compact: five metric buttons, one attention queue, one agenda panel, one journey strip, one capacity heatmap and one recent-activity panel. Empty optional sections should remain collapsed/absent rather than occupying space.
2. The same status language should continue to come from `label()` and the existing design tokens. Avoid local status vocabularies.
3. Direct actions should open the existing patient, appointment, task, Forms, Agenda, Tasks or Finance flows. A future improvement is a permission-aware action registry so action visibility is driven by `staff_permissions` instead of broad role checks in individual components.
4. Home's capacity is an operational estimate (10 weekday slots, 4 Sunday slots) because the current schema has no clinic-hours/resource table. It is deliberately labelled estimated; replacing the constants requires a real schedule/settings source.
5. The app currently ships one large JavaScript chunk. Code splitting would improve load time but should be handled separately because it can affect dialog/module behavior.

## Verification performed

- Searched the complete management source tree, all SQL migrations, functions, docs and tests.
- Confirmed the active routes: Home, Patients, patient record, Agenda, Tasks, Forms, Reports, Finance and Settings, plus patient/public intake routes.
- Confirmed the source builds with Vite and existing unit tests pass before the Home change.
- Home implementation uses existing Supabase relations only; no migration was added.

## Recommended next audit tranche

1. Run the local database and browser suites after the Home change, then add fixture coverage for each role and for empty/denied optional tables.
2. Compare the two finance implementations and retire the unreachable legacy implementation after regression evidence.
3. Add explicit source linkage for task suggestions and a clinic-hours/resource configuration only if the clinic needs capacity to be more than an estimate.
4. Complete the production/security blockers in the existing operations runbook before real patient data is used.
