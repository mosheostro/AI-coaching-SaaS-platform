"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui";
import { setCoachApproval } from "../actions";

export type CoachRow = {
  id: string; full_name: string; email: string; status: string;
  approval_status: "pending" | "approved" | "rejected";
  rating: number | null; rating_count: number; clients: number; sessions: number;
};

const BADGE: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function CoachesTable({ rows }: { rows: CoachRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  const act = (id: string, s: "approved" | "rejected" | "pending") => { setBusy(id); start(async () => { await setCoachApproval(id, s); setBusy(null); }); };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-soft">
          <th className="p-3 text-start font-medium">Coach</th><th className="p-3 text-start font-medium">Approval</th>
          <th className="p-3 text-start font-medium">Rating</th><th className="p-3 text-start font-medium">Clients</th>
          <th className="p-3 text-start font-medium">Sessions</th><th className="p-3 text-end font-medium">Actions</th>
        </tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-line/50 last:border-0">
              <td className="p-3"><div className="flex items-center gap-2.5"><Avatar name={c.full_name || c.email} /><div className="min-w-0"><p className="truncate font-medium">{c.full_name || "—"}</p><p className="truncate text-xs text-soft">{c.email}</p></div></div></td>
              <td className="p-3"><span className={`badge capitalize ${BADGE[c.approval_status]}`}>{c.approval_status}</span></td>
              <td className="p-3">{c.rating ? `${c.rating.toFixed(1)} ★ (${c.rating_count})` : "—"}</td>
              <td className="p-3 tabular-nums">{c.clients}</td>
              <td className="p-3 tabular-nums">{c.sessions}</td>
              <td className="p-3"><div className="flex justify-end gap-1.5">
                {c.approval_status !== "approved" && <button disabled={busy === c.id} onClick={() => act(c.id, "approved")} className="rounded-lg border border-emerald-500/30 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-40 dark:text-emerald-400">Approve</button>}
                {c.approval_status !== "rejected" && <button disabled={busy === c.id} onClick={() => act(c.id, "rejected")} className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-600 hover:bg-red-500/10 disabled:opacity-40 dark:text-red-400">Reject</button>}
              </div></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-soft">No coaches.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
