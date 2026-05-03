# SEO 10X Plan

Goal: ship every high-leverage change a code agent can do without waiting on Google. Grouped by impact.

## 1. Rich Results Schema (biggest visible win in SERPs)

- **Event schema** on every event/episode page (`/events`, `/events/:slug`): `MusicEvent` with `name`, `startDate`, `endDate`, `location` (Place + PostalAddress), `image`, `offers` (price, availability, url), `performer`, `eventStatus`, `eventAttendanceMode`. Wired through prerender so Google sees it on first paint.
- **Product schema** on `/shop/:slug` and `/pets`: `Product` with `name`, `image`, `description`, `brand`, `sku`, `offers` (price, currency, availability, url). Add `AggregateRating` only if real ratings exist.
- **VideoObject** on `/videos` items + embeds: `name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl`/`embedUrl`, `duration`.
- **BreadcrumbList** on every non-home page (already have visual breadcrumbs — just add JSON-LD).
- **FAQPage** on `/about`, `/for-venues`, `/for-artists`, `/bengaluru-underground-dance-music` (3–6 real Q&As each).
- **Organization + LocalBusiness** on `/` with `address` (Bengaluru), `sameAs` (IG, YT, Spotify), `logo`. Adds knowledge-panel eligibility.
- **WebSite + SearchAction** sitelinks-search-box on `/`.

## 2. Prerender + Indexability hardening

- Extend `scripts/prerender-plugin.mjs` to also prerender event detail and product detail routes (read from Supabase at build time via service role, or from a static JSON snapshot the build pulls).
- Inject the new schema (Event/Product/Video/FAQ/Breadcrumb) into prerendered HTML, not just client-side `<Helmet>`, so crawlers see it without JS.
- Add `<meta name="robots" content="noindex">` to `/admin`, `/embed/*`, `/cat-studio` (or keep cat-studio indexable but add canonical).
- Add `og-image.jpg` (1200×630) per major route — currently one global image. Generate per-page OG images for blog posts at build time using `@vercel/og`-style canvas (or a static template per category).

## 3. Performance (Core Web Vitals — direct ranking factor)

- Convert all hero/cover PNG/JPG in `/public` to **WebP + AVIF** with `<picture>` fallbacks. Add `width`/`height` on every `<img>` to kill CLS.
- Lazy-load below-the-fold images (`loading="lazy"` + `decoding="async"`).
- Preload the LCP image on `/` and `/blog/:slug` via `<link rel="preload" as="image">` injected by prerenderer.
- Audit Vite bundle: code-split heavy routes (CatStudio, Admin) with `React.lazy` if not already.
- Add `<link rel="preconnect">` for Supabase, YouTube, Shopify CDN.
- Self-host the display font (or `font-display: swap` + `preload`) to fix FOIT on the chunky display headings.

## 4. Content depth & internal linking (long-term ranking)

- Add a **related posts** block (3 cards) at the end of each `BlogPost` based on shared category/tag. Internal links = crawl + topical authority.
- Add a **"More episodes" / "Past episodes"** rail on event detail pages linking to other events.
- Add contextual links from blog posts → `/events`, `/shop`, `/bengaluru-underground-dance-music`. Use real anchor text, not "click here".
- Add a **city/scene hub page** structure: `/bengaluru-underground-dance-music` already exists — link to it from every blog post footer + nav. Add sibling guides as stubs (`/bengaluru-house-music`, `/bengaluru-techno-nights`) only if there's real content; otherwise skip (thin pages hurt).
- Add author pages (`/authors/:slug`) with bio, photo, social — feeds E-E-A-T and unlocks `Person` schema on articles.

## 5. Feeds & discovery

- Auto-generate `rss.xml` from posts at build time (currently static). Real RSS = picked up by aggregators + AI training crawlers.
- Add `Sitemap:` line for an **image sitemap** (`sitemap-images.xml`) — useful for Image Search traffic on event flyers and product shots.
- Add `news.xml` only if posting frequently enough (skip for now).
- `llms.txt` / `llms-full.txt` already present — regenerate at build with current posts so AI search (ChatGPT, Perplexity) cites accurate content.

## 6. On-page hygiene

- One `<h1>` per page, audit current pages (some have multiple display headings styled as h1).
- Descriptive `alt` on every `<img>` (currently many are decorative-only).
- Canonical tags: confirm all 4 custom domains (`catscan.dance`, `www.catscan.dance`, `www.catscandance.com`) 301-redirect to `catscandance.com`. If not server-side, add `<link rel="canonical">` pointing to apex on every page (already in prerender — verify).
- `hreflang`: already `en-IN` + `x-default` — good.
- Add `<meta name="geo.region" content="IN-KA">` and `<meta name="geo.placename" content="Bengaluru">` for local signals.

## 7. Crawl budget & monitoring

- Update `robots.txt`: keep AI bots allowed, add `Crawl-delay` only if server load is an issue (don't otherwise).
- Add a build step that pings Google + Bing sitemap endpoints on deploy (`https://www.google.com/ping?sitemap=...`).
- Add `SeoVerification` component already exists — confirm GSC + Bing Webmaster verification meta tags are populated from `brand.json`.

## What I'll implement (ordered by ROI)

1. Event + Product + Breadcrumb + Organization/LocalBusiness JSON-LD (prerendered).
2. Per-route OG images for blog posts + dynamic RSS regen.
3. Image conversion to WebP + width/height + lazy-loading + LCP preload.
4. Related posts block + author pages + internal-link audit.
5. FAQ schema on key landing pages with real Q&As.
6. Prerender event/product detail pages from Supabase data.
7. Geo meta + canonical sweep + h1 audit.
8. RSS regen + image sitemap + sitemap ping on deploy.

Approve and I'll start at #1 and work down. Anything to drop or reorder?