

# Hero cats refresh, marquee scale-up, cohesive home

## 1. Replace flank cats with the two new transparent-bg cats

Copy uploads → assets (overwriting existing files so imports stay):
- `user-uploads://Clip_path_group-4.png` → `src/assets/cat-cap.png` (cap, arms-crossed — left)
- `user-uploads://Clip_path_group-1-2.png` → `src/assets/cat-headphones-dance.png` (headphones, dancing — right)

Both have transparent backgrounds, so they'll sit cleanly on the electric-blue hero.

## 2. Hero — four cats around the wordmark, same size, scroll-away

In `src/components/Hero.tsx`:

**Unify all 4 flank cats to the same size and bracket the headline** (left side: `cat-cap` top, `cat-headphones` bottom; right side: `cat-hp-dance` top, `cat-handstand` bottom). Currently the small mobile flank cats (`catHeadphones`, `catHandstand`) are `w-16` and the new ones are `w-28` — mismatched. Unify to:
- Mobile: all four at `w-24`
- Desktop: all four at `w-40`

**Position around the headline** so they frame "CATS / CAN / DANCE":
- top-left: `cat-cap` near "CATS"
- top-right: `cat-hp-dance` near "CATS"
- bottom-left: `cat-headphones` near "DANCE"
- bottom-right: `cat-handstand` near "DANCE"

Show all four on **both mobile and desktop** (remove the `md:hidden` gating on `catHeadphones`/`catHandstand`) — this fills the desktop composition that currently feels empty on the sides.

**Scroll-away + headline scale-up**: bind to existing `scrollYProgress`:
- All four flank cats: `x` drift outward (-120% / +120%), `opacity` 1 → 0, small rotate.
- Headline `<h1>`: `useTransform` `scale` 1 → 1.25 and slight `y` lift, so as cats fly out the wordmark grows to fill the space. Wrap h1 in `motion.h1` with `style={{ scale, y }}` and `transform-origin: center`.
- Keep the existing big side cats (`catLeft`/`catRight` SVGs at the bottom corners) as-is — they already scroll away.
- DJ cat keeps its current `djY` parallax.

Remove the now-redundant mobile-only `<img>` blocks for `catHeadphones` and `catHandstand` and replace with unified `motion.img` versions used at all breakpoints.

## 3. Marquee — bigger

In `src/components/Marquee.tsx`:
- Padding: `py-4` → `py-6 md:py-8`
- Font: `text-3xl md:text-5xl` → `text-5xl md:text-7xl`
- Gap: `gap-12` → `gap-16`
- Star: keep `text-magenta`, scales with text

This gives the homepage stronger horizontal rhythm between sections (matches the brutalist scale of the headline).

## 4. Cohesive desktop + mobile home page

Beyond the hero/marquee changes:
- Hero buttons: on desktop they currently sit `bottom-16` floating below the DJ — keep, but ensure they don't collide with the now-larger headline scale. Since scale only triggers on scroll, initial state is unchanged.
- Confirm `h-screen` hero still fits all four cats + DJ + buttons at 390px viewport (cats sized `w-24` at the four corners of the headline area, DJ at `bottom-20`, buttons at `bottom-6`).
- No other section changes needed — About/PageHero fixes from prior batches already address the cut-off issues.

## 5. Files touched

- `src/assets/cat-cap.png` (overwritten with transparent version)
- `src/assets/cat-headphones-dance.png` (overwritten with transparent version)
- `src/components/Hero.tsx` (unify cat sizes, 4-corner layout on all breakpoints, headline scale-on-scroll, fly-out)
- `src/components/Marquee.tsx` (bigger type + padding)

No new dependencies. No backend changes.

