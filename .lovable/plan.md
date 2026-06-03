## Goal
Fix the cramped/oversized hero on `/ccdxsocial/sponsor`, add a Nav entry, and inject more fun/personality across the page while keeping the brutalist CCD aesthetic.

## 1. Sponsor page hero — compact + punchier (`CcdxSocialSponsor.tsx`)
- Drop heading scale: `text-5xl sm:text-6xl md:text-8xl lg:text-9xl` → `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`
- Drop section padding `py-16/24/32` → `py-10/16/20`; tighten margins (`mb-6→mb-3`, `mb-8→mb-5`)
- Two-column on `lg+`: heading + intro left, chip stack right (vertical), smaller chips (`text-xs sm:text-sm`, `px-3 py-1.5`, `gap-2`)
- Add a sticky "tape-strip" eyebrow `/ SPONSOR THE SERIES ★ 2026 EDITION` with subtle tilt (`-rotate-1`)

## 2. Tighten every other section
- Section padding `py-16/24/32` → `py-12/16/20` site-wide on this page
- Section headings step down: `md:text-6xl lg:text-7xl` → `md:text-5xl lg:text-6xl`
- Card grid gap `gap-6→gap-4`; card padding `p-6→p-5`; stat list `space-y-4→space-y-3`
- CTA heading `lg:text-8xl→lg:text-6xl`, padding `lg:py-32→lg:py-20`

## 3. Make it more fun (playful brutalist touches)
- **Sticker badges**: rotated chunk-shadow chips on hero stats and tier cards (e.g. `★ LIMITED`, `🐾 PET-FRIENDLY`, `🎧 LIVE SETS`) using `-rotate-2` / `rotate-3`
- **Hover micro-motion**: tier + "what you get" cards lift + shadow-shift on hover (`hover:-translate-y-1 hover:translate-x-1 transition`)
- **Stat counters with personality**: oversize numerals in lime/red blocks, hand-written-style suffix labels ("pax", "shows", "vibes")
- **Section dividers**: extra short marquees between sections with emoji-flavored copy (`★ WOOF ★ BARK ★ BASS ★ REPEAT ★`)
- **Easter-egg**: tiny rotated paw-print "stickers" scattered (absolute positioned, `opacity-80`, decorative)
- **"Who should sponsor" chips**: each block gets a tilted emoji sticker (🦴 🎧 📸 🍻 🐕 🧴) corner-pinned
- **CTA**: button hover triggers translate + color swap; add a small "↓ tap for the deck" bouncing arrow
- Keep all colors via existing `bg-lime / bg-magenta / bg-electric-blue / bg-acid-yellow / bg-mint / bg-cream` tokens — no new tokens

## 4. Add Sponsor link to Nav (`Nav.tsx`)
- Append `{ to: "/ccdxsocial/sponsor", label: "Sponsor" }` to `partnersLinks` so it shows in the Partners dropdown (desktop) and mobile flat list.

## Files
- `src/pages/CcdxSocialSponsor.tsx` (compact + fun pass)
- `src/components/Nav.tsx` (one-line nav entry)

No backend, no new deps, content unchanged.
