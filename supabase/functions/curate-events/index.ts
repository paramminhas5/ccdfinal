import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type SourceKey = "sortmyscene" | "insider" | "skillboxes" | "district" | "highape" | "bookmyshow";
type CityKey = "bangalore" | "mumbai" | "delhi" | "pune";

type CityConfig = {
  key: CityKey;
  aliases: string[];
  slugs: Partial<Record<SourceKey, string>>;
};

const CITIES: Record<CityKey, CityConfig> = {
  bangalore: { key: "bangalore", aliases: ["bangalore", "bengaluru", "blr"], slugs: { insider: "bengaluru", district: "bengaluru" } },
  mumbai:    { key: "mumbai",    aliases: ["mumbai", "bombay", "navi mumbai"], slugs: {} },
  delhi:     { key: "delhi",     aliases: ["delhi", "new delhi", "ncr", "gurgaon", "gurugram", "noida"], slugs: { insider: "new-delhi", district: "new-delhi", bookmyshow: "national-capital-region-ncr" } },
  pune:      { key: "pune",      aliases: ["pune"], slugs: {} },
};

type SourceConfig = {
  key: SourceKey;
  listingUrl: (city: CityConfig) => string;
  linkMatch: RegExp;
  linkReject: RegExp[];
};

const CITY_TITLE: Record<CityKey, string> = {
  bangalore: "Bengaluru", mumbai: "Mumbai", delhi: "Delhi", pune: "Pune",
};

