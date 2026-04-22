import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import catDancer from "@/assets/cat-dancer.svg";
import vinyl from "@/assets/vinyl.png";

const bullets = [
  "High-value audience. Strong spending power.",
  "Earned attention. Not ads.",
  "Bridge between brands & next-gen consumers.",
  "Events, merch, partnerships, IP.",
];

const Why = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const catX = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const vinylRot = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const headlineX = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headline2X = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section ref={ref} id="why" className="relative bg-electric-blue border-b-4 border-ink overflow-hidden py-24 md:py-32">
      <motion.img src={vinyl} style={{ rotate: vinylRot }} alt="" className="absolute -top-20 -right-20 w-72 md:w-96 opacity-90" />

      <div className="container relative z-10">
        <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-4">/ WHY</p>
        <h2 className="font-display text-5xl md:text-8xl text-cream leading-[0.9] max-w-5xl drop-shadow-[5px_5px_0_hsl(var(--ink))]">
          <motion.span style={{ x: headlineX }} className="block">THREE WORLDS.</motion.span>
          <motion.span style={{ x: headline2X }} className="block">ONE ECOSYSTEM.</motion.span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <div className="space-y-6 text-ink text-lg md:text-xl font-medium">
            <p>
              Three cultural worlds —
              <span className="font-display text-2xl md:text-3xl text-magenta"> dance music</span>,
              <span className="font-display text-2xl md:text-3xl text-acid-yellow"> pet culture</span> &amp;
              <span className="font-display text-2xl md:text-3xl text-cream"> streetwear</span>.
              Nobody has united them. Until now.
            </p>
            <p className="font-display text-xl md:text-2xl text-ink">
              One audience. Urban. Affluent. Gen Z &amp; Millennial.
            </p>
          </div>

          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.08 }}
                className="bg-cream border-4 border-ink rounded-2xl p-4 chunk-shadow font-display text-lg md:text-xl text-ink flex gap-3"
              >
                <span className="text-magenta">✦</span>
                {b}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <motion.img src={catDancer} style={{ x: catX }} alt="" className="absolute bottom-0 right-4 md:right-20 w-48 md:w-72" />
    </section>
  );
};

export default Why;
