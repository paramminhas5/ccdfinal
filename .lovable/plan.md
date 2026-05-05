# Fix `/ccdxsocial` — make it load + move PDF buttons into the page

## What's wrong

**1. Page doesn't load in preview or after publish.**
The static HTML lives at `public/ccdxsocial/index.html` and is copied to `dist/ccdxsocial/index.html` at build time, but neither the Vite dev server (preview) nor Lovable's published hosting reliably serves it for the bare URL `/ccdxsocial`:
- **Vite dev**: `/ccdxsocial` (no trailing slash, no `.html`) is intercepted by the SPA fallback and renders the React `NotFound` page. Only `/ccdxsocial/index.html` works.
- **Published**: Lovable's CDN hosting does not honor Netlify-style `public/_redirects` rules, so `/ccdxsocial` falls through to the SPA shell — same NotFound result.

**2. Download buttons are in the wrong place.**
Currently they sit inside the partnership doc's own sticky black `<nav>` strip at the very top (next to the ONE-PAGER / OPERATIONS DOC tabs). You want them inside the document body — as a clear CTA block within each tab's content.

## Fix

### A. Make the route resolve everywhere

Add a real React route `/ccdxsocial` that renders the static HTML inline. This works in dev preview, in production, and survives Lovable's SPA fallback because it's now a first-class app route — no hosting/redirect tricks needed.

Implementation:
1. **New file** `src/pages/CcdxSocial.tsx`:
   - Reads the static HTML once at module load via Vite's `?raw` import: `import html from "/ccdxsocial/index.html?raw"`.
   - Strips the `<!DOCTYPE>`, `<html>`, `<head>` so we don't end up with nested document structure; keeps the `<style>`, `<link>` (Google Fonts), `<body>` content, and the inline `<script>` for tab switching.
   - Renders the body markup via `dangerouslySetInnerHTML` inside a full-viewport wrapper that hides the site's React `<Nav>` and `<Footer>` (this page is standalone, not part of the main site chrome).
   - Adds `<Helmet>` with `<meta name="robots" content="noindex, nofollow">` and the original page title.
   - After mount, runs the inline tab-switcher JS (re-initializes since `dangerouslySetInnerHTML` doesn't execute scripts).
2. **Register the route** in `src/App.tsx`: `<Route path="/ccdxsocial" element={<CcdxSocial />} />` (placed before the `*` NotFound catch).
3. **Keep** `public/ccdxsocial/index.html` on disk (the React page imports it as raw text, and the PDFs and Puppeteer build script still need it).
4. **Keep** `public/ccdxsocial/ccd-social-one-pager.pdf` and `ccd-social-operations.pdf` — they're served as static assets at the `/ccdxsocial/*.pdf` URLs (these DO work, because they're real files with extensions, not directory paths).
5. **Remove** the now-unnecessary `_redirects` rules for `/ccdxsocial` (the static HTML file itself stays, just no longer publicly served as a page).
6. **Confirm** the page is still excluded from SEO:
   - `noindex, nofollow` meta tag stays.
   - `robots.txt` `Disallow: /ccdxsocial` stays.
   - Route is NOT added to `scripts/seo-routes.mjs`, sitemap, sitemap-index, RSS, or any internal links.

### B. Move download buttons into the page body

In `public/ccdxsocial/index.html`:
1. **Remove** the two `<a class="tab" ... download>` elements from inside the `<nav data-noprint>` strip.
2. **Add** a single download CTA block inside each doc's content (`#doc-op` and `#doc-ops`), placed near the top of each tab's content (just under the hero/intro). Each block contains both PDF buttons styled as neo-brutalist chunks matching the existing `.cta`/`.gc` design language — bold border, chunk shadow, acid-yellow primary + cream secondary, "↓ DOWNLOAD ONE-PAGER (PDF)" / "↓ DOWNLOAD OPERATIONS DOC (PDF)" labels.
3. Buttons keep `download` attribute and link to `/ccdxsocial/ccd-social-one-pager.pdf` and `/ccdxsocial/ccd-social-operations.pdf`.
4. Add `data-noprint="true"` on the new CTA blocks so the Puppeteer build script can hide them when re-generating PDFs (so the PDF doesn't contain "download this PDF" buttons recursively).

### C. Regenerate PDFs

Run `node scripts/build-ccdxsocial-pdfs.mjs` once to regenerate both PDFs from the updated HTML (with the new in-body buttons hidden via `data-noprint`). Update the script's hide selector to also catch `[data-noprint]` (currently only hides `nav[data-noprint]`).

Then QA: render each PDF page to PNG with `pdftoppm`, visually inspect every page for layout breaks, missing fonts, clipped text. Iterate until clean.

## Files touched

```text
src/pages/CcdxSocial.tsx                  (new)
src/App.tsx                               (add route)
public/ccdxsocial/index.html              (move buttons from nav into body)
public/_redirects                         (remove /ccdxsocial rules)
scripts/build-ccdxsocial-pdfs.mjs         (broaden noprint selector)
public/ccdxsocial/ccd-social-one-pager.pdf  (regenerated)
public/ccdxsocial/ccd-social-operations.pdf (regenerated)
```

No changes to nav, sitemap, RSS, or seo-routes — page stays fully off the SEO graph.

## Verification after build

- `/ccdxsocial` loads in dev preview with full neo-brutalist design intact.
- `/ccdxsocial` loads on `catscandance.com` after publish (no NotFound).
- Site's React `<Nav>` and `<Footer>` are NOT visible on the page (standalone doc).
- Tab switching between ONE-PAGER and OPERATIONS DOC works.
- Download buttons appear as a visible CTA block inside each doc, not in the top nav.
- Both PDFs download and open cleanly.
- View-source shows `noindex, nofollow`.
- `robots.txt` still has `Disallow: /ccdxsocial`.
- Page does not appear in `sitemap.xml`.
