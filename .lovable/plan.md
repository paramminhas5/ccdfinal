# Plan — Update /ccdxsocial as a 4-city tour

## What changes

Rewrite the page from a Bangalore-only series into a **4-city national tour**, with friendlier "explain it like a human" copy. Drop the "no gimmicks / no bullshit" tone, replace with warm, informative language.

### 1. New tour data (replaces SHOWS array)


| #   | City label  | Venue               | Date                            |
| --- | ----------- | ------------------- | ------------------------------- |
| 01  | BANGALORE   | Social, Indiranagar | Sun 28 Jun 2026, 4 PM till late |
| 02  | MUMBAI      | Antisocial, Khar    | Last Sunday of July 2026        |
| 03  | HYDERABAD   | Social, Hyderabad   | Last Sunday of August 2026      |
| ★   | DELHI / NCR | TBA — Grand Finale  | October 2026                    |


City number (01/02/03/★) becomes the dominant label on each card instead of "SHOW 01".

### 2. New copy sections

**Hero** — keep the "Cats Can Dance × Social" title, swap subline to plain-language explainer:

> "A travelling Sunday party for pet parents and music lovers. We start in Bangalore, then Mumbai, Hyderabad, and close out in Delhi NCR. Outdoor pet zone in the afternoon, underground music after dark, same crew every city."

**WHAT TO EXPECT** — replace the current "two communities one room" + STATS grid with a clearer 4-block explainer:

- *Afternoon (4–8 PM):* pet zone — agility, portraits, treat bar, vendor market, lookalike + best-dressed contests rotating per city.
- *Evening (8 PM till late):* dance floor — house, disco, breaks, lo-fi-house. One CCD RESIDENT, One open deck act, plus one local guest and a legend of the game. 
- *Vibe:* easy Sunday, bring your dog, bring a friend, no dress code, free water + treat stations.
- *Who it's for:* pet parents, music heads, anyone who wants a different kind of Sunday.

**THE TOUR** — sequential 4-card timeline (replaces current "Series timeline"). Each card shows:

- Big city number (01/02/03/★)
- City + venue
- Date
- 2-line "what's special about this stop" (different per city — e.g. BLR is the launch, MUM is fashion/style edition, HYD is the agility edition, DEL is the grand finale)
- City-specific music guests (TBA placeholders for 02/03/★)
- "YOU ARE HERE" badge on 01, "★ FINALE" badge on Delhi

**MUSIC** — new short section: "What you'll hear" — 3 chips (House · Groove · Breaks - Ukg - DNb) + one paragraph naming the residents and the guest-per-city format.

**HOW TO JOIN** — new section, 3-step strip:

1. Pick your city → RSVP free on /events
2. Show up Sunday from 4 PM with your pet (or without)
3. Stay for the floor at 8 PM

CTA buttons: `RSVP FREE →` (→ /events) and `BRING A FRIEND` (share link).

**FOR SPONSORS** — keep, soften the strip to one short paragraph: "Want your brand at all four cities? We curate 2–3 partners per show — pet-first or culture-first. One deck, four cities." CTA → /ccdxsocial/sponsor.

### 3. Show 01 poster

The uploaded `CCDPOSTFINALV1.jpg` gets uploaded via `lovable-assets` and placed **inside the Show 01 tour card** (replacing the activity list grid on that one card only, so it acts as the visual centerpiece for the Bangalore stop).

### 4. New hero cat

Generate a new Social-themed cat image (DJ cat holding a beer with a glowing "Social" neon sign behind it, brutalist palette) → `src/assets/cat-social-hero.png`, replace `cat-dj-hero` import in the hero only.

### 5. Removed

- `STATS` grid (six-tile block) — replaced by the 4-block "What to expect" explainer.
- "TWO COMMUNITIES. ONE ROOM." heading — replaced by "HOW IT WORKS."
- "It's not a gimmick" line — gone.
- Bengaluru-only chips in the hero — replaced with `4 CITIES · JUN–OCT 2026`.

## Files touched

- `src/pages/CcdxSocial.tsx` — rewrite SHOWS/PILLARS/copy, restructure sections, swap hero image, embed poster in card 01.
- `src/assets/ccdxsocial-blr-poster.jpg.asset.json` — new (uploaded poster pointer).
- `src/assets/cat-social-hero.png` — new (generated).
- JSON-LD: change `EventSeries` location from Bengaluru-only to multi-city sub-events (BLR, MUM, HYD, DEL).

## Out of scope

Sponsor page (`/ccdxsocial/sponsor`), Nav, events page, ticketing backend — untouched.