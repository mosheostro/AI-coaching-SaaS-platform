"use client";

import { useMemo, useState, useTransition } from "react";
import { Avatar } from "@/components/ui";
import {
  suspendUser, reactivateUser, changeUserRole, sendUserReset, deleteUser,
} from "../actions";
import type { UserRole } from "@/lib/types";

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  created_at: string;
  last_seen_at: string | null;
};

const ROLES: UserRole[] = ["client", "coach", "admin"];

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (term && !(`${u.full_name} ${u.email}`.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [users, q, role, status]);

  function run(id: string, fn: () => Promise<unknown>, note?: string) {
    setBusyId(id);
    startTransition(async () => {
      const r = (await fn()) as { error?: string } | undefined;
      setBusyId(null);
      if (r?.error) setMsg(r.error);
      else if (note) setMsg(note);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-soft" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="input ps-9" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="input w-auto">
          <option value="all">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input w-auto">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <span className="text-sm text-soft">{filtered.length} users</span>
      </div>

      {msg && (
        <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
          {msg} <button onClick={() => setMsg(null)} className="ms-2 text-soft hover:text-ink">✕</button>
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-soft">
              <th className="p-3 text-start font-medium">User</th>
              <th className="p-3 text-start font-medium">Role</th>
              <th className="p-3 text-start font-medium">Status</th>
              <th className="p-3 text-start font-medium">Last seen</th>
              <th className="p-3 text-start font-medium">Joined</th>
              <th className="p-3 text-end font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-line/50 last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.full_name || u.email} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.full_name || "—"}</p>
                      <p className="truncate text-xs text-soft">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <select
                    defaultValue={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => run(u.id, () => changeUserRole(u.id, e.target.value as UserRole), "Role updated")}
                    className="input w-auto py-1 text-xs"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <span className={`badge ${u.status === "active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-soft">{u.last_seen_at ? new Date(u.last_seen_at).toLocaleDateString() : "—"}</td>
                <td className="p-3 text-soft">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1.5">
                    {u.status === "active" ? (
                      <ActionBtn busy={busyId === u.id} onClick={() => run(u.id, () => suspendUser(u.id), "User suspended")} title="Suspend">Suspend</ActionBtn>
                    ) : (
                      <ActionBtn busy={busyId === u.id} onClick={() => run(u.id, () => reactivateUser(u.id), "User reactivated")} title="Reactivate">Reactivate</ActionBtn>
                    )}
                    <ActionBtn busy={busyId === u.id} onClick={() => run(u.id, () => sendUserReset(u.email), "Reset email sent")} title="Send password reset">Reset</ActionBtn>
                    <ActionBtn
                      danger
                      busy={busyId === u.id}
                      onClick={() => { if (confirm(`Delete ${u.email}? This cannot be undone.`)) run(u.id, () => deleteUser(u.id), "User deleted"); }}
                      title="Delete user"
                    >Delete</ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-soft">No users match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, busy, danger, title }: { children: React.ReactNode; onClick: () => void; busy?: boolean; danger?: boolean; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      disabled={busy}
      onClick={onClick}
      className={`rounded-lg border px-2 py-1 text-xs transition disabled:opacity-40 ${
        danger ? "border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400" : "border-line text-soft hover:border-sage/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
