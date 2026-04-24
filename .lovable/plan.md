

# Fix: RSVPs panel, nav alignment, autoplay GIF, pet merch on home, fix crawl URLs

## 1. RSVPs not showing in admin
The Admin dashboard has no RSVPs tab. The `admin-rsvps` edge function exists and works — we just never surfaced it.

**Fix in `src/pages/Admin.tsx`:**
- Add new state `rsvps: { id, event_slug, name, email, plus_ones, created_at }[]` and a `rsvpEventFilter` string.
- Add `loadRsvps()` calling `GET {projectUrl}/functions/v1/admin-rsvps?event_slug=...` with `x-admin-password` header (mirroring `callContent` pattern).
- Add a new `<TabsTrigger value="rsvps">RSVPS</TabsTrigger>` and matching `<TabsContent>` with:
  - event-slug filter dropdown (built from existing `events` list + "All")
  - count + DOWNLOAD CSV button (calls same function with `?format=csv`)
  - table: event slug · name · email · plus_ones · created_at
- Auto-load when tab is opened the first time.

## 2. Nav text alignment (Partners / More sit above the rest)
Cause: in `src/components/Nav.tsx` the `Dropdown` `<li>` has `className="relative pb-2"` while sibling primary `<li>`s have no padding. The extra `pb-2` (and the trigger button having `<ChevronDown>` flex centering) shifts the dropdown labels visually up relative to plain links.

**Fix:**
- Drop `pb-2` from the Dropdown `<li>` (keep hover gap closure inside the panel which already uses `pt-2` — that already prevents the close-too-early bug).
- Make the dropdown trigger `button` `inline-flex items-baseline gap-1` and wrap the chevron in a span with `self-center` so the text baseline aligns with the plain `RouterNavLink`s.
- Make the parent `<ul>` `items-baseline` instead of `items-center` so all link text shares a baseline; keep CTA + DiscoButton + Cart wrapped in their own flex group with `items-center` to avoid breaking those icons.

Concretely: split the `<ul className="hidden lg:flex items-center gap-4">` into:
```tsx
<ul className="hidden lg:flex items-baseline gap-4">
  ...primary links + Dropdown(Partners) + Dropdown(More)
</ul>
<div className="hidden lg:flex items-center gap-3">
  <DiscoMute /> <DiscoButton compact /> {hasCart && <CartDrawer />} <EarlyAccessCta />
</div>
```

## 3. GIF should autoplay (no PLAY GIF button)
**Fix in `src/pages/EventDetail.tsx` `RecapMedia`:**
- Remove the static-fallback-first behaviour and the `▶ PLAY GIF` button.
- Default `src` to `gifSrc`. If it errors, swap to the static `RECAP_FALLBACK[slug]`. No button. No "showingGif" state.
- Keep `loading="eager"` + `fetchPriority="high"`.

This means the GIF starts loading & playing immediately. Static PNG remains as silent fallback if the GIF 404s or fails.

## 4. Pet merch on the homepage `Drops` section
**Fix in `src/components/Drops.tsx`:**
- Run two Storefront queries in parallel: `query: null` (general — used as streetwear pool) and `query: "tag:pets"`.
- Render two side-by-side mini-grids on the section:
  - Left column: `STREETWEAR` heading + 2 latest non-pet products (filter out items tagged `pets`/`pet` from the general pool, slice 2)
  - Right column: `PET MERCH` heading + 2 latest pet-tagged products
- Each card links to `/product/{handle}`; reuse the existing card markup.
- Keep the single `SHOP THE DROP` CTA, plus add a secondary `SHOP PET MERCH → /pets` chip below (small, lime).
- Mobile: stacks (streetwear first, then pets). Skeleton while loading.
- Copy stays "WEAR THE CULTURE." headline; small subhead "Streetwear + pet drops. Limited. No restocks."

## 5. Curated crawler — actually use the working listing URLs
The current `listingUrl` templates don't match the real working pages. Replace with the URLs the user provided + verified equivalents.

**Fix in `supabase/functions/curate-events/index.ts`:**

Update `SOURCES`:
```ts
skillboxes:  https://www.skillboxes.com/events-{city}        // bangalore, mumbai, delhi, pune
sortmyscene: https://sortmyscene.com/events?tab=events&city={Capitalized} // Bengaluru/Mumbai/Delhi/Pune
district:    https://www.district.in/events/music-in-{citySlug}-book-tickets // bengaluru/mumbai/new-delhi/pune
insider:     https://insider.in/{citySlug}/nightlife          // unchanged
highape:     https://highape.com/{city}/events                // unchanged
bookmyshow:  https://in.bookmyshow.com/explore/events-{citySlug}
```

Add per-city overrides:
- `bangalore`: skillboxes slug `bangalore`, sortmyscene `Bengaluru`, district `bengaluru`, insider `bengaluru`
- `mumbai`: all `mumbai` / `Mumbai`
- `delhi`: skillboxes `delhi`, sortmyscene `Delhi`, district `new-delhi`, insider `new-delhi`
- `pune`: all `pune` / `Pune`

Tighten `linkMatch` patterns so we only follow real event detail pages from these listing URLs:
- skillboxes: only `/events/{slug}` — already correct
- sortmyscene: `sortmyscene.com/events/[^/?#]+` (not `/events?...`)
- district: `district.in/events/[^/?#]+` (book-tickets variant accepted)

**City filter loosening:** the AI was rejecting good events because the `venue` field doesn't always include the city word. Change `venueMatchesCity` to check `venue + blurb + sourceUrl + page-markdown-slice (first 500 chars)` and require either a city alias OR an explicit reject (Goa, Hyderabad, Chennai, Kolkata, Jaipur etc.) being absent. Pass markdown into the function for that check.

Also: the AI prompt currently forces "future events only" — many listing pages embed past events. Keep that filter but allow rows with no date so we don't lose events whose date isn't in extracted text.

Increase `waitFor` to 5000 for skillboxes too (it's JS-rendered now), add `onlyMainContent: false` (already set) and add `formats: ["markdown", "links"]` for listings, `["markdown"]` for detail.

**Stats:** keep returning per-source `samples` so we can debug from admin UI when the listing-link extraction misses.

## 6. Files touched
- `src/pages/Admin.tsx` — RSVPs tab + loader + CSV download
- `src/components/Nav.tsx` — baseline alignment + drop `pb-2` from Dropdown li, split utility cluster from text links
- `src/pages/EventDetail.tsx` — `RecapMedia` autoplays GIF, no button
- `src/components/Drops.tsx` — dual grid: streetwear + pet merch with second CTA
- `supabase/functions/curate-events/index.ts` — fix listing URLs to match user-provided pages, broaden city filter to include markdown context

No DB schema changes. No new connectors. After deploy: open Admin → RSVPS to verify, and Admin → CURATED, pick `skillboxes` + `Bangalore` → `🔄 REFRESH SOURCE`.

