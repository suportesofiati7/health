# Prompt 07 Final Regression Audit

## Purpose
Guide a final read-only regression pass after implementation work to decide whether the site is ready for review.

## Applies To
- All `concepts/*` pages, partials, CSS and JS for inspection
- `audit/reports/`
- `docs/agent-system/18-concept-by-concept-audit.md`
- `docs/agent-system/19-known-errors-and-regressions.md`
- `docs/agent-system/20-implementation-task-ledger.md`
- `docs/sofiati-task-ledger.md`

## Specific Rules
- Audit only unless the user explicitly requests fixes.
- Confirm previously listed critical and high-priority issues are resolved.
- Check desktop and mobile, not just source.
- Check headers, menus, language switchers, CTAs, footers, forms, WhatsApp, overflow, links, metadata, schema and legal text.
- Do not mark complete until static audits and rendered visual checks pass or blockers are documented.

## Common Failure Patterns
- Declaring pass from static scripts while rendered nav/footer issues remain.
- Checking only home pages.
- Missing sitemap pages, legal pages or low-traffic page types.
- Forgetting console errors after JS or partial changes.
- Not comparing concepts for repeated visual patterns.

## How An AI Agent Should Verify The Work
- Run the existing static audit scripts.
- Serve the site locally and capture desktop/mobile screenshots or DOM measurements.
- Check representative pages from every page type, with deeper review for concepts that were edited.
- Use `rg` for banned labels and known-risk patterns.
- Confirm `git status --short` matches expected documentation/report changes for an audit-only task.

## Completion Checklist
- [ ] Static audits pass or blockers are listed.
- [ ] Desktop and mobile rendered checks pass.
- [ ] Headers, footers, switchers, CTAs, forms and widgets are verified.
- [ ] Broken links and sitemap issues are reviewed.
- [ ] Remaining issues are prioritized in `19`.
- [ ] `18`, `20` and `docs/sofiati-task-ledger.md` are updated.

## Agent Prompt
Run a final regression audit only. Read the required Sofiati and agent-system docs, inspect all concepts, run static audits, perform rendered desktop/mobile checks and update the audit, known-errors, implementation ledger and Sofiati ledger. Do not fix code unless the user changes the task.
