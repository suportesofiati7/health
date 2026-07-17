# Maintenance guide

## Change English page content

1. Edit `data/content-master.json`.
2. Preview with `python3 scripts/render-english-site.py --dry-run`.
3. Write with `python3 scripts/render-english-site.py --write`.
4. Synchronize partial placeholders: `python3 scripts/build-shared-chrome.py`.
5. Run the Portuguese generator in incremental mode.
6. Run the release checks below.

Public English page bodies are generated output. Head metadata and integration skeletons are preserved by the renderer.

## Change the Journal publication

The Journal is intentionally separate from the standard route renderer. Its content authority is `posts/Franciele_Sofiati_Journal_10_Articles_Final.docx`.

1. Update the source document without changing the one-article-per-section structure.
2. Run `python3 scripts/build-journal.py --write --assets`.
3. Run `python3 scripts/generate-sitemap.py` if article slugs changed.
4. Run `python3 scripts/build-journal.py --check` and `python3 scripts/check-journal.py`.
5. Complete the release checks and responsive visual review below.

The builder owns `journal.html`, the ten files in `journal/`, and the optimized delivery assets in `assets/posts/journal/`. Article slugs, curation, metadata, asset mapping, related reading and contextual links are explicit in the builder so changes remain reviewable.

The supplied articles are currently English-only. Their language control returns readers to the existing Portuguese Journal index, and article pages publish only truthful English/x-default alternates; add a `pt-BR` article alternate only when a complete equivalent page exists.

## Change shared chrome

Edit the English partial in `partials/`, then run the Portuguese generator. It recreates `partials/pt-BR/` through the same localization system. Do not hand-maintain the generated Portuguese files. `js/partials.js` loads the correct set according to `<html lang>`.

## Change design

- System value: `css/src/foundations/tokens.css`.
- Element/type rule: foundations.
- Rail/grid/rhythm: layout.
- Reusable control: components.
- Reusable page composition: compositions.
- True family exception: pages.

Do not create a late correction file. Correct the owning source and remove obsolete rules in the same migration.

## Add a page

1. Add structured English content and SEO data.
2. Assign one page family and explicit section patterns/tones.
3. Render the English route with one `main` and one `h1`.
4. Add its explicit EN/PT pair to `data/page-pairs.json`.
5. Run incremental Portuguese generation.
6. Synchronize placeholders, update the sitemap if public, and run all checks.

## Add JavaScript

Prefer native HTML and CSS. For necessary behaviour, add one defensive component/page initializer and import it in `js/main.js`. Do not add document-wide observers, independent scroll loops, runtime translation or presentation-class assignment.

## Release checks

```bash
python3 scripts/build-css.py --check
python3 scripts/check-css-architecture.py --strict-unused
python3 scripts/build-shared-chrome.py --check
python3 scripts/render-english-site.py --dry-run
python3 scripts/build-journal.py --check
python3 scripts/check-journal.py
python3 scripts/check-english-site.py
.venv-argos/bin/python scripts/check-portuguese-site.py --strict-warnings
python3 scripts/check-local-assets.py
SOFIATI_ENGLISH_ONLY=1 node scripts/audit-interactions.cjs
SOFIATI_ENGLISH_ONLY=1 python3 scripts/audit-responsive-layout.py
python3 scripts/capture_sitewide_responsive_screenshots.py
```

Review screenshot output rather than treating capture completion as visual approval. Generated `css/site.css` must never be edited directly.
