# Pull themes from ccdthemes.lovable.app

The sister project [ccdolddifferenttheme](https://ccdthemes.lovable.app) has a `PaletteSwitcher` with 11 fully-defined palettes. We'll port them into this site's existing theme system so the admin theme picker, the easter-egg switcher, and CMS-stored themes all gain those 11 presets.

## What's coming over

Each preset defines all 9 named palette colors (magenta, cream, ink, acid-yellow, electric-blue, orange, lime, hot-pink, bubblegum) plus surface/foreground:

1. **Original** — cream / hot pink / acid yellow / electric blue
2. **Synthwave** — deep indigo / hot pink / cyan / violet  *(this is what ccdthemes shows by default)*
3. **Brutalist** — concrete grey / red / lime / blue
4. **Y2K** — lavender / pink / yellow / cyan
5. **Matcha** — beige / forest / amber / sage
6. **Mono+1** — white / black / orange accent
7. **Sunset** — peach / coral / amber / violet
8. **Oceanic** — deep navy / cyan / yellow accent
9. **Candy Pop** — blush / hot pink / mint / yellow
10. **Forest** — dark green / chartreuse / cream / brick
11. **Pink Punk** — black / white / hot pink
12. **Linework** — pure black & white only

Existing `default`, `midnight`, `sunburn` presets stay (rename-safe — IDs don't collide).

## Changes

### 1. `src/lib/theme.ts`
Add the 11 presets to `THEME_PRESETS`. For each preset, populate:
- `tokens` (brand/accent/surface/surface-alt/on-brand/on-surface/shadow) — derived from the source's `--primary`, `--accent`, `--background`, `--card`, `--foreground`
- `palette` overrides for all 9 named colors so existing `bg-magenta`, `bg-electric-blue`, `bg-cream`, etc. classes re-skin everywhere
- `description` — short tagline matching the vibe

### 2. `src/pages/Admin.tsx` — THEME tab
The preset dropdown reads from `THEME_PRESETS` so the new presets appear automatically. Confirm the swatch preview row renders all 11 without layout break (may need to wrap to a 2nd row).

### 3. `src/components/ThemeSwitcher.tsx` (easter-egg dot)
`Shift+T` cycles through `Object.keys(THEME_PRESETS)` — already dynamic, so new presets are picked up automatically. No code change needed beyond verifying.

### 4. No DB migration
`site_settings.theme` is JSONB and only stores `{ preset, overrides? }`. New preset IDs slot in without schema changes.

## Out of scope
- Not copying the 🎨 floating switcher UI from the sister project — your current easter-egg dot stays.
- Not changing the active site theme — admin picks which one is live.

## Technical notes
- All HSL values are copied verbatim from the source `PaletteSwitcher.tsx` (format: `"H S% L%"`).
- Where the source preset doesn't distinguish a token (e.g. Linework uses black/white for everything), we map `brand → primary`, `accent → accent`, `surface → background`, `surface-alt → card`.
