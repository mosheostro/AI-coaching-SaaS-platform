import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { StatCard, EmptyState } from "@/components/ui";

export default async function ClientDashboard() {
  const profile = await requireProfile("client");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const [openTasksRes, doneRes, nextSessionRes, progressRes] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("client_id", profile.id)
        .in("status", ["assigned", "in_progress", "returned"]),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("client_id", profile.id)
        .eq("status", "approved"),
      supabase
        .from("coaching_sessions")
        .select("title, scheduled_at")
        .eq("client_id", profile.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("progress_metrics")
        .select("metric_key, value, recorded_at")
        .eq("client_id", profile.id)
        .order("recorded_at", { ascending: false })
        .limit(10),
    ]);

  const next = nextSessionRes.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {t.client.welcome}, {profile.full_name.split(" ")[0]}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t.client.openTasks} value={openTasksRes.count ?? 0} />
        <StatCard label={t.client.completedTasks} value={doneRes.count ?? 0} />
        <div className="card">
          <p className="text-slate-500">{t.client.nextSession}</p>
          {next ? (
            <>
              <p className="text-lg font-semibold mt-1">{next.title}</p>
              <p className="text-slate-500">
                {new Date(next.scheduled_at).toLocaleString(locale)}
              </p>
            </>
          ) : (
            <p className="text-slate-400 mt-1">{t.client.noSessions}</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-semibold mb-3">{t.nav.progress}</h2>
        {!progressRes.data || progressRes.data.length === 0 ? (
          <EmptyState message="—" />
        ) : (
          <div className="card divide-y divide-slate-100 p-0">
            {progressRes.data.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-slate-600">{m.metric_key}</span>
                <span className="font-medium">{m.value}</span>
                <span className="text-slate-400 text-xs">
                  {new Date(m.recorded_at).toLocaleDateString(locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
