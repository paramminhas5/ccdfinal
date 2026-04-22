# Brand polish: brutalist palette, smarter blog, paw hint, hero cats, GIF fix

A focused fix-up batch. No deps.

## 1. Apply the Brutalist palette

Replace the current cream-based theme tokens in `src/index.css` `:root` with the supplied **Brutalist** HSL set so the site adopts: stone background `#E7E5E4`, hot-red `#DC2626`, lime `#A3E635`, electric blue `#2563EB`, ink near-black. Update every token (`--background`, `--cream`, `--ink`, `--electric-blue`, `--lime`, `--magenta` → reuse hot-red, `--acid-yellow`, `--orange`, plus shadcn aliases). All existing `bg-cream`, `bg-ink`, `bg-electric-blue` classes will pick up the new colors automatically.

## 2. Brand section — fix cat clipping

`src/components/About.tsx`: the headline "A CULTURE FOR PEOPLE WHO MOVE." overflows on 390px viewports because `text-4xl` + long word "CULTURE". Drop to `text-[2rem]` mobile / keep `md:text-6xl`, ensure `leading-[0.95]`, and switch the right column from `h-44` to `h-56` mobile so the walking cat has room and isn't clipped at top/bottom. Cap cat width at `w-1/2` mobile and tighten the `x` transform range to `["-10%", "40%"]` so it stays inside the column.

## 3. Hero — remove duplicate cats under stars; resize bottom flanking cats

`src/components/Hero.tsx`:

- **Delete** the two top "cohesive cats sitting just under the stars" (lines 53-65) — they duplicate the bottom flanking cats and crowd the headline.
- The mobile-only flanking cats around the DJ (`catHeadphones` + `catHandstand`): change `bottom-[42%]` → `bottom-[28%]` to move them lower, and unify size to `w-16` so they match the desktop bottom cats' visual weight.
- Stars stay as is.

## 4. Disco hint → occasional paw popup

Rewrite `src/components/DiscoHint.tsx`:

- Show once on first visit ~2s after load with a **paw 🐾 + "press me ✨"** bubble pointing to the disco button. Auto-dismiss after **5s**.
- After that, **re-appear occasionally**: every 60-90s of active session time, show for 4s, then hide (max 3 reappearances per session, none if user has clicked the disco button).
- Track in `sessionStorage`: `ccd:disco-hint-count` and `ccd:disco-clicked`. Listen for a custom `disco:toggle` event dispatched from `DiscoButton.tsx` to mark "clicked".
- Bubble uses `bg-magenta` (now hot-red), shows a paw glyph (SVG or emoji), bounces in, fades out. Hidden under `prefers-reduced-motion` after the first appearance.
- Edit `src/components/DiscoButton.tsx` to dispatch `window.dispatchEvent(new Event("disco:toggle"))` on click.

## 5. GIF poster not loading — debug + fix

The `onError` handler in `Events.tsx`/`EventDetail.tsx` hides the broken `<img>` silently, masking the cause. Likely culprits: the stored `poster_url` is a Supabase Storage path missing the public-bucket URL prefix, OR a CORS/mime issue.

- In `src/components/Events.tsx` and `src/pages/EventDetail.tsx`: when `poster_url` is non-empty and not a full URL and not starting with `/`, treat it as a Supabase Storage object and resolve via `supabase.storage.from('event-posters').getPublicUrl(path).data.publicUrl`.
- Replace silent `display:none` `onError` with a brand fallback tile (lime block + ★ + event title) so a broken URL is still visually present.
- Add `crossOrigin="anonymous"` and `referrerPolicy="no-referrer"` on the `<img>` to dodge hotlink blocks.
- Add a tiny console warning `console.warn("[poster] failed", src)` in dev so the real URL is visible when the user reports it.

## 6. Footer logo — solid circle behind, no inverted weirdness

`src/components/Footer.tsx`: the two decorative `ccdLogo` images use `filter: invert(1)` which produces washed colors on the new stone background. Replace both with: a solid `bg-cream` (now stone) **circle** wrapper (`rounded-full w-24 h-24 grid place-items-center`), original (un-inverted) logo inside at `w-16`, with a 4px ink border + chunk-shadow. Rotates `-360deg` on hover instead of `+360deg` ("the other way"). Looks like a coaster sticker.

