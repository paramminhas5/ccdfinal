import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Artist = {
  id: string; slug: string; name: string; members: string | null;
  from_city: string | null; based_city: string | null;
  genres: string[]; festivals: string[]; bio: string | null; why: string | null;
  instagram: string | null; soundcloud: string | null; bandcamp: string | null;
  spotify: string | null; website: string | null;
  booking_email: string | null; manager_email: string | null;
  labels: string | null; photo_url: string | null;
  fee_min_inr: number | null; fee_max_inr: number | null;
  open_to_bookings: boolean; available_cities: string[];
};

type ArtistDate = {
  id: string; city: string; venue: string | null; event_date: string;
  event_time: string | null; status: string; ticket_url: string | null;
  notes: string | null; is_public: boolean;
};

type Booking = {
  id: string; requester_email: string; requester_phone: string | null;
  purpose: string | null; created_at: string;
  verified_at: string | null; forward_requested: boolean;
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

async function portalCall(action: string, extra: Record<string, unknown> = {}, session: any) {
  const token = session?.access_token ?? "";
  if (action === "me" || action === "dates" || action === "bookings") {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/artist-portal?action=${action}`, {
      headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "" },
    });
    return r.json();
  }
  const r = await fetch(`${SUPABASE_URL}/functions/v1/artist-portal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
    },
    body: JSON.stringify({ action, ...extra }),
  });
  return r.json();
}

