# Engineering handover

## Fast path

```bash
npm ci
npm run release:check
npm run serve
```

Use Node.js 22.19+; the exact JavaScript dependency tree is committed in `package-lock.json`. `npm ci` is the reproducible install command. `npm run serve` previews the generated `dist/` output, not the editable source.

The shipped site has no runtime npm dependencies. `npm audit --omit=dev` is clean; the remaining audit advisories are confined to development-only Lighthouse CI transitive dependencies and have no non-breaking upstream remediation at this time. Review them when Lighthouse CI publishes a compatible update.

## Everyday work

| Need | Command or location |
| --- | --- |
| Edit Portuguese page copy | Edit the corresponding root HTML page; Portuguese is the default language. |
| Update the English pair | Edit the mapped `en/` page in `data/page-pairs.json`, then run `npm run check:pt`. |
| Check everything and build | `npm run release:check` |
| Refresh robots/sitemap and audit SEO | `npm run site:index` then `npm run seo` |
| Update edited translations | `npm run site:translate` |
| Commit and push with today's date | `npm run git:publish` |
| Check a broken asset path | `npm run check:assets` |
| Check consent and analytics hooks | `npm run check:analytics` |
| Regular maintenance | `npm run maintain` |
| Regular maintenance plus backend | `npm run maintain -- --backend` |

## Before editing

- Read [Architecture](architecture.md) to find the source of truth.
- Follow [asset naming](asset-naming.md) when adding or replacing public imagery.
- Preserve public URL paths, metadata, structured data, IDs and `data-*` hooks unless the accompanying code and SEO work are updated too.
- Do not edit `dist/`, generated reports, or the lockfile by hand.
- Keep `data/seo.json`, page canonical tags, `robots.txt`, `sitemap.xml` and `llms.txt` aligned whenever the canonical domain or public route inventory changes.

## Release checklist

1. Confirm the final domain in `data/seo.json` and the page-level canonical tags.
2. Run `npm run release:check` and `git diff --check` with no errors.
3. Inspect the `dist/` preview on desktop and mobile.
4. Deploy the public `health` project using its existing no-build Cloudflare
   configuration, then complete the live checks in [Deployment](deployment.md).

## Troubleshooting

- Missing headers/footer in a source preview: use HTTP, not `file://`.
- A language switcher link is wrong: update `data/page-pairs.json`; Portuguese and English slugs are allowed to differ.
- Sitemap check says stale: run `npm run site:index`, then rerun `npm run seo`.
- Build error after updating dependencies: delete only `node_modules/`, run `npm ci`, then rerun the release gate. Do not delete the lockfile to solve an install problem.
