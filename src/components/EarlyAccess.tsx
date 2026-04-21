import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import note from "@/assets/music-note.png";
import Confetti from "@/components/Confetti";

const EarlyAccess = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shadowSize = useTransform(scrollYProgress, [0, 1], [2, 14]);
  const titleShadow = useTransform(shadowSize, (v) => `${v}px ${v}px 0 hsl(var(--ink))`);
  const orbit1 = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const orbit2 = useTransform(scrollYProgress, [0, 1], [0, -360]);
  const [email, setEmail] = useState("");
  const [burst, setBurst] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're in! Welcome to the litter.");
    setEmail("");
    setBurst(false);
    requestAnimationFrame(() => setBurst(true));
    setTimeout(() => setBurst(false), 1300);
  };
  return (
    <section ref={ref} id="early-access" className="relative bg-electric-blue py-24 md:py-32 border-b-4 border-ink overflow-hidden">
      <Confetti active={burst} />
      <motion.div style={{ rotate: orbit1 }} className="absolute top-1/2 left-1/2 -mt-40 -ml-40 w-80 h-80 pointer-events-none" aria-hidden>
        <img src={note} alt="" className="absolute top-0 left-1/2 -translate-x-1/2 w-16" />
      </motion.div>
      <motion.div style={{ rotate: orbit2 }} className="absolute top-1/2 left-1/2 -mt-56 -ml-56 w-[28rem] h-[28rem] pointer-events-none" aria-hidden>
        <img src={note} alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12" />
      </motion.div>
      <div className="container relative z-10 text-center max-w-3xl">
        <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-4">/ EARLY ACCESS</p>
        <motion.h2 style={{ textShadow: titleShadow }} className="font-display text-cream text-6xl md:text-8xl mb-6">
          BE FIRST<br/>IN THE DOOR
        </motion.h2>
        <p className="text-cream/90 text-lg md:text-xl mb-10 font-medium">
          Sign up for early access to drops, gigs, and the cult before everyone else catches on.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-cream text-ink border-4 border-ink px-5 py-4 font-display text-lg placeholder:text-ink/40 focus:outline-none focus:bg-acid-yellow"
          />
          <button
            type="submit"
            className="bg-magenta text-cream font-display text-xl px-8 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
          >
            COUNT ME IN
          </button>
        </form>
      </div>
    </section>
  );
};

export default EarlyAccess;
