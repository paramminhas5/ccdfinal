

# Mobile nav fit + adaptive logo color

## 1. Shorten wordmark on mobile
In `src/components/Nav.tsx`, the wordmark `CATS.CAN.DANCE` is too wide for mobile when combined with the disco mute, disco button, cart, and hamburger icons.

- Replace the single `<span>` with two spans:
  - `<span class="hidden sm:inline">CATS<span class="text-magenta">.</span>CAN<span class="text-magenta">.</span>DANCE</span>`
  - `<span class="sm:hidden">CCD</span>`
- Tighten the icon row gap on mobile (`gap-1.5` instead of `gap-2`) and shrink the hamburger button to `w-10 h-10` on mobile (keep `w-11 h-11` on `sm+`).
- Reduce nav container padding on mobile (`py-3` instead of `py-4`).

## 2. Adaptive logo color (light when transparent, dark when scrolled)
Currently the same dark logo is used in both the transparent (over hero) and scrolled (cream bg) states. Over the dark/disco hero, the black circular logo is hard to see.

Two options for implementation:
- **(a) Two image swap**: import a light variant `ccd-logo-light.png` (white circle / inverted) and conditionally render based on the existing `scrolled` state in `Nav.tsx`. Requires the user to upload a light variant OR we generate one by applying CSS `filter: invert(1)` on the existing PNG.
- **(b) CSS filter swap (no new asset)**: apply `filter: invert(1) brightness(1.5)` to the logo `<img>` when `!scrolled`. Works instantly with the current asset, no upload needed.

**Going with (b)** — CSS filter, no new asset required. Add `style={{ filter: scrolled ? "none" : "invert(1) brightness(1.2)" }}` (or a Tailwind `invert` class toggle) to the logo img. The wordmark text already needs the same treatment: when transparent over the hero, the ink-colored text is fine on cream sections but harder over dark/disco — switch wordmark to `text-cream` when `!scrolled` and `text-ink` when `scrolled`.

## 3. Footer logo polish (desktop too)
The Footer already sits on dark `bg-ink`, so the black logo disappears. Apply the same `invert` filter on the Footer logo so the white-cat circle reads clearly. Also bump desktop logo sizing in Nav from `md:h-10` to `md:h-11` so it pairs better with the wordmark weight on desktop.

## Technical notes
Files touched:
- `src/components/Nav.tsx` — short CCD on mobile, adaptive logo + wordmark color via filter, tighter mobile gaps
- `src/components/Footer.tsx` — `invert` filter on logo so it reads on dark bg

No new assets, no new dependencies, no backend.

