# Performance implementation summary

The historical implementation described below improved the static-site build pipeline. Its measured route names and Lighthouse values came from an earlier bilingual build and are not current release measurements; use `npm run perf:all` for current Portuguese-route results.

## Measured local result

Cold-cache Lighthouse (Chrome 150, simulated mobile/desktop, one run per representative route):

| Route | Profile | Performance | LCP | CLS | TBT | Transfer |
|---|---|---:|---:|---:|---:|---:|
| index.html | Mobile | 99 | 1.88 s | 0.000 | 48 ms | 159 KB |
| index.html | Desktop | 100 | 0.64 s | 0.000 | 0 ms | 359 KB |
| about.html | Mobile | 99 | 1.96 s | 0.000 | 42 ms | 168 KB |
| about.html | Desktop | 100 | 0.64 s | 0.000 | 0 ms | 363 KB |

The original homepage baseline was 74 performance, 21.0 s LCP, 0.045 CLS and 6.6 MB transfer. These are laboratory results, not a promise of PageSpeed or Search Console field scores. Production PSI requires deployment and real IDs for the consent-gated GTM container.

## Repeatable commands

```bash
npm ci
npm run build
npm run perf:all                 # three-run mobile + desktop Lighthouse matrix
npm run validate
```

Use `PERF_ROUTES=/,sobre.html PERF_RUNS=3 npm run perf:mobile` to check selected routes. Production PageSpeed Insights checks require deployment and an API key configured locally.

## Remaining deployment work

Deploy `dist/` through the existing CDN, confirm Brotli/HTTP/2 or HTTP/3, then run PSI and monitor Search Console Core Web Vitals. Replace the documented GTM/GA4 placeholders only after configuring the container and consent tests.
