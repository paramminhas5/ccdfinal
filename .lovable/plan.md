
# Logo integration + production polish

## 1. Add logo to Nav and Footer with hover spin
- Copy `user-uploads://CCDLOGO_2-2.png` → `src/assets/ccd-logo.png`.
- **Nav** (`src/components/Nav.tsx`): place a `<img>` (h-10) to the LEFT of the wordmark inside the home `<Link>`. Add `transition-transform duration-700 group-hover:rotate-[360deg]` and make the parent link `group`. Keeps wordmark; logo spins one full turn on hover.
- **Footer** (`src/components/Footer.tsx`): replace the two decorative `star.png` images with the new logo, larger (w-24 / w-20). Wrap in a `group` div with `hover:rotate-[360deg] transition-transform duration-1000` (auto-spinnable on hover; remove the existing `spin-slow` to avoid conflict).
- Update `index.html` favicon to use the new logo (convert by referencing `/ccd-logo.png` copied also to `public/`).

## 2. Replace Episode 01 poster with uploaded GIF
- Copy `user-uploads://ccdep01_gif_1.gif` → `src/assets/episode-1-poster.gif`.
- Update import in `src/components/Events.tsx`, `src/pages/EventDetail.tsx`, and `src/content/posts.ts` to point at the new GIF. GIF will animate inline as the poster on the past-episode card, the event detail hero, and the blog cover.

## 3. Production-readiness polish
Small high-impact items:

- **OG / social preview**: replace the Lovable-default `og:image` URL in `index.html` with the new logo (`/ccd-logo.png`) so Instagram/WhatsApp/Twitter shares look on-brand. Set `twitter:site` to `@catscandance` (or remove if no handle yet).
- **Favicon**: switch `/favicon.svg` reference to the new PNG logo (`<link rel="icon" type="image/png" href="/ccd-logo.png">`).
- **404 page**: confirm `NotFound.tsx` is themed (chunky-border, Nav, Footer) — fix if it's still the default plain version.
- **Robots / sitemap sanity**: ensure `public/robots.txt` references the sitemap and `sitemap.xml` lists all live routes (`/`, `/about`, `/shop`, `/events`, `/events/episode-1`, `/events/episode-2`, `/blog/inside-episode-01`, `/for-venues`, `/for-artists`, `/for-investors`).
- **Domain in SEO**: `SEO.tsx` likely hardcodes a placeholder; check it uses `https://catscandance.com` as canonical base.
- **Console hygiene**: silence the console-spamming `forwardRef` warning from `SheetHeader` in `CartDrawer` (cosmetic but visible to anyone opening devtools on launch).
- **Image perf**: add `loading="lazy"` + explicit `width`/`height` on the press logos and Instagram thumbnails to reduce CLS.
- **Disco audio**: confirm `public/audio/disco-loop.mp3` exists (else the disco button silently no-ops on first launch). If still missing, leave the existing "audio missing" hint visible.

## 4. Open question
The uploaded logo is a black circle with a white cat — on the cream Nav background it'll look great, but on dark sections (Footer is already dark `bg-ink`) the black circle disappears into the background. Two options for the Footer logo:
- (a) Keep as-is → only the white cat silhouette shows (looks intentional, "knockout" style).
- (b) Add a cream/yellow circular background behind it so the full logo is visible.

I'll go with **(a) knockout style** unless you say otherwise — it matches the brand's bold aesthetic.

## Technical notes
Files touched:
- `src/assets/ccd-logo.png` — NEW (copied from upload)
- `src/assets/episode-1-poster.gif` — NEW (copied from upload)
- `public/ccd-logo.png` — NEW (for favicon + OG)
- `src/components/Nav.tsx` — logo img + group hover spin
- `src/components/Footer.tsx` — logo replaces stars, hover spin
- `src/components/Events.tsx`, `src/pages/EventDetail.tsx`, `src/content/posts.ts` — switch poster to GIF
- `index.html` — favicon + og:image
- `src/components/SEO.tsx` — verify canonical base
- `src/components/CartDrawer.tsx` — fix forwardRef warning
- `public/sitemap.xml` — full route list
- `src/pages/NotFound.tsx` — theme check (only edit if unstyled)

No backend, no new dependencies.
