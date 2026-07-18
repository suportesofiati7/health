# Front-end architecture audit and migration plan (historical baseline)

> This records the pre-rebuild system. See `docs/rebuild/final-rebuild-report.md` for the current implementation.

Date: 2026-07-13

## Current architecture

The repository is a framework-free bilingual static site with 42 public routes. English page bodies are generated from `data/content-master.json` by `scripts/render-english-site.py`; PT-BR pages are draft derivatives produced by `scripts/generate-portuguese-site.py`. Page heads, canonical URLs, metadata, JSON-LD, body page/family classes and shared-partial mounts remain in the generated HTML files.

Shared chrome is loaded at runtime from `partials/` by `js/sofiati-site.js`. This is compatible with the existing static hosting model but requires HTTP rather than `file://`. The shared header, mobile navigation, footer, cookie controls, top bar and floating controls are genuine reusable structures. Main content and SEO do not depend on those runtime requests.

The CSS currently loads as three global files in strict cascade order:

1. `css/sofiati-theme.css` — 9,271 lines containing foundations, several historical redesign layers, components, page-family rules and generated-section rules.
2. `css/sofiati-interstitials.css` — 2,357 lines containing shared editorial patterns, wide-screen composition and treatment-specific rules.
3. `css/sofiati-resolution.css` — 894 lines containing the current tokens, container authority, components, responsive rules and accessibility corrections.

In addition, seven partial files contain approximately 1,650 lines of embedded `<style>` rules. Those styles are inserted after the global cascade and therefore have implicit load-order authority.

The single 1,192-line JavaScript IIFE contains DOM helpers, shared state, partial loading, presentation enhancement, treatment controls, mobile navigation, header/floating controls, consent, forms, language handling, FAQ/blog search, localisation, reveal effects and application bootstrapping.

## Confirmed problems

- CSS responsibility cannot be inferred from filenames; the largest file contains unrelated foundations, components, sections, page families and successive correction passes.
- Historical override layers make the effective source of a visual decision difficult to locate.
- Component CSS embedded in partial HTML mixes structure and presentation, prevents normal stylesheet caching and hides the real cascade.
- The JavaScript monolith has internal grouping but no import boundaries or explicit dependency graph.
- Asset-prefix detection depends on the legacy stylesheet filename.
- `partials/topbar.html` is an older duplicate; all page mounts resolve `topbar` to `partials/top-bar.html`, so the duplicate has no runtime consumer.
- Generated main sections have strong semantic boundaries and comments, but inner markup remains compact because the renderer concatenates fragments.
- There is no authored-source versus generated-output CSS workflow, so safe modularisation currently requires public pages to load multiple historical files directly.

## Existing strengths retained

- The standard-library English renderer and structured content master.
- Stable public routes, metadata, JSON-LD, form contracts and language variants.
- Runtime partials for genuinely shared chrome.
- Semantic section pattern names and page-family body classes.
- Dependency-free browser code and progressive enhancement.
- Existing static, asset, interaction, responsive and screenshot validation tools.

## Target architecture

The migration uses modular authored CSS under `css/src/`, one generated production stylesheet at `css/site.css`, native ES modules under `js/`, and the existing partial/rendering system.

CSS source order is explicit in `scripts/build-css.py`: foundations, layout, components, section patterns, page/page-family composition, utilities/accessibility and shared partial components. The build concatenates sources without rewriting selectors, preserving cascade behavior while giving every authored file a meaningful responsibility. Public pages load only `site.css`.

JavaScript uses `js/main.js` as the single module entry. Shared DOM/page/state primitives live under `js/core/`; runtime partial loading and interactive controls live under `js/components/`; non-essential presentation behavior lives under `js/effects/`; content-directory/search behavior lives under `js/pages/`. Modules expose focused `init*` functions and retain the public `window.SofiatiSite` compatibility API.

Partial files contain semantic HTML only. Their component CSS moves to `css/src/components/` and is included near the end of the generated cascade to preserve the previous post-load authority.

## Compatibility decisions

- Native ES modules are compatible with the existing HTTP-only local workflow and static hosting assumptions. No bundler or package dependency is introduced.
- Nested `/pt/` pages use `../css/site.css` and `../js/main.js`; module-relative imports resolve from `js/`, independent of the page route.
- CSS image URLs remain relative to the final `css/site.css`, matching the current files’ location.
- Page heads remain page-specific because canonical, social and structured metadata differ by route. A client-side head partial would harm SEO and is not introduced.
- The CSS build output is generated and must not be hand-edited.

## Migration sequence

1. Establish this audit and dependency map.
2. Extract partial styles and split existing CSS into ordered authored modules without changing rule text.
3. Add and run the deterministic CSS build.
4. Split JavaScript by responsibility and connect one module entry point.
5. Update renderer-preserved page references and regenerate both language trees.
6. remove obsolete duplicate/legacy entry files only after the new output passes validation.
7. Run static, interaction, responsive and rendered visual regression checks.
