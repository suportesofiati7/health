# 21 How To Use The Audit, Docs And Fix Workflow

## Purpose
Give a human or future AI agent a practical operating guide for this Sofiati repository. This explains what the documentation is for, which scripts are safe to run, which scripts only audit, which scripts can modify files, and how to move from concept briefs to controlled fixes without flattening all concepts into the same design.

## Applies To
- `docs/sofiati-task-ledger.md`
- `docs/sofiati-master-brief.md`
- `docs/current-task-brief.md`
- `docs/agent-system/`
- `docs/agent-brief-system/`
- `scripts/`
- `audit/reports/`
- `audit/screenshots/`
- `final/homepage-screenshots/`
- `concepts/*`

## The Simple Mental Model
This repo has four layers:

1. Project rules: `docs/sofiati-master-brief.md`, `docs/current-task-brief.md`, `docs/sofiati-task-ledger.md`.
2. Agent rules and checklists: `docs/agent-system/`.
3. Per-concept identity briefs: `docs/agent-brief-system/15-concept-by-concept-briefs/`.
4. Scripts and audit evidence: `scripts/`, `audit/reports/`, `audit/screenshots/`.

The scripts can find problems and verify work. Most design problems still need Codex or a developer to inspect, edit, and preserve the concept identity. There should not be one script that blindly fixes every visual issue, because that would make the 50 concepts look too similar.

## Start Here Every Time
Run these commands from the repo root:

```bash
pwd
git status --short
sed -n '1,180p' docs/sofiati-task-ledger.md
sed -n '1,180p' docs/agent-system/20-implementation-task-ledger.md
sed -n '1,180p' docs/agent-brief-system/18-task-ledgers/task-ledger-master.md
```

Use this to understand whether you are auditing, fixing, or verifying.

## What The Main Docs Mean
- `docs/agent-system/19-known-errors-and-regressions.md`: human-readable priority list of known problems.
- `docs/agent-system/20-implementation-task-ledger.md`: recommended order for future fix batches.
- `docs/agent-brief-system/16-audit-system/16-20-issue-register.md`: detailed issue register with concept, file path, severity, evidence, recommended fix and status.
- `docs/agent-brief-system/17-uniqueness-matrix.md`: what each concept must preserve so future fixes do not standardize the site.
- `docs/agent-brief-system/15-concept-by-concept-briefs/*.md`: the most important files before editing a specific concept.

## How To Make Concept Docs More Comprehensive
For one concept, inspect these files before improving its brief:

```bash
sed -n '1,260p' docs/agent-brief-system/15-concept-by-concept-briefs/03-enhance.md
sed -n '1,220p' concepts/03-enhance/design-dna.md
sed -n '1,220p' concepts/03-enhance/design-notes.md
sed -n '1,180p' concepts/03-enhance/partials/header.html
sed -n '1,220p' concepts/03-enhance/partials/footer.html
rg -n "hero|footer|mobile-menu|language|public-footer|footer-bottom" concepts/03-enhance/css/style.css
```

Then inspect screenshots:

```bash
ls audit/screenshots/desktop/03-enhance-desktop.png
ls audit/screenshots/mobile/03-enhance-mobile.png
```

Improve the brief only with evidence from files and screenshots. A good update records specific layout behavior, footer personality, header rhythm, CTA behavior, typography rhythm, decoration style, current weakness and exact screenshot paths. Do not write generic language like "premium and responsive" unless it is tied to visible details.

After editing briefs, regenerate or verify the brief system:

```bash
python3 scripts/generate_agent_brief_system.py --safe-label-fix-recorded
```

Use the generator when you want the docs refreshed from current evidence. Use manual edits when a human/agent has added nuanced screenshot interpretation that the script cannot infer.

## Safe Audit Commands
These commands should not modify website source files:

```bash
python3 scripts/audit_static_site.py
python3 scripts/audit_internal_links.py
python3 scripts/audit_layout_signatures.py
python3 scripts/audit_ethics.py
python3 scripts/audit_public_partials.py
python3 scripts/audit_rendered_concepts.py --settle 0.35
```

One command for most audits:

```bash
./scripts/run_agent_audit_pipeline.py --skip-screenshots
```

Full audit with screenshots:

