"use client";
import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const KEY = "cca-theme";
const ORDER: Mode[] = ["light", "dark", "system"];
const GLYPH: Record<Mode, string> = { light: "○", dark: "●", system: "◐" };

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null); // null until mounted (no SSR mismatch)

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Mode | null;
    setMode(stored && ORDER.includes(stored) ? stored : "system");
  }, []);

  // In system mode, follow OS scheme changes live.
  useEffect(() => {
    if (mode === null) return;
    apply(mode);
    localStorage.setItem(KEY, mode);
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  if (mode === null) return <div className="h-9 w-24" aria-hidden />;
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      title={`Theme: ${mode} — switch to ${next}`}
      aria-label={`Theme: ${mode}. Switch to ${next}.`}
      className="theme-smooth fixed top-4 right-4 z-50 rounded-md border border-line bg-card px-3 py-1.5 font-mono text-xs font-semibold text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
    >
      {GLYPH[mode]} {mode}
    </button>
  );
}
