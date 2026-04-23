
Fix the two problem areas in a tighter, cheaper way: make curated crawling work source-by-source with direct source pages, and harden the YouTube playlist flow so playlist URLs parse correctly and render with a safe fallback.

## 1. Curated events: stop crawling “everything”, start with one precise source

Current state:
- `curated_events` is empty.
- The crawl logs show some extraction happening, then the function shuts down before the flow finishes.
- The current `curate-events` function loops all sources in one request and only upserts at the end, so a slow/failed later source can leave the table empty.

Plan:
- Refactor `supabase/functions/curate-events/index.ts` to support a request body like:
  - `source?: "sortmyscene" | "insider" | "skillboxes" | "district" | "highape" | "bookmyshow"`
  - `limit?: number`
  - `mode?: "single" | "all"`
- Default admin refresh to `mode: "single"` with one source only.
- Start with just one source first: `sortmyscene` (public page content is easier to extract and cheaper than broad web search).
- Replace broad search-first crawling with a source adapter:
  - fetch one known source listing page
  - extract only relevant Bangalore/Bengaluru dance/electronic event links
  - scrape only the top few candidate event pages
  - send smaller, cleaner text to AI
- Hard-cap cost:
  - max 1 listing page
  - max 4–6 candidate event pages
  - max 5 saved events per run
- Upsert immediately after each source instead of collecting all events and writing once at the end.
- Return detailed status per run:
  - `source`
  - `listingResults`
  - `candidateLinks`
  - `scrapedPages`
  - `extracted`
  - `upserted`
  - `errors`

## 2. Make the crawler precise instead of noisy

In `supabase/functions/curate-events/index.ts`:
- Remove the current “search the web for source keywords” approach for the first-source flow.
- Add source-specific extraction rules:
  - require Bengaluru/Bangalore match
  - require event-like fields: title + URL + date
  - prefer dance / electronic / techno / house / underground
  - reject generic city pages, blogs, and non-event collection pages
- Tighten AI prompt so it only returns real bookable events, not category pages or venue homepages.
- Deduplicate by URL before save.

Result:
- lower Firecrawl usage
- faster runs
- easier debugging
- no more “nothing shows up because the whole batch timed out”

## 3. Admin: refresh one source first, then expand later

In `src/pages/Admin.tsx` curated tab:
- Add a source dropdown next to `REFRESH FROM WEB`
- First run should call:
  - `source: "sortmyscene"`
  - `mode: "single"`
  - `limit: 5`
- Show a clearer result panel after refresh:
  - “Listing found X candidates”
  - “Scraped Y pages”
  - “Saved Z curated events”
- Keep “crawl all sources” out of the primary flow for now.
- After one source is stable, add the other sources one at a time.

## 4. Curated events frontend: always show what was saved

In `src/components/CuratedEvents.tsx`:
- Keep the section visible even when empty.
- Prefer rows ordered by:
  - featured first
  - upcoming dates next
  - newest manual/crawled rows after
- If only a few rows are available from the first source, still render them immediately.

## 5. YouTube playlist: fix parsing + use the official playlist embed route

Current risk:
- The admin parser accepts YouTube input loosely.
- A full watch URL or mixed URL may save an ID that works for a link but not for an embeddable playlist iframe.
- The current embed route change did not resolve the issue.

Plan in playlist flow:
- In `src/pages/Admin.tsx`, harden `extractPlaylistInfo()` for YouTube:
  - accept playlist URLs with `?list=...`
  - accept copied playlist IDs directly
  - reject video-only YouTube URLs that do not contain a playlist ID
  - show a clear toast like “That’s a video URL, not a playlist URL”
- In `src/components/Playlist.tsx`, switch YouTube playlist embeds to the official playlist iframe route:
  - `https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID`
- Add a small YouTube-only fallback state:
  - if the playlist embed fails or the ID is invalid, show a styled card with
    - playlist title
    - “Open on YouTube”
    - helpful text instead of a blank black iframe
- Keep Spotify and SoundCloud behavior unchanged.

## 6. Safer rollout order

Implementation order:
1. Refactor `curate-events` to single-source mode with per-source save
2. Update Admin curated tab to refresh one source and show crawl stats
3. Verify curated rows appear on `/events`
4. Fix YouTube playlist parsing in Admin
5. Switch playlist embed route and add visible fallback
6. Only after the first source works reliably, add the next sources one by one

## 7. Files to update

- `supabase/functions/curate-events/index.ts`
  - single-source mode
  - source adapters
  - direct-page crawling
  - per-source upserts
  - tighter filters and cheaper limits
- `src/pages/Admin.tsx`
  - curated source selector
  - better crawl result UI
  - stricter YouTube playlist parsing/validation
- `src/components/CuratedEvents.tsx`
  - stable render of newly saved rows
- `src/components/Playlist.tsx`
  - official YouTube playlist embed route
  - visible fallback for invalid/unembeddable playlists

## Technical details

```text
Admin CURATED tab
   ↓
refresh single source: sortmyscene
   ↓
curate-events(source=sortmyscene, mode=single, limit=5)
   ↓
fetch source listing page
   ↓
extract candidate event links
   ↓
scrape top 4–6 event pages
   ↓
AI extracts only Bengaluru dance events
   ↓
upsert immediately into curated_events
   ↓
frontend /events shows saved rows
```

No database schema change is required for this iteration.
