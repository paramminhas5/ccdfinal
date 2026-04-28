# SEO Sprint — final pass

A note on the "GitHub pull": Lovable manages git state internally, so the codebase you see in the editor is already in sync with your repo — there is no separate manual pull step for me to run. I've audited the current tree (HEAD) and the plan below targets every gap I found.

## Status check (what's already done)
- `EventDetail` already has `MusicEvent` + `FAQPage` JSON-LD ✓
- `Index`, `Events`, `About`, `Pets`, `BengaluruSceneGuide` already have `FAQPage` ✓
- `ProductDetail` has `Product` schema (no FAQ yet) ✗
- `BlogPost` has `BlogPosting` schema (no FAQ, weak image, no `wordCount`/`articleSection`) ✗
- `sitemap.xml` and `rss.xml` exist but blog list is hand-maintained and out of date relative to `src/content/posts.ts` ✗
- Internal linking from blog posts → events / shop / related guides is sparse ✗

## 1. FAQ structured data on blog + product pages

**`src/pages/BlogPost.tsx`** — add a generic `FAQPage` JSON-LD built from the post (3 evergreen Q&As tied to its category) plus a richer `BlogPosting`:
- Use `BlogCover` colour as a hint for `articleSection` (= `post.category`).
- Add `wordCount` (computed from `post.body.join(" ")`), `keywords` (from tag/category), `isPartOf` → `Blog` `@type`.
- Use the post's actual cover (server-rendered OG fallback `og-image.jpg`) instead of hardcoded `og-image.png`.
- Inject 3 FAQ entries derived from category:
  - GUIDES → "Where are the best underground parties in Bangalore?", "How do I find dance music events in Bengaluru?", "What's the RSVP culture in Bangalore?"
  - DROPS → "Where can I buy Cats Can Dance streetwear?", "Do drops restock?", "Is shipping available across India?"
  - ARTISTS → "Who plays at Cats Can Dance?", "How do artists get booked?", "Where can I listen to CCD sets?"
  - CULTURE / JOURNAL → "What is Cats Can Dance?", "Where do CCD events happen?", "How do I join the pack?"
  - Default fallback set for any unrecognised category.

**`src/pages/ProductDetail.tsx`** — add a small `FAQPage` block:
- "Is this a limited drop?" → yes, no restocks
- "Where does it ship from?" → Bangalore, India; pan-India shipping
- "What's the return policy?" → exchanges within 7 days for sizing
- "How is it made?" → screen-printed in Bangalore

Pass both schemas via the existing `jsonLd={[productLd, faqLd]}` array.

## 2. Internal linking sprint

**Blog → site cross-links** (in `BlogPost.tsx`):
- After the body, before "Read next", add a contextual **"Take it further"** strip with 2–3 inline links chosen by category:
  - GUIDES / CULTURE → `/events`, `/bengaluru-underground-dance-music`, next upcoming event slug
  - DROPS → `/shop`, `/pets`, top product handle
  - ARTISTS → `/playlists`, `/videos`, `/events`
  - JOURNAL → `/about`, `/events`, `/blog`
- Make the existing "Read next" cards include the post excerpt (1 line) for richer anchor context.

**Events → blog cross-links** (in `EventDetail.tsx`):
- Below the lineup section add a "Read more from the journal" block linking to 2 related blog posts (filter by tag/category match, fallback to latest 2). Strengthens topical hub.

**Product → related** (in `ProductDetail.tsx`):
- Add a "More from the drop" strip that links to `/shop` and `/pets` with descriptive anchor text ("See all CCD streetwear", "Pet drops & treats").

**Footer (`src/components/Footer.tsx`):**
- Add a "DISCOVER" column with 4 high-value internal links: `/blog`, `/bengaluru-underground-dance-music`, latest event detail, latest blog post (computed at module level from `getAllPosts()`/static fallback).
- Adds 4 site-wide links to every page → big internal-link boost.

