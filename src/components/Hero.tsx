import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();

  const leftX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-180%"]);
  const leftY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-30%"]);
  const leftRot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -45]);
  const rightX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "180%"]);
  const rightY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-30%"]);
  const rightRot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 45]);

  const djY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "18%"]);
  const djScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.06]);

  const starRotA = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 360]);
  const starRotB = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -360]);

  return (
    <>
      <section ref={ref} id="home" className="relative h-screen overflow-hidden bg-electric-blue">
        {disco && <Lasers />}
        {disco && <DiscoBall />}

        <motion.div
          style={{ rotate: starRotA, willChange: "transform" }}
          className="absolute top-24 left-6 md:top-28 md:left-16 z-10 w-16 md:w-32 text-acid-yellow drop-shadow-[6px_6px_0_hsl(var(--ink))]"
          aria-hidden
        >
          <Star />
        </motion.div>
        <motion.div
          style={{ rotate: starRotB, willChange: "transform" }}
          className="absolute top-32 right-6 md:top-40 md:right-20 z-10 w-14 md:w-28 text-magenta drop-shadow-[6px_6px_0_hsl(var(--ink))]"
          aria-hidden
        >
          <Star />
        </motion.div>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
          <h1 className="font-display text-[18vw] md:text-[16vw] leading-[0.85] text-cream drop-shadow-[6px_6px_0_hsl(var(--ink))] -mt-4 md:-mt-6">
            CATS<br/>CAN<br/>DANCE
          </h1>
        </div>

        {/* DJ cat — sits above buttons on mobile */}
        <motion.img
          src={heroCenter}
          alt=""
          aria-hidden
          style={{ y: djY, scale: djScale, willChange: "transform" }}
          className="absolute inset-x-0 mx-auto bottom-28 md:bottom-0 z-30 w-[78%] min-w-[280px] max-w-[680px] drop-shadow-[10px_10px_0_hsl(var(--ink))] pointer-events-none"
        />

        {/* Side cats — smaller on mobile */}
        <motion.div
          style={{ x: leftX, y: leftY, rotate: leftRot, willChange: "transform" }}
          className="absolute bottom-4 left-2 md:left-10 z-40 w-16 md:w-56 drop-shadow-[6px_6px_0_hsl(var(--ink))]"
        >
          <img src={catLeft} alt="" className="w-full wiggle" />
        </motion.div>
        <motion.div
          style={{ x: rightX, y: rightY, rotate: rightRot, willChange: "transform" }}
          className="absolute bottom-4 right-2 md:right-10 z-40 w-16 md:w-56 drop-shadow-[6px_6px_0_hsl(var(--ink))]"
        >
          <img src={catRight} alt="" className="w-full wiggle" />
        </motion.div>

        {/* Desktop buttons (absolute) */}
        <div className="hidden md:flex absolute inset-x-0 bottom-16 z-50 flex-row gap-3 justify-center px-4">
          <a href="#early-access" className="bg-magenta text-cream font-display text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform text-center">
            JOIN THE PACK
          </a>
          <a href="#events" className="bg-acid-yellow text-ink font-display text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform text-center">
            SEE THE DROPS
          </a>
        </div>

        {/* Mobile buttons (absolute, above DJ feet, below DJ image visually since DJ raised) */}
        <div className="md:hidden absolute inset-x-0 bottom-6 z-50 flex flex-col gap-3 justify-center px-6">
          <a href="#early-access" className="bg-magenta text-cream font-display text-lg px-6 py-3 border-4 border-ink chunk-shadow text-center">
            JOIN THE PACK
          </a>
          <a href="#events" className="bg-acid-yellow text-ink font-display text-lg px-6 py-3 border-4 border-ink chunk-shadow text-center">
            SEE THE DROPS
          </a>
        </div>
      </section>
    </>
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