## 7. Blog covers — stop mirroring the headline

Currently `BlogCover` repeats the post `title` huge inside the cover, then `<h2>` repeats it again right next to it → visual stutter. Refactor `src/components/BlogCover.tsx`:

- Cover shows: tag chip (top-left), large issue number (e.g. `№ 01`, `№ 02`…) in `Bowlby One`, brand wordmark + paw, and a **2-3 word "kicker"** instead of the full title (e.g. "RSVP CULTURE", "DROPS 101", "EPISODE 01").
- Add a `kicker?: string` and `issue?: number` to `Post` type; if `kicker` absent, derive from first 1-2 keywords of `tag` + post index.
- Update `posts.ts` to add a `kicker` for each post (keep it punchy: "UNDERGROUND", "SOURCES", "TOP 10", "RSVP", "TECHNO/HOUSE", "DECKS", "EP 01", "DROP", "MERCH", "BRANDS", "SCARCITY").
- Auto-assign `issue` by array index.
- Result: cover is a graphic tile, not a duplicate of the headline.

## 8. Blog posts — better, more human content

The current 11 posts read like SEO filler. Two-pronged fix without losing SEO weight:

- **Rewrite tone**: make every post feel first-person, opinionated, and specific. Shorter sentences. Real Bangalore detail (neighbourhoods, times, prices, anecdotes). No "in 2026" filler or list-mode cadence. Keep length 700-1000 words. Keep the SEO target keyword in title + first paragraph + once mid-body, naturally. Search the web. 
- **Add structure that humans actually read**: each post gets:
  - A **TL;DR** (3 bullet sentences) at the top — most people only read this.  
  Seach for latest articles and news and aggregate them 
  - A **"Quick picks"** sidebar block (3 named places/nights/artists) inline.
  - A **pull-quote** mid-post in big display type.
  - A **"What we'd skip"** honesty section near the end (builds trust, very rare in SEO-bait posts).
  - Author signature block at the bottom: "— Written by The Pack, on the floor in Bangalore."
- Rewrite all 11 existing posts in `src/content/posts.ts` against this template. Update `BlogPost.tsx` to render the new structured fields (`tldr: string[]`, `quickPicks?: { title: string; items: string[] }`, `pullQuote?: string`, `whatWedSkip?: string`) with brutalist styling.
- Add an "Editor's note" line under the byline on `BlogPost.tsx`: "Honest, by humans, from Bangalore." — a small trust signal that also helps with E-E-A-T (Google's experience/authority ranking).

## 9. Sitemap + types

- `posts.ts` type updated with optional `kicker`, `issue`, `tldr`, `quickPicks`, `pullQuote`, `whatWedSkip`.
- No sitemap change needed (slugs unchanged).

## Files touched

- `src/index.css` — Brutalist palette tokens
- `src/components/About.tsx` — headline sizing + cat column height/transform
- `src/components/Hero.tsx` — remove duplicate top cats; lower mobile flanking cats
- `src/components/DiscoHint.tsx` — paw + occasional reappear logic
- `src/components/DiscoButton.tsx` — dispatch `disco:toggle`
- `src/components/Events.tsx` + `src/pages/EventDetail.tsx` — Supabase storage URL resolve, fallback tile, `crossOrigin`
- `src/components/Footer.tsx` — solid-circle logo medallions, reverse rotate
- `src/components/BlogCover.tsx` — kicker + issue layout (no title repeat)
- `src/content/posts.ts` — type extended, all 11 posts rewritten with TL;DR / quickPicks / pullQuote / whatWedSkip / kicker
- `src/pages/BlogPost.tsx` — render new structured fields
- `src/pages/Blog.tsx` — minor: hide repeated `<h2>` title since cover now carries identity? Keep the `<h2>` (needed for SEO + a11y), but cover no longer repeats it visually

No DB or backend changes. No new dependencies.