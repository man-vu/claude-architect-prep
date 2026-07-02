"use client";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/LocaleProvider";

const KEY = "cca-font";
// Root font-size scale steps. Percent (not px) so a user's browser-default
// font size preference still applies underneath.
const STEPS = [0.875, 1, 1.125, 1.25, 1.5];

function apply(scale: number) {
  document.documentElement.style.fontSize = scale === 1 ? "" : `${scale * 100}%`;
}

export function TextSizeControl() {
  const t = useT();
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const stored = parseFloat(localStorage.getItem(KEY) ?? "1");
    setScale(STEPS.includes(stored) ? stored : 1);
  }, []);

  useEffect(() => {
    if (scale === null) return;
    apply(scale);
    localStorage.setItem(KEY, String(scale));
  }, [scale]);

  if (scale === null) return null;
  const idx = STEPS.indexOf(scale);
  const btn = "rounded-md border border-line bg-card px-2 py-1.5 font-mono text-xs font-semibold text-ink-soft transition-colors hover:border-ink-soft hover:text-ink disabled:opacity-40";

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t.textSize.groupAria}>
      <button type="button" disabled={idx <= 0} onClick={() => setScale(STEPS[idx - 1])} aria-label={t.textSize.decrease} className={btn}>
        A−
      </button>
      <span aria-live="polite" className="min-w-[3.2em] text-center font-mono text-[0.6875rem] text-ink-soft">
        {Math.round(scale * 100)}%
      </span>
      <button type="button" disabled={idx >= STEPS.length - 1} onClick={() => setScale(STEPS[idx + 1])} aria-label={t.textSize.increase} className={btn}>
        A+
      </button>
    </div>
  );
}
