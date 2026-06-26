# Prompt 02 Fix Header Navigation

## Purpose
Guide a focused implementation pass for desktop and mobile header/navigation issues while preserving concept uniqueness.

## Applies To
- `concepts/*/partials/header.html`
- `concepts/*/css/styles.css`
- `concepts/*/js/main.js`
- `concepts/*/*.html` only if a header link target must be corrected
- `docs/agent-system/05-header-navigation-standards.md`
- `docs/agent-system/14-translation-language-switcher-checklist.md`

## Specific Rules
- Fix only concepts and files identified in the task or audit.
- Desktop navigation must stay on one line.
- Use `About`, not `Brand` or `Brand and Trust`.
- Keep Legal and Contact visible.
- Make the consultation CTA more prominent than ordinary nav links.
- Do not make all headers share the same rhythm, animation or CTA treatment.
- Mobile menus must open, close, trap readable controls visually and avoid horizontal overflow.

## Common Failure Patterns
- Shrinking text until it becomes unreadable.
- Moving essential links into hidden overflow on desktop.
- Fixing desktop wrap while breaking mobile menu fit.
- Reusing one CTA style across all concepts.
- Forgetting Concepts `03-enhance`, `06-refine`, `16-grace`, `28-pure`, `30-method` and `46-curate`.

## How An AI Agent Should Verify The Work
- Run `rg -n "Brand|Brand and Trust" concepts/*/partials/header.html concepts/*/sitemap.html`.
- Render desktop widths around 1280, 1440 and 1600 px and verify nav row count is one.
- Render mobile widths around 390 px and verify menu open/close, language switcher fit and no overflow.
- Check screenshot contact sheets or browser screenshots before and after the change.

## Completion Checklist
- [ ] Affected header partials and styles were inspected before editing.
- [ ] Desktop nav stays on one line.
- [ ] Mobile menu is readable and contained.
- [ ] Consultation CTA is visibly primary.
- [ ] `About`, Legal and Contact labels are correct.
- [ ] `19-known-errors-and-regressions.md` and `20-implementation-task-ledger.md` are updated.

## Agent Prompt
Fix header/navigation only for the concepts listed in the audit. Preserve each concept's visual identity. Verify one-line desktop nav, mobile menu behavior, language switcher fit, CTA prominence, readable contrast and no horizontal overflow. Update the agent-system known-errors and task-ledger docs with exact changes and verification evidence.
