# 20 Implementation Task Ledger

## Purpose
Provide future agents with a practical order of operations after this documentation/audit batch.

## Applies To
- `docs/agent-system/18-concept-by-concept-audit.md`
- `docs/agent-system/19-known-errors-and-regressions.md`
- `docs/agent-system/21-how-to-use-audit-docs-and-fix-workflow.md`
- All future implementation batches

## Specific Rules
- Do not start implementation from this ledger unless the user requests fixes.
- Fix critical rendered visual issues before low-risk content polish.
- After every implementation batch, update this file and `19-known-errors-and-regressions.md`.
- Preserve concept uniqueness in systemic repairs.

## Common Failure Patterns
- Fixing easy copy issues while leaving critical header/footer visual failures.
- Applying one universal footer/CTA style to all concepts.
- Forgetting rendered verification after source edits.
- Marking the project complete before visual audits pass.

## How An AI Agent Should Verify The Work
- Use the verification method listed for each ledger item.
- Re-run static audits after HTML/schema/link changes.
- Re-render screenshots after visual CSS/partial changes.
- Compare before/after screenshots for concept uniqueness.

## Completion Checklist
- [ ] All critical header/menu issues fixed.
- [x] Footer labels and sitemap labels fixed.
- [ ] Copyright centered everywhere.
- [ ] Footer boxes/circles removed.
- [ ] Language switchers verified in Concepts 3 and 28.
- [ ] Static and screenshot audits pass.

## Batch Log

| Date | Batch | Status | Notes |
| --- | --- | --- | --- |
| 2026-06-26 | Agent documentation and audit system | COMPLETE FOR DOCS/AUDIT ONLY | Created `docs/agent-system/`, standards docs, prompts, concept-by-concept audit, known errors and implementation ledger. No live page/CSS/JS/layout fixes were made. |
| 2026-06-26 | One-command audit pipeline script | COMPLETE FOR TOOLING ONLY | Added `scripts/run_agent_audit_pipeline.py` to run audits, screenshots and a review report. The script can apply only deterministic Brand-to-About label fixes with `--fix-safe-labels`; visual fixes remain agent-guided. |
| 2026-06-26 | Concept brief system, rendered diagnostics and safe label cleanup | COMPLETE FOR DOCS/AUDIT + SAFE LABEL FIX | Created `docs/agent-brief-system/` with 50 specific concept briefs, issue register, uniqueness matrix and ledgers. Ran full audit/screenshot pipeline plus rendered responsive diagnostics. Applied only deterministic public label fixes in footers and sitemap pages; no CSS/layout redesign was attempted. |
| 2026-06-26 | Human runbook for docs, audits, screenshots and fixes | COMPLETE FOR GUIDANCE | Added `docs/agent-system/21-how-to-use-audit-docs-and-fix-workflow.md` to explain what scripts exist, which commands are safe, which scripts can modify files, and why visual problems should be fixed in concept-specific batches rather than one automatic global repair. |

## Completed Fixes

| Date | Fix | Scope | Verification |
| --- | --- | --- | --- |
| 2026-06-26 | Replaced public `Brand` / `Brand and Trust` footer labels with `About`, and `Brand and education` sitemap labels with `About and education`. | `concepts/*/partials/footer.html`, `concepts/*/sitemap.html` | `rg` banned-label search returns no hits; `python3 scripts/audit_public_partials.py` passes 50/50; `./scripts/run_agent_audit_pipeline.py --skip-screenshots` passes. |

## Recommended Future Fix Order

| Order | Task | Scope | Priority | Verification |
| --- | --- | --- | --- | --- |
| 1 | Center footer copyright everywhere | Concepts with measured desktop offset in `docs/agent-brief-system/16-audit-system/16-20-issue-register.md` | high | Rendered copyright center delta within 40px; desktop/mobile screenshots. |
| 2 | Remove forbidden footer boxes/circles/rectangles | Start with `03`, `05`, `06`, `11`, `13`, `15`, `18`, `28`, then review all | critical | Screenshot review confirms no boxed/circular footer columns. |
| 3 | Fix desktop header wrapping | Concepts flagged by `scripts/audit_rendered_concepts.py`, including `01`, `06`, `07`, `16`, `22`, `28`, `30`, `31`, `46` | critical | Rendered nav row count equals 1 at 1024, 1366 and 1440px. |
| 4 | Fix concept-specific header issues | `05-elevate`, `10-essence`, `27-form` | critical | Desktop screenshots show balanced header, visible CTA/nav, no boxed logo. |
| 5 | Fix language/menu readability issues | `03-enhance`, `28-pure` | critical | Mobile screenshots show readable EN/PT and close/menu controls. |
| 6 | Verify forms, WhatsApp and cookie/floating controls | Representative pages across all concepts | medium | Rendered form and `wa.me` link visible; no widget overlap. |
| 7 | Decide root sitemap policy | `sitemap.xml` | medium | Document whether concept `sitemap.html` pages should be included. |
| 8 | Final regression audit | All concepts | high | Static audits pass; screenshots reviewed; no console errors. |
