# Contact form, nav cleanup, marquee, share + admin fixes, curated events visibility

## 1. Replace "GET IN TOUCH" with a proper contact form

**Issue:** `src/components/Contact.tsx` already has a form, but the user perceives it as just a "get in touch" mailto block. The form sits in the right column on desktop; on mobile it's below a big "SAY HELLO. [hello@catscandance.com](mailto:hello@catscandance.com)" block that reads as the only CTA. Restructure so the form is the obvious primary action.

Changes in `Contact.tsx`:

- Promote the form: full-width on mobile, comes first visually with a clear "/ DROP US A LINE" eyebrow above the form.
- Add proper labels above each field (Name / Email / Message) instead of placeholder-only.
- Add a "Reason" select dropdown (Brand collab / Venue partnership / Press / RSVP help / Other) — submitted as a prefix in the message.
- Demote the email link to a small "Or email us directly: hello@…" line under the form.
- Show inline success state inside the card instead of just a toast.

## 2. Nav cleanup — kill "Home", fix red-on-red, declutter

In `src/components/Nav.tsx`:

- Remove the `Home` entry from `primaryLinks` (logo click already does it). Mobile menu also drops `Home`.
- **Red-on-red clash:** when nav is unscrolled the active link uses `text-magenta` while sitting on the magenta hero/EarlyAccess sections — invisible. Fix by using `text-acid-yellow` for active state when `!scrolled`, and `text-magenta` only when `scrolled`. Same fix for dropdown trigger active state.
- Tighten desktop spacing further: `gap-5` → `gap-4`, button padding shrinks, "Early Access" CTA uses smaller text on `lg`, expands at `xl`.
- Hide `DiscoMute` until `xl` breakpoint (keep on mobile drawer area + xl desktop) to free space.

## 3. Marquee — keep first one big, shrink the rest

In `src/components/Marquee.tsx`, add a `size` prop (`"lg" | "sm"`, default `"sm"`):

- `lg` → `text-3xl md:text-7xl`, `py-4 md:py-8` (current desktop sizing, current first marquee under Hero feel).
- `sm` → `text-xl md:text-4xl`, `py-3 md:py-5`, gap `gap-8 md:gap-12`.

In `src/pages/Index.tsx`, set the **first** marquee (under Hero) to `size="lg"`; the other three (after About, after Drops, after Videos/before EarlyAccess) to default `sm`. Result: under-Home marquee stays bold, others become readable scene-setters.

## 4. Early Access CTA → goes to the form, not just home

Currently `to="/#early-access"` works on `/` but on other pages React Router doesn't auto-scroll to the hash. Fix:

- Change the desktop CTA + mobile menu "Early Access →" link to use a small `EarlyAccessLink` wrapper that does `navigate("/")` then `setTimeout(() => document.getElementById("early-access")?.scrollIntoView({ behavior: "smooth" }), 50)`.
- Also add this scroll-on-mount behavior in `src/pages/Index.tsx` for incoming `#early-access` hashes (handles direct deep links).

## 5. Admin: events not creatable / can't change poster / no media upload

The current bug: `addEvent` in `Admin.tsx` adds a new row to local state, but the editor saves only when the user hits SAVE per row. The new event has no `id`, slug is auto-generated (`event-<timestamp>`) — that part works. The actual blocker is **poster_url** is a free-text URL field with no upload. Also no Supabase Storage bucket exists for posters → migration needed.

Changes:

- **Migration**: create public storage bucket `event-posters` with RLS policies — public read, insert/update/delete only via service role. (`EventDetail.tsx` already references `supabase.storage.from("event-posters").getPublicUrl(raw)` so the bucket name matches.)
- **New edge function `admin-upload-poster**` (auth-gated by `x-admin-password`): accepts multipart/form-data with `file` + `slug`, uploads to `event-posters/<slug>-<timestamp>.<ext>` via service role, returns the file path. Reuses the existing admin password timingSafeEqual pattern.
- **EventEditor in `Admin.tsx**`:
  - Replace the bare "Poster URL" text field with: existing URL field + a "📤 Upload poster" file input that calls `admin-upload-poster`, then writes the returned path into `poster_url`. Show a tiny preview thumbnail when set.
  - Add a "🗗 SHARE" button next to SAVE that copies `https://catscandance.com/events/<slug>` to clipboard (uses `navigator.clipboard.writeText`) and toasts "Link copied".
  - Fix the "Can't create" perception: after `addEvent`, auto-scroll the new card into view AND auto-call `saveEvent` once the user fills required fields (already saves via SAVE button — make button text loud "💾 SAVE EVENT" so it's obvious).

## 6. Public-facing share button on Event detail

In `src/pages/EventDetail.tsx`, add a small share button row near the title:

- "🗗 SHARE" → uses `navigator.share()` if available (`{ title, text: blurb, url }`), falls back to clipboard copy + toast.
- Place inside the colored hero block, top-right of the title area.

## 7. Curated events not visible

**Root cause:** the `curated_events` table has 2 rows but the Events page query filters `event_date.gte.today OR event_date.is.null`. If both rows have past dates (or RLS is hiding them somehow), the section's `if (!events.length) return null` hides it entirely — invisible to user, no empty-state.

Fixes in `src/components/CuratedEvents.tsx`:

- Always render the section header + the "🔄 No curated events yet — check back soon" empty state when no rows (instead of returning null). This makes it visible immediately so the user can see it and trigger refresh from the admin.
- Drop the date filter to `or(event_date.gte.${today},event_date.is.null)` AND fall back to "show latest 12 by created_at" if filtered query returns 0 — so manually added curated events without a date still show up.
- Add a small "All times BLR" footnote.

**Refresh button visibility in admin:** The "🔄 REFRESH FROM WEB" button exists in the CURATED tab (`Admin.tsx:930`). The user said they can't see it — likely because the CURATED tab wasn't visible or load failed silently. Verify by:

- Adding error toasts to the `load()` call in `CuratedEventsTab` (currently swallows errors).
- The CURATED `TabsTrigger` is already in the list (`Admin.tsx:354`) — keep it. No fix needed beyond surfacing load errors.

&nbsp;

I added a youtube playlist but its not rendering on desktop.  

## 8. Files touched

- `src/components/Contact.tsx` — restructure form, labels, reason dropdown, success state
- `src/components/Nav.tsx` — drop Home, fix active-color clash, tighter spacing, EarlyAccess scroll handling
- `src/components/Marquee.tsx` — `size` prop with lg/sm
- `src/pages/Index.tsx` — first marquee `size="lg"`, others default; hash-scroll on mount
- `src/pages/Admin.tsx` — EventEditor poster upload + share button + better save UX; surface curated-load errors
- `src/pages/EventDetail.tsx` — share button in hero
- `src/components/CuratedEvents.tsx` — empty-state visible, fallback to recent
- `supabase/migrations/*` — `event-posters` storage bucket + RLS
- `supabase/functions/admin-upload-poster/index.ts` — new (admin-gated upload)

No new dependencies. No new connectors needed (Firecrawl already connected for the curate-events function).