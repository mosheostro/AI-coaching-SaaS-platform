import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { StatCard, StatusBadge, EmptyState } from "@/components/ui";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t.coach.welcome}, {profile.full_name.split(" ")[0]}
        </h1>
        <div className="flex gap-2">
          <Link href="/coach/sessions" className="btn-primary">
            {t.coach.newSession}
          </Link>
          <Link href="/coach/tasks" className="btn-secondary">
            {t.coach.assignTask}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t.coach.activeClients} value={clientsRes.count ?? 0} />
        <StatCard label={t.coach.upcomingSessions} value={sessions.length} />
        <StatCard label={t.coach.pendingReviews} value={reviewsRes.count ?? 0} />
      </div>

      <section>
        <h2 className="font-semibold mb-3">{t.coach.upcomingSessions}</h2>
        {sessions.length === 0 ? (
          <EmptyState message={t.coach.noSessions} />
        ) : (
          <div className="card divide-y divide-slate-100 p-0">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-slate-500">
                    {(s.client as { full_name: string } | null)?.full_name} ·{" "}
                    {new Date(s.scheduled_at).toLocaleString(locale)} ·{" "}
                    {s.duration_min} {t.common.minutes}
                  </p>
                </div>
                <StatusBadge status={s.status} label={t.common.statuses[s.status as keyof typeof t.common.statuses]} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
