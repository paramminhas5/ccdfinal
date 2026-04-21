import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import vinyl from "@/assets/vinyl-music.png";

const PLAYLIST_ID = "1cEE860l9GiBvIYVM2BbSS";

const Playlist = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const spin = useTransform(scrollYProgress, [0, 1], [0, 540]);

  return (
    <section ref={ref} id="playlist" className="relative bg-magenta py-24 md:py-32 border-t-4 border-b-4 border-ink overflow-hidden">
      <motion.img
        src={vinyl}
        alt=""
        style={{ rotate: spin, willChange: "transform" }}
        className="absolute -top-20 -right-20 w-80 md:w-[28rem] opacity-90 pointer-events-none transform-gpu"
      />
      <div className="container relative z-10">
        <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-4">/ THE PLAYLIST</p>
        <h2 className="font-display text-cream text-6xl md:text-9xl mb-12 drop-shadow-[6px_6px_0_hsl(var(--ink))] leading-[0.9]">
          NOW<br/>SPINNING
        </h2>

        <div className="max-w-3xl border-4 border-ink chunk-shadow-lg bg-cream overflow-hidden animate-fade-in">
          <iframe
            title="Cats Can Dance — Now Spinning"
            src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`}
            width="100%"
            height={480}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
            className="block w-full h-[380px] md:h-[480px] border-0"
          />
        </div>

        <a
          href={`https://open.spotify.com/playlist/${PLAYLIST_ID}`}
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
