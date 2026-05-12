import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Artist = Record<string, any>;

export default function ArtistsAdminTab({ password }: { password: string }) {
  const [tab, setTab] = useState<"approved" | "pending" | "submissions" | "bookings">("approved");
  const [items, setItems] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Artist | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const action = tab === "submissions" ? "submissions" : tab === "bookings" ? "bookings" : "list";
      const res = await fetch(`https://zyilevwfuhymzhezexep.supabase.co/functions/v1/admin-artists?action=${action}`, {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Load failed");
      let rows = data.items as Artist[];
      if (tab === "approved") rows = rows.filter((r) => r.status === "approved");
      if (tab === "pending") rows = rows.filter((r) => r.status === "pending");
      setItems(rows);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const call = async (init: RequestInit & { qs?: string }) => {
    const res = await fetch(`https://zyilevwfuhymzhezexep.supabase.co/functions/v1/admin-artists${init.qs ?? ""}`, {
      ...init,
      headers: { ...init.headers, "x-admin-password": password, "content-type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Request failed");
    return data;
  };

  const enrich = async (id: string) => {
    try {
      toast.message("Enriching with Firecrawl…");
      const res = await fetch(`https://zyilevwfuhymzhezexep.supabase.co/functions/v1/artist-enrich`, {
        method: "POST",
        headers: { "x-admin-password": password, "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enrich failed");
      if (Object.keys(data.patch ?? {}).length === 0) {
        toast.message("Nothing new found.");
        return;
      }
      await call({ method: "PATCH", body: JSON.stringify({ id, patch: data.patch }) });
      toast.success(`Updated: ${Object.keys(data.patch).join(", ")}`);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const setStatus = async (id: string, status: string) => {
    try { await call({ method: "PATCH", body: JSON.stringify({ id, patch: { status } }) }); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string, table?: string) => {
    if (!confirm("Delete?")) return;
    try { await call({ method: "DELETE", body: JSON.stringify({ id, table }) }); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const approveSubmission = async (id: string) => {
    try { await call({ method: "POST", qs: "?action=approve_submission", body: JSON.stringify({ id }) }); toast.success("Approved"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { id, ...patch } = editing;
    try { await call({ method: "PATCH", body: JSON.stringify({ id, patch }) }); setEditing(null); load(); toast.success("Saved"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["approved","pending","submissions","bookings"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`font-display text-xs px-3 py-1.5 border-4 border-ink uppercase ${tab===t?"bg-ink text-cream":"bg-cream text-ink"}`}>{t}</button>
        ))}
      </div>

      <div className="bg-cream border-4 border-ink p-3">
        <p className="text-xs font-display text-ink/60 mb-2">Sources to find more artists: RA India, Wild City, Boiler Room India tag, Magnetic Fields / Sunburn / Echoes of Earth lineups, Krunk / Qilla / Consolidate / Knocturnal rosters.</p>
      </div>

      {loading && <p className="text-sm text-ink/60">Loading…</p>}

      {tab === "bookings" ? (
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id} className="bg-cream border-4 border-ink p-3 text-sm">
              <p className="font-display">{b.artist_name}</p>
              <p>{b.requester_email} · {b.requester_phone ?? "—"}</p>
              <p className="text-ink/70">{b.purpose}</p>
              <p className="text-xs text-ink/50">verified: {b.verified_at ? "yes" : "no"} · forward: {b.forward_requested ? "yes" : "no"} · {new Date(b.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((a) => (
            <div key={a.id} className="bg-cream border-4 border-ink p-3 flex flex-wrap items-center gap-3">
              {a.photo_url && <img src={a.photo_url} alt="" className="w-12 h-12 object-cover border-2 border-ink" />}
              <div className="flex-1 min-w-[200px]">
                <p className="font-display uppercase">{a.name} <span className="text-xs text-ink/50">{a.status}</span></p>
                <p className="text-xs text-ink/60">{a.based_city ?? a.from_city ?? ""} · {(a.genres ?? []).join(", ")}</p>
                {tab === "submissions" && <p className="text-xs text-ink/50">by {a.submitter_email} ({a.submitter_role})</p>}
              </div>
              <div className="flex flex-wrap gap-1">
                {tab === "submissions" ? (
                  <>
                    <Button size="sm" onClick={() => approveSubmission(a.id)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(a.id, "submission")}>Delete</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => enrich(a.id)}>Enrich</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing({ ...a })}>Edit</Button>
                    {a.status !== "approved" && <Button size="sm" onClick={() => setStatus(a.id, "approved")}>Approve</Button>}
                    {a.status === "approved" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "pending")}>Unpublish</Button>}
                    <Button size="sm" variant="destructive" onClick={() => remove(a.id)}>Delete</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-ink/70 z-50 flex items-center justify-center p-4">
          <div className="bg-cream border-4 border-ink max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 space-y-2">
            <h3 className="font-display text-xl uppercase">Edit {editing.name}</h3>
            {(["name","members","from_city","based_city","bio","photo_url","instagram","soundcloud","bandcamp","spotify","website","booking_email","manager_email","labels"] as const).map((k) => (
              <label key={k} className="block">
                <span className="block text-xs font-display uppercase text-ink/70">{k}</span>
                {k === "bio" ? (
                  <Textarea value={editing[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} className="border-4 border-ink" />
                ) : (
                  <Input value={editing[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} className="border-4 border-ink" />
                )}
              </label>
            ))}
            <label className="block">
              <span className="block text-xs font-display uppercase text-ink/70">genres (comma)</span>
              <Input value={(editing.genres ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, genres: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="border-4 border-ink" />
            </label>
            <label className="block">
              <span className="block text-xs font-display uppercase text-ink/70">festivals (comma)</span>
              <Input value={(editing.festivals ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, festivals: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="border-4 border-ink" />
            </label>
            <div className="flex gap-2 pt-2">
              <Button onClick={saveEdit}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
