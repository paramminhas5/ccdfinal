import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Artist = {
  id: string;
  slug: string;
  name: string;
  members: string | null;
  from_city: string | null;
  based_city: string | null;
  genres: string[];
  bio: string | null;
  photo_url: string | null;
  instagram: string | null;
  soundcloud: string | null;
  bandcamp: string | null;
  spotify: string | null;
  website: string | null;
  booking_email: string | null;
  manager_email: string | null;
  festivals: string[];
  labels: string | null;
};

const ensureUrl = (s: string | null) => (s ? (/^https?:\/\//i.test(s) ? s : `https://${s}`) : null);

const ArtistCard = ({ a, onOpen }: { a: Artist; onOpen: () => void }) => (
  <button
    onClick={onOpen}
    className="text-left bg-cream border-4 border-ink chunk-shadow flex flex-col hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform overflow-hidden"
  >
    {a.photo_url ? (
      <img src={a.photo_url} alt={a.name} className="w-full aspect-square object-cover border-b-4 border-ink" loading="lazy" />
    ) : (
      <div className="w-full aspect-square bg-acid-yellow border-b-4 border-ink flex items-center justify-center font-display text-ink text-5xl">
        {a.name.slice(0, 1)}
      </div>
    )}
    <div className="p-4 flex-1 flex flex-col gap-2">
      <h3 className="font-display text-xl text-ink leading-tight uppercase">{a.name}</h3>
      {a.members && <p className="text-xs text-ink/60">{a.members}</p>}
      <p className="text-xs text-ink/60">
        {a.based_city || a.from_city}
        {a.from_city && a.based_city && a.from_city !== a.based_city ? ` · from ${a.from_city}` : ""}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {a.genres.slice(0, 3).map((g) => (
          <span key={g} className="text-[10px] font-display uppercase bg-acid-yellow text-ink px-2 py-0.5 border-2 border-ink">{g}</span>
        ))}
      </div>
      {a.bio && <p className="text-sm text-ink/80 line-clamp-3">{a.bio}</p>}
    </div>
  </button>
);

const ArtistsPage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [festival, setFestival] = useState("All");
  const [sort, setSort] = useState<"az" | "recent">("az");
  const [open, setOpen] = useState<Artist | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState<Artist | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, slug, name, members, from_city, based_city, genres, bio, photo_url, instagram, soundcloud, bandcamp, spotify, website, booking_email, manager_email, festivals, labels")
        .order("name");
      if (error) console.error(error);
      setArtists((data ?? []) as Artist[]);
      setLoading(false);
    })();
  }, []);

  const allCities = useMemo(() => {
    const s = new Set<string>();
    artists.forEach((a) => { if (a.based_city) s.add(a.based_city); if (a.from_city) s.add(a.from_city); });
    return Array.from(s).sort();
  }, [artists]);

  const allGenres = useMemo(() => {
    const s = new Set<string>();
    artists.forEach((a) => a.genres.forEach((g) => s.add(g)));
    return Array.from(s).sort();
  }, [artists]);

  const allFestivals = useMemo(() => {
    const s = new Set<string>();
    artists.forEach((a) => a.festivals.forEach((f) => s.add(f)));
    return Array.from(s).sort();
  }, [artists]);

  const toggleGenre = (g: string) => {
    const next = new Set(genres);
    next.has(g) ? next.delete(g) : next.add(g);
    setGenres(next);
  };

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    let rows = artists.filter((a) => {
      if (city !== "All" && !((a.based_city ?? "").includes(city) || (a.from_city ?? "").includes(city))) return false;
      if (festival !== "All" && !a.festivals.includes(festival)) return false;
      if (genres.size > 0 && !a.genres.some((g) => genres.has(g))) return false;
      if (!ql) return true;
      return (
        a.name.toLowerCase().includes(ql) ||
        a.genres.join(" ").toLowerCase().includes(ql) ||
        (a.labels ?? "").toLowerCase().includes(ql) ||
        (a.based_city ?? "").toLowerCase().includes(ql) ||
        (a.from_city ?? "").toLowerCase().includes(ql) ||
        (a.bio ?? "").toLowerCase().includes(ql) ||
        a.festivals.join(" ").toLowerCase().includes(ql)
      );
    });
    if (sort === "az") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [artists, q, city, genres, festival, sort]);

  return (
    <div className="min-h-screen bg-cream">
      <SEO
        title="Artists — India's Electronic DJs & Producers | Cats Can Dance"
        description="A community-curated directory of India's electronic artists. Search by city, genre, and festivals. Submit yourself or book through the platform."
        path="/artists"
        keywords="Indian electronic DJs, India techno house artists, book Indian DJ"
      />
      <Nav />
      <PageHero eyebrow="Artists" title="India's Electronic Artists">
        <p className="text-cream/90 max-w-2xl">
          A growing directory of India's electronic artists. Search, filter, and reach out — verified contacts revealed after a quick email check.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => setSubmitOpen(true)} className="bg-magenta text-cream font-display border-4 border-cream chunk-shadow uppercase">
            Add yourself
          </Button>
        </div>
      </PageHero>

      <section className="container py-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block font-display text-sm text-ink mb-1">Search</label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, genre, festival, label, city…" className="border-4 border-ink" />
          </div>
          <div>
            <label className="block font-display text-sm text-ink mb-1">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 px-3 border-4 border-ink bg-cream font-display max-w-[200px]">
              <option value="All">All cities</option>
              {allCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-display text-sm text-ink mb-1">Festival</label>
            <select value={festival} onChange={(e) => setFestival(e.target.value)} className="h-10 px-3 border-4 border-ink bg-cream font-display max-w-[220px]">
              <option value="All">Any festival</option>
              {allFestivals.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-display text-sm text-ink mb-1">Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-10 px-3 border-4 border-ink bg-cream font-display">
              <option value="az">A–Z</option>
              <option value="recent">Recently added</option>
            </select>
          </div>
        </div>

        {allGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {allGenres.map((g) => {
              const active = genres.has(g);
              return (
                <button key={g} onClick={() => toggleGenre(g)} className={`text-xs font-display uppercase px-3 py-1.5 border-4 border-ink ${active ? "bg-magenta text-cream" : "bg-cream text-ink hover:bg-acid-yellow"}`}>{g}</button>
              );
            })}
            {genres.size > 0 && (
              <button onClick={() => setGenres(new Set())} className="text-xs font-display underline text-ink/70 px-2">Clear</button>
            )}
          </div>
        )}

        <p className="font-display text-sm text-ink/60 mb-4">
          {loading ? "Loading…" : `Showing ${filtered.length} of ${artists.length}`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => <ArtistCard key={a.id} a={a} onOpen={() => setOpen(a)} />)}
        </div>
      </section>

      {/* Detail dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl bg-cream border-4 border-ink">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl uppercase text-ink">{open.name}</DialogTitle>
                {open.members && <DialogDescription className="text-sm text-ink/60">{open.members}</DialogDescription>}
              </DialogHeader>
              {open.photo_url && <img src={open.photo_url} alt={open.name} className="w-full max-h-72 object-cover border-2 border-ink" />}
              <div className="space-y-3 text-sm text-ink">
                <p className="text-ink/70">
                  {open.based_city || open.from_city}
                  {open.from_city && open.based_city && open.from_city !== open.based_city ? ` · from ${open.from_city}` : ""}
                </p>
                {open.genres.length > 0 && (
                  <p><strong className="font-display">Genres:</strong> {open.genres.join(" / ")}</p>
                )}
                {open.festivals.length > 0 && (
                  <p><strong className="font-display">Festivals & big parties:</strong> {open.festivals.join(", ")}</p>
                )}
                {open.labels && <p><strong className="font-display">Labels:</strong> {open.labels}</p>}
                {open.bio && <p className="text-ink/80 whitespace-pre-line">{open.bio}</p>}
                <div className="flex flex-wrap gap-2 pt-3">
                  {open.instagram && (
                    <a href={`https://instagram.com/${open.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="bg-cream text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs">Instagram</a>
                  )}
                  {ensureUrl(open.soundcloud) && (
                    <a href={ensureUrl(open.soundcloud)!} target="_blank" rel="noreferrer" className="bg-cream text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs">SoundCloud</a>
                  )}
                  {ensureUrl(open.bandcamp) && (
                    <a href={ensureUrl(open.bandcamp)!} target="_blank" rel="noreferrer" className="bg-cream text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs">Bandcamp</a>
                  )}
                  {ensureUrl(open.spotify) && (
                    <a href={ensureUrl(open.spotify)!} target="_blank" rel="noreferrer" className="bg-cream text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs">Spotify</a>
                  )}
                  {ensureUrl(open.website) && (
                    <a href={ensureUrl(open.website)!} target="_blank" rel="noreferrer" className="bg-cream text-ink font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs">Website</a>
                  )}
                  {(open.booking_email || open.manager_email) && (
                    <button onClick={() => { setBookOpen(open); setOpen(null); }} className="bg-magenta text-cream font-display px-3 py-2 border-4 border-ink chunk-shadow text-xs uppercase">Book</button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SubmitArtistDialog open={submitOpen} onOpenChange={setSubmitOpen} />
      <BookDialog artist={bookOpen} onClose={() => setBookOpen(null)} />

      <Footer />
    </div>
  );
};

/* --------------------------- SUBMIT ARTIST DIALOG --------------------------- */

const SubmitArtistDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", members: "", from_city: "", based_city: "", genres: "", bio: "", photo_url: "",
    instagram: "", soundcloud: "", bandcamp: "", spotify: "", website: "",
    booking_email: "", manager_email: "", festivals: "", labels: "",
    submitter_email: "", submitter_role: "self", notes: "",
  });
  const upd = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.submitter_email.trim()) {
      toast.error("Artist name and your email are required");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("artist-submit", {
        body: {
          ...form,
          genres: form.genres.split(",").map((s) => s.trim()).filter(Boolean),
          festivals: form.festivals.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setDone(false); }}>
      <DialogContent className="max-w-2xl bg-cream border-4 border-ink max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-ink">Add yourself</DialogTitle>
          <DialogDescription className="text-ink/70">Submit your details — we'll review and publish within a few days.</DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="py-8 text-center">
            <p className="font-display text-xl text-ink">Thanks — submission received.</p>
            <p className="text-sm text-ink/70 mt-2">We'll be in touch at {form.submitter_email}.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-4 bg-ink text-cream font-display">Close</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <Field label="Artist name *"><Input value={form.name} onChange={(e) => upd("name", e.target.value)} className="border-4 border-ink" /></Field>
            <Field label="Members (if duo/group)"><Input value={form.members} onChange={(e) => upd("members", e.target.value)} className="border-4 border-ink" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From"><Input value={form.from_city} onChange={(e) => upd("from_city", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="Based in"><Input value={form.based_city} onChange={(e) => upd("based_city", e.target.value)} className="border-4 border-ink" /></Field>
            </div>
            <Field label="Genres (comma-separated)"><Input value={form.genres} onChange={(e) => upd("genres", e.target.value)} placeholder="Techno, House" className="border-4 border-ink" /></Field>
            <Field label="Bio"><Textarea value={form.bio} onChange={(e) => upd("bio", e.target.value)} className="border-4 border-ink min-h-24" /></Field>
            <Field label="Festivals & big parties (comma-separated)"><Input value={form.festivals} onChange={(e) => upd("festivals", e.target.value)} placeholder="Magnetic Fields, Sunburn" className="border-4 border-ink" /></Field>
            <Field label="Photo URL (or upload to your own host)"><Input value={form.photo_url} onChange={(e) => upd("photo_url", e.target.value)} placeholder="https://…" className="border-4 border-ink" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instagram handle"><Input value={form.instagram} onChange={(e) => upd("instagram", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="SoundCloud URL"><Input value={form.soundcloud} onChange={(e) => upd("soundcloud", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="Bandcamp URL"><Input value={form.bandcamp} onChange={(e) => upd("bandcamp", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="Spotify URL"><Input value={form.spotify} onChange={(e) => upd("spotify", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="Website"><Input value={form.website} onChange={(e) => upd("website", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="Labels"><Input value={form.labels} onChange={(e) => upd("labels", e.target.value)} className="border-4 border-ink" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Booking email"><Input value={form.booking_email} onChange={(e) => upd("booking_email", e.target.value)} className="border-4 border-ink" /></Field>
              <Field label="Manager email"><Input value={form.manager_email} onChange={(e) => upd("manager_email", e.target.value)} className="border-4 border-ink" /></Field>
            </div>
            <Field label="Your email *"><Input type="email" value={form.submitter_email} onChange={(e) => upd("submitter_email", e.target.value)} className="border-4 border-ink" /></Field>
            <Field label="You are…">
              <select value={form.submitter_role} onChange={(e) => upd("submitter_role", e.target.value)} className="h-10 px-3 border-4 border-ink bg-cream font-display w-full">
                <option value="self">The artist</option>
                <option value="manager">Manager / agent</option>
                <option value="fan">A fan</option>
              </select>
            </Field>
            <Field label="Notes (optional)"><Textarea value={form.notes} onChange={(e) => upd("notes", e.target.value)} className="border-4 border-ink" /></Field>
            <Button onClick={submit} disabled={busy} className="bg-magenta text-cream font-display border-4 border-ink chunk-shadow uppercase">
              {busy ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block font-display text-xs text-ink mb-1 uppercase">{label}</span>
    {children}
  </label>
);

/* ------------------------------- BOOK DIALOG ------------------------------- */

const BookDialog = ({ artist, onClose }: { artist: Artist | null; onClose: () => void }) => {
  const [step, setStep] = useState<"start" | "verify" | "done">("start");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [code, setCode] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [forward, setForward] = useState(false);

  useEffect(() => {
    if (artist) {
      setStep("start"); setEmail(""); setPhone(""); setPurpose(""); setCode("");
      setBookingId(null); setRevealed(null); setForward(false);
    }
  }, [artist]);

  if (!artist) return null;

  const startOtp = async () => {
    if (!email.trim()) { toast.error("Email required"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("booking-otp-start", {
        body: { artist_id: artist.id, requester_email: email, requester_phone: phone, purpose },
      });
      if (error) throw error;
      setBookingId((data as any)?.booking_id ?? null);
      setStep("verify");
      toast.success("Code sent — check your inbox.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send code");
    } finally { setBusy(false); }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(code)) { toast.error("Enter the 6-digit code"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("booking-otp-verify", {
        body: { requester_email: email, code, booking_id: bookingId, forward_requested: forward },
      });
      if (error) throw error;
      const d = data as any;
      setRevealed(d?.artist_email ?? null);
      setStep("done");
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid code");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={!!artist} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-cream border-4 border-ink">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase text-ink">Book {artist.name}</DialogTitle>
          <DialogDescription className="text-ink/70">
            We verify your email before revealing the booking contact. CCD also gets a copy so we can help if you'd like.
          </DialogDescription>
        </DialogHeader>

        {step === "start" && (
          <div className="grid gap-3">
            <Field label="Your email *"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-4 border-ink" /></Field>
            <Field label="Phone (optional)"><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="border-4 border-ink" /></Field>
            <Field label="What's the booking for?"><Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Date, city, type of event, budget range…" className="border-4 border-ink" /></Field>
            <Button onClick={startOtp} disabled={busy} className="bg-magenta text-cream font-display border-4 border-ink chunk-shadow uppercase">
              {busy ? "Sending…" : "Send verification code"}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="grid gap-3">
            <p className="text-sm text-ink/70">We sent a 6-digit code to <strong>{email}</strong>.</p>
            <Field label="Enter code"><Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="border-4 border-ink tracking-widest text-center text-2xl font-display" /></Field>
            <label className="flex items-start gap-2 text-sm text-ink">
              <input type="checkbox" checked={forward} onChange={(e) => setForward(e.target.checked)} className="mt-1 w-4 h-4 accent-magenta" />
              <span>Have CCD reach out to the artist/manager on my behalf.</span>
            </label>
            <Button onClick={verifyOtp} disabled={busy} className="bg-magenta text-cream font-display border-4 border-ink chunk-shadow uppercase">
              {busy ? "Verifying…" : "Verify & reveal"}
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="grid gap-3">
            {revealed ? (
              <>
                <p className="text-sm text-ink/70">Booking contact:</p>
                <a href={`mailto:${revealed}`} className="font-display text-xl text-ink bg-acid-yellow border-4 border-ink p-3 break-all">{revealed}</a>
              </>
            ) : (
              <p className="text-sm text-ink/80">No public booking contact on file. CCD has been notified — we'll try to connect you.</p>
            )}
            {forward && <p className="text-sm text-magenta">CCD has been asked to reach out on your behalf.</p>}
            <Button onClick={onClose} className="bg-ink text-cream font-display">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArtistsPage;
