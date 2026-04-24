

# Fix: Drops loading, YouTube fallback, home GIF, page speed

## 1. Streetwear/Pets not loading on home — broken Shopify query

In `src/components/Drops.tsx` the pets query `"tag:pets OR tag:pet"` is malformed for Shopify Storefront search and throws, so the `Promise.all` rejects and both grids stay empty (silent except console).

**Fix:**
- Run the two queries independently (not `Promise.all`) so one failing doesn't kill the other. Use `Promise.allSettled`.
- Use a valid pets query: `tag:pets` (single tag). If empty, fall back to title-keyword filter we already have via `isPet()` against the general pool.
- For streetwear, pass `query: ""` (not `null`) so Shopify treats it as "no filter".
- Tighten the `isPet()` keyword list (keep "pet/cat collar/bandana/leash"; drop bare "cat" — every product on this store contains "cat").
- Add a visible error state so we see if Shopify actually returned nothing vs. errored.

## 2. YouTube videos grid — quota exceeded

Edge logs show `quotaExceeded` from YouTube Data API. Until quota resets at midnight PT, the grid will keep failing. Two-part fix:

- **In `src/components/Videos.tsx`:** when the function returns no videos, render a polished fallback that embeds the channel uploads playlist directly (no API call) using `https://www.youtube.com/embed/videoseries?list=UU<channelId minus first 2 chars>` — for channel `UCmtg0d8E2PXfs3vlQIcGwdQ` the uploads playlist is `UUmtg0d8E2PXfs3vlQIcGwdQ`. This shows real videos with zero quota cost. Plus the existing "Visit channel" button.
- **In `supabase/functions/youtube-videos/index.ts`:** extend in-memory cache TTL from 10 min to 12 hours and cache empty/error results too (so we don't burn quota retrying every page load). Add a stale-while-error guard: if API errors but we have any prior cached payload, return it.

## 3. Episode 1 GIF on home + animated thumbnail

Past-episode tile on home (`Events.tsx`) shows the static PNG because DB `poster_url = /episodes/episode-01.png`. User wants the GIF to play.

**Fix:**
- Migration: `UPDATE events SET poster_url = '/episodes/episode-01.gif' WHERE slug = 'episode-1'`. The 7.8MB GIF lives at that public path already.
- Keep the existing `onError` fallback in `Events.tsx` so if the GIF fails it still shows the "★ TITLE" lime tile.
- Add `loading="lazy"` (already present) so it only downloads when scrolled into view — protects initial paint speed.
- In `EventDetail.tsx` the `RecapMedia` already autoplays the GIF and silently falls back to the static PNG — no change.
- Keep the static PNG as the silent `onError` source via a small wrapper for the past-grid `<img>` so a gif failure swaps to PNG instead of the lime fallback (better UX).

## 4. Site slower — quick wins

Three real causes contributing to the slowdown after recent additions:

a. **Hero preloads 7 PNGs blocking the fade-in.** Some PNGs are heavy. Fix:
   - Lower the spinner safety timeout from 4s to 1.5s.
   - Only preload the 4 flank PNGs and the DJ SVG; let `catLeft`/`catRight` SVGs load with the natural `<img>` (they're tiny). Splits the critical wait.
   - Remove `decoding="sync"` from the PNG flank cats — sync decode blocks paint. Keep it only on the DJ SVG.

b. **Heavy upfront work on `/`.** `Drops` calls Shopify, `Videos` calls an edge fn, `Instagram` calls another, `EarlyAccess`/`Events` query DB — all on first paint. Fix:
   - Lazy-mount below-the-fold sections via React `lazy()` + `Suspense` in `src/pages/Index.tsx` for `Playlist`, `Drops`, `Instagram`, `Videos`, `EarlyAccess`. Hero/About/Events stay eager so first scroll has content.
   - Suspense fallback = a small skeleton block matching section height (avoids layout shift).

c. **GIF on home eats bandwidth.** `loading="lazy"` already gates it; we additionally swap to PNG via `onError` if the connection times out the GIF.

## 5. Files touched

- `src/components/Drops.tsx` — split queries with `allSettled`, fix pets query, tighter `isPet`, visible error fallback
- `src/components/Videos.tsx` — playlist-embed fallback when no API videos
- `supabase/functions/youtube-videos/index.ts` — 12h cache + cache errors + stale-while-error
- `src/components/Events.tsx` — past-grid `<img>` swaps gif → static PNG on error (not straight to lime)
- `src/components/Hero.tsx` — preload only critical assets, drop sync decode on PNGs, shorter safety timeout
- `src/pages/Index.tsx` — lazy-load below-the-fold sections with Suspense skeletons
- `supabase/migrations/*` — `UPDATE events SET poster_url = '/episodes/episode-01.gif' WHERE slug = 'episode-1'`

No new dependencies. No connector changes. After deploy: home shows the moving GIF tile, Drops fills with streetwear + pet products, Videos shows the channel playlist even while YouTube quota is exhausted, and first paint feels snappier.

