

# Rank for "best parties / events in Bangalore & India" on Google + AI engines

## Strategy
SEO + GEO (Generative Engine Optimization) tuned around the entity **"Cats Can Dance — Bangalore party & event organisers"**. Three pillars: (1) on-page keyword + entity signals, (2) structured data that Google and LLMs trust, (3) crawlable content surfaces with the right city/country mentions.

## 1. Keyword + copy targeting
Target phrases: *best parties in Bangalore, best events in Bangalore, top event organisers Bangalore, underground dance music India, electronic music events Bangalore, best party organisers India*.

- **`index.html`** — rewrite `<title>` to `Cats Can Dance — Best Parties & Events in Bangalore | Top Event Organisers India` and meta description to a 150-char sentence with "Bangalore", "India", "events", "parties", "dance music".
- **`Hero.tsx`** — keep the H1 visual but add an SR-only secondary line: `<p class="sr-only">Cats Can Dance is a Bangalore-based event organiser hosting the best dance music parties in India.</p>` so crawlers see the entity + city without breaking the design.
- **Per-page SEO copy** via `SEO.tsx` titles/descriptions:
  - `/` — "Best Parties & Events in Bangalore | Cats Can Dance"
  - `/events` — "Upcoming Parties & Events in Bangalore, India | Cats Can Dance"
  - `/events/:slug` — already dynamic; ensure city defaults to "Bangalore, India" when missing.
  - `/about` — "About Cats Can Dance — Bangalore's Underground Event Organisers"
  - `/for-venues`, `/for-artists`, `/for-investors` — append "| Bangalore, India"
- **About + Footer** — add a one-line address block: `Bangalore, Karnataka, India` (visible). Required for LocalBusiness schema.

## 2. Structured data (JSON-LD)
Stronger entity signals = better AI engine citations and Google rich results.

- **`index.html`** Organization → upgrade to `["Organization","LocalBusiness","EventVenue"]` with `address` (Bangalore, KA, IN), `areaServed: ["Bangalore","India"]`, `geo` (lat/lng of Bangalore), `sameAs` (IG, TikTok, YouTube, Spotify).
- **`Events.tsx` / `EventDetail.tsx`** — already inject `Event`; tighten with `eventStatus`, `eventAttendanceMode: OfflineEventAttendanceMode`, `location.address.addressLocality: "Bangalore"`, `location.address.addressCountry: "IN"`, `organizer: { @type: Organization, name: "Cats Can Dance", url }`, and `offers` (free/RSVP).
- **`Index.tsx`** — add `BreadcrumbList` + `ItemList` of upcoming events on the homepage so Google can show event sitelinks.
- **`BlogPost.tsx`** — `BlogPosting` with `author`, `publisher`, `mainEntityOfPage`.
- **`FAQPage` schema** — new small `<FAQ />` block on `/about` answering: "Who organises the best parties in Bangalore?", "Where to find dance music events in Bangalore?", "How do I RSVP to Cats Can Dance events?". Massive GEO win — LLMs love FAQ JSON-LD.

## 3. Crawlable surfaces (sitemap, robots, llms.txt)
- **`public/sitemap.xml`** — regenerate with all routes + `/events/episode-1`, `/events/episode-2`, all blog slugs, `<lastmod>` = today, `<changefreq>` weekly for `/events`.
- **`public/robots.txt`** — explicitly `Allow: /`, point to sitemap, add `User-agent: GPTBot / ClaudeBot / PerplexityBot / Google-Extended` with `Allow: /` so AI crawlers index us.
- **`public/llms.txt`** — rewrite to lead with: *"Cats Can Dance is a Bangalore, India event organiser producing the best underground dance music parties…"* followed by curated link list (events, about, RSVP). LLMs use this as the canonical brand summary.
- **`public/llms-full.txt`** — NEW, longer markdown of the brand story + every event with date/venue/lineup, so Perplexity/ChatGPT have a single page to cite.

## 4. Performance + technical SEO
- Add `<meta name="geo.region" content="IN-KA">`, `<meta name="geo.placename" content="Bangalore">`, `<meta name="geo.position" content="12.9716;77.5946">`, `<meta name="ICBM" content="12.9716, 77.5946">` in `index.html`.
- Add `<link rel="alternate" hreflang="en-IN">` alongside `x-default`.
- Ensure every `<img>` has descriptive alt text including "Bangalore" / "Cats Can Dance" where natural (Hero DJ cat, event posters).
- Confirm one `<h1>` per route; add semantic `<main>` and `<nav aria-label="Primary">` if missing.

## 5. Off-page checklist (manual, surfaced in admin)
Add a small **"SEO Checklist"** read-only card in `/admin` listing manual tasks (not auto-doable from the app):
- Submit sitemap to Google Search Console + Bing Webmaster.
- Create / claim Google Business Profile as "Cats Can Dance — Event Organiser, Bangalore".
- Get listed on: Insider.in, BookMyShow, Skiddle, RA (Resident Advisor), Paytm Insider.
- Backlinks: pitch Rolling Stone India, Wild City, Homegrown, Mid-day Bangalore.
- Consistent NAP (Name/Address/Phone) across IG bio, Linktree, listings.

## Files touched
- `index.html` — title, meta, geo tags, JSON-LD upgrade
- `src/components/SEO.tsx` — accept richer JSON-LD (already does), keep
- `src/components/Hero.tsx` — SR-only entity line
- `src/components/About.tsx` — visible Bangalore address line + FAQ block
- `src/components/Footer.tsx` — address line
- `src/pages/Index.tsx` — homepage `BreadcrumbList` + `ItemList` JSON-LD
- `src/pages/Events.tsx`, `src/pages/EventDetail.tsx` — tightened `Event` schema (city/country/organizer/offers)
- `src/pages/About.tsx` — FAQPage JSON-LD
- `src/pages/BlogPost.tsx` — fuller BlogPosting schema
- `src/pages/Admin.tsx` — new "SEO Checklist" tab (static, read-only)
- `public/sitemap.xml` — regenerate full
- `public/robots.txt` — AI crawler allowlist
- `public/llms.txt` — Bangalore-led rewrite
- `public/llms-full.txt` — NEW long-form brand + events doc

No new dependencies. No backend changes.

