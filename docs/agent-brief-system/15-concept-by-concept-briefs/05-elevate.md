# Concept 05 - Elevate Brief

## 1. Concept Snapshot
- Concept number: 05
- Concept folder path: `concepts/05-elevate`
- Files inspected: 40 files, including `concepts/05-elevate/index.html`, `concepts/05-elevate/css/style.css`, `concepts/05-elevate/partials/header.html`, `concepts/05-elevate/partials/mobile-menu.html`, `concepts/05-elevate/partials/footer.html`, and planning docs.
- Missing expected files: none
- Screenshots inspected/available:
- `audit/screenshots/desktop/05-elevate-desktop.png`
- `audit/screenshots/mobile/05-elevate-mobile.png`
- `final/homepage-screenshots/desktop/concept-05-elevate-home-desktop.png`
- `final/homepage-screenshots/mobile/concept-05-elevate-home-mobile.png`
- Status: high risk
- Confidence level: high

## 2. Concept Purpose
- Intended impression: high luxury editorial maison translated into a Sofiati visual world, using quiet luxury watermark as the governing asset language.
- Visitor emotion: elevated spa atelier.
- Business goal: move visitors toward a professional evaluation without pressure or unsupported claims.
- Consultation/contact role: consultation is the primary conversion path; contact and WhatsApp support practical next steps.
- How it fits Sofiati: It is identified by `quiet luxury watermark`, portrait treatment `full-height consultation portrait badge`, motion `gold shimmer`, form `step-style consultation form` and footer `botanical map footer`. The HTML, CSS and JS include unique markers for this concept.

## 3. Visual Personality
- Mood: elevated spa atelier.
- Energy: quiet and restrained
- Softness/sharpness: sharp editorial edges; avoid one-note rounded-card repetition.
- Editorial/clinical balance: Elegant serif display rhythm for trust and editorial calm, paired with restrained sans-serif labels for clinical clarity.
- Image-led or text-led feel: The first viewport mixes the existing image-led Sofiati composition with the FS monogram, a custom botanical accent and a concept-specific portrait module for Franciele.
- Premium cues: botanical section separator appears in the hero, section strip, mobile menu, form and footer.
- Trust cues: professional role, CRBM, evaluation-led copy, legal/contact footer, and page-flow links.

## 4. Layout Signature
- Homepage structure: elevate-floating-note-system-hero-01, elevate-portrait-and-process-band-content-02, elevate-image-led-trust-strip-visual-story-03, elevate-accordion-guidance-panel-content-04, elevate-quiet-route-index-pathway-05, elevate-large-type-statement-content-06
- Section rhythm: # 05-elevate Page Flow Map Concept strategy: Elevate uses elevated spa atelier as its page-flow lens. Same facts, distinct rhythm.
- Grid behavior: CSS selectors include site-header, header-actions, menu-button, header-card-stack, header-meta, header-main, header-split-nav, header-command, header-actions-left, header-kicker
- Spacing rhythm: CSS uses page width and spacing variables such as --sage: #A2AE9F, --deep-sage: #798A80, --ivory: #F3EFE5, --cream: #F8F4EA, --soft-white: #F8F7F2, --bronze: #9A6B35
- Use of cards: avoid repeated equal-card grids; use mixed panels, notes, ledgers, routes, editorial image chapters, or compact accordions.
- Use of split layouts/image blocks: first homepage layout signatures are elevate-floating-note-system-hero-01, elevate-portrait-and-process-band-content-02, elevate-image-led-trust-strip-visual-story-03, elevate-accordion-guidance-panel-content-04
- Density level: screenshots available for density review; compare header/footer contact sheets before changing spacing
- Scroll rhythm: page-flow, signature sequence, image rhythm, and CTA placement must be different enough to read as a separate premium concept.

