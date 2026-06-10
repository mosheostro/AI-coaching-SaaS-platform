import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { EmptyState, StatusBadge } from "@/components/ui";
import { CreateSessionForm } from "./create-session-form";

export default async function CoachSessionsPage() {
  const profile = await requireProfile("coach");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const [{ data: links }, { data: sessions }] = await Promise.all([
    supabase
      .from("coach_clients")
      .select("client:profiles!coach_clients_client_id_fkey(id, full_name)")
      .eq("coach_id", profile.id)
      .eq("status", "active"),
    supabase
      .from("coaching_sessions")
      .select("*, client:profiles!coaching_sessions_client_id_fkey(full_name)")
      .eq("coach_id", profile.id)
      .order("scheduled_at", { ascending: false })
      .limit(50),
  ]);

  const clients =
    (links ?? [])
      .map((l) => l.client as unknown as { id: string; full_name: string } | null)
      .filter((c): c is { id: string; full_name: string } => !!c) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.nav.sessions}</h1>

      <CreateSessionForm
        clients={clients}
        labels={{
          title: t.common.title,
          date: t.common.date,
          duration: t.common.duration,
          submit: t.coach.newSession,
          client: t.nav.clients,
        }}
      />

      {!sessions || sessions.length === 0 ? (
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
              <StatusBadge
                status={s.status}
                label={t.common.statuses[s.status as keyof typeof t.common.statuses]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
