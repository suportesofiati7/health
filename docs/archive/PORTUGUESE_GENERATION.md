# Brazilian Portuguese generation

## Source and output

English is authoritative. English page structure and default text are rendered from `data/content-master.json` into root-level HTML. The Portuguese generator then discovers every root HTML document containing `<main>` and writes its equivalent to `pt/`. It regenerates all six files under `partials/pt-BR/` from `partials/*.html` on every write run. `js/partials.js` selects the English or Portuguese set from `<html lang>`; there is no English fallback copy embedded in a Portuguese page.

The generator never writes to English HTML or English partials. It preserves HTML structure, classes, IDs, data attributes, JavaScript hooks, URLs, filenames, SVG/code content, form names/actions and technical schema keys. It translates visible text, titles, descriptions, appropriate social metadata, accessible labels, placeholders, submit labels, alt text and user-facing JSON-LD values.

## Install Argos Translate

The recommended setup keeps the large translation dependencies outside system Python:

```bash
python3 -m venv .venv-argos
.venv-argos/bin/python -m pip install -r requirements-translation.txt
.venv-argos/bin/python scripts/generate-portuguese-site.py --mode dry-run --install-model
```

After `.venv-argos` exists, the generator automatically hands execution to it, so the shorter `python3 scripts/generate-portuguese-site.py` command works normally. On Windows, activate `.venv-argos\\Scripts` or invoke its `python.exe` directly.

`--install-model` checks the free Argos package index and prefers an English → Brazilian Portuguese model (`en` → `pb` or another pt-BR identifier). If only generic Portuguese is available, the project glossary applies approved Brazilian terminology. Model download needs internet access once; generation itself is local and does not call a paid or remote translation API.

## Normal workflow

Run without arguments for the terminal menu:

```bash
python3 scripts/generate-portuguese-site.py
```

The choices are:

1. **Incremental update** — creates missing outputs and processes only English pages whose source-content hash changed. Unchanged pages are skipped and approved direct page edits are retained; localized partials are deliberately regenerated every time.
2. **Complete regeneration** — rebuilds every output, requires confirmation, creates a timestamped backup under `backups/pt/`, and asks whether detected manual overrides should be preserved or discarded.
3. **Dry run** — reports created, updated, skipped and obsolete outputs without writing.

Automation may use:

```bash
python3 scripts/generate-portuguese-site.py --mode incremental
python3 scripts/generate-portuguese-site.py --mode full --overrides preserve --yes
python3 scripts/generate-portuguese-site.py --mode dry-run
```

Obsolete PT files are only reported by default. Deletion is opt-in and confirmed (`--delete-obsolete --yes`); affected files are backed up first.

## Portuguese edits and conflicts

You may edit user-facing page text directly in `pt/*.html`; do not change structural attributes, IDs, classes or hooks there. Do not hand-edit `partials/pt-BR/*.html`: those six files are generated build outputs. Correct shared wording through `data/translation/pt-BR-glossary.json`, approved translation memory, or stable keys in `data/translation/pt-BR-overrides.json`.

The v3 manifest stores every stable text/attribute block with its English source/hash, last generated Portuguese value/hash, current value, engine/model, override state and review state. On an incremental run:

- if a PT page differs from the last generated value and English is unchanged, it becomes an approved manual override and enters translation memory;
- if the corresponding English block changed, current PT is preserved and a conflict is written to the review report with previous English, new English and current manual Portuguese;
- new layout and component markup is reconstructed from English while protected PT blocks remain in place.

For overrides that should exist independently of a page edit, add stable block keys to `data/translation/pt-BR-overrides.json`. Exact approved phrases and preferred terminology belong in `data/translation/pt-BR-glossary.json`. Exact glossary values take first priority, then approved translation memory, then Argos. Legitimate English brand/technical terms belong in `data/translation/pt-BR-allowlist.txt`.

## State, reports and safety

- `.translation-cache.json` — v3 block manifest and source/output hashes.
- `data/translation/pt-BR-memory.json` — reused and manually approved translations.
- `reports/translation/latest.md` — latest generation and validation report.
- `backups/pt/<timestamp>/` — pre-regeneration/destructive backups.

HTML, JSON and reports are UTF-8. Page, manifest and memory writes use same-directory temporary files plus atomic replacement. A failed unit is logged and the batch continues; no partially written destination replaces the prior file. Repeated incremental runs do not rewrite unchanged page output; the six localized partials are intentionally rebuilt from English and remain deterministic.

## Validation and tests

```bash
python3 scripts/check-portuguese-site.py
python3 tests/test_portuguese_generation.py
```

Validation checks page coverage, `lang`, reciprocal hreflang, title/description metadata, structure/class/ID parity, duplicate IDs, broken local links/assets, missing blocks, untranslated exact matches, likely English residue, possible Portuguese in English, and European-Portuguese wording. Warnings are included in the human-readable review report; legitimate exceptions should be documented in the allowlist rather than hidden in code.
