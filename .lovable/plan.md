

# Fix: cat loading, past-event covers, section dots, paw cursor, curated city scoping, episode-1 GIF fallback

## 1. Hero cats — preload together + show loading state, no layout shift

**Problem:** 9 cat assets (`hero-center.svg`, `cat-left/right.svg`, plus PNGs ~hundreds of KB each) load asynchronously and pop in one by one.

**Fix in `src/components/Hero.tsx`:**
- Add `useEffect` that preloads all 9 images in parallel via `new Image()` + `Promise.all`. Track an `imagesReady` boolean state.
- Wrap the entire cat group (`heroCenter`, `catLeft/Right`, 4 flank cats) in a single `motion.div` with `opacity: imagesReady ? 1 : 0` and `transition: opacity 0.4s`. They all fade in together once loaded.
- Headline + buttons render immediately (no blocking).
- Add a tiny centered spinner (a CSS-only spinning paw or `⚡` glyph) absolutely positioned in the hero center, visible only while `!imagesReady`. Hides on ready.
- Does NOT touch sharing (the SEO/OG tags are server-side meta — preloading is purely client visual).

## 2. Show past-event poster on the homepage `Events` card

**Problem:** Featured upcoming card has no image. Only the small "past episodes" grid shows posters.

**Fix in `src/components/Events.tsx`:**
- In the featured `motion.article`, when `featured.poster_url` exists, render the poster on the right side as a side-by-side flex (image left ~40% width on desktop, text right) using `resolvePosterUrl` (already in file). On mobile stacks vertically, image first.
- Use the same `<img>` with onError fallback to the lime "★ TITLE" placeholder.
- Keep all existing copy + buttons intact.

## 3. Section nav dots on the right (scrollspy)

**Problem:** Long page, no orientation.

**New component `src/components/SectionDots.tsx`:**
- Fixed right-edge vertical strip (`fixed right-4 top-1/2 -translate-y-1/2 z-40`), hidden on mobile (`hidden md:flex`).
- 8 dots: Home, About, Playlist, Events, Drops, Instagram, Videos, Early Access — each dot is a small button with `aria-label`, hover label tooltip on the left.
- Uses `IntersectionObserver` to watch each section id; active dot fills `bg-magenta` w/ `border-ink`, others `bg-cream/40`.
- Click a dot → `document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })`.
- Mount in `Index.tsx` after `<Nav />`.
- Section IDs to add (where missing): `home` (already on Hero), `about`, `playlist`, `events` (already), `drops`, `instagram`, `videos`, `early-access` (already). Add the missing ones via small wrapper `<div id="...">` inside each component or in `Index.tsx`.

## 4. Remove paw cursor (interferes with nav clicks)

**Fix:**
- Remove `<PawCursor />` import + usage from `src/pages/Index.tsx`.
- Delete `src/components/PawCursor.tsx`.
- Verify no other page imports it (only Index does — confirmed).

The dropdown-closes-too-early bug (mentioned by user re: "topdown closes before I can scroll down to it") is the `Dropdown` in `Nav.tsx` using both hover + outside-click handlers. The hover handlers already keep it open while pointer is inside; the closing comes from cursor moving across the `mt-2` gap to the panel. **Bridge fix in `Nav.tsx` Dropdown:** remove the `mt-2` gap (use `mt-0` + a transparent `pt-2` inside the panel) so hover doesn't break when crossing the gap. Also widen hover area by adding `pb-2` to the trigger `li`.

## 5. Curated events — broken city scoping (Skillbox returns Gurgaon)

**Confirmed:** `https://skillboxes.com/bangalore` ignores the city slug and returns nationwide events. DB has only Gurgaon/Kasol rows.

**Fixes in `supabase/functions/curate-events/index.ts`:**
- Change SOURCES to use proper city-scoped listing URLs that actually filter, and add a `cities` field per request:
  - Body now accepts `city: "bangalore" | "mumbai" | "delhi" | "pune" | "all"` (default `"bangalore"`). `"all"` runs each city in turn for the chosen source.
  - Build listing URL per city per source from a template:
    ```
    skillboxes:  https://www.skillboxes.com/city/{city}
    insider:     https://insider.in/{citySlug}/nightlife (bengaluru/mumbai/new-delhi/pune)
    highape:     https://highape.com/{city}/events
    district:    https://www.district.in/events-in-{citySlug} (bengaluru/mumbai/new-delhi/pune)
    bookmyshow:  https://in.bookmyshow.com/explore/events-{citySlug}
    sortmyscene: https://sortmyscene.com/{city}
    ```
