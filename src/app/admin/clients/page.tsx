import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { KpiCard, ChartCard } from "@/components/charts";
import { Avatar } from "@/components/ui";

export default async function ClientsPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const [profRes, sessRes, aiRes, progRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, status, created_at, last_seen_at").eq("role", "client").order("created_at", { ascending: false }).limit(500),
    supabase.from("coaching_sessions").select("client_id, status"),
    supabase.from("ai_sessions").select("user_id"),
    supabase.from("progress_metrics").select("client_id"),
  ]);
  const c = (arr: { [k: string]: string }[], key: string) => { const m = new Map<string, number>(); for (const r of arr) m.set(r[key], (m.get(r[key]) ?? 0) + 1); return m; };
  const sess = c(sessRes.data ?? [], "client_id");
  const ai = c(aiRes.data ?? [], "user_id");
  const prog = c(progRes.data ?? [], "client_id");
  const clients = profRes.data ?? [];
  const active = clients.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Client management</h1>
        <p className="text-soft text-sm">Profiles, session history, AI usage, and progress.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total clients" value={clients.length} />
        <KpiCard label="Active" value={active} />
        <KpiCard label="With AI usage" value={[...ai.keys()].filter((id) => clients.some((c2) => c2.id === id)).length} />
        <KpiCard label="Tracking progress" value={prog.size} />
      </div>
      <ChartCard title="Clients">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-soft">
              <th className="p-3 text-start font-medium">Client</th><th className="p-3 text-start font-medium">Status</th>
              <th className="p-3 text-start font-medium">Sessions</th><th className="p-3 text-start font-medium">AI sessions</th>
              <th className="p-3 text-start font-medium">Progress logs</th><th className="p-3 text-start font-medium">Last seen</th>
            </tr></thead>
            <tbody>
              {clients.map((p) => (
                <tr key={p.id} className="border-b border-line/50 last:border-0">
                  <td className="p-3"><div className="flex items-center gap-2.5"><Avatar name={p.full_name || p.email} /><div className="min-w-0"><p className="truncate font-medium">{p.full_name || "—"}</p><p className="truncate text-xs text-soft">{p.email}</p></div></div></td>
                  <td className="p-3"><span className={`badge ${p.status === "active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>{p.status}</span></td>
                  <td className="p-3 tabular-nums">{sess.get(p.id) ?? 0}</td>
                  <td className="p-3 tabular-nums">{ai.get(p.id) ?? 0}</td>
                  <td className="p-3 tabular-nums">{prog.get(p.id) ?? 0}</td>
                  <td className="p-3 text-soft">{p.last_seen_at ? new Date(p.last_seen_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-soft">No clients.</td></tr>}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
