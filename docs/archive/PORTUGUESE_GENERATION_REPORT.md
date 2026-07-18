# Portuguese generation refactor report

## Baseline findings

- The former generator used page-level hashes and a glossary/word-replacement fallback. Without Argos installed it could emit mixed English/Portuguese sentences while still updating every PT file.
- The old cache could not identify direct manual edits at content-block level, preserve them through English structure changes, or explain conflicts.
- Shared chrome was loaded from English partials and then partly translated at runtime, so PT output depended on JavaScript label patches and repeated page translations.
- Validation did not comprehensively compare HTML structure, classes, IDs, metadata, hreflang, local links, localized partials or English/PT language residue.
- All 21 PT pages existed, but the baseline contained mixed-language generated content. The legacy output and cache were retained in timestamped backups before replacement.

## Implemented architecture

- `scripts/generate-portuguese-site.py` is now a small interactive/CLI entry point.
- `scripts/pt_translation/argos_engine.py` owns free local Argos model discovery, installation and translation.
- `scripts/pt_translation/html_document.py` owns parser-based block extraction and structure-preserving PT reconstruction.
- `scripts/pt_translation/generator.py` owns discovery, content hashes, block manifests, translation memory, glossary priority, direct-edit detection, conflicts, backups, atomic writes, progress and reports.
- `scripts/pt_translation/validation.py` owns bilingual page/partial validation.
- `.translation-cache.json` is now a v3 block manifest. `data/translation/pt-BR-memory.json` provides reusable translation memory; glossary, overrides and allowlist are separately editable configuration.
- `partials/pt-BR/` centralizes the translated header, footer, mobile menu, cookie controls, top bar and floating tools. Portuguese pages prefer those partials; the former runtime label localization remains only as a resilient fallback.

## Generated and changed output

- Regenerated: all 21 files under `pt/` from the current English HTML sources with Argos `en → pb` (Portuguese Brazil).
- Created: six files under `partials/pt-BR/`.
- Corrected the English mobile-menu role from Portuguese to English; the PT partial receives its Brazilian Portuguese equivalent.
- Preserved public URLs, element structure, classes, IDs, data/JS hooks, form names/actions, asset paths, metadata structure, schema keys and integrations.
- Added reciprocal page-specific hreflang/canonical handling and equivalent-page runtime language links.

## Manual overrides and update behavior

- Direct text edits in `pt/*.html` or `partials/pt-BR/*.html` are detected by comparing each current block with its last generated value.
- Incremental runs retain those edits and approve them in translation memory when the English block is unchanged.
- If English changed, the PT edit is retained and the report records old English, new English and current manual Portuguese as a review conflict.
- Complete regeneration warns, confirms, backs up current PT output, and offers preserve/discard behavior.
- Obsolete output deletion is report-only by default and requires explicit confirmation; deleted files are backed up first.

## Validation performed

- Argos model: English (`en`) → Portuguese (Brazil) (`pb`).
- Complete generation: 21 pages updated, six localized partials created, zero translation failures.
- Final incremental run: 27/27 units skipped; manifest, memory, PT HTML and localized-partial hashes remained byte-identical.
- PT validator: 27 units, zero errors, zero warnings under strict mode.
- Unit tests: eight passed, covering unchanged detection, incremental/full modes, backup creation, direct-edit preservation, conflict detection, structural/attribute preservation, glossary priority, translation failure and interrupted atomic writes.
- Browser smoke, mobile 390 px: 21 PT pages, zero failures for localized partial loading, `lang`, landmarks, duplicate IDs, console errors and horizontal overflow.
- Browser smoke, desktop 1440 px: 21 PT pages, zero failures for reciprocal equivalent-page language links and horizontal overflow.
- JavaScript/Python syntax and `git diff --check`: passed.
- The repository-wide interaction auditor exposed a container Chromium/Vulkan tab-creation failure. Its launch options now disable GPU use; focused all-PT browser checks passed in fresh software-only sessions. This environment failure did not identify a site assertion failure.

## Backups, state and review

- Initial legacy backup: `backups/pt/20260713-151001/`.
- Additional pre-update backups were created during glossary refinement.
- Current manifest: `.translation-cache.json`.
- Current report: `reports/translation/latest.md`.
- Setup and maintenance guide: `docs/PORTUGUESE_GENERATION.md`.

No unresolved generator, structural, link, language or browser-smoke validation errors remain. Machine-translated copy can still be improved editorially by writing directly in PT HTML; those improvements are now protected by the incremental workflow.