## 5. Header Signature
- Logo placement: header class tokens `public-header-layout-stacked`; brand mark path appears in header partial.
- Desktop nav structure: labels parsed as Home, About, Care, Laser, Skin, Results, Consultation, Contact, Home, About, Care, Laser.
- Nav spacing: controlled by `concepts/05-elevate/css/style.css` around `.public-header`, `.desktop-nav`, and concept header layout classes.
- CTA placement: `.header-consultation` is inside `.public-header-tools` when present.
- Language switcher placement: status/header/menu use `.public-language` / `.language-switcher` where present.
- Active/hover states: inspect `.desktop-nav a:hover`, `:focus-visible`, and `[aria-current]` rules before editing.
- Sticky behavior: public header CSS uses sticky positioning in the shared concept stylesheet layer.
- Background behavior: This concept uses a split luxury wordmark navigation. The header is assigned the unique runtime marker `header-05-elevate` and a concept-specific CSS composition.
- Risks: C05-HEADER-001
- Files involved: `concepts/05-elevate/partials/header.html`, `concepts/05-elevate/partials/navigation.html`, `concepts/05-elevate/partials/mobile-menu.html`, `concepts/05-elevate/css/style.css`, `concepts/05-elevate/js/main.js`.

## 6. Mobile Menu Signature
- Trigger style: `.public-menu-button` / `[data-menu-toggle]` in the header partial.
- Menu opening style: local JS in `concepts/05-elevate/js/main.js` toggles the `#mobile-menu` state.
- Layout: menu class tokens `public-menu-layout-ivory-editorial`.
- Link rhythm: mobile labels parsed as Home, About, Care, Laser, Skin, Results, Consultation, Contact, Consultation.
- CTA treatment: `.mobile-consult` / `.public-mobile-cta` appears after the primary mobile links.
- Language switcher behavior: `EN/PT controls present`.
- Close behavior: `[data-menu-close]` close control is present when parsed from the mobile partial.
- Accessibility concerns: check focus order and dialog state after any menu edits; screenshot review required at 360px and 390px.
- Visual personality: The mobile menu uses a image-led maison menu with local JavaScript in `js/main.js`, local partial loading in `js/partials.js` and local markup in `partials/mobile-menu.html`.

## 7. Hero Signature
- Hero structure: The first viewport mixes the existing image-led Sofiati composition with the FS monogram, a custom botanical accent and a concept-specific portrait module for Franciele.
- Heading style: homepage H1 is `Skin quality, technology and natural-looking care`.
- Image placement: homepage images include assets/brand/sofiati-monogram-bronze.png, assets/images/skin/sofiati-skin-care-soft-sage-story-background.webp, assets/images/consultation/sofiati-consultation-stationery-care-pathway.webp, assets/images/mission/sofiati-mission-science-care-naturalness.webp
- CTA placement: inspect `.hero-actions`, `.button-primary`, `.button-soft`, and page-flow CTA roles.
- Above-the-fold balance: verify with homepage desktop/mobile screenshots before editing hero spacing.
- Desktop/mobile behavior: generated screenshots are listed above; mobile cropping must be checked at 360px and 390px.
- Cropping risks: image refs and object-fit rules in CSS must be preserved; portrait concept is full-height consultation portrait badge, generated from `brand identity/Dr Fran.png` and saved as `assets/portrait/franciele-portrait-elevate.webp`..
- Uniqueness: do not turn this hero into another concept's split-screen/card-grid pattern. a generic medical directory, a pink beauty-salon template, hospital-blue stock design, or the same build with swapped colors.

