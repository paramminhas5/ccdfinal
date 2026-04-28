## Goal

Tighten the site narrative:

- **/about** becomes a human story: mission → what we do (short) → cofounders → join the pack.
- **/for-investors** absorbs the business case: four engines, three worlds, why now, revenue model.
- **Nav** shrinks to the essentials. Secondary destinations live in the footer.

---

## 1. Navigation cleanup (`src/components/Nav.tsx`)

New structure (desktop):

```text
Logo   About   Events   Shop   Partners▾ More▾       [Disco] [Cart] [Early Access]
```

- **primaryLinks**: About, Events, Shop
- **Partners** dropdown: For Venues, For Artists, For Investors
- Mobile hamburger: same primary + partners list (no Blog/Press/Media/Cat Studio/Pets/Playlists/Videos).
- Drop now-unused routes from `lightBgRoutes` cleanup is cosmetic — keep entries since pages still exist.

## 2. Footer expansion (`src/components/Footer.tsx`)

Reorganise link groups so all moved items are discoverable:

- **EXPLORE**: Home, About, Events, Shop
- **WATCH & LISTEN**: Videos, Playlists, Instagram (external)
- **READ**: Blog, Press, Media, Pets
- **PLAY**: Cat Studio ✦
- **PARTNERS**: For Venues, For Artists, For Investors
- **FOLLOW**: Instagram, YouTube, RSS, Email

Keep current visual styling; just swap the `groups` array and add the new columns. Grid becomes `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`.

## 3. /about refocus (`src/pages/About.tsx`)

New flow (top → bottom):

1. **Nav**
2. **PageHero** — eyebrow "ABOUT", title "WE THROW PARTIES. WE BUILD CULTURE." (bg cream/magenta).
3. **Mission section** (new lightweight component or inline) — 2–3 short paragraphs on why CCD exists, the BLR underground POV, the human + pet angle.
4. **Short "What we do" strip** — 3 chips (Nights · Drops · Community) — NOT the full four-engine card grid (that moves to investors).
5. **Marquee** — "MEET THE PACK / JOIN THE PACK / WE'RE HIRING"
6. **Team** (cofounders + hiring grid, unchanged).
7. **Footer**.

Remove from About: `<What />`, `<Why />`, `<WhyNow />`, the "WHY THIS / WHY NOW / THREE WORLDS / ONE ECOSYSTEM" marquee, the FAQ JSON-LD about events (keep a smaller about-focused JSON-LD or drop it).

## 4. /for-investors expansion (`src/pages/ForInvestors.tsx`)

New flow:

1. Nav
2. PageHero (existing — "AN ECOSYSTEM, NOT AN EVENT BUSINESS")
3. Marquee "WHY THIS · WHY NOW · THREE WORLDS · ONE ECOSYSTEM"
4. `**<What />**` — four engines + revenue model (moved from About).
5. `**<Why />**` — three worlds, one ecosystem (moved from About).
6. `**<WhyNow />**` — the perfect moment timeline (moved from About).
7. Existing "FOUR REVENUE STREAMS / REQUEST DECK" CTA section.
8. Footer.

The `What`, `Why`, `WhyNow` components are already self-contained sections — no edits needed, just relocate the imports.

## 5. Color rhythm check

After moving sections, verify on /for-investors that no marquee shares a bg color with the section directly above/below it (per the existing color-rotation rule). Likely tweak the single `<Marquee bg="bg-lime" />` between sections so neighbors don't clash (`What` is cream, `Why` is electric-blue, `WhyNow` is magenta).

## Files touched

- `src/components/Nav.tsx` — slim primary + partners only, remove More dropdown.
- `src/components/Footer.tsx` — expanded link groups.
- `src/pages/About.tsx` — remove What/Why/WhyNow + their marquee, add mission + short "what we do" strip, keep Team.
- `src/pages/ForInvestors.tsx` — add What/Why/WhyNow between hero and existing CTA.

No DB, no edge function, no new routes — purely structural and presentational.