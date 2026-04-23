import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SOURCES = [
  { source: "highape",    query: "highape bangalore dance techno house event this week" },
  { source: "insider",    query: "insider.in bengaluru dance OR techno OR house event" },
  { source: "skillboxes", query: "skillboxes bangalore dance music event" },
  { source: "district",   query: "district by zomato bengaluru dance music event" },
  { source: "bookmyshow", query: "bookmyshow bengaluru parties dance event" },
  { source: "sortmyscene",query: "sortmyscene bangalore dance event" },
];

async function firecrawlSearch(query: string, apiKey: string) {
  const res = await fetch(`${FIRECRAWL}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit: 8, scrapeOptions: { formats: ["markdown"] } }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("firecrawl search failed", res.status, t);
    return [];
  }
  const data = await res.json();
  // V2: { success, data: { web: [...] } } — also tolerate other shapes
  const results =
    data?.data?.web ??
    (Array.isArray(data?.data) ? data.data : null) ??
    data?.web?.results ??
    [];
  return Array.isArray(results) ? results : [];
}

async function extractWithAI(text: string, source: string, lovableKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  const sys = `You extract dance/electronic/underground music events in BANGALORE / BENGALURU only from web content. Today is ${today}. Only include real individual events in the next 14 days with a venue and date. Reject city/category index pages, generic listings without a specific event, and events outside Bengaluru. Return events with a working ticket/event URL.`;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Source: ${source}\n\nContent:\n${text.slice(0, 8000)}` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "save_events",
          description: "Save extracted events",
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
                    url: { type: "string" },
                    blurb: { type: "string", description: "max 140 chars" },
                    genre: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "url"],
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
    const t = await res.text();
    console.error("ai extract failed", res.status, t);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!fcKey || !lovableKey) {
    return new Response(JSON.stringify({ error: "Missing API keys" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const allEvents: any[] = [];
  const perSource: Record<string, number> = {};

  for (const { source, query } of SOURCES) {
    try {
      const results = await firecrawlSearch(query, fcKey);
      console.log("source", source, "results", results.length);
      const combined = results
        .map((r: any) => `URL: ${r.url}\nTitle: ${r.title}\n${r.markdown ?? r.description ?? ""}`)
        .join("\n\n---\n\n");
      if (!combined) { perSource[source] = 0; continue; }
      const events = await extractWithAI(combined, source, lovableKey);
      console.log("source", source, "extracted", events.length);
      perSource[source] = events.length;
      for (const ev of events) {
        if (!ev.url || !ev.title) continue;
        allEvents.push({
          title: String(ev.title).slice(0, 200),
          venue: ev.venue ?? null,
          event_date: ev.event_date ?? null,
          event_time: ev.event_time ?? null,
          url: ev.url,
          source,
          blurb: ev.blurb ? String(ev.blurb).slice(0, 200) : null,
          genre: Array.isArray(ev.genre) ? ev.genre : [],
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error(`source ${source} failed`, e);
    }
  }

  let upserted = 0;
  if (allEvents.length) {
    const { error, count } = await supabase
      .from("curated_events")
      .upsert(allEvents, { onConflict: "url", count: "exact" });
    if (error) {
      console.error("upsert error", error);
      return new Response(JSON.stringify({ error: error.message, attempted: allEvents.length, perSource }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    upserted = count ?? allEvents.length;
  }

  return new Response(JSON.stringify({ ok: true, found: allEvents.length, upserted, perSource }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
