import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const ALLOWED = new Set([
  "name","members","from_city","based_city","genres","bio","photo_url",
  "instagram","soundcloud","bandcamp","spotify","website","booking_email","manager_email",
  "festivals","labels","status","slug",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const password = req.headers.get("x-admin-password") ?? "";
  const expected = Deno.env.get("ADMIN_PASSWORD") ?? "";
  if (!expected || !timingSafeEqual(password, expected)) {
    return j({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "list";

  try {
    if (req.method === "GET") {
      if (action === "submissions") {
        const { data, error } = await supabase.from("artist_submissions").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return j({ items: data ?? [] });
      }
      if (action === "bookings") {
        const { data, error } = await supabase.from("booking_requests").select("*").order("created_at", { ascending: false }).limit(200);
        if (error) throw error;
        return j({ items: data ?? [] });
      }
      const { data, error } = await supabase.from("artists").select("*").order("name");
      if (error) throw error;
      return j({ items: data ?? [] });
    }

    const body = await req.json();

    if (req.method === "POST" && action === "create") {
      const patch = pick(body);
      if (!patch.name) return j({ error: "name required" }, 400);
      if (!patch.slug) patch.slug = slugify(patch.name);
      patch.status = patch.status ?? "approved";
      patch.source = "manual";
      const { data, error } = await supabase.from("artists").insert(patch).select().single();
      if (error) throw error;
      return j({ item: data });
    }

    if (req.method === "POST" && action === "approve_submission") {
      const id = String(body.id ?? "");
      if (!id) return j({ error: "id required" }, 400);
      const { data: sub, error: serr } = await supabase.from("artist_submissions").select("*").eq("id", id).maybeSingle();
      if (serr || !sub) return j({ error: "Submission not found" }, 404);
      const { id: _ignore, submitter_email, submitter_role, notes, status, created_at, user_agent, ...rest } = sub as any;
      const slug = slugify(rest.name);
      const { error: ierr } = await supabase.from("artists").insert({ ...rest, slug, status: "approved", source: "submission" });
      if (ierr) throw ierr;
      await supabase.from("artist_submissions").update({ status: "approved" }).eq("id", id);
      return j({ success: true });
    }

    if (req.method === "POST" && action === "reject_submission") {
      const id = String(body.id ?? "");
      await supabase.from("artist_submissions").update({ status: "rejected" }).eq("id", id);
      return j({ success: true });
    }

    if (req.method === "PATCH") {
      const id = String(body.id ?? "");
      if (!id) return j({ error: "id required" }, 400);
      const patch = pick(body.patch ?? {});
      if (Object.keys(patch).length === 0) return j({ error: "no fields" }, 400);
      const { data, error } = await supabase.from("artists").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return j({ item: data });
    }

    if (req.method === "DELETE") {
      const id = String(body.id ?? "");
      const table = body.table === "submission" ? "artist_submissions" : "artists";
      await supabase.from(table).delete().eq("id", id);
      return j({ success: true });
    }

    return j({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-artists", e);
    return j({ error: (e as Error).message }, 500);
  }

  function j(b: unknown, status = 200) {
    return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  function pick(o: any) {
    const out: any = {};
    for (const k of Object.keys(o ?? {})) if (ALLOWED.has(k)) out[k] = o[k];
    return out;
  }
});
