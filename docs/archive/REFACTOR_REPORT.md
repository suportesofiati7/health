# Corrective front-end refactor report (superseded baseline)

> This predates the current-site rebuild. See `docs/rebuild/final-rebuild-report.md` for the current report.

Date: 2026-07-13

## Scope and baseline

The repository contains 42 public HTML routes: 21 English pages and 21 PT-BR counterparts. The audit covered authored/generated HTML, the complete CSS cascade, shared and page JavaScript responsibilities, partials, structured content/SEO data, local media, icon/font references, generation/check scripts, sitemap/robots files, and existing screenshot evidence.

The initial architecture had accumulated multiple visual generations in a large cascade, inconsistent historic container values, page-specific patches, viewport masking and generated HTML without scannable major-section comments. The strongest implementation was the newer editorial pattern system; the corrective work retained that visual direction and made the final resolution layer the shared authority.

## Implemented corrections

- Standardised every generated page on one fluid container/gutter/measure system and a shared twelve-column editorial rail.
- Applied fluid typography and section spacing with bounded `clamp()` values.
- Corrected mobile, tablet, desktop and ultrawide stacking/alignment behavior across all route families.
- Added stable responsive hero sources, intrinsic image dimensions and loading priorities.
- Preserved one semantic `main`, one `h1`, structured headings, breadcrumbs, metadata, canonicals, hreflang, JSON-LD and form contracts.
- Centralised repeated header, mobile menu, footer, cookie and floating-tool markup in existing partials.
- Standardised cards, process rails, quote bands, forms, treatment directory, accordions and editorial media compositions.
- Added keyboard-operable menu state, focus trapping/restoration, Escape handling, visible focus, form error association, live status messaging, consent controls and reduced-motion handling.
- Added defensive/idempotent initialisation and avoided component setup when its DOM is absent.
- Added PT-BR treatment-directory status localisation.
- Removed the global body `overflow-x` mask so responsive failures are detected rather than hidden.
- Added consistent major-section comments from the renderer to all generated pages.
- Expanded the browser audit to 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 and 2560 physical widths at 80%, 100%, 125%, 150% and 200% zoom-equivalent reflow.
- Added repository/developer documentation and explicit generated-file boundaries.
- Replaced three public legacy stylesheets with 32 responsibility-based authored modules and one generated production stylesheet.
- Centralised ten top-level token blocks in `css/src/foundations/tokens.css`.
- Removed embedded CSS from all maintained partials.
- Replaced the 1,192-line JavaScript IIFE with focused native ES modules and one `js/main.js` entry.
- Removed the confirmed-unused duplicate topbar and dead immersive-hero function.
- Added consistent structural indentation inside generated page mains.

No public URLs, form field names, endpoints, analytics/integration identifiers, written English content, metadata, structured data or intended brand identity were removed.

## Validation performed

- `scripts/render-english-site.py --dry-run/--write`: renderer validation for all 21 English pages.
- `scripts/check-english-site.py`: content, metadata, JSON-LD, partial mounts, internal links/assets, forms, language, contact details, testimonials, sitemap and robots checks.
- `scripts/check-local-assets.py`: local asset reference validation.
- `scripts/build-css.py --check`: verifies the generated stylesheet matches all 32 authored modules.
- `node --check` across `js/main.js` and every imported JavaScript module.
- `scripts/audit-responsive-layout.py`: every route at the release width/zoom matrix, checking overflow, broken images, escaped headings, small copy, undersized controls, missing regions and runtime console errors.
- Final English screenshot capture and contact-sheet review covered all 21 routes at 390px mobile, 768px tablet, 1440px desktop and 3440px ultrawide. Evidence and the zero-failure manifest are in `screenshots/sitewide-current/2026-07-13_13-35-31/`; the automated matrix separately covers every required width and zoom-equivalent reflow case.

## Change inventory

