# Compact, contextual, and clearer — site-wide pass

A coordinated pass to reduce visual weight, fix specific issues, and tighten the storytelling flow across pages.

---

## 1. Contextual marquees (not one generic ticker)

Today `Marquee.tsx` has a single shared word list (`DANCE MUSIC / PET CULTURE / STREETWEAR / EXPERIENCES / DROPS / COMMUNITY`) used between every section.

Change: accept an `items?: string[]` prop and place a marquee tuned to the section that follows (or precedes) it.

Examples:
- Before **About**: `WHO WE ARE · BANGALORE · UNDERGROUND · A CULTURE BRAND ·`
- Before **Events**: `EPISODE 01 · EPISODE 02 · CATCH US LIVE · BANGALORE · RSVP NOW ·`
- Before **Videos**: `WATCH THE TAPES · LIVE SETS · RECAPS · YOUTUBE ·`
- Before **Playlist**: `NOW SPINNING · DANCE MUSIC · LATE NIGHT · WAREHOUSE ·`
- Before **Drops**: `STREETWEAR · LIMITED · MERCH · PET DROPS ·`
- Before **Instagram**: `@CATSCANDANCE · LATEST · BTS ·`
- Before **EarlyAccess**: `JOIN THE PACK · EARLY ACCESS · DON'T MISS A DROP ·`

Default (no prop) keeps the existing list so other pages don't break.

## 2. Compact everything — less scroll on every screen

Reduce vertical rhythm and headline scale across home + page sections (mobile and desktop):

- Section padding: `py-24 md:py-32` → `py-12 md:py-20`. Apply in `Hero` button band, `What`, `Why`, `Team`, `Videos`, `Playlist`, `Drops`, `Instagram`, `EarlyAccess`, `Events`, `WhyNow`.
- Hero headline: `text-[18vw] md:text-[14vw]` → `text-[15vw] md:text-[11vw]`; adjust DJ cat sizing so it doesn't swallow the screen.
- Section H2s: `text-6xl md:text-8xl` → `text-4xl md:text-6xl`. Eyebrow `text-2xl md:text-3xl` → `text-lg md:text-xl`.
- Marquee: `py-3 md:py-5` → `py-2 md:py-3`; large variant smaller too.
- Card grids: tighten `gap-6 mt-16` → `gap-4 mt-8`.
- Lazy `SectionFallback` height: `min-h-[400px]` → `min-h-[220px]`.

Net effect: significantly less scrolling, tighter pacing, same content.

## 3. Disco ball — center + drop lower on mobile

In `Hero.tsx`, the wrapper that scales `DiscoBall` with `scale-75 md:scale-100 origin-top` doesn't reposition. The ball's own container is `top-0 left-1/2 -translate-x-1/2`.

Change: pass a `mobileOffsetY` to `DiscoBall` (or wrap with `top-[12vh] md:top-0` and ensure `left: 50%` centering wins on mobile). Result: on phones the rod + ball start ~12vh down and stay center-aligned, not clipped under the fixed nav.

## 4. Three Worlds — better visual story

Currently `Why.tsx` shows two stacked headline lines and a left-side paragraph mentioning the three worlds inline — visually flat for the most important idea.

New layout (still in `Why.tsx`, electric-blue bg):
- Eyebrow `/ WHY` + tighter headline `THREE WORLDS. ONE ECOSYSTEM.`
- A 3-tile row (stack on mobile) — each tile is a chunky card with an emoji/SVG, color, and one line:
  - **DANCE MUSIC** — magenta, vinyl glyph, "Nights people remember."
  - **PET CULTURE** — acid-yellow, paw glyph, "The internet's favorite obsession."
  - **STREETWEAR** — cream, shirt glyph, "Pieces you actually wear."
- Below: a single ink "ecosystem" strip that visually fuses them — three colored dots merging into a magenta star with the line "ONE AUDIENCE · URBAN · GEN Z & MILLENNIAL".
- The 4-bullet list (`bullets`) becomes a compact 2x2 chip grid below, not a tall column.

This makes "three worlds → one ecosystem" the literal visual.

## 5. Team / Co-founders

Replace the four-generic-roles grid in `Team.tsx` with two co-founder cards + a "join the pack" CTA grid:

Co-founders (2-up, larger cards):
- **Param Minhas** — Co-founder
- **Satwik Harisenany** — Co-founder

(Roles/short bios left as TBD placeholders the user can fill in.)

