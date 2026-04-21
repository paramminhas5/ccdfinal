## ShinyBall + nav fixes + scroll storytelling

### 1. Replace DiscoBall with ShinyBall (3D CSS)

Rebuild `src/components/DiscoBall.tsx` as a true 3D mirror ball using your reference code, ported to React + Tailwind:

- Outer wrapper: fixed/absolute positioned in Hero, drops from `-200px` with a framer spring on disco enable.
- Hanging cord (`<div>` 4px wide, `bg-ink`).
- `#discoBall` div with `transform-style: preserve-3d` and `rotateDiscoBall` 18s linear infinite rotation.
- Inner `#discoBallMiddle` core sphere with the dark gradient + counter-rotation.
- `useEffect` generates ~400 mirror tile `<div>`s using the spherical math from the snippet (cos/sin around the sphere). Tiles get random grayscale colors + `reflect` opacity flicker animation with random delays.
- Soft white blurred light disk behind the ball.
- Keyframes (`rotateDiscoBall`, `rotateDiscoBallMiddle`, `reflect`) added to `src/index.css`.
- Renamed component export to `ShinyBall` for clarity, kept import path.  
  


### 2. Fix the broken hero CTAs

The CTAs sit on a `pointer-events-none` parent. The current `pointer-events-auto` on the buttons row should work — but the centered DJ cat image (`z-20`) sits ON TOP of the buttons (`z-10`) and intercepts clicks. Fix:

- Add `pointer-events-none` to the centered DJ `<img>` (decorative, never interactive).
- Bump CTA wrapper to `z-30` and ensure `pointer-events-auto`.
- Add smooth scroll behavior via existing `useSmoothScroll` (already global, so anchors will work once clicks land).

### 3. Move Disco button into the Nav

- Remove the floating `<DiscoButton />` mount from `Index.tsx`.  
Also when disco button is pressed, the section bgs auto change into gradients full disco vibes 
- Render it inline inside `src/components/Nav.tsx` — desktop: between the link list and "Early Access" CTA; mobile: inside the hamburger menu and a compact icon-only version next to the burger so it's visible while closed.
- Tweak `DiscoButton.tsx` to accept a `compact` prop (icon-only square) and remove its `fixed` positioning.

### 4. Make ScrollPaw actually visible

- Increase size from `w-14 h-14` → `w-20 h-20`.
- Use a real, recognizable paw SVG path (current path is malformed/clipped).
- Animate the fill with `framer-motion`'s `useScroll` + `useTransform` mapped to the SVG's `<rect y>` so it updates every frame, not on throttled scroll.
- Add a thin pulsing outer ring that brightens as progress nears 100%.
- Add a subtle "100% — top" tooltip and click-to-scroll-top behavior.

### 5. Scroll-linked animation in EVERY section

A consistent scroll-storytelling layer per section using `useScroll({ target, offset: ["start end","end start"] })`:


| Section         | Scroll-linked effect                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero**        | (already has) cats fly off + stars spin                                                                                                                   |
| **Why**         | Vinyl rotates + side cat slides; ADD: headline letters slide in horizontally via a translateX transform; bullets stagger-snap with shadow drop            |
| **Stats**       | Numbers count-up tied to `scrollYProgress` (0 → final value), cards rise with parallax (back card slower than front)                                      |
| **What**        | Background grain shifts; the "FOUR ENGINES" title gets horizontal parallax; cards fan in with rotateY based on scroll position                            |
| **WhyNow**      | Cloud + raver cat parallax (already there); ADD: vertical timeline line on the left that "draws" itself (`pathLength` 0→1) as you scroll through the list |
| **Audiences**   | The active panel gets a subtle parallax background blob; tab underline animates on enter                                                                  |
| **Playlist**    | Vinyl spin speed couples to scroll velocity; track rows slide in from alternating sides                                                                   |
| **Events**      | Boombox slides across bottom L→R with scroll; event cards tilt 3D on cursor + stagger-rise                                                                |
| **EarlyAccess** | Title gets a chunky shadow that grows with scroll; floating notes orbit on scroll                                                                         |


Implementation: each section gets its own `useRef` + `useScroll` hook (cheap, since target-scoped). Reused `useParallax(ref, [from, to])` helper extracted to `src/hooks/useParallax.ts`.

### 6. Other UX/visual upgrades

- **Sticky section labels**: each section's `/ WHY` `/ WHAT` etc becomes a left-side sticky chip that travels down with you while inside that section (position: sticky, top: 80px). Adds wayfinding.
- **Section dividers**: replace flat `border-b-4` between sections with an SVG zig-zag/wave divider in `bg-ink` for chunkier handoffs between color blocks.
- **Cursor-reactive headlines**: hero + section titles get a tiny `mousemove` parallax (max 8px) so they feel alive.
- **Magnetic buttons**: primary CTAs (JOIN THE PACK, COUNT ME IN, GET TICKETS) attract the cursor by ±6px when hovered.
- **Marquee content upgrade**: include emoji glyphs (🐾 🪩 🎧) between phrases for more rhythm.
- **Contact section** currently has no scroll animation — add a parallax phone/headphones and a slide-in card.
- **Reduced motion**: all new effects gated by `prefers-reduced-motion`.

### Files

**New**

- `src/hooks/useParallax.ts`
- `src/components/StickyChip.tsx` (the per-section sticky label)
- `src/components/Divider.tsx` (zigzag SVG between sections)
- `src/components/MagneticButton.tsx`

**Modified**

- `src/components/DiscoBall.tsx` — full ShinyBall rewrite (3D CSS sphere)
- `src/index.css` — `rotateDiscoBall`, `rotateDiscoBallMiddle`, `reflect` keyframes
- `src/components/Nav.tsx` — embed DiscoButton (desktop + mobile)
- `src/components/DiscoButton.tsx` — remove fixed positioning, add `compact` variant
- `src/pages/Index.tsx` — remove floating DiscoButton, insert `<Divider />` between sections
- `src/components/Hero.tsx` — fix CTA pointer-events / z-index, ShinyBall hookup
- `src/components/ScrollPaw.tsx` — bigger, valid paw path, framer-driven fill, click-to-top
- `src/components/Why.tsx` — scroll-linked headline + bullets
- `src/components/Stats.tsx` — scroll-driven count-up + parallax
- `src/components/What.tsx` — sticky chip + scroll parallax title
- `src/components/WhyNow.tsx` — drawn timeline line
- `src/components/Audiences.tsx` — parallax blob + animated tab underline
- `src/components/Playlist.tsx` — alternating row slide-in
- `src/components/Events.tsx` — boombox L→R scroll travel
- `src/components/EarlyAccess.tsx` — orbiting notes on scroll
- `src/components/Contact.tsx` — parallax props + reveal
- `src/components/Marquee.tsx` — add emoji glyphs

### Skipped / open

- Ambient audio loop (still needs your go-ahead + a 120 BPM royalty-free file).
- Replacing remaining PNG assets (vinyl, boombox, cloud, music-note) with SVGs — say the word and I'll swap to inline SVG so they scale crisp on all DPRs.