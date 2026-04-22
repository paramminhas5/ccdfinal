import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import catDancer from "@/assets/cat-dancer.svg";

const About = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-5%", "25%"]);
  const rot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-3, 3]);

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

        <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-visible pointer-events-none">
          <motion.img
            src={catDancer}
            alt=""
            aria-hidden
            style={{ x, rotate: rot }}
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={reduce ? undefined : { duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 -translate-y-1/2 left-2 w-2/5 sm:w-1/2 md:w-2/3 max-w-[160px] md:max-w-sm pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
