

# Fix: City overflow, weird shadow, duplicate poster, and Episode media gallery

## 1. Poster loading twice on Episode 1 detail page

**Cause:** In `src/pages/EventDetail.tsx`, `event.poster_url` is now `/episodes/episode-01.gif` (from the recent migration), AND `RECAP_MEDIA["episode-1"]` is also `/episodes/episode-01.gif`. So the page renders the same GIF twice — once as the hero poster (line 198–234), once as the recap (line 236–238).

**Fix:** Remove the standalone `RECAP_MEDIA` block entirely. The poster block already shows the GIF beautifully and silently falls back to the static PNG (we'll reuse the same fallback logic). Delete `RECAP_MEDIA`, `RECAP_FALLBACK`, and `RecapMedia` component. Inline the PNG fallback into the existing poster `<img>` `onError` so a GIF failure swaps to the imported `episode1Poster` first, then to the lime tile.

## 2. City text overflowing in Event hero

**Cause:** At 768px (md breakpoint), `grid sm:grid-cols-3 gap-4` gives each `Field` ~33% width. `font-display text-2xl` "Bengaluru" / long venue names overflow.

**Fix in `EventDetail.tsx`:** 
- Add `min-w-0` to each Field wrapper and `break-words` to the value `<p>`.
- Bump the value text to `text-xl md:text-2xl` so it shrinks on tablets.
- Same treatment for the venue field.

## 3. Heading shadow looks weird on past episodes

**Cause:** `drop-shadow-[6px_6px_0_hsl(var(--ink))]` on line 163 always uses ink (black) shadow. On the past-episode header (cream bg, ink text) it produces a black shadow on black text — looks crammed/dirty. On upcoming (magenta bg, cream text) the black shadow reads correctly.

**Fix:** Make the shadow conditional:
- Upcoming: keep `drop-shadow-[6px_6px_0_hsl(var(--ink))]` (black shadow on cream text — pops).
- Past: switch to `drop-shadow-[6px_6px_0_hsl(var(--magenta))]` (magenta shadow on ink text on cream bg — clean and on-brand).

## 4. Episode media gallery (upload photos/videos from past gigs, view on frontend)

**Schema (migration):**
Add a `media` column to `events`:
```sql
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb;
```
Shape: `[{ "type": "image" | "video", "url": "...", "caption": "..." }]`. Stored in the existing `event-posters` bucket (rename concept-wise to "event-media"; keep the bucket name to avoid migration risk).

**Edge function `admin-content`:**
- Extend the `events.upsert` payload handler to persist `media` (array passthrough). One-line addition.
- The existing `admin-upload-poster` already returns a `{ path, publicUrl }` for any image/video upload — reuse it for gallery items too. Increase the size cap to 50MB so short videos fit (still validated by file.type).

**Admin UI in `EventEditor` (in `src/pages/Admin.tsx`, ~line 793+):**
Add a new "GALLERY" section under the existing poster field:
- "+ ADD PHOTO/VIDEO" button → file picker (accepts `image/*,video/mp4,video/webm`)
- On select: POST to `admin-upload-poster`, get back `publicUrl`, append `{ type: file.type.startsWith("video") ? "video" : "image", url: publicUrl, caption: "" }` to `event.media`.
- Render existing media as a small grid: thumbnail (img or `<video muted playsInline>` poster frame), caption input, ✕ remove button, drag handles for reorder (simple up/down arrows to keep it lightweight).
- "Save event" already POSTs the row — `media` rides along.

**Frontend in `EventDetail.tsx`:**
Replace the deleted `RECAP_MEDIA` block with a new `EventGallery` block, shown only when `event.media?.length > 0` (and works for any event, not just episode-1):
```text
/ THE NIGHT, IN MOTION
[ media grid: 1col mobile, 2col md, 3col lg ]
   - image: <img loading="lazy"> with onError fallback
   - video: <video controls preload="metadata" playsInline> with poster from item.poster (optional)
caption underneath each (if present)
```
Click an image → opens lightbox modal (reuse the existing `Dialog` from `@/components/ui/dialog`).

**Backfill:** For `episode-1`, no auto-import — the user can upload the GIF + any new photos via the admin UI. The standalone GIF poster stays as the hero.

## 5. Files touched

- `src/pages/EventDetail.tsx` — drop `RECAP_MEDIA`/`RecapMedia`, inline PNG fallback in poster `onError`, `min-w-0`+`break-words`+responsive text on Fields, conditional shadow color, new `EventGallery` block reading `event.media`
- `src/pages/Admin.tsx` — extend `EventEditor` with gallery picker + thumbnails + reorder/remove + caption inputs; extend the row type to include `media`
- `supabase/functions/admin-content/index.ts` — pass `media` through on `events.upsert`
- `supabase/functions/admin-upload-poster/index.ts` — bump size cap to 50MB, accept `video/*` content types
- `supabase/migrations/*` — `ALTER TABLE events ADD COLUMN media jsonb NOT NULL DEFAULT '[]'`

No new dependencies. No connector changes. No new bucket. After deploy: open Admin → EVENTS → Episode 1 → upload a photo/video → save → visit `/events/episode-1` to see the gallery render under the poster.

