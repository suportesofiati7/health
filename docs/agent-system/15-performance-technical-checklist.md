# 15 Performance Technical Checklist

## Purpose
Keep the static site technically stable while visual polish continues.

## Applies To
- All concept HTML/CSS/JS
- `scripts/`
- `assets/`
- Cookie, partial and widget scripts

## Specific Rules
- Static pages should load without build tooling.
- JS partial injection must not block essential navigation indefinitely.
- Avoid adding heavy libraries for simple UI fixes.
- Keep CSS scoped to concept folders unless a systemic generated pass is intended.
- Preserve reduced-motion behavior.
- Compress or optimize any new bitmap assets.
- Do not add analytics/cookie claims unless implemented.

## Current Audit Notes
- Static audit reports pass.
- Forms, floating widgets and richer schema depend on rendered JS partials.
- Cookie bars are loaded through per-concept `assets/js/sofiati-footer-cookie.js`.

## Common Failure Patterns
- Adding large JS for minor animation.
- Breaking partial injection while changing markup names.
- Duplicating large CSS blocks across concepts without need.
- Forgetting syntax checks after JS edits.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_static_site.py`.
- Syntax-check changed JS files.
- Load representative pages through a local server and check console errors.
- Verify reduced-motion behavior after animation changes.

## Completion Checklist
- [ ] No console errors in sampled pages.
- [ ] JS partials mount successfully.
- [ ] Static audit passes.
- [ ] New assets are optimized.
- [ ] Cookie behavior remains accurate.
