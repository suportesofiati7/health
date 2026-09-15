# Release-readiness audit — Franciele Sofiati management system

Date: 15 September 2026  
Scope: `management/` application, Supabase migrations/functions, local database
policies, browser journeys, backup helpers, and operational documentation.

## Final status

**Verified locally with known production limitations.** The local application,
database policy suite, fictional-data browser journeys, build, and encrypted
backup tests pass. Production use with real patient data remains blocked until
the remote gates in `OPERATIONS.md` are completed and evidenced.

## What was audited

- Authentication, session expiry/revocation, inactivity handling, membership and
  role boundaries.
- Patient identity, CPF/CNS validation, duplicate prevention, profile photos,
  archive/delete lifecycle, clinical record immutability and amendments.
- Public intake review/conversion and repeat-conversion behavior.
- Agenda/appointments, tasks/action-centre generation, follow-ups and clinical
  workflow relationships.
- Treatment plans, procedures, products/lots/devices, consents, documents,
  photos, portal sharing and privacy requests.
- Communication history, templates, recipient/contact handling, sender
  signature logic and WhatsApp/email/telephone preparation.
- Owner-only finance, charges, payments, balance/status derivation, receipts,
  invoice metadata/files and refunds.
- Reports, settings, permission matrix, audit log, encrypted backup/recovery,
  responsive layouts and empty/error-state handling.

## End-to-end workflows tested

The fictional Playwright suite covers login, dashboard, Ashlyn Ann Merrigan's
patient navigation, clinical-record access, all patient tabs, authenticated
clinical-photo rendering, draft-note persistence, agenda, tasks, forms/status
update, finance payment registration, invoice-link persistence, receipt
generation, refund, reports, settings, theme switching, logout, and reception's
restricted clinical/finance view at 1440px, 768px and 390px. Report generation
opens a real browser popup, captures a representative screenshot, verifies the
shared header/content bounding boxes do not overlap, and checks the print/save
control is present.

The SQL suite covers organization isolation, private storage path isolation,
clinical-record finalization/deletion rules, amendments, reception denial of
clinical data, intake conversion without duplicate patients, invalid CPF/CNS,
disabled/expired/revoked access, anonymous denial, unsafe upload denial and
cross-organization reference denial.

The unit suite covers encrypted export round trips with Unicode/long content and
attachments, random salt/nonce and weak-passphrase rejection, and multipart
backup ordering, duplicate/missing-part and integrity handling. Document unit
tests cover long titles, long patient names, long control identifiers, optional
subtitles and the shared branded-header structure.

## Issues discovered and repaired

| Area | Severity | Problem / root cause | Fix | Retest | Status |
| --- | --- | --- | --- | --- | --- |
| Finance → Nota Fiscal | Medium | The “Link oficial” control updated `nf_amount` instead of `nota_fiscal_url`; entered invoice links were silently discarded on save. | Corrected the controlled-field update in `FinanceiroRebuilt.jsx`. | Browser journey now enters a fictional URL, saves the invoice, and asserts the persisted `financial_records.nota_fiscal_url` payload. | **Verified** |
| Private profile and clinical photos | High | Private image paths were rendered as direct URLs, which produced blank/broken previews when storage required authenticated access; clinical photos had no complete remove workflow. | Added authenticated blob/object-URL rendering for profile and clinical images, a popup viewer, explicit clinical-photo labeling, and a guarded delete action that removes metadata, storage binary and audit trail through the files function. | Browser fixture serves an authenticated-style storage object and verifies a loaded clinical thumbnail; build and DB security suite pass. Remote Storage smoke test remains a release gate. | **Verified locally** |
| Shared report/receipt header | High | Branded header elements used competing absolute/fixed bands while body flow did not reserve their actual height, causing overlap with title, patient metadata, control IDs, branding and body/footer on longer documents. | Refactored shared `documentHeader` into normal grid/flow rows (context/title, metadata, branding), made content follow the measured header, moved footer into normal flow, and kept decoration behind readable content. | Visual browser screenshots of the complete patient report show clear hierarchy and whitespace; long-value unit tests and bounding-box assertion pass. | **Verified locally** |
| Patient detail header | Medium | Header action buttons could consume the flexible text column and wrap realistic names one syllable at a time. | Added shared minimum sizing and flexible action wrapping. | Ashlyn browser screenshot and desktop/tablet/mobile overflow checks pass. | **Verified** |
| Browser test invocation | Low | `npm run test:browser` assumes a server at `127.0.0.1:5173`; without a running local server it fails before loading the app. | No product defect; documented correct invocation with `MANAGEMENT_TEST_URL` and a running Vite server in the README workflow. | Browser suite passes against the local server. | **Verified with known limitation** |

No data-loss, cross-organization, permission, duplicate-conversion, backup-
integrity, runtime-console, or responsive-overflow defect was reproduced in the
local suites.

## Major-module status

| Module | Status | Evidence / limitation |
| --- | --- | --- |
| Auth and access control | **Verified** | SQL RLS and browser role checks pass; remote Auth configuration still needs production verification. |
| Patients and lifecycle | **Verified** | Identity validation, duplicate controls, archive/delete RPC coverage and responsive patient journey pass. |
| Clinical record and workflows | **Verified** | Clinical data is protected for reception; finalized records are immutable and amendments preserve history. |
| Agenda, tasks and follow-ups | **Verified locally** | UI and schema relationships pass; remote data-volume and real calendar usage still require smoke testing. |
| Intake and lead conversion | **Verified** | Conversion is atomic/duplicate-safe in SQL and status editing passes in browser fixtures. |
| Communication | **Verified with known limitation** | Preparation/history/template paths are locally exercised; no real WhatsApp/email provider delivery was triggered or verified. |
| Finance | **Verified locally** | Payment, balance, receipt, invoice-link and refund paths pass; owner-only remote authorization remains a release gate. |
| Documents, photos and portal | **Verified locally** | Private profile/clinical image rendering, clinical-photo delete path, RLS/storage tests and document navigation pass; remote Storage/function and portal deployment smoke tests remain required. |
| Reports and settings | **Verified locally** | Shared report/receipt header is visually inspected at A4-style browser output, print control is present, and settings access passes; production PDF/print driver and backup/recovery drill remain outstanding. |
| Responsive usability | **Verified** | No horizontal overflow at desktop/tablet/mobile fixture sizes. |

## Remaining release blockers

These are environment/operational gates, not defects resolved by local code:

- Apply and verify all remote Supabase migrations.
- Disable public signup and complete owner bootstrap/invitation flow.
- Configure and verify Edge Function secrets, Turnstile hostname/origin rules,
  deployment origin, and remote authorization tests.
- Perform a fictional-data remote smoke test without sending outbound messages or
  touching real financial systems.
- Complete an off-site recovery drill including Storage binaries.
- Obtain clinic/legal/professional review for LGPD notices, retention,
  processor/communication channels and permitted professional scope.

Until these gates are evidenced, use fictional data only as required by the
existing operations runbook.

## Regression commands

```bash
cd management
npm test
npm run test:db
npm run build
npm run dev -- --host 127.0.0.1
MANAGEMENT_TEST_URL=http://127.0.0.1:5173 npm run test:browser
```

Latest local result: all commands passed; Vite reports the existing large
single-chunk warning (about 702 kB minified), which is a performance improvement
opportunity rather than a functional failure.
