# 07 Content Voice Standards

## Purpose
Keep Sofiati copy premium, calm, ethical and conversion-focused without pressure.

## Applies To
- All `concepts/*/*.html`
- `concepts/*/partials/*.html`
- `concepts/*/page-flow-map.md`
- `concepts/*/internal-link-map.md`

## Specific Rules
- Tone: premium, calm, expert, concise, professional, patient-focused and ethical.
- Preferred wording: professional evaluation, individual assessment, personalised care, suitability depends on evaluation, results may vary, responsible expectations.
- Avoid: guaranteed results, perfect skin, painless guarantee, instant transformation, definitive result, works for everyone, risk-free, miracle, best in Brazil.
- Do not invent testimonials, patient cases, ratings, awards or full clinic details.
- Primary CTA language should rotate naturally: `Request evaluation`, `Begin with evaluation`, `Send a consultation request`, `Contact Franciele`.
- Avoid generic repeated `Learn more`.

## Common Failure Patterns
- Making every CTA say the same thing.
- Writing sales-heavy service copy that promises outcomes.
- Using `Brand` as a visible public label after footer/sitemap edits.
- Overexplaining in hero sections.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_ethics.py`.
- Search for prohibited claims with `rg`.
- Read service pages in context, not only isolated snippets.
- Confirm testimonial pages remain consent-aware placeholders.

## Completion Checklist
- [ ] Copy remains evaluation-led.
- [ ] No prohibited claims or fake proof.
- [ ] CTAs are clear and varied.
- [ ] Content is concise and readable.
- [ ] Ethical audit passes.
