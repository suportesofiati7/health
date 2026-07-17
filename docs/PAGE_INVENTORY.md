# Page validation inventory

Date: 2026-07-13

Legend: **Pass** means the route was actually exercised by the named automated/static check. **Review required** is not a pass and remains a release blocker.

Every route below was checked at 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 and 2560 physical pixels with 80%, 100%, 125%, 150% and 200% zoom-equivalent reflow. The matrix checked load/runtime errors, shared regions, horizontal overflow, heading containment, broken images, minimum copy size and control size. Shared interaction checks cover both languages where the component exists.

| Route | Content / SEO / links / assets | Responsive + console | Mobile + desktop visual | Relevant function |
|---|---|---|---|---|
| `index.html` | Pass | Pass | Pass | Menu / language / cookie pass |
| `about.html` | Pass | Pass | Pass | Shared chrome pass |
| `accessibility.html` | Pass | Pass | Pass | Shared chrome pass |
| `blog.html` | Pass | Pass | Pass | Search/filter pass |
| `care.html` | Pass | Pass | Pass | Shared chrome pass |
| `consultation.html` | Pass | Pass | Pass | Validation + intercepted submit pass |
| `contact.html` | Pass | Pass | Pass | Validation + intercepted submit pass |
| `cookies.html` | Pass | Pass | Pass | Consent controls pass |
| `faq.html` | Pass | Pass | Pass | Search + native accordions pass |
| `journal.html` | Pass | Pass | Pass | Shared chrome pass |
| `laser.html` | Pass | Pass | Pass | Shared chrome pass |
| `legal.html` | Pass | Pass | Pass | Shared chrome pass |
| `mission.html` | Pass | Pass | Pass | Shared chrome pass |
| `privacy.html` | Pass | Pass | Pass | Shared chrome pass |
| `results.html` | Pass | Pass | Pass | Shared chrome pass |
| `skin.html` | Pass | Pass | Pass | Shared chrome pass |
| `testimonials.html` | Pass | Pass | Pass | Shared chrome pass |
| `thank-you.html` | Pass | Pass | Pass | Utility-page layout pass |
| `treatments.html` | Pass | Pass | Pass | Directory search/filter pass |
| `values.html` | Pass | Pass | Pass | Shared chrome pass |
| `404.html` | Pass | Pass | Pass | Recovery links pass |
| `pt/index.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Menu / language / cookie pass |
| `pt/about.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/accessibility.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/blog.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Search/filter pass |
| `pt/care.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/consultation.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Validation + intercepted submit pass |
| `pt/contact.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Validation + intercepted submit pass |
| `pt/cookies.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Consent controls pass |
| `pt/faq.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Search + native accordions pass |
| `pt/journal.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/laser.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/legal.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/mission.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/privacy.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/results.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/skin.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/testimonials.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/thank-you.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Utility-page layout pass |
| `pt/treatments.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Directory search/filter pass |
| `pt/values.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Shared chrome pass |
| `pt/404.html` | Pass (Argos pt-BR + strict language validation) | Pass | Pass | Recovery links pass |

## Evidence

- Responsive and console results: `screenshots/responsive-audit.json` (2,100 cases, zero failures).
- Interaction results: `qa/interaction-audit.json` (105 checks, zero failures).
- Final post-architecture visual captures and per-route manifest: `screenshots/sitewide-current/2026-07-13_12-27-03/` (390 and 1440px; 84 files, zero manifest failures).
- Human contact-sheet review: all 42 final routes at 390 and 1440px. The automated 2,100-case matrix additionally covers 320–2560px and 80–200% zoom-equivalent reflow.
- PT-BR/English language and structural release gate: `scripts/check-portuguese-site.py` (27 units, zero errors and zero warnings in strict mode).
- Focused PT browser smoke: all 21 routes at 390 and 1440px, localized partials/equivalent links/landmarks/duplicate IDs/console/overflow checks, zero failures.
