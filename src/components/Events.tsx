import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import RsvpDialog from "@/components/RsvpDialog";
import episode1Poster from "@/assets/episode-1-poster.gif";

const pastEpisodes = [
  { slug: "episode-1", date: "TBA", city: "BANGALORE", venue: "TBA", tag: "EPISODE 01", poster: episode1Poster },
];

const Events = () => {
  const [rsvpOpen, setRsvpOpen] = useState(false);

  return (
    <section id="events" className="relative bg-lime py-24 md:py-32 border-b-4 border-ink overflow-hidden">
      <div className="container relative z-10">
        <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ EVENTS</p>
        <h2 className="font-display text-ink text-6xl md:text-9xl mb-12 leading-[0.85]">
          CATCH<br/>US LIVE
        </h2>

        {/* Episode 2 — hero card */}
        <motion.article
          initial={{ opacity: 0, y: 60, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="bg-magenta text-cream border-4 border-ink chunk-shadow-lg p-8 md:p-12 mb-12"
        >
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-acid-yellow text-ink text-xs font-bold px-3 py-1 border-2 border-ink uppercase">
              EPISODE 02 · UPCOMING
            </span>
            <span className="bg-cream text-ink text-xs font-bold px-3 py-1 border-2 border-ink uppercase">
              RSVP
            </span>
          </div>
          <h3 className="font-display text-5xl md:text-7xl lg:text-8xl mb-4 leading-[0.9] drop-shadow-[6px_6px_0_hsl(var(--ink))]">
            CATS CAN DANCE<br/>EPISODE 02
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 my-8 max-w-3xl">
            <div>
              <p className="font-display text-acid-yellow text-sm mb-1">/ DATE</p>
              <p className="font-display text-2xl">TBA</p>
            </div>
            <div>
              <p className="font-display text-acid-yellow text-sm mb-1">/ CITY</p>
              <p className="font-display text-2xl">BANGALORE</p>
            </div>
            <div>
              <p className="font-display text-acid-yellow text-sm mb-1">/ VENUE</p>
              <p className="font-display text-2xl">TBA</p>
            </div>
          </div>
          <p className="text-cream/90 text-base md:text-lg max-w-2xl mb-8 font-medium">
            Round two of the cult underground series. Expect heavy low-end, surprise b2b sets,
            and the kind of crowd that actually shows up. RSVP locks your spot — capacity is tight.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setRsvpOpen(true)}
              className="bg-acid-yellow text-ink font-display text-xl px-8 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
            >
              RSVP NOW →
            </button>
            <Link
              to="/events/episode-2"
              className="bg-cream text-ink font-display text-xl px-8 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform text-center"
            >
              VIEW DETAILS
            </Link>
          </div>
        </motion.article>

        {/* Past episodes strip */}
        <div>
          <p className="font-display text-ink text-xl mb-4">/ PAST EPISODES</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEpisodes.map((e) => (
              <Link
                key={e.slug}
                to={`/events/${e.slug}`}
                className="bg-cream border-4 border-ink chunk-shadow overflow-hidden hover:-translate-y-1 hover:translate-x-1 transition-transform block"
              >
                <div className="aspect-video bg-ink border-b-4 border-ink overflow-hidden">
                  <img src={e.poster} alt={`${e.tag} poster`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-5">
                  <span className="bg-ink text-cream text-xs font-bold px-2 py-1 inline-block mb-2">{e.tag}</span>
                  <p className="font-display text-2xl text-magenta">{e.city}</p>
                  <p className="text-ink/70 font-medium text-sm">{e.venue} · {e.date}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/events"
            className="inline-block mt-6 font-display text-ink text-lg underline decoration-4 decoration-magenta underline-offset-4 hover:text-magenta transition"
          >
            See all events →
          </Link>
        </div>
      </div>

      <RsvpDialog
        open={rsvpOpen}
        onOpenChange={setRsvpOpen}
        eventSlug="episode-2"
        eventTitle="Cats Can Dance Episode 02"
      />
    </section>
  );
};

export default Events;
