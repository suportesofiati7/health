# Goals 1–17 completion evidence

Updated 2026-10-30. This report supersedes the earlier audit's release status.

| Goal | Implementation and verification |
| --- | --- |
| 1 — Colours | Shared rose, gold, green and text tokens corrected; five primary text/surface pairs exceed 4.5:1 contrast. |
| 2 — Mobile alignment | All three clinic details remain visible and left aligned; 320/390 px browser assertions pass. |
| 3 — Dialogs | Native alert/confirm/prompt calls replaced with styled promise-based dialogs; confirmation, cancellation, text entry and Escape tests pass. Browser-controlled tab-close protection for unsaved edits remains. |
| 4 — Registration | Application receipt is the success criterion; email-copy failure does not block the thank-you redirect. Intercepted full submission test passes. |
| 5 — Consent | Dedicated `/termos` page and corrected link. Treatment titles/descriptions remain visible; agreement is explicit and never restored from a draft. |
| 6 — Patient/form management | Patient picker enables linking; converted records leave the active list. Production rollback smoke verifies idempotent linking, deletion and preservation of consent evidence. |
| 7 — Visibility | Conflicting hidden/flex rules fixed, low-contrast dashboard text corrected and duplicate CSS removed. Public production audit: 288 pages × 3 widths, no detected defects. Management suite checks 16 responsive widths. |
| 8 — Email | Free Gmail compose links prepare recipient, subject and message under the clinic account; opening a draft never records a false claim of delivery. Browser checks pass. |
| 9 — Pending actions | Tasks can be completed/dismissed; resolved generated actions stay out of the pending queue. Optional email no longer causes incomplete-patient warnings. Production task status checks pass. |
| 10 — Catalogue usability | Ordinary labelled fields replace visible JSON; configuration is preserved internally. Removed automatic filler/completion actions; readable sources and consent choices remain editable. |
| 11 — Records/documents | Nested information is rendered as labelled Portuguese text; equipment notes preserve existing structured values. Document printing/PDF and clinical-record regressions pass. |
| 12 — Catalogue persistence | Database owns atomic version snapshots. Save/concurrency/permission errors are actionable; removal archives the service while preserving history. Production create/edit/version/archive smoke passes. |
| 13 — Indexing | Canonical/discovery/SEO gates pass; sitemaps regenerated. IndexNow submission is recorded below after release. Google submission is manual at the user's request. |
| 14 — Mobile performance | Optimized images, page-specific CSS, fingerprinted caching, deferred services and static hero space. Saved three-run medians: homepage 93, article 97; CLS about 0.005. These laboratory samples are not a promise for every device or page. |
| 15 — Audit/testing | Public validators, 18 management unit tests, 6 public unit tests, SQL security suite, targeted workflows, document/date regressions and management browser suite pass. JSX production builds validate syntax; this JavaScript repository has no separate TypeScript project. |
| 16 — Production architecture | One Git repository/branch, two documented Pages artifacts, one Supabase project. Migration state is current; production rollback smoke passes. Current provider configuration is in `config/production.json`; release procedure is in `docs/deployment.md`. |
| 17 — Articles | All 248 Portuguese articles retain educational content and receive contextual contact actions. Sixteen missing hero images added; runtime editorial images are explicitly included in production. All articles pass mobile/tablet/desktop geometry and image checks. |

## Verification scope

Browser workflow tests use intercepted fictional requests. The separate production SQL
smoke uses a synthetic session and isolated fictional clinic inside a rolled-back transaction;
it does not read or alter real patient records, send email or send WhatsApp messages.
Layout checks detect overflow, loaded image failures, JavaScript errors, heading counts and
clipped contact controls. They complement visual contact sheets; they cannot prove every
possible human interaction or clinical workflow.

Cloudflare Pages project/domain associations and Worker routes were inspected. The available
OAuth scopes do not permit DNS record or zone cache-rule inspection; no DNS records were changed.
The application schemas lint separately from provider-managed extensions. Earlier full-schema
lint reported an `extensions.index_advisor` / `hypopg_reset()` issue; this is outside application SQL.

## Search submission

Google Search Console: [open the site's Sitemaps screen](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Afrancielesofiati.com).
Submit `https://francielesofiati.com/sitemap-index.xml`. The user requested this manual link because no authenticated Search Console setup exists here.

## Release verification

Pending final publication checks; appended after deployment.
