# SEO Overhaul & Launch Hygiene

Goal: tight SEO hygiene, legal coverage, and a clean publish so the site is shareable today.

## 1. Legal pages (new)

Create three pages with proper SEO + last-updated dates and link them in the footer + a small "Legal" strip.

- `/privacy` — `src/pages/Privacy.tsx`: data collected (RSVPs, signups, cart, analytics), Lovable Cloud (Supabase) storage, Shopify checkout, cookies, third parties (YouTube, Spotify, Instagram, Plausible if enabled), user rights (access/delete via hello@catscandance.com), children, contact.
- `/terms` — `src/pages/Terms.tsx`: site use, RSVP rules, ticket/door policy, shop terms (defer to Shopify for orders/refunds), IP, disclaimers, governing law (India / Karnataka), contact.
- `/cookies` — `src/pages/Cookies.tsx`: essential vs analytics cookies, opt-out guidance.

Wire routes in `src/App.tsx`. Add a "LEGAL" column to `src/components/Footer.tsx` (Privacy, Terms, Cookies, Contact) and a thin bottom bar with © + legal links.

## 2. Sitemap + robots

- Regenerate `public/sitemap.xml` with **all** current routes (currently missing: `/playlists`, `/videos`, `/cat-studio`, `/privacy`, `/terms`, `/cookies`; admin/embed stay excluded).
- Update `<lastmod>` to today, fix priorities, keep image entries for shop/pets.
- Build `public/sitemap.xml` dynamically at build time from a small script so it never goes stale (optional — included as a `scripts/build-sitemap.mjs` run in `prebuild`). If user prefers static, skip the script.
- Add `Sitemap:` line is already there; also add `Disallow: /admin` and `Disallow: /embed/` to `robots.txt`.

## 3. Per-page SEO completeness

- Add `<SEO>` to `src/pages/Embed.tsx` with `noindex`.
- Audit each page's title/description for length (≤60 / ≤155 chars), uniqueness, and a real `image`/`imageAlt`. Quick pass over: Index, About, Events, EventDetail, Shop, ProductDetail, Pets, Blog, BlogPost, Press, Media, Playlists, Videos, CatStudio, ForVenues/Artists/Investors.
- Add JSON-LD where missing:
  - `EventDetail` → `Event` schema (name, startDate, location, offers, performer, image).
  - `ProductDetail` → `Product` + `Offer` schema (price, availability, brand).
  - `BlogPost` → `Article` schema (headline, datePublished, author, image).
  - `Blog` index → `Blog` + `BreadcrumbList`.
  - `About`, `ForVenues/Artists/Investors` → `BreadcrumbList`.
- Ensure every page renders `<Breadcrumbs>` (component exists) + matching `BreadcrumbList` JSON-LD.
- Standardize H1: exactly one per page.

## 4. Indexability + share previews

- Add `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` if available, keep `.ico` fallback.
- Add `<meta name="format-detection" content="telephone=no">` to avoid auto phone-styling on iOS.
- Confirm OG image is 1200×630 JPG <300KB (already done) and is reachable at the production domain.
- Add `<meta property="article:publisher">` + `<meta property="og:see_also">` for socials.
- Add a real `/favicon.ico` if it's still the placeholder.

## 5. Performance hygiene (affects SEO)

- Add `<link rel="preload" as="image" href="<hero image>" fetchpriority="high">` for the LCP image on `/`.
- Lazy-load below-the-fold images (`loading="lazy" decoding="async"`) — pass over Hero/Drops/Events/Posts/Media.
- Add `width`/`height` (or aspect-ratio CSS) on remaining `<img>` to remove CLS.
- Defer non-critical scripts (Spotify/YouTube embeds already lazy via routes — verify).

## 6. Accessibility hygiene (Google ranks it)

- Confirm every interactive element has accessible text (icon-only buttons need `aria-label`).
- `html lang="en"` already set; add `lang="en-IN"` consideration kept as-is.
- Color contrast spot-check on `text-cream/70` over `bg-ink` (passes), `acid-yellow` on cream (verify large-text only).

## 7. Analytics + verification

- Keep `SeoVerification.tsx` — confirm `site_settings.seo_verifications` row supports `google`, `bing`, `plausible_domain`. Document in README how to set them from Admin.
- Add a one-line note in `README.md` for post-launch: submit sitemap in Google Search Console + Bing Webmaster.

## 8. Publish

- Set publish visibility to `public` (`update_visibility: public`) so the live URL is open.
- Confirm custom domain `catscandance.com` is pointed and primary (already in project URLs).
- Re-check OG via Facebook Debugger / LinkedIn Inspector / Twitter card validator after deploy (manual, user-side).

## Files touched (summary)

- New: `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`, `src/pages/Cookies.tsx`
- Edited: `src/App.tsx`, `src/components/Footer.tsx`, `public/sitemap.xml`, `public/robots.txt`, `index.html`, `src/components/SEO.tsx` (minor), `src/pages/Embed.tsx`, `src/pages/EventDetail.tsx`, `src/pages/ProductDetail.tsx`, `src/pages/BlogPost.tsx`, `src/pages/Blog.tsx`, plus light per-page title/description tightening
- Optional: `scripts/build-sitemap.mjs` + `package.json` `prebuild` hook

## Out of scope (ask if you want them)

- Cookie consent banner (only needed if you target EU traffic).
- Programmatic image sitemap for every blog post.
- AMP / RSS feed expansion (RSS already exists).
