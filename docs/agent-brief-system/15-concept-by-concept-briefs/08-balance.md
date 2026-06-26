# Concept 08 - Balance Brief

## 1. Concept Snapshot
- Concept number: 08
- Concept folder path: `concepts/08-balance`
- Files inspected: 40 files, including `concepts/08-balance/index.html`, `concepts/08-balance/css/style.css`, `concepts/08-balance/partials/header.html`, `concepts/08-balance/partials/mobile-menu.html`, `concepts/08-balance/partials/footer.html`, and planning docs.
- Missing expected files: none
- Screenshots inspected/available:
- `audit/screenshots/desktop/08-balance-desktop.png`
- `audit/screenshots/mobile/08-balance-mobile.png`
- `final/homepage-screenshots/desktop/concept-08-balance-home-desktop.png`
- `final/homepage-screenshots/mobile/concept-08-balance-home-mobile.png`
- Status: strong
- Confidence level: high

## 2. Concept Purpose
- Intended impression: symmetrical calm grid translated into a Sofiati visual world, using round monogram sanctuary as the governing asset language.
- Visitor emotion: balanced consultation map.
- Business goal: move visitors toward a professional evaluation without pressure or unsupported claims.
- Consultation/contact role: consultation is the primary conversion path; contact and WhatsApp support practical next steps.
- How it fits Sofiati: It is identified by `round monogram sanctuary`, portrait treatment `champagne line portrait seal`, motion `form focus glow`, form `business-card form` and footer `bronze strip footer`. The HTML, CSS and JS include unique markers for this concept.

## 3. Visual Personality
- Mood: balanced consultation map.
- Energy: quiet and restrained
- Softness/sharpness: fine-line panels; avoid one-note rounded-card repetition.
- Editorial/clinical balance: Elegant serif display rhythm for trust and editorial calm, paired with restrained sans-serif labels for clinical clarity.
- Image-led or text-led feel: The first viewport mixes the existing image-led Sofiati composition with the FS monogram, a custom botanical accent and a concept-specific portrait module for Franciele.
- Premium cues: quote-mark branch appears in the hero, section strip, mobile menu, form and footer.
- Trust cues: professional role, CRBM, evaluation-led copy, legal/contact footer, and page-flow links.

## 4. Layout Signature
- Homepage structure: balance-accordion-guidance-panel-hero-01, balance-quiet-route-index-content-02, balance-large-type-statement-content-03, balance-consultation-desk-still-life-visual-story-04, balance-skin-texture-editorial-pathway-05, balance-laser-light-sequence-content-06
- Section rhythm: # 08-balance Page Flow Map Concept strategy: Balance uses balanced consultation map as its page-flow lens. Same facts, distinct rhythm.
- Grid behavior: CSS selectors include site-header, header-actions, menu-button, header-card-stack, header-meta, header-main, header-split-nav, header-command, header-actions-left, header-kicker
- Spacing rhythm: CSS uses page width and spacing variables such as --sage: #A2AE9F, --deep-sage: #798A80, --ivory: #F3EFE5, --cream: #F8F4EA, --soft-white: #F8F7F2, --bronze: #9A6B35
- Use of cards: avoid repeated equal-card grids; use mixed panels, notes, ledgers, routes, editorial image chapters, or compact accordions.
- Use of split layouts/image blocks: first homepage layout signatures are balance-accordion-guidance-panel-hero-01, balance-quiet-route-index-content-02, balance-large-type-statement-content-03, balance-consultation-desk-still-life-visual-story-04
- Density level: screenshots available for density review; compare header/footer contact sheets before changing spacing
- Scroll rhythm: page-flow, signature sequence, image rhythm, and CTA placement must be different enough to read as a separate premium concept.

