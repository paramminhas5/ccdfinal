## Plan: Cohesive colors, marquee CMS, working "all" pages, Cat Creator

### 1. Homepage color cohesion (no adjacent repeats)

Current order: Hero(blue) → Marquee(yellow) → About(cream) → Marquee(lime) → Events(lime) ❌ → Marquee(orange) → Videos(lime) → Marquee(magenta) → Playlist(magenta) ❌ → Marquee(yellow) → Drops(cream) → Marquee(blue) → Instagram(magenta) → Marquee(yellow) → EarlyAccess(blue).

Two collisions today (marquee = next section). New rhythm in `src/pages/Index.tsx`, locking a 5-color rotation so no marquee shares a color with the section above OR below it:

```
Hero blue → M:yellow → About cream → M:lime → Events lime  ⟶ change Events bg or marquee
```

Fix by swapping the marquee colors only (don't change section bgs):
- Above Events: `bg-orange` (was lime)
- Above Videos (which is lime): `bg-magenta` (was orange)
- Above Playlist (magenta): `bg-acid-yellow` (was magenta)
- Above Drops (cream): `bg-electric-blue` (was acid-yellow)
- Above Instagram (magenta): `bg-acid-yellow` (was electric-blue)
- Above EarlyAccess (electric-blue): `bg-orange` (was acid-yellow)

Result: every marquee differs from the section directly below, and `SectionFallback` defaults updated to match.

### 2. Editable / toggleable marquees from Admin

Treat marquees as data, not hardcoded.

**Schema (migration):** add `marquees jsonb NOT NULL DEFAULT '[]'` to `site_settings`. Each entry:
```json
{ "id": "above-events", "enabled": true, "bg": "bg-orange", "reverse": false, "size": "sm", "items": ["EPISODE 01","RSVP NOW"] }
```
Seed defaults for the 6 homepage slots (`above-about`, `above-events`, `above-videos`, `above-playlist`, `above-drops`, `above-instagram`, `above-early-access`).

**Backend:** `supabase/functions/admin-content/index.ts` settings upsert accepts `marquees`. Public read uses existing `site_settings` SELECT policy (already public).

**Frontend:**
- New `src/hooks/useMarquees.ts` fetches once and exposes a `getMarquee(id)` helper.
- `src/pages/Index.tsx` replaces hardcoded `<Marquee>` JSX with `<MarqueeBySlot id="above-events" fallback={...} />`. If `enabled=false`, render nothing.
- Admin tab "MARQUEES" (`src/pages/Admin.tsx`): list of slots with toggle (on/off), bg color picker (5 brand swatches), reverse switch, size, and tag-style items editor. Save calls existing settings upsert.

### 3. Fix "ALL VIDEOS" and "ALL PLAYLISTS" buttons

The buttons already navigate to `/videos` and `/playlists` — but those pages just embed the same single-feature components, so it feels like nothing happens. Rebuild them as proper index pages:

**`src/pages/Videos.tsx`** — full grid of every YouTube video from the channel (use existing `youtube-videos` function, request `maxResults: 50`; add a `?max=` query param to the function). Sort by date, paginate client-side (12 per page), no embedded `Videos` section.

**`src/pages/Playlists.tsx`** — render every playlist from `site_settings.playlists` as a grid of cards (one card per playlist with platform badge + embed-on-click), not the single-active Playlist component.

Both pages keep `PageHero` + `Breadcrumbs`. Also fix the `Footer` ref warning by removing the stray prop in `VideosPage`.

### 4. Create Your Own Cat — `/cat-studio`

New route + page `src/pages/CatStudio.tsx`. Two modes in tabs:

**A) Layered Builder** (default, instant, free)
- Layers: base body (cat-left/right/handstand/headphones/cap/hpDance — pick 1), accessory (star, sparkle, vinyl), background color (5 brand colors), name tag text, sticker (optional second cat).
- Render with absolute-positioned `<img>` layers inside a `<div ref>` on a 1024×1024 stage.
- Export PNG via `html-to-image` (already friendly to our SVG/PNG mix) or a small canvas compositor — use the existing dependency surface; if not present, write a minimal canvas drawer that loads each image and `ctx.drawImage`s it. No new deps required.
- Buttons: "Download PNG", "Remix with AI →" (sends current composite to mode B).

**B) AI Remix** (Lovable AI, on-demand)
- New edge function `supabase/functions/cat-generate/index.ts` calling `google/gemini-3.1-flash-image-preview` with a locked style prompt: *"Bold flat-vector illustration in the Cats Can Dance style: thick black 4px outlines, bright flat fills (electric blue / magenta / acid-yellow / lime / cream), chunky drop shadow, playful dancing cat, no text, square 1:1, transparent or solid color background."* Plus user-chosen vibe chips (DJ, Skater, Headphones, Disco, Pet-mode), name, color.
- Optional: pass the layered-builder PNG as the input image to "edit" so the result resembles their build.
- Returns base64 → preview → download. Rate-limit 10/min in-memory.

**Nav:** add `/cat-studio` link in the "More" dropdown. Also link from a new compact CTA card under the Hero or in the About → "Three Worlds" tile.

### 5. Misc fixes surfaced
- Resolve the `Footer` forwardRef console warning in `VideosPage`.
- Add `mem://design/color-rotation` rule so future sections respect the no-adjacent-color rule.

### Files

**Edit:** `src/pages/Index.tsx`, `src/pages/Admin.tsx`, `src/pages/Videos.tsx`, `src/pages/Playlists.tsx`, `src/components/Marquee.tsx` (no change), `src/App.tsx` (route), `src/components/Nav.tsx` (link), `supabase/functions/admin-content/index.ts`, `supabase/functions/youtube-videos/index.ts` (accept `max`).

**Create:** `src/hooks/useMarquees.ts`, `src/components/MarqueeBySlot.tsx`, `src/pages/CatStudio.tsx`, `src/components/cat-studio/Builder.tsx`, `src/components/cat-studio/AIRemix.tsx`, `supabase/functions/cat-generate/index.ts`, `supabase/migrations/<ts>_marquees.sql`, `mem://design/color-rotation`, `mem://index.md`.

**No new dependencies.** Uses existing Lovable AI key. No new buckets (downloads stay client-side).
