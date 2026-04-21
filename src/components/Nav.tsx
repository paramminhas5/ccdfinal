import { useEffect, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import DiscoButton from "@/components/DiscoButton";
import DiscoMute from "@/components/DiscoMute";
import { CartDrawer } from "@/components/CartDrawer";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/for-venues", label: "For Venues" },
  { to: "/for-artists", label: "For Artists" },
  { to: "/for-investors", label: "For Investors" },
];

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "bg-cream/95 backdrop-blur border-b-4 border-ink" : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between py-4 gap-4">
        <Link to="/" className="font-display text-xl md:text-2xl text-ink leading-none shrink-0">
          CATS<span className="text-magenta">.</span>CAN<span className="text-magenta">.</span>DANCE
        </Link>

        <ul className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.to}>
              <RouterNavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `font-display text-base text-ink hover:text-magenta transition-colors ${
                    isActive ? "text-magenta" : ""
                  }`
                }
              >
                {l.label}
              </RouterNavLink>
            </li>
          ))}
          <li><DiscoMute /></li>
          <li><DiscoButton compact /></li>
          <li><CartDrawer /></li>
          <li>
            <Link
              to="/#early-access"
              className="inline-block bg-ink text-cream font-display px-4 py-2 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform text-sm"
            >
              Early Access
            </Link>
          </li>
        </ul>

        <div className="lg:hidden flex items-center gap-2">
          <DiscoMute />
          <DiscoButton compact />
          <CartDrawer />
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
        <div className="lg:hidden bg-cream border-t-4 border-ink">
          <ul className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <RouterNavLink
                  to={l.to}
                  end={l.to === "/"}
                  className="block font-display text-2xl text-ink py-2"
                >
                  {l.label}
                </RouterNavLink>
              </li>
            ))}
            <li>
              <Link to="/#early-access" className="block font-display text-2xl text-magenta py-2">
                Early Access →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Nav;
