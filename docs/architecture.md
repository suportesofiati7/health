# Architecture

This is a framework-free static website. The repository is the authoring source; `dist/` is a disposable, deployable artifact produced by `npm run build`.

| Area | Owner | Notes |
| --- | --- | --- |
| Root `*.html` | Brazilian Portuguese public pages | Published static pages. Preserve metadata, IDs, `data-*` hooks and partial templates. |
| Root `*.html`, `blog/`, `servicos/` | Published Brazilian Portuguese pages | These directories are the current public route source. The site has no published English routes. |
| `partials/pt-BR/` | Active shared interface | Header, navigation, footer, cookie banner and floating controls. They load at runtime in source previews and are inlined during production builds. |
| `partials/` | Legacy English interface templates | Retained for possible future localization work; no current public route selects them. Keep links out of published Portuguese pages. |
| `css/site.css` | Public stylesheet | The production build minifies and fingerprints it. The build compiles this file directly; explicitly linked page-specific stylesheets (including the cookie page) are also packaged, while unreferenced historical extracts are not shipped. |
| `js/` | Browser behaviour | `js/main.js` is the module entry point. Consent/analytics scripts remain separate so consent defaults load first. |
| `data/` | Shared runtime and editorial data | `seo.json` owns the canonical origin; `page-pairs.json` is intentionally empty until paired translations are published; `translation/` retains localization terminology and overrides. |
| `assets/` | Public media | Paths are public contracts. Do not rename an asset without checking all consumers. |
| `scripts/` | Build, validation and maintenance tools | Run tools from the repository root. See [the scripts guide](../scripts/README.md). |
| `reports/` and `performance-reports/` | Generated evidence | Not public output. Review changes before committing them. |

## Production build

`npm run build` recreates `dist/` from scratch. It composes partials, bundles and fingerprints JavaScript/CSS, generates responsive AVIF/WebP image variants, minifies HTML, copies only required support files and writes deployment headers.

Only deploy `dist/`. Never edit it: every build replaces it.

## Site identity and routes

The canonical production origin is set once in `data/seo.json`. When the final domain changes, update that value and every page's canonical metadata, then regenerate discovery files and run `npm run release:check`. The build does not automatically rewrite page metadata.

The site currently publishes Portuguese only. If a translated route is reintroduced, publish both pages, add the pair to `data/page-pairs.json`, update its alternate-language links and redirects, then regenerate discovery files and run the full release check. Do not treat retained English templates or research briefs as published routes.

## Provider source of truth

See [production configuration](../config/production.json) and [deployment](deployment.md).
Source (`main`) → the two locked builds → Cloudflare Pages `health`/`app` → their
custom domains → Supabase `naypgbhwnlbyqqqfftgn`. The public project publishes
`dist/`, never raw repository files. The management project publishes `management/dist/`.
