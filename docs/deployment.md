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
