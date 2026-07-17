# Legacy removal plan

Legacy code remains only until its replacement coverage is proven. A filename is not evidence of obsolescence; selector references, rendered pages and interaction dependencies are checked before deletion.

## Removal sequence

| Stage | Legacy candidates | Replacement prerequisite | Removal evidence |
|---|---|---|---|
| 1. Foundations | merged token generations in `tokens.css`; `brand.css`; `theme.css`; late `tokens-and-base.css` | new tokens/reset/base/typography built and representative pages rendered | token audit, content screenshots, focus/contrast checks |
| 2. Layout | `grid.css`, `editorial-density.css`, `wide-screen.css`, shared chrome alignment fixes | new containers/grid/sections and chrome rails | 320–3440px + 67–200% zoom, no overflow/alignment drift |
| 3. Shared components | component portions inside `system.css` and duplicated chrome definitions | one layered implementation per component | component interaction tests and EN/PT screenshot parity |
| 4. Compositions | `generated-content.css`, `interstitials.css`, `botanical.css`, `editorial-panels.css`, `art-direction.css` | explicit hero/editorial/reading/process/statement/trust/final CTA markup | representative page gate, no section-number dependency |
| 5. Page systems | `families.css`, `compositions.css`, `english-art-direction.css` | all page families migrated in both languages | page map complete, content parity and visual QA |
| 6. Motion | broad `motion.css`, `presentation.js`, old reveal rules | explicit opt-in reveal and shared scroll state | reduced-motion and no-JS content tests |
| 7. Runtime content | `partials.js`, `localizePortugueseChrome()` fallback | compiled language-specific chrome and page-pair links | navigation visible without JS on all 42 routes |
| 8. Compatibility classes | `sf-final2`, `c01-*`, `sofiati-polished`, `luminoso-rosa-botanico`, `sf-page-rebuilt`, `sf-generated-*` | renderer emits only documented page/family/component/composition names | reference search zero + full build and route validation |

## Required check before each deletion

```text
search selectors/classes/functions across HTML, CSS, JS and generators
→ identify all affected EN/PT routes
→ migrate markup and behaviour
→ build CSS and language outputs
→ run static/token/link/language checks
→ run representative browser interactions/screenshots
→ remove legacy source
→ rebuild and repeat checks
→ record in legacy-removal-log.md
```

## Non-removal constraints

- Public HTML files, routes, metadata, content, forms and legal copy remain.
- Translation manifest, glossary, memory and direct-edit protection remain.
- Analytics/form/consent identifiers remain unless a confirmed broken integration requires a documented correction.
- Approved images are not removed merely because they are unused by the first migrated pages.
- Generated production assets are replaced only from restored authored build sources.

## Completion thresholds

- Zero active legacy visual-system files.
- Zero runtime presentation-class assignment.
- Zero complete-document mutation observers.
- Zero positional selectors used for tone/composition.
- No undocumented `!important`.
- Production CSS contains only sources listed in the final build manifest.
- `legacy-removal-log.md` maps every removed file to replacement and test evidence.
