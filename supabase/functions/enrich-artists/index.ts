// Enrich artist rows: Firecrawl for photos+contacts, Lovable AI for bio.
// Admin-only (header: x-admin-token must equal ADMIN_PASSWORD).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const FC_KEY = Deno.env.get("FIRECRAWL_API_KEY")!;
const LOV_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const ADMIN = Deno.env.get("ADMIN_PASSWORD")!;
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FALLBACK_BOOKING = "book@catscan.dance";

const sb = createClient(SB_URL, SB_SR);

type Artist = {
  id: string;
  slug: string;
  name: string;
  instagram: string | null;
  website: string | null;
  photo_url: string | null;
};

async function fcScrape(url: string, schema?: object) {
  const body: Record<string, unknown> = {
    url,
    onlyMainContent: true,
    formats: ["markdown"],
  };
  if (schema) {
    body.formats = ["markdown", { type: "json", schema }];
  }
  const r = await fetch(`${FIRECRAWL}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) return null;
  return await r.json().catch(() => null);
}

async function fcSearch(q: string) {
  const r = await fetch(`${FIRECRAWL}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: q, limit: 3 }),
  });
  if (!r.ok) return null;
  return await r.json().catch(() => null);
}

async function aiBio(name: string, scraped: string, genres: string[]) {
  const prompt = `You are writing artist directory copy for a music booking platform focused on India's underground electronic scene.
Artist: ${name}
Known genres: ${genres.join(", ") || "electronic"}
Reference material scraped from the web (may be partial or noisy):
"""${scraped.slice(0, 4000)}"""

Return JSON only with this exact shape:
{ "bio": "120-180 word third-person bio, factual, no hype, no emojis", "why": "single sentence hook (<=120 chars) describing what makes them worth booking", "genres": ["..."], "festivals": ["..."] }
Use only facts supported by the reference material. If unsure leave festivals empty.`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOV_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);
  const txt = j?.choices?.[0]?.message?.content;
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function uploadPhoto(slug: string, imgUrl: string): Promise<string | null> {
  try {
    const r = await fetch(imgUrl);
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.length < 2000) return null; // too small / placeholder
    const path = `${slug}.jpg`;
    const { error } = await sb.storage
      .from("artist-photos")
      .upload(path, buf, { contentType: "image/jpeg", upsert: true });
    if (error) return null;
    const { data } = sb.storage.from("artist-photos").getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

function extractFromMarkdown(md: string) {
  const email = md.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const ig = md.match(/instagram\.com\/([\w._-]+)/i);
  return {
    email: email?.[0] ?? null,
    instagram: ig?.[1] ?? null,
  };
}

async function enrichOne(a: Artist, force: boolean) {
  await sb
    .from("artists")
    .update({ enrichment_status: "enriching" })
    .eq("id", a.id);

  const log: Record<string, unknown> = {};
  let bookingEmail: string | null = null;
  let managerEmail: string | null = null;
  let website = a.website;
  let photoUrl = a.photo_url;
  let bioText = "";
  let collectedMd = "";
  let imgCandidate: string | null = null;

  // 1. Scrape Instagram
  if (a.instagram) {
    const igUrl = `https://www.instagram.com/${a.instagram.replace(/^@/, "")}/`;
    const ig = await fcScrape(igUrl);
    const md: string = ig?.data?.markdown ?? ig?.markdown ?? "";
    collectedMd += `\n\n[IG]\n${md}`;
    const meta = ig?.data?.metadata ?? ig?.metadata ?? {};
    if (meta?.ogImage) imgCandidate = meta.ogImage;
    const ex = extractFromMarkdown(md);
    if (ex.email) bookingEmail = ex.email;
    log.ig = { ok: !!md, len: md.length };
  }

  // 2. Search for booking contact / official site
  const search = await fcSearch(
    `${a.name} ${a.based_city ?? ""} booking contact email`,
  );
  const results = search?.data ?? search?.results?.web ?? [];
  log.search = { count: results.length };
  for (const res of results.slice(0, 2)) {
    const url = res.url;
    if (!url) continue;
    if (!website && /^https?:\/\/[^/]+\/?$/.test(url)) website = url;
    const md: string = res.markdown ?? res.description ?? "";
    collectedMd += `\n\n[${url}]\n${md}`;
    const ex = extractFromMarkdown(md);
    if (!bookingEmail && ex.email) bookingEmail = ex.email;
  }

  // 3. Scrape official website if found
  if (website) {
    const site = await fcScrape(website);
    const md: string = site?.data?.markdown ?? site?.markdown ?? "";
    collectedMd += `\n\n[SITE]\n${md}`;
    const meta = site?.data?.metadata ?? site?.metadata ?? {};
    if (!imgCandidate && meta?.ogImage) imgCandidate = meta.ogImage;
    const ex = extractFromMarkdown(md);
    if (!bookingEmail && ex.email) bookingEmail = ex.email;
    // crude manager extraction
    const mgr = md.match(
      /(?:manager|management|mgmt)[^@\n]{0,40}([\w.+-]+@[\w-]+\.[\w.-]+)/i,
    );
    if (mgr) managerEmail = mgr[1];
    log.site = { ok: !!md, len: md.length };
  }

  // 4. Upload photo
  if (imgCandidate && (force || !photoUrl)) {
    const up = await uploadPhoto(a.slug, imgCandidate);
    if (up) photoUrl = up;
    log.photo = { src: imgCandidate, uploaded: !!up };
  }

  // 5. AI bio
  const ai = await aiBio(a.name, collectedMd, []);
  if (ai) {
    bioText = ai.bio ?? "";
    log.ai = { ok: true };
  } else {
    log.ai = { ok: false };
  }

  // 6. Fallbacks
  if (!bookingEmail) bookingEmail = FALLBACK_BOOKING;

  const update: Record<string, unknown> = {
    booking_email: bookingEmail,
    manager_email: managerEmail,
    website,
    photo_url: photoUrl,
    enrichment_status: "enriched",
    enriched_at: new Date().toISOString(),
    enrichment_log: log,
  };
  if (bioText) update.bio = bioText;
  if (ai?.why) update.why = ai.why;
  if (Array.isArray(ai?.genres) && ai.genres.length) update.genres = ai.genres;
  if (Array.isArray(ai?.festivals) && ai.festivals.length)
    update.festivals = ai.festivals;

  await sb.from("artists").update(update).eq("id", a.id);
  return { id: a.id, name: a.name, ok: true, log };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (req.headers.get("x-admin-token") !== ADMIN) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { artist_id?: string; all?: boolean; force?: boolean; limit?: number } =
    {};
  try {
    body = await req.json();
  } catch { /* noop */ }

  let query = sb
    .from("artists")
    .select("id, slug, name, instagram, website, photo_url, based_city")
    .eq("status", "approved");

  if (body.artist_id) {
    query = query.eq("id", body.artist_id);
  } else if (body.all) {
    if (!body.force) query = query.neq("enrichment_status", "enriched");
    query = query.limit(body.limit ?? 60);
  } else {
    return new Response(JSON.stringify({ error: "specify artist_id or all" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: rows, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const results: unknown[] = [];
  for (const a of rows ?? []) {
    try {
      const r = await enrichOne(a as Artist, !!body.force);
      results.push(r);
    } catch (e) {
      await sb
        .from("artists")
        .update({
          enrichment_status: "failed",
          enrichment_log: { error: String(e) },
        })
        .eq("id", a.id);
      results.push({ id: a.id, name: a.name, ok: false, error: String(e) });
    }
    // gentle pacing
    await new Promise((r) => setTimeout(r, 1500));
  }

  return new Response(
    JSON.stringify({ ok: true, count: results.length, results }),
    { headers: { ...cors, "Content-Type": "application/json" } },
  );
});
