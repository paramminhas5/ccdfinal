# Hero cats, About cat fix, Pets section, AI blog generator, SEO

Five things, no new deps.

## 1. Hero — add 2 more cats (different ones)

`src/components/Hero.tsx`: add two more flanking cats positioned mid-height on the sides (desktop) and tucked near top (mobile), using assets we haven't used yet on the hero: `cat-raver.png` and `cat-streetwear.png`. Each gets gentle scroll motion (different x/rot direction from existing flankers so they feel distinct, not duplicated).

- Desktop: `cat-raver` mid-left at `top-1/3 left-2 w-28`, scroll moves `x: 0→-40%, rot: 0→-15`. `cat-streetwear` mid-right at `top-1/3 right-2 w-28`, mirror.
- Mobile: smaller `w-14`, anchored just below the stars area at `top-44`, slight wiggle.
- All `pointer-events-none`, `drop-shadow-[6px_6px_0_hsl(var(--ink))]`, `z-20` (behind the headline `z-30` won't apply — keep z-10 to sit between stars and headline).

## 2.the brand section cat  — make the cat bigger and actually walk on scroll

Current cat: `w-2/5 sm:w-1/2 md:w-2/3 max-w-[160px]` + `x: ["-5%","25%"]` — so it's tiny and barely moves. Fix:

- Mobile size: `w-3/4 max-w-[220px]`; desktop `md:max-w-sm`.
- Walk range: `x: ["-20%", "120%"]` mobile, `["-10%", "150%"]` desktop — clearly traverses the column on scroll.
- Add a step-y bob synced to scroll progress so it looks like it's walking (small vertical sine via `useTransform` with multiple keyframes: `[0,0.25,0.5,0.75,1] → [0, -8, 0, -8, 0]` px).
- Slight rotate sway: `rot: [-6, 6]` on scroll.
- Column height bumped to `h-64 sm:h-72 md:h-80`.

## 3. Pets — Shopify products + `/pets` page + Shop filter chips

**Shopify seeding** (real products via `shopify--create_product`):

1. **Cat Bucket Hat** — `product_type: "Pet"`, tags `pets,pet,cat,bucket-hat,streetwear`, ₹1200, image `src/assets/cat-headphones.png`.
2. **Cat Bandana** — tags `pets,pet,cat,bandana`, ₹600, image `src/assets/cat-dancer.png`.
3. **CCD Cat Treats** — tags `pets,pet,cat,treats,food`, ₹400, image `src/assets/boombox.png` (placeholder until real photo).

`**src/pages/Pets.tsx**` (NEW):

- `PageHero` "PETS THAT PARTY" / "Streetwear for the floor — and your floor pet."
- Reuses `storefrontApiRequest` with `query: "tag:pets"` to pull only pet-tagged products.
- Same brutalist card grid + "Add to Cart" as `Shop.tsx` (extract a tiny `ProductCard` shared component to avoid duplication).
- Heavy SEO: `Product` + `CollectionPage` + `Brand` JSON-LD; H1 "Pet streetwear in India — bandanas, bucket hats & cat treats from Bangalore"; SR-only paragraph hitting `cat bandana India`, `pet bucket hat`, `cat treats Bangalore`, `pet streetwear`.

`**src/pages/Shop.tsx**` — add filter chips at top of grid: `ALL / STREETWEAR / PETS`, default ALL. Filter is client-side on already-fetched products by checking `product.productType === "Pet"` or `tags.includes("pets")` (need to add `productType` + `tags` to the GraphQL query in `src/lib/shopify.ts`).

`**src/components/Nav.tsx` + `src/components/Footer.tsx**` — add `/pets` link beside `/shop`.
`**src/App.tsx**` — register `/pets` route.

## 4. AI blog generator — Admin BLOG tab

**DB**: `site_settings.blog_posts` already exists. No migration needed.

**Edge function `admin-generate-blog**` (NEW):

- Validates `x-admin-password` against `ADMIN_PASSWORD`.
- Body: `{ category, title?, keyword?, angle? }` — all optional except `category`.
- The function holds **pre-researched keyword/title library** per category (server-side const map):
  - GUIDES → titles like "Best Underground Parties Bangalore 2026", keywords `bangalore underground events, techno bangalore`.
  - CULTURE → "Why Bangalore's Dance Floors Hit Different", keywords `bangalore club culture, electronic music india`.
  - ARTISTS → "Rising DJs in Bangalore You Should Book Now", keywords `bangalore djs, indian electronic artists`.
  - JOURNAL → "Inside Episode 02: Notes From The Floor", keywords `cats can dance episode, ccd events`.
  - DROPS → "Cat Bandana Drop Notes — Limited Run", keywords `cat streetwear india, cat bandana, pet streetwear`.
  - PETS → "Best Cat Bandanas in India 2026", keywords `cat bandana india, pet bucket hat, cat treats bangalore`.
- If user leaves title/keyword blank, function picks a fresh one from the library that doesn't collide with already-published slugs (fetched from `site_settings.blog_posts`).
- Calls Lovable AI (`google/gemini-2.5-pro`) via tool-calling with strict schema returning: `slug, title, excerpt, category, coverTitle, tag, tldr[], quickPicks{title, items[]}, pullQuote, whatWedSkip, body[], seoTitle, metaDescription, dateISO`.
- System prompt enforces: first-person CCD voice, Bangalore specifics, 700-1000 words, target keyword in title + first paragraph + once mid-body, TL;DR + pull-quote + "what we'd skip" mandatory, byline `— The Pack`.
- Returns the draft JSON.

**Edge function `admin-publish-blog**` (NEW):

- Validates admin password.
- Body: full post object (after user edits).
- Reads `site_settings.blog_posts`, prepends new post (newest first), writes back via service role.
- Returns success.

`**supabase/config.toml**`: add both functions, `verify_jwt = false` since they self-validate.

**Admin UI — new BLOG tab** in `src/pages/Admin.tsx`:

- **Step 1 — Compose**: Category dropdown (required), optional Title, optional Target Keyword, optional Angle (textarea). Two buttons: "GENERATE FROM RESEARCH" (uses library) and "GENERATE WITH MY INPUTS".
- **Step 2 — Preview & Edit**: All returned fields shown as editable inputs/textareas. Live `<BlogCover />` preview using current values (category, coverTitle, issue=auto). TL;DR bullets editable as a list. `body[]` editable as a single textarea split on `\n\n`.
- **Step 3 — Publish**: PUBLISH button → POSTs to `admin-publish-blog`. On success, toast + reset wizard. Lists last 10 published posts under the wizard with delete (calls `admin-publish-blog?action=delete&slug=...`).

**Frontend integration**: `useDynamicPosts` already merges DB posts into the static list, so published posts appear instantly on `/blog` and `/blog/:slug`.

## 5. SEO expansion — pets + streetwear

- `index.html` `<meta name="keywords">`: append `pet streetwear India, cat bandana India, cat bucket hat, cat treats Bangalore, pet products`.
- `public/sitemap.xml`: add `<url>` for `/pets` (priority 0.8, weekly).
- `public/brand.json`: extend `categories` with `Pet Products, Pet Accessories`; add 2 FAQs ("Do you make pet products?", "Where to buy cat bandanas in Bangalore?").
- `public/llms.txt` + `public/llms-full.txt`: new "Pets" section with `/pets` URL and the 3 product names.

## 6. Human-input rewrites — next turn

After this batch ships, I'll ask 3-4 questions per post (one at a time so it's not overwhelming), then rewrite and replace in `src/content/posts.ts`:

