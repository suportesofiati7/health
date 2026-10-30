# Production deployment

The production contract is [config/production.json](../config/production.json).
Both Cloudflare Pages projects use `suportesofiati7/health`, branch `main`.

| Site | Pages project | Root directory | Build | Published directory | Domain |
| --- | --- | --- | --- | --- | --- |
| Public | `health` | repository root | `npm run build` | `dist` | `francielesofiati.com` |
| Professional | `app` | `management` | `npm run build` | `dist` | `app.francielesofiati.com` |

Cloudflare account: `f849b654ca8cd73d78e19c7a1a85c36c` (suportesofiati@gmail.com).
Database and Edge Functions: Supabase `naypgbhwnlbyqqqfftgn`, configured in
`management/supabase`. No second database or Worker hosts these applications.
The empty root-level `supabase/` directory is not a deployment source.

## One release workflow

1. Install locked dependencies with `npm ci` and `npm ci --prefix management` using Node 22.19+.
2. Edit public HTML, `css/site.css`, `js/`, shared partials or `management/src/`.
3. Run `npm run validate`, `npm test --prefix management`, `npm run test:db --prefix management`,
   `npm run test:regressions --prefix management`, `npm run test:public-browser`,
   and `npm run test:workflows`. Run the management browser suite against its local Vite preview.
4. Build with `npm run build` and `npm run build --prefix management`. Preview the public
   artifact with `npm run serve`. Never edit or publish repository source as static output.
5. For a database change, inspect `npx supabase db push --dry-run` from `management`, then
   apply the reviewed migrations with `npx supabase db push --yes`. Deploy only changed
   Edge Functions with the existing authenticated/public JWT configuration.
6. Commit the intended source changes and push `main`. Cloudflare builds both projects
   from that commit. Do not switch either project to a different repository or publish source.
7. Verify deployment status and commit for both projects. Compare the public
   `/build-info.json` source commit, current asset fingerprint and live UI.
8. Run the live public interaction test with `PUBLIC_TEST_URL=https://francielesofiati.com`.
   It intercepts fictional submissions before they reach production storage.
9. Regenerate and notify discovery with `python3 scripts/index-site.py --rebuild` after
   the new routes are live. The sitemap index is `https://francielesofiati.com/sitemap-index.xml`.

For a controlled recovery, the same built artifacts can be uploaded with
`npx wrangler pages deploy dist --project-name health --branch main` and
`npx wrangler pages deploy management/dist --project-name app --branch main`.
This is an alternative transport for the same artifact, not a second source or hosting system.
A direct upload should identify its Git commit; the next Git deployment must use the same source.

## Caching and DNS

HTML, stable filenames and shared partials revalidate. Only content-fingerprinted
`/assets/build/*` and `/assets/generated/*` are cached for one year. Never cache
management responses: its headers retain `private, no-store` and `noindex`.
Do not apply a zone-wide Cache Everything rule. Keep Browser Cache TTL at Respect Existing Headers.

The public custom domains belong to `health`; the app domain belongs to `app`.
Do not replace these domain associations with Workers or another Pages project.
DNS record mutation requires an appropriately scoped Cloudflare token. The available
Wrangler OAuth session can manage Pages but does not grant DNS record reads/writes;
do not guess or overwrite DNS records to work around that boundary.

## Content and credentials

The site publishes Portuguese only. `npm run maintain` never translates or restores
retired English routes. Legacy translation commands are not part of production releases.
Keep credentials in provider configuration or ignored local files. Public Supabase keys
are publishable identifiers; service-role keys and provider tokens must never enter either build.

Gmail buttons prepare a draft under `suportesofiati@gmail.com`; the professional reviews
and sends it in Gmail. History records preparation, never a claim of successful delivery.
