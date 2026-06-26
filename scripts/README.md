# Scripts

- `build_selector_pages.py` is retained for old selector experiments; the standalone rebuild now writes `index.html` and `select.html` from `generate_concepts.py`.
- `generate_concepts.py` rebuilds the 50 self-contained English-first Sofiati concepts with flat pages, local CSS, local JS, local partials, copied assets and design notes.
- `translate_pages.py` creates a non-destructive English-source translation inventory in `data/translation-strings.json` and `final/translation-report.*`; it does not rewrite the reviewed concepts.
- `capture_homepage_screenshots.py` captures desktop and mobile first-viewport screenshots for the selector homepage and all 50 standalone concept homepages into `final/homepage-screenshots/`.
- `run_agent_audit_pipeline.py` runs the current audit scripts, screenshot captures, public-partial review and `audit/reports/agent-pipeline-review.md`; pass `--fix-safe-labels` to apply only deterministic Brand-to-About label fixes before auditing.
- `audit_rendered_concepts.py` runs a browser-rendered responsive diagnostic across all 50 concept homepages at 360, 390, 768, 1024, 1366 and 1440px; it writes `audit/reports/rendered-responsive-diagnostic.*` and does not modify site files.
- `generate_agent_brief_system.py` creates or refreshes `docs/agent-brief-system/` concept briefs, issue register, uniqueness matrix and ledgers from current files, screenshots and diagnostics; pass `--safe-label-fix-recorded` only after the deterministic label cleanup has been applied.
- `audit_static_site.py` checks standalone folder structure, local runtime dependencies, page completeness, local links, English-first copy, safety copy, service coverage, disclaimers, uniqueness markers, screenshots and tracked video files.
- `git_update.sh` runs `git add -A`, commits with a dated message and pushes the current branch.
- `git_update_allow_empty.sh` does the same but allows an empty commit.
