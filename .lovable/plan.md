# Plan: Learn link, Cats Can Care, Artists, Multi-source curation

## 1. Nav: Add "Learn" external link

- In `src/components/Nav.tsx`, add `Learn` to the **More** dropdown (and mobile flat list) as an external `<a href="https://ablelive.lovable.com">`.
- Style matches other dropdown items.

## 2. Cats Can Care (Welfare) page — `/care`

New route + nav entry under **More** → "Cats Can Care".

**Data source:** Ship the 100 NGOs as a static TS dataset at `src/content/ngos.ts` (parsed from the uploaded CSV). Each row: `{ rank, name, founded, founded_by, location, focus[], donation_method, impact, website?, city, category }`. I'll derive:

- `city` from Location column (Bangalore/Mumbai/Delhi/Chennai/National/etc.)
- `category` from Focus keywords (Rescue, Wildlife, Adoption, Sterilisation/ABC, Sanctuary, Advocacy, Funding)
- `website` extracted from the Donation_Method text where present.

**Page (`src/pages/CatsCanCare.tsx`):**

- Hero strip with intro copy.
- **Search bar** (full-text over name/focus/location/impact).
- **Filter chips**: city, category (multi-select), "Has online donation".
- **Grid of cards**: name, location, founded, focus tags, impact blurb, "Donate" button (links to website / falls back to a search), "Adopt" tag if category includes Adoption.
- **Adopt section** (anchor `#adopt`): pre-filtered list of NGOs whose focus mentions "adoption / shelter / rehoming", plus a short "How to adopt responsibly" copy block.
- Uses existing semantic tokens (`bg-cream`, `text-ink`, `chunk-shadow`, etc.) — neo-brutalist consistency.

## 3. Artists page — `/artists`

New top-level nav link (primary nav, after Events).

**Data source:** Static dataset at `src/content/artists.ts` parsed from `India_Top_100_Electronic_DJs_Festival_Credentialed_May_2026.txt`. Each artist: `{ rank, name, members?, from, based, genres[], tier, festivals[], boilerRoom?, label?, why, instagram?, website?, bookingEmail?, priceRange? }`.

**Page (`src/pages/Artists.tsx`):**

- Hero: "India's Electronic Artists — Directory.
- **Search** (name, genre, label, city).
- **Filters**: Tier (1/2/3…), Genre chips (House, Techno, DnB, Bass, Ambient…), City
- **Sort**: Rank | A–Z | .
- **Cards** (clickable): name, tier badge, based-in, genres, top 3 festivals, "Why" excerpt, IG/website/booking links.
- **Detail drawer/modal** on card click with full bio fields (no separate per-artist route to keep scope tight).

## 4. Multi-source event curation fix

The `curate-events` edge function already supports `sortmyscene | insider | skillboxes | district | highape | bookmyshow`, but in practice only Skillboxes is producing rows. Two fixes:

1. **Admin trigger always defaults to Skillboxes.** Add a "Run all sources" call path that hits `curate-events` with `{ mode: "all", city: "all" }` (or delegate to `scheduled-curate`). Surface this as a button group in Admin → Curated Events: per-source × per-city dropdown + "Run All".
2. **Source robustness pass** in `supabase/functions/curate-events/index.ts`:
  - Add `waitFor: 5000` to the per-event scrape too (currently only listing waits) — Insider/District are JS-heavy.
  - Loosen `linkMatch` for Insider (`/insider\.in\/(?:[a-z0-9-]+\/)?(?:event|e)\//i`) and District (allow `/events/<slug>` and `/events/<slug>/buy-tickets`).
  - Add a fallback: if Firecrawl returns 0 candidate links, retry the listing with `formats:["markdown","links"]` and parse `(https?:\/\/...)` from the markdown using each source's `linkMatch`.
  - Log per-source failure reasons into the `runs[]` response so we can see why a source is empty.
3. Trigger `scheduled-curate` once after deploy from the Admin button to backfill all sources × cities.

## 5. Wiring

- Register routes in `src/App.tsx`: `/care` → `CatsCanCare`, `/artists` → `Artists`.
- Update `src/components/Nav.tsx`:
  - Primary links: add `{ to: "/artists", label: "Artists" }`.
  - More dropdown: add `Cats Can Care` → `/care`, and `Learn` → external Lovable URL.
  - Mobile flat list mirrors the same.
- SEO: add `<SEO>` block on each new page (title, description, canonical, JSON-LD `ItemList` for Artists and `Organization` list for Care).

## Technical details

- No DB migrations needed — both new pages use static TS datasets.
- Edge function changes deploy automatically.
- Files to create: `src/pages/CatsCanCare.tsx`, `src/pages/Artists.tsx`, `src/content/ngos.ts`, `src/content/artists.ts`.
- Files to edit: `src/App.tsx`, `src/components/Nav.tsx`, `supabase/functions/curate-events/index.ts`, `src/pages/Admin.tsx` (curated-events panel — confirm location once I open it during build).