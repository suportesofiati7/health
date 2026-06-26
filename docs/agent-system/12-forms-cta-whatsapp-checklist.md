# 12 Forms CTA WhatsApp Checklist

## Purpose
Keep conversion paths usable, ethical and JS-rendered correctly.

## Applies To
- `concepts/*/partials/consultation-form.html`
- `concepts/*/partials/floating-whatsapp.html`
- `concepts/*/partials/floating-widgets.html`
- `concepts/*/js/main.js`
- `concepts/*/js/partials.js`
- Header and footer CTAs

## Specific Rules
- Consultation is the primary action.
- Header/menu CTA must stand out from normal links.
- Consultation forms should use the approved Formspree endpoint `https://formspree.io/f/xzdldkjy`.
- Form fields: name, WhatsApp, email, treatment interest, message, privacy acknowledgement.
- Do not ask visitors for sensitive medical details in the form note.
- Floating WhatsApp link must use `https://wa.me/5543991043536`.
- Floating WhatsApp and back-to-top must not overlap content or each other.

## Current Audit Notes
- `partials/consultation-form.html` contains accessible labels and privacy acknowledgement.
- `data-partial-mount="consultation-form"` appears on 950 concept pages; sitemap pages omit it.
- Raw HTML does not contain actual forms or WhatsApp links before JS partial injection.
- `10-essence` lacks a measured desktop header CTA.

## Common Failure Patterns
- Auditing forms from raw HTML only.
- Making consultation CTA indistinguishable from nav links.
- Reusing the exact same CTA treatment in every concept.
- Letting floating widgets cover footer copyright or cookie choices.

## How An AI Agent Should Verify The Work
- Render pages through a local server.
- Confirm the form exists after partial injection.
- Submit behavior should show loading/success/error states without breaking privacy language.
- Check floating WhatsApp location on mobile and desktop.

## Completion Checklist
- [ ] Header/menu CTA is visible and distinct.
- [ ] Form labels and privacy checkbox are present.
- [ ] WhatsApp URL is correct.
- [ ] Floating widgets do not block content.
- [ ] Rendered-page conversion paths work.
