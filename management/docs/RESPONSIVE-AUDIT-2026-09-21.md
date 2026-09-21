# Management app responsive audit

Date: 21 September 2026  
Scope: management shell, navigation, dashboard, patient workspace, forms, catalog, dense lists, dialogs, finance, reports and settings.

## Findings and changes

- Several generations of layout rules repeated the same breakpoints. At mobile widths, later selectors overrode earlier ones, which made the shell and forms hard to tune consistently. Added a final responsive layer with fluid content sizing, explicit tablet and desktop widths, a two-column form layout on larger screens, and single-column forms on phones.
- The mobile navigation had no scrim or body scroll lock. It is now an off-canvas drawer with an outside tap target, Escape dismissal, safe-area padding and scroll lock while open.
- A flex basis on the dashboard heading left a large blank area above its action buttons on phones. The heading and actions now size to their content.
- The shared field sizing rule widened an invisible file input and caused document overflow. The file input is excluded from visible control sizing.
- Finance's floating action trigger covered its visible detail buttons. The row keeps its native right-click menu and leaves the visible controls unobstructed.
- Service catalog cards use service-specific online artwork with a 16:9 crop. The image URL is editable per service, with an in-editor preview.
- A 768px tablet left too little room for the dashboard's two-panel layout, which squeezed an appointment name into a narrow column. The dashboard panels now stack until the workspace has enough room.

## Responsive layout targets

The browser overflow and shell checks cover 320, 360, 390, 430, 600, 760, 768, 900, 1024, 1200, 1280, 1366, 1440, 1600, 1920 and 2560 CSS pixels. This includes small, medium and large phone widths; tablet and compact laptop widths; common laptop sizes; and wide desktop monitors.

Screenshots are captured at 320, 390, 768, 1024, 1440 and 1920 pixels. Full fictional-data workflows run at 390, 768 and 1440 pixels, including patient navigation, agenda, tasks, intake review, Finance, reports and settings. The mobile drawer open, backdrop dismissal and body scroll restoration are checked as well.

## Verification

- `npm run build` — passed.
- `npm test` — 9 tests passed.
- `npm run test:db` — passed against the local PostgreSQL test cluster.
- `MANAGEMENT_TEST_URL=http://127.0.0.1:5173 npm run test:browser` — passed at desktop, tablet and mobile workflow sizes and 16 responsive widths. Browser fixtures use fictional data.
- Supabase versioned migration applied successfully. The remote database reports `public.procedures.image_url` in `information_schema.columns`, and the project configuration reports public signup disabled.
- All 18 mapped service image URLs returned HTTP 200 with `image/png` content type.

## Limits

This verifies local app workflows and the remote schema column. It does not deploy the management app to Pages or perform production patient-data writes.
