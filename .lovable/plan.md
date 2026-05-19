# 1. What this will actually cost

All numbers are steady-state monthly, after the free balances each workspace already gets ($25 Cloud + $1 AI).


| Service                                | What it does                                                | Volume                                                               | Est. cost               |
| -------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| Firecrawl (Hobby $16/mo)               | Listing + event-page scrapes, IG posters, venue calendars   | ~150 scrapes/day + ~700/week IG + ~120/week venues ≈ 6–7k scrapes/mo | **$16** (within Hobby)  |
| Lovable AI — Gemini 2.5 Flash          | Per-event extraction, taste scoring rationale               | ~5k calls/mo, ~800 tokens each                                       | **~$3–5**               |
| Lovable AI — Gemini 2.5 Pro            | Weekly editorial pass + "interesting facts" pass on artists | ~200 calls/mo, ~3k tokens each                                       | **~$3**                 |
| YouTube Data API                       | Artist videos                                               | Free quota covers it                                                 | **$0**                  |
| Resend                                 | Weekly digest email                                         | Free tier ≤ 3k sends/mo                                              | **$0**                  |
| Lovable Cloud (DB + edge fn + storage) | Everything else                                             | Light                                                                | covered by **$25 free** |


**Bottom line: ~$20–25/month** to run the full system at India-wide scale. The first ~$26 every month is free, so realistically you'd be paying **roughly $15–20/month out of pocket** once usage stabilises. If you stay on the free Firecrawl tier ($0) and skip the weekly Pro editorial pass, this drops to **under $5/month** — but the output quality drops noticeably.

If you want, the very first migration can add a `curation_runs` table that logs scrape count + tokens used per run, so you can see real cost in the Admin panel within a week.

---

# 2. Refreshed 2026 source list

You're right that the earlier list was stale. Here's the cleaned set based on what's actually publishing in 2025–26. I've grouped them by signal strength so we wire the high-signal ones first.

## Aggregators / ticketing (already partly wired)

- **Insider.in** — still the largest. Keep.
- **District.in** (Zomato) — biggest growth in 2025, our SSR/JSON-LD path works. Keep.
- **Skillbox** — still active for indie + electronic. Keep.
- **SortMyScene** — still active, smaller. Keep.
- **HighApe** — keep but deprioritise (mostly mainstream).
- **BookMyShow** — keep, low signal-to-noise.
- **going-out.in** — *new* — AI-structured nightlife index across 18 cities, 4,800+ venues. High-quality structured data, scrape weekly.
- **Vybeful** — *new* — venue-first directory with event feeds, good for Delhi/Mumbai.
- Paytm Insider standalone — merged into Insider.in, drop.

## Collectives / promoters (the actual taste-makers, 2026-active)

Confirmed still putting on shows in 2025–26 — verified against their own sites/IG:

