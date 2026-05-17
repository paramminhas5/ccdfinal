## Revised scope

1. **Wipe `curated_events`** clean.
2. **Promoters system** (new) — table, Admin tab, public page `/promoters`. The curator (and the auto-crawler) only ever pull from trusted promoters going forward.
3. **Top 10 artists**, no tiers, no Boiler-Room emphasis. Selection criterion: **active gigging volume across credible festivals/circuits** (Magnetic Fields, Ziro, DGTL, Lolla, Echoes of Earth, Krunk, international labels).
4. **Per-artist portfolio pages** at `/artists/:slug`.

---

## Part 1 — Curated events purge

`DELETE FROM curated_events;` (no filter — fresh slate). Cron `scheduled-curate` paused via a `site_settings.theme.curate_paused` flag until you've approved the promoter whitelist.

## Part 2 — Promoters

New table `public.promoters`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `slug` | text unique | url-safe |
| `name` | text | "Interbeing Agency" |
| `city` | text | primary base |
| `cities` | text[] | all cities they operate in |
| `blurb` | text | 1-paragraph what-they-do |
| `genres` | text[] | techno, house, etc. |
| `instagram` | text | handle |
| `website` | text | |
| `booking_email` | text | |
| `logo_url` | text | stored in new `promoter-logos` bucket |
| `trusted` | boolean default false | gate for crawler |
| `crawl_urls` | jsonb default `'[]'` | array of `{label, url, kind: 'instagram'\|'website'\|'district'\|'skillbox'\|'insider'}` — the sources `curate-events` will scrape |
| `status` | text default 'approved' | for future submissions flow |
| `created_at`, `updated_at` | timestamptz | |

RLS: public read where `status='approved'`; writes only via admin edge function.

### Seed promoters (trusted = true)

- **Interbeing Agency** (Mumbai / pan-India)
- **Somad** (Bengaluru) — techno community
- **Paradise** (Goa) — techno parties
- **Paradisco** (Goa / pan-India) — disco / house
- **Social Indiranagar** (Bengaluru) — Social venue, multi-genre gigs

Plus suggested additions (you can untrust any in Admin):

- **Krunk** (Mumbai) — long-running underground booking agency
- **Qilla Records** (Delhi) — Kohra's label, residencies
- **Wild City** (Delhi) — editorial + bookings
- **Boxout.fm** (Delhi) — radio + parties
- **Magnetic Fields** (Alsisar) — festival
- **Echoes of Earth** (Bengaluru) — festival
- **Sundown Project** (Goa / Bengaluru)
- **Auro Kitchen & Bar** (Delhi)
- **Bhavishyavani Future Soundz** (Mumbai)
- **Mixtape** (Delhi)
- **Anti Social** (Mumbai/Delhi)

(All seeded `trusted=true` so they're in the crawler pool from day one — you'll vet from Admin.)

### Public page `/promoters`

Grid of promoter cards: logo, name, city, genres, IG/website/email links, blurb. Filter by city + genre. Each links to `/promoters/:slug` (simple detail page: bigger blurb, list of their upcoming curated events).

### Admin → PROMOTERS tab

CRUD: name, slug, cities, genres, blurb, IG, web, email, logo upload, `trusted` toggle, `crawl_urls` editor (add/remove rows).

### Curator rewire (`curate-events` edge fn)

Before scraping, load `promoters` where `trusted=true` and union their `crawl_urls` with the existing hardcoded SOURCES. Existing music/reject filters stay (already strict).

## Part 3 — Artists schema additions

Add to `public.artists` (no tier column):

| Column | Type | Purpose |
|---|---|---|
| `fee_min_inr` | integer | low end of estimated fee |
| `fee_max_inr` | integer | high end |
| `fee_currency` | text default `'INR'` | `'USD'`/`'GBP'` for foreign-based |
| `why` | text | "Why this artist matters" paragraph |
| `gallery` | jsonb default `'[]'` | array of `{url, caption}` |
| `videos` | jsonb default `'[]'` | array of `{youtube_id, title}` |
| `featured` | boolean default false | for homepage rotations |