## 8. Page Flow Signature
- Home: Introduce evaluation-led aesthetic biomedicine, orient visitors, and move them calmly toward consultation. Layout rhythm: elevate-stacked-proof-column, elevate-image-led-trust-strip, elevate-consultation-desk-still-life, elevate-offset-consultation-ledger. Internal links: about.html, care.html, laser.html, skin.html, results.html, values.html, mission.html, faq.html, journal.html, blog.html, consultation.html, contact.html.
- About: Build trust around Franciele's professional identity, credentials, care philosophy, and ethical boundaries. Layout rhythm: elevate-stacked-proof-column, elevate-image-led-trust-strip, elevate-consultation-desk-still-life, elevate-offset-consultation-ledger. Internal links: mission.html, values.html, care.html, laser.html, skin.html, results.html, consultation.html, contact.html.
- Care: Explain how personalised care moves from evaluation to planning, aftercare, and responsible expectations. Layout rhythm: elevate-minimal-legal-ledger, elevate-portrait-and-process-band, elevate-large-type-statement, elevate-split-portrait-hero. Internal links: consultation.html, laser.html, skin.html, results.html, faq.html, journal.html, blog.html.
- Laser: Frame laser care through suitability, preparation, technology, aftercare, and realistic outcomes. Layout rhythm: elevate-stacked-proof-column, elevate-image-led-trust-strip, elevate-consultation-desk-still-life, elevate-offset-consultation-ledger. Internal links: consultation.html, care.html, skin.html, results.html, faq.html, journal.html, blog.html.
- Skin: Guide skin quality conversations around texture, luminosity, sensitivity, cleansing, and professional assessment. Layout rhythm: elevate-minimal-legal-ledger, elevate-portrait-and-process-band, elevate-large-type-statement, elevate-split-portrait-hero. Internal links: consultation.html, care.html, laser.html, results.html, faq.html, journal.html, blog.html, values.html.
- Results: Set responsible expectations without promises, fake outcomes, or pressure-based conversion. Layout rhythm: elevate-portrait-and-process-band, elevate-quiet-route-index, elevate-laser-light-sequence, elevate-horizontal-care-journey. Internal links: consultation.html, care.html, laser.html, skin.html, testimonials.html, faq.html, legal.html, privacy.html.
- Consultation: Help visitors request evaluation with clear expectations, privacy notes, and useful preparation. Layout rhythm: elevate-consultation-desk-still-life, elevate-split-portrait-hero, elevate-full-bleed-botanical-divider, elevate-contact-card-overlap. Internal links: care.html, laser.html, skin.html, results.html, faq.html, privacy.html, contact.html.
- Contact: Make approved contact routes clear while keeping care decisions evaluation-led. Layout rhythm: elevate-portrait-and-process-band, elevate-quiet-route-index, elevate-laser-light-sequence, elevate-horizontal-care-journey. Internal links: consultation.html, faq.html, privacy.html, accessibility.html, legal.html.
- FAQ: Answer practical questions in concise, careful language that guides visitors to professional evaluation. Layout rhythm: elevate-contact-card-overlap, elevate-floating-note-system, elevate-quiet-route-index, elevate-laser-light-sequence. Internal links: care.html, laser.html, skin.html, results.html, consultation.html, contact.html, privacy.html.
- Journal: Offer editorial education that helps visitors ask better questions before care. Layout rhythm: elevate-portrait-and-process-band, elevate-quiet-route-index, elevate-laser-light-sequence, elevate-horizontal-care-journey. Internal links: care.html, laser.html, skin.html, results.html, blog.html, consultation.html.
- Blog: Present deeper educational articles on skin, laser, consultation, aftercare, and expectations. Layout rhythm: elevate-minimal-legal-ledger, elevate-portrait-and-process-band, elevate-large-type-statement, elevate-split-portrait-hero. Internal links: care.html, laser.html, skin.html, results.html, journal.html, consultation.html.
- Legal: Clarify responsible website use, educational limits, legal boundaries, and approved contact routes. Layout rhythm: elevate-stacked-proof-column, elevate-image-led-trust-strip, elevate-consultation-desk-still-life, elevate-offset-consultation-ledger. Internal links: privacy.html, cookies.html, accessibility.html, contact.html, sitemap.html.

## 9. Footer Signature
- Footer structure: classes `public-footer-05, public-footer-recipe-elevate, public-footer-icons-diamond, public-footer-divider-champagne-rule, public-footer-hover-opacity-lift, public-footer-shell`; recipe `elevate`.
- Column rhythm/headings: footer labels parsed as Consultation, Home, About, Care, Laser, Skin, Results, Consultation, Contact, Mission, Values, Testimonials, FAQ, Journal, Blog, Legal, Privacy, Cookies.
- Legal/contact areas: Legal and Contact must remain; full street address must not be added.
- Copyright: centered alignment must be verified in rendered desktop and mobile screenshots.
- Decorative assets/background: The footer uses a large signature luxury footer, local contact hierarchy and concept-specific footer marker `footer-05-elevate`.
- Mobile stacking: verify in the mobile header/footer screenshot sheet after any footer edit.
- Alignment risks: C05-LABEL-001, C05-SITEMAP-001, C05-FOOTER-001, C05-RENDER-001
- Files involved: `concepts/05-elevate/partials/footer.html`, `concepts/05-elevate/css/style.css`.

