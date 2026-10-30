# Terms page redesign — 30 October 2026

Published to https://francielesofiati.com/termos.
Cloudflare production deployment: https://f72383e8.health-95k.pages.dev.

The terms now have their own reading layout, independent of the interactive form grid. The redesign adds a restrained cream/olive palette, clear type hierarchy, a desktop topic index, a stacked mobile index, 17 native expandable procedure terms, and readable bullet lists. Floating tools are hidden on small screens on this page so they cannot cover the document text. Form return links remain available throughout the page.

The original 118 paragraphs, list items and detailed term headings were checked against the pre-edit page; every text block is retained verbatim. Procedure content is presented in expandable panels rather than shown all at once. Reading this page does not record consent or submit information.

Verification covers widths of 320, 360, 390, 768, 1024, 1440, 1920 and 2560 pixels. Each check opens all 17 terms and verifies document widths, no horizontal overflow, no collapsed headings, index navigation, keyboard disclosure controls, four return-to-form links and no JavaScript errors. See [live results](live-results.json).

- [Desktop](hero-1440.png)
- [Mobile](hero-390.png)
- [Mobile reading view](reading-390.png)

Production build and existing CSS-scope/page-root checks also passed. Changes are confined to the terms page, its dedicated stylesheet, layout verification script and evidence artifacts. The intake and management fixes from the previous task remain in place.
