"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "system" | "light" | "dark" | "cosmic" | "minimal";

const MODES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Wellness" },
  { value: "dark", label: "Dark" },
  { value: "cosmic", label: "Cosmic" },
  { value: "minimal", label: "Minimal" },
];

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || mode === "cosmic" || (mode === "system" && sysDark);
  root.classList.toggle("dark", dark);
  root.classList.toggle("cosmic", mode === "cosmic");
  root.classList.toggle("minimal", mode === "minimal");
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as ThemeMode | null;
      if (saved && MODES.some((m) => m.value === saved)) setMode(saved);
    } catch {}
  }, []);

  // Follow OS preference live while in system mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  function change(next: ThemeMode) {
    setMode(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <select
      aria-label="Theme"
      className="input w-auto py-1.5"
      value={mode}
      onChange={(e) => change(e.target.value as ThemeMode)}
    >
      {MODES.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