## 5. Header Signature
- Logo placement: header class tokens `public-header-layout-balanced`; brand mark path appears in header partial.
- Desktop nav structure: labels parsed as Home, About, Care, Laser, Skin, Results, Consultation, Contact, Home, About, Care, Laser.
- Nav spacing: controlled by `concepts/08-balance/css/style.css` around `.public-header`, `.desktop-nav`, and concept header layout classes.
- CTA placement: `.header-consultation` is inside `.public-header-tools` when present.
- Language switcher placement: status/header/menu use `.public-language` / `.language-switcher` where present.
- Active/hover states: inspect `.desktop-nav a:hover`, `:focus-visible`, and `[aria-current]` rules before editing.
- Sticky behavior: public header CSS uses sticky positioning in the shared concept stylesheet layer.
- Background behavior: This concept uses a centered emblem balanced header. The header is assigned the unique runtime marker `header-08-balance` and a concept-specific CSS composition.
- Risks: no active header issue recorded
- Files involved: `concepts/08-balance/partials/header.html`, `concepts/08-balance/partials/navigation.html`, `concepts/08-balance/partials/mobile-menu.html`, `concepts/08-balance/css/style.css`, `concepts/08-balance/js/main.js`.

## 6. Mobile Menu Signature
- Trigger style: `.public-menu-button` / `[data-menu-toggle]` in the header partial.
- Menu opening style: local JS in `concepts/08-balance/js/main.js` toggles the `#mobile-menu` state.
- Layout: menu class tokens `public-menu-layout-two-column`.
- Link rhythm: mobile labels parsed as Home, About, Care, Laser, Skin, Results, Consultation, Contact.
- CTA treatment: `.mobile-consult` / `.public-mobile-cta` appears after the primary mobile links.
- Language switcher behavior: `EN/PT controls present`.
- Close behavior: `[data-menu-close]` close control is present when parsed from the mobile partial.
- Accessibility concerns: check focus order and dialog state after any menu edits; screenshot review required at 360px and 390px.
- Visual personality: The mobile menu uses a measured grid menu with local JavaScript in `js/main.js`, local partial loading in `js/partials.js` and local markup in `partials/mobile-menu.html`.

## 7. Hero Signature
- Hero structure: The first viewport mixes the existing image-led Sofiati composition with the FS monogram, a custom botanical accent and a concept-specific portrait module for Franciele.
- Heading style: homepage H1 is `Professional evaluation for laser and skin`.
- Image placement: homepage images include assets/brand/sofiati-monogram-bronze.png, assets/images/consultation/sofiati-consultation-stationery-care-pathway.webp, assets/images/mission/sofiati-mission-science-care-naturalness.webp, assets/images/about/franciele-sofiati-brand-story-botanical-moodboard.webp
- CTA placement: inspect `.hero-actions`, `.button-primary`, `.button-soft`, and page-flow CTA roles.
- Above-the-fold balance: verify with homepage desktop/mobile screenshots before editing hero spacing.
- Desktop/mobile behavior: generated screenshots are listed above; mobile cropping must be checked at 360px and 390px.
- Cropping risks: image refs and object-fit rules in CSS must be preserved; portrait concept is champagne line portrait seal, generated from `brand identity/Dr Fran.png` and saved as `assets/portrait/franciele-portrait-balance.webp`..
- Uniqueness: do not turn this hero into another concept's split-screen/card-grid pattern. a generic medical directory, a pink beauty-salon template, hospital-blue stock design, or the same build with swapped colors.

