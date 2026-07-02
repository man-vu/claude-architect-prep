"use client";
import { useEffect, useState } from "react";
import { useT, useLocale } from "@/i18n/LocaleProvider";

const SEEN_KEY = "cca-intro-seen";
const TYPE_MS = 32;
const LINE_MS = 260;

// A terminal boot sequence: the command line "types", output lines print instantly
// (like a real shell), then the prompt hands over. Plays once per locale (a visitor
// switching languages sees it again, since it's also a language confirmation);
// any input skips.
export function Intro() {
  const t = useT();
  const locale = useLocale();
  const command = t.intro.command;
  const output = [
    t.intro.scenarioBankLine,
    t.intro.theoryDrillsLine,
    t.intro.examEngineLine,
    t.intro.ready,
  ];
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(`${SEEN_KEY}-${locale}`)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(command.length);
      setLines(output.length);
    }
    setVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const done = typed >= command.length && lines >= output.length;

  useEffect(() => {
    if (!visible || done) return;
    const timer = setTimeout(() => {
      if (typed < command.length) setTyped(typed + 1);
      else setLines(lines + 1);
    }, typed < command.length ? TYPE_MS : LINE_MS);
    return () => clearTimeout(timer);
  }, [visible, typed, lines, done, command.length]);

  useEffect(() => {
    if (!visible) return;
    const finish = () => {
      localStorage.setItem(`${SEEN_KEY}-${locale}`, "1");
      setVisible(false);
    };
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, locale]);

  if (!visible) return null;

  const finish = () => {
    localStorage.setItem(`${SEEN_KEY}-${locale}`, "1");
    setVisible(false);
  };

  return (
    <div
      role="dialog" aria-label={t.intro.ariaLabel} onClick={finish}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-paper px-6"
    >
      <div className="w-full max-w-lg font-mono text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-ink">
          <span className="text-accent">$ </span>
          {command.slice(0, typed)}
          {!done && <span className="caret text-accent" />}
        </div>
        <div className="mt-3 space-y-1.5 text-ink-soft">
          {output.slice(0, lines).map((l, i) => (
            <div key={i} className={l === t.intro.ready ? "text-ok" : undefined}>{l}</div>
          ))}
        </div>
        {done && (
          <div className="rise mt-6 flex items-center justify-between">
            <span className="caret font-bold text-accent">$</span>
            <button
              type="button" onClick={finish} autoFocus
              className="arrow-nudge rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent"
            >
              {t.intro.begin} <span className="arrow">▸</span>
            </button>
          </div>
        )}
        <button type="button" onClick={finish} className="mt-8 block font-mono text-xs text-ink-soft hover:text-accent">
          {t.intro.skip}
        </button>
      </div>
    </div>
  );
}
