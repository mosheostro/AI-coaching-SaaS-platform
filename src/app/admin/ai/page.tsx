import { requireProfile } from "@/lib/auth";
import { getOverview } from "@/lib/admin/metrics";
import { KpiCard, AreaChart, BarChart, DonutChart, ChartCard, PALETTE } from "@/components/charts";

export default async function AiAnalyticsPage() {
  await requireProfile("admin");
  const o = await getOverview();
  const k = o.kpis;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">AI coach analytics</h1>
        <p className="text-soft text-sm">Usage, completion, satisfaction, and topic trends for the AI coach.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total AI sessions" value={k.aiSessions} spark={o.series.aiSessions} accent="rgb(var(--c-gold))" />
        <KpiCard label="Completion rate" value={`${k.aiCompletionRate.toFixed(0)}%`} />
        <KpiCard label="Avg. satisfaction" value={`${k.avgRating.toFixed(1)}/5`} />
        <KpiCard label="Avg. messages" value={k.avgMsgs.toFixed(1)} />
      </div>
      <ChartCard title="AI sessions · last 30 days">
        <AreaChart data={o.series.aiSessions} height={200} color="rgb(var(--c-gold))" fillFrom="rgb(var(--c-gold) / 0.25)" />
      </ChartCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Most common coaching topics">
          {o.topTopics.length ? <BarChart data={o.topTopics} height={220} /> : <p className="py-8 text-center text-soft">No data — run the demo seed.</p>}
        </ChartCard>
        <ChartCard title="Session outcomes">
          <DonutChart segments={o.aiStatus.map((s, i) => ({ ...s, color: PALETTE[i] }))} />
        </ChartCard>
      </div>
    </div>
  );
}
