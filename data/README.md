# Data ownership

The current English HTML pages are the source of public page content. Do not introduce a second content master.

| File or directory | Owner and purpose |
| --- | --- |
| `page-pairs.json` | Runtime language switching, sitemap generation, shared-chrome validation and production build |
| `shared-site.json` | Runtime form endpoint and shared client-side facts |
| `interface-copy.json` | Shared-chrome build input for English/PT interface feedback |
| `seo.json` | Canonical site identity used by SEO/discovery scripts |
| `translation/` | PT-BR generator memory, glossary, explicit overrides and allowlist |

When editing a current English page, update that HTML directly, then run the PT-BR generator and its validation. Keep data only when a script or runtime module consumes it; do not duplicate page copy here.