- **Post-AI city filter (the real safety net):** after AI extraction, reject any event whose `venue` string doesn't contain the requested city name OR a known city alias (e.g. Bangalore↔Bengaluru, Delhi↔New Delhi↔NCR, Mumbai↔Bombay). This catches Skillbox's national listings.
- Save the city onto each row: add `city` column to `curated_events` (migration) so the frontend can group / filter.
- Update AI prompt: "Reject if venue is not in {requestedCity} or its metro area."
- Per-source per-city stats in response.

**Migration:** `ALTER TABLE curated_events ADD COLUMN IF NOT EXISTS city text;` + backfill existing rows from venue text where possible (or leave null).

**Admin UI in `src/pages/Admin.tsx` curated tab:**
- Add a second dropdown "City" next to the source selector (Bangalore default; All; Mumbai; Delhi; Pune).
- Send `{ source, city, mode: "single", limit: 5 }` to the function.

**Frontend `src/components/CuratedEvents.tsx`:**
- Add city-tab filter chips at the top (All / Bangalore / Mumbai / Delhi / Pune). Default Bangalore. Filters the rendered list by `city` (case-insensitive includes).

## 6. Episode 1 GIF — robust fallback to static PNG

**Confirmed:** DB has `poster_url = "/episode-1.gif"` (file doesn't exist). The 7.8MB `/episodes/episode-01.gif` is too heavy and unreliable. `episode-1-poster.png` static asset already exists.

**Fixes:**
- **`src/pages/EventDetail.tsx`** `RECAP_MEDIA` block (line 207): wrap the GIF `<img>` in a small component that:
  - First tries `/episodes/episode-01.gif`
  - On `onError`, swaps to the static import `episode-1-poster.png`
  - Adds a tiny "PLAY GIF" overlay button on the static fallback that swaps src back to the GIF on click (so users on slow connections see the static immediately, can opt into the GIF).
  - Adds `loading="eager"` + `fetchPriority="high"` so it actually starts downloading.
- **Update DB** for `episode-1.poster_url` to the static PNG via migration so home/grid stops 404-ing:
  - `UPDATE events SET poster_url = 'episode-1-poster.png' WHERE slug = 'episode-1'`
  - The `Events` grid `resolvePosterUrl` will route this through `event-posters` storage bucket — which is wrong for static assets. **Better:** set `poster_url = '/src/assets/episode-1-poster.png'` won't work either at runtime. Cleanest: upload `episode-1-poster.png` into the `event-posters` storage bucket and point `poster_url` at the bare filename, OR keep the path approach: copy the static PNG into `public/episodes/episode-01.png` and set `poster_url = '/episodes/episode-01.png'`.
  - **Chosen approach:** copy `src/assets/episode-1-poster.png` → `public/episodes/episode-01.png` (build-time public asset) and `UPDATE events SET poster_url = '/episodes/episode-01.png' WHERE slug = 'episode-1'`.
- The `Events.tsx` past-grid img already has `onError` → lime fallback, so any future broken poster will not break the layout.

## 7. Files touched

- `src/components/Hero.tsx` — preload all cats, fade-in together, spinner
- `src/components/Events.tsx` — featured card poster image (left side, side-by-side)
- `src/components/SectionDots.tsx` — NEW scroll-spy dots
- `src/pages/Index.tsx` — mount SectionDots, remove PawCursor, ensure section IDs
- `src/components/PawCursor.tsx` — DELETE
- `src/components/Nav.tsx` — Dropdown hover-gap fix (kill `mt-2` jump)
- `src/components/About.tsx`, `Playlist.tsx`, `Drops.tsx`, `Instagram.tsx`, `Videos.tsx` — add `id="..."` on root section if missing
- `src/components/CuratedEvents.tsx` — city filter chips, render `city` column
- `src/pages/Admin.tsx` — city dropdown in curated tab; pass `city` to function
- `supabase/functions/curate-events/index.ts` — multi-city listing URLs, post-AI city filter, city in upsert payload
- `supabase/migrations/*` — `ALTER TABLE curated_events ADD COLUMN city text` + `UPDATE events SET poster_url = '/episodes/episode-01.png' WHERE slug = 'episode-1'`
- `public/episodes/episode-01.png` — copy from `src/assets/episode-1-poster.png` (lightweight static fallback)
- `src/pages/EventDetail.tsx` — GIF→PNG fallback + opt-in play button

No new dependencies. No connector changes.

