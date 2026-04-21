import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import RsvpDialog from "@/components/RsvpDialog";
import { supabase } from "@/integrations/supabase/client";

type EventRow = {
  slug: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  blurb: string;
  lineup: string[];
  status: "upcoming" | "past";
  poster_url: string | null;
};

const EventDetail = () => {
  const { slug = "" } = useParams();
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
      setEvent((data as unknown as EventRow) ?? null);
      setLoaded(true);
    })();
  }, [slug]);

  if (loaded && !event) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <section className="container pt-32 pb-16">
          <h1 className="font-display text-5xl text-ink mb-4">Event not found</h1>
          <Link to="/events" className="font-display text-magenta underline">← All events</Link>
        </section>
        <Footer />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <section className="container pt-32 pb-16" />
      </main>
    );
  }

  const isUpcoming = event.status === "upcoming";

  return (
    <>
      <SEO
        title={`${event.title} — Cats Can Dance`}
        description={event.blurb}
        path={`/events/${slug}`}
      />
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <section className={`pt-32 pb-16 border-b-4 border-ink ${isUpcoming ? "bg-magenta text-cream" : "bg-cream text-ink"}`}>
          <div className="container">
            <Link to="/events" className="font-display underline decoration-4 underline-offset-4 mb-6 inline-block">
              ← All events
            </Link>
            <span className={`inline-block text-xs font-bold px-3 py-1 border-2 border-ink uppercase mb-4 ${
              isUpcoming ? "bg-acid-yellow text-ink" : "bg-ink text-cream"
            }`}>
              {isUpcoming ? `${event.title.toUpperCase()} · UPCOMING` : "PAST EPISODE"}
            </span>
            <h1 className="font-display text-6xl md:text-7xl mb-6 leading-[0.9] drop-shadow-[6px_6px_0_hsl(var(--ink))]">
              {event.title.toUpperCase()}
            </h1>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
              <Field label="DATE" value={event.date} accent={isUpcoming} />
              <Field label="CITY" value={event.city} accent={isUpcoming} />
              <Field label="VENUE" value={event.venue} accent={isUpcoming} />
            </div>
          </div>
        </section>

        {event.poster_url && (
          <div className="container pt-12">
            <img
              src={event.poster_url}
              alt={`${event.title} — ${event.city}`}
              className="w-full max-h-[600px] object-cover border-4 border-ink chunk-shadow-lg"
            />
          </div>
        )}

        <section className="container py-16 md:py-20 grid md:grid-cols-2 gap-10 max-w-5xl">
          <div>
            <h2 className="font-display text-3xl text-ink mb-4">/ THE NIGHT</h2>
            <p className="text-ink/80 font-medium text-lg">{event.blurb}</p>
          </div>
          <div>
            <h2 className="font-display text-3xl text-ink mb-4">/ LINEUP</h2>
            <ul className="space-y-2">
              {(event.lineup ?? []).map((l) => (
                <li key={l} className="bg-cream border-4 border-ink px-4 py-3 font-medium">{l}</li>
              ))}
            </ul>
            {isUpcoming && (
              <button
                onClick={() => setOpen(true)}
                className="mt-6 w-full bg-magenta text-cream font-display text-xl px-6 py-4 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
              >
                RSVP NOW →
              </button>
            )}
          </div>
        </section>

        <Footer />
      </main>
      <RsvpDialog open={open} onOpenChange={setOpen} eventSlug={slug} eventTitle={`Cats Can Dance ${event.title}`} />
    </>
  );
};

const Field = ({ label, value, accent }: { label: string; value: string; accent: boolean }) => (
  <div>
    <p className={`font-display text-sm mb-1 ${accent ? "text-acid-yellow" : "text-magenta"}`}>/ {label}</p>
    <p className="font-display text-2xl">{value}</p>
  </div>
);

export default EventDetail;
