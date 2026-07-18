# JavaScript flow map

## Baseline load flow

```text
DOMContentLoaded
  └─ start()
      ├─ fetch six shared partials in parallel
      └─ initAll()
          ├─ current navigation state
          ├─ runtime Portuguese fallback localisation
          ├─ mobile-menu initial state and delegated events
          ├─ header scroll listener
          ├─ floating-tools scroll listener
          ├─ cookie state/listeners
          ├─ every form
          ├─ language links inferred from current filename
          ├─ FAQ/blog/treatment/page-contents features
          ├─ presentation-class assignment
          ├─ atmosphere scroll/pointer/section observers
          └─ broad reveal observer

MutationObserver(document.documentElement, subtree=true)
  └─ after any child mutation, debounce 40ms and call initAll() again
```

Defensive `data-*-ready` flags prevent many duplicate listeners, but the architecture still re-queries the complete document after partial insertion, form-state changes, filtering and other ordinary mutations.

## Current module responsibilities

| Module | Behaviour to preserve | Responsibility to remove/change |
|---|---|---|
| `main.js` | one clear entry point and compatibility API | Remove document observer and repeated global initialization. |
| `navigation.js` | focus trap, Escape, focus restoration, scroll restoration, delegated menu events | Initialize against compiled markup once. |
| `forms.js` | native validity, inline errors, `aria-invalid`, live states, safe Formspree submission | Render language copy/status elements in HTML; no bilingual dictionaries. |
| `cookie-controls.js` | preference normalization, migration, persistence, focus return, consent event | Render status copy per language; isolate one component root. |
| `treatments.js` | filtering and accessible expand/collapse state | Remove `c01-page-*`, section-number ranges and runtime structural reconstruction where native markup suffices. |
| `faq.js`, `blog.js` | search/filter behaviours | Use component data roots; add localized live result state. |
| `page-contents.js` | current-section indicator | Remove English-only restriction and use explicit opt-in markup. |
| `header.js` | scrolled/direction state | Consume shared scroll state. |
| `floating-tools.js` | back-to-top and readable-mode persistence | Consume shared scroll state; remove ornamental drift. |
| `partials.js` | temporary migration loader | Delete after shared chrome compilation. |
| `language.js` | current-language indication | Read explicit page-pair manifest; delete runtime Portuguese reconstruction and filename assumption. |
| `presentation.js` | none required for essential behaviour | Move all appearance/section variants to rendered HTML; delete ambient pointer and section-index effects. |
| `reveal.js` | reduced-motion-safe optional reveal | Observe only `[data-reveal]`; content visible by default. |
| core modules | query helpers, shared data cache, stable page identity | Reduce global mutable flags and compatibility heuristics. |

## Duplicate scroll work

At baseline, three modules independently read `scrollY`, document height and viewport height:

1. `header.js` writes `--sf-scroll-progress`, `--sf-scroll-y`, direction and header state.
2. `floating-tools.js` computes progress again for visibility, readable state and decorative drift.
3. `presentation.js` computes progress again for reading progress and hero drift.

The target `js/core/scroll-state.js` will schedule one animation frame and publish this immutable snapshot only when values change:

```js
{
  y,
  progress,
  direction,
  documentHeight,
  viewportHeight
}
```

Consumers subscribe/unsubscribe explicitly. Header and back-to-top are the only planned sitewide consumers; hero drift and ambient pointer light are removed.

## Target initialization flow

```text
HTML already contains language-specific shared chrome and presentation variants
  ↓
DOMContentLoaded (or immediate when ready)
  ↓
initSite()
  ├─ init global components once
  │   navigation, consent, language links, forms, shared scroll state
  ├─ init explicitly present reusable components once
  │   reveal, page contents
  └─ init current-page component once
      FAQ search | blog search | treatments directory | none
```

No full-document observer is permitted. A future dynamic component must call its own initializer with the inserted root.

## Language rules

- No primary interface text is synthesized or translated in JavaScript.
- EN and PT form status/error copy is rendered into each form as hidden templates or data attributes.
- Language links come from `data/page-pairs.json`, not same-filename inference.
- JavaScript may toggle state text only by selecting already rendered language-specific strings.

## Acceptance criteria

- One site initialization per navigation.
- One shared passive scroll/resize pipeline using at most one pending animation frame.
- No `MutationObserver` on `document` or `documentElement`.
- No code assigns section tone, composition or primary presentation classes.
- No bilingual UI copy dictionary in JavaScript.
- No essential content is hidden by default pending an effect.
- Every component silently exits when its root is absent and marks only its own root initialized.
- Menu, consent, forms, FAQ, blog and treatments pass repeated-open/repeated-filter tests without duplicate events.
