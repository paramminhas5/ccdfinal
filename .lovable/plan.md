

# Episode 2, Catbot, Shop, Real Playlists, YouTube + Instagram

## 1. Hero — recenter the DJ cat

The DJ cat drifts right because `bottom-0` + `left-1/2 -translate-x-1/2` interacts with the side cats and the `95vw` width on small viewports. Fix:
- Use `inset-x-0 mx-auto` (true horizontal centering) instead of left-50%/translate.
- Cap width at `max-w-[680px]` and reduce mobile width to `w-[88%]` so it doesn't lean.
- Tighten side cats to `w-24` on mobile so they don't push the visual weight right.

## 2. Events — Episode 2 front and center + RSVP

Replace the current 4-card grid with one **hero event card** (Episode 2) + a small "past episodes" strip below.

**Episode 2 hero card** (full-width, magenta on lime, chunk-shadow-lg):
- Big date, city, venue, "EPISODE 02" tag
- Lineup blurb
- Two CTAs: **RSVP** (opens modal) and **View details** (links to `/events/episode-2`)

**RSVP flow:**
- New table `event_rsvps` (`id`, `event_slug`, `name`, `email`, `plus_ones`, `created_at`, unique on `event_slug + email`)
- RLS: public `INSERT` only; admin `SELECT` via existing admin edge function
- New edge function `event-rsvp` with Zod validation + honeypot
- Modal uses shadcn `Dialog` + `Form`, success → confetti + toast
- `/admin` gets a second tab listing RSVPs per event with CSV export

**Events page** (`/events` route, plus `/events/:slug`):
- Lists all editions (Episode 1 archived, Episode 2 upcoming)
- Detail page with full lineup, venue map link, RSVP form inline

## 3. Catbot — replace the ScrollPaw

Remove `ScrollPaw` from the home page. Add a new `Catbot` floating button (bottom-right) that opens a chat panel.

**Tech:**
- Floating button: cat-face SVG with a small "ask me" tooltip
- shadcn `Sheet` (slide-up on mobile, side panel on desktop) for the chat UI
- Edge function `catbot-chat` calls **Lovable AI Gateway** (`google/gemini-2.5-flash`, no API key needed)
- System prompt pre-loaded with site facts: next event (Episode 2 details), current drops, links to playlist/IG/shop, brand voice
- Tool/data injection: at request time, edge function fetches the next upcoming event and active products from the DB and injects them into the system prompt so answers stay fresh
- Streaming response rendered with `react-markdown`
- Message history kept client-side only (sessionStorage) — no auth needed
- Suggested prompts shown on open: "When's the next event?", "What drops are live?", "Where can I find the playlist?"

## 4. Shop — 2 real T-shirts with Stripe checkout

Replace the placeholder `Drops` grid with a real 2-product shop.

**Recommended provider:** Lovable's built-in **Stripe Payments** (no account setup needed, test mode immediately, lower fees for physical goods at this scale than Shopify's monthly cost).
- Note: Stripe handles the payment, but you'll be on the hook for fulfillment/shipping yourself (printing, packing, mailing). If you want the platform to manage inventory and shipping labels too, **Shopify** is the alternative — say the word and we'll go that route.

**Flow:**
1. Run `recommend_payment_provider` to confirm Stripe eligibility for apparel
2. Enable Stripe payments
3. Create the 2 products (you'll provide: name, price, description, image; I'll handle the create-product calls)
4. Build a `/shop` page with both products + product cards on home (`Drops` becomes a 2-card showcase linking to `/shop`)
5. Each product → Stripe Checkout session edge function → success/cancel pages
6. Order webhook stores orders in an `orders` table for the admin

You'll need to upload the 2 T-shirt photos before I generate the Stripe products. Plain question I'll need answered after this plan: name, price, description, sizes, photo for each shirt.

## 5. Real playlists — replace mock tracks

Two options, my recommendation is **Spotify embed** (zero config):
- Replace the mock track list with a Spotify embedded playlist iframe (`https://open.spotify.com/embed/playlist/{PLAYLIST_ID}`)
- Keep the magenta section, big "NOW SPINNING" header, vinyl spin animation
- Add a small grid below for "Other playlists" (each an embedded mini-player)
- You'll provide the Spotify playlist URL(s); I'll wire them in

If you use SoundCloud or Apple Music instead, same pattern with their embed URLs. Tell me which.

## 6. YouTube videos section

Rename `Posts` → `Videos` (or keep Posts hidden until you have articles, add a new `Videos` section).

**Approach:** YouTube channel feed via a single edge function:
- Edge function `youtube-videos` calls YouTube Data API v3 (`/search?channelId=...&order=date`) and caches results for 10 min
- Requires a YouTube Data API key (free, 10k requests/day quota) — I'll request it via secrets when we get to this phase
- Renders 3-up grid of latest videos, each clicks into a lightbox with the embedded player
- Falls back to a hardcoded list of video IDs if API call fails

Alternative if you don't want to deal with an API key: I just hardcode an array of YouTube video IDs you give me, and we render `<iframe>` embeds. Faster, but you'd update the code each time you upload a video. Tell me which you prefer.

## 7. Instagram — how to actually hook it up

Real Instagram embedding requires the **Instagram Graph API** (the old Basic Display API was deprecated Dec 2024). Here's exactly what's needed:

**Prerequisites you'd set up on Meta's side:**
1. Convert @catscandance to a **Business or Creator account** (free, in IG settings)
2. Connect it to a **Facebook Page** (required by Meta, even if the page is empty)
3. Create a **Meta Developer App** at developers.facebook.com → add the "Instagram Graph API" product
4. Generate a **long-lived access token** (60 days) for that app + IG Business Account

**What I'd build once you have the token:**
- Add the access token + IG business account ID as project secrets
- Edge function `instagram-feed` calls `https://graph.facebook.com/v21.0/{ig-user-id}/media?fields=id,media_url,permalink,caption,media_type,thumbnail_url&access_token=...`
- Caches responses for 15 min (Meta has rate limits)
- Auto-refreshes the long-lived token every ~50 days via a cron-style invocation
- Replaces the 9 mock tiles with real posts — clicking opens the IG permalink

**Easier alternative if Meta App setup feels heavy:** use a third-party service like **Behold.so** or **EmbedSocial** — they handle the Meta auth and give you a simple JSON endpoint. Free tiers exist. I'd just consume their endpoint from a small edge function.

Tell me whether you want to: **(a)** set up the Meta Developer App yourself (I'll provide step-by-step), **(b)** use Behold.so/EmbedSocial, or **(c)** keep the mocked grid for now and revisit later.

---

## Decisions I need from you

1. **Episode 2 details** — date, city, venue, lineup blurb, ticket/RSVP-only?
2. **Shop provider** — Stripe (recommended) or Shopify? I'll need product photos + details either way.
3. **Playlists** — Spotify (recommended)? Send the playlist URL(s).
4. **Videos** — YouTube Data API (auto-updating) or hardcoded video ID list?
5. **Instagram** — (a) DIY Meta App, (b) Behold.so/EmbedSocial, or (c) defer?
6. **Catbot scope confirm** — OK to remove the ScrollPaw entirely and replace it with the Catbot button?

## Suggested execution order once approved

1. Hero recenter + Catbot (no external deps) — quick win
2. Episode 2 event card + RSVP backend + `/events` page
3. Real playlists (Spotify embed)
4. Videos section
5. Stripe shop (needs your product info)
6. Instagram (needs your auth choice)

