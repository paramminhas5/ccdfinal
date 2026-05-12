import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const FC = "https://api.firecrawl.dev/v2";

async function fcSearch(query: string, key: string, limit = 5) {
  const res = await fetch(`${FC}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`FC search ${res.status}: ${JSON.stringify(data)}`);
  return (data.data ?? data.web?.results ?? []) as any[];
}

async function fcScrape(url: string, key: string) {
  const res = await fetch(`${FC}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown", "links"], onlyMainContent: true, waitFor: 2000 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`FC scrape ${res.status}: ${JSON.stringify(data)}`);
  return data.data ?? data;
}

const pickFirst = (links: string[], pattern: RegExp) => links.find((l) => pattern.test(l)) ?? null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const password = req.headers.get("x-admin-password") ?? "";
  const expected = Deno.env.get("ADMIN_PASSWORD") ?? "";
  if (!expected || !timingSafeEqual(password, expected)) {
    return j({ error: "Unauthorized" }, 401);
  }

  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!fcKey) return j({ error: "FIRECRAWL_API_KEY not configured" }, 500);

  let body: any;
  try { body = await req.json(); } catch { return j({ error: "Invalid JSON" }, 400); }

  const id = String(body.id ?? "");
  if (!id) return j({ error: "id required" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: artist, error } = await supabase.from("artists").select("*").eq("id", id).maybeSingle();
  if (error || !artist) return j({ error: "Artist not found" }, 404);

  try {
    const query = `${artist.name} dj india (site:ra.co OR site:soundcloud.com OR site:instagram.com OR site:bandcamp.com OR site:wildcity.com)`;
    const results = await fcSearch(query, fcKey, 5);
    const allLinks: string[] = [];
    let bio: string | null = artist.bio ?? null;
    let photo_url: string | null = artist.photo_url ?? null;

    for (const r of results.slice(0, 3)) {
      const url = r.url || r.link;
      if (!url) continue;
      try {
        const scraped = await fcScrape(url, fcKey);
        const md: string = scraped.markdown ?? "";
        const links: string[] = scraped.links ?? scraped.metadata?.links ?? [];
        allLinks.push(url, ...links);
        if (!bio && md.length > 60) {
          // first non-trivial paragraph
          const para = md.split(/\n\n+/).map((p) => p.trim()).find((p) => p.length > 80 && !/^#|http/i.test(p));
          if (para) bio = para.slice(0, 1500);
        }
        if (!photo_url && scraped.metadata?.ogImage) photo_url = scraped.metadata.ogImage;
      } catch (e) { console.warn("scrape fail", url, e); }
    }

    const patch: Record<string, unknown> = {};
    if (bio && !artist.bio) patch.bio = bio;
    if (photo_url && !artist.photo_url) patch.photo_url = photo_url;
    if (!artist.soundcloud) patch.soundcloud = pickFirst(allLinks, /soundcloud\.com\//i);
    if (!artist.bandcamp) patch.bandcamp = pickFirst(allLinks, /bandcamp\.com/i);
    if (!artist.spotify) patch.spotify = pickFirst(allLinks, /open\.spotify\.com\/artist/i);
    if (!artist.instagram) {
      const ig = pickFirst(allLinks, /instagram\.com\/[A-Za-z0-9_.]+\/?$/i);
      if (ig) patch.instagram = ig.split("instagram.com/")[1]?.replace(/\/$/, "") ?? ig;
    }
    if (!artist.website) {
      const w = allLinks.find((l) => /^https?:\/\//.test(l) && !/(soundcloud|bandcamp|instagram|spotify|facebook|twitter|x\.com|youtube|ra\.co)/i.test(l));
      if (w) patch.website = w;
    }

    // Strip nulls
    for (const k of Object.keys(patch)) if (patch[k] == null) delete patch[k];

    return j({ patch, sample_links: Array.from(new Set(allLinks)).slice(0, 20) });
  } catch (e) {
    console.error("enrich", e);
    return j({ error: (e as Error).message }, 500);
  }

  function j(b: unknown, status = 200) {
    return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
