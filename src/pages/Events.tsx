import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import CuratedEvents from "@/components/CuratedEvents";
import { supabase } from "@/integrations/supabase/client";

type EventRow = {
  slug: string; title: string; city: string; venue: string; date: string; status: string;
};

const Events = () => {
  const [all, setAll] = useState<EventRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("slug,title,city,venue,date,status").order("sort_order", { ascending: true });
      if (data) setAll(data as EventRow[]);
    })();
  }, []);

  const upcoming = all.filter((e) => e.status === "upcoming");

  const eventLd = all.map((e) => ({
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: `Cats Can Dance — ${e.title}`,
    startDate: e.date,
    eventStatus:
      e.status === "upcoming"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventMovedOnline",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: e.venue,
        addressLocality: e.city || "Bangalore",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Cats Can Dance",
      url: "https://catscandance.com",
    },
    offers: {
      "@type": "Offer",
      url: `https://catscandance.com/events/${e.slug}`,
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    },
    url: `https://catscandance.com/events/${e.slug}`,
  }));

  const itemListLd = upcoming.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Upcoming Cats Can Dance events in Bangalore",
        itemListElement: upcoming.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://catscandance.com/events/${e.slug}`,
          name: `${e.title} — ${e.city}`,
        })),
      }
    : null;

  const jsonLd = itemListLd ? [...eventLd, itemListLd] : eventLd;

  return (
    <>
      <SEO
        title="Parties & Curated Dance Events in Bangalore | Cats Can Dance"
        description="Our nights plus a hand-picked feed of the best dance music events in Bangalore this week."
        path="/events"
        jsonLd={jsonLd}
      />
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <PageHero
          eyebrow="EVENTS"
          title="EVERY EDITION."
          bg="bg-lime"
          textColor="text-ink"
          eyebrowColor="text-magenta"
          shadow={false}
        >
          <p className="text-ink/80 font-medium text-lg max-w-2xl">
            The cult underground series. Every drop, every floor, every city.
          </p>
        </PageHero>
        <section className="container py-16 md:py-20">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Events" }]} />
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
        <CuratedEvents />
        <Footer />
      </main>
    </>
  );
};

export default Events;
