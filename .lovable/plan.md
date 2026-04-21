

# Streetwear SEO expansion + per-post blog imagery + discovery push

Three things in this batch: (1) lock the hero blue to `#2463eb` in the theme so it's permanent, (2) widen SEO to cover **streetwear / drops / collectibles** alongside parties, (3) give every blog post its own AI-generated hero image, (4) ship a discovery + backlink engine.

## 1. Lock hero blue to `#2463eb`
- Update `--electric-blue` in `src/index.css` to the HSL of `#2463eb` so the `bg-electric-blue` token matches everywhere.
- Remove the inline `bg-[#2463eb]` override on `Hero.tsx` once the token is correct (cleaner, future-proof).

## 2. SEO expansion: streetwear, drops, collectibles
Right now every meta tag, JSON-LD, llms.txt and sitemap entry talks only about parties/events. Add a parallel keyword spine.

**Target keywords**: *Bangalore streetwear brand, India streetwear drops, limited edition merch India, music collectibles India, party merch Bangalore, cat streetwear, underground streetwear India, drop culture India*.

- **`index.html`** — extend `<meta name="keywords">`, description, and Organization JSON-LD `category` array with `["Streetwear Brand","Apparel","Limited Drops","Music Merchandise","Collectibles"]`. Add a second JSON-LD node `@type: "Brand"` with `slogan`, `category: "Streetwear"`.
- **`src/pages/Shop.tsx`** — rewrite SEO title to `Cats Can Dance Shop — Limited Streetwear Drops & Collectibles | Bangalore` + description. Add `ItemList` JSON-LD of products (name, image, price) and `CollectionPage` schema. Wrap the page in visible H1 "Drops & Collectibles".
- **`src/pages/ProductDetail.tsx`** — already has `Product` schema; extend with `brand`, `category: "Streetwear"`, `audience: { @type: "PeopleAudience", suggestedGender: "unisex" }`, `additionalProperty` for "Limited drop" badge.
- **`src/components/Drops.tsx`** — add SR-only line: "Limited streetwear drops and collectibles from Cats Can Dance, Bangalore" so the homepage section is crawlable for these terms.
- **`public/brand.json`** — add `categories: [...existing, "Streetwear", "Limited Drops", "Collectibles"]`, new `products` summary, new `faq` entries ("Where to buy Cats Can Dance merch?", "When is the next drop?").
- **`public/llms.txt` + `llms-full.txt`** — add a **Shop / Drops** section listing every product URL with one-line descriptions. Lead paragraph extended to "…dance music parties **and a streetwear label of limited drops and collectibles**…".
- **`public/sitemap.xml`** — add every `/shop/:slug` product URL with `<image:image>` tags (image sitemap extension) so Google Images indexes drops.

## 3. Unique AI-generated hero image per blog post
Currently all 7 posts share one image. Generate a distinct one per post via the Lovable AI image script.

- Run the `ai-gateway` skill with `google/gemini-3.1-flash-image-preview` for each of the 7 posts using prompts derived from the post title/topic (e.g. for "Best Underground Parties in Bangalore" → moody Bangalore skyline + neon, brutalist poster collage style consistent with brand).
- Save to `public/blog/<slug>.png` (1200×630, also reusable as OG image).
- Update `src/content/posts.ts` so each post has `image: "/blog/<slug>.png"` and `ogImage` matching.
- `BlogPost.tsx` already passes `image` to `<SEO>`; verify per-post OG works.
- Add `<img>` with descriptive `alt` like "Underground party in Bangalore by Cats Can Dance" — keyword + entity.

## 4. Discovery + backlink engine
SEO is half on-page, half off-page. Make it easy (and trackable) to ship backlinks.

