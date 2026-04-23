
# SEO refresh, nav cleanup, curated events, marquee fix

## 1. Wording — drop "cat-coded streetwear" + "pet club"

Use across the site:
- **"Apparel, limited drops, CCD goods"** — for the shop/brand side
- **"Cool culture & streetwear"** — for the brand positioning
- **No "pet club"** — we don't run one yet. Pets section stays as "pet streetwear & products" (current `/pets` copy is already on-brand, just minor SEO tweaks).

## 2. SEO copy pass

**Homepage** (`src/pages/Index.tsx`):
- Title: `Cats Can Dance — Bangalore Underground Parties, Apparel & Culture`
- Description: `Bangalore's underground crew. Dance music nights, limited apparel drops, CCD goods, and cool culture & streetwear. RSVP, shop, join the pack.`

**Per-page**:
- `/about` — "About Cats Can Dance | Bangalore's Underground Crew" / "Dance music nights, limited apparel drops, and cool culture & streetwear out of Bangalore."
- `/events` — "Parties & Curated Dance Events in Bangalore | Cats Can Dance" / "Our nights plus a hand-picked feed of the best dance music events in Bangalore this week."
- `/shop` — "Apparel, Limited Drops & CCD Goods | Cats Can Dance" / "Tees, totes, accessories. Limited drops from Bangalore's dance crew."
- `/pets` — "Pet Streetwear & Products | Cats Can Dance Bangalore" / "Cat bandanas, bucket hats, treats. Cool culture & streetwear, made for cats who party."
- `/blog` — "Field Notes from Bangalore's Underground | Cats Can Dance"
- `/media` — "Press & Media Kit | Cats Can Dance"

**Organization JSON-LD** on homepage:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cats Can Dance",
  "url": "https://catscandance.com",
  "logo": "https://catscandance.com/og-image.png",
  "description": "Bangalore underground crew — dance music nights, limited apparel drops, CCD goods, and cool culture & streetwear.",
  "sameAs": ["https://instagram.com/catscandance"]
}
```

## 3. Share image

Copy `user-uploads://Screenshot_2026-04-22_at_19.18.54.png` → `public/og-image.png` (overwrite). All `<SEO>` consumers already point here.

## 4. SEO component upgrades

In `src/components/SEO.tsx` add:
- `<meta name="keywords">` (per-page, optional prop)
- `<meta name="author" content="Cats Can Dance">`
- `<meta property="og:locale" content="en_IN">`
- `<meta name="theme-color" content="#1E3FFF">`
- `<meta name="twitter:site" content="@catscandance">`

## 5. Marquee — smaller on mobile

In `src/components/Marquee.tsx`:
- Font: `text-5xl md:text-7xl` → `text-3xl md:text-7xl` (mobile readable, desktop unchanged)
- Padding: `py-6 md:py-8` → `py-4 md:py-8`
- Gap: `gap-16` → `gap-10 md:gap-16`

## 6. Desktop nav — declutter

Current desktop nav: 8 links + mute + disco + cart + Early Access = overflow. Fix in `src/components/Nav.tsx`:
- Collapse `For Venues / For Artists / For Investors` into a `Partners ▾` dropdown (shadcn `navigation-menu`).
- Collapse `Pets / Media / Blog / Press` into a `More ▾` dropdown.
- Top-level: `Home · About · Events · Shop · Partners ▾ · More ▾` (6 items).
- Mobile hamburger keeps the full flat list — no change.
- Tighten spacing: `gap-6` → `gap-5`, hide `DiscoHint` on lg+ (redundant with the disco button).

## 7. Curated Events — weekly hand-picked feed for Bangalore

New section on `/events` listing the best dance/electronic events in Bangalore each week — auto-crawled + manual additions via admin.

**Pipeline:**
```text
[cron: weekly Mon 8am IST]
        │
        ▼
[edge fn: curate-events] ─► Firecrawl /search + /scrape
        │   sources: skillboxes, district, insider, sortmyscene, paytm insider
        ▼
[Lovable AI: gemini-2.5-flash]
   prompt → strict JSON: {title, venue, date, url, source, blurb≤140, genre[]}
        ▼
[upsert curated_events]
        ▼
[/events page reads via SELECT]   +   [admin: add/edit/delete + "Refresh now"]
```

**DB migration** — new table:
```sql
create table public.curated_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text,
  event_date date,
  event_time text,
  url text not null,
  source text not null,  -- 'skillboxes'|'district'|'insider'|'sortmyscene'|'manual'
  blurb text,
  genre jsonb default '[]',
  image_url text,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.curated_events enable row level security;
create policy "Anyone can read curated events" on public.curated_events for select using (true);
-- writes via service role from edge functions only
```

**Edge functions** (new):
- `supabase/functions/curate-events/index.ts` — Firecrawl + Lovable AI pipeline, upserts. Triggered by cron + admin "refresh now".
- `supabase/functions/admin-curated-events/index.ts` — auth-gated CRUD for manual third-party event uploads.

**Frontend:**
- `src/components/CuratedEvents.tsx` — brutalist card grid (title, venue, date, source pill, external "RSVP →" link).
- `src/pages/Events.tsx` — render below our own upcoming events under `/ THIS WEEK IN BLR`.
- `src/pages/Admin.tsx` — new "CURATED EVENTS" tab with list + add form + "Refresh from web" button.

**Cron** (Mon 02:30 UTC = 8am IST):
```sql
select cron.schedule('curate-events-weekly', '30 2 * * 1',
  $$ select net.http_post(
    url:='https://zyilevwfuhymzhezexep.supabase.co/functions/v1/curate-events',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE>"}'::jsonb,
    body:='{}'::jsonb
  ); $$);
```

**Prereqs:** Connect Firecrawl connector (the user will be prompted on approval). Enable `pg_cron` + `pg_net` (auto via migration).

## 8. Files touched

- `public/og-image.png` — overwritten with hero screenshot
- `src/components/SEO.tsx` — extra meta, `keywords` prop
- `src/components/Marquee.tsx` — smaller mobile type/padding/gap
- `src/components/Nav.tsx` — Partners + More dropdowns, tighter spacing
- `src/pages/Index.tsx` — new title/desc + Organization JSON-LD
- `src/pages/About.tsx`, `Events.tsx`, `Shop.tsx`, `Pets.tsx`, `Blog.tsx`, `Media.tsx` — copy refresh
- `src/components/CuratedEvents.tsx` — new
- `src/pages/Events.tsx` — render CuratedEvents
- `src/pages/Admin.tsx` — new "Curated Events" tab
- `supabase/migrations/*` — `curated_events` table + RLS + cron schedule
- `supabase/functions/curate-events/index.ts` — new
- `supabase/functions/admin-curated-events/index.ts` — new

No other new dependencies.
