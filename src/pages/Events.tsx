import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

const all = [
  { slug: "episode-2", title: "Episode 02", city: "Brooklyn", venue: "TBA", date: "TBA", status: "upcoming" },
  { slug: "episode-1", title: "Episode 01", city: "Brooklyn", venue: "House of Yes", date: "Mar 22", status: "past" },
];

const Events = () => (
  <>
    <SEO
      title="Events — Cats Can Dance"
      description="All Cats Can Dance editions, past and upcoming. RSVP for Episode 02."
      path="/events"
    />
    <main className="bg-background text-foreground min-h-screen">
      <Nav />
      <PageHero
        eyebrow="/ EVENTS"
        title="EVERY EDITION."
        subtitle="The cult underground series. Every drop, every floor, every city."
        bg="bg-lime"
      />
      <section className="container py-16 md:py-24">
        <div className="grid gap-6 max-w-4xl">
          {all.map((e) => (
            <Link
              key={e.slug}
              to={`/events/${e.slug}`}
              className={`block border-4 border-ink chunk-shadow p-6 md:p-8 hover:-translate-y-1 hover:translate-x-1 transition-transform ${
                e.status === "upcoming" ? "bg-magenta text-cream" : "bg-cream text-ink"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-3 py-1 border-2 border-ink uppercase ${
                  e.status === "upcoming" ? "bg-acid-yellow text-ink" : "bg-ink text-cream"
                }`}>
                  {e.status === "upcoming" ? "UPCOMING · RSVP" : "PAST"}
                </span>
                <span className="font-display text-lg">{e.date}</span>
              </div>
              <h2 className="font-display text-4xl md:text-6xl mb-2">{e.title.toUpperCase()}</h2>
              <p className="font-medium opacity-90">{e.city} · {e.venue}</p>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  </>
);

export default Events;
