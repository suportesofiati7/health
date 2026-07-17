# Final rebuild report

## Outcome

The bilingual Sofiati site has been redesigned in place on `refactor/current-site-rebuild` as a luminous botanical-clinical experience. All 42 public EN/PT documents retain their route, approved content, medical framing, forms, metadata, JSON-LD, consent hooks and essential interactions.

The final direction deliberately moves away from the references' darker weight: warm ivory, illuminated blush and sage create the field; olive establishes authority; champagne, pink-gold and rose-gold provide controlled detail. Editorial serif hierarchy, rounded architectural panels, carefully framed photography and varied route compositions translate the reference principles without reproducing their layouts.

## Sitewide implementation

- 47 deliberately layered CSS modules compile into one 149,621-byte production stylesheet.
- 101 live tokens govern colour, type, spacing, rails, radii, shadows, controls, focus and motion.
- 18 route modules explicitly art-direct all 21 route identities; paired Portuguese pages share the same visual contract.
- Every route has its own hero portrait, environmental image and hero crop/background composition.
- Every principal route also has one assigned vertical botanical background from `assets/backgrounds/`; English and Portuguese pairs share the corresponding image for visual consistency.
- Every route now uses the homepage hero composition: a full clinic scene, readable left copy and a different Franciele portrait held at a balanced eye-level position.
- PNG background sources are preserved while 40 WebP delivery copies reduce the referenced background payload from roughly 84 MB to roughly 5 MB.
- Supporting clinical/treatment imagery follows a 21-route sequence, removing the former repetitive photography pattern.
- The standard 84rem rail, 104rem cinematic hero rail and 68ch reading measure create one alignment spine without stretching prose.
- Shared navigation, mobile menu, footer, cookie controls, forms, disclosures, directories, filters and CTA language were redesigned as one accessible system.
- Tables, tabs, dialogs, galleries/sliders, notices, validation states, pagination, badges, video and empty states now have explicit system treatments.

## Page art direction

The design system supplies common rules rather than a universal page template:

- Home is cinematic and pathway-led, with an editorial service atlas and restrained trust sequence.
- About, mission and values use different portrait, evidence and philosophy rhythms.
- Treatments is a searchable clinical directory; skin and laser use distinct education and recovery narratives.
- Care, results and testimonials progressively shift from practical guidance to evidence and human voice.
- Journal and blog use publication-style mastheads, feature hierarchy and reading routes.
- Consultation and contact emphasise privacy, expectations and clearly grouped conversion forms.
- FAQ uses searchable, progressively disclosed categories.
- Accessibility and policy pages use quieter, readable compositions with clear hierarchy and navigation.
- Thank-you and 404 are fully branded recovery experiences rather than generic utility screens.

Forest-toned chapters are implemented as contained olive authority panels within light surroundings. This preserves trust and conversion emphasis without making the site dark-heavy. Testimonials intentionally keeps additional chapters light so the overall collection retains an illuminated rhythm.

## Accessibility and responsive behaviour

- Semantic landmarks, one-page heading hierarchy, native disclosures and labelled form controls are preserved.
- Focus-visible styling, menu focus trapping/restoration, Escape handling and 44px touch targets are built into the shared system.
- Body, list, label and summary copy remains at least 14 CSS pixels in the audited states.
- Source order remains the mobile reading order; tablet compositions are intentional rather than compressed desktop layouts.
- Intrinsic grids and bounded media replace fragile fixed-height/fixed-column behaviour.
- Reduced-motion and forced-colours modes receive explicit support.
- English and Portuguese text expansion reflows through the same mobile, tablet, desktop, ultrawide and zoom contract.

## Architecture and maintenance

The repository remains framework-free and statically hosted. The layered source lives under `css/src/`; `scripts/build-css.py` is the single CSS manifest and produces `css/site.css`. Native JavaScript remains responsible only for useful behaviour—navigation, consent, filtering, disclosures and form feedback—not for art direction or language reconstruction.

No late override stylesheet, automatic page-generation pass or mass HTML rewrite was used for this overhaul. Page image choices and route-specific presentation were authored deliberately, while the renderer's future image manifest was updated to preserve those choices if it is used later.

## Verified quality gates

- CSS build/check: pass.
- CSS architecture: 47 modules, 101 tokens, 0 errors, 0 warnings.
- English route validation: 21/21 pass.
- Portuguese route/partial validation: 27/27 pass with 0 errors and 0 warnings.
- Local assets and JavaScript syntax: pass.
- Browser interaction audit: 105 checks, 0 failures.
- Responsive/zoom audit: 42 routes × 5 widths × 5 zoom levels = 1,050 cases, 0 failures.
- Final visual review: every EN route at mobile/desktop plus representative tablet/ultrawide compositions; final bilingual capture is recorded in the QA report.

## External acceptance

Live third-party delivery and destinations remain outside safe repository QA. Form validation, request construction and feedback were tested with intercepted endpoints; production Formspree delivery, Instagram, WhatsApp, Google Reviews, Safari/Firefox and physical-device acceptance remain owner/release checks.

Detailed implementation, component and maintenance guidance is in `docs/design-system/` and the adjacent final architecture, page-map and QA reports.
