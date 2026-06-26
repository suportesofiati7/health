# Prompt 04 Fix Language Switcher

## Purpose
Guide a targeted repair pass for language switcher fit, contrast and interaction without destabilizing header layouts.

## Applies To
- `concepts/*/partials/header.html`
- `concepts/*/css/styles.css`
- `concepts/*/js/main.js`
- `docs/agent-system/14-translation-language-switcher-checklist.md`
- `docs/agent-system/05-header-navigation-standards.md`

## Specific Rules
- The language switcher must fit inside desktop and mobile headers.
- It must not push navigation onto two lines.
- Active and inactive language labels must be readable.
- Spacing from nav links, CTA and menu controls must be sufficient.
- Check Concepts `03-enhance` and `28-pure` explicitly.
- Do not remove the switcher or hide one language state to solve layout pressure.

## Common Failure Patterns
- Fixing physical fit but leaving inactive language text too faint.
- Letting the switcher overlap the close button in mobile menus.
- Increasing switcher width and causing desktop nav wrap.
- Applying one generic pill style that clashes with concept-specific headers.

## How An AI Agent Should Verify The Work
- Render Concepts `03-enhance` and `28-pure` at desktop and mobile sizes.
- Check at least one narrow mobile width around 360 px and one common width around 390 px.
- Confirm no horizontal overflow and no nav wrapping.
- Confirm active/inactive labels pass visual contrast review.

## Completion Checklist
- [ ] Concepts `03` and `28` are verified.
- [ ] Switcher fits in desktop header.
- [ ] Switcher fits in mobile open menu/header.
- [ ] Active and inactive language states are readable.
- [ ] Header CTA and nav remain readable.
- [ ] Known-errors and ledger docs are updated.

## Agent Prompt
Fix language switcher issues only, with special attention to Concepts 3 and 28. Preserve concept-specific header styling while ensuring EN/PT controls fit, remain readable, do not create nav wrapping and do not overlap mobile controls. Verify desktop and mobile screenshots and update the agent-system docs.
