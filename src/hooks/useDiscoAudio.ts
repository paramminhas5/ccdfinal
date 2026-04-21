import { useEffect, useRef, useState } from "react";
import { useDisco } from "@/contexts/DiscoContext";

const AUDIO_SRC = "/audio/disco-loop.mp3";
const FADE_MS = 600;
const TARGET_VOL = 0.5;

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const useDiscoAudio = () => {
  const { disco } = useDisco();
  const [muted, setMuted] = useState(false);
  const [available, setAvailable] = useState(true);
  const [primed, setPrimed] = useState(false);
  const ref = useRef<HTMLAudioElement | null>(null);

  // create the element once
  useEffect(() => {
    const a = new Audio(AUDIO_SRC);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0;
    a.addEventListener("error", () => setAvailable(false));
    ref.current = a;
    return () => {
      a.pause();
      ref.current = null;
    };
  }, []);

  // one-time gesture unlock so iOS/Safari/Chrome will let us play later
  useEffect(() => {
    if (primed) return;
    const unlock = () => {
      const el = ref.current;
      if (!el) return;
      el.volume = 0;
      el.play().then(() => {
        el.pause();
        el.currentTime = 0;
        setPrimed(true);
      }).catch(() => setPrimed(true));
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [primed]);

  // fade helper
  const fadeTo = (target: number) => {
    const el = ref.current;
    if (!el) return;
    const start = el.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / FADE_MS);
      el.volume = clamp(start + (target - start) * k);
      if (k < 1) requestAnimationFrame(step);
      else if (target === 0) el.pause();
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !available) return;
    if (disco && !muted) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      el.play().then(() => fadeTo(TARGET_VOL)).catch(() => {/* autoplay blocked */});
    } else {
      fadeTo(0);
    }
  }, [disco, muted, available]);

  return { muted, setMuted, available };
};
