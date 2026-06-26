# 18 Concept By Concept Audit

## Purpose
Record the current visual and technical audit by concept so future agents can fix issues without re-discovering the same problems.

## Applies To
- `concepts/01-inspire/` through `concepts/50-sovereign/`
- `concepts/*/partials/header.html`
- `concepts/*/partials/mobile-menu.html`
- `concepts/*/partials/status-banner.html`
- `concepts/*/partials/footer.html`
- `concepts/*/sitemap.html`
- `concepts/*/css/style.css`
- `sitemap.xml`
- Existing screenshot evidence in `audit/screenshots/`

## Specific Rules
- Audit-only file: do not treat this as permission to edit code.
- Every issue must keep the concept number/name, path, problem, why it matters, suggested fix, priority and verification method.
- Static PASS reports do not override rendered visual failures.
- If a user-provided issue is not reproduced as literal overflow, document the rendered symptom accurately.

## Common Failure Patterns
- Fixing only the concept called out by the user while the same pattern exists systemically.
- Treating footer copy, footer decoration and footer copyright as one issue; they need separate verification.
- Missing JS-injected partials in raw HTML audits.
- Making all footers or CTAs identical during cleanup.

## How An AI Agent Should Verify The Work
- Static reports used in this audit: `audit/reports/page-inventory-audit.md`, `sitemap-audit.md`, `seo-validation.md`, `schema-validation.md`, `alt-text-validation.md`, `internal-link-validation.md`, `global-duplicate-layout-audit.md`, `ethical-copy-audit.md`, `legal-accessibility-contact-audit.md`.
- Rendered evidence used in this audit: existing `audit/screenshots/desktop-contact-sheet.jpg`, `audit/screenshots/mobile-contact-sheet.jpg`, and targeted desktop/mobile screenshots.
- Live DOM measurement used 1440x1100 desktop and 390x844 mobile for all 50 home pages.
- Re-run screenshots after implementation and compare before/after.

## Completion Checklist
- [ ] Every concept has an audit row.
- [ ] Known user issues are represented.
- [ ] Static pass areas are recorded.
- [ ] Fix priorities are clear.
- [ ] Verification methods are practical.

## Global Static Audit Snapshot

| Area | Current Result | Evidence | Notes |
| --- | --- | --- | --- |
| Page inventory | PASS | `audit/reports/page-inventory-audit.md` | 50 concepts, 1000 HTML files, 20 pages per concept. |
| Missing pages | PASS | `audit/reports/page-inventory-audit.md` | None found. |
| Internal links | PASS | `audit/reports/internal-link-validation.md` | Required links pass static validation. |
| SEO metadata | PASS | `audit/reports/seo-validation.md` | No missing metadata or H1 issues. |
| H1 structure | PASS | `audit/reports/seo-validation.md` and custom count | One H1 per concept HTML page. |
| Schema | PASS | `audit/reports/schema-validation.md` | JSON-LD present on every page. |
| Alt text | PASS | `audit/reports/alt-text-validation.md` | No missing alt text reported. |
| Ethics/legal/contact | PASS | `audit/reports/ethical-copy-audit.md`, `legal-accessibility-contact-audit.md` | No prohibited claims or full-address risks found. |
| Layout signatures | PASS | `audit/reports/global-duplicate-layout-audit.md` | No exact page-level signature sequence duplicates. |
| Rendered horizontal overflow | PASS except one header | live DOM measurement | No page-level overflow; `17-sculpt` mobile header has 10px internal overflow. |
| Forms and WhatsApp | Needs rendered verification | partial/source inspection | Raw HTML has mounts; forms and WhatsApp are injected through partials/JS. |
| Root sitemap | Needs decision | `sitemap.xml` count | 951 URLs; concept `sitemap.html` pages are not included. |

## Systemic Findings