No `tier`, no `boiler_room` column. Festival count / volume is captured via the existing `festivals[]` array — order artists by `array_length(festivals,1) desc` where useful, never display a numbered ranking.

## Part 4 — Seed Top 10 artists

Picked by **breadth of recent bookings** (festivals + circuit gigs), not Boiler Room. All `status='approved'`, `featured=true`:

1. **Kohra** — Delhi · techno · Magnetic Fields, DGTL, Echoes of Earth, Qilla Records founder
2. **Sartek** — Delhi · folk house / progressive · Revealed Recordings, opened for Guetta/Garrix/Tiesto
3. **Anyasa (Anish Sood)** — Goa · progressive / Anjunadeep · DGTL, Echoes of Earth
4. **Lost Stories** — Mumbai · folk-electronic · DGTL, Lolla, international circuit
5. **Dualist Inquiry** — Goa · indie electronic · Echoes of Earth, Lolla 2024, Ziro 2025
6. **Sandunes** — Mumbai · live electronic · NH7, Apple Music Up Next 2022, RBMA
7. **Karan Kanchan** — Mumbai · hip-hop/electronic · Lolla 2024 curated set
8. **Indo Warehouse** — NYC (Indian-origin) · Indo House · Coachella 2025 both weekends, Hï Ibiza
9. **Sid Vashi** — Mumbai · jazz-electronic · Lolla 2025, OML
10. **Dot Dat** — Goa · techno · Echoes of Earth 2025, DGTL

Each row: full bio (built from "Why" + festivals), genres, festivals, IG, website, booking email, fee range, photo. Photos pulled from press URLs into `artist-photos` storage.

## Part 5 — Portfolio pages

New route `/artists/:slug` → `ArtistDetail.tsx`. Layout in brutalist style matching `Artists.tsx`:

```text
┌────────────────────────────────────────┐
│ NAV                                    │
│ Hero photo (full-bleed) + name + city  │
│ Genre chips · Festivals played         │
├──────────────┬─────────────────────────┤
│ BIO (long)   │ FEE RANGE               │
│              │ MANAGER / BOOKING       │
│              │ INSTAGRAM / WEBSITE     │
├──────────────┴─────────────────────────┤
│ VIDEOS — YouTube embed grid            │
│ GALLERY — masonry                      │
│ BOOK VIA CATS CAN DANCE — CTA dialog   │
│ MORE ARTISTS — 3 cards (same city/genre)│
└────────────────────────────────────────┘
```

- SEO `<MusicGroup>` JSON-LD per artist.
- `Artists.tsx` card click → `<Link to="/artists/:slug">` instead of modal (modal stays as quick-peek on hover-icon if you want; default behavior = nav).
- All 10 slugs added to `public/sitemap.xml`.

## Part 6 — Admin extensions

`src/pages/Admin.tsx`:
- New **PROMOTERS** tab (CRUD + trust toggle + crawl URLs).
- ARTISTS tab: editors for `fee_*`, `why`, `gallery`, `videos`, `featured`.
- CURATED EVENTS tab unchanged; add "🚨 PURGE ALL" button + "Resume crawler" toggle (writes `site_settings.theme.curate_paused`).

---

## Technical notes

- Migration: 1 file for `promoters` table + RLS + artist column additions + storage bucket `promoter-logos` (public).
- Data seeds: separate insert tool call (10 artists + 16 promoters).
- New edge fn `admin-promoters` (CRUD with `x-admin-password` like other admin fns).
- `curate-events` reads `promoters.crawl_urls` where `trusted=true` and merges them with hardcoded source list — keeps all existing reject/hard-music filters.
- Photos: I'll grab one official press shot per artist (festival press kit / IG profile pic) → `artist-photos/<slug>.jpg`. Where nothing usable exists, generate a stylized typographic placeholder (brutalist, never a generic silhouette).

## Out of scope

- Promoter self-submission form (we can add later, mirroring `artist_submissions`).
- Rewriting the curate-events filter logic (already strict per last pass).
- Booking workflow beyond existing `booking_requests` OTP flow.
