# Audit and implementation decisions - 14 September 2026

## Repository and public product

Started from clean `main` at be08ef6; all new work is on `Management`.
Framework-free HTML/CSS/native modules; Portuguese is now at root and English
under `en/`. Root README describes an older EN/PT build layout and is stale.
Current `docs/deployment.md` and package scripts describe direct static publishing
of the repository root. There is no current build script. Actual Cloudflare account
settings cannot be inspected without authenticated access. No automatic production
deployment is performed by this change.

Inventory: 1,933 tracked assets, 89 English files, 70 blog files, 20 service pages,
62 CSS files, 25 JavaScript files, 16 partials. Shared navigation is composed by
`js/partials.js`; forms by `js/components/forms.js`; consent and analytics are separate
modules. SEO includes canonical/hreflang, JSON-LD, robots and sitemaps. Existing
responsive CSS, skip links and navigation remain authoritative for the public site.
The GitHub performance workflow references obsolete root Lighthouse config paths;
this pre-existing issue is outside management scope. Generated/temp/report files
exist in the tracked repository: publish only the management build for the private app.

The new app deliberately does not import public analytics, tracking, FormSubmit
form enhancement, or the site's large CSS cascade. Only homepage HTML receives a
thin access bar; the preregistration entry is a new page. Public content is preserved.

## Actual brand

Source: `css/src/foundations/tokens.css`, current `css/site.css`, and brand assets.
Menu green #3f5039; forest #1d3026; sage #e4edda/#f1f5ec;
rose #9b584d/#7c453e; blush #f8e0d8; gold #ab7a38; ivory #fffdf7;
white #ffffff; body ink #46554c. Serif headings use Iowan Old Style/Baskerville/
Palatino/Georgia; body Inter/Avenir Next/Segoe UI/system. Botanical, calm, personal
clinical identity. Reuse the existing raster logo. App typography is compact,
letter-spacing zero, controls 44px minimum, radii 6px, lightly bordered unframed
sections, green primary actions and rose secondary accents. No replacement brand.

## Existing infrastructure and security findings

The supplied project's Auth settings endpoint responds HTTP 200 with the supplied
publishable key. It reports `disable_signup: false`: public signup is currently ON.
No local Supabase directory, login credentials, database password, or CLI was present
at audit start. GitHub SSH can read origin; `gh` has an expired unrelated token.
No Supabase management connector is available. A GitHub connection in the Supabase
dashboard does not establish local CLI login or prove migrations have run.

Existing forms post to FormSubmit suportesofiati@gmail.com, including a large
consent form with sensitive fields. Preserve those forms as requested; their
privacy/processor suitability needs a separate clinic review. Do not reuse public
analytics or public form scripts inside the clinical app.

## Architecture and sequence

1. Independent React/Vite application in `management/`; publish `management/dist`
   to a separate Cloudflare Pages Free project/origin. No Cloudflare Worker needed.
2. Supabase Auth, Postgres RLS, organization membership and private Storage. Browser
   uses publishable configuration only. Every request checks current active membership.
3. Versioned SQL for relations, immutable finalized entries, append-only revisions,
   author identity, audit metadata, private attachment authorization and quotas.
4. Supabase Edge Functions only for admin invitations, public write-only intake,
   validated uploads and encrypted email submission. Free Turnstile + atomic database
   rate counters protect intake. No public direct insert policy.
5. Patient-centred UI: Today, Agenda, Patients, Enquiries, Tasks, Reports, Settings.
   A patient profile joins assessment, history, plan, procedure, photos, evolution,
   consent and follow-up. PT-BR default with remembered UI language only.
6. Test SQL with ephemeral local PostgreSQL, browser with fictional fixtures,
   encrypted backup round trips, deployment/configuration checks. Remote checks
   remain separate from local evidence.

## Requirements and research

Clinical context is biomédica/esteticista/cosmetóloga, CRBM 6277, Londrina PR,
from the existing site's structured data and content. Do not assume physician
scope or generate medical prescriptions/certificates. The council must confirm
current habilitation and permitted procedures; CFBM rules and litigation require
professional review, not a software inference of legal permission.

- [LGPD, Ministry of Health](https://www.gov.br/saude/pt-br/acesso-a-informacao/lgpd):
  health data are sensitive; establish purposes, legal bases, controller responsibilities,
  access rights, processor arrangements and incident response with the clinic.
- [Law 13.787](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13787.htm):
  integrity/authenticity/confidentiality and the 20-year minimum before eligible
  destruction. No automatic clinical deletion; software timestamps are not ICP-Brasil
  signatures and this system is not certified for destruction of originals.
- [ANPD security guide](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/anonimizado___guia_orientat-_seg_da_inf_p_atpp.pdf):
  least privilege, backups, staff training and secure devices remain operational duties.
- [CFBM FAQ](https://cfbm.gov.br/duvidas-frequentes/) and
  [Resolution 241](https://cfbm.gov.br/resolucao-no-241-de-29-de-maio-de-2014/):
  document professional credentials and review current scope with CRBM.
- [Feegow agenda](https://feegowclinic.com.br/funcionalidades/agenda):
  scheduling linked directly to patient chart and encounter is an established workflow.
- [Supabase pricing](https://supabase.com/pricing): 500MB database, 1GB files,
  5GB uncached egress, 50,000 MAU; inactivity pausing and no production SLA.
- [Supabase backups](https://supabase.com/docs/guides/platform/backups): Free users
  should make off-site dumps; database backups do not contain Storage binaries.
- [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp): default sender is
  restricted to project team recipients and is not a general production mail service.
  Use controlled one-time activation/recovery links without purchasing an email provider.
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/):
  Free 500 builds/month, 20,000 files and 25MiB maximum asset; static hosting requires
  no paid Workers. [Turnstile](https://developers.cloudflare.com/turnstile/plans/) is free.
- [FormSubmit docs](https://formsubmit.co/documentation): file totals limited to 10MB.
  A successful HTTP submission is not proof of mailbox delivery. Never treat email
  as the only backup; encrypted packets keep clinical plaintext out of FormSubmit.

## Initial production blockers

Remote migrations, signup disablement, owner bootstrap, function secrets, Turnstile
hostname verification, deployment origin, remote authorization tests and a full
off-site recovery drill require completion. Legal/professional scope, retention,
controller notices and secure clinic-device practices require clinic review. Until
these gates are evidenced, use fictional data only.

## Continuation verification - 14 September 2026

Local verification after continuation:

- `npm --prefix management test` passed.
- `npm --prefix management run test:db` passed after adding
  `202609140003_validation_grants.sql`.
- `npm --prefix management run build` passed with Vite's large chunk warning.
- `MANAGEMENT_TEST_URL=http://127.0.0.1:5174 npm --prefix management run test:browser`
  passed against fictional Playwright fixtures at desktop, tablet and mobile sizes.

The database test initially exposed that authenticated patient inserts could not
execute the CNS checksum helper used by a constraint. The fix grants usage on the
private schema to `authenticated` and `service_role` and grants execute only on
`private.valid_cpf(text)` and `private.valid_cns(text)`.

Remote status from this terminal:

- `MANAGEMENT_ORIGIN=https://profissional.francielesofiati.com npm --prefix management run configure`
  failed because no Supabase administrative authentication is available locally.
- The publishable Auth settings endpoint responded HTTP 200 and still reports
  `disable_signup: false`.

Production remains blocked until the remote runbook in `OPERATIONS.md` is
completed with Supabase credentials, function secrets, owner bootstrap, Turnstile
verification and fictional-data remote smoke tests.