/* ─── Profile Editor ─────────────────────────────────────────────────────── */
function ProfileEditor({ artist, session, onSaved }: { artist: Artist; session: any; onSaved: (a: Artist) => void }) {
  const [form, setForm] = useState({
    bio: artist.bio ?? "",
    why: artist.why ?? "",
    instagram: artist.instagram ?? "",
    soundcloud: artist.soundcloud ?? "",
    bandcamp: artist.bandcamp ?? "",
    spotify: artist.spotify ?? "",
    website: artist.website ?? "",
    booking_email: artist.booking_email ?? "",
    manager_email: artist.manager_email ?? "",
    labels: artist.labels ?? "",
    open_to_bookings: artist.open_to_bookings,
    available_cities: (artist.available_cities ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await portalCall("update_profile", {
        ...form,
        available_cities: form.available_cities.split(",").map((s) => s.trim()).filter(Boolean),
      }, session);
      if (res.error) throw new Error(res.error);
      toast.success("Profile updated!");
      onSaved(res.artist as Artist);
    } catch (e: any) { toast.error(e.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  const field = (label: string, key: keyof typeof form, type = "text", rows = 0) => (
    <label key={key} className="block">
      <span className="font-display text-xs uppercase text-ink block mb-1">{label}</span>
      {rows > 0 ? (
        <textarea value={form[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={rows} className="w-full border-4 border-ink px-3 py-2 bg-cream font-sans text-ink focus:outline-none resize-y" />
      ) : (
        <input type={type} value={form[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full border-4 border-ink px-3 py-2 bg-cream font-sans text-ink focus:outline-none" />
      )}
    </label>
  );

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl uppercase text-ink border-b-4 border-ink pb-2">Edit Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("Bio", "bio", "text", 5)}
        {field("Why book you (one-liner)", "why")}
        {field("Instagram handle (no @)", "instagram")}
        {field("SoundCloud URL", "soundcloud")}
        {field("Bandcamp URL", "bandcamp")}
        {field("Spotify URL", "spotify")}
        {field("Website URL", "website")}
        {field("Booking email", "booking_email", "email")}
        {field("Manager email", "manager_email", "email")}
        {field("Labels", "labels")}
        {field("Cities available in (comma-separated)", "available_cities")}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.open_to_bookings} onChange={(e) => setForm((f) => ({ ...f, open_to_bookings: e.target.checked }))}
          className="w-5 h-5 accent-magenta" />
        <span className="font-display text-sm uppercase text-ink">Open to bookings</span>
      </label>
      <button onClick={save} disabled={saving}
        className="bg-magenta text-cream font-display px-6 py-3 border-4 border-ink chunk-shadow uppercase disabled:opacity-60">
        {saving ? "Saving\u2026" : "Save profile"}
      </button>
    </div>
  );
}

/* ─── Date Manager ───────────────────────────────────────────────────────── */
const emptyDate = () => ({ city: "", venue: "", event_date: "", event_time: "", status: "confirmed", ticket_url: "", notes: "", is_public: true });

function DateManager({ session, artistId }: { session: any; artistId: string }) {
  const [dates, setDates] = useState<ArtistDate[]>([]);
  const [form, setForm] = useState(emptyDate());
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await portalCall("dates", {}, session);
    setDates(res.dates ?? []);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.city || !form.event_date) { toast.error("City and date required"); return; }
    setBusy(true);
    try {
      const res = await portalCall("upsert_date", { ...(editId ? { id: editId } : {}), ...form }, session);
      if (res.error) throw new Error(res.error);
      toast.success(editId ? "Date updated" : "Date added");
      setForm(emptyDate()); setEditId(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this date?")) return;
    const res = await portalCall("delete_date", { date_id: id }, session);
    if (res.ok) { toast.success("Deleted"); load(); } else toast.error(res.error);
  };

  const edit = (d: ArtistDate) => {
    setEditId(d.id);
    setForm({ city: d.city, venue: d.venue ?? "", event_date: d.event_date, event_time: d.event_time ?? "",
               status: d.status, ticket_url: d.ticket_url ?? "", notes: d.notes ?? "", is_public: d.is_public });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl uppercase text-ink border-b-4 border-ink pb-2">Tour Dates</h2>

      {/* Form */}
      <div className="border-4 border-ink p-5 bg-cream chunk-shadow space-y-4">
        <h3 className="font-display text-sm uppercase text-ink/70">{editId ? "Edit Date" : "Add Date"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[["City *", "city", "text"], ["Venue", "venue", "text"], ["Date *", "event_date", "date"], ["Time", "event_time", "text"]].map(([label, key, type]) => (
            <label key={key} className="block">
              <span className="font-display text-xs uppercase text-ink block mb-1">{label}</span>
              <input type={type} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border-4 border-ink px-3 py-2 bg-cream font-sans text-ink focus:outline-none" />
            </label>
          ))}
          <label className="block">
            <span className="font-display text-xs uppercase text-ink block mb-1">Status</span>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full border-4 border-ink px-3 py-2 bg-cream font-display text-ink focus:outline-none">
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="available">Available (open slot)</option>
            </select>
          </label>
          <label className="block">
            <span className="font-display text-xs uppercase text-ink block mb-1">Ticket URL</span>
            <input value={form.ticket_url} onChange={(e) => setForm((f) => ({ ...f, ticket_url: e.target.value }))}
              className="w-full border-4 border-ink px-3 py-2 bg-cream font-sans text-ink focus:outline-none" />
          </label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))} className="w-4 h-4 accent-magenta" />
          <span className="font-display text-xs uppercase text-ink">Show on public profile</span>
        </label>
        <div className="flex gap-3">
          <button onClick={save} disabled={busy} className="bg-magenta text-cream font-display px-5 py-2.5 border-4 border-ink chunk-shadow uppercase text-sm disabled:opacity-60">
            {busy ? "\u2026" : editId ? "Update" : "Add date"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm(emptyDate()); }} className="font-display text-sm uppercase text-ink/60 underline">Cancel</button>}
        </div>
      </div>

      {/* List */}
      {dates.length === 0
        ? <p className="text-ink/50 font-display text-sm">No dates yet. Add your upcoming shows above.</p>
        : (
          <div className="space-y-3">
            {dates.sort((a, b) => a.event_date.localeCompare(b.event_date)).map((d) => (
              <div key={d.id} className="flex items-center gap-4 border-4 border-ink bg-cream p-4">
                <div className="flex-1">
                  <p className="font-display text-lg uppercase text-ink">{d.event_date} \u2014 {d.city}</p>
                  {d.venue && <p className="text-sm text-ink/70">{d.venue}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs font-display uppercase px-2 py-0.5 border border-ink ${d.status==="confirmed"?"bg-acid-yellow":d.status==="tentative"?"bg-cream text-ink/60":"bg-ink text-cream"}`}>{d.status}</span>
                    {!d.is_public && <span className="text-xs font-display uppercase px-2 py-0.5 border border-ink/30 text-ink/40">Private</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(d)} className="font-display text-xs uppercase px-3 py-1.5 border-2 border-ink hover:bg-acid-yellow transition-colors">Edit</button>
                  <button onClick={() => del(d.id)} className="font-display text-xs uppercase px-3 py-1.5 border-2 border-magenta text-magenta hover:bg-magenta hover:text-cream transition-colors">Del</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

/* ─── Booking Inbox ──────────────────────────────────────────────────────── */
function BookingInbox({ session }: { session: any }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await portalCall("bookings", {}, session);
      setBookings(res.bookings ?? []);
      setLoading(false);
    })();
  }, [session]);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl uppercase text-ink border-b-4 border-ink pb-2">Booking Requests</h2>
      {loading ? <p className="font-display text-sm text-ink/50 animate-pulse">Loading\u2026</p> :
       bookings.length === 0 ? <p className="font-display text-sm text-ink/50">No booking requests yet.</p> : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="border-4 border-ink bg-cream p-5 chunk-shadow">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-display text-lg text-ink">{b.requester_email}</p>
                  {b.requester_phone && <p className="text-sm text-ink/60">{b.requester_phone}</p>}
                  {b.purpose && <p className="text-sm text-ink/80 mt-2 whitespace-pre-line">{b.purpose}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xs text-ink/50">{new Date(b.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
                  {b.verified_at && <span className="font-display text-xs bg-acid-yellow text-ink px-2 py-0.5 border border-ink">Verified</span>}
                  {b.forward_requested && <p className="font-display text-xs text-magenta mt-1">CCD forwarded</p>}
                </div>
              </div>
              <a href={`mailto:${b.requester_email}`}
                className="mt-3 inline-block font-display text-xs uppercase bg-magenta text-cream px-4 py-2 border-2 border-ink">
                Reply \u2192
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
type Tab = "profile" | "dates" | "bookings";

const ArtistPortal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get("claim");

  const [session, setSession] = useState<any>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimDone, setClaimDone] = useState(false);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Load artist profile
  useEffect(() => {
    if (!session) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const res = await portalCall("me", {}, session);
      setArtist(res.artist ?? null);
      setLoading(false);

      // If came here from claim link
      if (claimId && !res.artist) {
        setClaiming(true);
        const claimRes = await portalCall("claim", { artist_id: claimId }, session);
        if (claimRes.ok) {
          setClaimDone(true);
          const reload = await portalCall("me", {}, session);
          setArtist(reload.artist ?? null);
        } else {
          toast.error(claimRes.error ?? "Could not claim profile");
        }
        setClaiming(false);
      }
    })();
  }, [session, claimId]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/artists");
  };

  /* ── Not logged in ── */
  if (!session && !loading) {
    return (
      <div className="min-h-screen bg-cream">
        <SEO title="Artist Portal | Cats Can Dance" description="Manage your artist profile, tour dates, and booking requests." path="/artist/dashboard" />
        <Nav />
        <div className="container py-24 max-w-lg">
          <h1 className="font-display text-4xl uppercase text-ink mb-2">Artist Portal</h1>
          <p className="text-ink/70 mb-8">Sign in to manage your profile, tour dates, and booking requests. No password needed.</p>
          <MagicLinkForm />
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Loading ── */
  if (loading || claiming) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Nav />
        <p className="font-display text-2xl text-ink animate-pulse">{claiming ? "Claiming profile\u2026" : "Loading\u2026"}</p>
      </div>
    );
  }

  /* ── No artist claimed ── */
  if (!artist) {
    return (
      <div className="min-h-screen bg-cream">
        <SEO title="Artist Portal | Cats Can Dance" description="" path="/artist/dashboard" />
        <Nav />
        <div className="container py-24 max-w-2xl">
          <h1 className="font-display text-4xl uppercase text-ink mb-4">No Profile Linked</h1>
          <p className="text-ink/70 mb-6">
            You\u2019re logged in as <strong>{session?.user?.email}</strong> but no artist profile is linked to this account yet.
          </p>
          {claimDone && <div className="bg-acid-yellow border-4 border-ink p-4 mb-6"><p className="font-display">Profile claimed! You can now manage it below.</p></div>}
          <p className="text-ink/70 mb-4">
            Find your artist page on the <Link to="/artists" className="underline text-magenta">artists directory</Link> and click \u201cAre you [name]?\u201d to link it to this account.
          </p>
          <button onClick={signOut} className="font-display text-sm uppercase underline text-ink/60">Sign out</button>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Dashboard ── */
  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "dates", label: "Dates" },
    { key: "bookings", label: "Bookings" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <SEO title={`${artist.name} Portal | Cats Can Dance`} description="" path="/artist/dashboard" />
      <Nav />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-4 border-ink pb-6">
          <div>
            <p className="font-display text-xs uppercase text-ink/50 mb-1">Artist Portal</p>
            <h1 className="font-display text-4xl uppercase text-ink">{artist.name}</h1>
            <p className="text-sm text-ink/60 mt-1">{session?.user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/artists/${artist.slug}`} target="_blank"
              className="font-display text-xs uppercase px-4 py-2 border-4 border-ink bg-acid-yellow text-ink chunk-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-transform">
              View public profile \u2197
            </Link>
            <button onClick={signOut} className="font-display text-xs uppercase px-4 py-2 border-4 border-ink text-ink/60 hover:bg-ink hover:text-cream transition-colors">
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b-4 border-ink">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`font-display text-sm uppercase px-5 py-2.5 border-4 border-b-0 border-ink transition-colors ${tab === t.key ? "bg-ink text-cream" : "bg-cream text-ink hover:bg-acid-yellow"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "profile" && <ProfileEditor artist={artist} session={session} onSaved={setArtist} />}
        {tab === "dates" && <DateManager session={session} artistId={artist.id} />}
        {tab === "bookings" && <BookingInbox session={session} />}
      </div>

      <Footer />
    </div>
  );
};

/* ─── Magic Link Form ────────────────────────────────────────────────────── */
function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!email.trim()) { toast.error("Email required"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("artist-magic-link", {
        body: { email, redirect_to: `${window.location.origin}/artist/dashboard` },
      });
      if (error) throw new Error(error.message ?? "Failed to send link");
      setSent(true);
      toast.success("Magic link sent!");
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  };

  if (sent) return (
    <div className="bg-acid-yellow border-4 border-ink p-6">
      <p className="font-display text-xl uppercase text-ink mb-2">Check your inbox</p>
      <p className="text-ink/80">We sent a magic link to <strong>{email}</strong>. Click it to access your dashboard.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="font-display text-xs uppercase text-ink block mb-2">Your email address</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className="w-full border-4 border-ink px-4 py-3 bg-cream font-sans text-ink focus:outline-none text-lg" />
      </label>
      <button onClick={send} disabled={busy}
        className="w-full bg-magenta text-cream font-display px-6 py-4 border-4 border-ink chunk-shadow uppercase text-lg disabled:opacity-60 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform">
        {busy ? "Sending\u2026" : "Send magic link"}
      </button>
      <p className="text-xs text-ink/50">No password needed. We\u2019ll email you a one-click sign-in link.</p>
    </div>
  );
}

export default ArtistPortal;
