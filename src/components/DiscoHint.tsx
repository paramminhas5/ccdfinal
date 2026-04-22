import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const KEY = "ccd:disco-hint-seen";

const DiscoHint = () => {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setShow(true), 1500);
    const hide = setTimeout(() => {
      setShow(false);
      localStorage.setItem(KEY, "1");
    }, 9500);
    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(KEY, "1"); } catch {}
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={dismiss}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -4, 0], scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={reduce ? { duration: 0.2 } : { y: { repeat: Infinity, duration: 1.4 }, default: { type: "spring", stiffness: 200, damping: 14 } }}
          className="absolute top-full right-2 sm:right-6 mt-2 z-[60] bg-magenta text-cream font-display text-xs sm:text-sm px-3 py-2 border-4 border-ink chunk-shadow whitespace-nowrap"
          aria-label="Dismiss disco hint"
        >
          <span className="absolute -top-2 right-6 w-3 h-3 bg-magenta border-l-4 border-t-4 border-ink rotate-45" />
          PRESS ME ✨
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default DiscoHint;
