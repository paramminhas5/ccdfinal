import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroCenter from "@/assets/hero-center.svg";
import catLeft from "@/assets/cat-left.svg";
import catRight from "@/assets/cat-right.svg";
import { useDisco } from "@/contexts/DiscoContext";
import DiscoBall from "@/components/DiscoBall";
import Lasers from "@/components/Lasers";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const { disco } = useDisco();

  // Cats dance OFF screen as you scroll
  const leftX = useTransform(scrollYProgress, [0, 1], ["0%", "-220%"]);
  const leftY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const leftRot = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["0%", "220%"]);
  const rightY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const rightRot = useTransform(scrollYProgress, [0, 1], [0, 55]);

  // Stars spin on scroll
  const starRotA = useTransform(scrollYProgress, [0, 1], [0, 540]);
  const starRotB = useTransform(scrollYProgress, [0, 1], [0, -540]);
  const starScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 0.9]);

  return (
    <section ref={ref} id="home" className="relative h-screen overflow-hidden bg-electric-blue">
      {disco && <Lasers />}
      {disco && <DiscoBall />}
      {/* Spinning stars */}
      <motion.div
        style={{ rotate: starRotA, scale: starScale }}
        className="absolute top-24 left-6 md:top-28 md:left-16 z-20 w-20 md:w-32 text-acid-yellow drop-shadow-[6px_6px_0_hsl(var(--ink))]"
        aria-hidden
      >
        <Star />
      </motion.div>
      <motion.div
        style={{ rotate: starRotB, scale: starScale }}
        className="absolute top-32 right-6 md:top-40 md:right-20 z-20 w-16 md:w-28 text-magenta drop-shadow-[6px_6px_0_hsl(var(--ink))]"
        aria-hidden
      >
        <Star />
      </motion.div>
      <motion.div
        style={{ rotate: starRotB }}
        className="absolute bottom-1/3 left-1/4 z-10 w-10 md:w-16 text-lime drop-shadow-[4px_4px_0_hsl(var(--ink))] hidden md:block"
        aria-hidden
      >
        <Star />
      </motion.div>

      {/* Big bold title behind */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
        <h1 className="font-display text-[18vw] md:text-[16vw] leading-[0.85] text-cream drop-shadow-[6px_6px_0_hsl(var(--ink))] -mt-4 md:-mt-6">
          CATS<br/>CAN<br/>DANCE
        </h1>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 pointer-events-auto relative z-40">
          <a href="#early-access" className="bg-magenta text-cream font-display text-lg md:text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
            JOIN THE PACK
          </a>
          <a href="#events" className="bg-acid-yellow text-ink font-display text-lg md:text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
            SEE THE DROPS
          </a>
        </div>
      </div>

      {/* Dancing cats on the sides */}
      <motion.div
        style={{ x: leftX, y: leftY, rotate: leftRot }}
        className="absolute bottom-4 left-2 md:left-10 z-30 w-32 md:w-56 drop-shadow-[6px_6px_0_hsl(var(--ink))]"
      >
        <img src={catLeft} alt="" className="w-full wiggle" />
      </motion.div>
      <motion.div
        style={{ x: rightX, y: rightY, rotate: rightRot }}
        className="absolute bottom-4 right-2 md:right-10 z-30 w-32 md:w-56 drop-shadow-[6px_6px_0_hsl(var(--ink))]"
      >
        <img src={catRight} alt="" className="w-full wiggle" />
      </motion.div>

      {/* Centered DJ cat artwork — decorative, never blocks clicks */}
      <img
        src={heroCenter}
        alt=""
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20 w-[95%] max-w-5xl drop-shadow-[10px_10px_0_hsl(var(--ink))] pointer-events-none"
      />
    </section>
  );
};

const Star = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
    <path
      d="M50 2 L60 38 L98 40 L68 62 L80 98 L50 76 L20 98 L32 62 L2 40 L40 38 Z"
      stroke="hsl(var(--ink))"
      strokeWidth="5"
      strokeLinejoin="round"
    />
  </svg>
);

export default Hero;