```bash
./scripts/run_agent_audit_pipeline.py --no-strict
```

Use the full screenshot command when visual work has changed. It takes longer.

## Screenshot Commands
Header and footer screenshots:

```bash
python3 scripts/capture_header_footer_screenshots.py
```

Homepage screenshots:

```bash
python3 scripts/capture_homepage_screenshots.py
```

Design QA screenshot matrix:

```bash
python3 scripts/run_screenshot_design_qa.py
```

Important screenshot locations:
- `audit/screenshots/desktop/`
- `audit/screenshots/mobile/`
- `audit/screenshots/desktop-contact-sheet.jpg`
- `audit/screenshots/mobile-contact-sheet.jpg`
- `final/homepage-screenshots/`

## Scripts That Can Modify Files
Do not run these casually. Inspect them first and use them only when the current task asks for that exact change.

- `scripts/run_agent_audit_pipeline.py --fix-safe-labels`: only deterministic Brand-to-About label cleanup.
- `scripts/refactor_public_partials.py`: can rewrite shared public partials.
- `scripts/refactor_sofiati_cookie_notices.py`: can rewrite cookie notice behavior.
- `scripts/restore_global_widgets.py`: can restore floating widgets.
- `scripts/repair_screenshot_design_qa.py`: can repair visual/storytelling issues across pages.
- `scripts/sofiati_complete_system.py`: broad system generation or repair script; inspect carefully before use.
- `scripts/generate_concepts.py`: can rebuild concepts; high risk if current reviewed work should be preserved.

## There Is No Safe Script To Fix All Problems
The current visual problems include footer decoration, copyright centering, header wrapping, language switcher fit, CTA visibility and concept-specific polish. A script can measure these issues, but a blind auto-fix would likely:

- make concepts look the same,
- erase deliberate footer/header personalities,
- fix one viewport while breaking another,
- remove useful design work,
- hide legal/contact links,
- change conversion hierarchy without review.

Use scripts to audit and verify. Use Codex or a developer to fix one focused batch at a time.

## Recommended Fix Workflow
1. Pick one batch from `docs/agent-system/20-implementation-task-ledger.md`.
2. Read the affected concept briefs.
3. Read the affected files in `concepts/<concept>/partials/` and `concepts/<concept>/css/style.css`.
4. Make narrow edits only.
5. Run rendered diagnostics and screenshots for the affected concepts.
6. Run static audits.
7. Update the issue register and ledgers.

For the current next batch:

```text
Fix footer copyright centering and forbidden footer boxes/circles/rectangles only for Concepts 03, 05, 11, 13, 15, 18 and 28. Read each concept brief first. Preserve each concept footer personality. Do not apply one universal footer design.
```

## Verification After A Footer Batch
Run:

```bash
python3 scripts/audit_rendered_concepts.py --settle 0.35
python3 scripts/capture_header_footer_screenshots.py
python3 scripts/audit_public_partials.py
./scripts/run_agent_audit_pipeline.py --skip-screenshots
```

Then check:

```bash
rg -n "Brand and Trust|>Brand<|aria-label=\"Brand\"|Brand and education" concepts
```

Expected result: no output.

## How To Read Audit Results
- `audit/reports/agent-pipeline-review.md`: quick pass/fail summary.
- `audit/reports/rendered-responsive-diagnostic.md`: rendered viewport problems such as nav wrapping and copyright offsets.
- `docs/agent-brief-system/16-audit-system/16-20-issue-register.md`: source of truth for pending/fixed issue status after concept brief generation.
- `docs/agent-system/19-known-errors-and-regressions.md`: shorter human-facing known issue list.

## Completion Checklist
- [ ] Read the current ledger before starting.
- [ ] Know whether the task is audit-only or implementation.
- [ ] Read affected concept briefs before editing.
- [ ] Run audit scripts before fixing.
- [ ] Fix one coherent batch only.
- [ ] Preserve each concept's distinct header, footer, CTA, image rhythm and typography.
- [ ] Run rendered diagnostics after visual edits.
- [ ] Regenerate screenshots after visual edits.
- [ ] Update issue register and ledgers.
- [ ] Do not claim the project is complete until rendered issues are resolved or explicitly deferred.

