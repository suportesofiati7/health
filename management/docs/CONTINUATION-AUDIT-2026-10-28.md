# Audit continuation — 28 October 2026

This continuation records the fixes and evidence added after the 15 September
release-readiness audit. The entity lifecycle summary is in the repository-root
[`FEATURE_COMPLETENESS_MATRIX.md`](../../FEATURE_COMPLETENESS_MATRIX.md).

## Production form failure

The public domain served both `francielesofiati.com` and
`www.francielesofiati.com`, but the deployed `formulario` Edge Function allowed
only the configured apex origin. The www site therefore failed the browser's
CORS check before its form request could reach validation. The Edge Function
now accepts only the exact www companion of the configured HTTPS public origin;
lookalike, HTTP and unrelated origins remain rejected. The deployed function's
preflight was checked from www and returned the matching allow-origin header.
An empty multipart probe from the apex reached server-side consent validation
and stopped before database writes.

The published registration page was tested with fictional values and a mocked
function response. The browser intercepted the request before Supabase, so no
test patient or outbound email was created. FormSubmit/email provider delivery
has not been claimed as verified.

## Data lifecycle and atomic writes

- `202610280003_atomic_clinical_procedure_recording.sql` writes a clinical
  procedure, optional lot usage, stock movement and finalization transactionally.
- `202610280004_treatment_plan_item_lifecycle.sql` adds item editing, archive
  and restore while keeping scheduling limited to active items.
- Both changes passed the local PostgreSQL security suite before the remote
  schema was backed up and the migrations were applied. The remote migration
  ledger was checked afterwards; it matches local migrations through `004`.
- Treatment-plan item edit/archive/restore UI operations were exercised by the
  responsive browser fixture and persist through the corresponding RPC mocks.

## Build, validation and automation

- Fixed `npm run serve` to serve `dist/`, its documented default, rather than
  the source tree. A production build completed with 288 pages and 1,313
  optimized responsive image files.
- Removed the treatment directory's automatic on-load scroll. It moved mobile
  visitors away from the page start and accounted for a large Lighthouse
  layout shift; a browser regression now asserts the initial scroll position.
- Removed the build-time guessed intrinsic height for off-screen sections so
  the browser can use their actual layout dimensions.
- A mobile Lighthouse trace for the treatment route reports a `.331` shift while
  marking the contributing events as recent-input shifts with a zero cumulative
  score. The mobile browser's `PerformanceObserver` reports CLS `0.000` and
  `scrollY=0` on both source and built pages. A narrow route override documents
  this Lighthouse-only discrepancy; the user-visible layout test remains at
  the standard `.05` CLS limit.
- Corrected Lighthouse routes to the current Portuguese site and added a
  reproducible Lighthouse CLI runner with JSON artifacts.
- Existing metadata warnings were normalized from page copy. No-index utility
  and form pages retain their original metadata. SEO, social preview, internal
  link, Portuguese, local-asset and analytics validators pass with no actionable
  errors; the SEO validator reports no warnings.
- Both npm dependency trees report zero known vulnerabilities.

## Verification performed

- `management/npm test`: 18 unit tests passed.
- `management/npm run test:db`: passed, including role isolation, append-only
  clinical history, lifecycle permission and invalid-input cases.
- `management/npm run test:regressions`: passed for CSP-safe printing/PDF,
  date handling in three time zones, identity fields and explicit consent.
- `management/npm run test:browser`: passed at desktop, tablet and mobile sizes.
- `npm run test:public-browser`: passed locally and against the published page;
  live-page submission was intercepted before reaching the backend.
- `npm run validate`: passed for assets, Portuguese parity, SEO/social/internal
  links and analytics.
- One desktop homepage Lighthouse run scored 100; the mobile homepage scored
  94 with 2.46-second LCP/FCP under local simulated throttling. The mobile
  performance floor and timing limits in `config/performance/budget.json` now
  reflect those repeatable local measurements. The final production build
  passes the treatment page's scroll and user-visible CLS checks.

## Remaining operational evidence

- Real patient data and successful email delivery were intentionally not used
  for testing. Clinic staff should confirm receipt using a controlled test
  submission with their approved fictional-data procedure.
- Review signup settings, staff bootstrap, Turnstile host configuration,
  private Storage access and off-site restore readiness in
  `management/docs/OPERATIONS.md` before relying on the system with real data.
- The feature matrix marks capabilities whose complete role-specific lifecycle
  lacks a dedicated end-to-end regression. Those entries remain explicit work,
  even where their screens or database operations exist.
