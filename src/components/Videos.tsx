import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const CHANNEL_URL = "https://www.youtube.com/@thesecatscandance";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

const Videos = () => {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("youtube-videos");
        if (cancelled) return;
        if (error || !data?.videos?.length) {
          setError(true);
          return;
        }
        setVideos(data.videos as Video[]);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="videos" className="relative bg-lime border-b-4 border-ink py-24 md:py-32 overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ VIDEOS · YOUTUBE</p>
            <h2 className="font-display text-ink text-6xl md:text-8xl leading-[0.9]">
              WATCH<br/>THE TAPES.
            </h2>
          </div>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer-when-downgrade"
            className="bg-magenta text-cream font-display text-lg px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
          >
            SUBSCRIBE →
          </a>
        </div>

        {videos === null && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-video bg-cream border-4 border-ink animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="space-y-6">
            <div className="aspect-video border-4 border-ink chunk-shadow bg-ink overflow-hidden">
              <iframe
                title="Cats Can Dance — Channel Uploads"
                src="https://www.youtube.com/embed/videoseries?list=UUmtg0d8E2PXfs3vlQIcGwdQ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="text-center">
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-magenta text-cream font-display px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
              >
                Visit the channel →
              </a>
            </div>
          </div>
        )}

        {videos && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v)}
                className="text-left bg-cream border-4 border-ink chunk-shadow hover:-translate-y-1 transition-transform group"
              >
                <div className="relative aspect-video overflow-hidden border-b-4 border-ink">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="w-16 h-16 grid place-items-center bg-magenta text-cream border-4 border-ink rounded-full font-display text-2xl">
                      ▶
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-ink leading-tight line-clamp-2">{v.title}</h3>
                  <p className="text-ink/60 text-sm mt-1">
                    {new Date(v.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl p-0 border-4 border-ink bg-ink overflow-hidden">
          {active && (
            <div className="aspect-video">
              <iframe
                title={active.title}
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Videos;
