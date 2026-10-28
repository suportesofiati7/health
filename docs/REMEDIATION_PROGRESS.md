# Remediation progress

Updated 2026-10-28 on branch `codex/application-audit-recovery` from clean baseline commit `758e12f48`.

## Completed

- Created isolated recovery branch; did not change production systems or patient data.
- Inventoried the static public site, React management app, Supabase migrations/functions, build tools and deployment boundaries.
- Repaired current Portuguese navigation targets, removed broken English-only content links and migrated legacy English redirects to current Portuguese pages.
- Updated Portuguese parity and SEO route validators to reflect the empty route-pair map and active Portuguese-only site.
- Corrected stale management browser assertions for the intentionally removed language toggle.
- Updated the README, architecture, content workflow and handover docs to describe the current language architecture.
- Updated `llms.txt` summary and curated route coverage.
- Updated `sharp` to 0.35.5, applied compatible root audit fixes, and updated management Vite to 8.3.5. Management dependency audit is now clean; no root critical advisory remains.
- Replaced patient-like management test fixture identifiers/contact details with generic QA names, `.invalid` emails and placeholder phone values.
- Added current audit, defect register, recovery plan and functional matrix.
- Added `FEATURE_COMPLETENESS_MATRIX.md` for create/read/update/delete and lifecycle decisions across major entities.
- Fixed one-way procedure recording: the UI now writes clinical procedure, optional product usage and inventory consumption atomically through a role-checked Supabase RPC. Expired lots are rejected before a record can be finalized.
- Added UI resumption/editing for plan-generated clinical procedure drafts and update controls for existing treatment-plan details. Plan and optional item now persist through a single role-checked database transaction.
- Filled missing metadata/schema on 109 blog pages from their existing title, meta description, canonical, visible heading/breadcrumbs and the configured social image. Added a reusable preview/apply script; did not fabricate publication dates, treatment claims, reviews or page-specific images.

## Verification run

| Check | Result |
| --- | --- |
| Public assets | Pass |
| Portuguese checks | Pass: 0 errors, 0 warnings |
| Discovery files | Pass: 284 sitemap URLs, 25 curated links |
| Public internal links | Pass: 0 broken links; 3 orphan and 23 underlinked pages remain |
| Management unit tests | Pass: 17 tests |
| Management database/security suite | Pass on ephemeral PostgreSQL cluster; includes atomic procedure+inventory persistence, expired lot rollback, draft finalization and reception denial |
| Management regression suite | Pass: CSP/PDF, dates in three timezones, identity fields and explicit consent |
| Management browser suite | Pass: desktop/tablet/mobile, fictional network fixtures |
| Management Vite build | Pass; warning reports an ineffective dynamic import and a large vendor chunk |
| Public route smoke | Pass: 288/288 HTML routes returned HTTP 200 with `pt-BR` language and canonical tags |
| Redirect destination audit | Pass: all 683 file-backed redirect destinations resolve |
| Full public SEO gate | Pass: 0 local check failures; on-page metadata/schema 0 errors and 155 non-blocking title/description-length warnings; social preview check passes |
| Dependency audit | Root: 37 tooling advisories remain (13 high, 22 moderate, 2 low), 0 critical; management: 0 advisories; production-only checks: 0 |
| Public production build | Pass after blog metadata update: 288 pages and 1,313 optimized responsive images; artifact contains 1,316 AVIF/WebP files and matches source redirects/sitemap/llms |
| Public production image build | Pass: included in 288-page public build |
| Management browser CRUD checks | Pass after final UI changes: treatment-plan update and clinical procedure create/resume RPC paths at desktop/tablet/mobile; fictional intercepted backend |

## Unresolved and next actions

1. Review missing/inconsistent social preview, schema and image metadata with real editorial/media evidence.
2. Investigate a compatible Lighthouse CI upgrade or replacement for remaining root tooling advisories.
3. Verify actual notification relay acceptance with provider-side diagnostics; do not claim inbox delivery until confirmed.
4. Run hosting-level route/redirect and public deployment checks after an authorized deployment window.
5. Expand management interaction coverage before decomposing the large screen/style modules.
6. Add stateful or ephemeral-Supabase browser runs to prove persisted reload behavior for each major CRUD lifecycle; the current browser harness uses intercepted, fictional network fixtures.
7. Define safe item-level treatment-plan correction, finalized-procedure amendment, and archive/restore rules before adding destructive controls.

Generated SEO/analytics reports are local test outputs and must not be committed unless intentionally reviewed as artifacts.
