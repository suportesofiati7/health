# Functional test matrix

This inventory describes source-discovered routes and controls. “Passed” means the named local command or browser assertion executed. It does not imply live provider delivery or manual review of every control.

## Public static site

| Surface | Inventory / expected outcome | Status and evidence |
| --- | --- | --- |
| Home and utility pages | 20 root HTML routes, including index, 404, form, thank-you, policies and topical landing pages. Public routes render Brazilian Portuguese and preserve canonical metadata. | Static route/source inventory; assets pass. Utility/error response behavior still needs hosting smoke checks. |
| Journal | 248 article routes under `blog/`; links and local assets should resolve, shared chrome should load once, and consent/analytics should follow stored consent. | Local internal-link audit: 0 broken links, 2,461 crawlable internal links. All 288 pages pass schema/social validators; article titles/descriptions have 155 length warnings and clinical copy still requires editorial review. |
| Service catalogue | 20 service routes under `servicos/`; treatment links should resolve to the published service page. | Local asset scan passes; static route inventory. No practitioner-specific service workflow is executed by a static page. |
| Shared navigation | Header, mobile menu, footer and contact links resolve to current Portuguese routes; no live link points to `/en/`. | `check:pt` passes; link audit reports 0 broken internal links. Hosting redirect semantics not exercised locally. |
| Forms | Public intake, interest/contact, newsletter and other forms validate inputs and show correct feedback. Intake acceptance must be explicit; drafts must never imply agreement. | Management regression suite verifies explicit consent fields, draft non-acceptance and alphanumeric identity inputs. Actual public email/provider acceptance is not verified. |
| Consent and analytics | Consent controls persist the selected state; analytics loads only after consent; preference page allows changing choices. | `npm run check:analytics` passes. No live analytics account events were asserted. |
| Static interactions | Source contains about 3,435 anchors, 119 buttons, 117 forms and 765 input/select/textarea controls across 288 HTML pages. | Counts are discovery evidence only. Every control has not been manually clicked or browser-tested. |
| Sitemap and crawler metadata | Sitemap exactly lists indexable canonical URLs; robots permits public pages and `llms.txt` points only at existing canonical routes. | `check-seo-files.py` passes: 284 sitemap URLs and 25 curated links. |

## Private management app

| Screen / workflow | Expected outcome | Verification |
| --- | --- | --- |
| Sign-in, recovery and session | Auth errors are actionable, valid membership controls access, logout clears the active UI/session. | Unit tests and fictional-fixture browser workflow pass. Production Auth settings are external and unverified here. |
| Today/home and navigation | Navigation opens the intended section and responsive layouts do not overflow. | Browser suite passes desktop, tablet and mobile; responsive widths 320–2560 px. |
| Patient list/profile | Selecting a patient opens the matching profile; tabs show role-authorized data; private avatar/photo can load. | Browser fixture passes profile, photo, tab and reception-visibility assertions. |
| Clinical record and documents | Drafts save; finalized records remain immutable; reports open and can print/save as PDF. | Unit and regression suites pass; browser covers record navigation and report rendering; regression checks actual PDF bytes and print handler under CSP. |
| Agenda | Appointment screen loads and remains responsive. | Browser suite navigates to agenda; full create/reschedule/cancel lifecycle not individually exercised in this run. |
| Tasks and follow-ups | Queue loads, manual tasks and clinical returns save against the selected patient. | Browser suite creates one fictional task and one follow-up; SQL security suite verifies scoped writes. |
| Public intake review/conversion | Review status persists; conversion applies only recorded consent choices and does not invent acceptance. | Browser fixture and SQL consent projection/idempotence checks pass. No production patient was modified by these tests. |
| Procedure catalogue | Botox and other service editor changes preserve structured fields and version snapshots. | Browser suite edits two fictional procedures and checks price/metadata; database tests verify version snapshots. |
| Treatment plans and clinical procedure lifecycle | Existing plans can be corrected; plan-generated procedure drafts can be resumed and finalized with linked lot use. Finalized clinical entries stay immutable. | Browser suite asserts plan update and create/resume RPC payloads. Ephemeral SQL suite verifies plan/catalogue RLS and atomic procedure/usage/consumption persistence, expired-lot rejection and draft finalization. |
| Finance | Correct patient/procedure thumbnail, payment/receipt workflow, refunds, no invoice action, and role restrictions. | Browser fixture checks thumbnail, receipt popup/PDF controls, payment, refund and absence of invoice actions; SQL role checks pass. |
| Communication | Patient context populates a prepared WhatsApp message and stores the communication. | Browser suite intercepts the WhatsApp popup and verifies normalized phone, message and patient linkage. Live send intentionally not performed. |
| Reports and export | Filters apply to the selected patient; output is printable and remains authorized. | Browser report path and PDF regression pass with fictional data. Full backup restore against production is not tested. |
| Settings, users and roles | Authorized owner controls are available; reception and read-only roles cannot see restricted clinical/finance functions. | Browser and SQL RLS suites pass for tested roles and fixtures. Production membership/role state remains unverified. |
| Patient portal | Authentication gates patient resources and permitted appointment/post-care actions. | Source and RLS reviewed; end-to-end portal patient-session journey not run in this turn. |

## Verification boundaries

- No real patient data is used by the automated test fixtures.
- Local SQL tests apply migrations to an ephemeral PostgreSQL cluster and roll back fixture writes.
- External email relay acceptance, production Cloudflare routing/cache policy, Supabase dashboard settings and inbox delivery require provider-side verification.
- A “passed” navigation test covers only the listed route/action, not every button on every screen.
- Entity-by-entity create/read/update/delete intent and remaining lifecycle gaps are tracked in `FEATURE_COMPLETENESS_MATRIX.md`.
