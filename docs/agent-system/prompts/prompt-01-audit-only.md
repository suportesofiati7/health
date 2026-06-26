# Prompt 01 Audit Only

## Purpose
Give a future AI agent a safe prompt for repository inspection and reporting without editing live site code.

## Applies To
- `docs/agent-system/18-concept-by-concept-audit.md`
- `docs/agent-system/19-known-errors-and-regressions.md`
- `docs/agent-system/20-implementation-task-ledger.md`
- `audit/reports/`
- `concepts/*` for read-only inspection

## Specific Rules
- Do not edit HTML, CSS, JS, layouts, partials or assets.
- Read `docs/sofiati-task-ledger.md`, `docs/sofiati-master-brief.md`, `docs/current-task-brief.md` and `docs/agent-system/01-agent-rules.md` before auditing.
- Inspect every concept folder and record findings with exact file paths.
- Separate source-code findings from rendered screenshot or browser findings.
- Include priority, why it matters, suggested fix and verification method for every issue.
- Update only documentation and audit-report files requested by the task.

## Common Failure Patterns
- Accidentally fixing a visible issue during audit.
- Reporting "all concepts" without listing affected concept paths.
- Treating static audit success as visual pass.
- Missing partial-injected components because pages were not served through a local server.

## How An AI Agent Should Verify The Work
- Run `find concepts -maxdepth 1 -type d | sort` to confirm the concept set.
- Run existing static audit scripts before writing conclusions.
- Use rendered desktop and mobile checks for header, menu, language switcher, footer and widgets.
- Confirm `git status --short` shows no live HTML/CSS/JS/layout edits.

## Completion Checklist
- [ ] Required docs were read first.
- [ ] All 50 concept folders were inspected.
- [ ] Every issue includes concept number/name, file path, problem, impact, suggested fix, priority and verification.
- [ ] `18`, `19` and `20` are updated.
- [ ] No live implementation files were changed.

## Agent Prompt
Audit only. Do not fix. Read the Sofiati ledger, master brief, current task brief and agent-system docs. Inspect every concept on desktop and mobile, including partial-injected components. Update the concept audit, known regressions and implementation ledger with exact paths, priorities, suggested fixes and verification steps. Confirm that no live page, CSS, JS, partial or asset implementation changed.
