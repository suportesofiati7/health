# Scripts guide

Run commands from the repository root. Prefer the npm aliases below; they group the correct underlying tools and make the release workflow portable.

## Daily commands

| Command | Purpose |
| --- | --- |
| `npm run check:assets` | Verify local HTML, CSS and partial asset references. |
| `npm run check:pt` | Verify English/PT-BR route, language, metadata and structural parity. |
| `npm run check:seo` | Verify discovery files and audit on-page SEO implementation. |
| `npm run check:analytics` | Verify consent-aware analytics and form hooks. |
| `npm run validate` | Run all deterministic source checks. |
| `npm run build` | Recreate the deployable `dist/` output. |
| `npm run release:check` | Validate, then build. Use before each deployment. |
| `npm run serve` | Serve the built `dist/` output locally. |
| `npm run git:publish` | Add, commit with today's date and push to the current GitHub branch; use `--allow-empty` for a dated checkpoint. |
| `npm run screenshots` | Open the interactive screenshot manager for routes, viewports and elements. |
| `npm run site:index` | Update `robots.txt`, `sitemap.xml`, `llms.txt` and submit changed URLs to IndexNow. |
| `npm run site:translate` | Incrementally update edited/created Portuguese pages and shared translations. |
| `npm run seo` | Run the full internal/external link, metadata, schema, image, language and asset audit with terminal recommendations. |
| `npm run seo:refresh` | Run the SEO audit and apply only reviewed deterministic metadata fixes. |
| `npm run maintain` | Run the regular site and management maintenance checks; add `--backend` for Supabase migrations and Edge Functions. |

## Content and localization

```bash
npm run site:translate
npm run check:pt
```

The translation manager incrementally synchronizes edited, created and obsolete bilingual pages using the local translation engine and preserves reviewed overrides. Portuguese root pages are the published default-language source; update the mapped English page under `en/` and run `npm run check:pt` to verify the pair. Do not publish legacy `/pt/` output.

## Search and analytics

Run `npm run site:index` after changing public routes, indexability, canonical URLs or the canonical domain. Run `npm run seo` for the complete audit. The SEO tool deliberately reports speculative filename, alt-text, schema and keyword changes for review rather than inventing clinical claims.

After generated HTML or PT-BR output changes, run:

```bash
npm run check:analytics
```

Analytics configuration is maintained directly in the site source and checked by the validation command.

## Direct tools

The top-level entrypoints are `git-publish.py`, `screenshot_manager.py`, `index-site.py`, `translate-site.py`, `seo.py` and `maintenance.py`. They call the focused validation/build modules internally. Use `--help` for options.
