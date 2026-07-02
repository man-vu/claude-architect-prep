"use client";
import { useEffect, useState } from "react";

const SEEN_KEY = "cca-intro-seen";

// A terminal boot sequence: the command line "types", output lines print instantly
// (like a real shell), then the prompt hands over. Plays once; any input skips.
const COMMAND = "cca-prep --init";
const OUTPUT = [
  "▸ scenario bank ....... 90 questions / 6 scenarios",
  "▸ theory drills ....... 169 drills / 5 domains",
  "▸ exam engine ......... 60Q · 120 min · pass ≥ 720",
  "▸ ready.",
];
const TYPE_MS = 32;
const LINE_MS = 260;

export function Intro() {
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState(0); // chars of COMMAND shown
  const [lines, setLines] = useState(0); // output lines shown

  // Show only on first visit, decided after mount (no SSR mismatch).
  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(COMMAND.length);
      setLines(OUTPUT.length);
    }
    setVisible(true);
  }, []);

  const done = typed >= COMMAND.length && lines >= OUTPUT.length;

  // Type the command, then print output lines.
  useEffect(() => {
    if (!visible || done) return;
    const t = setTimeout(() => {
      if (typed < COMMAND.length) setTyped(typed + 1);
      else setLines(lines + 1);
    }, typed < COMMAND.length ? TYPE_MS : LINE_MS);
    return () => clearTimeout(t);
  }, [visible, typed, lines, done]);

  // Any key skips/eventually dismisses.
  useEffect(() => {
    if (!visible) return;
    const finish = () => {
      localStorage.setItem(SEEN_KEY, "1");
      setVisible(false);
    };
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  const finish = () => {
    localStorage.setItem(SEEN_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      role="dialog" aria-label="Introduction" onClick={finish}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-paper px-6"
    >
      <div className="w-full max-w-lg font-mono text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-ink">
          <span className="text-accent">$ </span>
          {COMMAND.slice(0, typed)}
          {!done && <span className="caret text-accent" />}
        </div>
        <div className="mt-3 space-y-1.5 text-ink-soft">
          {OUTPUT.slice(0, lines).map((l) => (
            <div key={l} className={l === "▸ ready." ? "text-ok" : undefined}>{l}</div>
          ))}
        </div>
        {done && (
          <div className="rise mt-6 flex items-center justify-between">
            <span className="caret font-bold text-accent">$</span>
            <button
              type="button" onClick={finish} autoFocus
              className="arrow-nudge rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent"
            >
              Begin <span className="arrow">▸</span>
            </button>
          </div>
        )}
        <button type="button" onClick={finish} className="mt-8 block font-mono text-xs text-ink-soft hover:text-accent">
          skip ▸
        </button>
      </div>
    </div>
  );
}
