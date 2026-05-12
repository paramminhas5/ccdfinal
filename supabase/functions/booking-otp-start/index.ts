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

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let body: any;
  try { body = await req.json(); } catch { return j({ error: "Invalid JSON" }, 400); }

  const requester_email = str(body.requester_email, 254)?.toLowerCase() ?? null;
  const artist_id = str(body.artist_id, 64);
  if (!requester_email || !isEmail(requester_email)) return j({ error: "Valid email required" }, 400);
  if (!artist_id) return j({ error: "artist_id required" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Look up artist
  const { data: artist, error: aerr } = await supabase
    .from("artists").select("id, name, booking_email, manager_email").eq("id", artist_id).maybeSingle();
  if (aerr || !artist) return j({ error: "Artist not found" }, 404);

  // Rate limit: 5 OTP requests / hour per email
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("booking_otp_codes").select("id", { count: "exact", head: true })
    .eq("email", requester_email).gt("created_at", oneHourAgo);
  if ((count ?? 0) >= 5) return j({ error: "Too many requests. Try again in an hour." }, 429);

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const code_hash = await sha256(code);
  const expires_at = new Date(Date.now() + 10 * 60_000).toISOString();

  await supabase.from("booking_otp_codes").insert({ email: requester_email, code_hash, expires_at });

  const purpose = str(body.purpose, 1000);
  const requester_phone = str(body.requester_phone, 40);
  const { data: bookingRow } = await supabase.from("booking_requests").insert({
    artist_id: artist.id,
    artist_name: artist.name,
    requester_email,
    requester_phone,
    purpose,
    user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  }).select("id").single();

  // Send OTP email + internal notification (best-effort)
  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "booking-otp",
        recipientEmail: requester_email,
        idempotencyKey: `booking-otp-${requester_email}-${Date.now()}`,
        templateData: { code, artistName: artist.name },
      },
    });
  } catch (e) { console.warn("OTP email failed", e); }

  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "booking-request-internal",
        recipientEmail: "hello@catscandance.com",
        idempotencyKey: `booking-internal-${bookingRow?.id ?? Date.now()}`,
        templateData: { artistName: artist.name, requesterEmail: requester_email, requesterPhone: requester_phone, purpose },
      },
    });
  } catch (e) { console.warn("internal notify failed", e); }

  return j({ success: true, booking_id: bookingRow?.id });

  function j(b: unknown, status = 200) {
    return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
