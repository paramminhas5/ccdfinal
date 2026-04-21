import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import boombox from "@/assets/boombox.png";

const events = [
  { date: "MAY 18", city: "BERLIN", venue: "Kater Blau", tag: "Launch Party" },
  { date: "JUN 02", city: "LONDON", venue: "Printworks", tag: "Pop-Up" },
  { date: "JUN 21", city: "NYC", venue: "House of Yes", tag: "Showcase" },
  { date: "JUL 09", city: "PARIS", venue: "La Bellevilloise", tag: "Block Party" },
];

const Events = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const boomX = useTransform(scrollYProgress, [0, 1], ["-10%", "110vw"]);
  const boomRot = useTransform(scrollYProgress, [0, 1], [-10, 30]);
  return (
  <section ref={ref} id="events" className="relative bg-lime py-24 md:py-32 border-b-4 border-ink overflow-hidden">
    <motion.img
      src={boombox}
      alt=""
      style={{ x: boomX, rotate: boomRot }}
      className="absolute bottom-4 left-0 w-40 md:w-56 z-0"
    />
    <div className="container relative z-10">
      <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ OUR EVENTS</p>
      <h2 className="font-display text-ink text-6xl md:text-9xl mb-12">
        CATCH<br/>US LIVE
      </h2>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl ml-auto">
        {events.map((e, i) => (
          <motion.div
            key={e.date}
            initial={{ opacity: 0, y: 60, rotate: -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 180, damping: 16, delay: i * 0.1 }}
            className="bg-cream border-4 border-ink chunk-shadow p-6 md:p-8 hover:-translate-y-2 hover:translate-x-1 transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="font-display text-3xl md:text-4xl text-ink">{e.date}</span>
              <span className="bg-electric-blue text-ink text-xs font-bold px-3 py-1 border-2 border-ink uppercase">{e.tag}</span>
            </div>
            <p className="font-display text-4xl md:text-5xl text-magenta leading-none mb-2">{e.city}</p>
            <p className="text-ink/70 font-medium mb-6">{e.venue}</p>
            <button className="w-full bg-ink text-cream font-display text-lg py-3 hover:bg-magenta transition-colors">
              GET TICKETS →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default Events;
