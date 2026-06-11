import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { StatCard, StatusBadge, EmptyState } from "@/components/ui";
import { EnergySphere } from "@/components/energy-sphere";

export default async function CoachDashboard() {
  const profile = await requireProfile("coach");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const [clientsRes, sessionsRes, reviewsRes] = await Promise.all([
    supabase
      .from("coach_clients")
      .select("id", { count: "exact", head: true })
      .eq("coach_id", profile.id)
      .eq("status", "active"),
    supabase
      .from("coaching_sessions")
      .select("*, client:profiles!coaching_sessions_client_id_fkey(full_name)")
      .eq("coach_id", profile.id)
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at")
      .limit(5),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("coach_id", profile.id)
      .eq("status", "submitted"),
  ]);

  const sessions = sessionsRes.data ?? [];

  return (
    <div className="space-y-6">
      {/* Greeting with ambient sphere */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-visible">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 -top-16 opacity-30 md:opacity-50"
        >
          <EnergySphere size={180} />
        </div>
        <h1 className="relative text-2xl font-semibold">
          {t.coach.welcome}, {profile.full_name.split(" ")[0]}
        </h1>
        <div className="relative flex gap-2">
          <Link href="/coach/sessions" className="btn-primary">
            {t.coach.newSession}
          </Link>
          <Link href="/coach/tasks" className="btn-secondary">
            {t.coach.assignTask}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t.coach.activeClients} value={clientsRes.count ?? 0} icon="✦" />
        <StatCard label={t.coach.upcomingSessions} value={sessions.length} icon="◷" />
        <StatCard label={t.coach.pendingReviews} value={reviewsRes.count ?? 0} icon="✎" />
      </div>

      <section>
        <h2 className="mb-3 font-semibold">{t.coach.upcomingSessions}</h2>
        {sessions.length === 0 ? (
          <EmptyState message={t.coach.noSessions} />
        ) : (
          <div className="card divide-y divide-line/60 p-0">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-5 py-3 transition hover:bg-canvas2/50"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-soft">
                    {(s.client as { full_name: string } | null)?.full_name} ·{" "}
                    {new Date(s.scheduled_at).toLocaleString(locale)} ·{" "}
                    {s.duration_min} {t.common.minutes}
                  </p>
                </div>
                <StatusBadge
                  status={s.status}
                  label={t.common.statuses[s.status as keyof typeof t.common.statuses]}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
