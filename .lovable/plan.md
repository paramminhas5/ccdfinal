# Why junk events still get in

The current filter has two leaks:

1. **District** never URL-filters out non-music: `filterDistrictUrlsForCity` only requires a music keyword to be *present*, but lots of District slugs contain `music` or `club` while actually being Bollywood/Sufi/drone-meditation nights. JSON-LD then passes because `deriveDistrictGenres` runs on description but it's just additive — an event with **no** detected genre still gets inserted.
2. **AI extractor** for Skillbox/Insider/HighApe/BMS is told to reject Bollywood etc., but the prompt is advisory and the model often returns the event anyway. There is no post-AI sanity check on title/blurb.

Also the deny list is missing common offenders the user explicitly called out: `drone`, `meditation`, `sound-bath`, `sound-healing`, `tabla`, `flute`, `sitar`, `fusion-classical`, `harmonium`, `bhakti`, `satsang`, `devotional`, `kirtan-night`, `raga`, `gurbani`.

---

# Fix

## 1. Expand `REJECT_KEYWORDS` (`supabase/functions/curate-events/index.ts`)

Add: `drone`, `drone-meditation`, `meditation`, `sound-bath`, `sound-healing`, `sound-journey`, `breathwork`, `tabla`, `flute`, `sitar`, `santoor`, `harmonium`, `bhakti`, `satsang`, `devotional`, `raga`, `gurbani`, `fusion-classical`, `aarti`, `puja`, `mantra`, `chanting`, `tantra`, `cacao`, `ecstatic-dance` (the wellness kind — ironically not a club night), `silent-disco-yoga`, `morning-rave`, `sober`, `bhakti-night`, `singer-songwriter-night` (often acoustic-Bollywood), `bollywood-night`, `bolly`, `retro-bollywood`, `90s-bollywood`, `punjabi-night`, `desi-night`, `arijit`, `kishore`, `mohammed-rafi`.

## 2. Make the music gate strict, not additive

Replace `urlPassesMusicFilter` so that:
- it rejects on **any** keyword in the expanded `REJECT_KEYWORDS`
- it requires at least one of a smaller **HARD_MUSIC_KEYWORDS** set: `techno, house, disco, dnb, drum-and-bass, jungle, garage, electronic, edm, rave, club-night, nightlife, boiler, b2b, warehouse, after-hours, afterhours, label-night, sound-system, indie, rock, jazz, gig, live-band, concert, sundowner` (drop loose tokens like `music`, `party`, `set`, `showcase` which were letting everything through)

## 3. Add a post-extraction validator and use it everywhere

New helper `isAcceptableMusicEvent({ title, blurb, url, genres }): boolean` that:
- Rejects if any expanded reject keyword appears in `title + blurb + url`
- Accepts only if **either** `genres.length > 0` **or** any hard music keyword appears in `title + blurb`

Wire it into:
- `runDistrict` right before the `upsert` (currently no such check — this is the main District leak)
- The AI path right after `extractWithAI` returns, before `tryAdd`

## 4. Strengthen the AI extractor

In `extractWithAI` system prompt:
- Add the new reject categories (drone meditation, sound bath, devotional, Bollywood nostalgia nights, Punjabi/desi nights, classical instrumental, wellness/cacao)
- Require the model to set `genre` to a non-empty array from the allowed buckets, otherwise return `events: []`
- Add a one-shot example pair (accept: a techno gig; reject: a "Drone Meditation Sound Journey")

## 5. One-time purge of existing junk

Add a SQL migration that deletes rows from `curated_events` where `lower(title || ' ' || coalesce(blurb,''))` matches any of the new reject keywords, or where `jsonb_array_length(genre) = 0` AND title/blurb contains none of the hard music keywords. Keeps `source IN ('manual','community')` and `is_featured = true` rows untouched.

## 6. Admin UX nicety (optional, small)

In `src/pages/Admin.tsx` curated-events table, add a one-click "Reject (delete + remember)" button that just calls the existing delete. A persistent denylist of titles/urls would be larger scope — flag it only if you want it.

---

# Files touched

- `supabase/functions/curate-events/index.ts` — items 1–4
- `supabase/migrations/<new>.sql` — item 5
- `src/pages/Admin.tsx` — only if you want item 6

No new secrets, no schema changes, no scheduled-curate changes. Edge function redeploys on save; trigger a refresh of all cities from Admin after deploy and the lists should be clean.
