import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { KpiCard, BarChart, ChartCard } from "@/components/charts";

const TYPE_LABEL: Record<string, string> = {
  failed_login: "Failed login", lockout: "Account lockout",
  password_reset: "Password reset", login: "Login", suspicious: "Suspicious",
};

export default async function SecurityPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [eventsRes, auditRes] = await Promise.all([
    supabase.from("security_events").select("type, email, ip, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(200),
    supabase.from("admin_audit_log").select("action, actor_email, target_type, target_id, created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const events = eventsRes.data ?? [];
  const audit = auditRes.data ?? [];
  const count = (t: string) => events.filter((e) => e.type === t).length;

  // failed logins per day (14d)
  const days: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString(undefined, { day: "numeric" }), value: events.filter((e) => e.type === "failed_login" && e.created_at.slice(0, 10) === key).length });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Security center</h1>
        <p className="text-soft text-sm">Authentication events, lockouts, and the admin audit trail.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Failed logins (30d)" value={count("failed_login")} />
        <KpiCard label="Lockouts" value={count("lockout")} />
        <KpiCard label="Password resets" value={count("password_reset")} />
        <KpiCard label="Successful logins" value={count("login")} />
      </div>
      <ChartCard title="Failed logins · last 14 days"><BarChart data={days} height={160} color="rgb(239 68 68)" /></ChartCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Recent security events">
          <div className="max-h-96 overflow-y-auto divide-y divide-line/60">
            {events.slice(0, 60).map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{TYPE_LABEL[e.type] ?? e.type}</p>
                  <p className="truncate text-xs text-soft">{e.email} · {e.ip}</p>
                </div>
                <span className="shrink-0 text-xs text-soft">{new Date(e.created_at).toLocaleString()}</span>
              </div>
            ))}
            {events.length === 0 && <p className="py-8 text-center text-soft">No events.</p>}
          </div>
        </ChartCard>
        <ChartCard title="Admin audit log">
          <div className="max-h-96 overflow-y-auto divide-y divide-line/60">
            {audit.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{a.action}</p>
                  <p className="truncate text-xs text-soft">{a.actor_email} · {a.target_type}</p>
                </div>
                <span className="shrink-0 text-xs text-soft">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
            {audit.length === 0 && <p className="py-8 text-center text-soft">No admin actions logged yet.</p>}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
