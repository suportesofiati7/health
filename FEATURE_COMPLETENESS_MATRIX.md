# Feature completeness matrix

Updated 28 October 2026. This matrix records local evidence and known operational
limits; “verified locally” does not mean a live third-party delivery or production
data workflow was exercised. Data removal is deliberately restricted for clinical
records and should follow the clinic's retention policy.

| Feature / entity | Create | View | Edit | Delete | Other lifecycle operations | Status and evidence |
|---|---|---|---|---|---|---|
| Patients | Verified | Verified | Verified | Restricted, verified by DB tests | Archive, restore, duplicate checks | Verified locally; browser and SQL security suites use fictional records. |
| Appointments | Verified | Verified | Verified | Cancel instead of delete | Status changes, patient link | Covered by responsive management browser workflow; remote calendar use not tested. |
| Tasks / action centre | Verified | Verified | Verified | Completion/cancellation path | Due dates, priority, generated suggestions | Browser workflow and SQL policies covered; source-link deduplication remains a known limitation. |
| Public registration intake | Verified | Verified in authenticated Forms queue | Status/review and conversion | Source submission retained | Attachments, patient link, notification | Public page tested on deployed site with mocked submission; live function validates CORS and payload. Real patient submission and mailbox delivery intentionally not exercised. |
| Master intake | Verified | Verified | Verified | Not a substitute for source intake deletion | Versioning, finalization into clinical record | Existing workflow and DB suite; remote use requires release gates in `management/docs/OPERATIONS.md`. |
| Clinical entries / notes | Verified | Verified | Drafts editable; final entries amended | Final records protected | Amendments preserve original and audit trail | SQL security tests verify immutability, amendment provenance and access boundaries. |
| Treatment plans | Verified | Verified | Plan and item edit paths | Archive items instead of destructive removal | Item archive and restore | Item lifecycle migration, DB permission tests, and browser persistence checks added in this audit. |
| Procedure catalogue | Verified | Verified | Versioned edit path | Deactivation/versioning | Review status and catalog versions | Existing browser fixtures and version/audit model; full catalog CRUD scenario needs a dedicated release regression. |
| Clinical procedures / attendances | Verified | Verified | Draft/update path | Restricted after finalization | Link appointment, plan, products, devices, consents, photos and follow-up | Existing browser workflow and SQL security suite; no remote clinical-data smoke test. |
| Products, lots and devices | Verified | Verified | Update/stock movement | Restricted where referenced | Traceability and movement history | Schema and access controls exist; end-to-end lifecycle is not fully proven by current browser suite. |
| Clinical photos / profile images | Verified | Verified | Replace profile image | Clinical-photo delete path | Authenticated preview and private storage cleanup | Browser checks and storage/RLS SQL tests; remote Storage binaries not exercised. |
| Documents and links | Verified | Verified | Metadata/link management | File removal through authorized path | Link/unlink to clinical records | Local policy coverage; remote storage and retention workflow remain unverified. |
| Finance records / payments | Verified | Verified | Invoice metadata and corrections | No direct destructive payment deletion | Refund, receipt, balance/status derivation | Browser workflow and SQL role restrictions; real payment-provider integration is not used. |
| Communication templates | Verified | Verified | Versioned edit | Availability/retirement | Custom fields, preview, usage controls | Unit tests cover placeholder rendering; external message delivery is not claimed as verified. |
| Communication messages / conversations | Verified | Read and history | Limited by message lifecycle | Permission-controlled deletion | Read state, reactions, attachments, participants | Schema and permissions exist; provider delivery and complete lifecycle need targeted remote validation. |
| Patient portal shares and actions | Verified | Scoped portal view | Revoke/update | Revoke | Expiry and token/session lifecycle | SQL and application routes exist; end-to-end remote portal smoke test remains outstanding. |
| Privacy requests | Verified | Verified | Status/workflow updates | Retained for audit | Request completion and audit history | Data model and access policy covered locally; clinic operational process still needs review. |
| Staff, roles and permissions | Owner-managed | Verified | Owner-managed | Deactivation/revocation | Session revocation, least-privilege matrix | SQL security suite covers role denial, disabled users and expired/revoked sessions. Remote Auth settings still need review. |
| Reports, exports and recovery | Generated | Verified locally | N/A | N/A | Encrypted export/import, multipart recovery | Unit tests cover cryptographic round-trip and multipart integrity; off-site recovery drill is outstanding. |
| Settings and audit events | Owner-managed | Verified | Owner-managed | Audit records append-only | Theme/language, permissions, audit trail | Browser and SQL suites cover representative flows; full settings-by-role matrix needs a dedicated regression. |

## Remaining evidence gaps

- Browser coverage is not yet a click-by-click proof for every control and every
  role. Rows marked “dedicated regression” or “not fully proven” are explicit
  follow-up work, not inferred completion.
- Production database migration state, owner bootstrap, signup settings, private
  Storage access, staff invitations and disaster recovery must be verified using
  the runbook. No destructive production migration was run for this audit.
- Real public submissions, real patient data and outbound email/WhatsApp were not
  sent as tests. The public endpoint was probed with an empty payload, which
  stopped at validation before database writes.
