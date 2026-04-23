
# Fix: lineup commas, curated crawl returning 0, YouTube playlist embed

## 1. Lineup field strips commas mid-typing

In `src/pages/Admin.tsx` (line 668, 787-788), `lineupStr` is recomputed from the array on every render, and the onChange immediately splits on `,` + trims + filters empty. Result: typing "DJ A, " becomes `["DJ A"]` → re-rendered as `"DJ A"`, so the comma + space disappear as you type. You can never type a comma followed by another name without losing the trailing whitespace and getting cursor jumps.

**Fix:** make the input store local string state; only split into the array `onBlur` (or on save).

```tsx
// EventEditor: replace lineupStr derivation + inline onChange
const [lineupStr, setLineupStr] = useState((event.lineup ?? []).join(", "));
useEffect(() => { setLineupStr((event.lineup ?? []).join(", ")); }, [event.id]);

<input
  value={lineupStr}
  onChange={(e) => setLineupStr(e.target.value)}
  onBlur={() => onChange({
    ...event,
    lineup: lineupStr.split(",").map(s => s.trim()).filter(Boolean),
  })}
  ...
/>
```

This lets you type `"DJ Whiskers, MC Mittens, Tabby T"` freely; array is committed on blur (and SAVE triggers blur first).

## 2. Curated crawl returns 0 results

Two real bugs in `supabase/functions/curate-events/index.ts`, confirmed by hitting Firecrawl directly:

**Bug A — wrong response path.** Firecrawl v2 `/search` returns `{ data: { web: [...] } }`. Current code reads `data?.data ?? data?.web?.results` → always `undefined.web` → empty.

**Bug B — over-restrictive `site:` queries.** Tested live:
- `site:insider.in bangalore dance event` + `tbs:qdr:w` → `"web": []`
- `bangalore dance party this week` (no site:) → 5 strong results (Eventbrite, HighApe, BookMyShow, BLR Techno Community, etc.)
- `insider.in bangalore techno house event` (no `site:`, no tbs) → 5 results

**Fixes:**
- Read results as `data?.data?.web ?? data?.data ?? []`.
- Drop `site:` operator from queries; drop `tbs:qdr:w` (kills almost everything).
- New `SOURCES`:
  ```ts
  const SOURCES = [
    { source: "highape",    query: "highape bangalore dance techno house event this week" },
    { source: "insider",    query: "insider.in bengaluru dance OR techno OR house event" },
    { source: "skillboxes", query: "skillboxes bangalore dance music event" },
    { source: "district",   query: "district by zomato bengaluru dance music event" },
    { source: "bookmyshow", query: "bookmyshow bengaluru parties dance event" },
    { source: "sortmyscene",query: "sortmyscene bangalore dance event" },
  ];
  ```
- Each Firecrawl call: `{ query, limit: 8, scrapeOptions: { formats: ["markdown"] } }` (no `tbs`).
- Tighten the AI prompt so it filters to "next 14 days, Bangalore/Bengaluru only, dance/electronic/underground" and rejects non-event index pages.
- Log `console.log("source", source, "results", results.length)` per source so future debugging is easy.

After deploy, hitting "🔄 REFRESH FROM WEB" should populate the table; the `/events` page already falls back to `created_at` desc so it'll show.

## 3. YouTube playlist not rendering on desktop

Tested the current embed URL `https://www.youtube-nocookie.com/embed/videoseries?list=PLx8i1IX7Ykzpj5TocoukffjYUeWA0BYl7&listType=playlist&rel=0` directly — server returns **HTTP 200 with `content-length: 0`** (blank body). The `videoseries` endpoint is unreliable for many public playlists now and renders empty in iframes (matches the "single videos load, playlist doesn't" symptom).

**Fix in `src/components/Playlist.tsx` `buildEmbedSrc`** — switch to the standard embed form which YouTube still serves reliably:

```ts
if (p.platform === "youtube") {
  // PL... = playlist ID. Use videoseries via the *embed* path that actually returns HTML.
  // Reliable form: /embed?listType=playlist&list=PL...
  return `https://www.youtube.com/embed?listType=playlist&list=${p.embed_id}&rel=0`;
}
```

(Drop `youtube-nocookie` for playlists — it's the variant returning empty bodies. Keep `rel=0`. `allowFullScreen` + the existing `allow="..."` stay.)

## 4. Files touched

- `src/pages/Admin.tsx` — local lineup string state, commit on blur
- `supabase/functions/curate-events/index.ts` — fix Firecrawl result path, broaden queries, drop `tbs`, tighter AI prompt, per-source logs
- `src/components/Playlist.tsx` — switch YouTube embed to `youtube.com/embed?listType=playlist&list=...`

No DB changes, no new connectors. After deploy: hit "🔄 REFRESH FROM WEB" once in Admin → CURATED to seed.
