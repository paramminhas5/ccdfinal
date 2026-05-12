# Artists Overhaul + Booking + Submissions

## 1. Artists → Database (no ranks, no tiers)

New tables:
- `artists` — public-readable when `status = 'approved'`
  - `id`, `slug`, `name`, `members`, `from_city`, `based_city`, `genres text[]`, `bio text`, `photo_url text`, `instagram`, `soundcloud`, `bandcamp`, `spotify`, `website`, `booking_email`, `manager_email`, `festivals text[]` (free list of fests/big parties), `labels text`, `status text` (`pending|approved|rejected`), `source text` (`seed|submission|scrape`), `created_at`, `updated_at`
- `artist_submissions` — public can INSERT, only admin reads. Same shape + `submitter_email`, `submitter_role` (self/manager/fan), `notes`.
- `booking_requests` — logs every Book-button request: `artist_id`, `requester_email`, `requester_phone?`, `purpose`, `verified_at`, `revealed_at`, `forward_requested boolean` (CCD contacts on their behalf), `created_at`. Public can insert via edge function only.
- `booking_otp_codes` — `email`, `code_hash`, `expires_at`, `consumed_at`, `attempts`. Service-role only.

RLS:
- `artists`: `SELECT` where `status='approved'` for anon; writes via service role only.
- `artist_submissions`: anon `INSERT` allowed; no `SELECT` for anon.
- Booking tables: no anon access; everything goes through edge functions.

Drop `src/content/artists.ts` from `Artists.tsx` and read from Supabase. Remove tier/rank/Boiler-Room UI. Filters become: search, city, genre chips, festival chip. Sort: A–Z or recently-added.

## 2. Seed + scrape pipeline (Firecrawl)

New edge function `artist-enrich` (admin-only, password-gated like other admin fns):
- Input: `artist_id` or `name`.
- Steps: Firecrawl `search` for `<name> dj india site:ra.co OR site:soundcloud.com OR site:instagram.com`, then `scrape` the top 1–3 results with `formats: ['markdown','links','json']`. Parse out: bio paragraph, photo (first og:image), soundcloud/bandcamp/instagram/website URLs, festivals mentioned.
- Returns a draft patch; never auto-publishes. Admin reviews + approves.

New Admin tab **ARTISTS**:
- Sub-tabs: `Approved`, `Submissions`, `Drafts`.
- Per row actions: `Enrich with Firecrawl`, `Edit`, `Approve`, `Reject`, `Delete`.
- Bulk "Enrich all empty" button (sequential, with rate-limit pause).
- Photo: upload to a new public `artist-photos` storage bucket OR paste URL.

Seeding: import existing 100 names from `src/content/artists.ts` once via a one-off insert (status `pending`, source `seed`, NO bio/socials/photo). Then enrich + approve in admin. This avoids shipping hallucinated data.

### How to find more relevant artists (non-code answer surfaced in admin)
A small "Sources" panel on the Artists tab linking to: RA India artist directory, Boiler Room India tag, Wild City roster pages, Magnetic Fields / Sunburn / Echoes of Earth past lineups, Krunk / Qilla / Consolidate / Knocturnal label rosters, Sofar Sounds India, NH7 archives. Admin can paste any URL into "Discover from URL" → Firecrawl `map` + `scrape` extracts artist names → batch-creates `pending` rows.

## 3. "Add yourself as artist" button

Public form on `/artists` (modal):
- Fields: name, members, from/based city, genres (chips), bio, photo (upload to `artist-photos` bucket via signed URL or paste URL), instagram/soundcloud/bandcamp/spotify/website, booking_email, manager_email, festivals (comma list), submitter_email, submitter_role.
- Submits to `artist_submissions` (anon insert allowed).
- Also enqueues a transactional notification email to `hello@catscandance.com` via the email queue.
- Admin sees them under ARTISTS → Submissions; Approve copies the row into `artists` with status `approved`.

## 4. Book button with email-OTP reveal + forward-to-CCD

Flow on artist card/detail:
1. Click **Book** → modal asks requester email + optional phone + purpose.
2. Edge fn `booking-otp-start`: generates 6-digit code, stores hash in `booking_otp_codes`, sends OTP via the transactional email queue (template `booking-otp`). Also writes a `booking_requests` row with `verified_at = null`. **Always also sends a copy of the request to `hello@catscandance.com`** (template `booking-request-internal`).
3. Modal switches to "enter code" step.
4. Edge fn `booking-otp-verify`: checks code, marks `verified_at`, returns the artist's `booking_email` (or `manager_email`) and updates `revealed_at`.
5. Below the revealed email: **"Have CCD reach out for you"** checkbox → sets `forward_requested = true` and triggers another internal email to `hello@catscandance.com` titled "Forwarded booking ask".

Rate limit per requester email: 5 OTP requests / hour, in-table check.

## 5. Submit Your Event → admin

Already wired: `SubmitEvent.tsx` inserts into `promoter_applications` and Admin already has a `PROMOTERS` tab calling `admin-promoters`. Verify it loads; if it's empty/broken, fix the function/tab. Rename tab label to **EVENT SUBMISSIONS** and surface: title (sample_event), city, date, contact, status, approve/reject. Approving copies into `events`.

## 6. Email infrastructure

Requires Lovable email domain + transactional infra (`setup_email_infra` + `scaffold_transactional_email`). Templates:
- `booking-otp` (to requester)
- `booking-request-internal` (to hello@catscandance.com)
- `artist-submission-internal` (to hello@catscandance.com)
- `forwarded-booking-internal` (to hello@catscandance.com)

If no email domain is configured yet, I'll prompt the setup dialog before building the booking flow.

## Technical summary

**New edge functions**
- `artist-enrich` (admin)
- `artist-submit` (public)
- `booking-otp-start` (public, rate-limited)
- `booking-otp-verify` (public)
- `admin-artists` (CRUD + approve)

**Edited**
- `src/pages/Artists.tsx` — DB-backed, drops tier/rank/Boiler-Room, adds Submit + Book modals
- `src/pages/Admin.tsx` — new ARTISTS tab, rename PROMOTERS → EVENT SUBMISSIONS, fix list if broken
- `src/content/artists.ts` — used only for one-time seed, then deleted

**Deleted after seed**
- `src/content/artists.ts`

## Out of scope (confirm before I extend)
- SMS OTP (you chose email only)
- Public profile pages per artist (`/artists/:slug`) — easy follow-up if you want
