# 16 Legal Compliance Disclaimers

## Purpose
Protect medical-aesthetic ethics, privacy and public claims.

## Applies To
- All content pages
- `legal.html`, `privacy.html`, `cookies.html`, `accessibility.html`
- Footer disclaimers and form notes
- Schema data

## Specific Rules
- Website information is educational and does not replace individual professional evaluation.
- Suitability depends on professional assessment.
- Results may vary.
- Do not guarantee outcomes.
- Do not publish a full street address unless approved.
- Do not invent testimonials, reviews, ratings or before-and-after images.
- Contact forms should avoid sensitive medical details.
- Cookie copy must not claim analytics or tracking that is not implemented.

## Current Audit Notes
- `audit/reports/ethical-copy-audit.md`: PASS.
- `audit/reports/legal-accessibility-contact-audit.md`: PASS.
- Contact references use Londrina, PR only.

## Common Failure Patterns
- Adding conversion copy that becomes a promise.
- Adding review/rating schema.
- Publishing exact clinic/address details.
- Using testimonial-style placeholders that read as real patient stories.

## How An AI Agent Should Verify The Work
- Run `python3 scripts/audit_ethics.py`.
- Search for prohibited terms.
- Review schema manually after changes.
- Read result/testimonial pages for implied guarantees.

## Completion Checklist
- [ ] No guarantees or diagnosis.
- [ ] No fake proof.
- [ ] No full address.
- [ ] Disclaimers remain visible.
- [ ] Ethics/contact audits pass.
