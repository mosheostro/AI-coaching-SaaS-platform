// Zero-dependency, theme-aware SVG charts. Server-renderable (no hooks).
// Colors come from CSS vars so they adapt to light/dark/luxe themes.

import type { ReactNode } from "react";

const SAGE = "rgb(var(--c-accent))";
const SAGE_DEEP = "rgb(var(--c-accent-deep))";
const GOLD = "rgb(var(--c-gold))";
const MUTED = "rgb(var(--c-muted))";
const LINE = "rgb(var(--c-border))";

export const PALETTE = [
  SAGE,
  GOLD,
  SAGE_DEEP,
  "rgb(var(--c-accent) / 0.55)",
  "rgb(var(--c-gold) / 0.55)",
  "rgb(var(--c-muted) / 0.5)",
];

export function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(n));
}

/* ------------------------------- KPI card ------------------------------- */
export function KpiCard({
  label,
  value,
  delta,
  spark,
  icon,
  accent = SAGE,
}: {
  label: string;
  value: string | number;
  delta?: number;
  spark?: number[];
  icon?: ReactNode;
  accent?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="card card-hover relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <p className="text-soft text-sm">{label}</p>
        {icon && <span className="text-sage/70">{icon}</span>}
      </div>
      <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">
        {typeof value === "number" ? fmt(value) : value}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {up ? <path d="M5 15l7-7 7 7" /> : <path d="M5 9l7 7 7-7" />}
            </svg>
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {spark && spark.length > 1 && (
          <Sparkline data={spark} color={accent} className="ms-auto" />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sage/40 to-transparent" />
    </div>
  );
}

export function Sparkline({
  data,
  color = SAGE,
  width = 80,
  height = 24,
  className = "",
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((d, i) => `${i * step},${height - ((d - min) / span) * height}`).join(" ");
  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------ Area chart ------------------------------ */
export function AreaChart({
  data,
  labels,
  height = 200,
  color = SAGE,
  fillFrom = "rgb(var(--c-accent) / 0.28)",
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  fillFrom?: string;
}) {
  const W = 600;
  const H = height;
  const pad = 8;
  const max = Math.max(...data, 1);
  const step = (W - pad * 2) / Math.max(data.length - 1, 1);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const x = (i: number) => pad + i * step;
  const line = data.map((d, i) => `${x(i)},${y(d)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${x(data.length - 1)},${H - pad}`;
  const gid = `ag-${color.replace(/\W/g, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor="rgb(var(--c-accent) / 0)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={H * g} y2={H * g} stroke={LINE} strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      ))}
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------ Bar chart ------------------------------- */
export function BarChart({
  data,
  height = 200,
  color = SAGE,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[10px] text-soft opacity-0 transition group-hover:opacity-100">{fmt(d.value)}</span>
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%`, background: `linear-gradient(to top, ${color}, rgb(var(--c-gold) / 0.7))` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="max-w-full truncate text-[9px] text-soft/70">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Donut chart ----------------------------- */
export function DonutChart({
  segments,
  size = 168,
}: {
  segments: { label: string; value: number; color?: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE} strokeWidth="14" opacity="0.4" />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color ?? PALETTE[i % PALETTE.length]}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-ink font-heading" fontSize="22" fontWeight="600">
          {fmt(total)}
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} />
            <span className="text-soft">{s.label}</span>
            <span className="ms-auto font-medium tabular-nums">{fmt(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------- Funnel --------------------------------- */
export function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const top = stages[0]?.value || 1;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = (s.value / top) * 100;
        const conv = i === 0 ? 100 : (s.value / top) * 100;
        const drop = i === 0 ? 0 : 100 - (s.value / (stages[i - 1].value || 1)) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-36 shrink-0 truncate text-sm text-soft">{s.label}</span>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-line/40">
              <div
                className="flex h-full items-center justify-end rounded-lg px-2 text-xs font-medium text-canvas"
                style={{ width: `${Math.max(pct, 6)}%`, background: `linear-gradient(90deg, ${SAGE_DEEP}, ${SAGE})` }}
              >
                {fmt(s.value)}
              </div>
            </div>
            <span className="w-16 text-end text-xs tabular-nums text-soft">{conv.toFixed(0)}%</span>
            <span className="w-16 text-end text-xs tabular-nums text-red-500/80">{i ? `-${drop.toFixed(0)}%` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------- Section card wrapper ------------------------- */
export function ChartCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
