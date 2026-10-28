# Application audit

Audit baseline: 2026-10-28, starting at `758e12f48` on `main`. Recovery work is on `codex/application-audit-recovery`.

## Product and runtime inventory

This repository contains two separately deployed products:

| Product | Runtime and entry points | Data/services | Deployment boundary |
| --- | --- | --- | --- |
| Public website | Static Brazilian Portuguese HTML, CSS and native JavaScript modules. Twenty root HTML pages, 248 `blog/` articles and 20 `servicos/` pages. `js/main.js` loads shared partials and feature initializers; consent and analytics are separate classic scripts. | Files in `data/`, public assets, browser storage for consent, and third-party analytics after consent. No server application is present in this checkout. | Source directory is the existing no-build Cloudflare Pages project. `npm run build` also creates optional `dist/` for local verification. |
| Clinic management app | React 19 application built with Vite 8, entered through `management/index.html` and `management/src/main.jsx`. | Supabase Auth, Postgres with 60 SQL migrations, private Storage, and 7 deployed Edge Functions plus the shared `_shared` directory. Browser access relies on database RLS and server functions. | `management/dist` is for a separate Cloudflare Pages project. Never merge the two deployment projects. |

The static public tree contains 288 HTML files; the discovery generator publishes 284 canonical/indexable URLs. The remaining pages include utility/no-index pages. The public site is currently Portuguese-only: `data/page-pairs.json` has no pairs and there is no tracked `en/` route directory. English partial templates and translation memory remain but are not published routes.

## Ownership map

| Responsibility | Authoritative source |
| --- | --- |
| Public route content | Root HTML, `blog/` and `servicos/` |
| Active public chrome | `partials/pt-BR/` |
| Public behavior | `js/main.js`, `js/core/`, `js/components/`, `js/pages/` |
| Public styles | `css/site.css`; `css/src/` is the modular authoring/source set |
| Public route and canonical metadata | HTML canonical tags plus `data/seo.json`; `scripts/index-site.py` generates sitemap/robots/llms discovery files |
| Management screens and local state | `management/src/main.jsx` and focused modules under `management/src/` |
| Management authorization and persistence | `management/supabase/migrations/`, Edge Functions and RLS policies |
| Build and quality tools | Root `scripts/`; `management/scripts/`; package manifests and lockfiles |

## Dependencies and infrastructure

- Root tooling uses Node `>=22.19`, npm, Python 3, esbuild, `sharp`, Lighthouse/LHCI, Playwright Core and the static-site builder. The public deployed site has no Node runtime dependencies.
- Management uses React/React DOM, Vite, Supabase JS and Lucide React. Browser tests use `playwright-core`; SQL tests run migrations in an ephemeral PostgreSQL cluster.
- The only tracked GitHub Actions workflow runs desktop and mobile Lighthouse checks on pull requests or manual dispatch. There is no CI workflow here for management unit, SQL, browser or build checks.
- No environment file values were read or copied into this audit. `management/.env.example` lists Supabase/Turnstile deployment configuration without secrets.

## Existing architecture notes

- Public page behavior is modular, with `js/main.js` as the single module entry point. `js/partials.js` still contains locale-selection support for the retained inactive English templates.
- The management application has one large 5,529-line `main.jsx` and a 4,633-line stylesheet, alongside focused finance, communication, image, patient-picker, document and auth modules. This is a maintainability risk; a broad component split is not safe without screen-level regression coverage.
- Migrations are append-only deployment history. Historical invoice columns and old migration definitions remain in the database history even though invoice actions are no longer part of the current Finance UI.
- Current operational runbooks live under `docs/` and `management/docs/`. Older reports under `docs/archive/` and dated management audits are historical evidence, not current operating instructions.

## Baseline verification

Initial checks found stale bilingual assumptions in the Portuguese validator and active navigation, fixed on this branch. Management unit, SQL security and browser suites pass on local fictional fixtures. The public discovery validator now passes its 284 sitemap URLs and 25 curated `llms.txt` links. The public SEO implementation/social checks still report substantial per-page metadata, structured-data and image-preview work; see `DEFECT_REGISTER.md` for counts and limits. Live email relay acceptance, Cloudflare configuration, Supabase production settings and inbox delivery cannot be verified from local source tests.
