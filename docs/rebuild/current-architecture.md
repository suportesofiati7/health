# Current architecture baseline

Baseline commit: `b916ad91d8aaa3965a5d48dff6a6157f4fe7434c`
Rebuild branch: `refactor/current-site-rebuild`
Recoverable snapshot: `backups/rebuild/current-site-baseline-b916ad91d.tar.gz` (519 MiB, 1,472 entries)
Audit date: 2026-07-13

## Runtime and deployment model

The public site is a framework-free static site with 42 HTML routes: 21 English files at the repository root and 21 Brazilian Portuguese equivalents under `pt/`. Every document loads `css/site.css` and the ES-module entry point `js/main.js`. The site assumes HTTP hosting; six shared-component placeholders are replaced after load by `js/components/partials.js`.

English content is stored in `data/content-master.json`, but the authored English renderer and CSS build script referenced by generated-file comments and documentation are absent from the current working tree. Their compiled Python bytecode remains under `scripts/__pycache__/`, and Git history confirms the source files existed before the baseline commit. Restoring a deterministic source workflow is therefore a rebuild requirement, not optional cleanup.

Portuguese generation is functional and block-aware. `scripts/generate-portuguese-site.py` translates the English HTML source with local Argos, writes `pt/*.html` and `partials/pt-BR/*.html`, and maintains `.translation-cache.json`, glossary, translation memory and conflicts.

## Current dependency flow

```text
data/content-master.json
        │
        │ renderer source missing at baseline
        ▼
root English HTML ──────────────┐
        │                       │
        │ Argos block generator │ shared partial placeholders
        ▼                       ▼
pt/*.html                 partials/{en,pt-BR}/*.html
        │                       │
        └─────────────┬─────────┘
                      ▼
              browser fetches partials
                      ▼
 css/site.css + js/main.js initialize presentation and behaviour
```

The target removes the browser-time content dependency: language-specific shared chrome will be compiled into each HTML output before delivery.

## Quantified baseline

| Area | Baseline |
|---|---:|
| Public routes | 42 |
| English page families | 7 |
| Sections per page | 10 on every page |
| CSS source files | 32 |
| CSS source lines | 14,595 |
| Production CSS | 382,670 bytes |
| `!important` declarations | 244 |
| Positional `:nth-*` selectors | 109 |
| Media-query blocks | 93 |
| Token declarations | 235 |
| Unique token names | 129 |
| Multiply defined token names | 53 |
| Conflicting token names | 38 |
| JavaScript modules | 18 |
| JavaScript lines | 1,268 |

## HTML baseline

Each English page has one `main`, one `h1`, six partial mounts and ten generated sections. The useful semantic attributes are already present: stable section IDs, `data-pattern`, `data-tone`, page-family body classes, form hooks and page-specific search/filter hooks.

The body also carries nine historical presentation classes on most routes:

```text
sofiati-theme sf-final2 c01-body c01-site c01-inspire
c01-page-* sofiati-polished luminoso-rosa-botanico
sf-family-* sf-page-rebuilt
```

The rebuild will retain one page identity and one page-family identifier, remove historical theme/rebuild flags, and replace `sf-generated-*`/number-driven presentation with explicit composition attributes.

## Authored-source classification

### CSS

