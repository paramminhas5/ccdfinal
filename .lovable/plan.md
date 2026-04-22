# Hero cat tweaks, Episode 01 gif, fix headline clip, on-brand share cover

## 1. Hero — top cats lower, closer to text, independently positionable

In `src/components/Hero.tsx`, the two top flank cats (`cat-cap` top-left, `cat-hp-dance` top-right) currently sit at `top-[18%]` mobile / `top-[16%]` desktop and feel detached from the wordmark. The bottom two (`cat-headphones`, `cat-handstand`) sit at `top-[48%] / top-[50%]`.

Changes:

- Move top cats **down** so they hug the top edge of "CATS": `top-[28%] left-[2%]` and `top-[28%] right-[2%]` on mobile; `top-[26%] left-[6%]` / `top-[26%] right-[6%]` on desktop.
- Move bottom cats slightly up to bracket "DANCE" tighter: `top-[52%]` mobile / `top-[54%]` desktop.
- Pull all four horizontally **closer to text**: tighten left/right insets (`left-[6%]`/`right-[6%]` mobile, `left-[14%]`/`right-[14%]` desktop) so they overlap the wordmark edges instead of floating in corners.
- **Independently positionable**: extract each of the 4 flank cats into a const config at the top of the file:
  ```ts
  const FLANK_CATS = [
    { id: "cap",       src: catCap,      mobile: "top-[28%] left-[6%]",    desktop: "md:top-[26%] md:left-[14%]",  x: tlX, rot: tlRot },
    { id: "hpDance",   src: catHpDance,  mobile: "top-[28%] right-[6%]",   desktop: "md:top-[26%] md:right-[14%]", x: trX, rot: trRot },
    { id: "headphones",src: catHeadphones, mobile: "top-[52%] left-[6%]",  desktop: "md:top-[54%] md:left-[14%]",  x: blX, rot: blRot },
    { id: "handstand", src: catHandstand, mobile: "top-[52%] right-[6%]",  desktop: "md:top-[54%] md:right-[14%]", x: brX, rot: brRot },
  ];
  ```
  Render via `.map()`. This makes each cat a single-line edit to nudge later — one source of truth per cat for position.
- Keep existing scroll-away and apply to these side cats  (`x` to ±120%, `flankOpacity` to 0) and headline scale-up — already in place.

## 2. Add the uploaded gif to Episode 01 (past show)

- Copy `user-uploads://ccdep01_gif_1-2.gif` → `public/episodes/episode-01.gif` (public folder so it's served as-is, no Vite re-encoding of the gif).
- Update `EventDetail.tsx` to render an additional **gallery / recap media** section *only when* `event.status === "past"` AND a recap asset exists. Two clean options:
  - **Quickest, no DB change**: hardcode a small `RECAP_MEDIA: Record<slug, string>` map at top of `EventDetail.tsx`: `{ "episode-1": "/episodes/episode-01.gif" }`. Render below the poster, above "/THE NIGHT": a bordered `<img src={recap} ...>` titled "/ THE NIGHT, IN MOTION" with `chunk-shadow-lg`, `border-4 border-ink`, `max-h-[600px] object-contain bg-ink`.
  - Compression: gifs are large; we'll add `loading="lazy" decoding="async"` and rely on browser caching. If the file is over ~3MB we should mention generating an mp4 fallback later — flagging only.
- Result: visiting `/events/episode-1` shows the gif as the recap.

## 3. Fix Why/What headlines getting cut off in About page

Both `Why.tsx` and `What.tsx` use `useScroll` with offset `["start end", "end start"]`, meaning when the section first enters viewport `scrollYProgress = 0` and headlines are at their **starting** transform position (Why: `headlineX = -200` / `headline2X = +200`; What: `titleX = -80`). That's why text reads as "cut off" / off-screen on initial reveal — they only land at `x:0` at scroll midpoint.

Fix — keep headlines in place at start, animate **after** they've been read:

- Change offset to `["start start", "end start"]` so progress = 0 only when section top is at viewport top (i.e. after user scrolls into it).
- Re-map transforms so `progress 0 → headlines at rest (x:0)`, then drift away as user scrolls past:
  - `Why.tsx`: `headlineX = useTransform(p, [0, 1], [0, -120])`, `headline2X = useTransform(p, [0, 1], [0, 120])`. Drop the 3-stop `[-200, 0, 100]` shape.
  - `What.tsx`: `titleX = useTransform(p, [0, 1], [0, 120])`. Drop the `[-80, 80]` shape.
- Also remove `overflow-hidden` from the `<h2>` in `Why.tsx` (unnecessary now) and keep `overflow-hidden` on the section so drift past edges still clips.

This guarantees headlines render fully readable from the moment the section appears, then add a subtle parallax drift as the user continues scrolling.

## 4. Scrolling pass — quick check

Spot-fixes while we're in there:

- `What.tsx` and `Why.tsx`: same offset fix above (they're the main offenders).
- Confirm `Marquee` doesn't horizontally scrollbar the page on mobile — it's already `overflow-hidden`, fine.
- Confirm hero `h-screen` + 4 flank cats fit at 390×793: cats `w-24` at 6% inset = ~94px wide bracketing the wordmark; clearance OK.
- No new global scroll changes — `useSmoothScroll` stays as-is.

## 5. On-brand share cover (OG image)

Current `/public/og-image.png` is generic. Replace with a brutalist, on-theme cover that matches the hero:

- Generate a 1200×630 PNG in our palette: `electric-blue` background, "CATS CAN DANCE" wordmark in cream with `6px ink` drop-shadow, magenta + acid-yellow stars, the DJ cat (`hero-center.svg`) center-bottom, thick `8px ink` border.
- Approach: use Lovable AI image gen (Gemini 3 Flash Image preview) with a prompt referencing our colors and brutalist style; save to `public/og-image.png` (overwrite). QA by viewing the generated PNG before committing.
- All `<SEO>` consumers point to `/og-image.png` already — no code change needed.
- Also update `BlogPost.tsx` line 27 to dynamically use the post's `BlogCover`-rendered image when available (out of scope for this batch — flagging). For now, the global on-brand OG covers blog shares too.

## 6. Files touched

- `src/components/Hero.tsx` — refactor 4 flank cats into config array, reposition closer/lower
- `public/episodes/episode-01.gif` — new (copied from upload)
- `src/pages/EventDetail.tsx` — recap-media block for past episodes with hardcoded slug→gif map
- `src/components/Why.tsx` — change scroll offset, simplify headline transforms
- `src/components/What.tsx` — change scroll offset, simplify title transform
- `public/og-image.png` — overwritten with on-brand brutalist cover (AI-generated, QA'd)

No new dependencies, no DB migration, no edge function changes.