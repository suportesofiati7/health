# 04 Component Inventory

## Purpose
Map the reusable partials and scripts so future agents know where rendered UI comes from.

## Applies To
- `concepts/*/partials/*.html`
- `concepts/*/css/style.css`
- `concepts/*/js/partials.js`
- `concepts/*/js/main.js`
- `concepts/*/assets/js/sofiati-footer-cookie.js`

## Specific Rules
- `partials/header.html` owns desktop public header shell.
- `partials/navigation.html` owns desktop nav templates.
- `partials/mobile-menu.html` owns mobile menu layout and mobile language switcher.
- `partials/status-banner.html` owns desktop utility strip and desktop language switcher.
- `partials/footer.html` owns footer columns, labels, contact and copyright.
- `partials/consultation-form.html` owns the Formspree form.
- `partials/floating-widgets.html`, `partials/floating-whatsapp.html`, and `partials/back-to-top.html` own fixed action widgets.
- `js/partials.js` injects partials and schema/head replacements.
- `js/main.js` normalizes floating WhatsApp and back-to-top behavior.
- Cookie footer behavior is loaded from `assets/js/sofiati-footer-cookie.js`.

## Common Failure Patterns
- Editing only raw page HTML when the visible issue lives in a partial.
- Editing only one concept's CSS while shared generated selectors still override it later in the file.
- Auditing forms or WhatsApp from raw HTML and missing JS-injected partials.
- Changing footer markup without checking concept-specific footer CSS below it.

## How An AI Agent Should Verify The Work
- Inspect the relevant partial and `css/style.css` before changing visible UI.
- Load through `python3 -m http.server` and wait for `body[data-partials-ready="true"]`.
- Check rendered DOM, not just source files.
- Search for duplicated labels or selectors with `rg`.

## Completion Checklist
- [ ] The visible component source file is identified.
- [ ] CSS selectors affecting the component are located.
- [ ] JS injection behavior is understood.
- [ ] Rendered page confirms the intended component state.
