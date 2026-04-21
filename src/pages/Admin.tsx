import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Nav from "@/components/Nav";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Signup = { id: string; email: string; source: string | null; created_at: string };
type Platform = "spotify" | "youtube" | "soundcloud";
type PlaylistItem = {
  id: string;
  title: string;
  platform: Platform;
  embed_id: string;
  url: string;
  spotify_id?: string;
};
type Settings = { id: string; playlists: PlaylistItem[]; featured_playlist_id: string | null };
type EventRow = {
  id?: string; slug: string; title: string; date: string; city: string; venue: string;
  blurb: string; lineup: string[]; status: string; poster_url: string | null; sort_order: number;
};
type Message = { id: string; name: string; email: string; message: string; created_at: string };

const PASS_KEY = "ccd_admin_pass";

const extractPlaylistInfo = (
  platform: Platform,
  input: string
): { embed_id: string; url: string } => {
  const trimmed = input.trim();
  if (platform === "spotify") {
    const m = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
    const id = m ? m[1] : trimmed;
    return { embed_id: id, url: `https://open.spotify.com/playlist/${id}` };
  }
  if (platform === "youtube") {
    const m = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    const id = m ? m[1] : trimmed;
    return { embed_id: id, url: `https://www.youtube.com/playlist?list=${id}` };
  }
  return { embed_id: trimmed, url: trimmed };
};

const normalizePlaylist = (p: any): PlaylistItem => ({
  id: p.id,
  title: p.title,
  platform: (p.platform as Platform) ?? "spotify",
  embed_id: p.embed_id ?? p.spotify_id ?? "",
  url:
    p.url ??
    (p.spotify_id ? `https://open.spotify.com/playlist/${p.spotify_id}` : ""),
});

const platformGlyph = (p: Platform) =>
  p === "spotify" ? "♫" : p === "youtube" ? "▶" : "☁";

