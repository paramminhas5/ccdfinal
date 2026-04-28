const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHANNEL_ID = "UCmtg0d8E2PXfs3vlQIcGwdQ";
const CACHE_MS = 12 * 60 * 60 * 1000; // 12 hours
const ERROR_CACHE_MS = 30 * 60 * 1000;

type CacheEntry = { ts: number; videos: any[]; isError?: boolean };
const videosCacheByMax = new Map<number, CacheEntry>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("YOUTUBE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ videos: [], error: "YOUTUBE_API_KEY not configured" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const maxParam = parseInt(url.searchParams.get("max") ?? "6", 10);
  const maxResults = Math.min(Math.max(isNaN(maxParam) ? 6 : maxParam, 1), 50);

  try {
    const now = Date.now();
    const cached = videosCacheByMax.get(maxResults);
    if (cached) {
      const ttl = cached.isError ? ERROR_CACHE_MS : CACHE_MS;
      if (now - cached.ts < ttl) {
        return new Response(JSON.stringify({ videos: cached.videos, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`;
    const r = await fetch(apiUrl);
    const j = await r.json();

    if (j.error) {
      console.error("YouTube API error:", JSON.stringify(j.error));
      if (cached && cached.videos.length > 0) {
        videosCacheByMax.set(maxResults, { ts: now, videos: cached.videos, isError: true });
        return new Response(JSON.stringify({ videos: cached.videos, cached: true, stale: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      videosCacheByMax.set(maxResults, { ts: now, videos: [], isError: true });
      return new Response(JSON.stringify({ videos: [], error: j.error.message }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videos = (j.items || []).map((v: any) => ({
      id: v.id.videoId,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
      publishedAt: v.snippet.publishedAt,
    }));

    videosCacheByMax.set(maxResults, { ts: now, videos });

    return new Response(JSON.stringify({ videos, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("youtube-videos error", e);
    const cached = videosCacheByMax.get(maxResults);
    if (cached && cached.videos.length > 0) {
      return new Response(JSON.stringify({ videos: cached.videos, cached: true, stale: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ videos: [], error: String(e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
