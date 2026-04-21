import { useEffect, useRef } from "react";

const PawCursor = () => {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.current.x - 14}px, ${pos.current.y - 14}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-[100] hidden md:block"
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="hsl(var(--magenta))">
        <circle cx="16" cy="20" r="7" stroke="hsl(var(--ink))" strokeWidth="2"/>
        <circle cx="7" cy="13" r="3" stroke="hsl(var(--ink))" strokeWidth="2"/>
        <circle cx="25" cy="13" r="3" stroke="hsl(var(--ink))" strokeWidth="2"/>
        <circle cx="11" cy="6" r="2.5" stroke="hsl(var(--ink))" strokeWidth="2"/>
        <circle cx="21" cy="6" r="2.5" stroke="hsl(var(--ink))" strokeWidth="2"/>
      </svg>
    </div>
  );
};

export default PawCursor;