import { Link } from "react-router-dom";
import catDancer from "@/assets/cat-dancer.svg";

const About = () => (
  <section id="about" className="relative bg-cream border-b-4 border-ink py-20 md:py-20 bg-grain overflow-hidden">
    <div className="container grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ THE BRAND</p>
        <h2 className="font-display text-5xl md:text-6xl text-ink leading-[0.9] mb-6">
          A CULTURE FOR<br/>PEOPLE WHO MOVE.
        </h2>
        <p className="text-ink/80 text-lg md:text-xl font-medium mb-6 max-w-xl">
          Cats Can Dance is dance music, pet culture and streetwear in one club.
          Drops, parties, playlists and a community that shows up.
        </p>
        <Link
          to="/about"
          className="inline-block bg-ink text-cream font-display text-lg px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
        >
          READ THE STORY →
        </Link>
      </div>
      <img src={catDancer} alt="" className="w-full max-w-sm mx-auto wiggle" />
    </div>
  </section>
);

export default About;
