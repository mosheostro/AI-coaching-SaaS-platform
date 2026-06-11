"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Aurora } from "@/components/aurora";
import { EnergySphere } from "@/components/energy-sphere";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, motion } from "@/components/motion";
import {
  STAGES,
  advance,
  getUi,
  newSession,
  openingMessage,
  type EngineLocale,
  type EngineSession,
  type Stage,
} from "@/lib/demo-coach/engine";
import type { Locale } from "@/i18n/config";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface Persisted {
  session: EngineSession;
  turns: Turn[];
}

const STORE_KEY = "demo-coach-session-v1";
const VISIBLE_STAGES = STAGES.filter((s) => s !== "conversion");
const SPEECH_LANG: Record<EngineLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
  he: "he-IL",
};

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Persisted;
    if (!p?.session?.state || !Array.isArray(p.turns)) return null;
    return p;
  } catch {
    return null;
  }
}

function save(p: Persisted | null) {
  try {
    if (p) localStorage.setItem(STORE_KEY, JSON.stringify(p));
    else localStorage.removeItem(STORE_KEY);
  } catch {}
}

export function DemoCoachClient({ locale }: { locale: Locale }) {
  const lang = locale as EngineLocale;
  const ui = getUi(lang);

  const [started, setStarted] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [session, setSession] = useState<EngineSession>(newSession());
  const [turns, setTurns] = useState<Turn[]>([]);
  const [reveal, setReveal] = useState(""); // word-by-word reveal buffer
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const showConversion = session.state === "conversion" && !typing;

  useEffect(() => {
    setCanResume(!!load());
    setVoiceSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, reveal, typing]);

  useEffect(() => {
    if (started && !typing) inputRef.current?.focus();
  }, [started, typing]);

  const speak = useCallback(
    (text: string) => {
      if (!voice || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = SPEECH_LANG[lang] ?? "en-US";
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {}
    },
    [voice, lang]
  );

  /** Simulated thinking + word-by-word reveal. */
  const deliver = useCallback(
    (text: string, history: Turn[], nextSession: EngineSession) => {
      setTyping(true);
      setReveal("");
      const thinkMs = Math.min(700 + text.length * 3, 1800);

      timers.current.push(
        setTimeout(() => {
          const words = text.split(/(\s+)/);
          let i = 0;
          const step = () => {
            i = Math.min(i + 2, words.length);
            setReveal(words.slice(0, i).join(""));
            if (i < words.length) {
              timers.current.push(setTimeout(step, 28));
            } else {
              const newTurns: Turn[] = [...history, { role: "assistant", content: text }];
              setTurns(newTurns);
              setReveal("");
              setTyping(false);
              save({ session: nextSession, turns: newTurns });
              speak(text);
            }
          };
          step();
        }, thinkMs)
      );
    },
    [speak]
  );

  function begin(resume: boolean) {
    const persisted = resume ? load() : null;
    if (persisted) {
      setSession(persisted.session);
      setTurns(persisted.turns);
      setStarted(true);
      return;
    }
    const fresh = newSession();
    setSession(fresh);
    setTurns([]);
    setStarted(true);
    deliver(openingMessage(lang), [], fresh);
  }

  function restart() {
    timers.current.forEach(clearTimeout);
    save(null);
    setStarted(false);
    setCanResume(false);
    setSession(newSession());
    setTurns([]);
    setReveal("");
    setTyping(false);
    setDraft("");
    try {
      window.speechSynthesis?.cancel();
    } catch {}
  }

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");
    const history: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(history);
    const { reply, session: next } = advance(session, text, lang);
    setSession(next);
    deliver(reply, history, next);
  }

  function toggleListen() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = SPEECH_LANG[lang] ?? "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (ev: any) => {
      const text = ev.results?.[0]?.[0]?.transcript ?? "";
      setListening(false);
      if (text.trim()) {
        setDraft(text);
        // auto-send after voice input
        setTimeout(() => {
          const form = inputRef.current?.form;
          form?.requestSubmit();
        }, 150);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  function exportSummary() {
    const lines = turns.map((t) => `${t.role === "user" ? "You" : "Coach"}: ${t.content}`);
    const extras = [
      session.topic && `Topic: ${session.topic}`,
      session.insights[0] && `Key pattern: ${session.insights[0]}`,
      session.actions[0] && `Action plan: ${session.actions[0]}`,
      session.feelings[0] && `Emotional thread: ${session.feelings[0]}`,
    ].filter(Boolean);
    const blob = new Blob(
      [`# Coaching session summary\n\n${extras.join("\n")}\n\n---\n\n${lines.join("\n\n")}\n`],
      { type: "text/markdown" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "coaching-session.md";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const stageIdx = Math.max(
    0,
    (VISIBLE_STAGES as readonly Stage[]).indexOf(
      session.state === "conversion" ? "closure" : session.state
    )
  );

  return (
    <main className="mesh-bg relative flex min-h-[100dvh] flex-col">
      <Aurora className="absolute inset-0 h-full w-full opacity-50" />

      <header dir="ltr" className="relative z-10 flex items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-soft transition hover:border-sage/50 hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
          </Link>
          <Link href="/" className="hidden font-heading text-lg font-semibold sm:block">
            Coach Online
          </Link>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher current={locale} />
          <ThemeToggle />
          <Link href="/login" className="btn-secondary hidden md:inline-flex">
            {ui.login}
          </Link>
        </div>
      </header>

      {!started ? (
        <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-50">
            <EnergySphere size={420} className="max-w-[85vw]" />
          </div>
          <FadeIn>
            <h1 className="relative max-w-2xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
              <span className="text-gradient">{ui.title}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-soft md:text-lg">
              {ui.sub}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <button
                onClick={() => begin(false)}
                className="btn-primary min-h-[48px] px-9 py-4 text-base ring-glow"
              >
                {ui.start}
              </button>
              {canResume && (
                <button
                  onClick={() => begin(true)}
                  className="btn-secondary min-h-[48px] px-7 py-4 text-base"
                >
                  {ui.resume}
                </button>
              )}
            </div>
          </FadeIn>
        </section>
      ) : (
        <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-2 pb-3 sm:px-6">
          {/* Stage progress */}
          <div className="glass sticky top-0 z-10 mb-2 flex items-center gap-1 rounded-card px-3 py-2.5 sm:gap-2 sm:px-4">
            {VISIBLE_STAGES.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`h-1 w-full rounded-full transition-colors duration-500 ${
                    i <= stageIdx ? "bg-sage" : "bg-line"
                  }`}
                />
                <span
                  className={`hidden text-[10px] md:block ${
                    i === stageIdx ? "font-medium text-ink" : "text-soft/70"
                  }`}
                >
                  {ui.stages[s]}
                </span>
              </div>
            ))}
          </div>

          <div className="card flex flex-1 flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {turns.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 leading-relaxed shadow-card sm:max-w-[80%] ${
                      t.role === "user"
                        ? "bg-sage-deep text-canvas"
                        : "border border-line/60 bg-surface text-ink"
                    }`}
                  >
                    {t.content}
                  </div>
                </motion.div>
              ))}

              {reveal && (
                <div className="flex justify-start">
                  <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl border border-line/60 bg-surface px-4 py-2.5 leading-relaxed shadow-card sm:max-w-[80%]">
                    {reveal}
                    <span className="animate-shimmer">▍</span>
                  </div>
                </div>
              )}

              {typing && !reveal && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-line/60 bg-surface px-4 py-3 shadow-card">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-soft"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Conversion layer */}
            {showConversion && (
              <FadeIn className="border-t border-line/60 p-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/signup" className="btn-primary min-h-[44px] ring-glow">
                    {ui.ctaSave}
                  </Link>
                  <Link href="/signup" className="btn-gold min-h-[44px]">
                    {ui.ctaFull}
                  </Link>
                  <button onClick={exportSummary} className="btn-secondary min-h-[44px]">
                    {ui.exportLabel}
                  </button>
                </div>
              </FadeIn>
            )}

            <form onSubmit={send} className="flex gap-2 border-t border-line p-2.5 sm:p-3">
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleListen}
                  aria-label={listening ? "Stop listening" : "Speak"}
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                    listening
                      ? "animate-shimmer border-sage bg-sage/20 text-sage-deep"
                      : "border-line bg-surface text-soft hover:text-ink"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0M12 17v5" />
                  </svg>
                </button>
              )}
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={ui.typeMessage}
                className="input min-h-[44px] flex-1"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={typing || !draft.trim()}
                className="btn-primary min-h-[44px]"
              >
                {ui.send}
              </button>
            </form>
          </div>

          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              onClick={restart}
              className="min-h-[32px] text-xs text-soft/70 transition hover:text-ink"
            >
              {ui.restart}
            </button>
            {voiceSupported && (
              <button
                onClick={() => setVoice(!voice)}
                className={`min-h-[32px] text-xs transition ${
                  voice ? "text-sage-deep" : "text-soft/70 hover:text-ink"
                }`}
              >
                {voice ? ui.voiceOn : ui.voiceOff}
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
