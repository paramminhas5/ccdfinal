import { motion } from "framer-motion";
import { ReactNode } from "react";

const SectionReveal = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ type: "spring", stiffness: 200, damping: 18 }}
    className={className}
  >
    {children}
  </motion.div>
);

export default SectionReveal;