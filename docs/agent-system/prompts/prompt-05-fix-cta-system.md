# Prompt 05 Fix CTA System

## Purpose
Guide a focused pass for consultation CTA prominence, consistency of purpose and concept-specific visual variety.

## Applies To
- `concepts/*/partials/header.html`
- `concepts/*/partials/floating-whatsapp.html`
- `concepts/*/partials/consultation-form.html`
- `concepts/*/css/styles.css`
- `concepts/*/js/main.js`
- `docs/agent-system/12-forms-cta-whatsapp-checklist.md`

## Specific Rules
- Consultation is the primary action and must stand out from ordinary nav links.
- CTA treatments must vary by concept using tasteful borders, gradients, glows, underline reveals or motion.
- Do not use the same CTA design everywhere.
- WhatsApp CTA must remain accessible, not overlap key content and use the approved number already present in the repo unless the task says otherwise.
- Forms must keep labels, privacy consent and non-medical promise wording.

## Common Failure Patterns
- Making CTAs loud in a way that breaks premium calm design.
- Styling all CTAs identically across concepts.
- Making a header CTA prominent but causing menu wrap.
- Letting floating WhatsApp cover mobile footer/legal controls.
- Changing form destinations without approval.

## How An AI Agent Should Verify The Work
- Render representative concepts across different design families.
- Check header CTA, in-page consultation form CTA and floating WhatsApp on desktop and mobile.
- Inspect tab focus visibility and accessible labels.
- Confirm no console errors from CTA or widget scripts.

## Completion Checklist
- [ ] Header CTA is prominent without breaking one-line nav.
- [ ] CTA styling remains concept-specific.
- [ ] Consultation form labels and consent remain intact.
- [ ] WhatsApp floating action is visible and non-overlapping.
- [ ] Accessibility labels and focus states are verified.
- [ ] Known-errors and ledger docs are updated.

## Agent Prompt
Improve the consultation CTA system only. Keep the CTA primary, premium and concept-specific. Verify header CTA visibility, form CTA behavior, WhatsApp visibility, focus states, mobile overlap and no nav wrapping. Do not change destinations or legal wording without explicit instruction. Update the agent-system docs.
