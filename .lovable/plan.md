# Wire up real content: Playlist, Shop, Videos, Instagram, Events

Phase-by-phase plan to plug in everything you sent.

## 1. Playlist — Spotify embed

Replace mock tracks in `Playlist.tsx` with the real Spotify embed:

- Iframe: `https://open.spotify.com/embed/playlist/1cEE860l9GiBvIYVM2BbSS?utm_source=generator&theme=0`
- Keep magenta section, "NOW SPINNING" header, and spinning vinyl
- Wrap iframe in `border-4 border-ink chunk-shadow-lg` to match brand style
- Height 480px desktop / 380px mobile

## 2. Shop — Stripe + 2 T-shirts

**Order of operations** (separate steps, can't combine):

1. Run `recommend_payment_provider` to confirm Stripe eligibility for apparel
2. Call `enable_stripe_payments` (creates test environment immediately)
3. Save uploaded shirts to `src/assets/tshirt-front.png` and `src/assets/tshirt-back.png`
4. Use `batch_create_product` to create:
  - **Cats Can Dance Tee — Front Print** (small logo on chest) — need price from you
  - **Cats Can Dance Tee — Back Print** (big dancing cat) — need price from you
5. Build `/shop` page (2-product grid using shadcn Card)
6. Replace `Drops.tsx` on home with a 2-card teaser linking to `/shop`
7. Each product card → "Add to cart" → Stripe Checkout session edge function
8. Add `/shop/success` and `/shop/cancel` routes
9. Webhook → store completed orders in new `orders` table for admin

**I'll need from you before step 4:**

- Price for each shirt (e.g. $35)
- Sizes you'll offer (S/M/L/XL?)
- Short product description for each

I'll use placeholders ($35, S–XL, generic copy) so checkout works end-to-end if you'd rather refine later.

## 3. YouTube videos — auto-updating

Channel `@ParamMinhas` — handle, not channel ID. The YouTube Data API needs the canonical `UC...` channel ID, so the edge function will:

1. Resolve handle → channel ID via `/channels?forHandle=ParamMinhas` (one call, cached forever in function memory)
2. Fetch latest 6 videos via `/search?channelId={id}&order=date&type=video`
3. Cache for 10 minutes

**Setup:**

- Replace/repurpose `Posts.tsx` → new `Videos.tsx` section on home
- New edge function `youtube-videos`
- Requires `YOUTUBE_API_KEY` secret (I'll request it via add_secret — free key from Google Cloud Console, 10k req/day quota)
- Renders 3-up grid → click opens lightbox with embedded `<iframe>` player
- Falls back to a "Subscribe on YouTube" CTA if API fails

## 4. Instagram — Behold.so

Easy path. Edge function `instagram-feed`:

- Fetches `https://feeds.behold.so/6bt7nDISwk0mUzAQMd9s`
- Caches 15 min
- Returns normalized `{ id, mediaUrl, permalink, caption }[]`

`Instagram.tsx`:

- Replace 9 paw emoji tiles with real posts
- Show first 9, each clicks through to its IG permalink
- Loading skeleton; falls back to "Follow on Instagram" CTA on error

No secret needed — Behold URL is public.

## 5. Events — Bangalore + Episode 1 photo

**Episode 02 hero card** (`Events.tsx` + `EventDetail.tsx` + `Events` page):

- City: **BANGALORE** (was Brooklyn)
- Date: TBA, Venue: TBA, lineup: TBA

**Episode 01 (past)**:

- City: BANGALORE
- Need from you: photo upload + venue name + actual date
- For now I'll set city to Bangalore and leave venue/date as TBA placeholders, and add a hero image slot in `EventDetail.tsx` ready for when you upload the photo
- Add `pastEpisodeImage` field to event data; render at top of detail page if present

**Cleanup:** Update `EventDetail.tsx` `events` map and the past-episodes strip in `Events.tsx` to swap "Brooklyn" → "Bangalore".

## Execution order

1. **Playlist swap** (zero deps) — 1 file
2. **Events: Bangalore swap + Episode 1 photo slot** — 2 files
3. **Instagram via Behold** (no secret) — 1 edge function + 1 component update
4. **YouTube** — request `YOUTUBE_API_KEY`, then function + section
5. **Shop** — eligibility check → enable Stripe → upload assets → batch_create_product → build `/shop` + checkout flow

Phases 1–3 ship in one pass. Phase 4 pauses to request the YouTube API key. Phase 5 is the longest — pauses to confirm Stripe enablement and product details.

## Decisions I still need

1. **Shirt pricing/sizes/descriptions** — give me the details, or say "use placeholders" and I'll ship $35 / S-XL / generic copy
2. **Episode 01 photo + venue + date** — upload now or after this batch?
3. **YouTube API key** — OK for me to request `YOUTUBE_API_KEY` as a secret when I get to Phase 4? (Free, instructions: Google Cloud Console → Enable YouTube Data API v3 → Create API key)  
4. also add images and covers of the previous event 

Reply with answers (or "use placeholders, request the key, ship it") and I'll start.