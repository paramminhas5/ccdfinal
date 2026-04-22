import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import catDancer from "@/assets/cat-dancer.svg";

const About = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Mobile uses a tighter range; we let CSS hide one of these motion images per breakpoint
  const xMobile = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-20%", "120%"]);
  const xDesktop = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "150%"]);
  const rot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-6, 6]);
  // Step-y bob synced to scroll — looks like walking
  const bob = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    reduce ? [0, 0, 0, 0, 0] : [0, -8, 0, -8, 0]
  );

  return (
    <section
      ref={ref}
      id="about"
      className="relative bg-cream border-b-4 border-ink py-16 md:py-20 bg-grain overflow-x-clip"
    >
      <div className="container grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div>
          <p className="font-display text-magenta text-xl sm:text-2xl md:text-3xl mb-3 md:mb-4">/ THE BRAND</p>
          <h2 className="font-display text-ink leading-[0.95] mb-5 md:mb-6 break-words text-[2rem] sm:text-5xl md:text-6xl">
            A CULTURE FOR PEOPLE WHO MOVE.
          </h2>
          <p className="text-ink/80 text-base sm:text-lg md:text-xl font-medium mb-6 max-w-xl">
            Cats Can Dance is dance music, pet culture and streetwear in one club.
            Drops, parties, playlists and a community that shows up.
          </p>
          <Link
            to="/about"
            className="inline-block bg-ink text-cream font-display text-base sm:text-lg px-5 sm:px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
          >
            READ THE STORY →
          </Link>
        </div>

        <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-visible pointer-events-none">
          {/* Mobile cat (smaller range) */}
          <motion.img
            src={catDancer}
            alt=""
            aria-hidden
            style={{ x: xMobile, y: bob, rotate: rot }}
            className="md:hidden absolute top-1/2 -translate-y-1/2 left-0 w-3/4 max-w-[220px] pointer-events-none drop-shadow-[6px_6px_0_hsl(var(--ink))]"
          />
          {/* Desktop cat (wider range, larger) */}
          <motion.img
            src={catDancer}
            alt=""
            aria-hidden
            style={{ x: xDesktop, y: bob, rotate: rot }}
            className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 w-2/3 max-w-sm pointer-events-none drop-shadow-[6px_6px_0_hsl(var(--ink))]"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
