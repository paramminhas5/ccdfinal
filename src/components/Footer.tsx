import { Link } from "react-router-dom";
import star from "@/assets/star.png";

const groups = [
  {
    title: "EXPLORE",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/shop", label: "Shop" },
      { to: "/#playlist", label: "Playlist" },
      { to: "/#events", label: "Events" },
      { to: "/#drops", label: "Drops" },
    ],
  },
  {
    title: "PARTNERS",
    links: [
      { to: "/for-venues", label: "For Venues" },
      { to: "/for-artists", label: "For Artists" },
      { to: "/for-investors", label: "For Investors" },
    ],
  },
];

const Footer = () => {
  return (
    <section className="relative bg-ink text-cream py-24 md:py-32 overflow-hidden">
      <img src={star} alt="" className="absolute top-10 right-10 w-16 spin-slow" />
      <img src={star} alt="" className="absolute bottom-20 left-10 w-12 spin-slow" />

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
              <li><a href="mailto:hello@catscandance.com" className="font-medium text-cream/80 hover:text-acid-yellow transition-colors">Email</a></li>
            </ul>
          </div>
        </div>

        <p className="mt-16 text-cream/50 text-sm font-medium text-center">© Cats Can Dance — so can you.</p>
      </div>
    </section>
  );
};

export default Footer;
