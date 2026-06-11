"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Aurora } from "@/components/aurora";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, motion } from "@/components/motion";
import { DEMO_PHASES, type DemoPhase } from "@/lib/ai/demo-prompt";
import type { Locale } from "@/i18n/config";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const PHASE_RE = /<phase>(intake|exploration|insight|action|closure)<\/phase>/;

function visible(text: string): string {
  return text.replace(/<phase>[\s\S]*$/, "").trimEnd();
}

export function DemoClient({
  locale,
  appName,
  labels,
}: {
  locale: Locale;
  appName: string;
  labels: {
    eyebrow: string;
    title: string;
    sub: string;
    start: string;
    restart: string;
    exportLabel: string;
    ctaAfter: string;
    ctaButton: string;
    disclaimer: string;
    thinking: string;
    typeMessage: string;
    send: string;
    login: string;
    phases: Record<DemoPhase, string>;
  };
}) {
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState("");
  const [phase, setPhase] = useState<DemoPhase>("intake");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const done = phase === "closure" && !busy && turns.length > 2;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, streaming, busy]);

  useEffect(() => {
    if (started && !busy) inputRef.current?.focus();
  }, [started, busy]);

  function reset() {
    setStarted(false);
    setTurns([]);
    setStreaming("");
    setPhase("intake");
    setDraft("");
    setError(null);
  }

  async function exchange(history: Turn[]) {
    setBusy(true);
    setError(null);
    setStreaming("");

    try {
      const res = await fetch("/api/demo-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Error ${res.status}`);
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done: end, value } = await reader.read();
        if (end) break;
        full += decoder.decode(value, { stream: true });
        setStreaming(visible(full));
      }

      const m = full.match(PHASE_RE);
      if (m) setPhase(m[1] as DemoPhase);
      const clean = visible(full);
      setTurns([...history, { role: "assistant", content: clean }]);
      setStreaming("");
    } catch {
      setError("Network error");
    }
    setBusy(false);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    const history: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(history);
    await exchange(history);
  }

  function startSession() {
    setStarted(true);
    const opener =
      locale === "ru"
        ? "Привет, я готов начать."
        : locale === "he"
          ? "שלום, אני מוכן להתחיל."
          : "Hi, I'm ready to begin.";
    const history: Turn[] = [{ role: "user", content: opener }];
    setTurns(history);
    void exchange(history);
  }

  function exportSummary() {
    const lines = turns.map(
      (t) => `${t.role === "user" ? "You" : "Coach"}: ${t.content}`
    );
    const blob = new Blob(
      [`# ${appName} — Coaching session\n\n${lines.join("\n\n")}\n`],
      { type: "text/markdown" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "coaching-session.md";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const phaseIdx = DEMO_PHASES.indexOf(phase);

  return (
    <main className="mesh-bg relative flex min-h-[100dvh] flex-col">
      <Aurora className="absolute inset-0 h-full w-full opacity-50" />

      <header dir="ltr" className="relative z-10 flex items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="font-heading text-lg font-semibold">
          {appName}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-secondary hidden sm:inline-flex">
            {labels.login}
          </Link>
        </div>
      </header>

      {!started ? (
        /* ============ Cinematic entry ============ */
        <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
          <FadeIn>
            <p className="eyebrow">{labels.eyebrow}</p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
              <span className="text-gradient">{labels.title}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.24}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-soft md:text-lg">
              {labels.sub}
            </p>
          </FadeIn>
          <FadeIn delay={0.36}>
            <button
              onClick={startSession}
              className="btn-primary mt-10 px-9 py-4 text-base ring-glow"
            >
              {labels.start}
            </button>
            <p className="mt-4 text-xs text-soft/80">{labels.disclaimer}</p>
          </FadeIn>
        </section>
      ) : (
        /* ============ Session ============ */
        <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-4 sm:px-6">
          {/* Phase progress */}
          <div className="glass sticky top-0 z-10 mb-3 flex items-center gap-1 rounded-card px-3 py-2.5 sm:gap-2 sm:px-4">
            {DEMO_PHASES.map((p, i) => (
              <div key={p} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`h-1 w-full rounded-full transition-colors duration-500 ${
                    i <= phaseIdx ? "bg-sage" : "bg-line"
                  }`}
                />
                <span
                  className={`hidden text-[10px] sm:block ${
                    i === phaseIdx ? "font-medium text-ink" : "text-soft/70"
                  }`}
                >
                  {labels.phases[p]}
                </span>
              </div>
            ))}
          </div>

          <div className="card flex flex-1 flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {turns.slice(1).map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 leading-relaxed shadow-card ${
                      t.role === "user"
                        ? "bg-sage-deep text-canvas"
                        : "border border-line/60 bg-surface text-ink"
                    }`}
                  >
                    {t.content}
                  </div>
                </motion.div>
              ))}
              {streaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl border border-line/60 bg-surface px-4 py-2.5 leading-relaxed shadow-card">
                    {streaming}
                    <span className="animate-shimmer">▍</span>
                  </div>
                </div>
              )}
              {busy && !streaming && (
                <p className="animate-shimmer px-1 text-soft">{labels.thinking}</p>
              )}
              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Completion card */}
            {done && (
              <FadeIn className="border-t border-line/60 p-4 text-center">
                <p className="font-medium">{labels.ctaAfter}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Link href="/signup" className="btn-primary ring-glow">
                    {labels.ctaButton}
                  </Link>
                  <button onClick={exportSummary} className="btn-secondary">
                    {labels.exportLabel}
                  </button>
                  <button onClick={reset} className="btn-secondary">
                    {labels.restart}
                  </button>
                </div>
              </FadeIn>
            )}

            <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={labels.typeMessage}
                className="input flex-1"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="btn-primary"
              >
                {labels.send}
              </button>
            </form>
          </div>

          {!done && (
            <button
              onClick={reset}
              className="mx-auto mt-2 text-xs text-soft/70 transition hover:text-ink"
            >
              {labels.restart}
            </button>
          )}
        </section>
      )}
    </main>
  );
}
