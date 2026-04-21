const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHANNEL_ID = "UCmtg0d8E2PXfs3vlQIcGwdQ";
const CACHE_MS = 10 * 60 * 1000;

let videosCache: { ts: number; videos: any[] } | null = null;

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
    if (videosCache && Date.now() - videosCache.ts < CACHE_MS) {
      return new Response(JSON.stringify({ videos: videosCache.videos, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=6&key=${apiKey}`;
    const r = await fetch(url);
    const j = await r.json();

    if (j.error) {
      console.error("YouTube API error:", JSON.stringify(j.error));
      throw new Error(j.error.message);
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

    videosCache = { ts: Date.now(), videos };

    return new Response(JSON.stringify({ videos, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("youtube-videos error", e);
    return new Response(JSON.stringify({ videos: [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
