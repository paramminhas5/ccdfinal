import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const isEmail = (s: unknown) =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) || null : null;
const arr = (v: unknown, maxLen = 20, itemMax = 80) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, maxLen).map((x) => x.trim().slice(0, itemMax)).filter(Boolean) : [];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let body: any;
  try { body = await req.json(); } catch { return j({ error: "Invalid JSON" }, 400); }

  const submitter_email = str(body.submitter_email, 254);
  const name = str(body.name, 200);
  if (!submitter_email || !isEmail(submitter_email)) return j({ error: "Valid submitter_email required" }, 400);
  if (!name) return j({ error: "Artist name required" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const row = {
    name,
    members: str(body.members, 200),
    from_city: str(body.from_city, 120),
    based_city: str(body.based_city, 120),
    genres: arr(body.genres),
    bio: str(body.bio, 4000),
    photo_url: str(body.photo_url, 1000),
    instagram: str(body.instagram, 200),
    soundcloud: str(body.soundcloud, 500),
    bandcamp: str(body.bandcamp, 500),
    spotify: str(body.spotify, 500),
    website: str(body.website, 500),
    booking_email: str(body.booking_email, 254),
    manager_email: str(body.manager_email, 254),
    festivals: arr(body.festivals, 40, 200),
    labels: str(body.labels, 500),
    submitter_email,
    submitter_role: str(body.submitter_role, 40),
    notes: str(body.notes, 2000),
    user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  };

  const { error } = await supabase.from("artist_submissions").insert(row);
  if (error) {
    console.error("artist-submit insert error", error);
    return j({ error: "Failed to submit" }, 500);
  }

  // Best-effort internal notification email
  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "artist-submission-internal",
        recipientEmail: "hello@catscandance.com",
        idempotencyKey: `artist-sub-${row.submitter_email}-${Date.now()}`,
        templateData: { name, submitter_email, bio: row.bio, instagram: row.instagram, soundcloud: row.soundcloud, website: row.website },
      },
    });
  } catch (e) { console.warn("notify failed", e); }

  return j({ success: true });

  function j(b: unknown, status = 200) {
    return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
