## What's actually wrong

I tested the YouTube edge function — it's returning:

> "The request cannot be completed because you have exceeded your quota."

So `youtube-videos` is failing for fresh `?max=` calls. The **only** reason `WATCH THE TAPES.` shows even one tile is because the `max=6` cache slot still has stale data from earlier; the `/videos` page (which calls `?max=50`) hits a separate cache slot that quota-failed and only got 1 video before the cap. That's why home shows some, all-videos page shows one.

Two real problems to solve:
1. **YouTube quota** keeps getting blown — and there's no admin override. We need a backend video table so admin can curate manually with YouTube links, and the API becomes a *fallback* not the source of truth.
2. **Instagram handle is wrong** in Footer + brand.json (`catscandance` instead of `catscan.dance`). YouTube channel link in Footer is also wrong (`@catscandance` vs `@thesecatscandance`).

---

## Plan

### 1. Admin-managed videos (CMS)

- New table `site_videos` with: `id`, `youtube_id`, `title`, `thumbnail_url` (nullable — auto-derive from youtube_id if blank), `published_at`, `sort_order`, `is_featured`, `created_at`.
- RLS: public SELECT, no public writes.
- New edge function `admin-videos` (password-gated like other admin-* functions) for create/update/delete/reorder.
- Admin will also accept a full YouTube URL (`youtu.be/…`, `watch?v=…`, `/shorts/…`) and parse out the `youtube_id`.

### 2. Admin UI — new "VIDEOS" section in `src/pages/Admin.tsx`

- Paste a YouTube URL → auto-fetches title + thumbnail (via existing `youtube-videos` pattern, or fall back to oEmbed `https://www.youtube.com/oembed?url=…&format=json` which has no quota).
- Override title, toggle "featured", drag/reorder, delete.

### 3. Rewrite `youtube-videos` edge function as a hybrid

Order of resolution:
1. Read from `site_videos` table (admin curated). If admin has rows, use them as the source of truth.
2. If empty AND quota available, fall back to YouTube Data API.
3. If quota exhausted, fall back to **YouTube RSS feed** `https://www.youtube.com/feeds/videos.xml?channel_id=UCmtg0d8E2PXfs3vlQIcGwdQ` — this is free, unlimited, returns latest ~15 videos with title/thumbnail/published date. Parse the XML server-side.
4. Cache successful responses for 12h, errors for 30m (already in place).

This means `WATCH THE TAPES` always shows at least the latest 3, and `/videos` always shows the full list — quota or no quota.

### 4. Frontend

- `src/components/Videos.tsx` (homepage): show **last 3** (currently shows up to 3 already, but with the API broken it falls back to 1). Once edge function is fixed, this works.
- `src/pages/Videos.tsx`: already paginated for 50 — the `max=50` request will work once the function falls back to RSS/admin table.

### 5. Fix wrong handles

- `src/components/Footer.tsx`: change Instagram link from `instagram.com/catscandance` → `instagram.com/catscan.dance`, and YouTube link from `@catscandance` → `@thesecatscandance`.
- `public/brand.json`: same two fixes (`instagram` and `youtube` URLs).
- `src/components/SEO.tsx`: Twitter handles — leave `@catscandance` as-is unless you confirm Twitter is also `@catscan.dance` (Twitter doesn't allow dots in handles, so this is probably fine).

---

## Files to change

- `supabase/migrations/...` — new `site_videos` table + RLS
- `supabase/functions/admin-videos/index.ts` — new (admin CRUD)
- `supabase/functions/youtube-videos/index.ts` — rewrite with table + RSS fallback
- `src/pages/Admin.tsx` — new VIDEOS tab/section
- `src/components/Footer.tsx` — fix Instagram + YouTube links
- `public/brand.json` — fix Instagram + YouTube URLs

No changes needed to `Videos.tsx` (home) or `pages/Videos.tsx` — they'll start working once the edge function returns ≥3 videos.

Approve and I'll execute.