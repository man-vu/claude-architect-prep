"use client";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";
import { useT, useLocale } from "@/i18n/LocaleProvider";
import { localeHref } from "@/i18n/locales";

export function HistoryView() {
  const t = useT();
  const locale = useLocale();
  const attempts = useExamStore((s) => s.attempts);
  return (
    <main className="page-enter mx-auto max-w-3xl px-6 py-10">
      <Link href={localeHref(locale, "/")} className="font-mono text-sm text-accent hover:underline">{t.history.home}</Link>
      <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight">{t.history.title}</h1>
      {attempts.length === 0 && <p className="mt-4 text-ink-soft">{t.history.empty}</p>}
      <ul className="mt-4 space-y-2">
        {attempts.map((a, idx) => {
          const correct = a.results.filter((r) => r.correct).length;
          return (
            <li key={a.id} style={{ animationDelay: `${Math.min(idx, 8) * 50}ms` }} className="rise theme-smooth flex items-center justify-between rounded-md border border-line bg-card px-4 py-3">
              <div>
                <div className="font-mono text-sm font-semibold capitalize">{a.mode}</div>
                <div className="font-mono text-xs text-ink-soft">{new Date(a.finishedAt).toLocaleString(locale)} · {correct}/{a.results.length}</div>
              </div>
              <div className={`font-mono text-lg font-bold ${a.passed ? "text-ok" : "text-ink-soft"}`}>{a.scaledScore}</div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
