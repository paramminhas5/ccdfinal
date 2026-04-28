## Goal

Restrict the easter-egg theme switcher (and `Shift+T` cycle) on the public site to just **Brutalist, Matcha, Default, Candy Pop, Mono+1**, and stop the scroll from glitching when the switcher is on screen. Admin still sees the full library.

## Changes

### 1. `src/lib/theme.ts`
Add a small allowlist of frontend-visible preset IDs and export it:

```ts
export const FRONTEND_PRESET_IDS = ["default", "brutalist", "matcha", "candy", "mono"];
```

Keep all other presets in `THEME_PRESETS` so the Admin dropdown is unchanged.

### 2. `src/components/ThemeProvider.tsx`
- Expose `presetIds` filtered to `FRONTEND_PRESET_IDS` (intersected with `THEME_PRESETS` so it stays safe).
- Use that same filtered list for the `Shift+T` cycle so cycling only walks the 5 allowed themes.
- If the CMS or `localStorage` selects a non-frontend preset (e.g. someone picked Synthwave in Admin), still honor it — just don't include it in the cycle.

### 3. `src/components/ThemeSwitcher.tsx` — fix scroll glitch
The current dot uses `fixed bottom-2 left-2 z-[60]`. On iOS / when Lenis smooth-scroll is active, a `fixed` element with a hover transition can cause repaint jitter on every scroll frame, which reads as "scroll glitching".

Fixes:
- Wrap the dot+menu in a single `fixed` container that uses `pointer-events-none` by default and re-enables pointer events only on the dot/menu themselves. This stops the fixed layer from intercepting wheel/touch.
- Promote it to its own compositor layer with `transform: translateZ(0)` and `will-change: transform` so it no longer triggers full-page repaints.
- Drop the `transition-colors` on the dot (it's invisible at 30% opacity anyway) — removes per-frame style recalcs while hovering during scroll.
- Render the dropdown menu only when `open` (already the case) and give it `will-change: transform` too.

### 4. No DB / Admin changes
Admin keeps the complete `THEME_PRESETS` list so you can still pick any of the 12 themes as the site default; only the frontend easter-egg is restricted.

## Files touched
- `src/lib/theme.ts` — add `FRONTEND_PRESET_IDS` export
- `src/components/ThemeProvider.tsx` — filter `presetIds` and `Shift+T` cycle
- `src/components/ThemeSwitcher.tsx` — pointer-events isolation + GPU layer