## 10. CTA Signature
- Header CTA: `.header-consultation` should remain visually stronger than ordinary nav links.
- Hero CTA: driven by `.hero-actions` and page-specific button markup.
- Section CTAs: page-flow map assigns contextual CTA roles by section.
- Contact CTA: `contact.html` and `partials/contact-card.html` hold contact route emphasis.
- Form CTA: `partials/consultation-form.html` controls the form submission button and consent pattern.
- WhatsApp CTA: `partials/floating-whatsapp.html` and `js/main.js` mount the `wa.me/5543991043536` route.
- Footer CTA: `.footer-cta` in footer partial should stay calmer than the header/hero primary CTA.
- Visual priority: step-style consultation form with a botanical frame, focus glow, privacy acknowledgement, honeypot, loading, success and error states.
- Accessibility: preserve labels, focus states, and privacy acknowledgement.

## 11. Typography Signature
- Heading typography: Elegant serif display rhythm for trust and editorial calm, paired with restrained sans-serif labels for clinical clarity.
- Body typography: stylesheet evidence uses Inter/system sans-serif for body copy.
- Nav typography: compact uppercase/small-label rhythm appears in nav/status rules.
- Button typography: CTA/button rules use bold small sans-serif labels.
- Readability: preserve contrast against #A2AE9F, #798A80, #F3EFE5, #F8F4EA, #F8F7F2, #9A6B35 backgrounds.
- Mobile scaling: verify h1/h2/nav/button fit at 360px and 390px after edits.

## 12. Colour, Glow, and Texture Signature
- Primary colors: #A2AE9F, #798A80, #F3EFE5, #F8F4EA, #F8F7F2, #9A6B35, #FDE3B0, #273332, #706B63, #734011
- Accent/background variables: --sage: #A2AE9F, --deep-sage: #798A80, --ivory: #F3EFE5, --cream: #F8F4EA, --soft-white: #F8F7F2, --bronze: #9A6B35, --champagne: #FDE3B0, --ink: #273332, --muted: #706B63, --accent: #734011, --surface: #F7F2E8, --line: rgba(37,35,33,.14)
- Glow use: botanical section separator appears in the hero, section strip, mobile menu, form and footer.
- Gradients/texture use: inspect `body::before`, asset background variables, and concept asset overlays.
- Contrast risks: language switchers, dark footers, and pale nav states need rendered contrast review.

## 13. Image and Asset Rhythm
- Asset idea: Local assets combine the approved logo, FS monogram, signature mark, a custom Franciele portrait treatment, botanical dividers, service visuals, form framing and an icon pack.
- Hero/portrait use: full-height consultation portrait badge, generated from `brand identity/Dr Fran.png` and saved as `assets/portrait/franciele-portrait-elevate.webp`.
- Service/botanical/icons: A custom quiet luxury watermark SVG icon pack covers consultation, laser, skin, care, evaluation, safety, aftercare, results, journal, mission, values, contact, technology, credentials, WhatsApp and back to top.
- Key asset paths:
- `concepts/05-elevate/assets/animations/motion-path.svg`
- `concepts/05-elevate/assets/backgrounds/botanical-background.svg`
- `concepts/05-elevate/assets/backgrounds/mobile-menu-background.svg`
- `concepts/05-elevate/assets/botanical/botanical-quote.svg`
- `concepts/05-elevate/assets/botanical/bronze-branch.svg`
- `concepts/05-elevate/assets/botanical/footer-botanical-stamp.svg`
- `concepts/05-elevate/assets/botanical/gold-leaf-divider.svg`
- `concepts/05-elevate/assets/botanical/monogram-wreath.svg`
- `concepts/05-elevate/assets/botanical/sage-botanical-corner.svg`
- `concepts/05-elevate/assets/botanical/section-separator.svg`
- `concepts/05-elevate/assets/brand/assinatura-1.jpg`
- `concepts/05-elevate/assets/brand/footer-signature-watermark.png`
- Alt text risks: static alt audit has passed historically; re-run after image changes.
- Repeated asset risks: do not reuse another concept's portrait frame, icon pack, or divider treatment.

