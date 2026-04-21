import { motion } from "framer-motion";

const colors = ["hsl(var(--magenta))", "hsl(var(--lime))", "hsl(var(--electric-blue))", "hsl(var(--acid-yellow))", "hsl(var(--orange))", "hsl(var(--hot-pink))"];

const Lasers = () => (
  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden mix-blend-screen" aria-hidden>
    {colors.map((c, i) => (
      <motion.div
        key={i}
        animate={{ rotate: i % 2 === 0 ? [0, 60, -60, 0] : [0, -60, 60, 0] }}
        transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: "easeInOut" }}
        style={{
          left: `${10 + i * 15}%`,
          top: "0%",
          background: `linear-gradient(to bottom, ${c}, transparent)`,
          width: "4px",
          height: "120vh",
          transformOrigin: "top center",
          opacity: 0.7,
          boxShadow: `0 0 20px ${c}`,
        }}
        className="absolute"
      />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={`spot-${i}`}
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
        style={{
          left: `${(i * 13) % 90}%`,
          top: `${(i * 17) % 80}%`,
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${colors[i % colors.length]}, transparent 70%)`,
        }}
        className="absolute rounded-full"
      />
    ))}
  </div>
);

export default Lasers;