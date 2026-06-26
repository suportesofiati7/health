# 19 Known Errors And Regressions

## Purpose
Track known problems that future agents should fix in priority order.

## Applies To
- All concept folders
- Header, footer, language, CTA, sitemap, form and widget partials
- Current screenshot and static audit reports

## Specific Rules
- Do not delete useful work while fixing these issues.
- Fix one coherent batch at a time and verify rendered pages.
- Preserve concept uniqueness during systemic repairs.
- Update this document after each batch.

## Common Failure Patterns
- Marking an issue fixed because source markup changed but rendered JS partial output still fails.
- Solving footer label copy but leaving footer boxes/circles.
- Centering footer copyright only on a few concepts.
- Making all CTA fixes identical.

## How An AI Agent Should Verify The Work
- Use `rg` for copy/path checks.
- Use rendered desktop/mobile screenshots for visual issues.
- Use live DOM measurements for nav rows, overflow and copyright center.
- Re-run static audits after any HTML/schema/link change.

## Completion Checklist
- [ ] Each critical issue has an owner batch.
- [ ] Each fix has before/after verification.
- [ ] This file is updated after implementation.
- [ ] `20-implementation-task-ledger.md` is updated after implementation.

## Resolved This Batch - 2026-06-26

- Public footer labels were changed from `Brand` / `Brand and Trust` to `About` in all 50 concept footer partials.
- Public sitemap headings were changed from `Brand and education` to `About and education` in all 50 concept sitemap pages.
- Verification: banned-label `rg` searches return no hits, `python3 scripts/audit_public_partials.py` passes 50/50, and `./scripts/run_agent_audit_pipeline.py --skip-screenshots` passes.
- No visual CSS/header/footer layout fixes were included in this resolved batch.

## Known Issues

