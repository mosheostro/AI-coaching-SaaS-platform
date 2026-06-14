"use client";

import { useState, useTransition } from "react";
import { markNotificationRead } from "../actions";

export type Notif = { id: string; kind: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string; audience: string };

const DOT: Record<string, string> = { alert: "bg-red-500", warning: "bg-amber-500", lead: "bg-sage", support: "bg-blue-500", success: "bg-emerald-500", info: "bg-soft/50" };

export function NotificationsList({ items }: { items: Notif[] }) {
  const [list, setList] = useState(items);
  const [, start] = useTransition();
  function read(id: string) {
    setList((l) => l.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    start(() => markNotificationRead(id));
  }
  return (
    <div className="card divide-y divide-line/60 p-0">
      {list.map((n) => (
        <div key={n.id} className={`flex items-start gap-3 p-4 ${n.read_at ? "opacity-60" : ""}`}>
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[n.kind] ?? "bg-soft/50"}`} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{n.title}</p>
            {n.body && <p className="text-sm text-soft">{n.body}</p>}
            <p className="mt-0.5 text-xs text-soft/70">{new Date(n.created_at).toLocaleString()}</p>
          </div>
          {!n.read_at && <button onClick={() => read(n.id)} className="shrink-0 rounded-lg border border-line px-2 py-1 text-xs text-soft hover:text-ink">Mark read</button>}
        </div>
      ))}
      {list.length === 0 && <p className="p-8 text-center text-soft">No notifications.</p>}
    </div>
  );
}
