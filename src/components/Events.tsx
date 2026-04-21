import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RsvpDialog from "@/components/RsvpDialog";
import { supabase } from "@/integrations/supabase/client";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  blurb: string;
  lineup: string[];
  status: "upcoming" | "past";
  poster_url: string | null;
  sort_order: number;
};

const Events = () => {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("*").order("sort_order", { ascending: true });
      if (data) setEvents(data as unknown as EventRow[]);
    })();
  }, []);

  const featured = events.find((e) => e.status === "upcoming") ?? events[0];
  const past = events.filter((e) => e.status === "past");

  return (
    <section id="events" className="relative bg-lime py-20 md:py-20 border-b-4 border-ink overflow-hidden">
      <div className="container relative z-10">
        <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ EVENTS</p>
        <h2 className="font-display text-ink text-6xl md:text-8xl mb-12 leading-[0.85]">
          CATCH<br/>US LIVE
        </h2>

        {featured && (
          <motion.article
            initial={{ opacity: 0, y: 60, rotate: -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            className="bg-magenta text-cream border-4 border-ink chunk-shadow-lg p-8 md:p-12 mb-12"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-acid-yellow text-ink text-xs font-bold px-3 py-1 border-2 border-ink uppercase">
                {featured.title} · {featured.status.toUpperCase()}
              </span>
              {featured.status === "upcoming" && (
                <span className="bg-cream text-ink text-xs font-bold px-3 py-1 border-2 border-ink uppercase">RSVP</span>
              )}
            </div>
            <h3 className="font-display text-5xl md:text-7xl mb-4 leading-[0.9] drop-shadow-[6px_6px_0_hsl(var(--ink))]">
              CATS CAN DANCE<br/>{featured.title}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 my-8 max-w-3xl">
              <div>
                <p className="font-display text-acid-yellow text-sm mb-1">/ DATE</p>
                <p className="font-display text-2xl">{featured.date}</p>
              </div>
              <div>
                <p className="font-display text-acid-yellow text-sm mb-1">/ CITY</p>
                <p className="font-display text-2xl">{featured.city}</p>
              </div>
              <div>
                <p className="font-display text-acid-yellow text-sm mb-1">/ VENUE</p>
                <p className="font-display text-2xl">{featured.venue}</p>
              </div>
            </div>
            <p className="text-cream/90 text-base md:text-lg max-w-2xl mb-8 font-medium">{featured.blurb}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {featured.status === "upcoming" && (
                <button
                  onClick={() => setRsvpOpen(true)}
                  className="bg-acid-yellow text-ink font-display text-xl px-8 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
                >
                  RSVP NOW →
                </button>
              )}
              <Link
                to={`/events/${featured.slug}`}
                className="bg-cream text-ink font-display text-xl px-8 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform text-center"
              >
                VIEW DETAILS
              </Link>
            </div>
          </motion.article>
        )}

        {past.length > 0 && (
          <div>
            <p className="font-display text-ink text-xl mb-4">/ PAST EPISODES</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {past.map((e) => (
                <Link
                  key={e.slug}
                  to={`/events/${e.slug}`}
                  className="bg-cream border-4 border-ink chunk-shadow overflow-hidden hover:-translate-y-1 hover:translate-x-1 transition-transform block"
                >
                  <div className="aspect-video bg-ink border-b-4 border-ink overflow-hidden">
                    {e.poster_url && (
                      <img src={e.poster_url} alt={`${e.title} poster`} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="bg-ink text-cream text-xs font-bold px-2 py-1 inline-block mb-2">{e.title}</span>
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
        )}
      </div>

      {featured && (
        <RsvpDialog
          open={rsvpOpen}
          onOpenChange={setRsvpOpen}
          eventSlug={featured.slug}
          eventTitle={`Cats Can Dance ${featured.title}`}
        />
      )}
    </section>
  );
};

export default Events;
