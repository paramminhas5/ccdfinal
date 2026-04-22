

# Mobile polish, Venue Partners rewrite, Media → page, blog covers, hero cats, scroll-walking cat, disco hint

A focused batch of fixes and small features. No new dependencies.

## 1. Replace AI-looking blog covers with simple branded ones
The 11 generated PNGs in `public/blog/` look obviously AI. Replace with **plain SVG covers** (no AI generation): brand-colored backgrounds (alternating cream / acid-yellow / lime / magenta / electric-blue / orange), bold ink border, the post tag chip, post title in `Bowlby One`, a tiny ★ or paw motif, and "CATS CAN DANCE" wordmark. Each one ~1200×630 SVG, file-size tiny.

- New component `BlogCover.tsx` that renders the SVG-style cover from `{title, tag, color}` props (used as the cover everywhere a post is shown — `Blog`, `BlogPost` hero, `Media`).
- Update `src/content/posts.ts` so each post has `coverColor` instead of pointing at the PNG. Drop the `img(slug)` helper.
- Delete the 11 AI PNGs in `public/blog/`.
- For OG image (social shares) we keep a single static branded `/og/blog.png` fallback — no per-post OG image needed for now.

## 2. About section — fix overflow on mobile
The big `text-5xl/6xl` headline with hard `<br/>` overflows narrow widths.
- Reduce mobile size to `text-4xl`, drop the forced `<br/>` on mobile (use `sm:` for the break), add `break-words` and tighten `leading`.
- Make the cat-dancer image cap at `w-2/3` on mobile so the row doesn't push width.

## 3. Contact section — mobile optimisation
- The big `text-6xl` "SAY HELLO" + the giant decorative headphones image overlap form on small screens.
- Move headphones to be hidden on mobile (`hidden md:block`).
- Reduce headline to `text-5xl` on mobile.
- Make the email link `break-all` so the long address doesn't bust the column.
- Form: increase tap targets (`py-4`), full-width on mobile already — verify spacing inside `chunk-shadow-lg` (reduce padding `p-4` mobile).

## 4. Mobile audit pass on all sections
Quick pass through every homepage section for overflow / overlap / tap-target issues:
- `Hero` — already mobile-tuned, verify CTAs above DJ feet.
- `Marquee` — fine, just speed bump (see #6).
- `About`, `Playlist`, `Events`, `Drops`, `Instagram`, `Videos`, `EarlyAccess`, `Footer`, `Catbot` — wrap headings with responsive sizes, ensure no `whitespace-nowrap` on titles, ensure `container` has `px-4` baseline, and decorative absolute-positioned images are `pointer-events-none` and hidden where they crowd content.
- Add a single shared utility `.headline-responsive` in `index.css` for big page titles to keep this consistent.

## 5. Venue Partners rewrite (`src/pages/ForVenues.tsx`)
- Rename throughout: nav label, page title, SEO title, breadcrumb, footer link → **"Venue Partners"**.
- `PageHero` title → **"LET'S BUILD MEMORIES TOGETHER"**.
- Subheadline (new line under hero title) → **"Creating moments people come back for, again and again…"** (remove the existing "people plan their weekend around us" headline below).
- Body copy → **"We partner with venues to bring the right crowd, stronger spend and recurring moments that grow over time."**
- Keep the existing **"PARTNER WITH US →"** CTA as is.
- Update `Nav.tsx`, `Footer.tsx` `groups` array, and any other links from "For Venues" → "Venue Partners".

## 6. Faster marquee
- `src/index.css` `.marquee-speed` → desktop `18s` (from 30s), mobile `9s` (from 15s). Disco mode stays at 6s.

## 7. Two more cats above the stars in Hero (cohesive)
Add two extra cat sprites positioned just under each spinning star, mirrored, small + wiggling, behind the headline (z-index between stars and headline). Use existing `cat-headphones.png` (left) and `cat-handstand.png` (right) at `w-12 md:w-20`, with ink drop-shadow to match the brand. They sit on top, near the star area, so the top of the hero feels populated.

## 8. About section — cat walks on scroll
Replace the static `cat-dancer.svg` in `About` with a scroll-driven walking cat:
- Use `useScroll({ target: aboutRef })` + `useTransform` to translate the cat horizontally across the right column as the section scrolls into / out of view.
- Bobbing `y` animation (`animate={{ y: [0, -4, 0] }}`) for a "walk" feel and a slight rotate.
- Keep static fallback for `prefers-reduced-motion`.

## 9. Move Media to its own page
- Remove `<Media />` from `src/pages/Index.tsx` (and its import).
- New route `/media` (`src/pages/Media.tsx`) using existing `Media` component wrapped in `Nav`, `PageHero` ("MEDIA & PRESS"), `Footer`, `SEO`, `Breadcrumbs`.
- Add `/media` to `Footer.tsx` Explore links and to `Nav.tsx` (under a "More" group or directly).
- Add `/media` to `sitemap.xml`.

## 10. Fix episode poster GIF not rendering
The `.gif` poster URL uploaded to events sometimes 404s or isn't being served. Fix the rendering path so GIFs work:
- In `Events.tsx` and `EventDetail.tsx` — when `poster_url` ends in `.gif`, render `<img>` with `unoptimized`-style attributes (`decoding="async" loading="lazy"`) and add a fallback `onError` that swaps to a brand placeholder so a broken URL is never a blank black box.
- Verify the asset path: if the value is just a filename, prefix with `/`; if it's a full URL, leave it.
- Add a small "GIF" badge corner overlay on past-event cards when `.gif` for delight.

## 11. "Press the disco button" hint
First-time visitors don't know the 🪩 button does anything. Add a small one-time hint:
- A floating callout near the disco button in the nav (arrow + text "Press me ✨") shown on first load only.
- Stored in `localStorage` (`ccd:disco-hint-seen`). Dismiss on click or auto-hide after 8s.
- Animated bounce-in via Framer Motion. `prefers-reduced-motion` → static.
- Hidden on `<sm` for now? — keep visible but smaller.

## Files touched
- `src/components/BlogCover.tsx` — NEW (SVG branded cover renderer)
- `src/content/posts.ts` — drop PNG paths, add `coverColor`
- `public/blog/*.png` — DELETE (11 files)
- `src/components/About.tsx` — responsive headline + scroll-walking cat
- `src/components/Contact.tsx` — mobile sizing, hide headphones on mobile
- All section components — mobile audit pass (heading sizes, paddings)
- `src/index.css` — faster marquee + `.headline-responsive` util
- `src/components/Hero.tsx` — two extra cats under the stars
- `src/components/Marquee.tsx` — verify speed class
- `src/pages/ForVenues.tsx` — Venue Partners rewrite (title, sub, body)
- `src/components/Nav.tsx`, `src/components/Footer.tsx` — rename links, add `/media`
- `src/pages/Media.tsx` — NEW route page
- `src/pages/Index.tsx` — remove `Media` from homepage
- `src/App.tsx` — add `/media` route
- `public/sitemap.xml` — add `/media`
- `src/components/Events.tsx`, `src/pages/EventDetail.tsx` — GIF poster fix + onError fallback + GIF badge
- `src/components/DiscoHint.tsx` — NEW one-time hint, mounted in `Nav`

No DB / backend changes. No new dependencies.

