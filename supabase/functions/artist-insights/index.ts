// Generates per-artist insights: commonalities + AI-driven interesting facts.
// Run weekly or on-demand. POST { artist_id?: string, all?: boolean, limit?: number }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-2.5-pro";

type Artist = {
  id: string; name: string; slug: string;
  genres: string[]; festivals: string[]; labels: string | null;
  based_city: string | null; from_city: string | null;
  bio: string | null;
};

async function callAI(system: string, user: string): Promise<string> {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${AI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.6,
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "";
}

function overlap<T>(a: T[], b: T[]): T[] {
  const sb = new Set(b);
  return a.filter((x) => sb.has(x));
}

function ci(s: string | null | undefined) {
  return (s ?? "").toLowerCase().trim();
}

async function buildInsights(target: Artist, roster: Artist[]) {
  // ---- Computed commonalities (no AI) ----
  const others = roster.filter((r) => r.id !== target.id);

  const labelMates = target.labels
    ? others
        .filter((o) => o.labels && overlap(o.labels.split(/[,;/]+/).map(ci), target.labels!.split(/[,;/]+/).map(ci)).length > 0)
        .slice(0, 4)
        .map((o) => ({ slug: o.slug, name: o.name }))
    : [];

  const cityKey = ci(target.based_city) || ci(target.from_city);
  const cityMates = cityKey
    ? others
        .filter((o) => ci(o.based_city) === cityKey || ci(o.from_city) === cityKey)
        .slice(0, 5)
        .map((o) => ({ slug: o.slug, name: o.name, city: o.based_city ?? o.from_city }))
    : [];

  const festivalMates = target.festivals?.length
    ? others
        .map((o) => ({
          o,
          shared: overlap((o.festivals ?? []).map(ci), target.festivals.map(ci)),
        }))
        .filter((x) => x.shared.length > 0)
        .sort((a, b) => b.shared.length - a.shared.length)
        .slice(0, 4)
        .map((x) => ({ slug: x.o.slug, name: x.o.name, shared: x.shared.length }))
    : [];

  const genreMates = target.genres?.length
    ? others
        .map((o) => ({ o, shared: overlap((o.genres ?? []).map(ci), target.genres.map(ci)) }))
        .filter((x) => x.shared.length > 0)
        .sort((a, b) => b.shared.length - a.shared.length)
        .slice(0, 5)
        .map((x) => ({ slug: x.o.slug, name: x.o.name, shared: x.shared }))
    : [];

  // ---- AI: sounds_like + career_arc + hidden_fact ----
  const sys = `You are a music journalist covering India's electronic + underground scene. Return ONLY valid JSON. Be specific, cite real labels/festivals/cities when possible. No hype words. No emojis. If you don't know something verifiable, say null — never invent.`;
  const prompt = `Artist: ${target.name}
Based in: ${target.based_city ?? target.from_city ?? "India"}
Genres: ${target.genres?.join(", ") || "electronic"}
Labels: ${target.labels ?? "—"}
Festivals played: ${target.festivals?.slice(0, 6).join(", ") || "—"}
Bio excerpt: ${(target.bio ?? "").slice(0, 800)}

Return JSON with this exact shape:
{
  "sounds_like": { "international": ["artist1","artist2"], "indian": ["artist1","artist2"] },
  "career_arc": ["milestone 1 (year)", "milestone 2 (year)", "milestone 3 (year)"],
  "hidden_fact": "one sentence — something most fans wouldn't know, only if verifiable, else null",
  "scene_role": "one short phrase: e.g. 'pillar of Bangalore's bass scene', 'pioneer of Mumbai techno'"
}`;

  let aiBlock: any = {};
  try {
    const txt = await callAI(sys, prompt);
    const m = txt.match(/\{[\s\S]*\}/);
    aiBlock = m ? JSON.parse(m[0]) : {};
  } catch (e) {
    aiBlock = { _error: String((e as Error).message ?? e) };
  }

  return {
    commonalities: {
      label_mates: labelMates,
      city_mates: cityMates,
      festival_mates: festivalMates,
      genre_mates: genreMates,
    },
    sounds_like: aiBlock.sounds_like ?? null,
    career_arc: aiBlock.career_arc ?? null,
    hidden_fact: aiBlock.hidden_fact ?? null,
    scene_role: aiBlock.scene_role ?? null,
    generated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(url, key);

  const adminPass = req.headers.get("x-admin-password") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.includes(key.slice(-8)) && adminPass !== (Deno.env.get("ADMIN_PASSWORD") ?? "")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const { artist_id, all, limit = 20, force = false } = body;

  const q = sb
    .from("artists")
    .select("id,name,slug,genres,festivals,labels,based_city,from_city,bio,insights_generated_at")
    .eq("status", "approved");
  const { data: roster } = await q;
  const rosterArr = (roster ?? []) as (Artist & { insights_generated_at: string | null })[];

  let targets: Artist[];
  if (artist_id) targets = rosterArr.filter((a) => a.id === artist_id);
  else if (all) {
    const pool = force ? rosterArr : rosterArr.filter((a) => !a.insights_generated_at);
    targets = pool.slice(0, limit);
  } else targets = rosterArr.slice(0, limit);

  const results: any[] = [];
  for (const t of targets) {
    try {
      const ins = await buildInsights(t, rosterArr);
      await sb.from("artists").update({ insights: ins as any, insights_generated_at: new Date().toISOString() } as any).eq("id", t.id);
      results.push({ slug: t.slug, ok: true });
    } catch (e: any) {
      results.push({ slug: t.slug, ok: false, error: e?.message ?? String(e) });
    }
    await new Promise((r) => setTimeout(r, 800)); // pacing
  }

  return new Response(JSON.stringify({ ok: true, count: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
