# SEO recovery plan

## What I found

Your SEO work is mostly present in the codebase, but the **published site is still sending the wrong signals to crawlers**.

### Confirmed issues
1. **The live site is still serving old favicon markup**
   - Live HTML currently points to:
     - `/favicon.ico`
     - `/ccd-logo.png`
   - That does **not** match the newer RealFaviconGenerator setup in the current codebase.
   - This explains why Google can still show the old/Lovable-looking icon.

2. **Deep pages are not crawler-first**
   - When requesting a blog URL directly, the server initially serves the generic app shell HTML.
   - That means bots do **not** reliably get route-specific `<title>`, canonical, description, OG tags, and JSON-LD in the first HTML response.
   - For indexing, this is a major weakness even if React updates tags later in the browser.

3. **Sitemap trust is likely being weakened**
   - The sitemap is reachable and valid enough to fetch.
   - But if Google sees sitemap URLs that depend on client-side rendering only, or sees inconsistent canonicals/head output, it may treat the sitemap as low-confidence.

4. **The live deployment is stale vs current repo**
   - The codebase you showed contains newer favicon/meta setup.
   - The published site is still serving older head markup.
   - So at least part of the problem is that the frontend version Google sees is not aligned with the current source.

## What I’ll implement

### 1. Make important pages prerendered / crawler-readable on first load
I’ll make the key SEO pages output **real static HTML at build time**, so crawlers get proper metadata and content without depending on JavaScript execution.

Pages to cover first:
- `/`
- `/about`
- `/events`
- `/blog`
- every `/blog/:slug`
- `/bengaluru-underground-dance-music`
- any other high-priority static landing pages already in the sitemap

This will ensure each page has:
- correct `<title>`
- correct meta description
- correct canonical
- route-specific Open Graph / Twitter tags
- route-specific JSON-LD
- meaningful body content in the initial HTML

### 2. Fix favicon and site identity signals end-to-end
I’ll align the live site to one favicon set only:
- use the RealFaviconGenerator files consistently
- remove stale/legacy icon references
- ensure `favicon.ico`, `favicon.svg`, `apple-touch-icon`, manifest, app name, and theme colors all match
- verify the homepage `<head>` on the published site reflects the new setup

This is the part most likely to fix the wrong Google favicon signal.

### 3. Make sitemap generation match the real indexable pages
I’ll replace the hand-maintained sitemap approach with a source-of-truth-driven sitemap so it only lists pages that are actually meant to rank.

That means:
- include only real pages
- generate blog URLs from the actual post source
- remove stale or mismatched URLs
- keep canonicals and sitemap URLs perfectly aligned
- keep `lastmod` consistent with content updates where possible

### 4. Harden route-level SEO consistency
I’ll audit and correct mismatches between:
- `index.html`
- `SEO.tsx`
- sitemap URLs
- blog slugs
- canonical URLs
- social preview tags
- public brand metadata

The goal is that Google sees the same identity everywhere, instead of mixed old/new signals.

### 5. Add explicit noindex handling for true non-content pages
I’ll make sure pages that should not rank stay out of the index signal set, including:
- admin pages
- embed pages
- fallback/not-found states where possible

This reduces crawl waste and improves trust in the pages that should rank.

## Important note
Even after the fix ships, **Google will not refresh instantly**.
Two things will still be required after implementation:
1. **Publish the frontend update** so the live site actually changes
2. Re-submit the sitemap / request reindex in Google Search Console

Backend changes go live immediately, but **frontend SEO fixes only affect Google after you click Update in the publish flow**.

## Technical details

### Likely implementation approach
- Add a build-time prerender step for SEO-critical routes
- Generate static HTML snapshots using the existing route data and SEO config
- Generate sitemap from the same route/post source so both stay in sync
- Keep React Router for the app, but give crawlers actual HTML for ranking pages

### Files likely involved
- `index.html`
- `src/components/SEO.tsx`
- `src/App.tsx`
- `src/pages/Blog.tsx`
- `src/pages/BlogPost.tsx`
- `src/content/posts.ts`
- `public/site.webmanifest`
- `public/sitemap.xml` or a generated replacement
- favicon files in `public/`
- possibly `vite.config.ts` and a small build-time prerender/generation script

## Expected result
After this, your site should have:
- a crawlable sitemap Google can trust
- real metadata on first page fetch
- correct favicon/brand identity in search
- much stronger odds of actual indexing for blog and landing pages

Approve and I’ll implement it.