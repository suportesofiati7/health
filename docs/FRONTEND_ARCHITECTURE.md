# Front-end architecture

This is the operational overview. Detailed source ownership and maintenance instructions live in:

- [Final CSS architecture](rebuild/final-css-architecture.md)
- [Final JavaScript architecture](rebuild/final-javascript-architecture.md)
- [Component map](rebuild/final-component-map.md)
- [Language system](rebuild/final-language-system.md)
- [Maintenance guide](rebuild/maintenance-guide.md)

## Build graph

```text
content-master + English renderer → English HTML
English HTML + local Argos + override state → Brazilian Portuguese HTML
English partials + local Argos + approved wording → generated PT partials
page placeholders + html[lang] + page-pair manifest → runtime shared chrome

css/src manifest → css/site.css
rendered HTML → js/partials.js injection → js/main.js initializers
```

Public pages keep metadata and page-specific `<main>` content in HTML and contain six non-rendering shared-component placeholders. `js/main.js` initializes once after `js/partials.js` resolves; the loader selects localized markup but never translates or assigns presentation.

## Source authority

- English copy: `data/content-master.json`.
- English structure: `scripts/render-english-site.py`.
- Shared chrome: canonical English `partials/*.html` plus generated `partials/pt-BR/*.html`, loaded by `js/partials.js`.
- Language routes: `data/page-pairs.json`.
- Interface feedback: `data/interface-copy.json`.
- Design values and rules: `css/src/`.
- Behaviour: `js/`.
- Portuguese translation/overrides: `scripts/generate-portuguese-site.py`, `.translation-cache.json`, `data/translation/`.

Generated `css/site.css` and generated page bodies are never edited as architectural sources. Direct Portuguese content edits are supported overrides and are tracked by the translation system.