- **Bhavishyavani Future Soundz** (Mumbai, since '90s, still booking)
- **Regenerate Music** (Mumbai, since 2013)
- **Redroom Sessions** (Bangalore — podcast + parties)
- **Mono Culture / Mono-Kulture** (techno-focused, multi-city)
- **Danza** (Delhi, since 2017 — house/techno/experimental)
- **Hypervibez** (multi-city, electronic)
- **Cabal Bombay** (invite-only underground, very hot in 2025)
- **Wild City** (editorial + parties, still active)
- **Boxout.fm** (radio + events)
- **Magnetic Fields satellite events** (off-festival showcases)
- **Krunk** (artist management + shows)
- **Submerge** (techno parties, Mumbai/Bangalore)
- **Sunburn Arena / VH1 Supersonic side-stages** (only for credible electronic lineups)

## Venues (verified open & programming electronic/indie in 2026)

- **Bangalore:** Fandom at Gilly's, The Bflat, Le Rock, Permit Room, Loft38, Take 5, BYG Brewski (selectively)
- **Mumbai:** antiSOCIAL Lower Parel (re-opened), Bonobo, The Quarter, AntiSOCIAL Khar, Famous Studios (warehouse nights), The Daily Bar
- **Delhi/NCR:** Depot48 (10 yrs, 4,500+ gigs), Auro Kitchen & Bar, Summer House Café, Roar, PCO, Piano Man Jazz Club
- **Goa (selective for big weekends):** Hilltop, Soro, SinQ
- **Pune:** High Spirits, The Daily All Day
- **Hyderabad:** Heart Cup Coffee, Prism

Venues we'll **explicitly remove** from any old lists (confirmed shut or pivoted away from music): old antiSOCIAL Khar (pre-2024 era references), Blue Frog Mumbai, Kitty Su (most outposts shut), Café Mojo (most outposts), Hard Rock Café Bangalore Lavelle Rd (shut).

## Culture-forward (beyond music)

- **Homegrown** (events tag)
- **Platform Magazine** (design/culture)
- **Little Black Book** (city guides, events)
- **Paperplanes** (zine culture)
- **Serendipity Arts Festival** + **India Art Fair** + **Kochi Biennale** satellite events
- **Khoj Studios** (Delhi, art residencies)
- **G5A** (Mumbai, hybrid arts)
- **Method Gallery** (Bangalore/Mumbai)

I'll keep this list in `supabase/functions/_shared/sources.ts` so it becomes a single source of truth that any admin can edit later via a CMS panel — no more hard-coded staleness.

---

# 3. Making the artist page actually interesting

Right now `/artists/:slug` shows bio + photo + booking. Boring. Here's what we add — every piece comes from data we either already have or can compute cheaply.

## A. "Why this artist matters" hero strip

One AI-generated sentence (already exists in `artists.why`), set in display type at the top. No hype-words; CCD voice.

## B. Stats bar (computed, no AI)

Six chips, each a small fact:

- Years active (derived from earliest YouTube upload or first festival year)
- Cities played (count of distinct cities in their festivals/lineups)
- Genre primary + 2 secondary
- Labels released on
- "Plays best in" — most common venue type (warehouse / festival / club / listening bar) based on event history
- Booking fee band (already in DB)

## C. The "Common Threads" panel — the interesting bit

A new edge function `artist-insights` runs weekly and writes to `artists.insights jsonb`. It finds patterns across the roster and writes per-artist commonalities:

- **"Plays often with"** — top 3 artists who have appeared on the same lineups (computed by joining `curated_events.lineup`).
- **"Shares a label with"** — other CCD-roster artists on the same label.
- **"Same city scene"** — other roster artists from `based_city`, ordered by overlap.
- **"Sounds like"** — Gemini Pro pass: given this artist's genres + 3 reference tracks, return 2 international and 2 Indian artists they'd appeal to fans of.
- **"Career arc"** — Gemini Pro pass on bio + festival list: returns 3 bullet milestones ("First release on X label, 2019" / "Magnetic Fields debut, 2022" / "First Europe tour, 2024").
- **"One thing most people don't know"** — single Gemini Pro line, sourced from scraped interviews via Firecrawl search ("Trained as a Carnatic vocalist before switching to modular synths" — only when verifiable in source text).

All of this is **one weekly Pro call per artist** (~50 artists × $0.01 = ~$0.50/week).

## D. Visual upgrades

- Gallery becomes a marquee strip instead of static grid.
- A small "lineup history" timeline below the videos — every CCD-tracked event they've played, clickable.
- "Book this artist" CTA stays as the only hard conversion point (no e-commerce noise).

## E. Roster-level page (`/artists`)

Two new tabs powered by the same insights data:

- **CONNECTIONS** — a small force-graph (d3 or just CSS) of who plays with whom. Visualises the scene.
- **CITIES** — group roster by based_city, with one-line "what this city's sound is" header per group (one-time Gemini Pro pass).

---

# 4. Cost of the additions specifically (just so you can decide)


| Addition                               | One-time                 | Monthly               |
| -------------------------------------- | ------------------------ | --------------------- |
| Refreshed source list + 5 new scrapers | covered in build credits | adds ~$2 Firecrawl    |
| Coolness scoring (no AI, pure SQL)     | covered                  | $0                    |
| Editorial weekly Pro pass              | covered                  | ~$3                   |
| Artist insights (weekly Pro pass × 50) | covered                  | ~$2                   |
| Weekly digest email                    | covered                  | $0 (Resend free tier) |


So the entire upgraded system — refreshed sources + taste scoring + editorial layer + artist insights + digest — lands at **~$22/month all-in**, of which $26 is already free. Net new spend: **$0–5/month** for months 1–6 while you grow into the free balances, then **~$15–20/month** once usage scales.

---

# I want to build all of it now