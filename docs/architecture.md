# Architecture

This is a framework-free static website. The repository is the authoring source; `dist/` is a disposable, deployable artifact produced by `npm run build`.

| Area | Owner | Notes |
| --- | --- | --- |
| Root `*.html` | English public pages | Edit these pages directly. Preserve metadata, IDs, `data-*` hooks and partial templates. |
| `pt/` | Brazilian Portuguese public pages | Generated/localized output. Use the translation inputs and generator; validate after any source change. |
| `journal/` | English Journal pages | Published static pages. No current Journal generator is included in this checkout. Edit with the same care as root English pages. |
| `partials/` and `partials/pt-BR/` | Shared interface | Header, navigation, footer, cookie banner and floating controls. They load at runtime in source previews and are inlined during production builds. |
| `css/site.css` | Public stylesheet | The production build minifies and fingerprints it. There is no separate CSS compilation command in this checkout. |
| `js/` | Browser behaviour | `js/main.js` is the module entry point. Consent/analytics scripts remain separate so consent defaults load first. |
| `data/` | Shared runtime and editorial data | `seo.json` owns the canonical origin; `page-pairs.json` owns language equivalents; `translation/` owns PT-BR terminology and overrides. |
| `assets/` | Public media | Paths are public contracts. Do not rename an asset without checking all consumers. |
| `scripts/` | Build, validation and maintenance tools | Run tools from the repository root. See [the scripts guide](../scripts/README.md). |
| `reports/` and `performance-reports/` | Generated evidence | Not public output. Review changes before committing them. |

## Production build

`npm run build` recreates `dist/` from scratch. It composes partials, bundles and fingerprints JavaScript/CSS, generates responsive AVIF/WebP image variants, minifies HTML, copies only required support files and writes deployment headers.

Only deploy `dist/`. Never edit it: every build replaces it.

## Site identity and routes

The canonical production origin is set once in `data/seo.json`. When the final domain changes, update that value and every page's canonical metadata, then regenerate discovery files and run `npm run release:check`. The build does not automatically rewrite page metadata.

`data/page-pairs.json` is the authoritative English/PT-BR route map. Add or remove paired routes there before refreshing `sitemap.xml` and validating the site.
