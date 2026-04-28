# Curated Events — Sprint 1 + Sprint 2

## The diagnosis

The DB only has **9 rows**, all from `skillboxes`, 4 of them with `city = NULL`, **0 with images**, **0 featured**. Causes:

1. **Cron is wrong**: only runs weekly Mondays 02:30, calls `curate-events` directly with default body `{source:"skillboxes", city:"bangalore"}` — that's why only Skillbox/Bangalore rows exist.
2. **No image extraction**: AI tool schema in `curate-events/index.ts` doesn't request `image_url`, and Firecrawl is only asked for `markdown` (not metadata).
3. **City NULLs**: pre-existing rows from before `city` was added to the upsert payload — never backfilled.
4. **Nothing featured**: `is_featured` defaults to `false` and nothing ever flips it.
5. **No dedupe across sources**: same event on Insider + Skillbox = two cards.



### 1. Fix the cron

Replace `curate-events-weekly` with a daily 02:00 UTC (07:30 IST) job that hits `scheduled-curate` (the orchestrator that loops all sources × cities and prunes stale rows).

```sql
SELECT cron.unschedule('curate-events-weekly');
SELECT cron.schedule(
  'scheduled-curate-daily', '0 2 * * *',
  $$ SELECT net.http_post(
       url := '<project>/functions/v1/scheduled-curate',
       headers := jsonb_build_object('Authorization','Bearer <service_key>','Content-Type','application/json'),
       body := '{}'::jsonb) $$);
```

### 2. Pull images + better metadata in `curate-events`

- Add `screenshot` + `metadata` to the Firecrawl scrape formats so we get `og:image`.
- Add `image_url` (and explicit `city` echo) to the AI tool schema; instruct AI to prefer the og:image / first hero image URL it sees in the markdown.
- Fall back to `firecrawl.metadata.ogImage` if AI returns empty.
- Persist `image_url` on the upsert row.

### 3. Backfill / clean existing rows

- One-shot SQL: `UPDATE curated_events SET city='bangalore' WHERE city IS NULL AND source='skillboxes';`
- Force-run `scheduled-curate` once via `curl_edge_functions` to seed Mumbai, Delhi + all sources with images.

### 4. Auto-feature logic

After each `scheduled-curate` run, in the orchestrator:

- Clear `is_featured` on all auto rows (keep manual/community untouched).
- Pick top 2 per city by: has `image_url` + soonest future `event_date` + non-null venue → set `is_featured = true`.

### 5. URL dedupe across sources

Add a uniqueness layer on `(lower(title), event_date, lower(coalesce(venue,'')))` — when collision, prefer the row with an image, then prefer Skillbox/Insider over aggregators. Implement as a post-upsert cleanup query in `scheduled-curate`.



### 6. Manual seed of "CCD Picks"

Insert ~6 hand-picked rows with `source='manual'` so the magenta CCD-pick cards aren't empty on day one. (You give me the list, or I seed plausible BLR placeholders you can edit in Admin.)

### 7. Admin: feature toggle + image override

`Admin.tsx` already lists curated events — add:

- ⭐ toggle button per row → calls `admin-curated-events` to flip `is_featured`.
- Image URL text input per row (override broken/missing scrapes).
- "Run scraper now" button → POSTs to `scheduled-curate` with admin password.

### 8. Empty-state copy fix

`CuratedEvents.tsx` says "refreshed weekly" — change to "refreshed daily" once cron is daily.

### 9. Genre normalization

AI returns inconsistent genres ("techno", "Techno", "tech-house"). Lowercase + map to the 8 filter buckets server-side before insert so the genre filter actually matches things.

## Technical notes

- `scheduled-curate` already prunes events older than 30 days and skips `is_featured` rows — keep that.
- `curate-events` `extractWithAI` truncates page to 6000 chars — bump to 9000 so og:image lines aren't cut off.
- pg_cron + pg_net are already enabled (existing `curate-events-weekly` proves it).
- All edits are in `supabase/functions/curate-events/index.ts`, `supabase/functions/scheduled-curate/index.ts`, `supabase/functions/admin-curated-events/index.ts`, `src/pages/Admin.tsx`, `src/components/CuratedEvents.tsx`, plus 2 SQL ops (cron reschedule + city backfill) and one manual scraper invocation.

## Out of scope (flag for later)

- Per-city featured carousels.
- Saving event to user's calendar.
- Genre auto-tagging via AI re-classification of historical rows.

Approve and I'll execute end-to-end in one pass.