## 14. Animation and Interaction Signature
- Motion idea: gold shimmer controls strip dividers, icon hover behaviour, portrait movement and scroll CSS variables.
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
- Title/meta pattern: `Evaluation-Led Aesthetic Care | Elevate | Franciele Sofiati` / `Evaluation-Led Aesthetic Care for Franciele Sofiati in Londrina, PR, guided by evaluation-first care, ethical expectations and the Elevate concept.`
- H1 pattern: 1 H1 parsed; `Skin quality, technology and natural-looking care`
- Schema pattern: `partials/schema.html` plus page head partials control JSON-LD evidence.
- Sitemap presence: `concepts/05-elevate/sitemap.html` exists.
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
- What makes it different: It is identified by `quiet luxury watermark`, portrait treatment `full-height consultation portrait badge`, motion `gold shimmer`, form `step-style consultation form` and footer `botanical map footer`. The HTML, CSS and JS include unique markers for this concept.
- Protected features: header `public-header-layout-stacked`, menu `public-menu-layout-ivory-editorial`, footer recipe `elevate`, asset language `Local assets combine the approved logo, FS monogram, signature mark, a custom Franciele portrait treatment, botanical dividers, service visuals, form framing and an icon pack.`, motion `gold shimmer controls strip dividers, icon hover behaviour, portrait movement and scroll CSS variables.`.
- Concepts it risks resembling: compare closely against concepts `06` and `13` during duplicate-layout audits.
- Do not standardize: header rhythm, hero image placement, footer recipe, CTA shape, icon/divider assets, card radius, and motion timing.
- Can improve: active issues can be fixed using spacing, contrast, label, and alignment adjustments without replacing the `elevated spa atelier.` visual grammar.

## 20. Issues Found During Audit
### C05-LABEL-001
- Page/component: global footer / footer labels
- File path: `concepts/05-elevate/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Verification method: Run rg label search and screenshot footer.
- Fixed in this task: yes

### C05-SITEMAP-001
- Page/component: sitemap / sitemap labels
- File path: `concepts/05-elevate/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Verification method: Run rg for Brand and education.
- Fixed in this task: yes

### C05-HEADER-001
- Page/component: homepage/header/footer / Header styling
- File path: `concepts/05-elevate/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Desktop header has split two-color block styling that reads visually unbalanced.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Unify the header surface while preserving Elevate's maison/luxury wordmark rhythm.
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fixed in this task: no

### C05-FOOTER-001
- Page/component: homepage/header/footer / Footer decoration
- File path: `concepts/05-elevate/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Footer uses boxed column/card treatments.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove column boxes without flattening the botanical map footer.
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fixed in this task: no

### C05-RENDER-001
- Page/component: index.html / Copyright center delta 43px
- File path: `concepts/05-elevate/index.html`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Copyright center delta 43px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fixed in this task: no

## 21. Fixes Applied
- C05-LABEL-001: Footer public labels were cleaned from Brand/Brand and Trust to About. File: `concepts/05-elevate/partials/footer.html`. Verification: Run rg label search and screenshot footer..
- C05-SITEMAP-001: Sitemap Brand and education label was cleaned to About and education. File: `concepts/05-elevate/sitemap.html`. Verification: Run rg for Brand and education..

## 22. Final Concept Status
- Status: high risk
- Confidence level: high
- Remaining issues: C05-HEADER-001, C05-FOOTER-001, C05-RENDER-001
- Next recommended task: follow the issue register and run rendered verification for this concept before implementation closure.
