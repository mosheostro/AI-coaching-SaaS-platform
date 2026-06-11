import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { StatCard, EmptyState, ProgressBars } from "@/components/ui";
import { EnergySphere } from "@/components/energy-sphere";
import { Tilt } from "@/components/tilt";

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
        .limit(12),
    ]);

  const next = nextSessionRes.data;
  const metrics = (progressRes.data ?? []).slice().reverse();

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-between overflow-visible">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 -top-16 opacity-30 md:opacity-50"
        >
          <EnergySphere size={180} />
        </div>
        <h1 className="relative text-2xl font-semibold">
          {t.client.welcome}, {profile.full_name.split(" ")[0]}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t.client.openTasks} value={openTasksRes.count ?? 0} icon="✎" />
        <StatCard label={t.client.completedTasks} value={doneRes.count ?? 0} icon="✦" />
        <Tilt className="card card-hover relative overflow-hidden">
          <p className="text-soft">{t.client.nextSession}</p>
          {next ? (
            <>
              <p className="mt-1 text-lg font-semibold">{next.title}</p>
              <p className="text-soft">
                {new Date(next.scheduled_at).toLocaleString(locale)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-soft/70">{t.client.noSessions}</p>
          )}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </Tilt>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">{t.nav.progress}</h2>
        {metrics.length === 0 ? (
          <EmptyState message={t.client.noTasks} />
        ) : (
          <ProgressBars
            data={metrics.map((m) => ({
              label: m.metric_key,
              value: Number(m.value),
              hint: new Date(m.recorded_at).toLocaleDateString(locale, {
                day: "numeric",
                month: "short",
              }),
            }))}
          />
        )}
      </section>
    </div>
  );
}
