## Plan: CCD × Social refresh

### 1. Hero — integrate the new art
- Upload `DJ_CAT_CCD2.png` via `lovable-assets` → `src/assets/ccdxsocial-hero.png.asset.json`.
- Delete old `src/assets/cat-social-hero.png` (no longer needed).
- Rebuild hero as one composed unit: art bleeds into the hero block (no separate framed image card). Big "CATS CAN DANCE × SOCIAL" wordmark layered over/beside the artwork, countdown chip + RSVP CTA anchored bottom-left. Art uses `object-cover` inside the hero, with brutalist border + subtle parallax on scroll.

### 2. Artists section (replaces the abstract "MUSIC" paragraph)
New "ON THE DECKS" strip with a marquee/auto-scrolling row of artist name tiles:
**Sartdawg · Merman · Djazz · Hedz · Kamari · Vishnu · Tansane · + more**
Short line: "Resident & guest selectors across the tour. Lineups announced city by city."
Remove the "Sartdawg b2b Merman every city" claim from tour cards — replace per-city "Music" line with "Lineup TBA" or a 1–2 artist hint where known.

### 3. "HOW TO JOIN" → "JUST PULL UP"
Kill the 3-step strip. Replace with a single bold panel:
- Headline: "NO STEPS. NO LISTS. JUST PULL UP."
- Sub: "RSVP free, show up Sunday, stay for the floor. Life's good."
- One big CTA button → `/events` ("RSVP FREE →"), secondary "BRING THE PACK" share link.

### 4. Sponsor strip — punchier + correct link
- Rewrite copy: tighter, benefit-led ("4 cities. 4 Sundays. One audience that actually shows up. Put your brand in the room.").
- Primary button "BECOME A PARTNER →" routes to `/ccdxsocial/sponsor` (the existing sponsor page), not mailto.
- Secondary "EMAIL US" stays as mailto.

### 5. Animations + scroll cats
- Add framer-motion fade/slide-in on every section heading and card (stagger on tour cards).
- Add 3–4 small floating cat silhouettes (reusing existing `cat-dancer` / paw assets) absolutely-positioned in the page margins, animated with parallax via `useScroll` + `useTransform` so they drift up/rotate as the user scrolls (pointer-events-none, hidden on mobile to keep layout clean).
- Subtle hero parallax on the new artwork.

### Files touched
- `src/pages/CcdxSocial.tsx` (main rewrite of hero, artists, join, sponsor sections + motion)
- `src/assets/ccdxsocial-hero.png.asset.json` (new, from upload)
- Remove `src/assets/cat-social-hero.png`

### Out of scope
Nav, sponsor page content, events page, ticketing backend.
