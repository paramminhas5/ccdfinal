## Goal
Grow the artist roster to ~50 top India-relevant electronic acts and auto-fill each one with correct photo, contacts, bio, genres, festivals and socials. Hybrid pipeline: Firecrawl for photos + contacts, Lovable AI (Gemini) for bios. Triggerable as a bulk run from Admin and per-artist on demand.

## 1. Seed list (~40 new + 10 existing = ~50)
Curated India-relevant electronic / techno / house / underground / live-electronic acts. No tiering, no ranking. Already in DB stays.

New additions (slug, name):
- Arjun Vagale, Kohra, BLOT!, Nucleya, Sandunes, Dualist Inquiry, Lost Stories, Karan Kanchan, Sid Vashi, Anyasa, Indo Warehouse, Dot Dat, Sartek *(existing)*
- Stalvart John, Zequenx, Hamza Rahimtula, Audio Units, Kumail, Tarqeeb, FILM, Mosillator, OX7GEN, Bullzeye, _RHL, Spryk, Komorebi, Su Real, Tech Panda & Kenzani, Madstarbase, Begum, Akash Iyer, Aqua Dominatrix, Murthovic, Sickflip, Naina, Ananya Birla *(remove if pop)* → replace with Praveen Achary, Rohan Kapoor, Janaan, Stain, Skip., Calm Chor, MojoJojo, Jordan Lewis, Tanmay Bhat *(remove)* → Audio Units already listed; final list trimmed to underground/electronic only at insert time.

Final list will be vetted to strictly: techno, house, deep/melodic, bass, breakbeat, downtempo, electronica, live-electronic. No Bollywood, no pop, no bhajan, no commercial EDM-only acts.

## 2. Schema additions (small)
```sql
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS enrichment_log jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz;
```
Values: `pending | enriching | enriched | failed`.

`booking_email` default fallback string: `"book@catscan.dance"` (the "via Catscan" route) — applied only when enrichment can't find one.

## 3. Edge function: `enrich-artists`
Hybrid pipeline, runs server-side only.

Input: `{ artist_id?: string, all?: boolean, limit?: number }` (admin-only — requires `x-admin-token` matching `ADMIN_PASSWORD`).

Per artist:
1. **Firecrawl `/scrape`** the artist's Instagram URL → `formats: ['markdown','json']` with a JSON schema pulling `{ display_name, bio, website, booking_email, manager_email }`.
2. **Firecrawl `/search`** `"<artist name> booking contact site:ra.co OR site:instagram.com"` → take top result, scrape contacts.
3. **Firecrawl `/scrape`** their official website (if found) with `formats: ['json','screenshot']` → extract `booking_email`, `manager_email`, hero image URL.
4. **Photo**: download best image (IG profile pic / press photo / site hero) → upload to `artist-photos/<slug>.jpg` → set `photo_url`.
5. **Lovable AI** (`google/gemini-3-flash-preview`) — given the scraped markdown + name + genres, produce a 120–180 word bio + `why` (one-line hook) + `genres[]` + `festivals[]`. Strict JSON via tool-calling schema.
6. Fallbacks: missing `booking_email` → `"book@catscan.dance"`; missing `manager_email` → `null`.
7. Update row, set `enrichment_status='enriched'`, `enriched_at=now()`, store raw scrape excerpts in `enrichment_log`.

Rate limit: 1 artist / 2s, max 6 concurrent off (sequential is fine for ~50). Skips rows already `enriched` unless `force=true`.

## 4. Admin UI (`src/pages/Admin.tsx`, ARTISTS tab)
- **"Enrich all" button** → calls `enrich-artists?all=true`. Shows toast + polls `enrichment_status` counts every 4s.
- **"Force re-enrich" toggle** in the same dialog.
- **Per-row "✨ Enrich" button** on every artist card → calls `enrich-artists?artist_id=...`.
- **Status badge** per row: `pending / enriching / enriched / failed` with last-run timestamp.
- New **"Seed roster"** button: inserts the ~40 missing artists with name+slug+IG handle only, then user can hit "Enrich all".

## 5. Frontend display
No new pages. `ArtistDetail` and `Artists` already render `photo_url`, `bio`, `why`, `genres`, `festivals`, `booking_email`, `instagram` — once enrichment fills the columns they appear automatically.

## Technical notes
- **Secrets used**: `FIRECRAWL_API_KEY` (already linked via Firecrawl connector), `LOVABLE_API_KEY` (already present), `ADMIN_PASSWORD` (already present).
- **No new secrets needed.**
- Firecrawl: server-only via `Authorization: Bearer ${FIRECRAWL_API_KEY}` REST v2.
- Lovable AI: gateway, `model: google/gemini-3-flash-preview`, JSON tool-call output for bio/why/genres/festivals.
- Storage: `artist-photos` bucket (already public).
- Images normalized to ≤1200px JPEG before upload.
- Function deploys with `verify_jwt = false` and uses `x-admin-token` header check.

## Out of scope
- Re-curating `curated_events` (still paused).
- Promoter enrichment (separate pass — can copy this pipeline to `enrich-promoters` later).
- Adding genres beyond electronic/underground.
- Booking workflow changes.
