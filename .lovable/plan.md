

# SEO + GEO round 2: pre-rendering, content depth, internal links, images

The current setup has the basics (meta, JSON-LD, sitemap, llms.txt). The biggest remaining gaps are: **(1) the site is a SPA so Google sees an empty `<div id="root">` for many crawls, (2) thin content on key pages, (3) no real backlink/local-content surface, (4) no per-page social images, (5) no analytics to measure rankings**. Here's what to do next, ordered by ranking impact.

## 1. Fix the SPA crawl problem (biggest single win)
Right now Googlebot has to render JS to see anything. AI crawlers (GPTBot, PerplexityBot, ClaudeBot) mostly do **not** render JS — they see a blank page. Fix:

- **Add `react-snap` or `vite-plugin-prerender`** to pre-render every static route at build time into real HTML files (`/about/index.html`, `/events/index.html`, `/for-venues/index.html`, etc.). Each file ships with the actual H1/copy/JSON-LD already in the markup.
- Routes to pre-render: `/`, `/about`, `/events`, `/events/episode-1`, `/events/episode-2`, `/shop`, `/for-venues`, `/for-artists`, `/for-investors`, `/blog/inside-episode-01`.
- Result: AI engines and Google get fully-rendered HTML on first byte. Massive lift for both rankings and AI citations.

## 2. Add a real `/blog` index + 4-6 pillar articles
Blog content is the #1 way to rank for long-tail "best X in Bangalore" queries. Create:

- `/blog` index page listing all posts (currently only `/blog/inside-episode-01` exists, no index).
- 6 new pillar posts (markdown in `src/content/posts.ts`):
  1. "The Best Underground Parties in Bangalore (2026 Guide)"
  2. "Where to Find Electronic Music Events in Bangalore"
  3. "Top 10 Event Organisers in India for Dance Music"
  4. "RSVP Culture: How Bangalore's Party Scene Works"
  5. "A Guide to Techno & House Nights in Bangalore"
  6. "Behind the Decks: Bangalore's Rising DJs"
- Each post: 800-1200 words, internal links to `/events`, `/about`, other posts. `BlogPosting` JSON-LD already exists.
- Add each new slug to `sitemap.xml` and `llms-full.txt`.

## 3. Per-page Open Graph images (social CTR → indirect ranking)
Today every page shares one OG image. Generate route-specific OGs at `/public/og/`:
- `/og/events.png`, `/og/about.png`, `/og/shop.png`, `/og/for-venues.png`, etc.
- Each is 1200×630, branded magenta, with the page's H1 baked in. Boosts share CTR on WhatsApp/Twitter/LinkedIn → more clicks → ranking signal.
- Pass via `<SEO image="/og/events.png" />` (already supported).

## 4. Internal linking + breadcrumbs
- Add a visible breadcrumb component (`Home › Events › Episode 1`) to every non-home page. Wrap with `BreadcrumbList` JSON-LD per page (currently only homepage has it).
- Add a "Related events" / "Read next" block at the bottom of each event and blog post linking to 3 related URLs. Internal link depth is a known ranking signal.
- Footer: add a sitemap-style link block (Events / Shop / About / For Artists / For Venues / For Investors / Blog).

## 5. Image SEO
- Audit every `<img>` for descriptive `alt` text including target keywords ("Cats Can Dance party in Bangalore", "Episode 1 dance music event Bangalore"). Currently many are `alt=""`.
- Add `loading="lazy"` to below-fold images, `loading="eager" fetchpriority="high"` to hero LCP image.
- Generate `srcset` for hero / event posters via Vite's `?w=400;800;1200` import suffix to cut LCP on mobile.

## 6. Performance signals (Core Web Vitals)
- Add `<link rel="preload" as="image" href="/src/assets/cat-dj-hero.svg">` for hero LCP.
- Self-host the Google fonts already in use (`@fontsource/*`) and drop the `gstatic` preconnect — eliminates a render-blocking round trip.
- Add `Cache-Control: public, max-age=31536000, immutable` headers via `_headers` file (Lovable static host) for `/assets/*`.

## 7. Analytics + Search Console wiring
You can't rank what you don't measure. Add:
- **Google Search Console verification** via a `<meta name="google-site-verification">` field in `index.html` (admin can paste the token in the new SEO Checklist tab and it surfaces in head).
- **Bing Webmaster** verification meta the same way.
- **Plausible or Google Analytics 4** (lightweight, privacy-friendly Plausible recommended) to track which queries land where.
- New `site_settings.seo_verifications` jsonb (`{google, bing, plausible_domain}`) editable from admin.

## 8. Local citations + entity reinforcement (in-app helpers)
- Expand the admin "SEO Checklist" with **clickable submission links** (Google Business Profile create URL, Bing Places, Insider.in submit form, Skiddle promoter signup, RA promoter signup, Wild City contact).
- Add a "NAP card" on `/about` (Name / Address / "Contact via Instagram") that exactly mirrors what gets submitted to directories — consistency matters for local SEO.
- Add an **Events archive page** `/events/past` listing previous episodes with photos + lineup (currently nothing past episode-2). Old event pages are a huge source of "best parties Bangalore [year]" rankings.

## 9. Schema additions
- `ItemList` of upcoming events on the `/events` page (Google can pull this into a carousel).
- `MusicEvent` instead of generic `Event` for episodes (more specific = better rich result eligibility).
- `VideoObject` JSON-LD on the Videos section pulling from the existing YouTube data.
- `Review` / `AggregateRating` on `/about` if/when testimonials are added (admin form).

## 10. AI engine optimisation extras
- Rewrite `llms.txt` to follow the **exact spec** at llmstxt.org (H1 brand name, blockquote summary, sectioned link lists). Current file is close but not strictly compliant.
- Add `/api/brand.json` (a static JSON file in `public/`) with brand name, tagline, locations, upcoming events, FAQ — a single endpoint Perplexity/ChatGPT plugins can ingest cleanly.

## Files touched
- `vite.config.ts` + new `package.json` dep `vite-plugin-prerender` — pre-rendering
- `src/content/posts.ts` — 6 new pillar articles
- `src/pages/Blog.tsx` — NEW blog index
- `src/components/Breadcrumbs.tsx` — NEW reusable breadcrumb (visible + JSON-LD)
- `src/components/Footer.tsx` — sitemap link block
- `public/og/*.png` — NEW per-route social images
- `public/_headers` — NEW cache headers
- `public/llms.txt` — strict-spec rewrite
- `public/brand.json` — NEW
- `public/sitemap.xml` — add new blog + past events URLs
- `index.html` — verification meta slots, font self-host, hero preload
- `src/pages/Admin.tsx` — SEO Checklist v2 (verification token inputs, submission links)
- DB migration — `site_settings.seo_verifications` jsonb
- `src/pages/Events.tsx` + new `/events/past` route — `MusicEvent` + `ItemList` schema
- All page components — alt-text audit, internal-link blocks

No design/visual changes. No backend behaviour changes beyond storing verification tokens.

