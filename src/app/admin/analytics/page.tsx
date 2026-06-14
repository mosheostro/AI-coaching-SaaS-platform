import { requireProfile } from "@/lib/auth";
import { getOverview, getTrafficGeo } from "@/lib/admin/metrics";
import { KpiCard, AreaChart, DonutChart, Funnel, BarChart, ChartCard, PALETTE, fmt } from "@/components/charts";

export default async function AnalyticsPage() {
  await requireProfile("admin");
  const [o, geo] = await Promise.all([getOverview(), getTrafficGeo()]);
  const k = o.kpis;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Analytics &amp; business intelligence</h1>
        <p className="text-soft text-sm">Growth, acquisition, engagement, and traffic across the platform.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Pageviews (30d)" value={k.pageviews30} spark={o.series.pageviews} />
        <KpiCard label="New signups (7d)" value={k.newRegs7} delta={k.newRegsDelta} />
        <KpiCard label="Active users" value={k.activeUsers} />
        <KpiCard label="AI completion" value={`${k.aiCompletionRate.toFixed(0)}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Registrations (30d)"><AreaChart data={o.series.registrations} height={190} /></ChartCard>
        <ChartCard title="Pageviews (30d)"><AreaChart data={o.series.pageviews} height={190} color="rgb(var(--c-gold))" fillFrom="rgb(var(--c-gold) / 0.25)" /></ChartCard>
      </div>
      <ChartCard title="Acquisition funnel"><Funnel stages={o.funnel} /></ChartCard>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Traffic sources"><DonutChart segments={o.sources.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))} /></ChartCard>
        <ChartCard title="Devices"><DonutChart segments={geo.devices.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }))} /></ChartCard>
        <ChartCard title="Top pages">
          <ul className="space-y-1.5 text-sm">
            {o.topPages.map((p) => (
              <li key={p.label} className="flex justify-between"><span className="truncate text-soft">{p.label}</span><span className="tabular-nums">{fmt(p.value)}</span></li>
            ))}
          </ul>
        </ChartCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top countries">
          <ul className="space-y-2">
            {geo.countries.map((c, i) => {
              const total = geo.countries.reduce((a, b) => a + b.value, 0) || 1;
              return (
                <li key={c.label}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-soft">{c.label}</span><span className="tabular-nums">{((c.value / total) * 100).toFixed(0)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-line/50"><div className="h-full rounded-full" style={{ width: `${(c.value / total) * 100}%`, background: PALETTE[i % PALETTE.length] }} /></div>
                </li>
              );
            })}
          </ul>
        </ChartCard>
        <ChartCard title="Languages"><BarChart data={geo.locales.map((l) => ({ label: l.label.toUpperCase(), value: l.value }))} height={200} /></ChartCard>
      </div>
    </div>
  );
}
