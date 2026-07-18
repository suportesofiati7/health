# Final JavaScript architecture

`js/main.js` is the single native-module entry point. It waits for shared partial injection, then initializes the complete DOM once; there is no full-document mutation observer or sitewide reinitialization.

```text
js/
├── main.js
├── partials.js
├── core/
│   ├── dom.js
│   ├── page.js
│   ├── state.js
│   ├── data.js
│   └── scroll-state.js
├── components/
│   ├── navigation.js
│   ├── header.js
│   ├── floating-tools.js
│   ├── cookie-controls.js
│   ├── forms.js
│   ├── treatments.js
│   └── page-contents.js
├── effects/reveal.js
└── pages/{faq,blog}.js
```

## Initialization flow

```text
page HTML with six template placeholders
→ DOM ready
→ fetch and inject the locale-specific partials
→ dispatch sf:partials-loaded
→ global components once
→ page-specific components once when their required DOM exists
```

`core/scroll-state.js` performs one animation-frame scroll read and publishes position, progress, direction and dimensions. Header and floating tools subscribe; they do not add competing scroll calculations.

## Responsibility boundary

JavaScript manages menu focus/state, consent persistence, accessible form submission feedback, treatment/FAQ/blog filters, contents navigation, floating tools and explicit reveal enhancement.

JavaScript fetches already-localized shared markup and replaces each placeholder without a wrapper. It does not translate text, select section tones, assign page composition or reorder page content.

## Accessibility and resilience

- Menu preserves focus trapping, Escape close, scroll lock and focus restoration.
- Forms use rendered localized data/messages, associate field errors and focus the first invalid control.
- Native `details` remains functional without JavaScript.
- Reveal is opt-in through `data-reveal`; content defaults visible.
- Reduced motion changes scroll/reveal behaviour without removing component state.

## Adding behaviour

Create a component module only when the interaction is reusable. Export one defensive initializer, query within the component root, attach listeners once, and import it from `main.js`. A page-only behaviour belongs in `js/pages/` and must return immediately on other pages.
