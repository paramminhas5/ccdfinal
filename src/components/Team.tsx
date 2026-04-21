import catDancer from "@/assets/cat-dancer.svg";
import catLeft from "@/assets/cat-left.svg";
import catRight from "@/assets/cat-right.svg";
import catDj from "@/assets/cat-dj-hero.svg";

const team = [
  { name: "Founder", role: "Vision & Direction", img: catDj, bg: "bg-magenta", text: "text-cream" },
  { name: "Music Director", role: "Sound & Curation", img: catDancer, bg: "bg-acid-yellow", text: "text-ink" },
  { name: "Brand & Design", role: "Look & Feel", img: catLeft, bg: "bg-lime", text: "text-ink" },
  { name: "Community Lead", role: "The Pack", img: catRight, bg: "bg-electric-blue", text: "text-cream" },
];

const Team = () => (
  <section id="team" className="relative bg-cream border-b-4 border-ink py-24 md:py-32 bg-grain overflow-hidden">
    <div className="container">
      <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ THE PACK</p>
      <h2 className="font-display text-ink text-5xl md:text-7xl leading-[0.9] mb-12">
        RUN BY HUMANS<br/>WHO MOVE.
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((m) => (
          <div
            key={m.name}
            className={`${m.bg} ${m.text} border-4 border-ink chunk-shadow hover:-translate-y-1 transition-transform`}
          >
            <div className="aspect-square bg-cream border-b-4 border-ink p-6 grid place-items-center">
              <img src={m.img} alt="" className="w-full h-full object-contain wiggle" />
            </div>
            <div className="p-5">
              <p className="font-display text-2xl leading-tight">{m.name.toUpperCase()}</p>
              <p className="font-medium opacity-90 mt-1">{m.role}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-ink/70 font-medium">
        Real names and faces coming soon. The pack grows — want in? <a href="mailto:hello@catscandance.com" className="underline decoration-magenta decoration-4 underline-offset-4">say hi</a>.
      </p>
    </div>
  </section>
);

export default Team;
