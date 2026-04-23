import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type SourceKey = "sortmyscene" | "insider" | "skillboxes" | "district" | "highape" | "bookmyshow";

type SourceConfig = {
  key: SourceKey;
  listingUrl: string;
  // a substring (or regex) candidate event links must contain
  linkMatch: RegExp;
  // links must NOT match these (filters category/index pages)
  linkReject: RegExp[];
};

const SOURCES: Record<SourceKey, SourceConfig> = {
  sortmyscene: {
    key: "sortmyscene",
    listingUrl: "https://sortmyscene.com/bangalore",
    linkMatch: /sortmyscene\.com\/[^/]+\/[^/?#]+/i,
    linkReject: [/\/category\//i, /\/tag\//i, /\/page\//i, /\/about/i, /\/contact/i],
  },
  insider: {
    key: "insider",
    listingUrl: "https://insider.in/bengaluru/nightlife",
    linkMatch: /insider\.in\/[a-z0-9-]+\/event/i,
    linkReject: [/\/online-events/i],
  },
  skillboxes: {
    key: "skillboxes",
    listingUrl: "https://skillboxes.com/bangalore",
    linkMatch: /skillboxes\.com\/events\//i,
    linkReject: [/\/category\//i, /\/page\//i, /\/business\//i],
  },
  district: {
    key: "district",
    listingUrl: "https://www.district.in/events-in-bengaluru",
    linkMatch: /district\.in\/events?\//i,
    linkReject: [/\/categories\//i],
  },
  highape: {
    key: "highape",
    listingUrl: "https://highape.com/bangalore/events",
    linkMatch: /highape\.com\/bangalore\/[^/?#]+/i,
    linkReject: [/\/events$/i, /\/category\//i],
  },
  bookmyshow: {
    key: "bookmyshow",
    listingUrl: "https://in.bookmyshow.com/explore/events-bengaluru",
    linkMatch: /bookmyshow\.com\/events\//i,
    linkReject: [/\/explore\//i],
  },
};

async function firecrawlScrape(
  url: string,
  apiKey: string,
  formats: string[] = ["markdown", "links"],
  waitFor = 0,
) {
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

async function extractWithAI(text: string, sourceUrl: string, source: string, lovableKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  const sys = `You extract a SINGLE music event from a single event page. Today is ${today}.
Return the event if it is:
- a real bookable individual event page (NOT a category, listing, or venue homepage)
- in or near Bengaluru/Bangalore (assume Bangalore if no other Indian city is mentioned)
- music-related (any genre — dance, electronic, techno, house, indie, rock, jazz, live, club, festival are all fine)
- happening in the future
Otherwise return events: []. Always include the title. Use empty string for unknown fields.`;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Source: ${source}\nURL: ${sourceUrl}\n\nPage content:\n${text.slice(0, 6000)}` },
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

async function runSource(cfg: SourceConfig, limit: number, fcKey: string, lovableKey: string, supabase: any) {
  const stats: any = {
    source: cfg.key,
    listingUrl: cfg.listingUrl,
    candidateLinks: 0,
    scrapedPages: 0,
    extracted: 0,
    upserted: 0,
    errors: [] as string[],
    samples: [] as string[],
  };

  // Step 1: scrape listing page for links
  // JS-heavy sites need waitFor; skillbox returns links without it
  const needsWait = cfg.key !== "skillboxes";
  const listing = await firecrawlScrape(cfg.listingUrl, fcKey, ["links", "markdown"], needsWait ? 5000 : 0);
  if (!listing) {
    stats.errors.push("listing scrape failed");
    return stats;
  }
  const rawLinks: string[] =
    listing?.data?.links ??
    listing?.links ??
    [];
  console.log(cfg.key, "raw links from listing:", rawLinks.length);

  // Step 2: filter to candidate event URLs
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
  console.log(cfg.key, "candidates:", candidates.length, candidates.slice(0, 3));

  if (candidates.length === 0) {
    stats.errors.push("no candidate links matched");
    return stats;
  }

  // Step 3: scrape + extract each, upsert immediately
  for (const url of candidates) {
    if (stats.upserted >= limit) break;
    try {
      const page = await firecrawlScrape(url, fcKey, ["markdown"]);
      stats.scrapedPages += 1;
      const md: string =
        page?.data?.markdown ?? page?.markdown ?? "";
      if (!md || md.length < 100) {
        console.log(cfg.key, "skip short page", url);
        continue;
      }
      const events = await extractWithAI(md, url, cfg.key, lovableKey);
      if (events.length === 0) {
        console.log(cfg.key, "AI returned 0 events for", url);
        continue;
      }
      const ev = events[0];
      stats.extracted += 1;
      const row = {
        title: String(ev.title).slice(0, 200),
        venue: ev.venue ?? null,
        event_date: ev.event_date ?? null,
        event_time: ev.event_time ?? null,
        url,
        source: cfg.key,
        blurb: ev.blurb ? String(ev.blurb).slice(0, 200) : null,
        genre: Array.isArray(ev.genre) ? ev.genre : [],
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("curated_events")
        .upsert(row, { onConflict: "url" });
      if (error) {
        console.error(cfg.key, "upsert error", error.message);
        stats.errors.push(`upsert: ${error.message}`);
      } else {
        stats.upserted += 1;
      }
    } catch (e: any) {
      console.error(cfg.key, "candidate error", url, e?.message);
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
  const mode = body?.mode === "all" ? "all" : "single";
  const limit = Math.min(Math.max(Number(body?.limit) || 5, 1), 8);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const targets: SourceConfig[] =
    mode === "all"
      ? Object.values(SOURCES)
      : SOURCES[requestedSource]
        ? [SOURCES[requestedSource]]
        : [SOURCES.skillboxes];

  const runs: any[] = [];
  let totalUpserted = 0;
  for (const cfg of targets) {
    const s = await runSource(cfg, limit, fcKey, lovableKey, supabase);
    runs.push(s);
    totalUpserted += s.upserted;
  }

  return new Response(JSON.stringify({ ok: true, mode, upserted: totalUpserted, runs }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
