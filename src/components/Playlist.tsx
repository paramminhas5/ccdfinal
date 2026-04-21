import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import vinyl from "@/assets/vinyl-music.png";
import { supabase } from "@/integrations/supabase/client";

type PlaylistItem = { id: string; title: string; spotify_id: string };
const FALLBACK: PlaylistItem = { id: "main", title: "Now Spinning", spotify_id: "1cEE860l9GiBvIYVM2BbSS" };

const Playlist = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 540]);

  const [playlists, setPlaylists] = useState<PlaylistItem[]>([FALLBACK]);
  const [activeId, setActiveId] = useState<string>(FALLBACK.id);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("playlists, featured_playlist_id")
        .eq("id", "main")
        .maybeSingle();
      const list = ((data?.playlists as unknown) as PlaylistItem[]) ?? [];
      if (list.length) {
        setPlaylists(list);
        const featured = data?.featured_playlist_id;
        setActiveId(featured && list.find((p) => p.id === featured) ? featured : list[0].id);
      }
    })();
  }, []);

  const active = playlists.find((p) => p.id === activeId) ?? playlists[0];

  return (
    <section
      ref={ref}
      id="playlist"
      className="relative bg-magenta py-20 md:py-20 border-t-4 border-b-4 border-ink overflow-hidden"
    >
      <motion.img
        src={vinyl}
        alt=""
        loading="lazy"
        style={{ rotate, willChange: "transform" }}
        className="absolute -top-20 -right-20 w-56 md:w-[28rem] opacity-90 pointer-events-none transform-gpu"
      />
      <div className="container relative z-10">
        <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-4">/ THE PLAYLIST</p>
        <h2 className="font-display text-cream text-6xl md:text-8xl mb-12 drop-shadow-[6px_6px_0_hsl(var(--ink))] leading-[0.9]">
          NOW<br/>SPINNING
        </h2>

        {playlists.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`font-display text-sm md:text-base px-4 py-2 border-4 border-ink transition-colors ${
                  p.id === activeId ? "bg-acid-yellow text-ink" : "bg-cream text-ink hover:bg-acid-yellow"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-3xl border-4 border-ink chunk-shadow-lg bg-cream overflow-hidden relative z-20">
          <iframe
            key={active?.spotify_id}
            title={`Cats Can Dance — ${active?.title ?? "Playlist"}`}
            src={`https://open.spotify.com/embed/playlist/${active?.spotify_id}?utm_source=generator&theme=0`}
            width="100%"
            height={480}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block w-full h-[380px] md:h-[480px] border-0"
          />
        </div>

        <a
          href={`https://open.spotify.com/playlist/${active?.spotify_id}`}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer-when-downgrade"
          className="inline-block mt-6 font-display text-cream text-lg underline decoration-4 decoration-acid-yellow underline-offset-4 hover:text-acid-yellow transition"
        >
          Open in Spotify →
        </a>
      </div>
    </section>
  );
};

export default Playlist;
