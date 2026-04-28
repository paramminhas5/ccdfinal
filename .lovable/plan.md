## Goal

Three things in one sprint:

1. **SEO 10×**: wire static prerendering + per-route OG images + Lighthouse fixes.
2. **Events page**: move the "Host with us" strip to the bottom (under curated events).
3. **Contact UX**: replace every `mailto:` CTA button on partner/artist/investor/press/venue pages with a typed-form dialog. Email addresses stay as a small "or email us directly" fallback link.

---

## 1. Static prerendering (the big SEO win)

Add `vite-plugin-prerender` (puppeteer-based) to `vite.config.ts` and prerender every static route:

```text
/, /events, /shop, /pets, /videos, /playlists, /media, /press, /about,
/blog, /scene-guide-bangalore, /for-venues, /for-artists, /for-investors,
/submit-event, /privacy, /terms, /cookies, /cat-studio
```

Dynamic routes (`/events/:slug`, `/blog/:slug`, `/shop/:handle`) get a small build-time crawler step that reads the published list from Supabase + `src/content/posts.ts` and feeds those URLs into the prerender list. Output goes to `dist/<route>/index.html` so Netlify/Cloudflare serves real HTML to bots, ChatGPT, LinkedIn, Slack, WhatsApp on first request.

Result: meta tags + JSON-LD + first paint exist in the raw HTML → fixes the social-scraper gap and speeds Google indexation.

## 2. Per-route OG images

Add a tiny build-time script `scripts/generate-og.mjs` that uses `@vercel/og` (or `satori` + `sharp`) to render a 1200×630 PNG per route from a template (title + eyebrow + brand colors + magenta/ink palette). Output to `public/og/<slug>.png`. `SEO.tsx` picks `og/<slug>.png` when present, falls back to current default.

## 3. Lighthouse / Core Web Vitals pass

- Add `<link rel="preload" as="image" ...>` for the homepage hero image.
- Add `loading="lazy"` + `decoding="async"` to all non-hero `<img>` (audit `Posts`, `Drops`, `Videos`, `CuratedEvents`, `EventDetail`, `BlogPost`, `ProductDetail`).
- Add `width`/`height` attributes where missing to kill CLS.
- Add `fetchpriority="high"` to LCP image on `Index`.
- Move the YouTube iframe in `Videos` behind a "click to play" thumbnail (saves ~500KB JS on first load).
- Add `<link rel="preconnect">` for `cdn.shopify.com` and the Supabase project URL.

## 4. Events page reorder

In `src/pages/Events.tsx`: move the **HOST WITH US** `<section class="bg-ink ...">` from above `<CuratedEvents />` to **below** it, just before `<Footer />`. No other changes.

## 5. Replace `mailto:` partner CTAs with a typed contact dialog

Build a new shared component `src/components/PartnerContactDialog.tsx`:

- Triggered by a button (`<PartnerContactButton kind="venues" label="PARTNER WITH US →" />`).
- Opens a `Dialog` (shadcn) with the same brutalist styling as `Contact.tsx`.
- Fields: Name, Email, Phone (optional), Reason (preselected based on `kind`), Message.
- `kind` → preselected reason + email-fallback link:
  - `venues` → "Venue partnership" → venues@catscandance.com
  - `artists` → "Artist booking" → artists@catscandance.com
  - `investors` → "Investor enquiry" → invest@catscandance.com
  - `press` → "Press / interview" → hello@catscandance.com?subject=Press
  - `team` → "Join the pack — {role}" → hello@catscandance.com
  - `submit-event` → "Submit an event" → hello@catscandance.com
- Reason options inside the dialog let users override (dropdown).
- Submits to the existing `contact-submit` edge function, prefixing the message with `[kind][reason]` so admin can filter in `Admin.tsx`.
- Below the submit button: small "Or email us directly: artists@catscandance.com" plain `mailto:` link as the user requested.

Update `contact-submit` edge function: extend the Zod schema to accept optional `phone`, `kind`, `reason` fields, and store them in the message body (no schema change needed to `contact_messages` — concatenate into `message`).

### Files updated to use the dialog

- `src/pages/ForVenues.tsx` → "PARTNER WITH US"
- `src/pages/ForArtists.tsx` → "PLAY WITH US" / equivalent CTA
- `src/pages/ForInvestors.tsx` → "INVEST WITH US"
- `src/pages/Press.tsx` → "PRESS ENQUIRY"
- `src/pages/SubmitEvent.tsx` → the inline "Email us" text becomes the dialog
- `src/components/Team.tsx` → each role's "apply" button + the bottom "say hi anyway" link
- `src/components/Footer.tsx` → keep the simple `mailto:` link (it's a link, not a CTA — user said that's fine)
- `src/pages/Admin.tsx` → leave the admin inbox `mailto:` links (internal tool)
- `src/pages/Privacy.tsx`, `Terms.tsx`, `Cookies.tsx` → leave (legal-text inline links, user said that's fine)

## 6. Sitemap regeneration

Add `scripts/generate-sitemap.mjs` (runs in `prebuild`) that pulls events from Supabase + posts from `src/content/posts.ts` and rewrites `public/sitemap.xml` + `public/rss.xml` automatically. No more drift.

---

## Technical notes

- Prerender plugin: `vite-plugin-prerender` requires `puppeteer`; we'll pin to a small Chromium and only run during `vite build`. Local `vite dev` is unchanged.
- The dialog uses existing shadcn `Dialog` — no new deps.
- `contact-submit` change is backwards-compatible (new fields all optional).
- Per-route OG generation runs in `prebuild`; cached via file mtime so rebuilds are fast.

## Files touched

**New**: `src/components/PartnerContactDialog.tsx`, `src/components/PartnerContactButton.tsx`, `scripts/generate-og.mjs`, `scripts/generate-sitemap.mjs`, `scripts/prerender-routes.mjs`

**Modified**: `vite.config.ts`, `package.json`, `index.html`, `src/components/SEO.tsx`, `src/pages/Events.tsx`, `src/pages/ForVenues.tsx`, `src/pages/ForArtists.tsx`, `src/pages/ForInvestors.tsx`, `src/pages/Press.tsx`, `src/pages/SubmitEvent.tsx`, `src/components/Team.tsx`, `src/components/Videos.tsx`, `src/components/Posts.tsx`, `src/components/Drops.tsx`, `src/components/CuratedEvents.tsx`, `supabase/functions/contact-submit/index.ts`, `public/sitemap.xml`, `public/rss.xml`

Approve and I'll wire it all up in one go.
