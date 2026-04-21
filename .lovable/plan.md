

# Mobile hero cats, smoother disco, scroll-to-top fix

## 1. Add the two new cats flanking the DJ on mobile
- Copy `user-uploads://Clip_path_group-1.png` → `src/assets/cat-headphones.png` (the dancing cat with headphones).
- Copy `user-uploads://Clip_path_group-3.png` → `src/assets/cat-handstand.png` (the upside-down cat).
- In `src/components/Hero.tsx`, add two new `<img>` elements, **mobile-only** (`md:hidden`), positioned over the top-left and top-right of the DJ cat:
  - Headphones cat: top-left of DJ, `w-20`, slight rotation `-12deg`, with chunky ink shadow.
  - Handstand cat: top-right of DJ, `w-20`, slight rotation `12deg`.
  - Both placed `absolute` with `z-30` (same layer as DJ) just above the headline, around `top-[55%]`, with small `wiggle` animation.
- Existing `cat-left` / `cat-right` SVGs stay untouched on desktop.

## 2. Smoother scroll with disco mode on mobile
The disco-mode jank on mobile comes from heavy compositing: `Lasers` runs 6 animated gradient bars + 8 large radial blobs with `mix-blend-screen`, plus the `DiscoBall` builds ~200 absolutely-positioned 3D-transformed tiles. On mobile GPUs this kills scroll FPS.

Fixes:
- **Disable `mix-blend-screen` on mobile** in `Lasers.tsx` (keep `screen` only `md:` and up). Reduce laser count to 4 and spotlight count to 4 on mobile.
- **Cap laser height** to `100vh` (currently `120vh`) and remove `boxShadow` glow on mobile (huge paint cost).
- **Skip DiscoBall entirely on mobile** — render only on `md` and up. The lasers + body strobe still sell the effect.
- Ensure both effects use `position: fixed`-style isolation by adding `will-change: transform` and `contain: paint` on their root, and verify `pointer-events-none` (already set) so they don't intercept touch.
- In `Hero.tsx`, gate `<DiscoBall />` and the heavy laser config behind a `useIsMobile()` check.

## 3. Scroll-to-top on route navigation
Currently navigating between pages (e.g., clicking a Nav link to `/about`) preserves the previous scroll position because React Router doesn't auto-reset scroll. Result: the new page lands mid-section.

- Create a small `ScrollToTop` component that listens to `useLocation().pathname` changes and calls `window.scrollTo({ top: 0, behavior: "instant" })` on every change. Skip when the URL has a `#hash` (so anchor links still work).
- Mount it inside `<BrowserRouter>` in `src/App.tsx`, just above `<Routes>`.
- Also ensure the in-page anchor links (`#events`, `#early-access` from Hero) on the home page still scroll smoothly via existing Lenis — no change needed there.

## Technical notes
Files touched:
- `src/assets/cat-headphones.png` — NEW (from upload)
- `src/assets/cat-handstand.png` — NEW (from upload)
- `src/components/Hero.tsx` — add two mobile-only flanking cats, gate DiscoBall behind `useIsMobile`
- `src/components/Lasers.tsx` — lighter mobile config (fewer elements, no glow, no blend-mode)
- `src/components/ScrollToTop.tsx` — NEW small component
- `src/App.tsx` — mount `<ScrollToTop />` inside `<BrowserRouter>`

No backend, no new dependencies.

