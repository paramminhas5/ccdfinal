import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";
import { useRef } from "react";
import vinyl from "@/assets/vinyl-music.png";

const tracks = [
  { n: "01", title: "Midnight Drift", artist: "Luna Beats", time: "3:42" },
  { n: "02", title: "Alley Cat Strut", artist: "Tom & The Toms", time: "2:58" },
  { n: "03", title: "Pawsitive Vibes", artist: "Whisker Funk", time: "4:12" },
  { n: "04", title: "Disco Kitten", artist: "DJ Meowmix", time: "3:30" },
  { n: "05", title: "Nine Lives Boogie", artist: "Felix Sound System", time: "5:01" },
];

const Playlist = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const vel = useVelocity(scrollYProgress);
  const spinBase = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const smoothSpin = useSpring(spinBase, { stiffness: 60, damping: 20 });
  return (
  <section ref={ref} id="playlist" className="relative bg-magenta py-24 md:py-32 border-t-4 border-b-4 border-ink overflow-hidden">
    <motion.img
      src={vinyl}
      alt=""
      style={{ rotate: smoothSpin }}
      className="absolute -top-20 -right-20 w-80 md:w-[28rem] opacity-90"
    />
    <div className="container relative z-10">
      <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-4">/ THE PLAYLIST</p>
      <h2 className="font-display text-cream text-6xl md:text-9xl mb-12 drop-shadow-[6px_6px_0_hsl(var(--ink))]">
        NOW<br/>SPINNING
      </h2>
      <ul className="max-w-3xl bg-cream border-4 border-ink chunk-shadow-lg divide-y-4 divide-ink">
        {tracks.map((t, i) => (
          <motion.li
            key={t.n}
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: i * 0.08 }}
            className="flex items-center gap-4 md:gap-6 p-4 md:p-6 hover:bg-acid-yellow transition-colors group"
          >
            <span className="font-display text-3xl md:text-5xl text-magenta w-14">{t.n}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl md:text-2xl text-ink truncate">{t.title}</p>
              <p className="text-ink/70 text-sm md:text-base truncate">{t.artist}</p>
            </div>
            <span className="font-display text-base md:text-lg text-ink">{t.time}</span>
            <button className="w-10 h-10 md:w-12 md:h-12 grid place-items-center bg-ink text-cream rounded-full group-hover:bg-magenta transition-colors" aria-label={`Play ${t.title}`}>
              ▶
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  </section>
  );
};

export default Playlist;