- Files created: modular sources under `css/src/` and `js/`; `css/site.css`; `scripts/build-css.py`; architecture/audit reports; interaction audit tooling and dated screenshot evidence.
- Files moved/reorganised: legacy CSS rules, partial styles and monolithic runtime functions were moved into explicit responsibility modules without changing public classes or integrations.
- Files removed: the three legacy CSS entries, the JavaScript monolith, duplicate `partials/topbar.html`, dead immersive-hero code and orphaned audit runners. No public page, content, asset or integration was removed.
- Important class renames: none in this corrective stage. Existing stable public/data/JavaScript hooks were retained; shared `sf-*` patterns were consolidated through the renderer and final resolution layer rather than cosmetic renaming.
- JavaScript modules created: one entry, four core modules, eight component modules, two page modules and two effect modules. The old entry was removed after validation; no parallel runtime remains.
- Shared components extracted: the existing runtime partial system is now the single maintained source for header/navigation, mobile menu, footer, cookie banner and floating controls.
- Standardised section patterns: hero, editorial media split, evidence panel, numbered sequence, quote panel, horizontal band, definition block, treatment directory, staggered cards, forms, accordions and policy/article reading layouts.
- Confirmed path/link corrections: renderer and asset checks report no broken local links or assets; public URLs and nested PT-BR relative paths remain intact.

## Intentionally unchanged

- The framework-free static stack and current hosting assumptions.
- Runtime shared-partial loading, because it is the established include mechanism and the repository has no server-side/static include build stage. Main content and SEO do not depend on it.
- External Formspree submission behavior and contact/social destinations.
- Existing copy and the calm botanical/editorial brand direction.

## Unresolved / release-blocking issue

The local PT-BR generator is explicitly a draft glossary system. It currently leaves extensive English and mixed-language copy, including some alt text/placeholders and FAQ structured data. This was pre-existing and cannot be safely corrected through automated word substitution without changing meaning. PT-BR publication requires a qualified native-speaker translation/review followed by `scripts/check-portuguese-site.py`. The checker intentionally remains failing so this risk cannot be silently ignored.

## Remaining technical debt

Some historical declaration overlap remains inside the now-explicit CSS source modules. A future reduction should use route/state coverage and screenshot comparison before removing selectors; filename or selector-name guesses remain unsafe. JavaScript responsibility boundaries are now complete.

External Formspree delivery cannot be end-to-end submitted without creating a real message; local endpoint configuration, validation, loading, success/error UI paths can be verified with request interception instead.

## Manual-review boundary

Final rendered contact sheets were reviewed for mobile and desktop composition; automated checks cover every route through ultrawide and every required zoom combination. A final review on physical Safari/iOS and Windows high-contrast mode remains advisable before production release because those environments are not available in this workspace.

## English art-direction completion

The English-only completion pass added an explicit visual journey for every route instead of relying on incidental section order. The renderer now emits ten maintained surface roles per page; the new English art-direction module defines their composition, contrast, imagery, responsive behavior and page-family signatures.

Key corrections include stronger asymmetric heroes, desktop clinic imagery for service routes, bounded ultrawide composition, arched editorial media, differentiated staggered/ledger/directory patterns, framed evidence and form surfaces, deliberate dark page chapters, mobile-specific stacking and quieter decorative treatments. The work also added a decorative reading-progress cue and accessible current-section state for in-page navigation.

The pass uncovered and removed obsolete `!important` background locks and lowered a generic eight-point exclusion selector with `:where(...)`, allowing explicit design roles to control the cascade. The screenshot auditor now records tone and hero computed styles, and interaction/responsive auditors support `SOFIATI_ENGLISH_ONLY=1`.

Final English validation:

- 21/21 English pages passed repository checks.
- 84/84 final visual cases passed at 390, 768, 1440 and 3440 pixels.
- 1,050/1,050 responsive and zoom-equivalent cases passed.
- 53/53 interaction checks passed.
- No broken local assets, browser errors or horizontal-overflow cases were found.
- Portuguese pages and `.translation-cache.json` remained byte-for-byte unchanged during this pass.

Evidence: `screenshots/sitewide-current/2026-07-13_13-35-31/`, `screenshots/responsive-audit.json`, and `qa/interaction-audit.json`.
