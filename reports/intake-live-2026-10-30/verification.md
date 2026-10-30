# Production intake verification — 30 October 2026

Completed against https://francielesofiati.com/formulario and https://app.francielesofiati.com using fictional records only. Existing patient records were not edited or deleted. Test sessions were revoked after use; test records and their private uploads were removed. Deletion audit events intentionally remain.

## Fixed and deployed

- Signed public uploads now use PUT, matching Supabase Storage.
- Upload completion verifies the current Storage info response (`size`), with compatibility for older metadata responses.
- Forms → Todos includes converted submissions. Full submitted answers are readable in form review and the patient summary.
- The patient document library includes private form uploads and correctly opens/downloads signed files.
- Manual conversion preserves identity issuer, complement and CEP, supports large original answers without exceeding the clinical-entry size limit, and accepts enquiries without a CPF.
- Patient deletion removes dependent records in the right order, handles finalized/self-referencing notes without modifying them, preserves stock accounting with its clinical link detached, and cleans up associated form uploads. Incomplete form uploads are included in form cleanup.

## Production evidence

The real browser journey passed: public submission → signed uploads → completion → thank-you page → saved original answers and automatic patient creation → consent/refusal checks → Forms review → patient document library → signed file opening → permanent deletion. Three uploaded PDFs were retrieved byte-for-byte. Metadata and object removal were verified after deletion. See [machine-readable result](result.json), [form review](form-review.png), and [patient documents](patient-documents.png).

The production database regression first reproduced the original foreign-key failure. After migration, the same isolated fixture passed with finalized notes, amendments, follow-ups, adverse events, waitlist, portal requests and inventory links. It also verified idempotent manual conversion, identity fields and 120KB original answers. All database fixture writes were rolled back.

## Additional checks

- Management unit tests: 20 passed.
- Form delivery unit tests: 5 passed.
- Public browser regressions: save, prepare failure, failed-upload retry without duplicate intake, and older-browser timeout compatibility passed.
- Management browser regressions: desktop, tablet and mobile passed.
- Local database suite and production rollback regression passed.
- Public and management production builds passed.

## Deployment

Cloudflare public deployment: 88a2baea.health-95k.pages.dev.
Cloudflare management deployment: 7ae746f8.app-9ac.pages.dev.
Supabase: migrations 202610300001–202610300003; files and formulario functions deployed.

These checks cover registration, conversion, documents and deletion. They do not constitute an exhaustive audit of every unrelated software module or external notification delivery.
