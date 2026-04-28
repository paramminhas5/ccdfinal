// supabase/functions/scheduled-curate/index.ts
// Called by pg_cron every night at 2am IST (8:30pm UTC)
// Triggers curate-events for all cities + all sources

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify this is an internal call (from pg_cron or admin)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.includes(serviceKey.slice(-8))) {
    // Also allow admin password header
    const adminPass = req.headers.get("x-admin-password") ?? "";
    const expectedPass = Deno.env.get("ADMIN_PASSWORD") ?? "";
    if (!expectedPass || adminPass !== expectedPass) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const sources = ["sortmyscene", "insider", "skillboxes", "highape", "bookmyshow"];
  const cities = ["bangalore", "mumbai", "delhi"];
  const results: any[] = [];

  // Run each source × city pair sequentially to avoid rate limits
  for (const source of sources) {
    for (const city of cities) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/curate-events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ source, city, mode: "single", limit: 5 }),
        });
        const data = await res.json();
        results.push({ source, city, upserted: data?.upserted ?? 0, ok: res.ok });
      } catch (e: any) {
        results.push({ source, city, error: e?.message, ok: false });
      }
      // Brief pause between requests
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Clean up past events older than 30 days
  const supabase = createClient(supabaseUrl, serviceKey);
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { count } = await supabase
    .from("curated_events")
    .delete()
    .lt("event_date", cutoff)
    .eq("is_featured", false)
    .select("*", { count: "exact", head: true });

  const totalUpserted = results.reduce((s, r) => s + (r.upserted ?? 0), 0);

  console.log(`Scheduled curate complete: ${totalUpserted} events upserted, ${count ?? 0} old events pruned`);

  return new Response(JSON.stringify({
    ok: true,
    total_upserted: totalUpserted,
    pruned: count ?? 0,
    runs: results,
    timestamp: new Date().toISOString(),
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
