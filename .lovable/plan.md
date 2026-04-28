## Why Google still shows the Lovable image

Two real causes — both fixable:

1. **`public/og-image.png` is the wrong shape.** The live file is **734 × 1426 (portrait, ~370 KB)**. Facebook, Twitter, LinkedIn, and Google's rich-result image previews require **landscape ~1200 × 630**. When the image fails their ratio/size checks, scrapers fall back to whatever else they can find — for an old crawl that's often the cached Lovable preview thumbnail. Until this file is replaced **and re-scraped**, every share will look broken.
2. **No image dimension hints.** `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt`, and `og:image:secure_url` are missing, so crawlers have to download and probe the file before deciding whether to use it. Many give up.

A third, smaller cause: every internal page falls back to the same `/og-image.png` because per-page OG images aren't passed in.

## Plan

### 1. Generate a new, on-brand 1200×630 OG image

Build `public/og-image.png` (and a `og-image.jpg` fallback) at exactly **1200 × 630**, under 300 KB, using the brand palette and the CCD logo:

- Background: brand magenta (`#ff2bd6`) with the grain texture used elsewhere.
- Big display lockup: **"CATS CAN DANCE"** in the site's display font.
- Sub-line: **"Bangalore underground · parties · drops · culture"**.
- CCD logo top-left, URL `catscandance.com` bottom-right.
- Heavy black ink border + chunk-shadow to match the site's brutalist look.

Also generate:
- `public/og-image-square.png` (1080 × 1080) for WhatsApp/iMessage rich previews.
- `public/apple-touch-icon.png` (180 × 180) from the CCD logo on a magenta tile.
- `public/icon-192.png`, `public/icon-512.png` (PWA / Android home-screen).
- `public/favicon.svg` (vector, dark-mode aware) + keep `favicon.ico` as legacy.

### 2. Harden `index.html` head

- Replace title with a cleaner, shareable line: **"Cats Can Dance — Bangalore Underground · Parties, Drops, Culture"**.
- Tighten the meta description to ~155 chars (drop the keyword-stuffing — Google ignores `meta keywords` and the long list looks spammy in SERP previews).
- Add the full OG image set:
  ```
  og:image, og:image:secure_url, og:image:type=image/png,
  og:image:width=1200, og:image:height=630,
  og:image:alt="Cats Can Dance — Bangalore underground crew"
  ```
- Add `twitter:image:alt`.
- Add `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<link rel="mask-icon">`, `<link rel="manifest" href="/site.webmanifest">`.
- Add a second `<meta name="theme-color">` with `media="(prefers-color-scheme: dark)"` for nicer mobile browser chrome.
- Drop the noisy `<meta name="keywords">` block (zero SEO value, hurts perceived quality).

### 3. Add `public/site.webmanifest`

Minimal PWA manifest so iOS/Android show the brand icon when shared/added to home screen. Name, short_name, icons (192, 512), theme_color, background_color, display=standalone.

### 4. Upgrade `src/components/SEO.tsx`

- Emit the same expanded OG image meta tags (width/height/type/alt/secure_url) on every page.
- Add `og:image:alt` and `twitter:image:alt` from a new optional `imageAlt` prop (falls back to the title).
- Default `theme-color` switched to brand magenta to match `index.html`.
- Add `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">` so Google is allowed to use the large preview image in SERPs.

### 5. Per-page OG images (where it matters most)

Pass page-specific `image` props (referencing existing posters/product shots) on the highest-traffic routes — the analytics show these are the ones being shared:

- `/` (homepage) — new master OG.
- `/about` — magenta/cream variant with team line.
- `/shop` — product hero composite.
- `/events` and `/events/episode-1` — use the existing episode poster.
- `/for-venues`, `/for-artists`, `/for-investors` — reuse master OG (acceptable).
- Blog posts — already have cover images; ensure they are passed as OG.

(Pages without a custom image still get the new master OG via the default — no regression.)

### 6. Re-trigger crawler caches after deploy

Once shipped, the user needs to re-scrape the cache (otherwise the old Lovable thumbnail sticks for days/weeks). I will document the one-click links in chat after deploy:
- Facebook/WhatsApp Sharing Debugger → "Scrape Again"
- LinkedIn Post Inspector
- Twitter/X Card Validator
- Google Search Console → URL Inspection → "Request Indexing" for `/`

### Files to change

- `index.html` — head overhaul
- `src/components/SEO.tsx` — expanded meta tags + robots
- `public/og-image.png` (regenerated, 1200×630)
- `public/og-image-square.png` (new)
- `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/favicon.svg` (new)
- `public/site.webmanifest` (new)
- `src/pages/{Index,About,Shop,Events,EventDetail,Pets,Press,Media,ForVenues,ForArtists,ForInvestors}.tsx` — pass `image` / `imageAlt` props where useful

### Out of scope

- Custom OG images per blog post (existing covers are reused automatically).
- Schema additions beyond what's already present (Organization, LocalBusiness, Brand, WebSite are solid).
- DNS / domain-level changes.
