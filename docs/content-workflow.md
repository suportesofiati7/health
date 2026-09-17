# Content workflow

## Standard page change

1. Edit the relevant root Portuguese HTML page. Portuguese is the public default and the canonical editorial language (`lang="pt-BR"`). Keep its title, canonical URL, structured data, section IDs and `data-*` attributes unless the change intentionally requires updating them.
2. Make the equivalent English change in the paired `en/` page. The pair is defined in `data/page-pairs.json`; do not infer a pair from similar filenames because Portuguese slugs are intentionally localized.
3. Refresh search-discovery files after a route, canonical-origin or indexability change:

   ```bash
   npm run site:index
   npm run seo
   ```

4. Run `npm run release:check` before handoff or deployment.

## Language generation and QA

The deployed language system is Portuguese-first: root pages and `partials/pt-BR/` are loaded by default, while English pages and `partials/` are selected only after the visitor uses the language switcher. `pt-BR` is the correct browser/search locale for Brazilian Portuguese; it does not imply a `/pt/` URL.

Run `npm run check:pt` after changing either side of a pair. It validates the route map, reciprocal `hreflang` values, `lang` attributes, links and translation hooks. The legacy Argos generator and `/pt/` output model are retained only as historical tooling and must not be used to publish or move the current root Portuguese routes.

Use `data/translation/pt-BR-glossary.json` for recurring Brazilian Portuguese terminology. Do not add `/pt/` pages or duplicate routes.

## Shared interface, styles and behaviour

- Edit shared navigation/footer/cookie text in `partials/`; mirror intentional copy changes in `partials/pt-BR/` or the translation inputs.
- Edit `css/site.css` directly and verify the affected routes locally. The production build performs CSS minification and fingerprinting.
- Add browser behaviour through the owning module under `js/`; use semantic `data-*` hooks, keep initializers idempotent and add them to `js/main.js`.

## Editorial safety

Do not publish individual diagnoses, prescription advice, guaranteed outcomes, prices, appointment availability or an unverified street address. Keep treatment selection, timing, recovery and outcomes consultation-dependent.
