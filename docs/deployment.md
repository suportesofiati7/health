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

The committed HTML, CSS, JavaScript, images, `_headers`, and `_redirects` files are the deployment artifact. No site build is required.

## Release gate

Run this from the repository root before every deployment:

```bash
npm run release:check
git diff --check
```

`release:check` runs asset, PT-BR, SEO/discovery and analytics validation. It does not build or publish anything.

Deploy the repository root as the static site. Do not configure a build command.

## Hosting requirements

- Leave Cloudflare Pages’ build command blank.
- Configure the published directory as the repository root (`.`).
- Preserve `_headers` and `_redirects`. The redirect file permanently redirects the legacy English and `/pt/` URL families to their current canonical pages on Cloudflare Pages.
- Configure the apex host (`francielesofiati.com`) as a Cloudflare Bulk Redirect to `https://www.francielesofiati.com` with status `301`, **Subpath matching** and **Preserve path suffix** enabled. Cloudflare Pages `_redirects` rules cannot redirect by hostname.

After deployment, verify the home page, one PT-BR page, contact form destination, consent banner, canonical domain redirect, `robots.txt`, `sitemap.xml` and `llms.txt` on the live domain.
