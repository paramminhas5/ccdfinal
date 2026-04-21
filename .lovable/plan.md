
# Hero, cart, audio & playlist tweaks

## 1. Cart button — only show when items in cart
In `src/components/Nav.tsx` (both desktop `<ul>` and mobile button row), wrap the `<CartDrawer />` in a conditional based on `useCartStore` line count. When `totalItems === 0`, render nothing.

- Read `lines` (or equivalent) from `useCartStore` and compute count.
- Subscribe selector style so Nav re-renders when cart changes.

## 2. Disco audio — invert mute logic
Right now the mute button starts in "sound on" state but audio doesn't play because of autoplay gating. Fix so that pressing Disco = sound ON immediately, and the mute toggle controls silencing it.

- In `useDiscoAudio.ts`, ensure when `disco` flips to `true` we call `el.play()` synchronously inside the same gesture that triggered disco (the Disco button click is itself a user gesture, so this should work without separate priming). Keep the global pointerdown primer as a fallback.
- Default `muted = false`. When disco turns on and not muted → fade up to TARGET_VOL. When muted → fade to 0 but keep `disco` on.
- Mute button label/icon already reflects state correctly; just confirm the logic: 🔊 lime = playing, 🔇 cream = muted. Currently correct — the bug is audio never starts. Root cause is likely that the gesture-unlock `play().then(pause)` consumes the user activation but the actual disco play call happens in a `useEffect` after state update, which on iOS counts as non-gesture. Fix: in `DiscoButton`'s `onClick`, after `toggle()`, directly call `audio.play()` via a shared ref exposed from the disco audio hook OR move the play trigger into a ref-based imperative call from DiscoContext.

Cleanest approach: expose a `playNow()` from `useDiscoAudio` via a small singleton (module-level audio element + module-level play function), and have `DiscoButton.onClick` invoke it inside the same click handler before/after `toggle()`.

## 3. Hero — bigger DJ cat covering text slightly
In `src/components/Hero.tsx`:
- DJ image: bump `w-[78%] max-w-[680px]` → `w-[92%] max-w-[820px]` and raise so head overlaps the bottom 1–2 lines of "DANCE". Adjust `bottom-` and remove the parallax scale that shrinks it. On mobile keep `bottom-24` but enlarge to `w-[100%]`.
- Ensure `z-30` stays above the headline (`z-20`) — already true.

## 4. Hero — bigger, raised side cats
- Side cats: mobile `w-16` → `w-24`; desktop `md:w-56` → `md:w-72`.
- Raise from `bottom-4` → `bottom-12 md:bottom-16` so they sit alongside the DJ cat instead of on the floor.
- Keep wiggle and parallax exit transforms.

## 5. Playlist — bring back scroll-driven vinyl spin
Restore Framer Motion scroll rotation in `src/components/Playlist.tsx`, but keep it lightweight:
- Use `useScroll({ target: ref, offset: ["start end", "end start"] })` and `useTransform` to map progress → `rotate` (0 → 540deg).
- Apply `willChange: transform` and `transform-gpu`. Keep CSS `spin-slow` removed.
- Keep the smaller mobile size and `pointer-events-none` so the iframe stays usable.
- Respect `useReducedMotion` → no rotation.

## Technical notes
Files touched:
- `src/components/Nav.tsx` — conditional CartDrawer based on cart count
- `src/hooks/useDiscoAudio.ts` — expose imperative play, ensure gesture-bound start
- `src/components/DiscoButton.tsx` — call imperative play on click
- `src/components/Hero.tsx` — DJ + side cat sizing/positioning
- `src/components/Playlist.tsx` — restore scroll-driven rotation (lighter version)

No new dependencies. No backend changes.
