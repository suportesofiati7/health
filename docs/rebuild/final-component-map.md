# Final component map

| Component | HTML authority | CSS | JavaScript | Key acceptance checks |
|---|---|---|---|---|
| Top bar/language switcher | `partials/{,pt-BR/}top-bar.html`, `data/page-pairs.json` | `top-bar.css` | `partials.js` | equivalent route href, EN/PT label, reflow |
| Header/navigation | localized `header.html` | `header.css` | `navigation.js`, `header.js` | current route, keyboard, sticky state |
| Mobile menu | localized `mobile-menu.html` | `mobile-menu.css` | `navigation.js` | trap, Escape, repeat open, restore focus |
| Footer | localized `footer.html` | `footer.css` | `footer.js` | contact/legal integrity, PT expansion |
| Cookie controls | localized `cookie-banner.html`, interface copy | `cookie-banner.css` | `cookie-controls.js` | consent state, preferences, localized announcement |
| Floating tools | localized `floating-widgets.html` | `floating-tools.css` | `floating-tools.js` | readable mode, reduced-motion scroll top |
| Buttons | page/component markup | `buttons.css` | form busy state only | link/button semantics, focus, wrapping |
| Cards | renderer/content master | `cards.css` | none | natural height, contrast on every tone |
| Forms | renderer + localized compiled message data | `forms.css` | `forms.js` | labels, errors, busy/success/error, endpoint preservation |
| Accordions/disclosures | native `details/summary` | `disclosures.css` | search/filter only | native keyboard operation, visible focus |
| Treatment directory | `treatments.html` | `directories.css` | `treatments.js` | search/category/status in EN/PT |
| Breadcrumbs/page contents | renderer | `breadcrumbs.css`, `sections.css` | `page-contents.js` | hierarchy, wrapping, anchor focus |
| Hero | renderer `data-pattern="hero"` | `heroes.css` | none | crop, source order, 320px/ultrawide |
| Media/reading | renderer explicit pattern/media data | `media-sections.css` | none | reading measure, intrinsic media |
| Statement/final CTA | renderer explicit pattern/tone | `statements.css` | none | contrast, limited frequency, clear ending |

Each page contains six `<template data-sf-partial>` placeholders. `js/partials.js` replaces them with locale-specific partial fragments and no wrapper. Edit only the English partials; the Portuguese generator rebuilds the localized outputs.
