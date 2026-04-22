import { Link } from "react-router-dom";
import ccdLogo from "@/assets/ccd-logo.png";

const groups = [
  {
    title: "EXPLORE",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/events", label: "Events" },
      { to: "/shop", label: "Shop" },
      { to: "/pets", label: "Pets" },
      { to: "/blog", label: "Blog" },
      { to: "/media", label: "Media" },
    ],
  },
  {
    title: "PARTNERS",
    links: [
      { to: "/for-venues", label: "Venue Partners" },
      { to: "/for-artists", label: "For Artists" },
      { to: "/for-investors", label: "For Investors" },
      { to: "/press", label: "Press Kit" },
    ],
  },
];

const Footer = () => {
  return (
    <section className="relative bg-ink text-cream py-24 md:py-32 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-8 right-8 w-14 h-14 rounded-full bg-cream border-2 border-ink chunk-shadow grid place-items-center transition-transform duration-700 hover:rotate-[-360deg]"
      >
        <img src={ccdLogo} alt="" loading="lazy" className="w-9" />
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-16 left-8 w-12 h-12 rounded-full bg-cream border-2 border-ink chunk-shadow grid place-items-center transition-transform duration-700 hover:rotate-[-360deg]"
      >
        <img src={ccdLogo} alt="" loading="lazy" className="w-7" />
      </div>

      <div className="container">
        <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-6 text-center">/ JOIN THE PARTY</p>
        <h2 className="font-display text-5xl md:text-[8rem] leading-[0.9] text-cream text-center">
          WE'RE<br/>JUST<br/>
          <span className="text-magenta">GETTING</span><br/>
          <span className="text-acid-yellow ink-stroke">STARTED.</span>
        </h2>

        <a
          href="mailto:hello@catscandance.com"
          className="block w-fit mx-auto mt-10 bg-acid-yellow text-ink font-display text-2xl md:text-3xl px-10 py-5 border-4 border-cream rounded-full chunk-shadow-lg hover:-translate-y-1 transition-transform"
        >
          GET IN TOUCH →
        </a>

        <div className="mt-20 grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="font-display text-acid-yellow text-lg mb-3">{g.title}</p>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="font-medium text-cream/80 hover:text-acid-yellow transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="font-display text-acid-yellow text-lg mb-3">FOLLOW</p>
            <ul className="space-y-2">
              <li><a href="https://instagram.com/catscandance" target="_blank" rel="noopener noreferrer" className="font-medium text-cream/80 hover:text-acid-yellow transition-colors">Instagram</a></li>
              <li><a href="https://www.youtube.com/@catscandance" target="_blank" rel="noopener noreferrer" className="font-medium text-cream/80 hover:text-acid-yellow transition-colors">YouTube</a></li>
              <li><a href="/rss.xml" className="font-medium text-cream/80 hover:text-acid-yellow transition-colors">RSS</a></li>
              <li><a href="mailto:hello@catscandance.com" className="font-medium text-cream/80 hover:text-acid-yellow transition-colors">Email</a></li>
            </ul>
          </div>
        </div>

        <p className="mt-16 text-cream/70 text-sm font-display text-center tracking-wide">
          BANGALORE
        </p>
        <p className="mt-2 text-cream/50 text-sm font-medium text-center">© Cats Can Dance — so can you.</p>
      </div>
    </section>
  );
};

export default Footer;
