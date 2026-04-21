import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Nav from "@/components/Nav";
import SEO from "@/components/SEO";

type Signup = { id: string; email: string; source: string | null; created_at: string };

const PASS_KEY = "ccd_admin_pass";

const Admin = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASS_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [search, setSearch] = useState("");

  const fetchSignups = async (pwd: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-signups", {
        headers: { "x-admin-password": pwd },
      });
      if (error || (data as any)?.error) throw new Error("auth");
      setSignups(((data as any)?.signups ?? []) as Signup[]);
      setAuthed(true);
      sessionStorage.setItem(PASS_KEY, pwd);
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
    if (stored) fetchSignups(stored);
  }, []);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    fetchSignups(password);
  };

  const onLogout = () => {
    sessionStorage.removeItem(PASS_KEY);
    setAuthed(false);
    setSignups([]);
    setPassword("");
  };

  const downloadCsv = async () => {
    const pwd = sessionStorage.getItem(PASS_KEY) ?? "";
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${projectUrl}/functions/v1/admin-signups?format=csv`, {
      headers: {
        "x-admin-password": pwd,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    });
    if (!res.ok) {
      toast.error("Could not download CSV");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `early-access-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = signups.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()),
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
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-cream text-ink border-4 border-ink px-4 py-3 font-display text-lg focus:outline-none focus:bg-acid-yellow"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-ink text-cream font-display text-xl py-3 hover:bg-magenta transition-colors disabled:opacity-60"
              >
                {busy ? "CHECKING…" : "UNLOCK"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display text-4xl md:text-5xl text-ink">EARLY ACCESS</h1>
                <p className="text-ink/70 font-medium">{signups.length} total signups</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadCsv} className="bg-acid-yellow text-ink font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
                  DOWNLOAD CSV
                </button>
                <button onClick={onLogout} className="bg-cream text-ink font-display px-5 py-2 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform">
                  LOG OUT
                </button>
              </div>
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              className="w-full mb-4 bg-cream text-ink border-4 border-ink px-4 py-3 font-medium focus:outline-none focus:bg-acid-yellow"
            />

            <div className="border-4 border-ink chunk-shadow bg-cream overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-ink text-cream font-display">
                  <tr>
                    <th className="px-4 py-3">EMAIL</th>
                    <th className="px-4 py-3">SOURCE</th>
                    <th className="px-4 py-3">SIGNED UP</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t-2 border-ink/20">
                      <td className="px-4 py-3 font-medium">{s.email}</td>
                      <td className="px-4 py-3 text-ink/70">{s.source ?? "—"}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-ink/60">No signups yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Admin;
