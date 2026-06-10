import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n";
import { Avatar, StatCard } from "@/components/ui";

export default async function AdminPage() {
  await requireProfile("admin");
  const { t, locale } = await getDictionary();
  const supabase = await createClient();

  const [totalRes, coachRes, clientRes, paymentsRes, recentRes] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "coach"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "client"),
      supabase
        .from("payments")
        .select("amount_cents")
        .eq("status", "succeeded"),
      supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const revenueCents = (paymentsRes.data ?? []).reduce(
    (sum, p) => sum + (p.amount_cents ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.admin.title}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.admin.totalUsers} value={totalRes.count ?? 0} />
        <StatCard label={t.admin.coaches} value={coachRes.count ?? 0} />
        <StatCard label={t.admin.clients} value={clientRes.count ?? 0} />
        <StatCard
          label={t.admin.revenue}
          value={`$${(revenueCents / 100).toFixed(2)}`}
        />
      </div>

      <section>
        <h2 className="font-semibold mb-3">{t.admin.recentUsers}</h2>
        <div className="card divide-y divide-slate-100 p-0">
          {(recentRes.data ?? []).map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={u.full_name} />
              <div className="flex-1">
                <p className="font-medium">{u.full_name || u.email}</p>
                <p className="text-slate-500">{u.email}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-600">{u.role}</span>
              <span className="text-slate-400 text-xs">
                {new Date(u.created_at).toLocaleDateString(locale)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