## 8. Page Flow Signature
- Home: Introduce evaluation-led aesthetic biomedicine, orient visitors, and move them calmly toward consultation. Layout rhythm: balance-image-led-trust-strip, balance-large-type-statement, balance-split-portrait-hero, balance-full-bleed-botanical-divider. Internal links: about.html, care.html, laser.html, skin.html, results.html, values.html, mission.html, faq.html, journal.html, blog.html, consultation.html, contact.html.
- About: Build trust around Franciele's professional identity, credentials, care philosophy, and ethical boundaries. Layout rhythm: balance-image-led-trust-strip, balance-large-type-statement, balance-split-portrait-hero, balance-full-bleed-botanical-divider. Internal links: mission.html, values.html, care.html, laser.html, skin.html, results.html, consultation.html, contact.html.
- Care: Explain how personalised care moves from evaluation to planning, aftercare, and responsible expectations. Layout rhythm: balance-portrait-and-process-band, balance-quiet-route-index, balance-laser-light-sequence, balance-horizontal-care-journey. Internal links: consultation.html, laser.html, skin.html, results.html, faq.html, journal.html, blog.html.
- Laser: Frame laser care through suitability, preparation, technology, aftercare, and realistic outcomes. Layout rhythm: balance-image-led-trust-strip, balance-large-type-statement, balance-split-portrait-hero, balance-full-bleed-botanical-divider. Internal links: consultation.html, care.html, skin.html, results.html, faq.html, journal.html, blog.html.
- Skin: Guide skin quality conversations around texture, luminosity, sensitivity, cleansing, and professional assessment. Layout rhythm: balance-portrait-and-process-band, balance-quiet-route-index, balance-laser-light-sequence, balance-horizontal-care-journey. Internal links: consultation.html, care.html, laser.html, results.html, faq.html, journal.html, blog.html, values.html.
- Results: Set responsible expectations without promises, fake outcomes, or pressure-based conversion. Layout rhythm: balance-quiet-route-index, balance-skin-texture-editorial, balance-editorial-image-chapter, balance-radial-results-map. Internal links: consultation.html, care.html, laser.html, skin.html, testimonials.html, faq.html, legal.html, privacy.html.
- Consultation: Help visitors request evaluation with clear expectations, privacy notes, and useful preparation. Layout rhythm: balance-split-portrait-hero, balance-horizontal-care-journey, balance-magazine-article-grid, balance-floating-note-system. Internal links: care.html, laser.html, skin.html, results.html, faq.html, privacy.html, contact.html.
- Contact: Make approved contact routes clear while keeping care decisions evaluation-led. Layout rhythm: balance-quiet-route-index, balance-skin-texture-editorial, balance-editorial-image-chapter, balance-radial-results-map. Internal links: consultation.html, faq.html, privacy.html, accessibility.html, legal.html.
- FAQ: Answer practical questions in concise, careful language that guides visitors to professional evaluation. Layout rhythm: balance-floating-note-system, balance-accordion-guidance-panel, balance-skin-texture-editorial, balance-editorial-image-chapter. Internal links: care.html, laser.html, skin.html, results.html, consultation.html, contact.html, privacy.html.
- Journal: Offer editorial education that helps visitors ask better questions before care. Layout rhythm: balance-quiet-route-index, balance-skin-texture-editorial, balance-editorial-image-chapter, balance-radial-results-map. Internal links: care.html, laser.html, skin.html, results.html, blog.html, consultation.html.
- Blog: Present deeper educational articles on skin, laser, consultation, aftercare, and expectations. Layout rhythm: balance-portrait-and-process-band, balance-quiet-route-index, balance-laser-light-sequence, balance-horizontal-care-journey. Internal links: care.html, laser.html, skin.html, results.html, journal.html, consultation.html.
- Legal: Clarify responsible website use, educational limits, legal boundaries, and approved contact routes. Layout rhythm: balance-image-led-trust-strip, balance-large-type-statement, balance-split-portrait-hero, balance-full-bleed-botanical-divider. Internal links: privacy.html, cookies.html, accessibility.html, contact.html, sitemap.html.

## 9. Footer Signature
- Footer structure: classes `public-footer-08, public-footer-recipe-balance, public-footer-icons-bracket, public-footer-divider-balanced-rules, public-footer-hover-underline, public-footer-shell`; recipe `balance`.
- Column rhythm/headings: footer labels parsed as Consultation, Home, About, Care, Laser, Skin, Results, Consultation, Contact, Mission, Values, Testimonials, FAQ, Journal, Blog, Legal, Privacy, Cookies.
- Legal/contact areas: Legal and Contact must remain; full street address must not be added.
- Copyright: centered alignment must be verified in rendered desktop and mobile screenshots.
- Decorative assets/background: The footer uses a balanced contact-card footer, local contact hierarchy and concept-specific footer marker `footer-08-balance`.
- Mobile stacking: verify in the mobile header/footer screenshot sheet after any footer edit.
- Alignment risks: C08-LABEL-001, C08-SITEMAP-001
- Files involved: `concepts/08-balance/partials/footer.html`, `concepts/08-balance/css/style.css`.

## 10. CTA Signature
- Header CTA: `.header-consultation` should remain visually stronger than ordinary nav links.
- Hero CTA: driven by `.hero-actions` and page-specific button markup.
- Section CTAs: page-flow map assigns contextual CTA roles by section.
- Contact CTA: `contact.html` and `partials/contact-card.html` hold contact route emphasis.
- Form CTA: `partials/consultation-form.html` controls the form submission button and consent pattern.
- WhatsApp CTA: `partials/floating-whatsapp.html` and `js/main.js` mount the `wa.me/5543991043536` route.
- Footer CTA: `.footer-cta` in footer partial should stay calmer than the header/hero primary CTA.
- Visual priority: business-card form with a botanical frame, focus glow, privacy acknowledgement, honeypot, loading, success and error states.
- Accessibility: preserve labels, focus states, and privacy acknowledgement.

