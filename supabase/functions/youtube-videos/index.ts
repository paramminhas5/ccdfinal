const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHANNEL_ID = "UCmtg0d8E2PXfs3vlQIcGwdQ";
const CACHE_MS = 12 * 60 * 60 * 1000; // 12 hours
const ERROR_CACHE_MS = 30 * 60 * 1000; // 30 minutes — don't burn quota retrying

let videosCache: { ts: number; videos: any[]; isError?: boolean } | null = null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY not configured");
    return new Response(JSON.stringify({ videos: [], error: "YOUTUBE_API_KEY not configured" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const now = Date.now();
    if (videosCache) {
      const ttl = videosCache.isError ? ERROR_CACHE_MS : CACHE_MS;
      if (now - videosCache.ts < ttl) {
        return new Response(JSON.stringify({ videos: videosCache.videos, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=6&key=${apiKey}`;
    const r = await fetch(url);
    const j = await r.json();

    if (j.error) {
      console.error("YouTube API error:", JSON.stringify(j.error));
      // Stale-while-error: return previously cached videos if we have any
      if (videosCache && videosCache.videos.length > 0) {
        videosCache = { ts: now, videos: videosCache.videos, isError: true };
        return new Response(JSON.stringify({ videos: videosCache.videos, cached: true, stale: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Cache empty error result so we don't re-hit the API every page load
      videosCache = { ts: now, videos: [], isError: true };
      return new Response(JSON.stringify({ videos: [], error: j.error.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!j.items || j.items.length === 0) {
      console.error("YouTube returned no items. Full response:", JSON.stringify(j));
    }

    const videos = (j.items || []).map((v: any) => ({
      id: v.id.videoId,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
      publishedAt: v.snippet.publishedAt,
    }));

    videosCache = { ts: now, videos };

    return new Response(JSON.stringify({ videos, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("youtube-videos error", e);
    // Stale-while-error
    if (videosCache && videosCache.videos.length > 0) {
      return new Response(JSON.stringify({ videos: videosCache.videos, cached: true, stale: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ videos: [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
