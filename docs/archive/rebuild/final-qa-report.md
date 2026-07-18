# Final QA report

QA date: 2026-07-13
Branch: `refactor/current-site-rebuild`

## Automated results

| Gate | Scope | Result |
|---|---|---|
| CSS build | 48 source modules → `css/site.css` | pass; 158,697 bytes |
| CSS architecture | 101 tokens, layers, colours, specificity and brace structure | pass; 0 errors, 0 warnings |
| English validation | 21 routes: content, metadata, JSON-LD, forms, links, language and sitemap | pass 21/21 |
| Portuguese validation | 21 route pairs + 6 localized partials | pass 27/27; 0 errors, 0 warnings |
| Local assets | all HTML/CSS/JS references | pass |
| JavaScript syntax | every ES module | pass |
| Browser interactions | 42 routes plus menu, consent, filters and mocked forms | pass; 105 checks, 0 failures |
| Responsive and zoom | 42 routes × 5 widths × 5 zoom levels | pass; 1,050 cases, 0 failures |
| CSS-pixel copy floor | paragraphs, list items, labels and summaries | pass; no copy under 14px outside explicit editorial metadata |

Responsive audit widths: 320, 390, 768, 1440 and 1920px. Zoom equivalents: 80%, 100%, 125%, 150% and 200%. The audit checks horizontal overflow, broken imagery, undersized controls, small copy, escaped headings, required page regions and runtime errors.

## Visual review

- All 42 English and Portuguese routes were captured and reviewed at 390 and 1440px after the final CSS/image pass.
- Homepage, about, treatments, FAQ, testimonials, contact and privacy were also captured at 768 and 3440px.
- Portuguese uses identical semantic markup/CSS, passed the complete 1,050-case bilingual reflow matrix and is included route-by-route in the final visual collection.
- Contact sheets were used to compare the collection, not only isolated pages.

Corrections made from visual evidence:

- resolved inverse text on light quote/final-CTA surfaces caused by cascade order;
- changed forest chapters to contained olive panels within light sections;
- kept two testimonial chapters light to prevent a dark-heavy rhythm;
- moved a privacy-hero medallion away from the subject's face;
- widened the hero rail on ultrawide displays without widening prose;
- balanced definition boards and removed four-plus-one process wrapping;
- established a two-column tablet process layout;
- replaced repeated supporting imagery with a 21-route sequence;
- lifted hero metadata, form labels and treatment tags to the 14px audit floor;
- restyled the floating WhatsApp control and footer from saturated/dark green to olive.
- replaced horizontal section colour bands with one continuous WebP botanical background per route and a controlled readability wash;
- confirmed the image lower fade meets the olive footer on English and Portuguese representative pages.
- standardized all route heroes to the homepage composition while retaining distinct portrait and clinic-scene assets;
- removed the decorative hero border-flower element and verified eye-level portrait framing across desktop and mobile.

## Interaction checks

- Mobile menu opens, places/traps focus, closes with Escape and restores focus.
- Cookie reject/persist and preference controls work.
- FAQ, blog and treatment filters return appropriate empty/status feedback.
- Contact, consultation and accessibility forms expose invalid fields, then complete through a safely mocked endpoint.
- Every audited route has one `main`, one `h1`, no duplicate IDs, no broken loaded images and no console errors.
- Reduced-motion rules preserve visible content and functional states.
- Each principal route uses a distinct WebP vertical background; corresponding EN/PT routes intentionally share the same image.

## Evidence

- Final 42-route bilingual mobile/desktop capture: `screenshots/sitewide-current/2026-07-13_22-15-07/`.
- Final background-surface representative capture: `screenshots/sitewide-current/2026-07-13_22-45-56/`.
- Final unified-hero representative capture: `screenshots/sitewide-current/2026-07-13_23-15-31/`.
- Final representative mobile/tablet/desktop/ultrawide capture: `screenshots/sitewide-current/2026-07-13_22-00-40/`.
- Responsive/zoom metrics: `screenshots/responsive-audit.json`.
- Interaction report: `qa/interaction-audit.json`.

Generated screenshots are local QA artifacts and remain excluded from source control.

## External limits

- Live Formspree delivery was not submitted; validation, request construction and success/error behavior were tested with a local interception.
- Instagram, WhatsApp, Google Reviews and consent-gated third-party destinations cannot be controlled end to end in this repository.
- Chromium is the installed automated browser; final owner acceptance on Safari/Firefox and physical devices remains an external release step.
