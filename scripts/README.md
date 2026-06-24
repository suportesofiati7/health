# Scripts

- `build_selector_pages.py` renders the compact `index.html` and `select.html` concept selector from `data/concepts.json`.
- `generate_concepts.py` rebuilds the 50 standalone English-source Sofiati concepts and their concept-specific CSS.
- `translate_pages.py` rewrites static HTML to Portuguese by default and regenerates `js/translations.js` for the PT/EN header switcher.
- `capture_homepage_screenshots.py` captures desktop and mobile first-viewport screenshots for the selector homepage and all 50 concept homepages into `final/homepage-screenshots/`.
- `audit_static_site.py` checks page completeness, local links, safety copy, service coverage, disclaimers, screenshots and tracked video files.
- `git_update.sh` runs `git add -A`, commits with a dated message and pushes the current branch.
- `git_update_allow_empty.sh` does the same but allows an empty commit.
