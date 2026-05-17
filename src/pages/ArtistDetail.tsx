import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type Artist = {
  id: string;
  slug: string;
  name: string;
  members: string | null;
  from_city: string | null;
  based_city: string | null;
  genres: string[];
  festivals: string[];
  bio: string | null;
  why: string | null;
  instagram: string | null;
  website: string | null;
  booking_email: string | null;
  manager_email: string | null;
  labels: string | null;
  photo_url: string | null;
  fee_min_inr: number | null;
  fee_max_inr: number | null;
  fee_currency: string;
  gallery: { url: string; caption?: string }[];
  videos: { youtube_id: string; title?: string }[];
};

const ensureUrl = (s: string | null) => (s ? (/^https?:\/\//i.test(s) ? s : `https://${s}`) : null);

const formatFee = (a: Artist) => {
  if (!a.fee_min_inr && !a.fee_max_inr) return null;
  const cur = a.fee_currency || "INR";
  const sym = cur === "INR" ? "₹" : cur === "USD" ? "$" : cur === "GBP" ? "£" : `${cur} `;
  const fmt = (n: number) => {
    if (cur === "INR") {
      if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L`;
      return new Intl.NumberFormat("en-IN").format(n);
    }
    return new Intl.NumberFormat("en-US").format(n);
  };
  if (a.fee_min_inr && a.fee_max_inr) return `${sym}${fmt(a.fee_min_inr)} – ${sym}${fmt(a.fee_max_inr)}`;
  return `${sym}${fmt(a.fee_min_inr ?? a.fee_max_inr!)}`;
};

const PlaceholderArt = ({ name }: { name: string }) => {
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-full aspect-[16/9] bg-ink text-cream flex items-center justify-center border-b-4 border-ink">
      <span className="font-display text-[18vw] md:text-[12rem] leading-none tracking-tighter">{initials}</span>
    </div>
  );
};

const ArtistDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [a, setA] = useState<Artist | null>(null);
  const [related, setRelated] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", slug)
        .eq("status", "approved")
        .maybeSingle();
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setA(data as Artist);
      const city = (data as Artist).based_city || (data as Artist).from_city;
      const { data: rel } = await supabase
        .from("artists")
        .select("*")
        .eq("status", "approved")
        .neq("slug", slug)
        .limit(3);
      setRelated((rel ?? []) as Artist[]);
      setLoading(false);
      void city;
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-cream"><Nav /><div className="container py-32 text-center font-display text-2xl text-ink">Loading…</div></div>;
  if (notFound || !a) return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <div className="container py-32 text-center">
        <p className="font-display text-3xl text-ink mb-4">Artist not found.</p>
        <Link to="/artists" className="font-display underline text-magenta">Back to artists</Link>
      </div>
    </div>
  );

  const city = a.based_city || a.from_city || "";
  const fee = formatFee(a);
  const igUrl = a.instagram && /^[a-z0-9._]+$/i.test(a.instagram) ? `https://instagram.com/${a.instagram}` : null;
  const webUrl = ensureUrl(a.website);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: a.name,
    genre: a.genres.join(", "),
    image: a.photo_url ?? undefined,
    description: a.bio ?? undefined,
    url: `https://catscan.dance/artists/${a.slug}`,
    sameAs: [igUrl, webUrl].filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-cream">
      <SEO
        title={`${a.name} — ${a.genres[0] ?? "Electronic"} · ${city || "India"} | Cats Can Dance`}
        description={a.why || a.bio?.slice(0, 155) || `Book ${a.name} via Cats Can Dance.`}
        path={`/artists/${a.slug}`}
        jsonLd={jsonLd}
      />
      <Nav />

      <header className="pt-20">
        {a.photo_url ? (
          <img src={a.photo_url} alt={a.name} className="w-full aspect-[16/9] object-cover border-b-4 border-ink" />
        ) : (
          <PlaceholderArt name={a.name} />
        )}
        <div className="container py-6 border-b-4 border-ink">
          <Link to="/artists" className="font-display text-xs uppercase text-ink/60 hover:text-magenta">← All artists</Link>
          <h1 className="font-display text-5xl md:text-7xl uppercase text-ink leading-none mt-2">{a.name}</h1>
          {a.members && <p className="text-base text-ink/60 mt-2">{a.members}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {city && (
              <span className="text-xs font-display uppercase bg-ink text-cream px-2 py-1 border-2 border-ink">{city}</span>
            )}
            {a.genres.map((g) => (
              <span key={g} className="text-xs font-display uppercase bg-acid-yellow text-ink px-2 py-1 border-2 border-ink">{g}</span>
            ))}
          </div>
        </div>
      </header>

      <section className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {a.bio && (
            <div>
              <h2 className="font-display text-2xl uppercase text-ink mb-3">Bio</h2>
              <p className="text-ink/90 leading-relaxed whitespace-pre-line">{a.bio}</p>
            </div>
          )}
          {a.why && (
            <div className="bg-acid-yellow border-4 border-ink p-5">
              <h3 className="font-display text-sm uppercase text-ink/70 mb-2">Why they matter</h3>
              <p className="text-ink font-medium">{a.why}</p>
            </div>
          )}
          {a.festivals.length > 0 && (
            <div>
              <h2 className="font-display text-2xl uppercase text-ink mb-3">Festivals</h2>
              <div className="flex flex-wrap gap-2">
                {a.festivals.map((f) => (
                  <span key={f} className="text-sm font-display bg-cream border-4 border-ink px-3 py-1.5">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {fee && (
            <div className="bg-magenta text-cream border-4 border-ink chunk-shadow p-5">
              <p className="font-display text-xs uppercase opacity-80">Est. fee</p>
              <p className="font-display text-3xl mt-1">{fee}</p>
              <p className="text-xs opacity-80 mt-1">Indicative — final quote per booking</p>
            </div>
          )}
          <div className="bg-cream border-4 border-ink chunk-shadow p-5 space-y-3">
            <h3 className="font-display text-lg uppercase text-ink">Book / Contact</h3>
            {a.booking_email && (
              <a href={`mailto:${a.booking_email}`} className="block font-display text-sm text-ink underline break-all">
                ✉ {a.booking_email}
              </a>
            )}
            {a.manager_email && a.manager_email !== a.booking_email && (
              <a href={`mailto:${a.manager_email}`} className="block font-display text-sm text-ink/80 underline break-all">
                Manager: {a.manager_email}
              </a>
            )}
            {a.labels && <p className="text-sm text-ink/80"><span className="font-display">Label:</span> {a.labels}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              {igUrl && <a href={igUrl} target="_blank" rel="noreferrer" className="text-xs font-display bg-ink text-cream px-3 py-2 border-2 border-ink">Instagram</a>}
              {webUrl && <a href={webUrl} target="_blank" rel="noreferrer" className="text-xs font-display bg-cream text-ink px-3 py-2 border-2 border-ink">Website ↗</a>}
            </div>
            <Link to="/for-venues#contact" className="block text-center bg-acid-yellow text-ink font-display px-4 py-3 border-4 border-ink chunk-shadow mt-3 text-sm">
              Book via Cats Can Dance →
            </Link>
          </div>
        </aside>
      </section>

      {a.videos.length > 0 && (
        <section className="container pb-10">
          <h2 className="font-display text-3xl uppercase text-ink mb-4">Watch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {a.videos.map((v) => (
              <div key={v.youtube_id} className="border-4 border-ink chunk-shadow bg-ink">
                <div className="aspect-video">
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${v.youtube_id}`} title={v.title ?? a.name} allowFullScreen />
                </div>
                {v.title && <p className="p-2 font-display text-sm text-cream">{v.title}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {a.gallery.length > 0 && (
        <section className="container pb-10">
          <h2 className="font-display text-3xl uppercase text-ink mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {a.gallery.map((g, i) => (
              <figure key={i} className="border-4 border-ink chunk-shadow overflow-hidden">
                <img src={g.url} alt={g.caption ?? a.name} className="w-full h-full object-cover" />
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container pb-16">
          <h2 className="font-display text-3xl uppercase text-ink mb-4">More artists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} to={`/artists/${r.slug}`}
                    className="block bg-cream border-4 border-ink chunk-shadow p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">
                <p className="font-display text-xl text-ink uppercase">{r.name}</p>
                <p className="text-xs text-ink/60 mt-1">{r.based_city || r.from_city || ""}</p>
                <p className="text-xs text-ink/70 mt-2">{r.genres.slice(0, 3).join(" · ")}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ArtistDetail;
