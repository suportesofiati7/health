# Deployment

## Requirements

- Node.js 22.19 or later and npm 9 or later.
- Python 3. The validators require the Python packages already used by this checkout.

Install the locked JavaScript dependencies with:

```bash
npm ci
```

## Preview

For editable source pages, use an HTTP server because partials are fetched at runtime:

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

The live public site is the separate no-build Cloudflare Pages project for this
`health` directory. The repository also has an optional `dist/` build for local
and CI verification; it does not replace the current Cloudflare deployment.

## Release gate

Run this from the repository root before every deployment:

```bash
npm run release:check
git diff --check
```

`release:check` runs asset, PT-BR, SEO/discovery and analytics validation, then builds the deployable artifact. It does not publish anything.

`npm run build` runs the unified `scripts/index-site.py --rebuild --no-notify`
pre-build hook, so the committed public discovery files stay synchronized with
the actual HTML route set. The deployment helper additionally runs the same
command with IndexNow notifications enabled; its private state file is ignored
by Git and blocked by `_redirects` on the public project.

Keep the public `health` site and the management application as two separate
Cloudflare projects. The public `health` project uses no build command and
publishes its configured repository directory directly. Do not point it at the
management app or change the management app's separate build/deployment project.

## Hosting requirements

- Leave the public `health` project's build command blank and publish its configured repository directory directly.
- Preserve `_headers` and `_redirects`. The redirect file permanently redirects the legacy English and `/pt/` URL families to their current canonical pages on Cloudflare Pages.
- Configure the `www` host as a Cloudflare Bulk Redirect to `https://francielesofiati.com` with status `308`, **Subpath matching** and **Preserve path suffix** enabled. Enable Cloudflare's **Always Use HTTPS** setting (or an equivalent origin rule) for HTTP requests. Cloudflare Pages `_redirects` rules cannot redirect by hostname.

After deployment, verify the home page, one PT-BR page, contact form destination, consent banner, canonical domain redirect, `robots.txt`, `sitemap.xml` and `llms.txt` on the live domain.


## Prevent old versions after publishing

The public site deploys the source directory directly. `_headers` tells browsers
that **every URL must revalidate before reusing a cached response**, including
extensionless pages, JavaScript modules, CSS, images and shared partials. ETags
can still avoid downloading unchanged files. Do not add a long browser TTL to
stable filenames. The optional build copies this same `_headers` file so its
policy cannot drift from the source deployment. Shared partial and route-map
fetches also bypass the browser HTTP cache.

For each release:

1. Confirm Workers & Pages → the **public health project** → production deployment
   shows the intended Git commit and a successful deployment. A local commit or
   a preview deployment does not update the custom production domain. Keep the
   management app in its separate project.
2. In the `francielesofiati.com` zone, remove conflicting Cache Rules, old Page
   Rules or Workers that force “Cache Everything”, override the origin/browser
   TTL, or cache HTML and stable script URLs. Set Browser Cache TTL to **Respect
   Existing Headers**. Do not rely on Development Mode as the permanent fix.
3. After deploying, use Caching → Configuration → **Purge Everything** once if
   the custom domain still serves the previous release. Purging Cloudflare does
   not erase copies already stored in visitors' browsers.
4. Verify both `/formulario` and `/js/public-intake.js` return the current content
   and `Cache-Control: no-cache, max-age=0, must-revalidate`. Confirm
   `/js/core/form-delivery.js` returns 200 and the Portuguese footer reads
   “Formulário”. Compare the custom domain with the successful production
   deployment URL when diagnosing a mismatch.

An already-open tab continues running the JavaScript it loaded. Visitors need
one reload or a new navigation to load a new release; never force-reload an
in-progress clinical form because that can discard attachments and answers.
An old response stored with an earlier long TTL may require a one-time hard
refresh; new headers only take effect after the browser requests the resource
again. The site does not register a service worker.

References: [Cloudflare Pages serving and cache behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/),
[Pages headers](https://developers.cloudflare.com/pages/configuration/headers/),
and [Browser Cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/).
