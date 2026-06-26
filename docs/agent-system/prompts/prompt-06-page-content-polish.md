# Prompt 06 Page Content Polish

## Purpose
Guide content and page-flow polish without creating generic, duplicated or ethically risky pages.

## Applies To
- `concepts/*/*.html`
- `concepts/*/planning/page-flow-map.md`
- `concepts/*/planning/internal-link-map.md`
- `docs/agent-system/03-page-type-briefs.md`
- `docs/agent-system/07-content-voice-standards.md`
- `docs/agent-system/16-legal-compliance-disclaimers.md`
- `docs/agent-system/17-visual-non-duplication-rules.md`

## Specific Rules
- Keep one H1 per page and preserve truthful, professional, evaluation-led wording.
- Do not add fake testimonials, fake awards, fake addresses, guaranteed outcomes or before-and-after claims.
- Keep meaning consistent across languages if translation work is included.
- Preserve concept-specific section rhythm and avoid repeated generic section patterns.
- Support internal links naturally from page intent.
- Do not turn polish into a redesign unless the task explicitly requests layout changes.

## Common Failure Patterns
- Making service pages sound like sales landing pages with unsupported claims.
- Reusing the same H2 sequence across concepts.
- Adding visible copy that explains UI behavior instead of improving page content.
- Changing schema, title or meta description without updating the SEO checklist.
- Over-polishing legal or medical disclaimers into vague marketing language.

## How An AI Agent Should Verify The Work
- Run static audits for H1, metadata, schema, internal links and ethics.
- Compare nearby concepts to ensure section sequence and copy rhythm remain distinct.
- Check rendered pages for text overflow after content changes.
- Confirm any edited page still links to appropriate consultation, contact, legal and related content.

## Completion Checklist
- [ ] One H1 per edited page.
- [ ] SEO title and description remain specific.
- [ ] No prohibited claims or fake proof were introduced.
- [ ] Internal links remain useful and valid.
- [ ] Edited pages remain visually distinct from nearby concepts.
- [ ] Known-errors and ledger docs are updated.

## Agent Prompt
Polish page content only for the requested pages or concepts. Preserve ethics, SEO structure, one H1, useful internal links and concept uniqueness. Do not introduce fake proof, guarantees, full addresses or before-and-after claims. Run the static audits and update the agent-system docs with exact files changed and remaining risks.
