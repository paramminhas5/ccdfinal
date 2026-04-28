# Fixes: About page, home order, nav dropdown, copy + disco ball

## 1. /about — remove "Who We Are" red hero, route to current What

The About page currently opens with a magenta `PageHero` ("WHO WE ARE.") followed by `Why → What → Team → WhyNow`. The user wants clicking About to land directly on the current `What` content (the "four engines" section), with the red Who-We-Are intro page gone.

**Edit `src/pages/About.tsx`:**
- Remove the `<PageHero …>` block entirely (and the `PageHero` import).
- Reorder so `What` is the first section: `What → Why → Team → WhyNow` (Marquee between What and Why).
- `What` already has its own eyebrow/title ("/ WHAT — A CULTURE BRAND WITH FOUR ENGINES.") so no extra heading needed. Add `pt-32 md:pt-40` wrapper (or pass extra top padding) so the fixed nav doesn't overlap the first line — simplest: wrap `<What />` in a `<div className="pt-24 md:pt-28">` for breathing room, OR bump `What`'s `py-24 md:py-32` to `pt-32 md:pt-40 pb-24 md:pb-32`. Use the wrapper approach to avoid changing `What.tsx`.

## 2. Home — move Events + Videos above Playlist

In `src/pages/Index.tsx`, current order under About is: Playlist → Events → Drops → Instagram → Videos → EarlyAccess.

New order: **Events → Videos → Playlist → Drops → Instagram → EarlyAccess**.

Edit `src/pages/Index.tsx`:
- Move `<SectionReveal><Events /></SectionReveal>` and the `Suspense`-wrapped `Videos` to come right after the About marquee.
- Then Playlist, Drops, Instagram, EarlyAccess in that order.
- Keep marquees but rearrange so background colors still alternate (e.g. After About marquee → Events → `bg-orange` marquee → Videos → Playlist → Drops → Instagram → `bg-acid-yellow` marquee → EarlyAccess).

## 3. "More" dropdown — add Playlists

In `src/components/Nav.tsx`, `moreLinks` currently has Pets, Media, Blog, Press. The user expects Playlists too.

There is no `/playlists` route. Easiest: add an entry that scrolls to the home `#playlist` section.
- Add `{ to: "/#playlist", label: "Playlists" }` to `moreLinks`.
- The `Dropdown` uses `RouterNavLink` which doesn't smooth-scroll to hashes after navigation. Add a small `onClick` handler in the dropdown item: if the `to` contains `#`, `e.preventDefault()`, navigate to `/`, then `setTimeout(() => document.getElementById("playlist")?.scrollIntoView({ behavior: "smooth" }), 80)`. Mirror the existing `goToEarlyAccess` pattern.

## 4. Copy fix on /for-artists

In `src/pages/ForArtists.tsx` line 39, replace:
- `"a content drop, a community moment and a repeat booking."`
- with: `"a content drop, a community moment and people want to experience again."`

(The user said "Replace 'and a repeat booking' with 'people want to experience again'".)

## 5. Disco ball on disco mode (mobile + everywhere)

Currently in `src/components/Hero.tsx` line 84: `{disco && !isMobile && <DiscoBall />}` — disco ball is suppressed on mobile. The user explicitly asked to "Add the disco ball on disco mode."

- Drop the `!isMobile` guard so the ball appears on mobile too: `{disco && <DiscoBall />}`.
- Scale `DiscoBall` slightly smaller on mobile via a `className` prop or wrap it in a `scale-75 md:scale-100` container so it doesn't crowd the small viewport.

## 6. Color collisions on links/logo

The user reports cases where link text or logo are invisible because they match the background. Inspect and fix the two known offenders:

a) **Nav at top of `/about`** — when not scrolled, nav uses `text-cream` on `bg-transparent`. Old About had a magenta hero so cream text read fine. After removing the PageHero (step 1), the first section is `What` on `bg-cream` → cream nav text on cream bg = invisible until scroll.
- Fix: make the nav default to scrolled-style coloring on the About page (and any page whose first section is cream). Simplest universal fix: set `setScrolled(true)` initial state on routes whose first section is light, OR detect first section background.
- Cleaner: change Nav to read a `data-nav-theme` attribute on `<body>` or accept a prop. Minimal change: in `Nav.tsx`, if `location.pathname === "/about"`, treat as `scrolled = true` always (force ink/cream-bg styling). Apply same to any other page with a light first section if discovered.

b) **CCD logo** — in `Nav.tsx` line 143 the logo is inverted to white when `!scrolled`. On a cream first section it'd be invisible. Tying logo invert to the same `scrolled` flag fix above resolves it.

c) **Audit pass** — quick visual check of `/about` (now What-first), `/blog`, `/media`, `/press`, `/pets` for the same nav-on-light-bg issue. Apply the same forced-scrolled treatment to any page that opens on a non-dark background.

## Files touched

- `src/pages/About.tsx` — remove PageHero, reorder sections, add top padding wrapper.
- `src/pages/Index.tsx` — reorder home sections (Events + Videos above Playlist), rebalance marquees.
- `src/components/Nav.tsx` — add Playlists to More dropdown with hash-scroll handler; force scrolled-style coloring on light-background routes so links + logo stay visible.
- `src/pages/ForArtists.tsx` — copy change.
- `src/components/Hero.tsx` — remove `!isMobile` guard so DiscoBall renders on mobile too; mobile scale wrapper.

No DB or edge function changes. No new dependencies.
