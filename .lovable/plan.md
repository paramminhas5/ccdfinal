# Plan: District scraper rewrite + wire Artists page to DB

Two fixes, both confirmed by inspection:

1. The `artists` table has 100 rows but **all rows are `status = 'pending'`**, and the only `SELECT` policy is `status = 'approved'` — so the DB is invisible to the public site. Meanwhile `src/pages/Artists.tsx` reads from the static `src/content/artists.ts` and ignores the table entirely.
2. District scraping via Firecrawl listing page has 0 hits. Confirmed the District sitemap exposes **4,613 event URLs** at `https://www.district.in/events/search-sitemap/event-detail-pages.xml`, and each event page embeds full schema.org `Event` JSON-LD inside the Next.js RSC payload — no JS rendering required.

---

## 1. District scraper — sitemap + JSON-LD

Rewrite the `district` source in `supabase/functions/curate-events/index.ts` so it no longer scrapes the listing page.

**Discovery (per city):**
- Fetch (cached for the run) `https://www.district.in/events/search-sitemap/sitemap-events.xml` → resolve to `event-detail-pages.xml` → extract all `<loc>` URLs (~4.6k).
- Filter URLs by:
  - city slug match in URL path (`-bangalore-`, `-bengaluru-`, `-mumbai-`, `-new-delhi-`, `-delhi-`, `-gurgaon-`, etc. — reuse `CITIES[city].aliases`)
  - music keyword allowlist in slug (`music`, `dj`, `techno`, `house`, `disco`, `electronic`, `rave`, `club`, `nightlife`, `concert`, `live`, plus known venue tokens)
  - exclude obvious non-music tokens (`trek`, `workshop`, `kids`, `comedy`, `standup`, `trampoline`, `scuba`, `paint`)
- Cap to top N (e.g. 25 per city per run) to stay within Firecrawl/runtime budget.

**Per-event extraction (no Firecrawl):**
- Plain `fetch(url)` with a desktop User-Agent.
- Extract JSON-LD with a regex tolerant of the RSC envelope:
  - Match `"@type":"Event"...` payload, then find balanced JSON by scanning braces. Unescape (`\"` → `"`, `\\` → `\`, `\n` → space).
  - `JSON.parse` and read `name`, `startDate`, `location.name` / `location.address`, `image`, `description`, `offers.url` (fallback to source URL).
- Map to the existing `curated_events` row shape (title, venue, event_date, event_time, url, source=`district`, blurb, image_url, city, genre — derive genre tags from slug/description).

**Fallback path:** if JSON-LD extraction fails for a URL, fall through to the existing Firecrawl `scrape` call (markdown) so we degrade gracefully instead of returning 0.

**Observability:** add per-source counters to the existing `runs[]` response: `{ source, city, discovered, kept, inserted, errors[] }`.

---

## 2. Wire Artists page to the `artists` table

The static dataset stays as a one-time seed source; the page reads live from Supabase.

**Migration (one-off seed + access):**
- Insert all 100 rows from `src/content/artists.ts` into `public.artists` with `status = 'approved'`, `source = 'seed'`, generating `slug` from name. Use `ON CONFLICT (slug) DO UPDATE` so re-running is safe (need a unique index on `slug` — add it if missing).
- No RLS change needed; the existing "Anyone can read approved artists" policy already covers the page.

**`src/pages/Artists.tsx` changes:**
- Replace the `ARTISTS` import with a `useEffect` + `supabase.from('artists').select('*').eq('status','approved').order('name')`.
- Map DB columns (`based_city`, `from_city`, `genres`, `festivals`, `instagram`, `website`, `booking_email`, `photo_url`, `bio`) onto the existing card/drawer UI. Drop fields the table doesn't have (`tier`, `rank`, `priceRange`, `boilerRoom`, `why`) — derive what's reasonable from `bio`/`festivals` (e.g. Boiler Room badge if `festivals` contains "Boiler Room"); remove tier/rank filters and sort, keep genre / city / search.
- Loading + empty states.
- Keep `src/content/artists.ts` only as the migration source; mark with a comment that runtime reads from DB.

**Submission flow already exists** (`artist_submissions` table + insert policy) — out of scope here, but the page can keep linking to a future submit form.

---

## Technical details

- Files to edit: `supabase/functions/curate-events/index.ts`, `src/pages/Artists.tsx`.
- Migration: insert seed + add `CREATE UNIQUE INDEX IF NOT EXISTS artists_slug_key ON public.artists (slug);`.
- No new secrets, no schema columns added.
- Edge function redeploys automatically on save.
- After deploy: trigger `curate-events` once with `{ source: "district", city: "all" }` from Admin to backfill.

```text
District flow
─────────────
sitemap.xml ─► event-detail-pages.xml ─► [4.6k URLs]
                                          │
                       filter by city + music keywords
                                          │
                                  top N URLs / city
                                          │
                          fetch(url) ─► regex JSON-LD ─► Event{}
                                          │
                                upsert into curated_events
```
