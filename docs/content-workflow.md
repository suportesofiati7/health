# Content workflow

## Standard page change

1. Edit the relevant English root HTML page. Keep its title, canonical URL, structured data, section IDs and `data-*` attributes unless the change intentionally requires updating them.
2. Make the equivalent PT-BR change through the translation workflow when content has changed.
3. Refresh search-discovery files after a route, canonical-origin or indexability change:

   ```bash
   npm run seo:refresh
   ```

4. Run `npm run release:check` before handoff or deployment.

## Brazilian Portuguese

The generator updates Portuguese pages and shared PT-BR partials from English source plus files under `data/translation/`.

```bash
python3 scripts/generate-portuguese-site.py
npm run check:pt
```

Use `data/translation/pt-BR-glossary.json` for recurring terminology, `pt-BR-memory.json` for established translations and `pt-BR-overrides.json` for intentional page-specific wording. Do not hand-edit generated PT-BR partials: a generator run overwrites them.

## Shared interface, styles and behaviour

- Edit shared navigation/footer/cookie text in `partials/`; mirror intentional copy changes in `partials/pt-BR/` or the translation inputs.
- Edit `css/site.css` directly and verify the affected routes locally. The production build performs CSS minification and fingerprinting.
- Add browser behaviour through the owning module under `js/`; use semantic `data-*` hooks, keep initializers idempotent and add them to `js/main.js`.

## Editorial safety

Do not publish individual diagnoses, prescription advice, guaranteed outcomes, prices, appointment availability or an unverified street address. Keep treatment selection, timing, recovery and outcomes consultation-dependent.
