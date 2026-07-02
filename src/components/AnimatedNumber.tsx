"use client";
import { useEffect, useRef, useState } from "react";

/** Counts up to a numeric value on mount; renders non-numeric values as-is. */
export function AnimatedNumber({ value, durationMs = 700 }: { value: string; durationMs?: number }) {
  const target = /^\d+$/.test(value) ? parseInt(value, 10) : null;
  const [shown, setShown] = useState(target !== null ? 0 : null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [target, durationMs]);

  return <>{target === null ? value : String(shown)}</>;
}
