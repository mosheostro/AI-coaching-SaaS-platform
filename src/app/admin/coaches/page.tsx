import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { KpiCard, ChartCard } from "@/components/charts";
import { CoachesTable, type CoachRow } from "./coaches-table";

export default async function CoachesPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const [profRes, cpRes, ccRes, sessRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, status, created_at").eq("role", "coach").limit(500),
    supabase.from("coach_profiles").select("id, approval_status, rating, rating_count"),
    supabase.from("coach_clients").select("coach_id").eq("status", "active"),
    supabase.from("coaching_sessions").select("coach_id, status"),
  ]);
  const cp = new Map((cpRes.data ?? []).map((c) => [c.id, c]));
  const clientCounts = new Map<string, number>();
  for (const r of ccRes.data ?? []) clientCounts.set(r.coach_id, (clientCounts.get(r.coach_id) ?? 0) + 1);
  const sessCounts = new Map<string, number>();
  for (const r of sessRes.data ?? []) if (r.status === "completed") sessCounts.set(r.coach_id, (sessCounts.get(r.coach_id) ?? 0) + 1);

  const rows: CoachRow[] = (profRes.data ?? []).map((p) => ({
    id: p.id, full_name: p.full_name, email: p.email, status: p.status,
    approval_status: cp.get(p.id)?.approval_status ?? "approved",
    rating: cp.get(p.id)?.rating ?? null, rating_count: cp.get(p.id)?.rating_count ?? 0,
    clients: clientCounts.get(p.id) ?? 0, sessions: sessCounts.get(p.id) ?? 0,
  }));

  const pending = rows.filter((r) => r.approval_status === "pending").length;
  const avgRating = rows.filter((r) => r.rating).reduce((s, r) => s + (r.rating ?? 0), 0) / (rows.filter((r) => r.rating).length || 1);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Coach management</h1>
        <p className="text-soft text-sm">Approvals, performance, and client load.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total coaches" value={rows.length} />
        <KpiCard label="Pending approval" value={pending} />
        <KpiCard label="Avg. rating" value={`${avgRating.toFixed(1)}/5`} />
        <KpiCard label="Active sessions done" value={rows.reduce((s, r) => s + r.sessions, 0)} />
      </div>
      <ChartCard title="Coaches"><CoachesTable rows={rows} /></ChartCard>
    </div>
  );
}
