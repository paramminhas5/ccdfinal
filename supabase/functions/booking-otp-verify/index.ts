import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let body: any;
  try { body = await req.json(); } catch { return j({ error: "Invalid JSON" }, 400); }

  const email = typeof body.requester_email === "string" ? body.requester_email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const booking_id = typeof body.booking_id === "string" ? body.booking_id : null;
  const forward_requested = body.forward_requested === true;
  if (!email || !/^\d{6}$/.test(code)) return j({ error: "Invalid email or code" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const code_hash = await sha256(code);

  const { data: rows } = await supabase
    .from("booking_otp_codes")
    .select("id, expires_at, consumed_at, attempts, code_hash")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(5);

  const match = (rows ?? []).find((r) => r.code_hash === code_hash && !r.consumed_at && new Date(r.expires_at) > new Date());
  if (!match) {
    // bump attempts on most recent
    if (rows && rows[0]) await supabase.from("booking_otp_codes").update({ attempts: (rows[0].attempts ?? 0) + 1 }).eq("id", rows[0].id);
    return j({ error: "Invalid or expired code" }, 400);
  }

  await supabase.from("booking_otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", match.id);

  // Pull artist via booking_id
  let artistEmail: string | null = null;
  let artistName = "";
  if (booking_id) {
    const { data: br } = await supabase
      .from("booking_requests")
      .select("id, artist_id, artist_name, requester_phone, purpose")
      .eq("id", booking_id).maybeSingle();
    if (br) {
      artistName = br.artist_name;
      const { data: artist } = await supabase
        .from("artists").select("booking_email, manager_email, name").eq("id", br.artist_id).maybeSingle();
      artistEmail = artist?.booking_email ?? artist?.manager_email ?? null;
      await supabase.from("booking_requests")
        .update({ verified_at: new Date().toISOString(), revealed_at: artistEmail ? new Date().toISOString() : null, forward_requested })
        .eq("id", booking_id);
      if (forward_requested) {
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "forwarded-booking-internal",
              recipientEmail: "hello@catscandance.com",
              idempotencyKey: `forward-${booking_id}`,
              templateData: { artistName: artist?.name ?? br.artist_name, requesterEmail: email, requesterPhone: br.requester_phone, purpose: br.purpose },
            },
          });
        } catch (e) { console.warn("forward notify failed", e); }
      }
    }
  }

  return j({ success: true, artist_email: artistEmail, artist_name: artistName });

  function j(b: unknown, status = 200) {
    return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
