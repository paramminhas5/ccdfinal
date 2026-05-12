import { useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ARTISTS, ARTIST_TIERS, ARTIST_GENRES, ARTIST_CITIES, type Artist } from "@/content/artists";

const ensureUrl = (s: string | null) => (s ? (/^https?:\/\//i.test(s) ? s : `https://${s}`) : null);

const ArtistCard = ({ a, onOpen }: { a: Artist; onOpen: () => void }) => (
  <button
    onClick={onOpen}
    className="text-left bg-cream border-4 border-ink chunk-shadow p-5 flex flex-col gap-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
  >
    <header className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-xl text-ink leading-tight uppercase">{a.name}</h3>
        {a.members && <p className="text-xs text-ink/60 mt-0.5">{a.members}</p>}
        <p className="text-xs text-ink/60 mt-1">
          {a.based || a.from}
          {a.from && a.based && a.from !== a.based ? ` · from ${a.from}` : ""}
        </p>
      </div>
      <span className="shrink-0 text-[10px] font-display bg-ink text-cream px-2 py-1 border-2 border-ink">
        #{a.rank}
      </span>
    </header>
    <div className="flex flex-wrap gap-1.5">
      {a.genres.slice(0, 3).map((g) => (
        <span key={g} className="text-[10px] font-display uppercase bg-acid-yellow text-ink px-2 py-0.5 border-2 border-ink">
          {g}
        </span>
      ))}
    </div>
    <p className="text-sm text-ink/80 line-clamp-3">{a.why}</p>
    <div className="mt-auto flex items-center justify-between pt-2 text-xs">
      <span className="font-display text-magenta">{a.tier}</span>
      {a.boilerRoom && <span className="text-ink/50">Boiler Room ✓</span>}
    </div>
  </button>
);

const ArtistsPage = () => {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("All");
  const [city, setCity] = useState("All");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [boilerOnly, setBoilerOnly] = useState(false);
  const [sort, setSort] = useState<"rank" | "az">("rank");
  const [open, setOpen] = useState<Artist | null>(null);

  const toggleGenre = (g: string) => {
    const next = new Set(genres);
    next.has(g) ? next.delete(g) : next.add(g);
    setGenres(next);
  };

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    let rows = ARTISTS.filter((a) => {
      if (tier !== "All" && a.tier !== tier) return false;
      if (boilerOnly && !a.boilerRoom) return false;
      if (city !== "All") {
        const cityHit = (a.based || a.from).toLowerCase().includes(city.toLowerCase());
        if (!cityHit) return false;
      }
      if (genres.size > 0 && !a.genres.some((g) => genres.has(g))) return false;
      if (!ql) return true;
      return (
        a.name.toLowerCase().includes(ql) ||
        a.genres.join(" ").toLowerCase().includes(ql) ||
        (a.labels ?? "").toLowerCase().includes(ql) ||
        (a.based || a.from).toLowerCase().includes(ql) ||
        a.why.toLowerCase().includes(ql)
      );
    });
    if (sort === "az") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    else rows = [...rows].sort((a, b) => a.rank - b.rank);
    return rows;
  }, [q, tier, city, genres, boilerOnly, sort]);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "India's Top Electronic Artists — Cats Can Dance",
    itemListElement: ARTISTS.slice(0, 30).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "MusicGroup", name: a.name, genre: a.genres.join(", ") },
    })),
  };

  return (
    <div className="min-h-screen bg-cream">
      <SEO
        title="Artists — India's Top Electronic DJs & Producers | Cats Can Dance"
        description="A festival-credentialed directory of India's top 100 electronic artists — searchable by tier, city, genre, and Boiler Room appearances."
        path="/artists"
        keywords="Indian electronic DJs, India techno house artists, Boiler Room India, Magnetic Fields lineup"
        jsonLd={itemListLd}
      />
      <Nav />
      <PageHero eyebrow="Artists" title="India's Electronic Artists">
        <p className="text-cream/90 max-w-2xl">
          100 festival-credentialed DJs and producers — pure electronic, no Bollywood, no legacy.
          Filter by tier, city, genre, and platform.
        </p>
      </PageHero>

      <section className="container py-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block font-display text-sm text-ink mb-1">Search</label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, genre, label, city…"
              className="border-4 border-ink"
            />
          </div>
          <div>
            <label className="block font-display text-sm text-ink mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="h-10 px-3 border-4 border-ink bg-cream font-display"
            >
              <option value="All">All tiers</option>
              {ARTIST_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-display text-sm text-ink mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 px-3 border-4 border-ink bg-cream font-display max-w-[180px]"
            >
              <option value="All">All cities</option>
              {ARTIST_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-display text-sm text-ink mb-1">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "rank" | "az")}
              className="h-10 px-3 border-4 border-ink bg-cream font-display"
            >
              <option value="rank">By rank</option>
              <option value="az">A–Z</option>
            </select>
          </div>
          <label className="inline-flex items-center gap-2 font-display text-sm text-ink">
            <input
              type="checkbox"
              checked={boilerOnly}
              onChange={(e) => setBoilerOnly(e.target.checked)}
              className="w-4 h-4 accent-magenta"
            />
            Boiler Room only
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {ARTIST_GENRES.map((g) => {
            const active = genres.has(g);
            return (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`text-xs font-display uppercase px-3 py-1.5 border-4 border-ink ${
                  active ? "bg-magenta text-cream" : "bg-cream text-ink hover:bg-acid-yellow"
                }`}
              >
                {g}
              </button>
            );
          })}
          {genres.size > 0 && (
            <button onClick={() => setGenres(new Set())} className="text-xs font-display underline text-ink/70 px-2">
              Clear
            </button>
          )}
        </div>

        <p className="font-display text-sm text-ink/60 mb-4">
          Showing {filtered.length} of {ARTISTS.length}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <ArtistCard key={a.rank} a={a} onOpen={() => setOpen(a)} />
          ))}
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl bg-cream border-4 border-ink">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl uppercase text-ink">
                  {open.name}
                </DialogTitle>
                {open.members && <p className="text-sm text-ink/60">{open.members}</p>}
              </DialogHeader>
              <div className="space-y-3 text-sm text-ink">
                <p>
                  <strong className="font-display">Tier:</strong> {open.tier} · <strong className="font-display">From:</strong>{" "}
                  {open.from} · <strong className="font-display">Based:</strong> {open.based}
                </p>
                {open.genres.length > 0 && (
                  <p>
                    <strong className="font-display">Genres:</strong> {open.genres.join(" / ")}
                  </p>
                )}
                {open.festivals.length > 0 && (
                  <p>
                    <strong className="font-display">Festivals:</strong> {open.festivals.join(", ")}
                  </p>
                )}
                {open.boilerRoom && (
                  <p>
                    <strong className="font-display">Boiler Room:</strong> {open.boilerRoom}
                  </p>
                )}
                {open.labels && (
                  <p>
                    <strong className="font-display">Labels:</strong> {open.labels}
                  </p>
                )}
                <p className="text-ink/80">{open.why}</p>
                {open.priceRange && (
                  <p>
                    <strong className="font-display">Est. price:</strong> {open.priceRange}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {open.instagram && (
                    <a
                      href={`https://instagram.com/${open.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-magenta text-cream font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs"
                    >
                      @{open.instagram}
                    </a>
                  )}
                  {ensureUrl(open.website) && (
                    <a
                      href={ensureUrl(open.website)!}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-cream text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs"
                    >
                      Website
                    </a>
                  )}
                  {open.bookingEmail && (
                    <a
                      href={`mailto:${open.bookingEmail}`}
                      className="bg-acid-yellow text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs"
                    >
                      Book
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ArtistsPage;
