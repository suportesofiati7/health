# Component migration map

| Component | Current source/markup | Target ownership | Migration | QA gate |
|---|---|---|---|---|
| Top bar | fetched `partials/top-bar.html`; late CSS | compiled localized partial + `components/top-bar.css` | retain/refactor | EN/PT labels, equivalent link, zoom, no overflow |
| Header/navigation | fetched partial; `header.css`, `navigation.js`, scroll in `header.js` | compiled localized partial + one header component + shared scroll state | rewrite CSS, retain accessible behaviour | keyboard routes, current page, sticky state, 200% zoom |
| Mobile menu | fetched partial; local palette; delegated JS | compiled language markup + one dialog-like navigation component | retain/refactor | focus trap/return, Escape, repeated open, body scroll |
| Language switcher | filename inference; runtime link rewrite | explicit `data/page-pairs.json`, server/static rendered hrefs | rewrite | every pair points to equivalent page without JS |
| Footer | fetched partial and alignment correction | compiled localized footer on shared rail | rewrite CSS | landmarks, contact links, legal links, no layout shift |
| Cookie banner | fetched; bilingual JS state strings | compiled localized banner + behaviour-only JS | retain/refactor | consent persistence/enforcement, focus, language copy |
| Floating tools | fetched; independent scroll calculation and drift | optional compiled controls consuming shared scroll state | simplify | tap target, reduced motion, readable mode, back to top |
| Buttons | multiple base/correction definitions | `components/buttons.css`, explicit kind/size state | rewrite | contrast, focus, wrapping, PT expansion |
| Forms | generated markup + JS-created fallback status/errors | one form component with rendered localized templates | retain/refactor | labels, invalid fields, live states, safe intercepted submit |
| Cards | system/botanical/generated/composition variants | one card base; editorial, route, treatment variants | rewrite | equal rhythm without fixed heights, mobile stacking |
| Accordions | native details plus generated group styling | one native details/summary component | retain/refactor | keyboard/native operation, search, focus, open state |
| Treatment directory | section-number query and mixed templates | explicit directory/group/entry markup + page module | rewrite | filter/search/live count in EN/PT; no hidden orphan groups |
| FAQ search | simple page module | scoped FAQ component | retain/refactor | no-result state, category filtering, PT query |
| Blog search | `c01` page-class dependency | scoped article index component | retain/refactor | query/topic/no-result in EN/PT |
| Breadcrumbs | stable semantic markup | `components/breadcrumbs.css` | retain/refactor | hierarchy, overflow, current page |
| Page contents | English-only observer | opt-in bilingual contents nav | rewrite | current section, hash focus, sticky without obstruction |
| Hero | several source layers and English-only overrides | `compositions/heroes.css` with editorial/image/compact variants | rewrite | focal crop, content order, zoom, PT heading expansion |
| Editorial split | generated/editorial/interstitial systems | `compositions/editorial-split.css` | rewrite | media order modifier, readable copy, aspect ratio |
| Reading section | policy/reading corrections | `compositions/reading.css` | rewrite | 60–70ch line length, heading rhythm, lists/tables |
| Process/timeline | cards/process/generated systems | `compositions/process.css` | rewrite | semantic ordered content, mobile sequence |
| Statement/quote | many quote bands and JS class aliases | `compositions/statements.css`, limited tone variants | rewrite | quotation semantics, contrast, restrained frequency |
| Trust/testimonials | quote panels/directory/late art direction | one testimonial/trust system | rewrite | source attribution, no fabricated content, responsive flow |
| Final CTA | `sf-bottom-cta` plus runtime class alias | `compositions/final-cta.css` and explicit markup | rewrite | one clear action hierarchy, deliberate page ending |
| Reveal | broad automatic selectors | explicit `[data-reveal]` effect only | rewrite | default visible, reduced motion, failure-safe |

## Visual-device frequency contract

| Level | Devices | Maximum normal frequency |
|---|---|---|
| Primary | typography, palette, grid, spacing, photography, buttons | every page; every section relies on these |
| Secondary | sage band, quote strip, line botanical, soft panel/frame | normally 2–4 moments per long page; never on adjacent sections without purpose |
| Rare signature | large botanical, atmospheric gradient, unusual mask, major motion | zero or one per page; reserved for selected hero or trust moment |

No component may independently create a new brand palette, radius scale, container rail or heading scale.
