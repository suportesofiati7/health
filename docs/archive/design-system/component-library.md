# Component system

Components own reusable interface appearance and state. Compositions own relationships between components; route modules own page-specific art direction. This separation preserves consistency without forcing every page into one template.

## Core components

| Component | States / variants | Implementation |
|---|---|---|
| top bar and header | current route, hover/focus, scrolled, desktop/mobile transition | `top-bar.css`, `header.css`, `header.js` |
| mobile menu | hidden/open, focus trap, Escape close, focus return | `mobile-menu.css`, `navigation.js` |
| footer | light-olive authority surface, navigation/contact/legal groups | `footer.css` |
| button | primary, outline, light, quiet, hover/focus/disabled | `buttons.css` |
| content/treatment card | focus, consideration, support, caution, link, filtered/hidden | `cards.css`, `treatments.js` |
| form | labelled controls, checkbox/consent, invalid, busy, success, failure | `forms.css`, `forms.js` |
| accordion/disclosure | closed/open, native keyboard behavior, section and item variants | `disclosures.css` |
| directory/filter | sticky desktop filter, mobile reflow, empty/status state | `directories.css`, page filter modules |
| cookie interface | initial, preference editor, accept/reject/save | `cookie-banner.css`, `cookie-controls.js` |
| floating tools | WhatsApp, back-to-top, visible/hidden, focus label | `floating-tools.css`, `floating-tools.js` |

## System primitives

`components/system-primitives.css` provides intentional treatments for low-frequency interfaces so they never fall back to unrelated browser defaults:

- badges and metadata;
- notices, empty states, error states and success states;
- responsive table wrappers;
- pagination;
- accessible tab presentation (`role="tablist"`, `tab`, `tabpanel`);
- dialogs/modals and backdrop;
- galleries and slider controls;
- icon buttons and video framing;
- forced-colour boundaries.

JavaScript is added only when a state requires behavior. Styling a future tab or modal does not imply inaccessible behavior; its implementation must still provide the appropriate keyboard and focus contract.

## Shared contracts

- Interactive targets are at least `2.75rem` (44px) in both axes.
- Focus-visible uses `--focus-ring` and is never removed without a replacement.
- Labels remain at least 14px and controls use `--control-height: 3.25rem`.
- Portuguese labels wrap; components do not use fixed content heights.
- Disabled, invalid, success and error states include more than colour.
- Hover is supplementary; keyboard and touch expose the same action.
- Motion is subtle and removed/reduced under `prefers-reduced-motion`.
- Essential navigation and content remain available without JavaScript.

## Composition boundary

Cards do not select section tone, section spacing or route-specific columns. A route module may choose a different hero arrangement or make one section an editorial ledger; it must not fork the global button, form or focus language.
