import Link from "next/link";
import { getDictionary } from "@/i18n";
import { getOverview } from "@/lib/admin/metrics";
import { Avatar } from "@/components/ui";
import {
  KpiCard, AreaChart, BarChart, DonutChart, Funnel, ChartCard, fmt, PALETTE,
} from "@/components/charts";

export default async function AdminOverview() {
  const { locale } = await getDictionary();
  const o = await getOverview();
  const k = o.kpis;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Executive overview</h1>
          <p className="text-soft text-sm">Everything happening across the platform, at a glance.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-soft">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total users" value={k.totalUsers} delta={k.newRegsDelta} spark={o.series.registrations} />
        <KpiCard label="Active (30d)" value={k.activeUsers} />
        <KpiCard label="Coaches" value={k.coaches} />
        <KpiCard label="Clients" value={k.clients} />
        <KpiCard label="AI sessions" value={k.aiSessions} spark={o.series.aiSessions} accent="rgb(var(--c-gold))" />
        <KpiCard label="Human sessions" value={k.humanSessions} />
        <KpiCard label="New signups (7d)" value={k.newRegs7} delta={k.newRegsDelta} />
        <KpiCard label="Open leads" value={k.leadsOpen} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Registrations · last 30 days" action={<span className="text-xs text-soft">{fmt(o.series.registrations.reduce((a, b) => a + b, 0))} total</span>}>
          <AreaChart data={o.series.registrations} height={200} />
        </ChartCard>
        <ChartCard title="Traffic · pageviews (30d)" action={<span className="text-xs text-soft">{fmt(k.pageviews30)} views</span>}>
          <AreaChart data={o.series.pageviews} height={200} color="rgb(var(--c-gold))" fillFrom="rgb(var(--c-gold) / 0.25)" />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="User roles">
          <DonutChart segments={o.roleSplit} />
        </ChartCard>
        <ChartCard title="AI session outcomes">
          <DonutChart segments={o.aiStatus.map((s, i) => ({ ...s, color: PALETTE[i] }))} />
        </ChartCard>
        <ChartCard title="AI completion">
          <div className="flex h-full flex-col justify-center gap-2">
            <p className="font-heading text-4xl font-semibold">{k.aiCompletionRate.toFixed(0)}%</p>
            <p className="text-sm text-soft">sessions completed</p>
            <div className="mt-2 space-y-1 text-sm">
              <Row label="Avg. satisfaction" value={`${k.avgRating.toFixed(1)} / 5`} />
              <Row label="Avg. messages / session" value={k.avgMsgs.toFixed(1)} />
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Acquisition funnel · last 30 days">
        <Funnel stages={o.funnel} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Most requested AI topics">
          {o.topTopics.length ? <BarChart data={o.topTopics} height={200} /> : <Empty />}
        </ChartCard>
        <ChartCard title="Traffic sources">
          <ul className="space-y-2">
            {o.sources.length ? o.sources.map((s, i) => {
              const total = o.sources.reduce((a, b) => a + b.value, 0) || 1;
              return (
                <li key={s.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-soft">{s.label}</span>
                    <span className="tabular-nums">{((s.value / total) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-line/50">
                    <div className="h-full rounded-full" style={{ width: `${(s.value / total) * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                </li>
              );
            }) : <Empty />}
          </ul>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Recent registrations" action={<Link href="/admin/users" className="text-xs text-sage-deep hover:underline">View all</Link>}>
            <div className="divide-y divide-line/60">
              {o.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-2.5">
                  <Avatar name={u.full_name || u.email} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.full_name || u.email}</p>
                    <p className="truncate text-xs text-soft">{u.email}</p>
                  </div>
                  <span className="badge bg-sage/15 text-sage-deep capitalize">{u.role}</span>
                  <span className="hidden text-xs text-soft sm:block">{new Date(u.created_at).toLocaleDateString(locale)}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
        <ChartCard title="Alerts" action={<Link href="/admin/notifications" className="text-xs text-sage-deep hover:underline">All</Link>}>
          <ul className="space-y-3">
            {o.alerts.length ? o.alerts.map((a) => (
              <li key={a.id} className="flex gap-2.5">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.kind === "alert" || a.kind === "warning" ? "bg-amber-500" : a.kind === "lead" ? "bg-sage" : "bg-soft/50"}`} />
                <div>
                  <p className="text-sm font-medium leading-tight">{a.title}</p>
                  {a.body && <p className="text-xs text-soft">{a.body}</p>}
                </div>
              </li>
            )) : <Empty />}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-soft">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
function Empty() {
  return <p className="py-8 text-center text-sm text-soft">No data yet — run the demo seed to populate.</p>;
}
