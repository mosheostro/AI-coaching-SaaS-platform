"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AI_MODES, type AiMode } from "@/lib/ai/modes";
import { motion } from "@/components/motion";

interface AiSession {
  id: string;
  mode: string;
  title: string;
  updated_at: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function AiCoachClient({
  initialSessions,
  labels,
}: {
  initialSessions: AiSession[];
  labels: {
    title: string;
    subtitle: string;
    newSession: string;
    modeLabel: string;
    thinking: string;
    emptySessions: string;
    firstPrompt: string;
    typeMessage: string;
    send: string;
    modes: Record<string, string>;
  };
}) {
  const [sessions, setSessions] = useState<AiSession[]>(initialSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<AiMode>("life");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, busy]);

  async function openSession(s: AiSession) {
    setActiveId(s.id);
    setMode(s.mode as AiMode);
    setError(null);
    const { data } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("session_id", s.id)
      .order("created_at")
      .limit(100);
    setMessages((data ?? []) as ChatMsg[]);
  }

  function newSession() {
    setActiveId(null);
    setMessages([]);
    setError(null);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setDraft("");

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeId, mode, message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (!activeId) {
          setActiveId(data.sessionId);
          setSessions((prev) => [
            {
              id: data.sessionId,
              mode,
              title: text.slice(0, 60),
              updated_at: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      }
    } catch {
      setError("Network error");
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {/* Sessions rail */}
      <aside className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold">{labels.title}</h1>
          <p className="mt-1 text-soft">{labels.subtitle}</p>
        </div>
        <button onClick={newSession} className="btn-primary w-full">
          + {labels.newSession}
        </button>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible">
          {sessions.length === 0 && (
            <p className="text-xs text-soft">{labels.emptySessions}</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => openSession(s)}
              className={`card card-hover w-full min-w-[180px] p-3 text-start lg:min-w-0 ${
                activeId === s.id ? "border-sage/60 ring-glow" : ""
              }`}
            >
              <p className="truncate text-sm font-medium">{s.title}</p>
              <p className="mt-0.5 text-xs text-gold">
                {labels.modes[s.mode] ?? s.mode}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <section className="card flex h-[72vh] flex-col p-0">
        {/* Mode picker (new sessions only) */}
        {!activeId && messages.length === 0 && (
          <div className="border-b border-line/60 p-4">
            <label className="mb-2 block text-xs font-medium text-soft">
              {labels.modeLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AI_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`badge cursor-pointer px-3 py-1.5 transition ${
                    mode === m
                      ? "bg-sage/20 text-sage-deep ring-1 ring-sage/50"
                      : "bg-canvas2 text-soft hover:text-ink"
                  }`}
                >
                  {labels.modes[m]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-3xl text-sage/50">✦</span>
              <p className="mt-3 max-w-sm text-soft">{labels.firstPrompt}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 shadow-card ${
                  m.role === "user"
                    ? "bg-sage-deep text-canvas"
                    : "border border-line/60 bg-canvas2 text-ink"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="animate-shimmer rounded-2xl border border-line/60 bg-canvas2 px-4 py-2.5 text-soft">
                {labels.thinking}
              </div>
            </div>
          )}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={labels.typeMessage}
            className="input flex-1"
            maxLength={4000}
          />
          <button type="submit" disabled={busy || !draft.trim()} className="btn-primary">
            {labels.send}
          </button>
        </form>
      </section>
    </div>
  );
}
