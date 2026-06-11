import type { SessionStatus, TaskStatus } from "@/lib/types";
import { Counter } from "@/components/motion";
import { Tilt } from "@/components/tilt";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  return (
    <Tilt className="card card-hover relative overflow-hidden">
      {icon && (
        <span
          aria-hidden
          className="pointer-events-none absolute -end-2 -top-3 font-heading text-6xl text-sage/10"
        >
          {icon}
        </span>
      )}
      <p className="text-soft">{label}</p>
      <p className="mt-1 font-heading text-3xl font-semibold">
        {typeof value === "number" ? <Counter value={value} /> : value}
      </p>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sage/40 to-transparent" />
    </Tilt>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-12 text-center text-soft">
      <span className="animate-shimmer text-2xl text-sage/50">✦</span>
      {message}
    </div>
  );
}

/** Lightweight bar visualization for progress metrics — pure CSS. */
export function ProgressBars({
  data,
}: {
  data: { label: string; value: number; hint?: string }[];
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="card">
      <div className="flex h-32 items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div
              className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-sage/50 to-sage transition-all duration-500 group-hover:to-gold"
              style={{ height: `${Math.max((d.value / max) * 100, 6)}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="max-w-full truncate text-[9px] text-soft/70">{d.hint ?? d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-sage/15 text-sage-deep",
  completed: "bg-sage/25 text-sage-deep",
  cancelled: "bg-line/60 text-soft",
  no_show: "bg-gold/15 text-gold",
  assigned: "bg-sage/15 text-sage-deep",
  in_progress: "bg-gold/15 text-gold",
  submitted: "bg-gold/20 text-gold",
  approved: "bg-sage/25 text-sage-deep",
  returned: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function StatusBadge({
  status,
  label,
}: {
  status: SessionStatus | TaskStatus | string;
  label: string;
}) {
  return (
    <span className={`badge ${STATUS_COLORS[status] ?? "bg-line/60 text-soft"}`}>
      {label}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage/30 to-gold/20 text-xs font-semibold text-sage-deep ring-1 ring-line">
      {initials || "?"}
    </span>
  );
}