const Admin = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASS_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);

  const [signups, setSignups] = useState<Signup[]>([]);
  const [signupSearch, setSignupSearch] = useState("");

  const [settings, setSettings] = useState<Settings | null>(null);
  const [newPlTitle, setNewPlTitle] = useState("");
  const [newPlUrl, setNewPlUrl] = useState("");
  const [newPlPlatform, setNewPlPlatform] = useState<Platform>("spotify");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgSearch, setMsgSearch] = useState("");

  const callContent = async (init: RequestInit & { search?: string } = {}) => {
    const pwd = sessionStorage.getItem(PASS_KEY) ?? "";
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${projectUrl}/functions/v1/admin-content${init.search ?? ""}`, {
      ...init,
      headers: {
        "x-admin-password": pwd,
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error("request failed");
    return res.json();
  };

  const loadAll = async (pwd: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-signups", {
        headers: { "x-admin-password": pwd },
      });
      if (error || (data as any)?.error) throw new Error("auth");
      setSignups(((data as any)?.signups ?? []) as Signup[]);
      sessionStorage.setItem(PASS_KEY, pwd);
      setAuthed(true);

      const [s, e, m] = await Promise.all([
        callContent({ method: "GET", search: "?type=settings" }),
        callContent({ method: "GET", search: "?type=events" }),
        callContent({ method: "GET", search: "?type=messages" }),
      ]);
      setSettings(
        s.settings
          ? {
              ...s.settings,
              playlists: (s.settings.playlists ?? []).map(normalizePlaylist),
            }
          : null
      );
      setEvents(e.events);
      setMessages(m.messages);
    } catch {
      sessionStorage.removeItem(PASS_KEY);
      setAuthed(false);
      toast.error("Wrong password.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(PASS_KEY);
    if (stored) loadAll(stored);
  }, []);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    loadAll(password);
  };

  const onLogout = () => {
    sessionStorage.removeItem(PASS_KEY);
    setAuthed(false);
    setSignups([]);
    setPassword("");
  };

  const downloadCsv = async (kind: "signups" | "messages") => {
    if (kind === "signups") {
      const pwd = sessionStorage.getItem(PASS_KEY) ?? "";
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${projectUrl}/functions/v1/admin-signups?format=csv`, {
        headers: {
          "x-admin-password": pwd,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (!res.ok) return toast.error("Could not download CSV");
      triggerDownload(await res.blob(), `early-access-${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const rows = [
        ["name", "email", "message", "created_at"].join(","),
        ...messages.map((m) =>
          [m.name, m.email, m.message, m.created_at]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
      triggerDownload(new Blob([rows], { type: "text/csv" }), `messages-${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  // Playlists
  const savePlaylists = async (next: Settings) => {
    setSettings(next);
    try {
      await callContent({
        method: "POST",
        body: JSON.stringify({ type: "settings", action: "upsert", payload: next }),
      });
      toast.success("Playlists saved");
    } catch {
      toast.error("Save failed");
    }
  };

  const addPlaylist = () => {
    if (!settings || !newPlTitle.trim() || !newPlUrl.trim()) return;
    const { embed_id, url } = extractPlaylistInfo(newPlPlatform, newPlUrl);
    if (!embed_id) return;
    const id = `${Date.now()}`;
    const next: Settings = {
      ...settings,
      playlists: [
        ...settings.playlists,
        { id, title: newPlTitle.trim(), platform: newPlPlatform, embed_id, url },
      ],
      featured_playlist_id: settings.featured_playlist_id ?? id,
    };
    setNewPlTitle(""); setNewPlUrl("");
    savePlaylists(next);
  };

  const removePlaylist = (id: string) => {
    if (!settings) return;
    const remaining = settings.playlists.filter((p) => p.id !== id);
    const next: Settings = {
      ...settings,
      playlists: remaining,
      featured_playlist_id: settings.featured_playlist_id === id ? remaining[0]?.id ?? null : settings.featured_playlist_id,
    };
    savePlaylists(next);
  };

  const setFeatured = (id: string) => {
    if (!settings) return;
    savePlaylists({ ...settings, featured_playlist_id: id });
  };

  // Events
  const saveEvent = async (ev: EventRow) => {
    try {
      await callContent({
        method: "POST",
        body: JSON.stringify({ type: "events", action: "upsert", payload: ev }),
      });
      const e = await callContent({ method: "GET", search: "?type=events" });
      setEvents(e.events);
      toast.success("Event saved");
    } catch {
      toast.error("Save failed");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await callContent({
        method: "POST",
        body: JSON.stringify({ type: "events", action: "delete", payload: { id } }),
      });
      setEvents(events.filter((e) => e.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const addEvent = () => {
    setEvents([
      ...events,
      {
        slug: `event-${Date.now()}`, title: "NEW EPISODE", date: "TBA", city: "TBA", venue: "TBA",
        blurb: "", lineup: [], status: "upcoming", poster_url: null,
        sort_order: (events[events.length - 1]?.sort_order ?? 0) + 1,
      },
    ]);
  };

  const filteredSignups = signups.filter((s) => s.email.toLowerCase().includes(signupSearch.toLowerCase()));
  const filteredMessages = messages.filter((m) =>
    [m.name, m.email, m.message].join(" ").toLowerCase().includes(msgSearch.toLowerCase())
  );

  return (
    <main className="bg-background text-foreground min-h-screen">
      <SEO title="Admin — Cats Can Dance" description="Admin dashboard" path="/admin" />
      <Nav />
      <section className="pt-32 pb-16 container">
        {!authed ? (
          <div className="max-w-md mx-auto bg-cream border-4 border-ink chunk-shadow-lg p-8">
            <h1 className="font-display text-4xl text-ink mb-2">ADMIN</h1>
            <p className="text-ink/70 font-medium mb-6">Enter the admin password.</p>
            <form onSubmit={onLogin} className="space-y-4">
              <input
                type="password"
                required autoFocus value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-display text-lg focus:outline-none focus:bg-acid-yellow"
              />
              <button
                type="submit" disabled={busy}
                className="w-full bg-ink text-cream font-display text-xl py-3 hover:bg-magenta transition-colors disabled:opacity-60"
              >
                {busy ? "CHECKING…" : "UNLOCK"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <h1 className="font-display text-4xl md:text-5xl text-ink">DASHBOARD</h1>
              <button onClick={onLogout} className="bg-cream text-ink font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
                LOG OUT
              </button>
            </div>

            <Tabs defaultValue="signups" className="w-full">
              <TabsList className="bg-cream border-4 border-ink p-1 mb-6 flex-wrap h-auto">
                <TabsTrigger value="signups" className="font-display data-[state=active]:bg-ink data-[state=active]:text-cream">SIGNUPS</TabsTrigger>
                <TabsTrigger value="playlists" className="font-display data-[state=active]:bg-ink data-[state=active]:text-cream">PLAYLISTS</TabsTrigger>
                <TabsTrigger value="events" className="font-display data-[state=active]:bg-ink data-[state=active]:text-cream">EVENTS</TabsTrigger>
                <TabsTrigger value="messages" className="font-display data-[state=active]:bg-ink data-[state=active]:text-cream">MESSAGES</TabsTrigger>
                <TabsTrigger value="seo" className="font-display data-[state=active]:bg-ink data-[state=active]:text-cream">SEO</TabsTrigger>
              </TabsList>

              {/* SIGNUPS */}
              <TabsContent value="signups">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-ink/70 font-medium">{signups.length} total signups</p>
                  <button onClick={() => downloadCsv("signups")} className="bg-acid-yellow text-ink font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
                    DOWNLOAD CSV
                  </button>
                </div>
                <input
                  type="search" value={signupSearch}
                  onChange={(e) => setSignupSearch(e.target.value)}
                  placeholder="Search by email…"
                  className="w-full mb-4 bg-cream text-ink border-4 border-ink px-4 py-3 font-medium focus:outline-none focus:bg-acid-yellow"
                />
                <div className="border-4 border-ink chunk-shadow bg-cream overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-ink text-cream font-display">
                      <tr><th className="px-4 py-3">EMAIL</th><th className="px-4 py-3">SOURCE</th><th className="px-4 py-3">SIGNED UP</th></tr>
                    </thead>
                    <tbody>
                      {filteredSignups.map((s) => (
                        <tr key={s.id} className="border-t-2 border-ink/20">
                          <td className="px-4 py-3 font-medium">{s.email}</td>
                          <td className="px-4 py-3 text-ink/70">{s.source ?? "—"}</td>
                          <td className="px-4 py-3 text-ink/70">{new Date(s.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                      {filteredSignups.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-ink/60">No signups yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* PLAYLISTS */}
              <TabsContent value="playlists">
                <div className="bg-cream border-4 border-ink chunk-shadow p-6 mb-6">
                  <h3 className="font-display text-2xl text-ink mb-4">ADD PLAYLIST</h3>
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <select
                      value={newPlPlatform}
                      onChange={(e) => setNewPlPlatform(e.target.value as Platform)}
                      className="bg-cream text-ink border-4 border-ink px-4 py-3 font-display focus:outline-none focus:bg-acid-yellow"
                    >
                      <option value="spotify">♫ Spotify</option>
                      <option value="youtube">▶ YouTube</option>
                      <option value="soundcloud">☁ SoundCloud</option>
                    </select>
                    <input
                      placeholder="Title (e.g. Summer Mix)"
                      value={newPlTitle} onChange={(e) => setNewPlTitle(e.target.value)}
                      className="bg-cream text-ink border-4 border-ink px-4 py-3 font-medium focus:outline-none focus:bg-acid-yellow"
                    />
                    <input
                      placeholder={
                        newPlPlatform === "spotify"
                          ? "Spotify playlist URL"
                          : newPlPlatform === "youtube"
                          ? "YouTube playlist URL (with ?list=…)"
                          : "SoundCloud track or playlist URL"
                      }
                      value={newPlUrl} onChange={(e) => setNewPlUrl(e.target.value)}
                      className="bg-cream text-ink border-4 border-ink px-4 py-3 font-medium focus:outline-none focus:bg-acid-yellow"
                    />
                  </div>
                  <button onClick={addPlaylist} className="bg-ink text-cream font-display px-5 py-2 hover:bg-magenta transition-colors">
                    ADD
                  </button>
                </div>

                <div className="space-y-3">
                  {settings?.playlists.map((p) => (
                    <div key={p.id} className="bg-cream border-4 border-ink chunk-shadow p-4 flex flex-wrap items-center gap-3 justify-between">
                      <div className="min-w-0">
                        <p className="font-display text-xl text-ink flex items-center gap-2">
                          <span aria-hidden>{platformGlyph(p.platform)}</span>
                          {p.title}
                          <span className="text-ink/50 text-xs uppercase">{p.platform}</span>
                        </p>
                        <p className="text-ink/60 text-sm font-mono truncate max-w-[60ch]">{p.url || p.embed_id}</p>
                      </div>
                      <div className="flex gap-2">
                        {settings.featured_playlist_id === p.id ? (
                          <span className="bg-acid-yellow text-ink font-display px-4 py-2 border-2 border-ink">FEATURED</span>
                        ) : (
                          <button onClick={() => setFeatured(p.id)} className="bg-cream text-ink font-display px-4 py-2 border-2 border-ink hover:bg-acid-yellow transition-colors">
                            SET FEATURED
                          </button>
                        )}
                        <button onClick={() => removePlaylist(p.id)} className="bg-destructive text-cream font-display px-4 py-2 border-2 border-ink">
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!settings || settings.playlists.length === 0) && (
                    <p className="text-ink/60">No playlists yet.</p>
                  )}
                </div>
              </TabsContent>

              {/* EVENTS */}
              <TabsContent value="events">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-ink/70 font-medium">{events.length} events</p>
                  <button onClick={addEvent} className="bg-acid-yellow text-ink font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
                    + NEW EVENT
                  </button>
                </div>
                <div className="space-y-4">
                  {events.map((ev, idx) => (
                    <EventEditor
                      key={ev.id ?? ev.slug + idx}
                      event={ev}
                      onChange={(next) => setEvents(events.map((e, i) => (i === idx ? next : e)))}
                      onSave={() => saveEvent(events[idx])}
                      onDelete={() => ev.id ? deleteEvent(ev.id) : setEvents(events.filter((_, i) => i !== idx))}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* MESSAGES */}
              <TabsContent value="messages">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-ink/70 font-medium">{messages.length} messages</p>
                  <button onClick={() => downloadCsv("messages")} className="bg-acid-yellow text-ink font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
                    DOWNLOAD CSV
                  </button>
                </div>
                <input
                  type="search" value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full mb-4 bg-cream text-ink border-4 border-ink px-4 py-3 font-medium focus:outline-none focus:bg-acid-yellow"
                />
                <div className="space-y-3">
                  {filteredMessages.map((m) => (
                    <div key={m.id} className="bg-cream border-4 border-ink chunk-shadow p-5">
                      <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <div>
                          <p className="font-display text-xl text-ink">{m.name}</p>
                          <a href={`mailto:${m.email}`} className="text-magenta underline font-medium">{m.email}</a>
                        </div>
                        <span className="text-ink/60 text-sm">{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-ink/80 whitespace-pre-wrap">{m.message}</p>
                    </div>
                  ))}
                  {filteredMessages.length === 0 && (
                    <p className="text-ink/60 py-8 text-center">No messages.</p>
                  )}
                </div>
              </TabsContent>

              {/* SEO CHECKLIST */}
              <TabsContent value="seo">
                <div className="bg-cream border-4 border-ink chunk-shadow p-6 space-y-5">
                  <div>
                    <h3 className="font-display text-2xl text-ink mb-1">SEO + GEO CHECKLIST</h3>
                    <p className="text-ink/70 font-medium">
                      Manual tasks to rank for "best parties / events in Bangalore & India" on Google and AI engines (ChatGPT, Perplexity, Gemini).
                    </p>
                  </div>

                  <ChecklistGroup
                    title="SEARCH ENGINES"
                    items={[
                      "Submit https://catscandance.com/sitemap.xml to Google Search Console",
                      "Submit sitemap to Bing Webmaster Tools",
                      "Verify ownership in Google Search Console (DNS or HTML tag)",
                      "Request indexing for /, /events, /about after each big update",
                    ]}
                  />

                  <ChecklistGroup
                    title="GOOGLE BUSINESS / MAPS"
                    items={[
                      "Create / claim Google Business Profile: 'Cats Can Dance — Event Organiser, Bangalore'",
                      "Category: Event Planner + Performing Arts Group",
                      "Add photos from Episodes, hours, contact, website link",
                      "Collect 5★ reviews from attendees after each Episode",
                    ]}
                  />

                  <ChecklistGroup
                    title="LOCAL LISTINGS (INDIA)"
                    items={[
                      "List Cats Can Dance on Insider.in",
                      "List on BookMyShow Events",
                      "List on Paytm Insider",
                      "Create Resident Advisor (RA) promoter profile",
                      "List on Skiddle (international reach)",
                    ]}
                  />

                  <ChecklistGroup
                    title="BACKLINKS / PRESS"
                    items={[
                      "Pitch Rolling Stone India",
                      "Pitch Wild City (wildcity.com)",
                      "Pitch Homegrown (homegrown.co.in)",
                      "Pitch Mid-day Bangalore + Bangalore Mirror",
                      "Reach out to local music podcasts / Spotify editorial",
                    ]}
                  />

                  <ChecklistGroup
                    title="CONSISTENCY (NAP)"
                    items={[
                      "Same Name + Address + Email across IG bio, Linktree, listings",
                      "Use 'Cats Can Dance — Bangalore' wording consistently",
                      "Link back to https://catscandance.com from every listing",
                    ]}
                  />

                  <ChecklistGroup
                    title="AI / GEO READY (DONE FOR YOU)"
                    items={[
                      "✓ /llms.txt — AI crawler brand summary",
                      "✓ /llms-full.txt — long-form brand + events",
                      "✓ robots.txt allows GPTBot / ClaudeBot / PerplexityBot / Google-Extended",
                      "✓ JSON-LD: Organization, LocalBusiness, Event, FAQ, BlogPosting",
                      "✓ Geo meta tags + Bangalore address in Footer",
                    ]}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </section>
    </main>
  );
};

const EventEditor = ({
  event, onChange, onSave, onDelete,
}: {
  event: EventRow;
  onChange: (e: EventRow) => void;
  onSave: () => void;
  onDelete: () => void;
}) => {
  const lineupStr = (event.lineup ?? []).join(", ");
  return (
    <div className="bg-cream border-4 border-ink chunk-shadow p-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title" value={event.title} onChange={(v) => onChange({ ...event, title: v })} />
        <Field label="Slug" value={event.slug} onChange={(v) => onChange({ ...event, slug: v })} />
        <Field label="Date" value={event.date} onChange={(v) => onChange({ ...event, date: v })} />
        <Field label="City" value={event.city} onChange={(v) => onChange({ ...event, city: v })} />
        <Field label="Venue" value={event.venue} onChange={(v) => onChange({ ...event, venue: v })} />
        <div>
          <label className="block font-display text-sm text-ink mb-1">Status</label>
          <select
            value={event.status}
            onChange={(e) => onChange({ ...event, status: e.target.value })}
            className="w-full bg-cream text-ink border-4 border-ink px-4 py-2 font-medium focus:outline-none focus:bg-acid-yellow"
          >
            <option value="upcoming">upcoming</option>
            <option value="past">past</option>
          </select>
        </div>
        <Field label="Poster URL" value={event.poster_url ?? ""} onChange={(v) => onChange({ ...event, poster_url: v || null })} />
        <Field
          label="Sort order"
          value={String(event.sort_order)}
          onChange={(v) => onChange({ ...event, sort_order: Number(v) || 0 })}
        />
      </div>
      <div>
        <label className="block font-display text-sm text-ink mb-1">Blurb</label>
        <textarea
          rows={3} value={event.blurb}
          onChange={(e) => onChange({ ...event, blurb: e.target.value })}
          className="w-full bg-cream text-ink border-4 border-ink px-4 py-2 font-medium focus:outline-none focus:bg-acid-yellow"
        />
      </div>
      <div>
        <label className="block font-display text-sm text-ink mb-1">Lineup (comma-separated)</label>
        <input
          value={lineupStr}
          onChange={(e) => onChange({ ...event, lineup: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          className="w-full bg-cream text-ink border-4 border-ink px-4 py-2 font-medium focus:outline-none focus:bg-acid-yellow"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="bg-ink text-cream font-display px-5 py-2 hover:bg-magenta transition-colors">SAVE</button>
        <button onClick={onDelete} className="bg-destructive text-cream font-display px-5 py-2">DELETE</button>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block font-display text-sm text-ink mb-1">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-cream text-ink border-4 border-ink px-4 py-2 font-medium focus:outline-none focus:bg-acid-yellow"
    />
  </div>
);

const ChecklistGroup = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <p className="font-display text-magenta text-lg mb-2">/ {title}</p>
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-3 bg-background/50 border-2 border-ink/20 px-3 py-2">
          <span className="font-display text-ink/40 mt-0.5">▢</span>
          <span className="text-ink/85 font-medium">{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Admin;