## 11. Typography Signature
- Heading typography: Elegant serif display rhythm for trust and editorial calm, paired with restrained sans-serif labels for clinical clarity.
- Body typography: stylesheet evidence uses Inter/system sans-serif for body copy.
- Nav typography: compact uppercase/small-label rhythm appears in nav/status rules.
- Button typography: CTA/button rules use bold small sans-serif labels.
- Readability: preserve contrast against #A2AE9F, #798A80, #F3EFE5, #F8F4EA, #F8F7F2, #9A6B35 backgrounds.
- Mobile scaling: verify h1/h2/nav/button fit at 360px and 390px after edits.

## 12. Colour, Glow, and Texture Signature
- Primary colors: #A2AE9F, #798A80, #F3EFE5, #F8F4EA, #F8F7F2, #9A6B35, #FDE3B0, #2E3631, #706B63, #A17B52
- Accent/background variables: --sage: #A2AE9F, --deep-sage: #798A80, --ivory: #F3EFE5, --cream: #F8F4EA, --soft-white: #F8F7F2, --bronze: #9A6B35, --champagne: #FDE3B0, --ink: #2E3631, --muted: #706B63, --accent: #A17B52, --surface: #F8F4EA, --line: rgba(37,35,33,.14)
- Glow use: quote-mark branch appears in the hero, section strip, mobile menu, form and footer.
- Gradients/texture use: inspect `body::before`, asset background variables, and concept asset overlays.
- Contrast risks: language switchers, dark footers, and pale nav states need rendered contrast review.

## 13. Image and Asset Rhythm
- Asset idea: Local assets combine the approved logo, FS monogram, signature mark, a custom Franciele portrait treatment, botanical dividers, service visuals, form framing and an icon pack.
- Hero/portrait use: champagne line portrait seal, generated from `brand identity/Dr Fran.png` and saved as `assets/portrait/franciele-portrait-balance.webp`.
- Service/botanical/icons: A custom round monogram sanctuary SVG icon pack covers consultation, laser, skin, care, evaluation, safety, aftercare, results, journal, mission, values, contact, technology, credentials, WhatsApp and back to top.
- Key asset paths:
- `concepts/08-balance/assets/animations/motion-path.svg`
- `concepts/08-balance/assets/backgrounds/botanical-background.svg`
- `concepts/08-balance/assets/backgrounds/mobile-menu-background.svg`
- `concepts/08-balance/assets/botanical/botanical-quote.svg`
- `concepts/08-balance/assets/botanical/bronze-branch.svg`
- `concepts/08-balance/assets/botanical/footer-botanical-stamp.svg`
- `concepts/08-balance/assets/botanical/gold-leaf-divider.svg`
- `concepts/08-balance/assets/botanical/monogram-wreath.svg`
- `concepts/08-balance/assets/botanical/sage-botanical-corner.svg`
- `concepts/08-balance/assets/botanical/section-separator.svg`
- `concepts/08-balance/assets/brand/assinatura-1.jpg`
- `concepts/08-balance/assets/brand/footer-signature-watermark.png`
- Alt text risks: static alt audit has passed historically; re-run after image changes.
- Repeated asset risks: do not reuse another concept's portrait frame, icon pack, or divider treatment.

## 14. Animation and Interaction Signature
- Motion idea: form focus glow controls strip dividers, icon hover behaviour, portrait movement and scroll CSS variables.
- Scroll/hover/menu effects: CSS selectors include menu-button, menu-button-visible, mobile-menu, mobile-menu-top, mobile-menu-links, mobile-menu-primary, mobile-menu-secondary, mobile-menu-note, mobile-menu-bloom, mobile-menu-concierge, hero, hero-copy
- JS hooks: menu/lang/form/floating hooks found
- Reduced-motion considerations: preserve `body.reduce-motion` and CSS reduced-motion behavior where present.
- Performance risks: avoid adding libraries for small concept-level animation repairs.

