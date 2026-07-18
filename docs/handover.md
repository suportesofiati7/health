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
| Edit English page copy | Edit the corresponding root HTML page. |
| Update PT-BR after English changes | `python3 scripts/generate-portuguese-site.py && npm run check:pt` |
| Check everything and build | `npm run release:check` |
| Refresh robots/sitemap and audit SEO | `npm run seo:refresh` |
| Check a broken asset path | `npm run check:assets` |
| Check consent and analytics hooks | `npm run check:analytics` |
| Weekly performance evidence | `npm run maintain:performance` |
| Full performance audit | `npm run perf:all && npm run perf:budget` |

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
4. Deploy `dist/`, then complete the live checks in [Deployment](deployment.md).

## Troubleshooting

- Missing headers/footer in a source preview: use HTTP, not `file://`.
- A PT-BR change disappears: put repeatable wording in `data/translation/` and regenerate rather than editing generator-owned output.
- Sitemap check says stale: run `python3 scripts/generate-robots.py` and `python3 scripts/generate-sitemap.py`, then rerun `npm run check:seo`.
- Build error after updating dependencies: delete only `node_modules/`, run `npm ci`, then rerun the release gate. Do not delete the lockfile to solve an install problem.
