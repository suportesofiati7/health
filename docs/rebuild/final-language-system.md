# Final language system

English is the structural and default-content source. Brazilian Portuguese is generated locally with Argos Translate and may be manually improved at block level.

## Build flow

```text
data/content-master.json
→ render 21 English pages
→ retain six non-rendering partial placeholders per page
→ Argos en → pb block translation
→ preserve approved PT block overrides
→ write 21 pt/*.html atomically
→ regenerate 6 localized partials from the English partials
→ browser selects partials/{,pt-BR/} from <html lang>
→ validate language, structure, links and metadata
```

The installed Argos pair identifies itself as English (`en`) → Portuguese (Brazil) (`pb`). No paid or remote translation API is used after local model installation.

## Route pairing

`data/page-pairs.json` explicitly maps every English route to its Portuguese equivalent. `js/partials.js` reads this manifest and sets both language-switch links for the current route before it injects the top bar.

## Shared and interface copy

- `partials/*.html`: canonical, manually maintained English shared chrome.
- `partials/pt-BR/*.html`: generated Brazilian Portuguese build outputs.
- `data/interface-copy.json`: localized validation, filter-count and cookie feedback compiled into HTML.
- Injected shared roots use `translate="no"`; page-level translation state contains only the placeholders.

## Manual overrides

Edit visible page-level Portuguese directly in `pt/*.html`. Shared design and structure are edited once in the English partial; shared wording corrections belong in the glossary, translation memory or explicit override data. On incremental generation, page block hashes distinguish generated output from manual text. If its English source changes, the generator preserves Portuguese and writes the old English, new English and current PT to the conflict report.

## Commands

```bash
# interactive menu: incremental, complete regeneration or dry run
python3 scripts/generate-portuguese-site.py

# automation
.venv-argos/bin/python scripts/generate-portuguese-site.py --mode dry-run --no-color
.venv-argos/bin/python scripts/generate-portuguese-site.py --mode incremental --overrides preserve --no-color
.venv-argos/bin/python scripts/check-portuguese-site.py --strict-warnings
```

Full regeneration warns, confirms, creates a timestamped backup and offers override preservation/discard. Reports live in `reports/translation/`; backups live in `backups/pt/`.
