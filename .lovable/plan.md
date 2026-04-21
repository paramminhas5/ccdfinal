# Fix YouTube, Instagram account, Playlist jank, and add BYOK Stripe

## 1. YouTube — use channel ID directly

The current edge function resolves the wrong handle (`ParamMinhas`) and `forHandle` returns nothing. You gave me the canonical channel ID — use it and skip handle resolution entirely.

**Edits to `supabase/functions/youtube-videos/index.ts`:**

- Hardcode `CHANNEL_ID = "UCmtg0d8E2PXfs3vlQIcGwdQ"` (remove handle lookup)
- Single API call: `/search?part=snippet&channelId=UCmtg0d8E2PXfs3vlQIcGwdQ&order=date&type=video&maxResults=6`
- Add detailed `console.error` logging of the YouTube API response so failures surface in logs
- If `j.items` is empty, log the full response

**Edits to `src/components/Videos.tsx`:**

- Update `CHANNEL_URL` to `https://www.youtube.com/@thesecatscandance`

## 2. Instagram — wrong account

The Behold feed should be connected `6bt7nDISwk0mUzAQMd9s` to `catscan.dance` (135 followers), not `@minhasbeer`. 

**You need to do one of these in Behold ([https://behold.so](https://behold.so)):**

- **Option A  change the link to go to @catscan.dance**

**Edits to `src/components/Instagram.tsx`:**

- Update displayed handle from `catscandance` 
- Update follow link to `https://instagram.com/catscan.dance`

## 3. Playlist — fix the jank

Cause: `useSpring` recalculating on every scroll frame + Spotify iframe reflowing under `whileInView` + lazy load fighting the spring.

**Edits to `src/components/Playlist.tsx`:**

- Drop `useSpring`, use `useTransform` directly (lighter)
- Add `will-change: transform` to the vinyl + wrap it in `transform-gpu` Tailwind class
- Remove the `whileInView` motion wrapper around the iframe (it's causing layout thrash on a 480px iframe). Keep a CSS-only fade.
- Set iframe `loading="eager"` so it's painted once early instead of mid-scroll
- Change vinyl `useScroll` offset to `["start start", "end start"]` so it only animates while the section is in view, not the whole page

## 4. "Links are getting blocked"

I need to know which links — the Spotify "Open in Spotify" link, the Instagram permalinks, or something else? I'll add a clarifier (see below). Most likely cause: the iframe sandbox or `target="_blank"` being blocked by an in-app browser, or the Lovable preview iframe sandbox blocking `_blank`. Fix candidates I'll apply if confirmed: ensure `rel="noopener noreferrer"` everywhere (already there), add `referrerPolicy="no-referrer-when-downgrade"` to outbound `<a>` tags that might be triggering tracking blockers.

## 5. Stripe — BYOK with your own keys

Since Lovable's seamless Stripe was declined, use the bring-your-own-key path. You'll provide your own `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from your Stripe dashboard.

**Steps:**

1. Run `enable_stripe` (BYOK integration) — this scaffolds the Stripe edge functions and asks for your secret key
2. You upload product images (already saved: `tshirt-front.png`, `tshirt-back.png`)
3. I create the 2 products via Stripe SDK in an edge function (or you create them in the Stripe dashboard and I reference the price IDs)
4. New `/shop` page (2-card grid using `tshirt-front` / `tshirt-back` images, shadcn Card)
5. Replace `Drops.tsx` home section with a 2-card teaser linking to `/shop`
6. Edge function `create-checkout-session` → returns Stripe Checkout URL → redirect
7. `/shop/success` and `/shop/cancel` routes
8. Webhook edge function (`verify_jwt = false` in `supabase/config.toml`) writes completed orders to a new `orders` table

**Decisions I need before step 3:**

- Price for each tee (placeholder: ₹1,499)
- Sizes (placeholder: S, M, L, XL)
- 1-line description for each (placeholder: generic tee copy)
- Currency: INR , yes

use placeholders

## Execution order

1. Fix YouTube edge function + Videos URL (instant)
2. Update Instagram handle/link in component (instant — Behold swap is on you)
3. Refactor Playlist for performance
4. Run `enable_stripe`, request `STRIPE_SECRET_KEY` secret, then build shop + checkout

## Decisions I need

&nbsp;

1. **"Links blocked"** — spotify and youtube subscribe
2. **Stripe** — use placeholders ill give you the key 