| Priority | Concept Number/Name | File Path | Problem | Why It Matters | Suggested Fix | Verification Method |
| --- | --- | --- | --- | --- | --- | --- |
| critical | 03 Enhance | `concepts/03-enhance/partials/mobile-menu.html`, `concepts/03-enhance/css/style.css` | Mobile language switcher fits but inactive `PT` is low contrast and squeezed in the menu top area. | User explicitly flagged Concept 3 language switcher; readability fails even without viewport overflow. | Increase inactive contrast, adjust spacing and confirm menu top alignment. | Inspect `audit/screenshots/mobile/03-enhance-mobile.png` after fix and run mobile DOM bounds check. |
| critical | 28 Pure | `concepts/28-pure/partials/mobile-menu.html`, `concepts/28-pure/css/style.css` | Language switcher fits, but upper menu controls and close button need contrast/spacing review. | User explicitly flagged Concept 28 language switcher; the rendered issue is control readability and spacing. | Improve menu top control contrast and spacing without changing Pure's minimal identity. | Inspect mobile screenshot and confirm EN/PT and close button are readable. |
| critical | 06 Refine | `concepts/06-refine/partials/header.html`, `concepts/06-refine/css/style.css` | Desktop nav wraps to two rows. | User requires desktop menu on one line and called out Concept 6. | Tighten logo/nav/CTA spacing and keep all required links visible. | Rendered nav row count equals 1 at 1440px and narrower desktop. |
| critical | 16 Grace | `concepts/16-grace/partials/header.html`, `concepts/16-grace/css/style.css` | Desktop nav wraps to two rows. | User called out Grace wrapping. | Reduce nav width pressure while preserving Grace style. | Rendered nav row count equals 1. |
| critical | 30 Method | `concepts/30-method/partials/header.html`, `concepts/30-method/css/style.css` | Desktop nav wraps to two rows. | Same one-line header rule failure. | Tighten spacing and CTA/nav sizing. | Rendered nav row count equals 1. |
| critical | 46 Curate | `concepts/46-curate/partials/header.html`, `concepts/46-curate/css/style.css` | Desktop nav wraps to two rows. | Same one-line header rule failure. | Tighten spacing and CTA/nav sizing. | Rendered nav row count equals 1. |
| critical | 05 Elevate | `concepts/05-elevate/partials/header.html`, `concepts/05-elevate/css/style.css` | Header has split two-color menu styling. | User explicitly called this out as visually unbalanced. | Rework into a unified premium header surface with CTA prominence. | Desktop screenshot comparison. |
| critical | 10 Essence | `concepts/10-essence/partials/header.html`, `concepts/10-essence/css/style.css` | Desktop header is menu-only with no visible desktop nav and no header CTA measured. | User said the direction is good but desktop text is not visible enough; essential links are hidden. | Either expose a readable compact nav/CTA or document approval for menu-only desktop. | Rendered desktop nav/CTA check and screenshot review. |
| critical | 11 Bloom | `concepts/11-bloom/partials/header.html`, `concepts/11-bloom/partials/footer.html`, `concepts/11-bloom/css/style.css` | Unwanted square/box treatments remain. | User explicitly called this out. | Remove box treatments while keeping Bloom's dark botanical mood. | Desktop screenshot review. |
| critical | 13 Poise | `concepts/13-poise/partials/footer.html`, `concepts/13-poise/css/style.css` | Circles around footer/contact areas remain. | User explicitly banned circles around footer/contact areas. | Replace with subtle dividers or glows, not circular frames. | Desktop and mobile footer screenshots. |
| critical | 15 Clarity | `concepts/15-clarity/partials/footer.html`, `concepts/15-clarity/css/style.css` | Similar footer decoration/box problem remains. | User explicitly called out Concept 15. | Remove heavy split panel/box treatment and center footer text. | Desktop screenshot and copyright measurement. |
| critical | 18 Lumin | `concepts/18-lumin/partials/footer.html`, `concepts/18-lumin/css/style.css` | Similar footer decoration/circle problem remains. | User explicitly called out Concept 18. | Remove circular/boxed contact and column treatments. | Desktop screenshot and copyright measurement. |
| critical | 27 Form | `concepts/27-form/css/style.css` | `.public-header-27.public-header-layout-form .public-brand-mark` adds padding, border, background and shadow around the logo. | User explicitly called out box around logo. | Remove logo card treatment while preserving Form header layout. | Inspect CSS and desktop screenshot. |
| critical | 28 Pure | `concepts/28-pure/partials/footer.html`, `concepts/28-pure/css/style.css` | Rectangles/circles around footer columns/contact remain. | User explicitly called this out. | Remove footer rectangle/circle treatments, keep minimal Pure personality. | Desktop and mobile footer screenshots. |
| resolved | 01-50 all concepts | `concepts/*/partials/footer.html` | Public footer labels were changed from `Brand` / `Brand and Trust` to `About`. | User requires `About`, not `Brand` or `Brand and Trust`. | Complete; preserve the approved label in future footer work. | `rg -n "Brand and Trust|>Brand<|aria-label=\"Brand\"" concepts/*/partials/footer.html` returns no hits. |
| resolved | 01-50 all concepts | `concepts/*/sitemap.html` | Public sitemap headings were changed from `Brand and education` to `About and education`. | Same public label conflict. | Complete; preserve the approved label in future sitemap work. | `rg -n "Brand and education" concepts/*/sitemap.html` returns no hits. |
| high | 38 desktop concepts | `concepts/*/partials/footer.html`, `concepts/*/css/style.css` | Copyright is visually offset on desktop in 38 concepts. | User requires centered copyright everywhere. | Center copyright independently from disclaimer; avoid making all footers identical. | Live DOM center delta and screenshot review. |
| high | 17 Sculpt | `concepts/17-sculpt/partials/header.html`, `concepts/17-sculpt/css/style.css` | Mobile header has 10px internal overflow. | Can cause clipped controls or subtle mobile layout jitter. | Tighten mobile header sizing. | Header overflow <= 2px at 390px. |
| medium | 01-50 all concepts | `concepts/*/*.html`, `concepts/*/partials/consultation-form.html`, `concepts/*/js/partials.js` | Forms are JS-injected on 950 pages; raw HTML has only mounts. | Static source checks miss conversion failures if partial injection breaks. | Always verify rendered forms after partial/JS edits. | Rendered pages show labels, privacy checkbox and Formspree action. |
| medium | 01-50 all concepts | `concepts/*/*.html`, `concepts/*/partials/floating-widgets.html`, `concepts/*/js/main.js` | WhatsApp CTA is JS-injected. | Conversion path depends on JS partial/widget behavior. | Keep JS behavior stable or add static fallback if requested. | Rendered `wa.me/5543991043536` link exists and is accessible. |
| medium | root sitemap | `sitemap.xml` | Root sitemap has 951 URLs and excludes concept `sitemap.html` pages. | May be intentional, but it should be confirmed because sitemap pages are part of the public page set. | Decide whether concept sitemap pages should be indexed; update sitemap/report if needed. | Count URLs and verify policy in this doc. |
