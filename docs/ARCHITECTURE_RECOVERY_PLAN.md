> Historical audit. Current production configuration and release instructions are in [deployment.md](deployment.md) and [config/production.json](../config/production.json).

# Architecture recovery plan

## Target state

Keep the two products separate and give each responsibility one source of truth:

1. **Public site:** Brazilian Portuguese static pages in root, `blog/` and `servicos/`; `partials/pt-BR/` is active shared chrome; `js/main.js` is the only public app module entry point. Discovery files are generated from HTML and canonical metadata. A language pair is valid only when both routes exist and are recorded in `data/page-pairs.json`.
2. **Management app:** React/Vite frontend in `management/`, Supabase persistence/Auth/RLS in migration history, and narrow Edge Functions for privileged/public server operations. Keep client visibility separate from authorization; database policies and functions remain authoritative.
3. **Deployment:** public root and private management app stay on separate Cloudflare Pages projects. Public source publishing and optional `dist/` builds are distinct. Production data and provider settings are not inferred from local fixtures.
4. **Documents and consent:** preserve explicit patient choices and immutable clinical/audit history. Keep old schema columns/migrations for compatibility unless a reviewed data migration proves removal safe.

## Work sequence and dependencies

| Order | Work | Depends on | Risk and evidence gate |
| --- | --- | --- | --- |
| 1 | Reconcile current Portuguese-only routes, active navigation, redirects and validators. | Current root HTML and last known route map. | Redirect behavior must be tested after deployment; do not revive a removed language surface implicitly. |
| 2 | Complete page-specific SEO/social metadata and media review. | Confirmed canonical route, real page imagery, editorial review. | Avoid fabricated structured data, alt descriptions or treatment claims. Work in small page batches and rerun validators. |
| 3 | Patch vulnerable build/dev tooling where compatible. | Lockfile review and clean install. | Avoid major upgrades to Lighthouse tooling without CI/browser regression coverage. Public production dependency count remains zero. |
| 4 | Resolve external email relay acceptance and production setup checks. | Provider logs/credentials and authorized production access. | No inbox-delivery claim from unit tests or HTTP success alone. Do not expose secrets. |
| 5 | Decompose management screen/style modules incrementally. | Current navigation, role-based browser fixtures and critical-flow regression coverage. | Avoid broad rewrite; preserve public contracts, RLS, route behavior and stored data. |
| 6 | Expand screen/interaction coverage and production smoke checks. | Stable preview environment plus fictional fixtures; production access for live checks. | Do not run synthetic tests against real patient records. |
| 7 | Close CRUD gaps using the entity lifecycle matrix, starting with workflows that can strand or misreport clinical data. | Permission/RLS review, retention rules and explicit product semantics for deletion/correction. | Prefer append-only correction, archive or compensating entries for clinical, financial and inventory history. Require a real transactional database path for linked writes. |

## Decisions already made on this branch

- Fixed active PT-BR navigation against current routes and removed links to missing English pages.
- Updated translation/SEO audits to match the current single-language route architecture instead of requiring absent English counterparts.
- Repointed legacy English redirects using the previous committed route map; kept redirect target changes reviewable in `_redirects`.
- Preserved inactive English partial templates, old migration history and historical database fields because they still serve as recoverable source/evidence and are not required to remove for this repair.
- Added transactional write paths for clinical procedure + lot usage + inventory movement and for treatment plan + optional item. Added a UI action to resume plan-generated drafts and editing for existing treatment plan details; item-level deletion remains intentionally open pending dependency rules.
- Added the required CRUD/lifecycle matrix at `FEATURE_COMPLETENESS_MATRIX.md`; it distinguishes tested operations from UI-present and unverified operations.

## Change safety

Do not deploy, alter Cloudflare/Supabase production configuration, modify real patient records, remove database history or delete historical assets as part of a local audit. Any future production migration must include a data-preserving strategy, backup evidence and recovery procedure before execution.
