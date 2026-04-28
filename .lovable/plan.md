## Why the theme switcher looks broken today

Two real bugs, one UX issue:

1. **Themes don't visibly change anything.** `ThemeProvider` only rewrites the semantic CSS vars (`--brand`, `--accent`, `--surface`, `--surface-alt`). But almost every component on the site uses the *fixed* palette classes — `bg-magenta`, `bg-acid-yellow`, `bg-electric-blue`, `bg-cream`, `bg-ink`, `text-ink`, etc. — which map to their own untouched vars (`--magenta`, `--cream`, …). So switching presets shuffles a handful of `bg-brand`/`bg-surface` usages (basically just the Theme Switcher itself) and the rest of the page stays identical. To the user it looks like nothing happened.

2. **Backend saves are ignored on your own browser.** Saving in Admin → THEME does write to `site_settings.theme` (verified in the network log — currently `{preset: "midnight"}`). But `ThemeProvider` does `if (localStorage.getItem("ccd_theme_preset")) return;` before reading the CMS value. Once you've ever clicked the front-end switcher, the CMS preset never loads for you again.

3. **Switcher button is loud.** A 44×44 cream box with a chunky border and rainbow conic-gradient pinned bottom-left isn't an easter egg — it screams "dev tool".

## Plan

### 1. Make presets actually re-skin the site (the real fix)

Map the fixed palette CSS variables to the active preset, instead of (or in addition to) the semantic tokens. So when "Midnight" is active, `--magenta`, `--cream`, `--acid-yellow`, etc. get *remapped* to that preset's palette, and every existing `bg-magenta`/`bg-cream`/`bg-ink` class on the site re-skins automatically — no component edits needed.

Concretely, expand each `ThemePreset` in `src/lib/theme.ts` to also declare overrides for the named palette tokens it wants to remap:

```text
default  → leave palette untouched (current look)
midnight → magenta→electric-blue, cream→near-ink, ink stays, acid-yellow→lime
sunburn  → magenta→orange, cream stays, acid-yellow stays, ink stays
```

`applyTheme` will set `--magenta`, `--cream`, `--acid-yellow`, `--electric-blue`, `--orange`, `--lime`, `--ink` from the preset (falling back to the original defaults when a preset doesn't override that slot, so we never end up with broken contrast).

Result: clicking Midnight in the switcher (or saving it in Admin) flips the entire homepage / events / about / nav from magenta-on-cream to electric-blue-on-near-ink in one go.

### 2. Respect the CMS preset properly

In `ThemeProvider`:
- Always fetch `site_settings.theme` on mount.
- If there's no localStorage override, apply the CMS preset.
- If there is a localStorage override, still apply it — but stop ignoring CMS updates silently. Add an "RESET TO SITE THEME" action in the switcher so users can drop back to whatever the admin chose.
- Subscribe to realtime changes on `site_settings` so admin saves propagate to open tabs without a refresh (small win — also lets us drop the "refresh to see changes" toast in Admin).

### 3. Make the toggle a subtle easter egg

Replace the current pinned card with a **tiny 10×10px ink dot** in the very bottom-left corner (`fixed bottom-2 left-2`), no border, no shadow, ~40% opacity, hover bumps to 100%. No tooltip. Clicking it opens the same preset menu as today but styled smaller and lighter. Keyboard discoverable too: `Shift + T` cycles presets.

That way casual visitors won't notice it, but anyone curious enough to mouse into the corner finds it.

### 4. Small Admin polish

- After "SAVE THEME", apply the new preset locally immediately (don't wait for refresh) by clearing the user's localStorage override and re-running `applyTheme`.
- Show a live preview swatch row at the top of the THEME tab using the preset's *full* remapped palette, so admins see what each option will do to the site before saving.

## Files touched

- `src/lib/theme.ts` — extend `ThemePreset` with full palette overrides; expand `applyTheme` to write `--magenta`, `--cream`, `--ink`, `--acid-yellow`, `--electric-blue`, `--orange`, `--lime` (with fallbacks to defaults).
- `src/components/ThemeProvider.tsx` — always load CMS theme; add realtime subscription; expose `clearOverride()`.
- `src/components/ThemeSwitcher.tsx` — redesign as a 10px easter-egg dot with a small popover; add `Shift+T` shortcut and "Reset to site theme" link.
- `src/pages/Admin.tsx` — after save, clear local override + re-apply theme so admin sees the change instantly; update preset preview swatches to show full remapped palette.

No DB migration, no edge function changes (the existing `admin-content` already persists `theme`).

## Out of scope

- Changing the existing palette classnames across components (not needed — the remap does it).
- Per-page theme overrides.
- Adding more than the existing three presets (default / midnight / sunburn).