- **Inside Episode 01** — venue, date, lineup, one anecdote, one regret.
- **Behind the Decks: Bangalore's Rising DJs** — 5-6 DJs you'd vouch for + a one-line vibe each.
- **Top 10 Event Organisers in India** — real crew names per city.
- **Best Underground Parties in Bangalore** — venues, promoters, regular nights.

## Files touched

- `src/components/Hero.tsx` — 2 new cats
- `src/components/About.tsx` — bigger cat, real walking motion
- `src/lib/shopify.ts` — add `productType` + `tags` to query
- `src/pages/Shop.tsx` — filter chips ALL/STREETWEAR/PETS
- `src/pages/Pets.tsx` — NEW
- `src/components/Nav.tsx`, `src/components/Footer.tsx` — Pets link
- `src/App.tsx` — `/pets` route
- `src/pages/Admin.tsx` — BLOG tab (3-step wizard)
- `supabase/functions/admin-generate-blog/index.ts` — NEW
- `supabase/functions/admin-publish-blog/index.ts` — NEW
- `supabase/config.toml` — register both, `verify_jwt = false`
- Shopify — create 3 real products
- `index.html`, `public/sitemap.xml`, `public/brand.json`, `public/llms.txt`, `public/llms-full.txt` — pet SEO

No new npm packages. No DB migration (column already exists).