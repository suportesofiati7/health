# Content workflow

English HTML is the source language for standard pages. Edit the relevant root-level HTML page directly. Preserve its metadata, section IDs/counts, data attributes and partial mounts. Then verify shared partial mounts:

```bash
python3 scripts/build-shared-chrome.py --check
```

Journal source is `posts/Franciele_Sofiati_Journal_10_Articles_Final.docx`:

```bash
python3 scripts/build-journal.py --write --assets
python3 scripts/build-journal.py --check
python3 scripts/check-journal.py
```

Portuguese pages and PT shared interface are generated output. Update glossary, translation memory or explicit overrides under `data/translation/`; then run:

```bash
python3 scripts/generate-portuguese-site.py
python3 scripts/check-portuguese-site.py --strict-warnings
```

Do not hand-edit generated Portuguese partials. Check canonical URLs, hreflang, section identifiers/counts, forms and language links after any source change.
