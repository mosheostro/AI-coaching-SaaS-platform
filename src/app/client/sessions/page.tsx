import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { EmptyState, StatusBadge } from "@/components/ui";

export default async function ClientSessionsPage() {
  const profile = await requireProfile("client");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select("*, coach:profiles!coaching_sessions_coach_id_fkey(full_name)")
    .eq("client_id", profile.id)
    .order("scheduled_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.nav.sessions}</h1>

      {!sessions || sessions.length === 0 ? (
        <EmptyState message={t.client.noSessions} />
      ) : (
        <div className="card divide-y divide-slate-100 p-0">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-slate-500">
                  {(s.coach as { full_name: string } | null)?.full_name} ·{" "}
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
