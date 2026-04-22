# Pets section, AI blog generator, smarter covers, fixes

Six things this batch. No new dependencies.

## 1. Footer fixes

- Make the two decorative logo medallions smaller and less weird: shrink from `w-24 / w-20` → `w-14 / w-12`, lighter border (`border-2`), drop the heavy `chunk-shadow` to `chunk-shadow` (existing) but smaller circles read as "stickers" not "billboards".
- Remove `KARNATAKA · INDIA` line — keep just `BANGALORE` (less spammy, cleaner).

## 2. About — stop the cat from clipping

The `motion.img` is positioned `top-1/2 -translate-y-1/2` inside an `overflow-hidden` column with `w-1/2 sm:w-1/2 md:w-2/3` — the rotate + walk bounce push the cat past the column on mobile.

- Change column from `overflow-hidden` → `overflow-visible` so the cat can breathe.
- Cap `max-w-[160px]` on mobile and reduce rotate range to `[-3, 3]`.
- Tighten x range to `["-5%", "25%"]` on mobile (full range only `md+`).
- Add `pointer-events-none` so it never blocks taps.

## 3. Smarter blog covers (categories + brief headline, not gibberish)

Right now covers show `№ 03` + a one-word kicker like "TOP 10" — no context, confusing. Rewrite `BlogCover.tsx`:

- **Top row**: small **CATEGORY chip** (left) + tiny `№ 03` issue tag (right). Categories: `GUIDES`, `CULTURE`, `ARTISTS`, `JOURNAL`, `DROPS` (extend `Post.tag` enum).
- **Middle**: **the actual post title, shortened** to 4-7 words (new optional `coverTitle` field, falls back to `title` truncated). Wrapped, 3 lines max, big `font-display`.
- **Bottom**: paw + `CATS · CAN · DANCE`.
- Drop the "kicker" entirely — that's what was confusing.
- Update `posts.ts`: add `category` and `coverTitle` per post; remove `kicker`.
- `Blog.tsx` & `Media.tsx` show category chip too so users can scan.

## 4. Pet section — both `/pets` page AND filter on `/shop`

**Shopify seed (3 placeholder products)**:

- `Cat Bucket Hat` — black, embroidered paw, "₹ 1,200" placeholder
- `Cat Bandana` — magenta, screen-print, "₹ 600"
- `CCD Cat Treats` — small bag, "₹ 400"
Each tagged `pets,pet,cat` and `product_type: Pet`. Created via `shopify--create_product` so they're real, purchasable, and Shopify-managed. Placeholder images use existing brand SVGs (`cat-headphones`, `cat-dancer`, etc.) — user can swap photos later.

**Shop page**: Add a **filter row** at top — `ALL / STREETWEAR / PETS` chips that filter the rendered grid by `product_type` / `tags`. Default = ALL.

**New `/pets` page** (`src/pages/Pets.tsx`):

- `PageHero` "PETS THAT PARTY" with subline "Streetwear for the floor — and your floor pet."
- Pulls Shopify products tagged `pets` via Storefront API `query: "tag:pets"`.
- Same brutalist card grid as Shop.
- Heavy SEO: `Product` + `CollectionPage` JSON-LD, keyword-rich H1/H2 ("Pet streetwear India", "cat bandanas Bangalore", "cat treats India"), SR-only paragraph.
- Linked from Nav (under "Shop" submenu or beside it), Footer, sitemap.
- New SEO meta: `Pet streetwear, cat bandana India, pet bucket hat, cat treats Bangalore`.

## 5. AI blog generator in Admin (3 questions → preview → publish)

**Backend**: New edge function `admin-generate-blog`:

- Accepts `{ topic, targetKeyword, angle, password }`.
- Validates admin password (same pattern as other admin functions).
- Calls Lovable AI Gateway (`google/gemini-2.5-pro` for quality) with a system prompt that produces SEO-heavy posts in CCD voice + the new structured shape (`title`, `excerpt`, `tag`, `category`, `coverTitle`, `coverColor`, `tldr[]`, `quickPicks{}`, `pullQuote`, `whatWedSkip`, `body[]`, `seoTitle`, `metaDescription`, `slug`).
- Uses tool-calling for structured JSON (no string parsing).
- Returns the generated draft as JSON.

**Frontend**: New **"BLOG"** tab in `Admin.tsx`:

1. **Step 1 — 3 questions form predetermined from research** :
  - Topic (e.g. "best Bangalore record stores")
  - Target keyword (e.g. "Bangalore record stores 2026")
  - Angle / personal hook (1-2 sentences from you, optional but improves humanness)
2. Click **GENERATE** → loading state → shows generated draft.
3. **Step 2 — preview & edit**: All fields editable inline. Live `BlogCover` preview. Edit any field including body paragraphs.
4. **Step 3 — publish**: Click **PUBLISH** → POST to a new edge function `admin-publish-blog` which appends to `posts` jsonb in `site_settings` (new column `blog_posts jsonb default '[]'`). Reads merged with static `src/content/posts.ts` at runtime.

`**Blog.tsx` / `BlogPost.tsx**` updated to load union of static posts + `site_settings.blog_posts` so AI-published posts appear instantly without redeploy.

**DB migration**: add `site_settings.blog_posts jsonb not null default '[]'`.

## 6. Rewrite 4 posts with your real human input

After this batch ships, in the **next turn** I'll ask you 3-4 quick questions per post (one post at a time so it's not overwhelming), then rewrite using your real names/venues/anecdotes:

- Best Underground Parties in Bangalore — names of venues / promoters / nights you'd actually recommend
- Top 10 Event Organisers in India — real crew names per city
- Behind the Decks: Bangalore's Rising DJs — the 6 DJs you'd vouch for
- Inside Episode 01 — where it was, who played, what happened, one anecdote

This keeps the SEO weight while making the content actually true.

## 7. SEO expansion — pet products + streetwear

- `index.html`: add `pet streetwear India, cat bandana, cat bucket hat, cat treats Bangalore` to keywords; add `Brand` JSON-LD entry for "pet products".
- `brand.json`: add `categories: [...,"Pet Products","Pet Accessories"]` + 2 FAQ ("Do you make pet products?", "Where to buy cat bandanas in Bangalore?").
- `llms.txt` + `llms-full.txt`: new **Pets** section with `/pets` URL and product list.
- `sitemap.xml`: add `/pets` + each pet product URL with `image:image`.

## Files touched

- `src/components/Footer.tsx` — smaller medallions, drop Karnataka
- `src/components/About.tsx` — overflow-visible, tighter cat motion
- `src/components/BlogCover.tsx` — rewrite (category + brief title)
- `src/content/posts.ts` — add `category`, `coverTitle`; drop `kicker`
- `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/components/Media.tsx` — show category, load from static + DB union
- `src/pages/Shop.tsx` — ALL/STREETWEAR/PETS filter chips
- `src/pages/Pets.tsx` — NEW page
- `src/components/Nav.tsx`, `src/components/Footer.tsx` — Pets link
- `src/pages/Admin.tsx` — new BLOG tab (3-step wizard)
- `supabase/functions/admin-generate-blog/index.ts` — NEW edge function (Lovable AI)
- `supabase/functions/admin-publish-blog/index.ts` — NEW edge function
- DB migration — `site_settings.blog_posts jsonb default '[]'`
- Shopify — create 3 pet placeholder products
- `index.html`, `public/brand.json`, `public/llms.txt`, `public/llms-full.txt`, `public/sitemap.xml` — pet SEO
- `src/App.tsx` — `/pets` route

No design system overhaul. No new npm packages. Real Shopify products (no mocks).