# Content workflow

## Standard page change

1. Edit the relevant root, `blog/` or `servicos/` Portuguese HTML page. Brazilian Portuguese (`lang="pt-BR"`) is the only published public language. Keep its title, canonical URL, structured data, section IDs and `data-*` attributes unless the change intentionally requires updating them.
2. Do not add English links or alternate-language metadata unless a translated page has actually been published and added to `data/page-pairs.json`.
3. Refresh search-discovery files after a route, canonical-origin or indexability change:

   ```bash
   npm run site:index
   npm run seo
   ```

4. Run `npm run release:check` before handoff or deployment.

## Language generation and QA

The deployed public site is Portuguese-only: root pages and `partials/pt-BR/` are the active routes and shared UI. The English partial templates and translation memory are retained as non-published localization inputs. `pt-BR` is the browser/search locale; it does not imply a `/pt/` URL.

Run `npm run check:pt` after page or shared-navigation changes. With no published language pairs, it checks the active Portuguese partials and their local references without requiring parity with inactive English templates. The Argos generator and `/pt/` output model are legacy tooling and must not be used to publish or move current routes.

Use `data/translation/pt-BR-glossary.json` for recurring Brazilian Portuguese terminology. Do not add `/pt/` pages or duplicate routes.

## Shared interface, styles and behaviour

- Edit active shared navigation/footer/cookie text in `partials/pt-BR/`. Keep inactive English templates out of the public route graph.
- Edit `css/site.css` directly and verify the affected routes locally. The production build performs CSS minification and fingerprinting.
- Add browser behaviour through the owning module under `js/`; use semantic `data-*` hooks, keep initializers idempotent and add them to `js/main.js`.

## Editorial safety

Do not publish individual diagnoses, prescription advice, guaranteed outcomes, prices, appointment availability or an unverified street address. Keep treatment selection, timing, recovery and outcomes consultation-dependent.
