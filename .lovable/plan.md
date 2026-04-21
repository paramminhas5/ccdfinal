
# Hero polish, marquee speed, past event poster, blog/media merge

## 1. Hero — restore side cats to original spot, enlarge for mobile only
In `src/components/Hero.tsx`:
- Side cats desktop: revert to `md:bottom-4 md:left-10 / md:right-10` and keep `md:w-56` (previous "normal view" position/size).
- Mobile: enlarge to `w-32` (from `w-24`) and raise to `bottom-28` so they sit beside the DJ cat instead of getting hidden behind buttons. Nudge horizontally in (`left-1 right-1`) so they stay in view at 390px.
- Keep parallax exit transforms and wiggle.

## 2. Hero — DJ cat loads instantly (no flash)
The DJ cat takes a moment because the SVG is fetched as a normal `<img src>` after JS hydration. Fix:
- Import the SVG as a module (`import heroCenter from "@/assets/hero-center.svg"` already in place — Vite emits a hashed URL, but the browser still fetches it after parse). Add `fetchpriority="high"` and `decoding="sync"` on the `<img>` so the browser prioritizes it.
- Add a `<link rel="preload" as="image" href="/src/assets/hero-center.svg">` injected via a tiny effect in `Hero.tsx` head, OR simpler: import the raw SVG markup with Vite's `?raw` suffix and inline it as inner HTML so it paints with the first render — zero network round-trip. Go with the inline-SVG approach for the DJ + side cats so they appear instantly.

## 3. Section headers — visible from the start, only animate outward
Currently `SectionReveal` fades in `opacity:0 → 1` and translates up, so headers are invisible until intersection. User wants headers visible immediately and only the body content to animate.

- Refactor `SectionReveal` to animate only `scale: 0.96 → 1` and `y: 20 → 0` while keeping `opacity: 1` from the start (no fade). This way the section is always visible and just "settles in" when scrolled to.
- Alternative for stronger effect: add a new `HeaderReveal` wrapper for headlines that does nothing (visible immediately), and a `BodyReveal` for cards underneath. Simpler: keep one component, drop opacity animation.

## 4. Marquees — faster on mobile
In `src/index.css`, `.marquee-speed` currently 30s. Add a mobile media query:
```css
@media (max-width: 768px) {
  .marquee-speed { animation-duration: 15s; }
}
```

## 5. Past Episode 01 — poster + details
User wants to add a poster image and details for Episode 01.

- The user has uploaded `CCDLOGO_2.png` but that's a logo, not a past-event poster. **Ask the user to upload the actual Episode 01 poster image** (and any details: real date, venue, lineup, blurb) before wiring it in.
- Once received: copy poster to `src/assets/episode-1-poster.png`, then update `src/pages/EventDetail.tsx` `events["episode-1"]` with the poster as `heroImage`, real `date`, `venue`, `lineup`, and `blurb`. Also update the home `Events.tsx` past-episodes card to show a thumbnail.

## 6. Media section doubles as Blog + add one editable blog post
Convert `src/components/Media.tsx` to a combined Press + Journal section, and add a real blog system the user can edit by hand.

- Create `src/content/posts.ts` exporting an array of blog posts: `{ slug, title, excerpt, body (markdown-ish string or JSX), cover, tag, date, author }`. Seed with one generated post (e.g., "Why Cats Can Dance Episode 01 Mattered" — placeholder content the user can edit).
- Create `src/pages/BlogPost.tsx` route at `/blog/:slug` rendering the post with Nav/Footer/SEO.
- Add `/blog/:slug` to `App.tsx` routes.
- Update `Media.tsx`:
  - Keep the press logos block (top half).
  - Replace the 3 black "▶ CLIP" placeholders with cards rendering the latest posts from `posts.ts` (cover image, tag, title, excerpt, "READ →" linking to `/blog/[slug]`).
  - Rename heading from "SEEN EVERYWHERE." to keep press intent + add subheading "/ JOURNAL" with "WORDS FROM US." beneath, OR just split the section into two visual blocks within the same orange container.
- Add `Shop`-style index page later if needed; for now a single post is enough.

## 7. Open question for the user
Before I start, please confirm/upload:
- The Episode 01 poster image and real details (date, venue, lineup, blurb).
- A title + topic for the seed blog post (otherwise I'll use "Inside Episode 01: How Bangalore Showed Up" as a placeholder you can edit in `src/content/posts.ts`).

## Technical notes
Files touched:
- `src/components/Hero.tsx` — side cat sizing/position, inline SVG for instant paint, preload DJ
- `src/components/SectionReveal.tsx` — drop opacity fade, keep subtle scale/y
- `src/index.css` — mobile marquee speed
- `src/components/Media.tsx` — merge press + blog cards
- `src/content/posts.ts` — NEW, seed blog post
- `src/pages/BlogPost.tsx` — NEW, post detail route
- `src/App.tsx` — add `/blog/:slug` route
- `src/pages/EventDetail.tsx` + `src/components/Events.tsx` — Episode 01 poster + details (after asset upload)
- `src/assets/episode-1-poster.png` — NEW (after user uploads)

No backend, no new dependencies.
