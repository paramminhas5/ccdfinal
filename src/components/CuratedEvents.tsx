import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type CuratedEvent = {
  id: string;
  title: string;
  venue: string | null;
  event_date: string | null;
  event_time: string | null;
  url: string;
  source: string;
  blurb: string | null;
  genre: string[];
  is_featured: boolean;
};

const sourceLabel = (s: string) => {
  switch (s) {
    case "skillboxes": return "Skillbox";
    case "district": return "District";
    case "insider": return "Insider";
    case "sortmyscene": return "SortMyScene";
    case "paytm-insider": return "Paytm Insider";
    case "manual": return "CCD Pick";
    default: return s;
  }
};

const formatDate = (d: string | null, t: string | null) => {
  if (!d) return t || "TBA";
  try {
    const date = new Date(d);
    const opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    return `${date.toLocaleDateString("en-IN", opts)}${t ? ` · ${t}` : ""}`;
  } catch {
    return d;
  }
};

const CuratedEvents = () => {
  const [events, setEvents] = useState<CuratedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("curated_events")
        .select("*")
        .or(`event_date.gte.${today},event_date.is.null`)
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: true, nullsFirst: false })
        .limit(12);
      setEvents((data ?? []) as CuratedEvent[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  if (!events.length) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="font-display text-magenta text-sm uppercase tracking-widest mb-1">/ THIS WEEK IN BLR</p>
          <h2 className="font-display text-4xl md:text-6xl text-ink">CURATED.</h2>
          <p className="text-ink/70 font-medium mt-2 max-w-2xl">
            Hand-picked dance & electronic events in Bangalore — by us, from the wider scene.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <a
            key={e.id}
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-cream border-4 border-ink chunk-shadow p-5 hover:-translate-y-1 hover:translate-x-1 transition-transform"
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-[10px] font-bold px-2 py-1 border-2 border-ink uppercase bg-acid-yellow text-ink">
                {sourceLabel(e.source)}
              </span>
              {e.is_featured && (
                <span className="text-[10px] font-bold px-2 py-1 border-2 border-ink uppercase bg-magenta text-cream">
                  Featured
                </span>
              )}
            </div>
            <h3 className="font-display text-xl md:text-2xl text-ink mb-2 leading-tight">
              {e.title.toUpperCase()}
            </h3>
            <p className="font-display text-base text-ink/80 mb-1">{formatDate(e.event_date, e.event_time)}</p>
            {e.venue && <p className="text-sm text-ink/70 font-medium mb-2">{e.venue}</p>}
            {e.blurb && <p className="text-sm text-ink/80 mb-3">{e.blurb}</p>}
            {e.genre?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {e.genre.slice(0, 3).map((g) => (
                  <span key={g} className="text-[10px] uppercase bg-ink text-cream px-2 py-0.5 font-bold">{g}</span>
                ))}
              </div>
            )}
            <span className="font-display text-magenta text-sm">RSVP →</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CuratedEvents;
