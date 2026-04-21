# Polish pass — fix playlist, mobile hero, audio, checkout, headers + add team

## 1. Playlist — kill the jank

The scroll-tied vinyl spin runs for the entire viewport range and forces continuous repaints on a large image overlapping a heavy iframe. Mobile especially chokes.

- Drop the `useScroll`/`useTransform` rotation entirely. Replace with a CSS `animate-spin-slow` (already exists as `spin-slow`) so the GPU handles it without React re-rendering on every scroll frame.
- Add `pointer-events-none` and shrink the vinyl on mobile (`w-56 md:w-[28rem]`) so it doesn't overlap the iframe touch area.
- Wrap the iframe in a fixed aspect container and add `loading="lazy"` so it doesn't block initial paint.

## 2. Hero DJ cat invisible on mobile

The DJ image is `bottom-0` with the buttons sitting on top of it at `bottom-10`, and at 390px the image is squeezed behind the side cats and the CTA stack.

- Raise the DJ: `bottom-24 md:bottom-0` so it sits above the buttons.
- Bump mobile size: `w-[78%] max-w-[680px]` → keep, but raise `min-w` so it never collapses below ~280px.
- Move buttons into normal flow under the hero on mobile (stack BELOW the hero section on `< md`), keep absolute on desktop. Cleanest fix: render buttons in a separate `<div>` directly after the hero `<section>` on mobile, absolute on desktop via responsive classes.
- Shrink side cats on mobile (`w-16`) so the DJ has breathing room.

## 3. Disco audio not playing

Two problems:

- `disco-loop.mp3` lis not thr file i have added another mp3 file. 

Fixes:

- Clamp `el.volume = Math.max(0, Math.min(1, start + (target - start) * k))` in `useDiscoAudio.ts`.
- Add a one-time user-gesture unlock: the first click anywhere on the page primes the audio element with `play().then(pause)` so subsequent disco toggles work on iOS/Safari/Chrome autoplay-blocked contexts.
- Add a visible note in `DiscoMute` if `available === false` (file missing) so the user knows to drop a file in `public/audio/disco-loop.mp3`.

## 4. Shopify checkout opens "weirdly to the end of the page"

The Shopify checkout URL is correct, but `window.open(url, "_blank")` on mobile sometimes scrolls the new tab strangely if the trigger element has lost focus. Real fix: use a real `<a target="_blank">` for the checkout button (anchor-based navigation behaves predictably across browsers and preserves scroll position to top of new tab).

- Replace the `<Button onClick={handleCheckout}>` in `CartDrawer` with an `<a>` styled as a button, `href={checkoutUrl}` prefetched on cart sync, `target="_blank" rel="noopener"`. Disable when no URL.
- Also fix the React `forwardRef` warnings on `Footer` and `SheetHeader` callsites by passing their content correctly (Footer doesn't need ref; the warning comes from `motion.img` on `Footer` star — replace with plain `<img>` since no animation is applied).

## 5. Instagram title overflowing

`@CATSCAN.DANCE` at `text-8xl` overflows at 390px width.

- Use clamp sizing: `text-5xl sm:text-7xl md:text-8xl` and `break-all` so the handle wraps cleanly.
- Lowercase visual treatment: keep handle as-is (no uppercase transform) so the dot doesn't push it wider.

## 6. Page titles look weird in black drop-shadow

`PageHero` always applies `drop-shadow-[5px_5px_0_hsl(var(--ink))]` regardless of text color. When the text itself is dark or background is dark, this creates a muddy halo.

- Make shadow optional via prop `shadow?: boolean` (default true) and also expose `shadowColor` so dark-on-light pages can use cream shadow or none.
- Audit pages: any page using a dark `textColor` gets `shadow={false}`; any page with `bg-magenta` keeps cream-on-ink shadow.

## 7. Add Team section to About page

New `src/components/Team.tsx`:

- Section title `/ THE PACK` + headline "RUN BY HUMANS WHO MOVE."
- Grid of team member cards (placeholder names/roles/avatars using existing cat SVGs as fun stand-ins until you supply real photos): Founder, Music Director, Brand & Design, Community Lead.
- Same chunky border + chunk-shadow style as the rest of the site.
- Mounted in `src/pages/About.tsx` between `What` and `WhyNow`.

## 8. Recommended additional polish (small, fast)

- **Footer**: add `Shop` link to EXPLORE group (currently missing).
- **Nav**: add Cart icon (CartDrawer trigger) globally so users can checkout from any page, not just `/shop`.
- **Drops section** on home: link CTA to `/shop` (currently may not).
- **SEO**: add `/shop` and `/about` to `public/sitemap.xml`.
- **Runtime cleanup**: silence the React `forwardRef` warning from `SheetHeader` by using a `<div>` wrapper inside `CartDrawer` (cosmetic, but currently spamming console).

## Technical notes

Files touched:

- `src/components/Playlist.tsx` — remove framer scroll, use CSS spin
- `src/components/Hero.tsx` — mobile layout for DJ + buttons
- `src/hooks/useDiscoAudio.ts` — clamp volume, gesture unlock
- `src/components/DiscoMute.tsx` — show "audio missing" hint
- `src/components/CartDrawer.tsx` — anchor-based checkout, ref fix
- `src/components/Instagram.tsx` — responsive title wrapping
- `src/components/PageHero.tsx` — optional shadow prop
- `src/pages/About.tsx`, `src/pages/ForVenues.tsx`, `src/pages/ForArtists.tsx`, `src/pages/ForInvestors.tsx`, `src/pages/Events.tsx`, `src/pages/Shop.tsx` — pass `shadow={false}` where needed
- `src/components/Team.tsx` — NEW
- `src/components/Footer.tsx` — add Shop link, replace `motion.img` with `img`
- `src/components/Nav.tsx` — global cart trigger
- `public/sitemap.xml` — add routes

No backend changes. No new dependencies.