## 15. Content Voice and Copy Risks
- Client-facing quality: copy should stay calm, evaluation-led, educational, and professional.
- Generic/placeholder risks: compare H1s and section headings against nearby concepts before rewriting.
- CTA clarity: consultation language should stay clear without pressure.
- Ethical results language: do not add guarantees, fake testimonials, fake before/after proof, or treatment suitability claims.
- Human review: required for any medical/aesthetic claim changes beyond formatting or obvious label cleanup.

## 16. SEO and Schema Snapshot
- Title/meta pattern: `Evaluation-Led Aesthetic Care | Balance | Franciele Sofiati` / `Evaluation-Led Aesthetic Care for Franciele Sofiati in Londrina, PR, guided by evaluation-first care, ethical expectations and the Balance concept.`
- H1 pattern: 1 H1 parsed; `Professional evaluation for laser and skin`
- Schema pattern: `partials/schema.html` plus page head partials control JSON-LD evidence.
- Sitemap presence: `concepts/08-balance/sitemap.html` exists.
- Internal links: internal-link map length 164 lines; inspect before page link changes.
- Image alt status: use static alt audit after image edits.
- Canonical status: inspect `partials/head.html` before SEO edits.

## 17. Accessibility Snapshot
- Semantic structure: verify one H1, nav landmarks, footer nav groups, form labels, and dialog attributes.
- Heading order: static audit should remain PASS after content changes.
- Nav accessibility: header/menu controls use aria labels and expanded/hidden states; verify keyboard behavior manually.
- Focus states: inspect `:focus-visible` rules before changing nav/CTA styles.
- Contrast risks: language controls, pale header text, dark footer links, and overlaid CTA labels.
- Form labels: `partials/consultation-form.html` controls labels and consent.
- Alt text: preserve current alt audit pass.

## 18. Responsive Design Snapshot
- 360px: check mobile header, menu top controls, language switcher, hero cropping, and footer stack.
- 390px: check common mobile layout and floating WhatsApp overlap.
- 768px: check tablet transition between mobile menu and desktop nav.
- 1024px: check early desktop nav wrap.
- 1366px: check standard desktop header/footer balance.
- 1440px+: check wide desktop footer copyright centering and hero composition.
- Overflow risks: use `scripts/audit_rendered_concepts.py` plus screenshots.
- CTA stacking risks: check hero, menu, form, and footer CTAs separately.

## 19. Concept Uniqueness Analysis
- What makes it different: It is identified by `round monogram sanctuary`, portrait treatment `champagne line portrait seal`, motion `form focus glow`, form `business-card form` and footer `bronze strip footer`. The HTML, CSS and JS include unique markers for this concept.
- Protected features: header `public-header-layout-balanced`, menu `public-menu-layout-two-column`, footer recipe `balance`, asset language `Local assets combine the approved logo, FS monogram, signature mark, a custom Franciele portrait treatment, botanical dividers, service visuals, form framing and an icon pack.`, motion `form focus glow controls strip dividers, icon hover behaviour, portrait movement and scroll CSS variables.`.
- Concepts it risks resembling: compare closely against concepts `09` and `16` during duplicate-layout audits.
- Do not standardize: header rhythm, hero image placement, footer recipe, CTA shape, icon/divider assets, card radius, and motion timing.
- Can improve: active issues can be fixed using spacing, contrast, label, and alignment adjustments without replacing the `balanced consultation map.` visual grammar.

## 20. Issues Found During Audit
### C08-LABEL-001
- Page/component: global footer / footer labels
- File path: `concepts/08-balance/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/08-balance-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Verification method: Run rg label search and screenshot footer.
- Fixed in this task: yes

### C08-SITEMAP-001
- Page/component: sitemap / sitemap labels
- File path: `concepts/08-balance/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Verification method: Run rg for Brand and education.
- Fixed in this task: yes

## 21. Fixes Applied
- C08-LABEL-001: Footer public labels were cleaned from Brand/Brand and Trust to About. File: `concepts/08-balance/partials/footer.html`. Verification: Run rg label search and screenshot footer..
- C08-SITEMAP-001: Sitemap Brand and education label was cleaned to About and education. File: `concepts/08-balance/sitemap.html`. Verification: Run rg for Brand and education..

## 22. Final Concept Status
- Status: strong
- Confidence level: high
- Remaining issues: none from current automated/doc issue set
- Next recommended task: follow the issue register and run rendered verification for this concept before implementation closure.
