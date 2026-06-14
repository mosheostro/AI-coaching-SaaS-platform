"use client";

import { useMemo, useState, useTransition } from "react";
import { updateLeadStatus } from "../actions";

export type Lead = {
  id: string; name: string; email: string; subject: string | null;
  message: string; type: string; status: string; page: string | null; created_at: string;
};

const STATUSES = ["new", "in_progress", "closed"];
const TYPES = ["contact", "partnership", "collaboration", "support"];

export function LeadsBoard({ leads }: { leads: Lead[] }) {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(
    () => leads.filter((l) => (type === "all" || l.type === type) && (status === "all" || l.status === status)),
    [leads, type, status]
  );

  function exportCsv() {
    const head = ["name", "email", "type", "status", "subject", "page", "created_at"];
    const rows = filtered.map((l) => head.map((h) => `"${String((l as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([head.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leads.csv";
    a.click();
  }

  const counts = STATUSES.map((s) => ({ s, n: leads.filter((l) => l.status === s).length }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {counts.map(({ s, n }) => (
          <div key={s} className="card">
            <p className="text-soft text-xs capitalize">{s.replace("_", " ")}</p>
            <p className="font-heading text-2xl font-semibold">{n}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input w-auto">
          <option value="all">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <span className="text-sm text-soft">{filtered.length} leads</span>
        <button onClick={exportCsv} className="btn-secondary ms-auto py-2 text-sm">Export CSV</button>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-soft">
              <th className="p-3 text-start font-medium">Contact</th>
              <th className="p-3 text-start font-medium">Type</th>
              <th className="p-3 text-start font-medium">Subject</th>
              <th className="p-3 text-start font-medium">Received</th>
              <th className="p-3 text-start font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-line/50 last:border-0 align-top">
                <td className="p-3"><p className="font-medium">{l.name}</p><p className="text-xs text-soft">{l.email}</p></td>
                <td className="p-3"><span className="badge bg-sage/15 text-sage-deep capitalize">{l.type}</span></td>
                <td className="p-3 max-w-[260px]"><p className="truncate">{l.subject || "—"}</p><p className="truncate text-xs text-soft">{l.message}</p></td>
                <td className="p-3 text-soft">{new Date(l.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <select
                    defaultValue={l.status}
                    disabled={busy === l.id}
                    onChange={(e) => { setBusy(l.id); start(async () => { await updateLeadStatus(l.id, e.target.value); setBusy(null); }); }}
                    className="input w-auto py-1 text-xs"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-soft">No leads.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
