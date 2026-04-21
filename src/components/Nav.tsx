import { useEffect, useState } from "react";
import DiscoButton from "@/components/DiscoButton";

const links = [
  { href: "#why", label: "Why" },
  { href: "#what", label: "What" },
  { href: "#playlist", label: "Playlist" },
  { href: "#events", label: "Events" },
  { href: "#contact", label: "Contact" },
];

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "bg-cream/95 backdrop-blur border-b-4 border-ink" : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between py-4">
        <a href="#home" className="font-display text-2xl md:text-3xl text-ink leading-none">
          CATS<span className="text-magenta">.</span>CAN<span className="text-magenta">.</span>DANCE
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-display text-lg text-ink hover:text-magenta transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li><DiscoButton compact /></li>
          <li>
            <a
              href="#early-access"
              className="inline-block bg-ink text-cream font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
            >
              Early Access
            </a>
          </li>
        </ul>

        <div className="md:hidden flex items-center gap-2">
          <DiscoButton compact />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="w-11 h-11 grid place-items-center border-4 border-ink bg-cream chunk-shadow"
          >
            <span className="font-display text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-cream border-t-4 border-ink">
          <ul className="container py-4 flex flex-col gap-3">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block font-display text-2xl text-ink py-2"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Nav;