**Breadcrumbs:** verified all major pages already use `<Breadcrumbs>`. No change needed.

## 3. Sitemap + RSS auto-sync

`public/sitemap.xml` and `public/rss.xml` are static and have drifted from `src/content/posts.ts`. Two fixes:

a) **Refresh both files now** so every post in `posts.ts` is listed, with correct `lastmod`, plus the missing `/bengaluru-underground-dance-music` lastmod bump.

b) **Add a build-time generator** `scripts/generate-seo.mjs` that reads `src/content/posts.ts` (via tsx) and rewrites `public/sitemap.xml` and `public/rss.xml`. Wire it into `package.json` as `"prebuild": "node scripts/generate-seo.mjs"` so future post additions auto-propagate. (Falls back gracefully — never breaks the build.)

## 4. Per-page SEO polish

- **`src/pages/Blog.tsx`** — add `Blog` JSON-LD (`@type: Blog`) in addition to the existing `ItemList`, with `blogPost` array entries (headline + url + datePublished). Better than ItemList alone for Google Discover.
- **`src/pages/Shop.tsx`** — add `CollectionPage` + `ItemList` of products if not already present.
- **`src/pages/Events.tsx`** — already has `FAQPage`; add `ItemList` of upcoming/past events for richer SERP.
- **`src/components/SEO.tsx`** — add support for `prevUrl` / `nextUrl` (rel=prev/next for paginated lists, future-proof) and an `article:published_time` / `article:modified_time` pair when `type="article"`.

## 5. Hygiene checks

- **`index.html`** — add `<link rel="dns-prefetch" href="//cdn.shopify.com">` (Shopify storefront images), and `<link rel="preload" as="image" href="/og-image.jpg" fetchpriority="low">` only if it ends up being the LCP — otherwise skip to avoid waste. Confirm `<meta name="google" content="notranslate">` is **not** added (we want translation).
- **`public/robots.txt`** — verify `Sitemap:` line is present; add a second `Sitemap:` for any future sub-sitemap (none today, no-op).
- **404 (`NotFound.tsx`)** — add `<SEO noindex title="Page not found — Cats Can Dance" .../>` so dead URLs don't pollute the index.
- **Image alts audit** — quick pass on `Hero`, `Drops`, `Instagram`, `Videos`, `BlogCover` to ensure no `alt=""` on meaningful images.
- **`<a target="_blank">` audit** — ensure every external link has `rel="noopener noreferrer"` (already true in Footer; verify Press, Media, Instagram).
- **Canonical on `/embed/upcoming`** — already `noindex`; add explicit `canonical` to `/events` so any accidental backlink consolidates.

## 6. Technical reference (collapsed)

```text
Files to edit:
  src/pages/BlogPost.tsx        # FAQ + richer BlogPosting + internal links
  src/pages/ProductDetail.tsx   # FAQ + related links
  src/pages/EventDetail.tsx     # related blog posts strip
  src/pages/Blog.tsx            # Blog JSON-LD
  src/pages/Shop.tsx            # CollectionPage + ItemList
  src/pages/Events.tsx          # ItemList of events
  src/pages/NotFound.tsx        # noindex SEO tag
  src/components/Footer.tsx     # DISCOVER column
  src/components/SEO.tsx        # prev/next + article time meta
  index.html                    # dns-prefetch shopify
  public/sitemap.xml            # regenerated
  public/rss.xml                # regenerated

Files to create:
  scripts/generate-seo.mjs      # prebuild sitemap+rss generator
  package.json                  # add "prebuild" script
```

## Out of scope (call out)
- Server-side rendering / prerendering — would 10× SEO further but is a much bigger refactor (Vite SSR or pre-render plugin). Happy to do this next sprint; meta/JSON-LD via react-helmet works for Google but not for some social scrapers without prerender. Flag if you want me to add `vite-plugin-prerender` for the static pages now.
- GSC / Bing sitemap re-submission — must be done by you after deploy.
