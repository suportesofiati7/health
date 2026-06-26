# 16-20 Issue Register

## Purpose
Track evidence-based issues found while generating concept briefs and running diagnostics.

## Status Summary
- Total issues: 167
- Critical: 25
- High: 142
- Medium: 0
- Low: 0
- Fixed: 100
- Pending: 67

## C01-LABEL-001
- Concept: 01-inspire
- Page: global footer
- Component: footer labels
- File path: `concepts/01-inspire/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/01-inspire-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C01-SITEMAP-001
- Concept: 01-inspire
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/01-inspire/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C01-RENDER-001
- Concept: 01-inspire
- Page: index.html
- Component: Desktop nav uses 3 rows
- File path: `concepts/01-inspire/index.html`
- Screenshot path: `audit/screenshots/desktop/01-inspire-desktop.png`
- Problem observed: Desktop nav uses 3 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C01-RENDER-002
- Concept: 01-inspire
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/01-inspire/index.html`
- Screenshot path: `audit/screenshots/desktop/01-inspire-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C02-LABEL-001
- Concept: 02-empower
- Page: global footer
- Component: footer labels
- File path: `concepts/02-empower/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/02-empower-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C02-SITEMAP-001
- Concept: 02-empower
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/02-empower/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C02-RENDER-001
- Concept: 02-empower
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/02-empower/index.html`
- Screenshot path: `audit/screenshots/desktop/02-empower-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C03-LABEL-001
- Concept: 03-enhance
- Page: global footer
- Component: footer labels
- File path: `concepts/03-enhance/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/03-enhance-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C03-SITEMAP-001
- Concept: 03-enhance
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/03-enhance/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C03-LANG-001
- Concept: 03-enhance
- Page: homepage/header/footer
- Component: Mobile menu language switcher
- File path: `concepts/03-enhance/partials/mobile-menu.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/03-enhance-desktop.png`
- Problem observed: Mobile inactive PT state is low contrast and visually squeezed in existing screenshots.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Improve contrast and top-row spacing without changing Enhance's clinical drawer.
- Files likely affected: partials/mobile-menu.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C03-FOOTER-001
- Concept: 03-enhance
- Page: homepage/header/footer
- Component: Footer decoration
- File path: `concepts/03-enhance/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/03-enhance-desktop.png`
- Problem observed: Footer columns/contact treatment uses box/circle language flagged by prior screenshot review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove heavy column frames/circles while retaining Enhance's clinical ledger mood.
- Files likely affected: partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C03-RENDER-001
- Concept: 03-enhance
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/03-enhance/index.html`
- Screenshot path: `audit/screenshots/desktop/03-enhance-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C04-LABEL-001
- Concept: 04-renew
- Page: global footer
- Component: footer labels
- File path: `concepts/04-renew/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/04-renew-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C04-SITEMAP-001
- Concept: 04-renew
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/04-renew/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C05-LABEL-001
- Concept: 05-elevate
- Page: global footer
- Component: footer labels
- File path: `concepts/05-elevate/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C05-SITEMAP-001
- Concept: 05-elevate
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/05-elevate/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C05-HEADER-001
- Concept: 05-elevate
- Page: homepage/header/footer
- Component: Header styling
- File path: `concepts/05-elevate/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Desktop header has split two-color block styling that reads visually unbalanced.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Unify the header surface while preserving Elevate's maison/luxury wordmark rhythm.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C05-FOOTER-001
- Concept: 05-elevate
- Page: homepage/header/footer
- Component: Footer decoration
- File path: `concepts/05-elevate/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Footer uses boxed column/card treatments.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove column boxes without flattening the botanical map footer.
- Files likely affected: partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C05-RENDER-001
- Concept: 05-elevate
- Page: index.html
- Component: Copyright center delta 43px
- File path: `concepts/05-elevate/index.html`
- Screenshot path: `audit/screenshots/desktop/05-elevate-desktop.png`
- Problem observed: Copyright center delta 43px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C06-LABEL-001
- Concept: 06-refine
- Page: global footer
- Component: footer labels
- File path: `concepts/06-refine/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/06-refine-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C06-SITEMAP-001
- Concept: 06-refine
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/06-refine/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C06-NAV-001
- Concept: 06-refine
- Page: homepage/header/footer
- Component: Desktop navigation
- File path: `concepts/06-refine/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/06-refine-desktop.png`
- Problem observed: Rendered desktop nav has wrapped to two rows in prior audit.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Reduce width pressure while preserving Refine's quiet grid rhythm.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C06-RENDER-001
- Concept: 06-refine
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/06-refine/index.html`
- Screenshot path: `audit/screenshots/desktop/06-refine-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C06-RENDER-002
- Concept: 06-refine
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/06-refine/index.html`
- Screenshot path: `audit/screenshots/desktop/06-refine-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1440.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C07-LABEL-001
- Concept: 07-glow
- Page: global footer
- Component: footer labels
- File path: `concepts/07-glow/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/07-glow-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C07-SITEMAP-001
- Concept: 07-glow
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/07-glow/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C07-RENDER-001
- Concept: 07-glow
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/07-glow/index.html`
- Screenshot path: `audit/screenshots/desktop/07-glow-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C07-RENDER-002
- Concept: 07-glow
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/07-glow/index.html`
- Screenshot path: `audit/screenshots/desktop/07-glow-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C08-LABEL-001
- Concept: 08-balance
- Page: global footer
- Component: footer labels
- File path: `concepts/08-balance/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/08-balance-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C08-SITEMAP-001
- Concept: 08-balance
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/08-balance/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C09-LABEL-001
- Concept: 09-radiance
- Page: global footer
- Component: footer labels
- File path: `concepts/09-radiance/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/09-radiance-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C09-SITEMAP-001
- Concept: 09-radiance
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/09-radiance/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C09-RENDER-001
- Concept: 09-radiance
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/09-radiance/index.html`
- Screenshot path: `audit/screenshots/desktop/09-radiance-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C10-LABEL-001
- Concept: 10-essence
- Page: global footer
- Component: footer labels
- File path: `concepts/10-essence/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/10-essence-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C10-SITEMAP-001
- Concept: 10-essence
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/10-essence/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C10-HEADER-001
- Concept: 10-essence
- Page: homepage/header/footer
- Component: Desktop header visibility
- File path: `concepts/10-essence/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/10-essence-desktop.png`
- Problem observed: Essence uses a menu-only desktop direction; text/nav visibility and header CTA need review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Expose clearer nav/CTA only if it can keep the minimal appointment-suite personality.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C10-RENDER-001
- Concept: 10-essence
- Page: index.html
- Component: Header consultation CTA is not visible
- File path: `concepts/10-essence/index.html`
- Screenshot path: `audit/screenshots/desktop/10-essence-desktop.png`
- Problem observed: Header consultation CTA is not visible
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C10-RENDER-002
- Concept: 10-essence
- Page: index.html
- Component: Copyright center delta -225px
- File path: `concepts/10-essence/index.html`
- Screenshot path: `audit/screenshots/desktop/10-essence-desktop.png`
- Problem observed: Copyright center delta -225px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C11-LABEL-001
- Concept: 11-bloom
- Page: global footer
- Component: footer labels
- File path: `concepts/11-bloom/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/11-bloom-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C11-SITEMAP-001
- Concept: 11-bloom
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/11-bloom/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C11-DECOR-001
- Concept: 11-bloom
- Page: homepage/header/footer
- Component: Box treatments
- File path: `concepts/11-bloom/partials/header.html; partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/11-bloom-desktop.png`
- Problem observed: Unwanted square/box treatments remain in screenshot review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove box treatments while keeping Bloom's dark botanical mood.
- Files likely affected: partials/header.html; partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C11-RENDER-001
- Concept: 11-bloom
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/11-bloom/index.html`
- Screenshot path: `audit/screenshots/desktop/11-bloom-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C12-LABEL-001
- Concept: 12-vital
- Page: global footer
- Component: footer labels
- File path: `concepts/12-vital/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/12-vital-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C12-SITEMAP-001
- Concept: 12-vital
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/12-vital/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C12-RENDER-001
- Concept: 12-vital
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/12-vital/index.html`
- Screenshot path: `audit/screenshots/desktop/12-vital-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C13-LABEL-001
- Concept: 13-poise
- Page: global footer
- Component: footer labels
- File path: `concepts/13-poise/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/13-poise-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C13-SITEMAP-001
- Concept: 13-poise
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/13-poise/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C13-FOOTER-001
- Concept: 13-poise
- Page: homepage/header/footer
- Component: Footer/contact circles
- File path: `concepts/13-poise/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/13-poise-desktop.png`
- Problem observed: Footer/contact areas use circular treatments flagged by prior review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Replace circular frames with subtle dividers/glows.
- Files likely affected: partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C13-RENDER-001
- Concept: 13-poise
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/13-poise/index.html`
- Screenshot path: `audit/screenshots/desktop/13-poise-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C14-LABEL-001
- Concept: 14-aura
- Page: global footer
- Component: footer labels
- File path: `concepts/14-aura/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/14-aura-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C14-SITEMAP-001
- Concept: 14-aura
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/14-aura/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C15-LABEL-001
- Concept: 15-clarity
- Page: global footer
- Component: footer labels
- File path: `concepts/15-clarity/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/15-clarity-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C15-SITEMAP-001
- Concept: 15-clarity
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/15-clarity/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C15-FOOTER-001
- Concept: 15-clarity
- Page: homepage/header/footer
- Component: Footer decoration
- File path: `concepts/15-clarity/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/15-clarity-desktop.png`
- Problem observed: Footer decoration/box problem remains in screenshot review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Simplify heavy split panels while preserving Clarity's clean concept rhythm.
- Files likely affected: partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C15-RENDER-001
- Concept: 15-clarity
- Page: index.html
- Component: Copyright center delta -225px
- File path: `concepts/15-clarity/index.html`
- Screenshot path: `audit/screenshots/desktop/15-clarity-desktop.png`
- Problem observed: Copyright center delta -225px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C16-LABEL-001
- Concept: 16-grace
- Page: global footer
- Component: footer labels
- File path: `concepts/16-grace/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/16-grace-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C16-SITEMAP-001
- Concept: 16-grace
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/16-grace/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C16-NAV-001
- Concept: 16-grace
- Page: homepage/header/footer
- Component: Desktop navigation
- File path: `concepts/16-grace/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/16-grace-desktop.png`
- Problem observed: Grace desktop nav wraps to two rows in rendered review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Tighten logo/nav/CTA spacing without reducing readability.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C16-RENDER-001
- Concept: 16-grace
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/16-grace/index.html`
- Screenshot path: `audit/screenshots/desktop/16-grace-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1440.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C17-LABEL-001
- Concept: 17-sculpt
- Page: global footer
- Component: footer labels
- File path: `concepts/17-sculpt/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/17-sculpt-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C17-SITEMAP-001
- Concept: 17-sculpt
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/17-sculpt/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C17-MOBILE-001
- Concept: 17-sculpt
- Page: homepage/header/footer
- Component: Mobile header overflow
- File path: `concepts/17-sculpt/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/17-sculpt-desktop.png`
- Problem observed: Rendered mobile header showed small internal overflow.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: high
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Tighten mobile header sizing and controls.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C17-RENDER-001
- Concept: 17-sculpt
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/17-sculpt/index.html`
- Screenshot path: `audit/screenshots/desktop/17-sculpt-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C18-LABEL-001
- Concept: 18-lumin
- Page: global footer
- Component: footer labels
- File path: `concepts/18-lumin/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/18-lumin-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C18-SITEMAP-001
- Concept: 18-lumin
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/18-lumin/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C18-FOOTER-001
- Concept: 18-lumin
- Page: homepage/header/footer
- Component: Footer decoration
- File path: `concepts/18-lumin/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/18-lumin-desktop.png`
- Problem observed: Footer circle/box decoration problem remains in screenshot review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove circular/boxed contact and column treatments.
- Files likely affected: partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C18-RENDER-001
- Concept: 18-lumin
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/18-lumin/index.html`
- Screenshot path: `audit/screenshots/desktop/18-lumin-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C19-LABEL-001
- Concept: 19-verda
- Page: global footer
- Component: footer labels
- File path: `concepts/19-verda/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/19-verda-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C19-SITEMAP-001
- Concept: 19-verda
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/19-verda/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C19-RENDER-001
- Concept: 19-verda
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/19-verda/index.html`
- Screenshot path: `audit/screenshots/desktop/19-verda-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C20-LABEL-001
- Concept: 20-halo
- Page: global footer
- Component: footer labels
- File path: `concepts/20-halo/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/20-halo-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C20-SITEMAP-001
- Concept: 20-halo
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/20-halo/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C21-LABEL-001
- Concept: 21-calm
- Page: global footer
- Component: footer labels
- File path: `concepts/21-calm/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/21-calm-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C21-SITEMAP-001
- Concept: 21-calm
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/21-calm/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C21-RENDER-001
- Concept: 21-calm
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/21-calm/index.html`
- Screenshot path: `audit/screenshots/desktop/21-calm-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C22-LABEL-001
- Concept: 22-precision
- Page: global footer
- Component: footer labels
- File path: `concepts/22-precision/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/22-precision-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C22-SITEMAP-001
- Concept: 22-precision
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/22-precision/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C22-RENDER-001
- Concept: 22-precision
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/22-precision/index.html`
- Screenshot path: `audit/screenshots/desktop/22-precision-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C22-RENDER-002
- Concept: 22-precision
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/22-precision/index.html`
- Screenshot path: `audit/screenshots/desktop/22-precision-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C23-LABEL-001
- Concept: 23-ritual
- Page: global footer
- Component: footer labels
- File path: `concepts/23-ritual/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/23-ritual-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C23-SITEMAP-001
- Concept: 23-ritual
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/23-ritual/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C23-RENDER-001
- Concept: 23-ritual
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/23-ritual/index.html`
- Screenshot path: `audit/screenshots/desktop/23-ritual-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C24-LABEL-001
- Concept: 24-signal
- Page: global footer
- Component: footer labels
- File path: `concepts/24-signal/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/24-signal-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C24-SITEMAP-001
- Concept: 24-signal
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/24-signal/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C24-RENDER-001
- Concept: 24-signal
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/24-signal/index.html`
- Screenshot path: `audit/screenshots/desktop/24-signal-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C25-LABEL-001
- Concept: 25-align
- Page: global footer
- Component: footer labels
- File path: `concepts/25-align/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/25-align-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C25-SITEMAP-001
- Concept: 25-align
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/25-align/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C25-RENDER-001
- Concept: 25-align
- Page: index.html
- Component: Copyright center delta -225px
- File path: `concepts/25-align/index.html`
- Screenshot path: `audit/screenshots/desktop/25-align-desktop.png`
- Problem observed: Copyright center delta -225px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C26-LABEL-001
- Concept: 26-vivant
- Page: global footer
- Component: footer labels
- File path: `concepts/26-vivant/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/26-vivant-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C26-SITEMAP-001
- Concept: 26-vivant
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/26-vivant/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C26-RENDER-001
- Concept: 26-vivant
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/26-vivant/index.html`
- Screenshot path: `audit/screenshots/desktop/26-vivant-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C27-LABEL-001
- Concept: 27-form
- Page: global footer
- Component: footer labels
- File path: `concepts/27-form/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/27-form-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C27-SITEMAP-001
- Concept: 27-form
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/27-form/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C27-LOGO-001
- Concept: 27-form
- Page: homepage/header/footer
- Component: Header logo
- File path: `concepts/27-form/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/27-form-desktop.png`
- Problem observed: Desktop header logo is boxed by concept-specific CSS.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove logo-card treatment while preserving Form's structured header.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C27-RENDER-001
- Concept: 27-form
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/27-form/index.html`
- Screenshot path: `audit/screenshots/desktop/27-form-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C28-LABEL-001
- Concept: 28-pure
- Page: global footer
- Component: footer labels
- File path: `concepts/28-pure/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/28-pure-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C28-SITEMAP-001
- Concept: 28-pure
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/28-pure/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C28-LANG-001
- Concept: 28-pure
- Page: homepage/header/footer
- Component: Mobile menu language switcher
- File path: `concepts/28-pure/partials/mobile-menu.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/28-pure-desktop.png`
- Problem observed: Language switcher fits but top controls/close contrast and spacing need review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Improve top control contrast/spacing without making Pure ornate.
- Files likely affected: partials/mobile-menu.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C28-FOOTER-001
- Concept: 28-pure
- Page: homepage/header/footer
- Component: Footer decoration
- File path: `concepts/28-pure/partials/footer.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/28-pure-desktop.png`
- Problem observed: Footer uses large rectangle/circle treatments.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Remove rectangles/circles while keeping Pure's minimal education-footer identity.
- Files likely affected: partials/footer.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C28-RENDER-001
- Concept: 28-pure
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/28-pure/index.html`
- Screenshot path: `audit/screenshots/desktop/28-pure-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C28-RENDER-002
- Concept: 28-pure
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/28-pure/index.html`
- Screenshot path: `audit/screenshots/desktop/28-pure-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C29-LABEL-001
- Concept: 29-solace
- Page: global footer
- Component: footer labels
- File path: `concepts/29-solace/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/29-solace-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C29-SITEMAP-001
- Concept: 29-solace
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/29-solace/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C29-RENDER-001
- Concept: 29-solace
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/29-solace/index.html`
- Screenshot path: `audit/screenshots/desktop/29-solace-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C30-LABEL-001
- Concept: 30-method
- Page: global footer
- Component: footer labels
- File path: `concepts/30-method/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/30-method-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C30-SITEMAP-001
- Concept: 30-method
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/30-method/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C30-NAV-001
- Concept: 30-method
- Page: homepage/header/footer
- Component: Desktop navigation
- File path: `concepts/30-method/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/30-method-desktop.png`
- Problem observed: Method desktop nav wraps to two rows in rendered review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Reduce header width pressure while preserving Method's systematic rhythm.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C30-RENDER-001
- Concept: 30-method
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/30-method/index.html`
- Screenshot path: `audit/screenshots/desktop/30-method-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C30-RENDER-002
- Concept: 30-method
- Page: index.html
- Component: Copyright center delta -225px
- File path: `concepts/30-method/index.html`
- Screenshot path: `audit/screenshots/desktop/30-method-desktop.png`
- Problem observed: Copyright center delta -225px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C31-LABEL-001
- Concept: 31-evolve
- Page: global footer
- Component: footer labels
- File path: `concepts/31-evolve/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/31-evolve-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C31-SITEMAP-001
- Concept: 31-evolve
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/31-evolve/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C31-RENDER-001
- Concept: 31-evolve
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/31-evolve/index.html`
- Screenshot path: `audit/screenshots/desktop/31-evolve-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C31-RENDER-002
- Concept: 31-evolve
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/31-evolve/index.html`
- Screenshot path: `audit/screenshots/desktop/31-evolve-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C32-LABEL-001
- Concept: 32-serene
- Page: global footer
- Component: footer labels
- File path: `concepts/32-serene/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/32-serene-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C32-SITEMAP-001
- Concept: 32-serene
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/32-serene/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C33-LABEL-001
- Concept: 33-elan
- Page: global footer
- Component: footer labels
- File path: `concepts/33-elan/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/33-elan-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C33-SITEMAP-001
- Concept: 33-elan
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/33-elan/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C33-RENDER-001
- Concept: 33-elan
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/33-elan/index.html`
- Screenshot path: `audit/screenshots/desktop/33-elan-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C34-LABEL-001
- Concept: 34-flora
- Page: global footer
- Component: footer labels
- File path: `concepts/34-flora/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/34-flora-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C34-SITEMAP-001
- Concept: 34-flora
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/34-flora/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C34-RENDER-001
- Concept: 34-flora
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/34-flora/index.html`
- Screenshot path: `audit/screenshots/desktop/34-flora-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C35-LABEL-001
- Concept: 35-atelier
- Page: global footer
- Component: footer labels
- File path: `concepts/35-atelier/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/35-atelier-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C35-SITEMAP-001
- Concept: 35-atelier
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/35-atelier/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C35-RENDER-001
- Concept: 35-atelier
- Page: index.html
- Component: Copyright center delta 43px
- File path: `concepts/35-atelier/index.html`
- Screenshot path: `audit/screenshots/desktop/35-atelier-desktop.png`
- Problem observed: Copyright center delta 43px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C36-LABEL-001
- Concept: 36-lumina
- Page: global footer
- Component: footer labels
- File path: `concepts/36-lumina/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/36-lumina-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C36-SITEMAP-001
- Concept: 36-lumina
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/36-lumina/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C36-RENDER-001
- Concept: 36-lumina
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/36-lumina/index.html`
- Screenshot path: `audit/screenshots/desktop/36-lumina-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C37-LABEL-001
- Concept: 37-vellum
- Page: global footer
- Component: footer labels
- File path: `concepts/37-vellum/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/37-vellum-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C37-SITEMAP-001
- Concept: 37-vellum
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/37-vellum/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C37-RENDER-001
- Concept: 37-vellum
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/37-vellum/index.html`
- Screenshot path: `audit/screenshots/desktop/37-vellum-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C38-LABEL-001
- Concept: 38-origin
- Page: global footer
- Component: footer labels
- File path: `concepts/38-origin/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/38-origin-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C38-SITEMAP-001
- Concept: 38-origin
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/38-origin/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C38-RENDER-001
- Concept: 38-origin
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/38-origin/index.html`
- Screenshot path: `audit/screenshots/desktop/38-origin-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C39-LABEL-001
- Concept: 39-kindred
- Page: global footer
- Component: footer labels
- File path: `concepts/39-kindred/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/39-kindred-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C39-SITEMAP-001
- Concept: 39-kindred
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/39-kindred/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C39-RENDER-001
- Concept: 39-kindred
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/39-kindred/index.html`
- Screenshot path: `audit/screenshots/desktop/39-kindred-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C40-LABEL-001
- Concept: 40-noble
- Page: global footer
- Component: footer labels
- File path: `concepts/40-noble/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/40-noble-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C40-SITEMAP-001
- Concept: 40-noble
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/40-noble/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C41-LABEL-001
- Concept: 41-vista
- Page: global footer
- Component: footer labels
- File path: `concepts/41-vista/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/41-vista-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C41-SITEMAP-001
- Concept: 41-vista
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/41-vista/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C41-RENDER-001
- Concept: 41-vista
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/41-vista/index.html`
- Screenshot path: `audit/screenshots/desktop/41-vista-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C42-LABEL-001
- Concept: 42-softline
- Page: global footer
- Component: footer labels
- File path: `concepts/42-softline/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/42-softline-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C42-SITEMAP-001
- Concept: 42-softline
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/42-softline/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C43-LABEL-001
- Concept: 43-meridian
- Page: global footer
- Component: footer labels
- File path: `concepts/43-meridian/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/43-meridian-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C43-SITEMAP-001
- Concept: 43-meridian
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/43-meridian/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C43-RENDER-001
- Concept: 43-meridian
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/43-meridian/index.html`
- Screenshot path: `audit/screenshots/desktop/43-meridian-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C44-LABEL-001
- Concept: 44-safeguard
- Page: global footer
- Component: footer labels
- File path: `concepts/44-safeguard/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/44-safeguard-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C44-SITEMAP-001
- Concept: 44-safeguard
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/44-safeguard/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C44-RENDER-001
- Concept: 44-safeguard
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/44-safeguard/index.html`
- Screenshot path: `audit/screenshots/desktop/44-safeguard-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C45-LABEL-001
- Concept: 45-silhouette
- Page: global footer
- Component: footer labels
- File path: `concepts/45-silhouette/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/45-silhouette-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C45-SITEMAP-001
- Concept: 45-silhouette
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/45-silhouette/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C45-RENDER-001
- Concept: 45-silhouette
- Page: index.html
- Component: Copyright center delta -225px
- File path: `concepts/45-silhouette/index.html`
- Screenshot path: `audit/screenshots/desktop/45-silhouette-desktop.png`
- Problem observed: Copyright center delta -225px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C46-LABEL-001
- Concept: 46-curate
- Page: global footer
- Component: footer labels
- File path: `concepts/46-curate/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/46-curate-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C46-SITEMAP-001
- Concept: 46-curate
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/46-curate/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C46-NAV-001
- Concept: 46-curate
- Page: homepage/header/footer
- Component: Desktop navigation
- File path: `concepts/46-curate/partials/header.html; css/style.css`
- Screenshot path: `audit/screenshots/desktop/46-curate-desktop.png`
- Problem observed: Curate desktop nav wraps to two rows in rendered review.
- Evidence: Prior screenshot/documentation audit plus component source paths.
- Severity: critical
- User impact: Affects usability, readability, or the concept's premium visual quality.
- Likely cause: Concept-specific CSS/partial treatment needs review.
- Recommended fix: Tighten nav rhythm without erasing Curate's gallery-like concept.
- Files likely affected: partials/header.html; css/style.css
- Verification method: Use rendered desktop/mobile screenshots and the concept-specific prompt before closing.
- Fix status: pending
- Human review needed: no

