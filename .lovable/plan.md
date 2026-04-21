

# Cats Can Dance — Full Build Plan

This is a big scope, so I'm breaking it into phases. Phase 1 is the highest-leverage stuff (backend + structure). I'll need a few decisions before I start.

## Questions before I build

1. **Admin access** — should the admin page be locked behind a login (email/password via Lovable Cloud auth), or a simple shared password gate for now?
2. **Disco audio loop** — do you have an audio file you want to upload, or should I source/generate a royalty-free 120 BPM ambient loop?
3. **Instagram feed** — real Instagram embed (requires their Graph API + a business account) or a styled mock grid that links to your profile?
4. **Shop / Drops** — is this a real store (Shopify/Stripe later) or a "coming soon" showcase grid for now?

I'll proceed assuming: **shared password admin**, **I'll add a placeholder audio loop you can swap**, **mocked Instagram grid linking out**, **showcase-only shop**. Tell me if any of those are wrong.

---

## Phase 1 — Site architecture & routing

Restructure into a multi-page site. Home becomes user-focused only.

```text
/                → Home (users)
/about           → About the brand
/for-venues      → Pitch page for venues
/for-artists     → Pitch page for artists
/for-investors   → Pitch page for investors
/admin           → Early access list (gated)
```

- Add a global `Nav` with: Home · About · Playlists · Events · Shop · For Venues · For Artists · For Investors (collapses to hamburger on mobile).
- Add a `Footer` link group mirroring the nav.
- Each "For X" page reuses the brand system (Marquee, big display type, chunk shadows) with audience-specific copy + a single CTA (contact / pitch deck / invest inquiry).

## Phase 2 — Home redesign (user-focused)

New section order on `/`:

1. Hero (fixed jank, see Phase 6)
2. Marquee
3. About (short — full story lives on `/about`)
4. Playlists (existing, polished — embed Spotify/SoundCloud iframes)
5. Events (existing)
6. Media (press logos + video/photo strip)
7. Drops / Shop (product card grid, "coming soon" badges OK)
8. Instagram (3×3 grid linking to @catscandance)
9. Posts (blog/news teaser cards — static for now)
10. Early Access (now wired to backend)
11. Contact + Footer

I'll build new components: `About`, `Media`, `Drops`, `Instagram`, `Posts`. Existing `WhyNow`, `Why`, `Audiences` move to the `/about` and `/for-*` pages where they fit.

## Phase 3 — Lovable Cloud + Early Access backend

- Enable Lovable Cloud.
- Create `early_access_signups` table: `id`, `email` (unique), `source`, `created_at`, `user_agent`.
- RLS: public can `INSERT` only; only admins can `SELECT`.
- Wire `EarlyAccess.tsx` form:
  - Zod validation (`email().max(255)`)
  - Trim + lowercase before insert
  - Friendly toast for success, duplicate, and failure cases
  - Keep the confetti burst on success
- Honeypot field + simple client throttle to deter bots.

## Phase 4 — Admin page

`/admin` route:
- Password gate (env-stored shared password checked via edge function — never client-side).
- Once unlocked: paginated table of signups with search by email, sort by date, total count, and a **Download CSV** button.
- Reuses shadcn `Table`, `Input`, `Button`.

## Phase 5 — Disco audio

- Add `useDiscoAudio` hook tied to `DiscoContext`.
- Plays a looping ambient 120 BPM track when disco mode is on; fades in/out.
- Mute toggle pinned next to the disco toggle in the nav.
- Respects `prefers-reduced-motion` AND first-user-gesture autoplay rules (audio only starts after the user clicks the disco toggle, which is already a gesture).
- Audio file lives at `public/audio/disco-loop.mp3` (placeholder; swappable).

## Phase 6 — Hero polish + scroll de-jank

- Re-stack hero z-index: **text behind**, **DJ cat image in middle layer**, **buttons on top**. Currently the DJ image sits above the text already — I'll formalize the layering and move buttons to `z-50`.
- Tie hero center DJ image to scroll: gentle parallax `y` + slight `scale` driven by `useScroll`.
- Performance fixes for jank:
  - Add `will-change: transform` only to actively-animating elements.
  - Wrap heavy `motion` transforms with `useReducedMotion` so they collapse to static on low-power devices.
  - Throttle `ScrollPaw` and `PawCursor` updates with `rAF` if not already.
  - Lower Lenis `duration` from 1.1 → 0.9 and disable smoothWheel on touch devices (Lenis already does this, but I'll confirm).
  - Audit `SectionReveal` to use `whileInView` with `once: true` so it stops recomputing.

## Phase 7 — QA pass

- Mobile (375px, 390px, 414px): tap targets, marquee overflow, hero text clipping.
- `prefers-reduced-motion`: disables marquee, parallax, confetti orbits, paw cursor.
- Disco mode: verify gradient/filter applies cleanly across every section without breaking text contrast.
- Lighthouse run; fix any red items.

## Phase 8 — SEO & share previews

- Per-route `<title>` and `<meta description>` via `react-helmet-async`.
- Open Graph + Twitter card tags per page.
- Custom OG image (1200×630) generated with the brand palette + DJ cat.
- `favicon.ico` + `apple-touch-icon.png` + `site.webmanifest`.
- `sitemap.xml` and updated `robots.txt`.
- JSON-LD `Organization` schema on home.

---

## Technical notes

- **Stack additions**: `react-helmet-async`, `zod` (already common in shadcn forms — confirm), Lovable Cloud client.
- **Audio**: native `<audio loop>` with a ref; no library needed.
- **Admin auth**: edge function `verify-admin-password` returns a short-lived signed token stored in `sessionStorage`; gate uses it to fetch signups via another edge function that validates the token before reading the table. No service role keys leak to the client.
- **CSV export**: edge function streams `text/csv` with proper headers.
- **Routing**: existing `react-router-dom` BrowserRouter; just add the new routes above the catch-all.

## Suggested order of execution

1. Answer the 4 questions above.
2. I'll do Phase 1 + 2 (architecture + home restructure) — this is the biggest visible change.
3. Then Phase 3 + 4 (Cloud, signups, admin) in one pass.
4. Then Phase 5 (audio), Phase 6 (hero + jank), Phase 7 (QA), Phase 8 (SEO) — these can ship together.

Reply with answers to the 4 questions (or "go with your defaults") and I'll start.

