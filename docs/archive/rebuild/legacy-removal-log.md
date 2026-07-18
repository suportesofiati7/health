# Legacy removal log

## 2026-07-13 — historical CSS cascade

Removed 22 inactive source modules after the new layered manifest built successfully. Replacements are:

| Removed responsibility | Replacement |
|---|---|
| competing `brand`, `theme`, `tokens-and-base` foundations | `foundations/tokens.css`, `reset.css`, `base.css`, `typography.css` |
| editorial density, wide-screen correction | `layout/containers.css`, `grid.css`, `sections.css`, `responsive.css` |
| system/cards/process/directories correction files | focused files in `components/` |
| botanical, art-direction, generated-content, interstitial and statement layers | explicit files in `compositions/` and `data-pattern` markup |
| treatments/English/family page overrides | `pages/families.css` plus shared composition contracts |
| motion and responsive-accessibility correction layers | `utilities/accessibility.css`, `js/effects/reveal.js`, shared scroll state |

Validation before removal: `build-css.py --check`, strict token/cascade validation, JavaScript syntax, 42-page shared-chrome idempotence and representative screenshots. The removed modules are absent from `scripts/build-css.py`; production CSS fell from about 382 KB to about 54.4 KB after the established premium chrome treatments were restored inside the authoritative component files.

## 2026-07-13 — runtime presentation and partial system

Removed `js/effects/presentation.js`, `js/components/partials.js` and `js/components/language.js` after:

- explicit `data-pattern` and `data-tone` became authoritative;
- localized chrome was compiled into all 42 pages;
- language targets came from `data/page-pairs.json`;
- `js/main.js` initialized once without a document-wide mutation observer.

The source files listed above and the three runtime presentation/partial modules were removed after replacement coverage and QA completed.

| Date | File removed | Replacement | Affected pages | Tests | Result |
|---|---|---|---|---|---|
