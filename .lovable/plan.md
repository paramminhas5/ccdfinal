

# Hide bleed-through, moonwalk cat, multi-platform playlists, SEO/GEO ready

## 1. Hide section behind the Spotify embed
On the Playlist section, the magenta band and the spinning vinyl are visible around/behind the iframe at certain breakpoints (the iframe has a transparent/dark surround). Fix:
- Wrap the iframe in a solid `bg-ink` (or `bg-[#121212]` to match Spotify's dark theme) container so nothing bleeds through the embed's rounded edges.
- Add `isolation-isolate` and bump z-index on the iframe wrapper so the vinyl image cannot peek through.
- Constrain the vinyl with `max-w-[40vw]` so it never overlaps the embed on tablet widths.

## 2. Moonwalking brand cat on scroll
Add a small dancing cat that moonwalks (slides backward while wiggling) across the screen as the user scrolls.
- New component `src/components/MoonwalkCat.tsx`: fixed-position cat sprite (reuse `cat-headphones.png` or `cat-dancer.svg`) anchored bottom-left of viewport.
- Use Framer Motion `useScroll` + `useTransform`: as `scrollYProgress` 0→1, translate X from `-10vw` → `110vw` (left to right across the bottom), but flip the sprite horizontally (`scaleX: -1`) so it faces left while moving right = moonwalk illusion.
- Add a continuous subtle `y` bob (`animate={{ y: [0, -6, 0] }}`) and a slight `rotate` wiggle.
- Respect `useReducedMotion` (static, hidden).
- Mobile: smaller (`w-12`), desktop `w-20`.
- Mount in `src/pages/Index.tsx` only (not on subpages, to stay subtle).

## 3. Multi-platform playlists (Spotify + YouTube + SoundCloud)
Currently the data model only stores `spotify_id`. Generalize:
- Extend the `playlists` jsonb shape to `{ id, title, platform: 'spotify'|'youtube'|'soundcloud', url, embed_id }`. Migration: backfill existing rows with `platform='spotify'`, copy `spotify_id` → `embed_id`, build `url` from it.
- Update the admin "Add playlist" form: a platform dropdown (Spotify / YouTube / SoundCloud) + a single URL field. The edge function / client extracts the right ID:
  - Spotify: `/playlist/([a-zA-Z0-9]+)/`
  - YouTube: `[?&]list=([a-zA-Z0-9_-]+)` (also accept full playlist or video URLs)
  - SoundCloud: store the full URL (SoundCloud embed uses the URL directly via their oEmbed widget endpoint `https://w.soundcloud.com/player/?url=...`)
- Update `src/components/Playlist.tsx` to render the right iframe per platform:
  - Spotify: `https://open.spotify.com/embed/playlist/{embed_id}`
  - YouTube: `https://www.youtube.com/embed/videoseries?list={embed_id}`
  - SoundCloud: `https://w.soundcloud.com/player/?url={encoded url}&color=%23ff5500&auto_play=false&hide_related=true&visual=true`
- Selector chips show a small platform glyph next to each title.
- "Open in …" link adapts to the active platform.

## 4. SEO + GEO discoverability pass
Make the site genuinely indexable and AI-discoverable (GEO = Generative Engine Optimization).

**On-page SEO**
- Update `index.html`: more specific title (`Cats Can Dance — Dance Music, Pet Culture & Streetwear`), keywords meta, theme-color, `lang` already correct, add `<link rel="alternate" hreflang="x-default" …>`.
- Add proper OG image: switch `SEO.tsx` `OG` constant to a hosted-from-domain `https://catscandance.com/og-image.png` (1200×630). Add a simple `public/og-image.png` placeholder using the logo on magenta.
- Add per-page `SEO` calls on every route (audit: `Shop`, `ForArtists`, `ForVenues`, `ForInvestors`, `BlogPost`, `EventDetail` already have them — verify and tighten copy).
- Heading hygiene: ensure each page has exactly one `<h1>`. Current Hero uses `<h1>` ✓.

**Structured data (JSON-LD)**
- In `index.html`: keep the `Organization` block, add a `WebSite` with `SearchAction`.
- Inject per-page JSON-LD via `Helmet`:
  - Events page → `Event` schema for each event (name, startDate, location, performer).
  - Blog post → `BlogPosting` / `Article`.
  - Shop product → `Product` with offers.
  - Org → add `logo`, `sameAs` (instagram, tiktok, spotify artist URL when available), `contactPoint`.

**GEO / AI-engine readiness**
- Add `public/llms.txt` (the proposed convention — short, plain-text site map + brand summary) so LLMs that crawl have a curated entry.
- Add `public/humans.txt` and a tightened `public/robots.txt` (allow all, point to sitemap).
- Expand `public/sitemap.xml` to include all routes and add `<lastmod>` + `<changefreq>`.
- Add a `<Sitelinks>`-friendly nav structure (semantic `<nav aria-label="Primary">`).

**Performance / Core Web Vitals (ranking factor)**
- Preconnect to `open.spotify.com`, `i.ytimg.com`, `www.youtube.com`, `w.soundcloud.com`, `fonts.gstatic.com`.
- Add `<link rel="preload" as="image" href="/src/assets/hero-center.svg">` for LCP.
- Compress hero PNGs (server-side build optimization is already in place via Vite — no new deps).

**Accessibility (also feeds SEO)**
- Add `aria-label` to all icon-only buttons in `Nav.tsx` (verify), and `alt` text on every `<img>` (audit: many use `alt=""` for decorative — confirm DJ cat has `alt="Cats Can Dance DJ cat mascot"`).

## Technical notes
Files touched:
- `src/components/Playlist.tsx` — solid bg around iframe, multi-platform render
- `src/components/MoonwalkCat.tsx` — NEW
- `src/pages/Index.tsx` — mount `MoonwalkCat`
- `src/pages/Admin.tsx` — platform-aware playlist form
- `supabase/functions/admin-content/index.ts` — accept new playlist shape
- DB migration — backfill `playlists` jsonb to new shape
- `index.html` — title, meta, JSON-LD `WebSite`, preconnects, preload
- `src/components/SEO.tsx` — domain-hosted OG image, optional JSON-LD slot
- `src/pages/Events.tsx` + `EventDetail.tsx` — `Event` JSON-LD
- `src/pages/BlogPost.tsx` — `Article` JSON-LD
- `src/pages/Shop.tsx` + `ProductDetail.tsx` — `Product` JSON-LD
- `public/sitemap.xml` — full routes + lastmod
- `public/robots.txt` — allow all + sitemap pointer
- `public/llms.txt` — NEW (GEO)
- `public/humans.txt` — NEW
- `public/og-image.png` — NEW placeholder

No new npm dependencies. Reuses existing Helmet, Framer Motion, admin password.

