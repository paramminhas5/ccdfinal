# Design system + theming + content CMS

Three things, in order of effort:

## 1. Quick fixes (events stats + about tagline)

`**src/pages/Events.tsx**` — Remove the stats grid (NIGHTS THROWN / CITIES / DANCERS). We've only thrown one event so it's misleading. Keep the magenta hero, the acid-yellow marquee strip, and the events list.

`**src/pages/About.tsx**` — Shorten the hero:

- Current: "AT THE INTERSECTION OF MUSIC, FASHION & PETS." (two lines, mouthful)
- New: **"MUSIC. FASHION. PETS."** with kicker "A culture brand from Bangalore."

## 2. Lock down a real design system

Right now colors, shadows, and type sit half in `index.css`, half hardcoded in components (`bg-magenta`, `bg-electric-blue`, etc). Before we can theme anything, we need one source of truth.

**New file `src/lib/theme.ts**` — single object exporting semantic tokens:

```text
brand            → primary brand color (currently magenta)
accent           → secondary highlight (currently acid-yellow)
surface          → light section bg (cream)
surface-alt      → dark section bg (ink)
text-on-brand    → text color over brand
text-on-surface  → text color over surface
shadow           → chunk shadow color (ink)
```

`**src/index.css**` — add semantic CSS vars (`--brand`, `--accent`, `--surface`, `--surface-alt`, `--on-brand`, `--on-surface`) that map to the raw palette. Keep the raw palette (magenta, acid-yellow, lime, electric-blue, ink, cream) as-is so existing components keep working.

`**tailwind.config.ts**` — register the new semantic colors (`brand`, `accent`, `surface`, `surface-alt`) alongside existing ones.

**Documented usage rule** (added to `mem://design/` and a short README block): new sections use semantic tokens (`bg-brand`, `bg-surface`); raw palette colors stay allowed for accent flourishes only. We'll migrate components opportunistically — not in a big-bang refactor.

## 3. Theme presets + content editor in Admin

### 3a. Schema (one migration)

Add to `site_settings`:

- `theme jsonb default '{}'` — `{ preset: "default", overrides: { brand: "0 72% 51%", accent: "84 81% 56%", surface: "20 6% 90%", surfaceAlt: "222 47% 4%" } }`
- `home_content jsonb default '{}'` — editable copy for hero + key sections (see below)

No data migration needed; defaults handle empty rows.

### 3b. Theme presets

Three starter presets defined in `src/lib/theme.ts`:

```text
default   — magenta + acid-yellow + cream + ink (current)
midnight  — electric-blue + lime + ink + cream (dark-first)
sunburn   — orange + acid-yellow + cream + ink (warm)
```

**Runtime application** — new `src/components/ThemeProvider.tsx` wraps the app in `App.tsx`:

1. Reads `site_settings.theme` once on mount.
2. Applies `--brand`, `--accent`, `--surface`, `--surface-alt`, `--on-brand`, `--on-surface` to `:root` via `style.setProperty`.
3. Falls back to default preset if the row is empty.

### 3c. Editable home content

Move hardcoded strings out of `src/pages/Index.tsx` / `src/components/Hero.tsx` into `home_content`:

```text
hero.kicker     hero.title       hero.subtitle    hero.ctaLabel    hero.ctaHref
about.kicker    about.title      about.body
cta.title       cta.body         cta.label        cta.href
```

A new hook `src/hooks/useHomeContent.ts` fetches and caches; components read with sensible fallbacks so the site never breaks if a field is empty.

### 3d. Admin tabs

Extend `src/pages/Admin.tsx` and `supabase/functions/admin-content/index.ts`:

**New "THEME" tab**

- Preset picker (3 cards — click to apply).
- Color overrides: 4 swatches (brand / accent / surface / surface-alt) with HSL inputs and a live preview tile.
- "Reset to preset" button.

**New "HOMEPAGE" tab**

- Form fields for each `home_content` key above (text inputs + textareas).
- Save writes `home_content` jsonb in one upsert.  
  


Both tabs use the existing admin-password edge function pattern — extend the `settings` upsert handler to accept `theme` and `home_content` payloads.

## NEW theme switch button in frontend. - add a subtle and cool theme switch button as well.   
  
Out of scope (call out so we don't sprawl)

- Full migration of every component to semantic tokens (we'll do it as we touch each one).
- Per-page theming (themes are site-wide for now).
- Font swapping in the theme editor (display + body fonts stay locked to Bowlby One + Space Grotesk).

## Technical notes

- Theme application happens client-side after fetch; to avoid a flash, we keep the default preset baked into `:root` in `index.css` so first paint matches the default until/unless an override loads.
- `home_content` and `theme` both live on the single `site_settings` row (`id = 'main'`) — same pattern as `marquees`.
- Edge function: extend the existing `settings` upsert branch, no new function needed.
- Memory update: add a `mem://design/tokens` note documenting the semantic token rule once shipped.