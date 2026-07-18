# Performance Final Report

Generated: 2026-07-18T22:05:36.908Z

Source: `/run/media/code/Storage/GitHub/ashtra/health/dist`

Chrome: Google Chrome 150.0.7871.46

Lighthouse: 12.8.2

Runs per route/profile: 1

> These are local laboratory measurements. They do not claim deployed PageSpeed or Search Console field performance.

| Route | Profile | Performance median (min–max) | LCP ms | CLS | TBT ms | FCP ms | Transfer KB | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| index.html | mobile | 100 (100–100) | 1505 | 0.000 | 0 | 1097 | 125 | 13 |
| treatments.html | mobile | 100 (100–100) | 1502 | 0.000 | 0 | 1051 | 112 | 14 |
| consultation.html | mobile | 100 (100–100) | 1426 | 0.000 | 0 | 1051 | 95 | 14 |

## Environment and limitations

- Cold-cache Lighthouse navigation with simulated throttling and a clean headless Chrome profile.
- Local responses use gzip for compressible resources and revalidation caching for fair source/build comparison.
- The production domain did not resolve during this audit, so production PSI and CrUX data are not included.
- Analytics IDs remain placeholders; the performance cost of a future published GTM container cannot yet be measured.
