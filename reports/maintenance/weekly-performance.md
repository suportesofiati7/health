# Weekly performance maintenance report

Generated: 2026-07-18 22:05 UTC

## Checks

- PASS — Preview safe image-dimension fixes: Found 0 safe image-dimension fixes.
- FAIL — Build disposable production output: > franciele-sofiati-website@1.0.0 build
> node scripts/build/build-production.mjs
Error: /run/media/code/Storage/GitHub/ashtra/health/dist/assets/generated/treatments19-1600-cd47e7bbbc61.webp: unable to open for write
system error: No such file or directory
/run/media/code/Storage/GitHub/ashtra/health/dist/assets/generated/treatments19-1600-cd47e7bbbc61.webp: write error
system error: No such file or directory
at Sharp.toFile (/run/media/code/Storage/GitHub/ashtra/health/node_modules/sharp/lib/output.js:90:19)
at generateImage (file:///run/media/code/Storage/GitHub/ashtra/health/scripts/build/build-production.mjs:206:18)
at async optimizeHtmlImages (file:///run/media/code/Storage/GitHub/ashtra/health/scripts/build/build-production.mjs:261:17)
at async main (file:///run/media/code/Storage/GitHub/ashtra/health/scripts/build/build-production.mjs:527:12)
- PASS — Refresh image inventory: Wrote reports/performance/image-audit.csv for 892 images; 155 are referenced by current HTML or CSS.
- FAIL — Run Lighthouse performance audit: [final] index.html mobile run 1/1
Error: /run/media/code/Storage/GitHub/ashtra/health/node_modules/.bin/lighthouse exited 1
Runtime error encountered: Lighthouse was unable to reliably load the page you requested. Make sure you are testing the correct URL and that the server is properly responding to all requests. (Status code: 404)
at ChildProcess.<anonymous> (file:///run/media/code/Storage/GitHub/ashtra/health/scripts/performance/performance-audit.mjs:69:19)
at ChildProcess.emit (node:events:519:28)
at maybeClose (node:internal/child_process:1101:16)
at ChildProcess._handle.onexit (node:internal/child_process:304:5)
- PASS — Check performance budgets: {
"passed": true,
"checkedGroups": 3,
"failures": [],
"warnings": []
}

## Recommended fixes

- No metric crossed the maintenance thresholds in the latest audit.

## Safe automation boundary

By default the script refreshes generated build and audit files only. `--apply-safe-fixes` is limited to adding verified intrinsic dimensions to local raster images that have neither `width` nor `height`; it never resizes/replaces images, changes CSS, defers scripts, or overrides existing markup.