Below — "WE'RE HIRING THE PACK" 4-up smaller cards, each a CTA mailto:
- Music & Curation
- Brand & Design
- Community & Ops
- Content & Video

Each card: role title, one-line description, "APPLY →" link to `mailto:hello@catscandance.com?subject=Join%20the%20Pack%20—%20{Role}`.

## 6. Playlist + Videos get their own pages

Both currently live only as home sections. Add real routes:

- **`/playlists`** (new page `src/pages/Playlists.tsx`) — `Nav` + `PageHero` ("THE PLAYLISTS — what we play, on rotation") + the existing `Playlist` component (already lists multiple playlists with platform tabs) + `Footer`.
- **`/videos`** (new page `src/pages/Videos.tsx`) — `Nav` + `PageHero` ("THE TAPES — sets, recaps, and behind the scenes") + the existing `Videos` component + `Footer`.

Wire up in `App.tsx` routes.

Update the home sections so their headings link to the dedicated pages:
- `Playlist` H2 wraps in `<Link to="/playlists">`; add a "See all playlists →" link.
- `Videos` H2 wraps in `<Link to="/videos">`; "Visit the channel" stays, plus "All videos →" to `/videos`.

Update `Nav.tsx` `moreLinks`: `/#playlist` → `/playlists`, and add `{ to: "/videos", label: "Videos" }` (or replace the implicit Watch link). This also fixes Playlists missing in mobile dropdown.

## 7. Site-wide narrative & flow improvements

A consistent storytelling spine, applied with small copy + ordering tweaks:

**Home (`Index.tsx`) order — already partially done. Final spine:**
1. Hero — identity + CTA
2. About — one-line "what is this"
3. Events — "catch us live" (proof of activity)
4. Videos — "watch the tapes" (proof it's real)
5. Playlist — "this is the sound"
6. Drops — "wear the culture"
7. Instagram — "the daily feed"
8. Early Access — convert

**About page (`About.tsx`) — clearer arc:**
1. `What` (the brand, four engines)
2. `Why` (three worlds → one ecosystem) — now visually upgraded
3. `WhyNow` (the timing)
4. `Team` (the people + join us)
5. `Footer`

(Move `WhyNow` before `Team` so the page ends on "people" — humans last is a stronger close.)

**Partners pages (`/for-venues`, `/for-artists`, `/for-investors`):** add a small consistent footer-CTA row "Talk to us → hello@catscandance.com" so each partner page closes with one action, matching home's Early Access close.

**Shop, Pets, Blog, Press, Media:** add a thin breadcrumb-style eyebrow under the page hero (`HOME / SHOP`) so users always know where they are — the `Breadcrumbs` component already exists; just include it on these pages.

## 8. Files to touch

- `src/components/Marquee.tsx` — accept `items` prop
- `src/pages/Index.tsx` — pass per-section marquee items, smaller fallback heights
- `src/pages/About.tsx` — reorder (`Team` last, `WhyNow` before it)
- `src/components/Hero.tsx` — compact paddings/headline; disco ball wrapper offset
- `src/components/DiscoBall.tsx` — accept `mobileOffsetY` (or use Tailwind responsive top)
- `src/components/Why.tsx` — new 3-tile + ecosystem strip layout
- `src/components/Team.tsx` — co-founders + hiring CTAs
- `src/components/What.tsx`, `WhyNow.tsx`, `Events.tsx`, `Videos.tsx`, `Playlist.tsx`, `Drops.tsx`, `Instagram.tsx`, `EarlyAccess.tsx` — compact spacing/typography pass
- `src/components/Playlist.tsx`, `src/components/Videos.tsx` — link headings to new pages
- `src/components/Nav.tsx` — `/playlists` + `/videos` in More dropdown
- `src/pages/Playlists.tsx` (new), `src/pages/Videos.tsx` (new)
- `src/App.tsx` — register `/playlists` and `/videos` routes
- `src/pages/ForVenues.tsx`, `ForArtists.tsx`, `ForInvestors.tsx` — closing CTA row
- `src/pages/Shop.tsx`, `Pets.tsx`, `Blog.tsx`, `Press.tsx`, `Media.tsx` — add `Breadcrumbs`

No new dependencies, no DB or edge function changes. After deploy: tighter pages, contextual marquees that match each section, a proper visual story for the three worlds, real co-founders and a hiring grid, dedicated `/playlists` and `/videos` pages linked from the home sections, and a consistent narrative arc on every page.
