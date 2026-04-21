import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Marquee from "@/components/Marquee";
import SEO from "@/components/SEO";

const bullets = [
  "Dedicated, higher-value crowd",
  "Better spend per head",
  "Longer late-night retention",
  "Stronger repeat footfall",
  "Premium content for venue marketing",
  "Distinct identity in a crowded market",
];

const ForVenues = () => (
  <main className="bg-background text-foreground">
    <SEO
      title="For Venues — Cats Can Dance | Bangalore, India"
      description="Host Cats Can Dance at your Bangalore venue. A higher-value crowd, premium content and repeat footfall from India's underground dance music community."
      path="/for-venues"
    />
    <Nav />
    <PageHero
      eyebrow="FOR VENUES"
      title={<>TURN YOUR<br/>SPACE INTO A<br/>DESTINATION.</>}
      bg="bg-lime"
      textColor="text-ink"
      eyebrowColor="text-magenta"
      shadow={false}
    />
    <Marquee bg="bg-acid-yellow" />
    <section className="bg-cream border-b-4 border-ink py-24 md:py-32 bg-grain">
      <div className="container grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-4xl md:text-6xl text-ink leading-[0.95] mb-6">
            PEOPLE PLAN<br/>THEIR WEEKEND<br/>AROUND US.
          </h2>
          <p className="text-ink/80 text-lg md:text-xl font-medium mb-6">
            We bring a curated, high-spend crowd that converts your room into a recurring cultural moment — not a one-off booking.
          </p>
          <a
            href="mailto:venues@catscandance.com"
            className="inline-block bg-magenta text-cream font-display text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
          >
            PARTNER WITH US →
          </a>
        </div>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={b} className="bg-lime border-4 border-ink chunk-shadow p-4 font-display text-lg md:text-xl text-ink flex gap-3">
              <span className="text-magenta">0{i + 1}</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
    <Footer />
  </main>
);

export default ForVenues;
