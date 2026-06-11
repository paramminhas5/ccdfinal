## CCD × Social — compact pass + dark nav + timeline rework

### 1. Nav: dark from the start on this page
- Pass `forceScrolledStyle` to `<Nav forceScrolledStyle />` in `src/pages/CcdxSocial.tsx` so the cream/ink chunk nav shows immediately instead of `bg-transparent`. No `Nav.tsx` changes.

### 2. Upload the two new posters
- `lovable-assets create` from `/mnt/user-uploads/ccdpostermumbai2.jpeg` → `src/assets/ccdxsocial-mum-poster.jpg.asset.json`
- `lovable-assets create` from `/mnt/user-uploads/ccdposterHyderabad.jpeg` → `src/assets/ccdxsocial-hyd-poster.jpg.asset.json`
- Attach to STOPS[1] (Mumbai) and STOPS[2] (Hyderabad); Delhi finale stays poster-less ("coming soon" placeholder tile).

### 3. Hero — shrink to ~3/4 viewport on desktop, more compact overall
- Section height capped: `md:min-h-[75vh] md:max-h-[80vh]`, reduced padding (`pt-20 md:pt-24 pb-10 md:pb-12`).
- Headline scaled down: `text-5xl sm:text-6xl md:text-7xl lg:text-8xl` (was up to `10rem`), tighter max-width.
- Hero art layer constrained to a right-side panel on desktop (`md:left-1/2`) instead of full bleed, so left column reads cleaner and overall block is smaller.
- Countdown + CTAs: smaller paddings (`px-5 py-3`, countdown digits `text-2xl md:text-3xl`), chips become a single line.
- Intro paragraph trimmed to one tight sentence.

### 4. Global compaction
- Section vertical padding: `py-20 md:py-28` → `py-12 md:py-16` across HOW IT WORKS, ON THE DECKS, THE TOUR, JUST PULL UP, FOR BRANDS.
- H2s: `text-5xl md:text-7xl` → `text-4xl md:text-5xl`.
- "JUST PULL UP" headline: `text-6xl md:text-8xl` → `text-4xl md:text-6xl`, CTAs `text-base md:text-lg` and `px-6 py-3`.
- EXPECT cards: tighter padding (`p-5`), smaller emoji (`text-4xl`), heading `text-xl md:text-2xl`.
- Artist marquee tiles: `text-3xl md:text-5xl` → `text-2xl md:text-3xl`, smaller borders/padding.

### 5. Tour section → vertical city-to-city timeline
Replace the 2-col grid with a single-column vertical timeline so it reads as a journey across cities:

```text
   ●━━ 01  BANGALORE   ── Social Indiranagar · 28 Jun
   │      [poster]   description · lineup · RSVP
   ●━━ 02  MUMBAI      ── Antisocial Khar · last Sun Jul
   │      [poster]
   ●━━ 03  HYDERABAD   ── Social Hyderabad · last Sun Aug
   │      [poster]
   ★━━ 04  DELHI NCR   ── Grand finale · Oct
          [coming soon tile]
```

- Vertical rail: a `bg-cream/30` 4px line on the left, numbered nodes (01/02/03/★) anchored to it.
- Each stop is a horizontal row: left = node + city + venue + date, right = poster (or finale placeholder). On mobile they stack.
- Sequential `whileInView` fade/slide so cities reveal one after another as the user scrolls.
- "YOU ARE HERE · NEXT UP" pill stays on Bangalore; "GRAND FINALE" pill stays on Delhi.
- Posters use `aspect-[3/4]` thumbnails (~max-w-sm) so they don't dominate.

### 6. ScrollCats — pulled in
- Reduce sizes (`w-16`–`w-20`) and lower opacity (`opacity-60`) so they read as accents on the now-tighter layout.

### Files
- edit: `src/pages/CcdxSocial.tsx`
- new: `src/assets/ccdxsocial-mum-poster.jpg.asset.json`, `src/assets/ccdxsocial-hyd-poster.jpg.asset.json`

### Out of scope
Nav component internals, copy rewrites beyond trimming, sponsor page, events page, ticketing.
