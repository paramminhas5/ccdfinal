# Host CCD × Social proposal at `/ccdxsocial` + PDF downloads

## What we're building

1. A new public page at `https://catscandance.com/ccdxsocial` that serves the uploaded `ccd-social-updated.html` exactly as designed.
2. The page is **excluded from SEO** (no indexing, no link equity passed): `<meta name="robots" content="noindex, nofollow">` + `Disallow` in `robots.txt` + omitted from sitemap/SEO route list.
3. Two **download buttons** added inside the page header (next to the tabs):
   - `Download One-Pager (PDF)` → `/ccdxsocial/ccd-social-one-pager.pdf`
   - `Download Operations Doc (PDF)` → `/ccdxsocial/ccd-social-operations.pdf`
4. The two PDFs are generated **once, at build time**, from the One-Pager (`#doc-op`) and Operations Doc (`#doc-ops`) sections of the HTML, then committed to `public/ccdxsocial/` so they're served as static assets.

## How it'll work (technical)

**Static hosting (not a React route):**
The uploaded file is a self-contained HTML doc with its own fonts, CSS, and tab JS — wrapping it in React would break the design. Instead:
- Copy `ccd-social-updated.html` → `public/ccdxsocial/index.html`
- Inject `<meta name="robots" content="noindex, nofollow">` and a canonical-less `<head>` so it's invisible to search.
- Add two download buttons in the nav bar (styled to match existing `.tab` look) linking to the two PDFs.
- Vite serves `public/` as-is, so `/ccdxsocial` resolves to this static HTML before the SPA fallback in `_redirects` kicks in.

**SEO exclusion (belt + suspenders):**
- `public/robots.txt` → add `Disallow: /ccdxsocial`
- Page `<head>` → `noindex, nofollow`
- `scripts/seo-routes.mjs` → do NOT add this route (so it stays out of `sitemap.xml`, `sitemap-index.xml`, `rss.xml`, and the prerender list).
- Internal links from the rest of the site → none (so no PageRank flows to it).

**PDF generation:**
- Use a one-off Node script (`scripts/build-ccdxsocial-pdfs.mjs`) with **Puppeteer** (Chromium headless) to:
  1. Load the source HTML from disk via `file://`.
  2. For each tab, run JS in the page to show only that doc (`document.querySelectorAll('.doc').forEach(...)`), hide the nav bar and download buttons, then call `page.pdf({ format: 'A4', printBackground: true, margin: ... })`.
  3. Write the two PDFs to `public/ccdxsocial/`.
- Run this script once now (during this build) to produce the two PDF files. Commit the resulting PDFs so subsequent builds don't need Puppeteer.
- QA: convert each PDF to images and visually inspect every page for clipped text, broken layouts, missing fonts (Bowlby One / DM Sans must load via Google Fonts), and color fidelity. Iterate until clean.

**Files touched:**

```text
public/ccdxsocial/index.html              (new — copied + edited HTML)
public/ccdxsocial/ccd-social-one-pager.pdf  (new — generated)
public/ccdxsocial/ccd-social-operations.pdf (new — generated)
public/robots.txt                         (add Disallow: /ccdxsocial)
scripts/build-ccdxsocial-pdfs.mjs         (new — one-off generator, kept for re-runs)
```

No changes to `src/App.tsx`, `seo-routes.mjs`, sitemap, or RSS — keeping the page fully off the SEO graph.

## QA checklist before delivering

- `https://catscandance.com/ccdxsocial` loads with full design intact (fonts, colors, shadows).
- Both tabs work; both download buttons trigger PDF download.
- Each PDF opens cleanly, all pages render with correct fonts/colors, no clipped boxes.
- `view-source:` shows `noindex, nofollow`.
- `robots.txt` shows `Disallow: /ccdxsocial`.
- Page does not appear in `sitemap.xml`.

## Open question

The PDF will be a print-rendering of the on-screen design (same colors, neo-brutalist shadows, etc.). If you'd rather have a **cleaner print-optimized version** (white background, no chunk shadows, smaller margins for less paper), say so and I'll add print CSS overrides before generating. Default is "looks like the website."
