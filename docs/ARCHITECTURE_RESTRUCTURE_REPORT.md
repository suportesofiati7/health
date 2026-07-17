# Architecture restructuring report

Date: 2026-07-13

## Existing problems

- Three public stylesheets exposed 12,522 lines of layered theme, component, section, page and correction rules with unclear ownership.
- A 9,271-line theme file contained several historical generations and unrelated responsibilities.
- Six active partials embedded approximately 1,650 lines of component CSS, mixing structure and presentation and relying on runtime insertion order.
- One 1,192-line JavaScript IIFE combined shared data, partial loading, navigation, consent, forms, localisation, page search, treatment logic and effects.
- Runtime asset-prefix detection depended on a legacy stylesheet filename.
- An obsolete 356-line `partials/topbar.html` duplicated the maintained `top-bar.html` implementation.
- Generated page interiors were semantically divided but compactly concatenated, making inner structures hard to scan.

## Selected architecture

The repository remains a framework-free static site. Authored CSS is divided by responsibility under `css/src/` and deterministically compiled into one deployable `css/site.css`. Browser behavior uses native ES modules with `js/main.js` as the sole entry. Existing structured-content rendering and runtime HTML partials remain because they already match the hosting model and preserve SEO.

This approach adds no framework, bundler, npm dependency or server-side requirement. It provides explicit dependencies while preserving public static deployment.

## Files created

- 32 authored CSS modules under `css/src/`, including the final English-only art-direction contract.
- `css/site.css` generated production output.
- `scripts/build-css.py` with build and stale-output check modes.
- `js/main.js`.
- Four core JS modules, eight component modules, two effect modules and two page modules.
- `docs/ARCHITECTURE_AUDIT.md` and this report.

## Files moved or reorganised

- CSS from the former theme, interstitial and resolution files was split into foundation, layout, component, section, page, effect and utility sources while preserving rule order.
- Partial `<style>` blocks moved to matching component CSS modules.
- Functions from the former JavaScript IIFE moved to focused imports and exports.
- Ten top-level token blocks were consolidated into `css/src/foundations/tokens.css` in their original declaration order.

## Files removed

- `css/sofiati-theme.css`.
- `css/sofiati-interstitials.css`.
- `css/sofiati-resolution.css`.
- `js/sofiati-site.js`.
- obsolete `partials/topbar.html`.
- one-time migration helpers after their output was verified.

## Shared HTML and components

The central partial set is top bar, header/desktop navigation, mobile menu, footer, cookie banner and floating tools. All are HTML-only and styled through component modules. Changing shared chrome no longer requires page edits or embedded CSS maintenance.

Reusable CSS responsibility now covers buttons; breadcrumbs; cards/process; forms/directories; header; mobile menu; footer; top bar; cookie controls; floating tools; hero/editorial splits; interstitials; statements/reading; generated content patterns; page families; and the treatment-specific directory.

## JavaScript modules

The runtime now has explicit core, component, effect and page boundaries. Component initializers retain defensive DOM checks and idempotence. The public `window.SofiatiSite` interface remains available. The unreferenced `initImmersiveHero` function and its duplicate unreachable line were not migrated after repository-wide reference checks confirmed they were dead code.

## Names and loading changes

- Public stylesheet loading changed from three legacy files to one `css/site.css`.
- Public script loading changed from deferred classic `js/sofiati-site.js` to module entry `js/main.js`.
- No public component classes, form field names, IDs, URLs, metadata fields or analytics/integration hooks were renamed.
- Asset-prefix detection now follows `site.css` and retains a path-based fallback.

## Build changes

`python3 scripts/build-css.py` creates the committed production stylesheet. `--check` fails when output is stale. HTML rendering remains standard-library Python, and JavaScript requires no build step.

## Duplicate code removed

- Duplicate topbar structure and its inline CSS.
- Embedded copies of active partial styling.
- The inactive immersive-hero JavaScript branch.
- Parallel public legacy CSS/JS entry systems after the modular replacements passed interaction validation.

Historical declaration overlap inside the preserved visual system was not blindly removed. Remaining consolidation should be driven by full CSS coverage and screenshot comparison, not selector-name guesses.

## Validation and tested functionality

All 42 routes are included in static, asset, console and responsive tooling. Interaction coverage exercises both languages, mobile navigation focus/return, cookie persistence, FAQ/blog/treatment search, accessible invalid form states and locally intercepted successful submissions.

Final command results and visual evidence are recorded in `docs/PAGE_INVENTORY.md` and `docs/REFACTOR_REPORT.md`.

## Remaining issues and manual review

- PT-BR remains an automated mixed-language draft and requires qualified human translation review.
- External Formspree delivery is not invoked during QA; local integration states are tested through interception.
- Physical Safari/iOS and Windows high-contrast review remain advisable because those environments are unavailable here.
- The central source architecture makes remaining historical CSS overlap discoverable, but removing it safely is future coverage-led work.
