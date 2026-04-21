

# Desktop downscale + admin dashboard for content & contacts

## 1. Scale down desktop sections to ~75%
The "too big" feel on desktop comes from oversized display headlines (`md:text-9xl`), heavy `py-24 md:py-32` section padding, and large container. Rather than touching every component, do it globally + targeted:

- **Global font shrink on desktop**: in `src/index.css`, add `@media (min-width: 768px) { html { font-size: 14px; } }` (default 16px → 14px ≈ 87.5%). All `rem`-based sizes (Tailwind text/spacing) shrink uniformly. Combined with a tighter container (below) gives ~75% feel without breaking layout.
- **Tighter container on desktop**: in `tailwind.config.ts`, change container `screens: { "2xl": "1400px" }` to `{ "2xl": "1200px" }` and bump padding to `2.5rem`. Keeps content from sprawling.
- **Tone down hero & section headlines**: drop `md:text-9xl` → `md:text-8xl` on Hero, About, Playlist, Events, Drops, EarlyAccess, Contact, Media. Drop `md:py-32` → `md:py-20` on the same sections.
- Mobile is unaffected (breakpoints stay `md:`).

## 2. Admin dashboard — manage Spotify playlists, events, contacts
Convert `/admin` into a tabbed dashboard. Existing "Early Access" stays as a tab.

### New backend
- **DB table `site_settings`** (singleton, single row keyed by `id='main'`):
  - `playlists jsonb` — array of `{ id, title, spotify_id }` (default seeded with current playlist)
  - `featured_playlist_id text` — which one to show on home `Playlist` section
  - `updated_at timestamptz`
- **DB table `events`**:
  - `id uuid pk`, `slug text unique`, `title text`, `date text`, `city text`, `venue text`, `blurb text`, `lineup jsonb` (string array), `status text` (`'upcoming' | 'past'`), `poster_url text nullable`, `sort_order int`, `created_at`, `updated_at`
  - Seed with current `episode-1` and `episode-2` so nothing breaks.
- **DB table `contact_messages`**:
  - `id uuid pk`, `name`, `email`, `message text`, `user_agent text`, `created_at`
  - Public RLS: anonymous INSERT only (matches existing pattern for `early_access_signups`).

### New edge functions
- `contact-submit` — public, validates input, inserts into `contact_messages`. `Contact.tsx` wired to call this instead of just toasting.
- `admin-content` — password-gated (reuse `ADMIN_PASSWORD` + `x-admin-password` pattern). Supports:
  - `GET ?type=settings|events|messages` — return rows
  - `POST { type, action: 'upsert'|'delete', payload }` — write through service role
  - Returns JSON; mirrors the auth/CSV pattern from `admin-signups`.

### Frontend
- **`src/pages/Admin.tsx`** — tabs: `Signups` | `Playlists` | `Events` | `Messages`.
  - **Playlists tab**: list current playlists, add new (title + Spotify URL — auto-extract ID via regex `/playlist/([a-zA-Z0-9]+)/`), set "featured", delete.
  - **Events tab**: list events, edit inline (title, date, city, venue, blurb, lineup as comma-separated, status, poster URL), add new, delete.
  - **Messages tab**: read-only table of contact submissions with search + CSV download (mirrors signups).
- **`src/components/Playlist.tsx`** — fetch `site_settings` on mount; pick featured playlist; if multiple playlists exist, show small selector chips above the iframe. Falls back to current hardcoded ID while loading.
- **`src/components/Events.tsx`** + **`src/pages/EventDetail.tsx`** + **`src/pages/Events.tsx`** — fetch events from DB instead of hardcoded objects. Episode 01 poster GIF stays referenced via the `poster_url` column (seed value points to the asset path).
- **`src/components/Contact.tsx`** — submit to `contact-submit` edge function; toast on success/error.

### RLS policies
- `site_settings`: public SELECT (so frontend can read playlists). No public write — service role only via edge function.
- `events`: public SELECT. No public write.
- `contact_messages`: public INSERT only (no SELECT). Admin reads via service-role edge function.

## 3. Open question
For events, the current `Episode 02` button on the home page has a hardcoded `RSVP NOW` action wired to `event_rsvps` with slug `episode-2`. Once events are DB-driven, the home hero card will render the **first `upcoming` event** in the table (sorted by `sort_order`). RSVP slug uses the event's `slug` column. If you want a specific event "pinned" as the home hero regardless of order, say so and I'll add a `is_featured` boolean.

## Technical notes
Files touched:
- `src/index.css` — global desktop font-size shrink
- `tailwind.config.ts` — narrower container
- `src/components/Hero.tsx`, `About.tsx`, `Playlist.tsx`, `Events.tsx`, `Drops.tsx`, `EarlyAccess.tsx`, `Contact.tsx`, `Media.tsx` — headline + padding trim on desktop
- DB migration — `site_settings`, `events`, `contact_messages` tables + RLS + seed
- `supabase/functions/contact-submit/index.ts` — NEW
- `supabase/functions/admin-content/index.ts` — NEW
- `src/pages/Admin.tsx` — tabbed dashboard
- `src/components/Playlist.tsx` — DB-driven, multi-playlist selector
- `src/components/Events.tsx`, `src/pages/Events.tsx`, `src/pages/EventDetail.tsx` — fetch events from DB
- `src/components/Contact.tsx` — wire to `contact-submit`

No new dependencies. Reuses existing admin password.

