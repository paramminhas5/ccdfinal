

# Hero cats swap, About tightening, Pet mockups, mobile text fix, BlogTab wiring

## 1. Hero — swap mid-flank cats with the two uploaded cats, bigger and tucked into the wordmark

Replace `cat-raver.png` and `cat-streetwear.png` (the awkward tiny corner ones) with the two uploaded cats:

- Copy `user-uploads://fERWBZ0K-2.jpeg` → `src/assets/cat-cap.png` (cap/arms-crossed cat, left side)
- Copy `user-uploads://tNDbJnao-2.jpeg` → `src/assets/cat-headphones-dance.png` (headphones dancing cat, right side)

In `src/components/Hero.tsx`:
- Remove the existing `catRaver` / `catStreetwear` `<motion.img>` blocks.
- Add the two new cats positioned **closer to the wordmark, larger, partially overlapping the "CATS / CAN / DANCE" text** so they read as part of the composition (not corner stickers):
  - Mobile: `top-[34%] left-[-4%] w-28 -rotate-12`, `top-[44%] right-[-4%] w-28 rotate-12`, `z-30` (in front of headline edges, not center).
  - Desktop: `top-[28%] left-[6%] w-44`, `top-[36%] right-[6%] w-44`, `z-30`.
  - Light scroll motion: small `x` drift outward + tiny rotate (keep `useTransform` pattern that's already there).
  - `drop-shadow-[6px_6px_0_hsl(var(--ink))]`, `pointer-events-none`, `wiggle`.

The headline stays `z-20` so cats sit in front at the edges but the bulk of the wordmark remains readable.

## 2. About / brand section — tighter, cat moved up, less empty space

`src/components/About.tsx`:
- Drop column heights: `h-64 sm:h-72 md:h-80` → `h-40 sm:h-48 md:h-56`.
- Reduce section padding: `py-16 md:py-20` → `py-10 md:py-14`.
- Move cat image up by anchoring `top-0` instead of `top-1/2 -translate-y-1/2`, with `mt-2`.
- Tighten grid gap: `gap-10 md:gap-12` → `gap-6 md:gap-10`.
- Keep walking motion (`xMobile/xDesktop`, `bob`, `rot`) — only the box shrinks and the cat moves up so the cat sits visually next to the paragraph instead of floating in dead space.

## 3. Pet product mockups with CCD branding (Apparel + Pet Products)

Generate 3 branded mockup PNGs using Lovable AI image gen (Nano Banana via the `ai-gateway` skill), save to `src/assets/`, then update the existing 3 Shopify products via `shopify--update_product` with the new images:

- `pet-bucket-hat-mockup.png` — cream cat-sized bucket hat, magenta CCD wordmark patch on front, brutalist studio shot on electric-blue paper backdrop.
- `pet-bandana-mockup.png` — pink triangle bandana with "CATS CAN DANCE" arched in black ink, on a clean cream surface.
- `pet-treats-mockup.png` — kraft pouch labeled "CCD CAT TREATS — TUNA & THUNDER", magenta + acid-yellow brutalist label, on cream backdrop.

Then update the 3 existing Shopify products:
- "Cat Bucket Hat" → rename to "CCD Cat Bucket Hat (Apparel)" + new image.
- "Cat Bandana" → "CCD Cat Bandana (Pet Apparel)" + new image.
- "CCD Cat Treats" → keep title + new image.

Tags already include `pets`, so `/pets` page and Shop PETS filter pick them up automatically.

Add a small section eyebrow on `src/pages/Pets.tsx`: subtitle becomes "Apparel & pet products — CCD-branded, made for the floor."

## 4. Mobile text cut-off — Shop & About hero titles

Root cause: `PageHero` uses `text-5xl md:text-8xl` with `drop-shadow filter` on a fixed-line `<h1>`. On 390px viewport, "DROPS & COLLECTIBLES." and similar long titles overflow horizontally and get clipped by `overflow-hidden` on the section.

Fix in `src/components/PageHero.tsx`:
- Change section `overflow-hidden` → `overflow-x-clip` (allows shadow bleed but clips horizontal scroll without cutting visible text).
- Title: `text-5xl md:text-8xl` → `text-[2.5rem] sm:text-6xl md:text-8xl leading-[0.9] break-words hyphens-auto`.
- Add `pr-4` to title so the drop-shadow tail doesn't get clipped at the right edge.
- Container padding stays.

Also `About.tsx` H2 already uses `break-words` and responsive sizing — verify nothing else clips post-PageHero fix.

"Scroll outwards post reveal" interpretation: the user wants long titles to **not** be cut on mobile — fixing the overflow + responsive sizing handles this without adding a marquee. (If they wanted an actual marquee, we can swap to one in a follow-up — flagging in the implementation note.)

## 5. Finish BlogTab wiring in Admin

`src/pages/Admin.tsx` already references `<BlogTab />` at line 515 but the component definition is missing — that's the build error.

Append to the bottom of `Admin.tsx` (after the `Admin` default export, before file end):

- `function BlogTab()` — self-contained component holding the 3-step wizard:
  - **Step 1 (Compose)**: Category select (GUIDES/CULTURE/ARTISTS/JOURNAL/DROPS/PETS, required), optional Title, Keyword, Angle. Two buttons: "GENERATE FROM RESEARCH" (sends only category) and "GENERATE WITH MY INPUTS" (sends all fields). Both POST to `admin-generate-blog` edge fn with `x-admin-password` from `localStorage.ccd_admin_pass`.
  - **Step 2 (Preview & Edit)**: Renders editable inputs/textareas for every field of the returned `DraftPost`. Live `<BlogCover />` preview using current `category`, `coverTitle`. TL;DR bullets editable as a textarea split on `\n`. `body[]` editable as a single textarea joined/split on `\n\n`.
  - **Step 3 (Publish)**: PUBLISH button POSTs the edited post to `admin-publish-blog`. On success: toast, reset wizard to Step 1.
  - Below the wizard, a "PUBLISHED POSTS" list (GET `admin-publish-blog`) showing last 10 with delete buttons (`POST admin-publish-blog?action=delete&slug=...`).

Loading + error states for both fetches; surface 402/429 from Lovable AI as toast.

## 6. Files touched

- `src/assets/cat-cap.png`, `src/assets/cat-headphones-dance.png` — copied from uploads
- `src/assets/pet-bucket-hat-mockup.png`, `src/assets/pet-bandana-mockup.png`, `src/assets/pet-treats-mockup.png` — generated via AI
- `src/components/Hero.tsx` — swap + reposition flanking cats
- `src/components/About.tsx` — tighter section, cat moved up
- `src/components/PageHero.tsx` — responsive title sizing + overflow fix
- `src/pages/Pets.tsx` — subtitle copy tweak
- `src/pages/Admin.tsx` — append `BlogTab` component (fixes build error)
- Shopify — `update_product` ×3 (new images, refined titles)

## 7. Next batch (after this ships)

Human-input rewrites for "Inside Episode 01" — I'll ask 3 questions one at a time: venue/date, lineup + one anecdote, one regret/thing you'd skip.

No new npm packages. No DB migration. Edge functions already exist from prior batch.