| Concept Number/Name | File Path | Problem | Why It Matters | Suggested Fix | Priority | Verification Method |
| --- | --- | --- | --- | --- | --- | --- |
| 01-50 all concepts | `concepts/*/partials/footer.html` | Visible footer labels use `Brand`, `Brand and Trust`, and `aria-label="Brand"`. | User explicitly banned visible `Brand` in navigation/main headings and requested `Brand and Trust` become `About`. | Rename the visible/aria footer group labels to `About`; keep links and Legal/Contact. | high | `rg -n "Brand and Trust|>Brand<|aria-label=\"Brand\"" concepts/*/partials/footer.html` returns no hits except non-visible comments if approved. |
| 01-50 all concepts | `concepts/*/sitemap.html` | Sitemap group heading says `Brand and education`. | Violates the no-visible-Brand rule and creates inconsistent public navigation language. | Rename group to an approved label such as `About and education` or `About`. | high | `rg -n "Brand and education" concepts/*/sitemap.html` returns no hits. |
| 38 desktop concepts | `concepts/*/partials/footer.html`, `concepts/*/css/style.css` | Footer copyright is visually off-center on desktop, often because footer bottom row uses `space-between`. | User explicitly requires centered copyright everywhere. | Center the copyright independently of the disclaimer while preserving footer layout variety. | high | Rendered DOM copyright center delta is within 40px of footer shell center; screenshots confirm. |
| 950 concept pages | `concepts/*/*.html`, `concepts/*/partials/consultation-form.html`, `concepts/*/js/partials.js` | Forms are injected through JS partial mounts and appear on many page types. | Conversion depends on partial JS; raw HTML audits cannot prove form availability. | Keep JS-mounted forms, but future fixes must test rendered forms and consider whether legal/support pages need a lighter CTA. | medium | Load representative pages through local server and confirm form fields, privacy checkbox and status element. |
| 1000 concept pages | `concepts/*/*.html`, `concepts/*/partials/floating-widgets.html`, `concepts/*/js/main.js` | WhatsApp CTA is injected by partial/JS rather than present in raw HTML. | Conversion path disappears if JS partials fail. | Keep current approach unless static fallback is requested; verify rendered widget after any JS/partial change. | medium | Render pages and confirm `https://wa.me/5543991043536` link exists and does not overlap footer/cookie controls. |

## Concept Findings