### a. Outreach helper in admin
Expand the **SEO Checklist** tab in `src/pages/Admin.tsx` with a new **Backlinks** sub-section:
- **Pre-written pitch templates** (copy-to-clipboard) for: Wild City, Rolling Stone India, Homegrown, Mid-day Bangalore, The Hindu MetroPlus, Insider.in editorial, Skiddle, Resident Advisor.
- **Directory submission links** (one-click open): Google Business Profile, Bing Places, Insider.in promoter signup, Skiddle promoter, RA promoter, Songkick, Bandsintown, JamBase, Eventbrite organiser, Allevents.in, Eventil, India Nightlife, LBB Bangalore, Little Black Book.
- **Streetwear directories**: Hypebeast tips, Highsnobiety submit, Sneaker News India, The Established, Lifestyle Asia India, Grailed seller signup, Depop.
- **Status tracker**: each row has a `pending / submitted / live` toggle stored in `site_settings.backlinks` jsonb (new column via migration). Lets the team see progress.

### b. Auto-generated press kit page
New route `/press` (`src/pages/Press.tsx`) with:
- Brand description (3 lengths: 50 / 150 / 500 chars — for press to copy)
- Logo downloads (PNG light/dark, SVG)
- Founder bios + headshots
- Photo gallery from past events (downloadable zip link)
- Press contact email
- Linked from footer + `brand.json` + `llms.txt`. Massive backlink magnet — every outlet that covers you needs this page.

### c. Embeddable widgets (link-bait)
- New `/embed/upcoming` route returning a tiny iframe-friendly card listing next 3 events. Other Bangalore blogs / venue sites embed it → each embed = a backlink. Add a "Copy embed code" button in admin.

### d. Schema additions for discovery surfaces
- Add `Brand` + `OnlineStore` JSON-LD on `/shop`.
- Add `Person` schema for founders on `/about` (LinkedIn `sameAs`).
- Add `WebSite` schema with `potentialAction: SearchAction` on homepage so Google shows a sitelinks search box.
- Add `Speakable` schema on FAQ + key paragraphs (helps Google Assistant / voice).

### e. Content velocity (long-term ranking)
- 4 new pillar posts focused on streetwear + culture (added to `src/content/posts.ts`):
  1. "Inside the Cats Can Dance Streetwear Drop"
  2. "The Rise of Music Merch as Collectibles in India"
  3. "How Bangalore's Underground Brands Build Cult Followings"
  4. "Limited Drops 101: Why Scarcity Sells"
- Each 800-1200 words, internal-linked to `/shop`, `/events`, other posts. Each gets its own AI image.

### f. Social + share boosters
- Add `og:image` per blog post (already wired) + `twitter:creator` meta.
- Add a "Share" button row to every blog post + product (WhatsApp / X / copy link). More shares = more crawlable mentions.
- Add `<link rel="me" href="https://instagram.com/catscandance">` etc. in `<head>` for Mastodon/IndieWeb verification.

### g. RSS feed
- New `/rss.xml` static (regenerated when posts change) — picked up by Feedly, Inoreader, NetNewsWire users + AI training pipelines.

## 5. Performance tightening (re-confirm)
- Audit images audited in round 2 — also serve `<img loading="lazy" decoding="async">` on all blog hero thumbs.
- Add `Cache-Control` for `/blog/*.png` and `/og/*.png` in `public/_headers`.

## Files touched
- `src/index.css` — `--electric-blue` → `#2463eb` HSL
- `src/components/Hero.tsx` — drop inline override
- `index.html` — keywords + Brand schema + WebSite SearchAction + verification slots intact
- `src/pages/Shop.tsx` + `ProductDetail.tsx` — streetwear copy + schema
- `src/components/Drops.tsx` — SR-only keyword line
- `public/brand.json` — extended categories + faq + products
- `public/llms.txt` + `llms-full.txt` — Shop section + streetwear lead
- `public/sitemap.xml` — product URLs + image sitemap entries
- `src/content/posts.ts` — 4 new streetwear posts; image field per post
- `public/blog/*.png` — NEW, 11 unique AI-generated hero images
- `src/pages/BlogPost.tsx` — render hero `<img>` with keyword alt
- `src/pages/Admin.tsx` — Backlinks sub-tab (templates, directories, status)
- `src/pages/Press.tsx` — NEW press kit page
- `src/pages/Embed.tsx` — NEW `/embed/upcoming` widget
- `src/components/Footer.tsx` — Press link
- `public/rss.xml` — NEW
- `public/_headers` — cache rules for new assets
- DB migration — `site_settings.backlinks` jsonb default `'[]'`

No new npm dependencies. No design changes beyond the locked-in blue.