const SOURCES: Record<SourceKey, SourceConfig> = {
  sortmyscene: {
    key: "sortmyscene",
    listingUrl: (c) => `https://sortmyscene.com/events?tab=events&city=${encodeURIComponent(CITY_TITLE[c.key])}`,
    linkMatch: /sortmyscene\.com\/events\/[^/?#]+/i,
    linkReject: [/\/category\//i, /\/tag\//i, /\/page\//i, /\/about/i, /\/contact/i, /\/events\?/i],
  },
  insider: {
    key: "insider",
    listingUrl: (c) => `https://insider.in/${c.slugs.insider ?? c.key}/nightlife`,
    linkMatch: /insider\.in\/[a-z0-9-]+\/event/i,
    linkReject: [/\/online-events/i],
  },
  skillboxes: {
    key: "skillboxes",
    listingUrl: (c) => `https://www.skillboxes.com/events-${c.slugs.skillboxes ?? c.key}`,
    linkMatch: /skillboxes\.com\/events\/[^/?#]+/i,
    linkReject: [/\/category\//i, /\/page\//i, /\/business\//i, /\/events-[a-z]+$/i],
  },
  district: {
    key: "district",
    listingUrl: (c) => `https://www.district.in/events/music-in-${c.slugs.district ?? c.key}-book-tickets`,
    linkMatch: /district\.in\/events\/[^/?#]+/i,
    linkReject: [/\/categories\//i, /\/events\/music-in-[a-z-]+-book-tickets$/i],
  },
  highape: {
    key: "highape",
    listingUrl: (c) => `https://highape.com/${c.slugs.highape ?? c.key}/events`,
    linkMatch: /highape\.com\/[a-z]+\/[^/?#]+/i,
    linkReject: [/\/events$/i, /\/category\//i],
  },
  bookmyshow: {
    key: "bookmyshow",
    listingUrl: (c) => `https://in.bookmyshow.com/explore/events-${c.slugs.bookmyshow ?? c.key}`,
    linkMatch: /bookmyshow\.com\/events\//i,
    linkReject: [/\/explore\//i],
  },
};

const CITY_REJECT = ["goa", "hyderabad", "chennai", "kolkata", "jaipur", "ahmedabad", "kochi", "chandigarh", "lucknow", "indore", "guwahati", "shillong"];

const GENRE_BUCKETS = ["House", "Techno", "Disco", "Jungle", "Drum & Bass", "Garage", "Electronic", "Live"];
function normalizeGenres(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const g = raw.toLowerCase().trim();
    if (!g) continue;
    if (g.includes("drum") || g.includes("dnb") || g.includes("d&b")) out.add("Drum & Bass");
    else if (g.includes("jungle")) out.add("Jungle");
    else if (g.includes("garage")) out.add("Garage");
    else if (g.includes("disco")) out.add("Disco");
    else if (g.includes("techno")) out.add("Techno");
    else if (g.includes("house")) out.add("House");
    else if (g.includes("live") || g.includes("band") || g.includes("indie") || g.includes("rock") || g.includes("jazz")) out.add("Live");
    else if (g.includes("electro") || g.includes("edm") || g.includes("dance") || g.includes("club")) out.add("Electronic");
  }
  return Array.from(out);
}

function pickImageFromMarkdown(md: string, baseUrl: string): string | null {
  // ![alt](url) pattern
  const m = md.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+\.(?:jpe?g|png|webp|avif)[^)]*)\)/i);
  if (m) return m[1];
  return null;
}

async function firecrawlScrape(url: string, apiKey: string, formats: string[] = ["markdown"], waitFor = 0) {
  const body: any = { url, formats, onlyMainContent: false };
  if (waitFor > 0) body.waitFor = waitFor;
  const res = await fetch(`${FIRECRAWL}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("firecrawl scrape failed", url, res.status, t.slice(0, 200));
    return null;
  }
  return await res.json();
}

async function extractWithAI(text: string, sourceUrl: string, source: string, city: CityConfig, lovableKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  const sys = `You extract a SINGLE music event from one event page. Today is ${today}.
Return the event ONLY if it is:
- a real bookable individual event page (NOT a category, listing, or venue homepage)
- music-related (any genre: dance, electronic, techno, house, indie, rock, jazz, live, club, festival)
- located in ${city.key.toUpperCase()} or its metro area (aliases: ${city.aliases.join(", ")}). Reject if the venue is clearly in another Indian city (Goa, Hyderabad, Chennai, Kolkata, Jaipur, etc.).
Prefer future events (event_date today or later) but include events even if no date is found — leave event_date empty.
For image_url, look at the first markdown image (![](URL)) at the top of the page or the og:image — capture the absolute URL. Skip logos/icons (anything with 'logo', 'icon', 'favicon' in URL).
Always include the title. Use empty string for unknown fields. If page is not a valid event in ${city.key} or another city is named, return events: [].`;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Source: ${source}\nCity: ${city.key}\nURL: ${sourceUrl}\n\nPage content:\n${text.slice(0, 9000)}` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "save_events",
          description: "Save the single extracted event (or empty array if not a valid event)",
          parameters: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    venue: { type: "string" },
                    event_date: { type: "string", description: "YYYY-MM-DD" },
                    event_time: { type: "string" },
                    blurb: { type: "string", description: "max 140 chars" },
                    genre: { type: "array", items: { type: "string" } },
                    image_url: { type: "string", description: "absolute URL of poster/og:image, no logos" },
                  },
                  required: ["title"],
                },
              },
            },
            required: ["events"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "save_events" } },
    }),
  });
  if (!res.ok) {
    console.error("ai extract failed", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return [];
  try {
    const parsed = JSON.parse(args);
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    return [];
  }
}

function venueMatchesCity(venue: string | null | undefined, blurb: string | null | undefined, sourceUrl: string, pageMarkdown: string, city: CityConfig): boolean {
  const hay = `${venue ?? ""} ${blurb ?? ""} ${sourceUrl} ${pageMarkdown.slice(0, 800)}`.toLowerCase();
  if (city.aliases.some((a) => hay.includes(a))) return true;
  const otherCityKeys = (Object.keys(CITIES) as CityKey[]).filter((k) => k !== city.key);
  const otherCityHit = otherCityKeys.some((k) => CITIES[k].aliases.some((a) => hay.includes(a))) || CITY_REJECT.some((c) => hay.includes(c));
  return !otherCityHit;
}

async function runSource(cfg: SourceConfig, city: CityConfig, limit: number, fcKey: string, lovableKey: string, supabase: any) {
  const listingUrl = cfg.listingUrl(city);
  const stats: any = {
    source: cfg.key, city: city.key, listingUrl,
    candidateLinks: 0, scrapedPages: 0, extracted: 0, upserted: 0, rejectedCity: 0,
    errors: [] as string[], samples: [] as string[],
  };

  const listing = await firecrawlScrape(listingUrl, fcKey, ["links", "markdown"], 5000);
  if (!listing) { stats.errors.push("listing scrape failed"); return stats; }
  const rawLinks: string[] = listing?.data?.links ?? listing?.links ?? [];

  const seen = new Set<string>();
  const candidates: string[] = [];
  for (const link of rawLinks) {
    if (typeof link !== "string") continue;
    const url = link.split("#")[0].replace(/\/$/, "");
    if (seen.has(url)) continue;
    if (!cfg.linkMatch.test(url)) continue;
    if (cfg.linkReject.some((r) => r.test(url))) continue;
    seen.add(url);
    candidates.push(url);
    if (candidates.length >= 12) break;
  }
  stats.candidateLinks = candidates.length;
  stats.samples = candidates.slice(0, 5);

  if (candidates.length === 0) { stats.errors.push("no candidate links matched"); return stats; }

  for (const url of candidates) {
    if (stats.upserted >= limit) break;
    if (stats.scrapedPages >= 8) break;
    try {
      const page = await firecrawlScrape(url, fcKey, ["markdown"]);
      stats.scrapedPages += 1;
      const md: string = page?.data?.markdown ?? page?.markdown ?? "";
      const meta = page?.data?.metadata ?? page?.metadata ?? {};
      if (!md || md.length < 100) continue;
      const events = await extractWithAI(md, url, cfg.key, city, lovableKey);
      if (events.length === 0) continue;
      const ev = events[0];
      stats.extracted += 1;

      if (!venueMatchesCity(ev.venue, ev.blurb, url, md, city)) {
        stats.rejectedCity += 1;
        continue;
      }

      // Image fallback chain: AI → og:image → first markdown image
      let image_url: string | null = (typeof ev.image_url === "string" && ev.image_url.startsWith("http")) ? ev.image_url : null;
      if (!image_url) {
        const og = meta?.ogImage || meta?.["og:image"] || meta?.openGraph?.image;
        if (typeof og === "string" && og.startsWith("http")) image_url = og;
      }
      if (!image_url) image_url = pickImageFromMarkdown(md, url);
      // Filter out logos/icons
      if (image_url && /\b(logo|icon|favicon|sprite)\b/i.test(image_url)) image_url = null;

      const row = {
        title: String(ev.title).slice(0, 200),
        venue: ev.venue ?? null,
        event_date: ev.event_date ?? null,
        event_time: ev.event_time ?? null,
        url,
        source: cfg.key,
        city: city.key,
        blurb: ev.blurb ? String(ev.blurb).slice(0, 200) : null,
        genre: normalizeGenres(ev.genre),
        image_url,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("curated_events").upsert(row, { onConflict: "url" });
      if (error) { stats.errors.push(`upsert: ${error.message}`); }
      else { stats.upserted += 1; }
    } catch (e: any) {
      stats.errors.push(String(e?.message ?? e));
    }
  }

  return stats;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!fcKey || !lovableKey) {
    return new Response(JSON.stringify({ error: "Missing API keys" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const requestedSource = (body?.source as SourceKey) || "skillboxes";
  const requestedCity = (body?.city as CityKey | "all") || "bangalore";
  const mode = body?.mode === "all" ? "all" : "single";
  const limit = Math.min(Math.max(Number(body?.limit) || 5, 1), 8);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const sourceTargets: SourceConfig[] = mode === "all"
    ? Object.values(SOURCES)
    : SOURCES[requestedSource] ? [SOURCES[requestedSource]] : [SOURCES.skillboxes];

  const cityTargets: CityConfig[] = requestedCity === "all"
    ? Object.values(CITIES)
    : CITIES[requestedCity] ? [CITIES[requestedCity]] : [CITIES.bangalore];

  const runs: any[] = [];
  let totalUpserted = 0;
  for (const cfg of sourceTargets) {
    for (const city of cityTargets) {
      const s = await runSource(cfg, city, limit, fcKey, lovableKey, supabase);
      runs.push(s);
      totalUpserted += s.upserted;
    }
  }

  return new Response(JSON.stringify({ ok: true, mode, upserted: totalUpserted, runs }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