| File/group | Classification | Reason / target |
|---|---|---|
| `foundations/tokens.css` | rewrite | Contains six appended token generations; replace with one primitive/semantic/component token authority. |
| `foundations/tokens-and-base.css` | merge | Move reset/base portions into `reset.css`, `base.css`, `typography.css`. |
| `foundations/brand.css`, `theme.css` | replace | Competing complete brand/theme implementations; salvage approved values, then remove. |
| `layout/grid.css` | rewrite | Uses `!important` and positional selectors; replace with explicit container/grid primitives. |
| `layout/editorial-density.css`, `wide-screen.css` | replace | Late corrective systems; incorporate valid rules into sections/containers and remove. |
| Small component files (`buttons`, `breadcrumbs`, chrome files) | retain and refactor | Behavioural/semantic boundaries are valid; rebase on semantic tokens and layers. |
| `components/system.css` | split and replace | 1,313-line mixed component/theme/layout system. |
| `components/shared-chrome-alignment.css` | merge then remove | 17 `!important` alignment corrections indicate missing shared rails. |
| `sections/hero-editorial.css`, `statements-and-reading.css` | retain and refactor | Useful composition intent; rebuild without legacy dependencies. |
| `sections/botanical.css`, `editorial-panels.css`, `art-direction.css`, `generated-content.css`, `interstitials.css` | replace | Overlapping section systems, decoration layers and positional variants. |
| `pages/families.css`, `compositions.css`, `english-art-direction.css` | replace | Page family, generic composition and English-only late override layers conflict. |
| `pages/treatments.css` | retain and refactor | Real page-specific directory styling; isolate from global rules. |
| `effects/motion.css` | rewrite | Broad automatic reveal/ambient system; retain only explicit, reduced-motion-safe states. |
| `utilities/responsive-accessibility.css` | split | Move genuine accessibility utilities to an accessibility layer; delete responsive repairs. |

### JavaScript

| Module | Classification | Reason / target |
|---|---|---|
| `main.js` | rewrite | Remove full-document observer and global reinitialisation; initialize once after static DOM is ready. |
| `components/partials.js` | replace | Shared chrome must be compiled into HTML; retain only during migration. |
| `components/language.js` | rewrite | Replace filename inference/runtime localisation with page-pair-manifest links. |
| `effects/presentation.js` | remove after markup migration | Assigns presentation classes, section indices, atmosphere and duplicate scroll state. |
| `effects/reveal.js` | rewrite | Replace broad selector list with explicit `data-reveal` opt-in. |
| `components/header.js`, `floating-tools.js` | merge scroll calculations | Consume one shared scroll-state module. |
| `components/navigation.js` | retain and refactor | Preserve accessible focus trap, Escape close, body lock and focus return. |
| `components/forms.js` | retain and refactor | Preserve accessible errors/status/submission; move all language copy to rendered HTML/data. |
| `components/cookie-controls.js` | retain and refactor | Preserve consent persistence; move PT state copy out of JS. |
| `components/treatments.js`, `pages/faq.js`, `pages/blog.js`, `page-contents.js` | retain and refactor | Useful page behaviours with defensive initialization; remove positional/page-class dependencies. |
| `core/dom.js`, `core/page.js`, `core/state.js`, `core/data.js` | retain and simplify | Keep only helpers/state used by multiple modules. |

## Strong parts to preserve

- Stable URLs, page IDs, metadata, JSON-LD and form integration attributes.
- English content master and completed block-aware Portuguese generator.
- Accessible mobile-menu semantics and focus management.
- Form error association, live status, defensive DOM checks and intercepted QA submissions.
- Consent state persistence and preference controls.
- Native `details` FAQ structure and data-driven search/filter hooks.
- Existing responsive hero photography and approved brand/logo assets.

## Confirmed architectural failures

1. `css/site.css` is concatenated in historical order, not a controlled cascade.
2. The token authority is a merged collision file whose last declaration wins.
3. Every page is forced into ten sections, producing repeated rhythm independent of content purpose.
4. Page composition is partially driven by `data-section`, `:nth-*` and JavaScript class assignment.
5. Shared navigation disappears if JavaScript or partial fetch fails.
6. Portuguese shared chrome is build-generated but still browser-fetched; runtime localisation fallback remains active.
7. Three modules calculate scroll progress independently.
8. `MutationObserver` watches the complete document and schedules every initializer after any child mutation.
9. Generated CSS claims a missing build script as its authority.
10. Documentation references missing renderer, CSS build and validation source files.

These failures define the migration work; no replacement “final override” file will be added.
