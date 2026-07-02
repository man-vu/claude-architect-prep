"use client";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/LocaleProvider";

type Mode = "light" | "dark" | "system";
const KEY = "cca-theme";
const ORDER: Mode[] = ["light", "dark", "system"];
const GLYPH: Record<Mode, string> = { light: "○", dark: "●", system: "◐" };

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const t = useT();
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

  if (mode === null) return <div className="h-8 w-12" aria-hidden />;
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const modeLabel: Record<Mode, string> = { light: t.theme.light, dark: t.theme.dark, system: t.theme.system };
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      title={t.theme.ariaLabel(modeLabel[mode], modeLabel[next])}
      aria-label={t.theme.ariaLabel(modeLabel[mode], modeLabel[next])}
      className="theme-smooth rounded-md border border-line bg-card px-3 py-1.5 font-mono text-xs font-semibold text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
    >
      {GLYPH[mode]}<span className="hidden sm:inline"> {modeLabel[mode]}</span>
    </button>
  );
}
