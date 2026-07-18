# CSS cascade map

## Production order at baseline

`css/site.css` is a direct concatenation. There are no cascade layers. Later files implicitly outrank earlier files when specificity ties.

| Order | Source | Current role | Migration decision |
|---:|---|---|---|
| 1 | `foundations/tokens.css` | Six merged token generations | Rewrite as sole token authority |
| 2 | `foundations/brand.css` | First full brand/base/component system | Replace |
| 3 | `foundations/theme.css` | Second full theme/base/component system | Replace |
| 4 | `pages/families.css` | Family layouts and another foundation layer | Replace |
| 5 | `components/buttons.css` | Button base | Retain/refactor |
| 6 | `components/system.css` | Mixed global/component/redesign system | Split/replace |
| 7 | `sections/botanical.css` | Botanical section theme | Replace with restrained variants |
| 8 | `sections/editorial-panels.css` | Panel corrections | Replace |
| 9 | `sections/art-direction.css` | Section-order art direction | Replace |
| 10 | `effects/motion.css` | Global motion and presentation effects | Rewrite |
| 11 | `layout/editorial-density.css` | Density corrections | Replace |
| 12 | `pages/compositions.css` | Positional page compositions | Replace |
| 13 | `sections/generated-content.css` | Generated-markup styling | Replace |
| 14 | `sections/interstitials.css` | Additional section visual system | Replace |
| 15 | `layout/wide-screen.css` | Late large-screen correction | Replace with containers |
| 16 | `pages/treatments.css` | Treatment directory | Retain/refactor |
| 17 | `foundations/tokens-and-base.css` | Late base reset/token aliases | Merge |
| 18 | `layout/grid.css` | Late global grid correction | Rewrite |
| 19 | `components/breadcrumbs.css` | Breadcrumbs | Retain/refactor |
| 20 | `sections/hero-editorial.css` | Late hero correction | Merge into compositions |
| 21 | `components/cards-and-process.css` | Cards/process | Retain/refactor |
| 22 | `sections/statements-and-reading.css` | Statements/reading | Retain/refactor |
| 23 | `components/directories-forms-buttons.css` | Mixed components | Split |
| 24 | `components/shared-chrome-alignment.css` | `!important` rail repair | Remove after shared rails |
| 25 | `utilities/responsive-accessibility.css` | Responsive repairs and a11y | Split; remove repairs |
| 26 | `pages/english-art-direction.css` | English-only final visual contract | Replace; parity required |
| 27–32 | top bar, header, mobile menu, footer, cookie, floating tools | Late shared-chrome replacements | Retain/refactor in component layer |

## Conflict evidence

- 244 `!important` declarations across the source and production CSS.
- 109 `:nth-child()` / `:nth-of-type()` selectors.
- 93 media-query blocks with repeated breakpoint intent.
- 38 token names resolve to multiple different values.
- `--sf-section-y` is defined seven times with seven values.
- `--sf-wide` is defined four times with four values, ending at `2048px` through an alias.
- `--sf-radius` changes from `30px` to `8px` through source order.
- `--sf-shadow`, `--sf-muted`, `--sf-line`, and `--sf-gold` each have four or more competing values.
- Chrome alignment needs 17 `!important` declarations in one 49-line file.

## Target cascade

```css
@layer reset, tokens, base, layout, components, compositions, pages, utilities;
```

| Layer | Permitted responsibilities | Prohibited responsibilities |
|---|---|---|
| `reset` | box sizing, inherited font, media defaults, form normalization | brand values, component appearance |
| `tokens` | primitive, semantic and component custom properties | selectors other than token scopes approved in token docs |
| `base` | body, headings, text, links, focus baseline | page-family composition |
| `layout` | containers, grid, section spacing, cluster/stack primitives | component colours and decoration |
| `components` | one base per reusable UI component plus explicit states/variants | page-order selectors, global token redefinition |
| `compositions` | hero, split, reading, process, statement, final CTA | section-number logic, page-specific component repair |
| `pages` | genuinely unique page/family adjustments | global buttons/forms/chrome/typography |
| `utilities` | single-purpose utilities and accessibility overrides | component systems or theme layers |

## Migration rule

For each replacement component:

1. record selectors supplied by legacy files;
2. implement one layered base and explicit variants;
3. migrate representative markup;
4. compare content/function at target widths;
5. remove the supplying legacy rules, not merely outrank them;
6. run token, specificity, `!important`, CSS build and browser checks.

Production CSS will be rebuilt from an explicit manifest. A build must fail if a source is unlisted, a global token is duplicated, a raw approved brand colour appears outside the token source, or undocumented `!important` is found.
