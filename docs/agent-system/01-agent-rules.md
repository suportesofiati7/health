# 01 Agent Rules

## Purpose
Define the operating workflow for agents so documentation, audit and implementation work stays focused.

## Applies To
- Every future AI-agent task in this repository
- `docs/agent-system/`
- `docs/sofiati-task-ledger.md`
- All `concepts/*` files

## Specific Rules
- Follow the repository instruction order: read the Sofiati ledger, master brief and current task brief first.
- Inspect before editing. Never assume the structure of a concept from another concept.
- Do not restart the project or delete existing useful work.
- Do not edit live HTML, CSS or JS during audit-only tasks.
- Make focused changes. Avoid broad refactors unless the task explicitly asks for a systemic pass.
- After implementation, verify desktop header, mobile header/menu, language switcher, footer, CTA, page overflow, broken links and console behavior.
- Update the agent-system ledger and known-errors docs after each batch.

## Common Failure Patterns
- Starting with fixes before reading the docs and target files.
- Using memory or chat context as the project source of truth.
- Repairing one concept by normalizing all concepts into the same pattern.
- Running only static scripts for visual problems.
- Forgetting that partials are injected by `js/partials.js`.

## How An AI Agent Should Verify The Work
- Confirm the task mode: audit-only, docs-only, implementation or review.
- Check `git status --short` before and after work.
- Verify whether files were changed outside the task scope.
- For rendered elements, load pages through a local server because partials and widgets depend on JS.
- Record exact file paths and test commands in the ledger.

## Completion Checklist
- [ ] Required docs were read.
- [ ] Relevant concept files were inspected.
- [ ] A short plan exists before implementation.
- [ ] Changes are limited to the requested scope.
- [ ] Verification was run or a blocker is documented.
- [ ] Agent-system docs were updated.
