import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import RsvpDialog from "@/components/RsvpDialog";
import { supabase } from "@/integrations/supabase/client";
import episode1Poster from "@/assets/episode-1-poster.png";

const RECAP_MEDIA: Record<string, string> = {
  "episode-1": "/episodes/episode-01.gif",
};

const RECAP_FALLBACK: Record<string, string> = {
  "episode-1": episode1Poster,
};

const RecapMedia = ({ gifSrc, title, slug }: { gifSrc: string; title: string; slug: string }) => {
  const fallback = RECAP_FALLBACK[slug];
  // Autoplay the GIF immediately; silently fall back to static PNG on error.
  const [src, setSrc] = useState<string>(gifSrc);

  return (
    <div className="container pt-12">
      <h2 className="font-display text-3xl md:text-4xl text-ink mb-4">/ THE NIGHT, IN MOTION</h2>
      <img
        src={src}
        alt={`${title} recap`}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="w-full max-h-[600px] object-contain bg-ink border-4 border-ink chunk-shadow-lg"
        onError={() => {
          if (fallback && src !== fallback) setSrc(fallback);
        }}
      />
    </div>
  );
};


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

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: `Cats Can Dance — ${event.title}`,
    description: event.blurb,
    startDate: event.date,
    eventStatus:
      event.status === "upcoming"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventMovedOnline",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue,
        addressLocality: event.city || "Bangalore",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    image: event.poster_url ? [event.poster_url] : undefined,
    performer: (event.lineup ?? []).map((p) => ({ "@type": "PerformingGroup", name: p })),
    organizer: {
      "@type": "Organization",
      name: "Cats Can Dance",
      url: "https://catscandance.com",
    },
    offers: {
      "@type": "Offer",
      url: `https://catscandance.com/events/${slug}`,
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
    url: `https://catscandance.com/events/${slug}`,
  };

  return (
    <>
      <SEO
        title={`${event.title} — Cats Can Dance`}
        description={event.blurb}
        path={`/events/${slug}`}
        image={event.poster_url ?? undefined}
        type="event"
        jsonLd={eventLd}
      />
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <section className={`pt-32 pb-16 border-b-4 border-ink ${isUpcoming ? "bg-magenta text-cream" : "bg-cream text-ink"}`}>
          <div className="container">
            <Breadcrumbs
              light={isUpcoming}
              items={[
                { label: "Home", to: "/" },
                { label: "Events", to: "/events" },
                { label: event.title },
              ]}
            />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <span className={`inline-block text-xs font-bold px-3 py-1 border-2 border-ink uppercase mb-4 ${
                  isUpcoming ? "bg-acid-yellow text-ink" : "bg-ink text-cream"
                }`}>
                  {isUpcoming ? `${event.title.toUpperCase()} · UPCOMING` : "PAST EPISODE"}
                </span>
                <h1 className="font-display text-6xl md:text-7xl mb-6 leading-[0.9] drop-shadow-[6px_6px_0_hsl(var(--ink))]">
                  {event.title.toUpperCase()}
                </h1>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const url = `${window.location.origin}/events/${slug}`;
                  const shareData = { title: `Cats Can Dance — ${event.title}`, text: event.blurb || "Bangalore underground", url };
                  if (typeof navigator.share === "function") {
                    try { await navigator.share(shareData); return; } catch { /* user cancel */ }
                  }
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied to clipboard");
                  } catch {
                    toast.error("Couldn't copy link");
                  }
                }}
                className={`shrink-0 inline-flex items-center gap-2 font-display px-4 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform ${
                  isUpcoming ? "bg-acid-yellow text-ink" : "bg-ink text-cream"
                }`}
                aria-label="Share event"
              >
                ↗ SHARE
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
              <Field label="DATE" value={event.date} accent={isUpcoming} />
              <Field label="CITY" value={event.city} accent={isUpcoming} />
              <Field label="VENUE" value={event.venue} accent={isUpcoming} />
            </div>
          </div>
        </section>

        {event.poster_url && (() => {
          const raw = event.poster_url!.trim();
          let src = raw;
          if (!raw.startsWith("http") && !raw.startsWith("/")) {
            try {
              const { data } = supabase.storage.from("event-posters").getPublicUrl(raw);
              src = data?.publicUrl ?? `/${raw}`;
            } catch {
              src = `/${raw}`;
            }
          }
          return (
            <div className="container pt-12">
              <img
                src={src}
                alt={`${event.title} — Cats Can Dance dance music event in ${event.city || "Bangalore"}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full max-h-[600px] object-cover border-4 border-ink chunk-shadow-lg"
                onError={(ev) => {
                  const img = ev.currentTarget as HTMLImageElement;
                  if (import.meta.env.DEV) console.warn("[poster] failed", src);
                  img.style.display = "none";
                  const parent = img.parentElement;
                  if (parent && !parent.querySelector("[data-poster-fallback]")) {
                    const div = document.createElement("div");
                    div.setAttribute("data-poster-fallback", "");
                    div.className = "w-full aspect-video grid place-items-center bg-lime text-ink font-display text-4xl border-4 border-ink chunk-shadow-lg text-center px-6";
                    div.textContent = `★ ${event.title}`;
                    parent.appendChild(div);
                  }
                }}
              />
            </div>
          );
        })()}

        {event.status === "past" && RECAP_MEDIA[slug] && (
          <RecapMedia gifSrc={RECAP_MEDIA[slug]} title={event.title} slug={slug} />
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
