# Nav + Copy + Color Refresh

## 1. Nav — bring back "More" on desktop

In `src/components/Nav.tsx`:

- Add a new `moreLinks` array: **Videos** (`/videos`), **Playlists** (`/playlists`), **Pets** (`/pets`), **Blog** (`/blog`).
- Render a second `<Dropdown label="More" links={moreLinks} … />` on the desktop list, right after the Partners dropdown.
- Mobile menu already flattens via `mobileLinks`; extend it to include the new "More" links so mobile parity is kept (Cat Studio / Press / Media stay in the footer as agreed).

## 2. About — headline + background

`src/components/About.tsx` (homepage section) and `src/pages/About.tsx`:

- Change the homepage About headline from "A CULTURE FOR PEOPLE WHO MOVE." — keep that as the lead. Change the `/about` page hero title from "WE THROW PARTIES. WE BUILD CULTURE." to something truer to the brand:
  - New hero title: **"AT THE INTERSECTION OF MUSIC, FASHION AND PETS""**
  - Eyebrow stays `ABOUT`.
- Background swap on `/about`:
  - Hero: switch from `bg-cream` to `bg-magenta` with `text-cream` (eyebrow `text-acid-yellow`, shadow ink) — gives the page an immediate identity instead of beige-on-beige.
  - Mission section: keep `bg-cream` (good for long-form reading).
  - "What we do" strip: change from `bg-electric-blue` to `bg-ink` with cream text so the three colored pillar cards (magenta / acid-yellow / lime) pop against black instead of fighting the blue.
  - Re-check the color-rotation rule (`mem://design/color-rotation`) so no marquee neighbors share a bg — the existing `bg-acid-yellow` marquee before Team is fine because Team renders on cream.

## 3. Videos — kill the lime green

`src/components/Videos.tsx` (homepage "WATCH THE TAPES" section):

- Change section bg from `bg-lime` to `bg-ink` with `text-cream`.
- Eyebrow stays magenta. Headline becomes `text-cream` with `drop-shadow-[5px_5px_0_hsl(var(--magenta))]` so it still feels punchy.
- "ALL VIDEOS" button: switch to `bg-acid-yellow text-ink` (currently cream-on-cream-ish next to lime).
- Update fallback skeleton bg in `src/pages/Index.tsx` from `bg-lime` to `bg-ink` so the lazy fallback matches.
- Update color-rotation memory note: Videos is now ink, so adjacent marquees (`above-videos`, `above-playlist`) must not be ink — confirm defaults, adjust in Admin → MARQUEES if needed (no code change required since marquees are CMS-driven; just verify defaults in the seeded `site_settings.marquees`).

## 4. Events page — make it less generic

`src/pages/Events.tsx`:

- **Hero**: switch `bg-lime` → `bg-magenta` with `text-cream`, eyebrow `text-acid-yellow`, add chunky shadow back. New title: **"NIGHTS THAT MOVE."** with a kicker line "Underground. Loud. Ours." The current "Every drop, every floor, every city." copy moves below as supporting text.
- **Playful flourishes**:
  - Add a thin `Marquee` strip directly under the hero with items like `["DOORS OPEN LATE", "BRING YOUR PACK", "NO DRESS CODE — MOVE", "SOLD-OUT IS A LOVE LANGUAGE"]` on `bg-acid-yellow`.
  - Add a small "STATS" row above the events grid: 3 chunky tiles (events thrown, cities, dancers through the door) using existing `bg-electric-blue` / `bg-acid-yellow` / `bg-cream` brutalist cards. Numbers can be hardcoded for now (e.g. 24 / 3 / 6,000+).
  - Replace the plain alternating cream/magenta event cards with a rotating palette: cycle `bg-magenta`, `bg-electric-blue`, `bg-acid-yellow` (text-ink for yellow, text-cream for the others) by index for upcoming events; past events stay muted on cream.
  - Add a small rotated sticker ("LATE NIGHT ✦") absolutely positioned on each upcoming card for personality.
- **Closing strip** before `CuratedEvents`: a `bg-ink text-cream` band with "WANT TO HOST ONE? →" linking to `/for-venues`.
- Keep `CuratedEvents` as-is (already a different vibe).

## 5. Color rhythm sanity pass

After the changes, walk the page stacks and confirm no two adjacent sections share a `bg-*`:

- Homepage: Hero(ink) → marquee → About(cream) → marquee → Events(cream) → marquee → Videos(**ink**) → marquee(must not be ink) → Playlist(magenta) → … (existing).
- About page: Hero(**magenta**) → Mission(cream) → What(**ink**) → marquee(acid-yellow) → Team(cream).
- Events page: Hero(**magenta**) → marquee(acid-yellow) → Stats strip(cream) → events grid(cream container, varied cards) → host-strip(ink) → CuratedEvents.

## Technical notes

- All color tokens referenced (`bg-magenta`, `bg-ink`, `bg-acid-yellow`, `bg-electric-blue`, `bg-lime`, `bg-cream`, `text-ink`, `text-cream`) already exist in `tailwind.config.ts` / `src/index.css`.
- No DB migrations needed. Marquee defaults can be tweaked through the existing Admin → MARQUEES UI; we will only update the seed defaults in `site_settings.marquees` if a neighbor color clash is found after the Videos recolor.
- Files touched: `src/components/Nav.tsx`, `src/components/About.tsx`, `src/pages/About.tsx`, `src/components/Videos.tsx`, `src/pages/Index.tsx`, `src/pages/Events.tsx`, and `mem://design/color-rotation` (memory update only).
- No new dependencies, no edge function changes.