## C46-RENDER-001
- Concept: 46-curate
- Page: index.html
- Component: Desktop nav uses 2 rows
- File path: `concepts/46-curate/index.html`
- Screenshot path: `audit/screenshots/desktop/46-curate-desktop.png`
- Problem observed: Desktop nav uses 2 rows
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: critical
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C46-RENDER-002
- Concept: 46-curate
- Page: index.html
- Component: Copyright center delta -224px
- File path: `concepts/46-curate/index.html`
- Screenshot path: `audit/screenshots/desktop/46-curate-desktop.png`
- Problem observed: Copyright center delta -224px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C47-LABEL-001
- Concept: 47-proof
- Page: global footer
- Component: footer labels
- File path: `concepts/47-proof/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/47-proof-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C47-SITEMAP-001
- Concept: 47-proof
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/47-proof/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C47-RENDER-001
- Concept: 47-proof
- Page: index.html
- Component: Copyright center delta -226px
- File path: `concepts/47-proof/index.html`
- Screenshot path: `audit/screenshots/desktop/47-proof-desktop.png`
- Problem observed: Copyright center delta -226px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C48-LABEL-001
- Concept: 48-signature
- Page: global footer
- Component: footer labels
- File path: `concepts/48-signature/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/48-signature-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C48-SITEMAP-001
- Concept: 48-signature
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/48-signature/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C49-LABEL-001
- Concept: 49-wisdom
- Page: global footer
- Component: footer labels
- File path: `concepts/49-wisdom/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/49-wisdom-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C49-SITEMAP-001
- Concept: 49-wisdom
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/49-wisdom/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no

## C49-RENDER-001
- Concept: 49-wisdom
- Page: index.html
- Component: Copyright center delta -221px
- File path: `concepts/49-wisdom/index.html`
- Screenshot path: `audit/screenshots/desktop/49-wisdom-desktop.png`
- Problem observed: Copyright center delta -221px
- Evidence: Rendered diagnostic at desktop-1024.
- Severity: high
- User impact: Rendered behavior can differ from static source checks.
- Likely cause: Likely CSS spacing, partial layout, or mounted component behavior.
- Recommended fix: Inspect the component at the failing viewport and make a narrow fix.
- Files likely affected: HTML/CSS/partial depending on component
- Verification method: Re-run scripts/audit_rendered_concepts.py after fix.
- Fix status: pending
- Human review needed: no

## C50-LABEL-001
- Concept: 50-sovereign
- Page: global footer
- Component: footer labels
- File path: `concepts/50-sovereign/partials/footer.html`
- Screenshot path: `audit/screenshots/desktop/50-sovereign-desktop.png`
- Problem observed: Footer public labels were cleaned from Brand/Brand and Trust to About.
- Evidence: Source scan of footer partial.
- Severity: high
- User impact: Public-facing navigation language must match the current About rule.
- Likely cause: Generated footer labels retained older Brand terminology.
- Recommended fix: Replace visible and aria Brand labels with About while keeping links and legal/contact routes.
- Files likely affected: footer partial
- Verification method: Run rg label search and screenshot footer.
- Fix status: fixed
- Human review needed: no

## C50-SITEMAP-001
- Concept: 50-sovereign
- Page: sitemap
- Component: sitemap labels
- File path: `concepts/50-sovereign/sitemap.html`
- Screenshot path: `not applicable`
- Problem observed: Sitemap Brand and education label was cleaned to About and education.
- Evidence: Source scan of concept sitemap.
- Severity: high
- User impact: Sitemap is a public navigation page and must use approved labels.
- Likely cause: Generated sitemap retained older Brand heading.
- Recommended fix: Replace Brand and education with About and education.
- Files likely affected: sitemap.html
- Verification method: Run rg for Brand and education.
- Fix status: fixed
- Human review needed: no