| Concept Number/Name | File Path | Problem | Why It Matters | Suggested Fix | Priority | Verification Method |
| --- | --- | --- | --- | --- | --- | --- |
| 01 Inspire | `concepts/01-inspire/partials/footer.html`, `concepts/01-inspire/sitemap.html` | Systemic `Brand` footer/sitemap labels; desktop copyright center delta about -350px. | Public copy violates naming rule; copyright is not centered. | Rename footer/sitemap groups and center copyright without changing Inspire's dark editorial footer identity. | high | `rg` label search; rendered footer center measurement; desktop screenshot. |
| 02 Empower | `concepts/02-empower/partials/footer.html`, `concepts/02-empower/sitemap.html` | Systemic labels; copyright center delta about -320px. | Same naming and footer alignment failures. | Rename labels and center copyright while preserving Empower's pale footer rhythm. | high | Label search and rendered footer measurement. |
| 03 Enhance | `concepts/03-enhance/partials/status-banner.html`, `concepts/03-enhance/partials/mobile-menu.html`, `concepts/03-enhance/partials/footer.html`, `concepts/03-enhance/css/style.css` | Language switcher fits but mobile inactive `PT` is too faint/squeezed; footer labels use `Brand`; footer columns/contact use box/circle treatments; copyright delta about -390px; header CTA is white and less prominent than desired. | Matches user-known Concept 3 language and footer issues; affects readability and premium feel. | Improve switcher contrast/spacing, strengthen CTA, rename footer labels, remove boxed/circular footer treatments and center copyright. | critical | Inspect mobile screenshot, desktop screenshot, label search, DOM copyright measurement. |
| 04 Renew | `concepts/04-renew/partials/footer.html`, `concepts/04-renew/sitemap.html` | Systemic footer/sitemap labels. | Visible `Brand` labels conflict with the current public-copy rule. | Rename labels while preserving current centered copyright. | high | Label search and desktop/mobile footer screenshot. |
| 05 Elevate | `concepts/05-elevate/partials/header.html`, `concepts/05-elevate/partials/footer.html`, `concepts/05-elevate/css/style.css` | Header has split two-color block styling; footer has boxed column/card treatments; systemic footer/sitemap labels. | User explicitly called out Concept 5 Elevate for split menu styling and boxed footers. | Rebalance header into one premium surface; remove footer boxes; rename labels. | critical | Desktop screenshot `audit/screenshots/desktop/05-elevate-desktop.png`; label search. |
| 06 Refine | `concepts/06-refine/partials/header.html`, `concepts/06-refine/partials/footer.html`, `concepts/06-refine/css/style.css` | Desktop nav wraps to two rows; footer columns are boxed; copyright delta about -350px; systemic labels. | User explicitly called out two-line/unbalanced menu. | Reduce nav pressure, adjust spacing/CTA, remove footer boxes and center copyright. | critical | Rendered nav row count equals 1; screenshot confirms header balance. |
| 07 Glow | `concepts/07-glow/partials/footer.html`, `concepts/07-glow/sitemap.html` | Systemic labels; copyright delta about -320px. | Public label and footer alignment issues remain. | Rename labels and center copyright. | high | Label search and DOM footer measurement. |
| 08 Balance | `concepts/08-balance/partials/footer.html`, `concepts/08-balance/sitemap.html` | Systemic labels; footer visual still uses rounded contact panel/circle-like decoration risk. | Naming rule failure and potential footer decoration conflict. | Rename labels and inspect whether contact decoration reads as a forbidden circle. | high | Label search plus desktop/mobile screenshot review. |
| 09 Radiance | `concepts/09-radiance/partials/footer.html`, `concepts/09-radiance/css/style.css` | Systemic labels; copyright delta about -369px; header CTA uses white background and may not stand out enough. | Footer alignment and CTA prominence are user priorities. | Rename labels, center copyright, confirm CTA contrast. | high | DOM measurement and screenshot review. |
| 10 Essence | `concepts/10-essence/partials/header.html`, `concepts/10-essence/css/style.css`, `concepts/10-essence/partials/footer.html` | Desktop header is menu-only with no measured visible desktop nav and no header consultation CTA; systemic labels; copyright delta about -310px. | User said the direction is good but desktop text is not visible enough; essential navigation is hidden. | Keep Essence's menu-only feel only if approved, otherwise expose readable primary nav/CTA; rename labels and center copyright. | critical | Rendered nav link count, header CTA check, screenshot review. |
| 11 Bloom | `concepts/11-bloom/partials/header.html`, `concepts/11-bloom/partials/footer.html`, `concepts/11-bloom/css/style.css` | Unwanted square/box treatments in header/footer; systemic labels; copyright delta about -350px. | User explicitly called out square/box treatments. | Remove visible boxes while preserving Bloom's botanical/dark mood; rename labels and center copyright. | critical | Desktop screenshot and label/copyright checks. |
| 12 Vital | `concepts/12-vital/partials/footer.html`, `concepts/12-vital/css/style.css` | Systemic labels; copyright delta about -320px; header CTA white may need contrast check. | Footer and CTA consistency risk. | Rename labels, center copyright, verify CTA contrast. | high | Label search, DOM measurement, screenshot. |
| 13 Poise | `concepts/13-poise/partials/footer.html`, `concepts/13-poise/css/style.css` | Footer/contact uses circular treatments; footer columns boxed; systemic labels; copyright delta about -390px. | User explicitly called out circles around footer/contact areas. | Remove circle/box footer treatments; retain elegant dividers; rename labels and center copyright. | critical | Desktop screenshot `13-poise-desktop.png`; label/copyright checks. |
| 14 Aura | `concepts/14-aura/partials/footer.html`, `concepts/14-aura/sitemap.html` | Systemic labels; halo icon/footer style should be watched for circle-like decoration. | Naming issue is definite; footer decoration may drift into forbidden circles. | Rename labels; inspect halo treatment during footer pass. | high | Label search and screenshot review. |
| 15 Clarity | `concepts/15-clarity/partials/footer.html`, `concepts/15-clarity/css/style.css` | Similar footer decoration/box problem; systemic labels; copyright delta about -310px. | User explicitly called out Concepts 15 and 18 for footer decoration problems. | Remove boxed/over-panel footer treatment; rename labels; center copyright. | critical | Desktop screenshot and DOM measurement. |
| 16 Grace | `concepts/16-grace/partials/header.html`, `concepts/16-grace/css/style.css`, `concepts/16-grace/partials/footer.html` | Desktop nav wraps to two rows; systemic labels. | User explicitly called out Grace wrapping onto two lines. | Reduce nav/logo/CTA width pressure and keep copyright centered. | critical | Rendered nav row count equals 1; desktop screenshot. |
| 17 Sculpt | `concepts/17-sculpt/partials/header.html`, `concepts/17-sculpt/css/style.css`, `concepts/17-sculpt/partials/footer.html` | Mobile header internal overflow measured at 10px; systemic labels; copyright delta about -320px. | Mobile overflow can cause clipped controls or subtle horizontal jitter. | Tighten mobile header width/spacing; rename labels and center copyright. | high | Rendered mobile header overflow <= 2px; screenshot review. |
| 18 Lumin | `concepts/18-lumin/partials/footer.html`, `concepts/18-lumin/css/style.css` | Footer circle/box decoration problem; systemic labels; copyright delta about -390px. | User explicitly called out Concept 18 footer decoration. | Remove circle/box contact/footer treatments, rename labels and center copyright. | critical | Desktop screenshot and DOM measurement. |
| 19 Verda | `concepts/19-verda/partials/footer.html`, `concepts/19-verda/sitemap.html` | Systemic labels; copyright delta about -369px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and rendered footer check. |
| 20 Halo | `concepts/20-halo/partials/footer.html`, `concepts/20-halo/sitemap.html` | Systemic labels; halo footer icons should be checked for forbidden circle feel. | Naming issue is definite; halo motif may conflict with no-circles rule. | Rename labels; keep accents subtle and non-column-framing. | high | Label search and screenshot review. |
| 21 Calm | `concepts/21-calm/partials/footer.html`, `concepts/21-calm/sitemap.html` | Systemic labels; copyright delta about -350px. | Public label and alignment issue. | Rename labels and center copyright. | high | Label search and DOM footer measurement. |
| 22 Precision | `concepts/22-precision/partials/footer.html`, `concepts/22-precision/css/style.css` | Systemic labels; copyright delta about -320px; white header CTA should be checked for prominence. | Footer and CTA priority risks. | Rename labels, center copyright, verify CTA contrast. | high | DOM and screenshot review. |
| 23 Ritual | `concepts/23-ritual/partials/footer.html`, `concepts/23-ritual/sitemap.html` | Systemic labels; copyright delta about -390px; footer box/card rhythm risk. | Public labels and footer alignment fail. | Rename labels, reduce card-like footer framing, center copyright. | high | Screenshot, label search and DOM measurement. |
| 24 Signal | `concepts/24-signal/partials/footer.html`, `concepts/24-signal/sitemap.html` | Systemic labels; copyright delta about -369px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 25 Align | `concepts/25-align/partials/footer.html`, `concepts/25-align/sitemap.html` | Systemic labels; copyright delta about -310px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and DOM footer measurement. |
| 26 Vivant | `concepts/26-vivant/partials/footer.html`, `concepts/26-vivant/sitemap.html` | Systemic labels; copyright delta about -350px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and DOM footer measurement. |
| 27 Form | `concepts/27-form/partials/header.html`, `concepts/27-form/css/style.css`, `concepts/27-form/partials/footer.html` | Logo is boxed in desktop header via `.public-header-27.public-header-layout-form .public-brand-mark`; systemic labels; copyright delta about -320px. | User explicitly called out boxed logo. | Remove logo card treatment while preserving Form concept structure; rename labels and center copyright. | critical | Inspect header CSS and desktop screenshot after fix. |
| 28 Pure | `concepts/28-pure/partials/mobile-menu.html`, `concepts/28-pure/partials/footer.html`, `concepts/28-pure/css/style.css` | Language switcher fits but upper mobile menu controls/close contrast need review; footer uses large rectangle/circle treatments; systemic labels; copyright delta about -390px. | User explicitly called out Concept 28 language and footer rectangle/circle problems. | Improve menu-control contrast/spacing, remove footer rectangles/circles, rename labels and center copyright. | critical | Mobile screenshot, desktop screenshot, label/copyright checks. |
| 29 Solace | `concepts/29-solace/partials/footer.html`, `concepts/29-solace/sitemap.html` | Systemic labels; copyright delta about -369px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 30 Method | `concepts/30-method/partials/header.html`, `concepts/30-method/css/style.css`, `concepts/30-method/partials/footer.html` | Desktop nav wraps to two rows; systemic labels; copyright delta about -310px. | One-line desktop nav rule fails. | Reduce nav width pressure; rename labels and center copyright. | critical | Rendered nav row count equals 1. |
| 31 Evolve | `concepts/31-evolve/partials/footer.html`, `concepts/31-evolve/sitemap.html` | Systemic labels; copyright delta about -350px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 32 Serene | `concepts/32-serene/partials/footer.html`, `concepts/32-serene/sitemap.html` | Systemic labels; current copyright is centered. | Public label rule still fails. | Rename labels while preserving centered bottom row. | high | Label search and screenshot review. |
| 33 Elan | `concepts/33-elan/partials/footer.html`, `concepts/33-elan/sitemap.html` | Systemic labels; copyright delta about -390px; footer box rhythm risk. | Naming and alignment issue. | Rename labels, reduce column framing, center copyright. | high | Label search, screenshot, DOM measurement. |
| 34 Flora | `concepts/34-flora/partials/footer.html`, `concepts/34-flora/sitemap.html` | Systemic labels; copyright delta about -369px; organic dot/sprig decoration should be watched. | Naming issue and decoration risk. | Rename labels; keep botanical accents outside column boxes. | high | Label search and screenshot review. |
| 35 Atelier | `concepts/35-atelier/partials/footer.html`, `concepts/35-atelier/sitemap.html` | Systemic labels; current copyright is centered. | Public label rule still fails. | Rename labels while preserving Atelier footer uniqueness. | high | Label search and screenshot review. |
| 36 Lumina | `concepts/36-lumina/partials/footer.html`, `concepts/36-lumina/sitemap.html` | Systemic labels; copyright delta about -350px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 37 Vellum | `concepts/37-vellum/partials/footer.html`, `concepts/37-vellum/sitemap.html` | Systemic labels; copyright delta about -320px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 38 Origin | `concepts/38-origin/partials/footer.html`, `concepts/38-origin/sitemap.html` | Systemic labels; copyright delta about -390px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 39 Kindred | `concepts/39-kindred/partials/footer.html`, `concepts/39-kindred/sitemap.html` | Systemic labels; copyright delta about -369px; circle icon class may need visual restraint. | Naming, alignment and circle-risk issues. | Rename labels, center copyright, keep accents non-circular around columns. | high | Label search, screenshot, DOM measurement. |
| 40 Noble | `concepts/40-noble/partials/footer.html`, `concepts/40-noble/sitemap.html` | Systemic labels; current copyright is centered; header/menu/footer pass measured one-line behavior. | Public label rule still fails. | Rename labels while preserving Noble's layout. | high | Label search and screenshot review. |
| 41 Vista | `concepts/41-vista/partials/footer.html`, `concepts/41-vista/sitemap.html` | Systemic labels; copyright delta about -350px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 42 Softline | `concepts/42-softline/partials/footer.html`, `concepts/42-softline/sitemap.html` | Systemic labels; current copyright is centered. | Public label rule still fails. | Rename labels while preserving Softline footer rhythm. | high | Label search and screenshot review. |
| 43 Meridian | `concepts/43-meridian/partials/footer.html`, `concepts/43-meridian/sitemap.html` | Systemic labels; copyright delta about -390px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 44 Safeguard | `concepts/44-safeguard/partials/footer.html`, `concepts/44-safeguard/css/style.css` | Systemic labels; copyright delta about -369px; white CTA may need prominence check. | Footer and CTA priority risks. | Rename labels, center copyright, verify CTA contrast. | high | Label search, DOM measurement, screenshot. |
| 45 Silhouette | `concepts/45-silhouette/partials/footer.html`, `concepts/45-silhouette/css/style.css` | Systemic labels; copyright delta about -310px; silhouette footer/icon treatment may resemble boxes. | Naming and alignment issue; decoration risk. | Rename labels, center copyright, avoid boxed footer groups. | high | Label search and screenshot review. |
| 46 Curate | `concepts/46-curate/partials/header.html`, `concepts/46-curate/css/style.css`, `concepts/46-curate/partials/footer.html` | Desktop nav wraps to two rows; systemic labels; copyright delta about -350px. | One-line desktop nav rule fails. | Reduce nav pressure; rename labels and center copyright. | critical | Rendered nav row count equals 1. |
| 47 Proof | `concepts/47-proof/partials/footer.html`, `concepts/47-proof/sitemap.html` | Systemic labels; copyright delta about -320px; boxed footer rhythm risk. | Naming and alignment issue. | Rename labels, reduce column framing, center copyright. | high | Label search, screenshot, DOM measurement. |
| 48 Signature | `concepts/48-signature/partials/footer.html`, `concepts/48-signature/sitemap.html` | Systemic labels; current copyright is centered. | Public label rule still fails. | Rename labels while preserving signature layout. | high | Label search and screenshot review. |
| 49 Wisdom | `concepts/49-wisdom/partials/footer.html`, `concepts/49-wisdom/sitemap.html` | Systemic labels; copyright delta about -369px. | Naming and alignment issue. | Rename labels and center copyright. | high | Label search and footer measurement. |
| 50 Sovereign | `concepts/50-sovereign/partials/footer.html`, `concepts/50-sovereign/sitemap.html` | Systemic labels; current copyright is centered. | Public label rule still fails. | Rename labels while preserving Sovereign footer identity. | high | Label search and screenshot review. |
