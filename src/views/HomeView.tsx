"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";
import { Stat } from "@/components/Stat";
import { Intro } from "@/components/Intro";
import { useT, useLocale } from "@/i18n/LocaleProvider";
import { localeHref } from "@/i18n/locales";

export function HomeView() {
  const t = useT();
  const locale = useLocale();
  const attempts = useExamStore((s) => s.attempts);
  const best = useExamStore((s) => s.bestScore());
  // Read after mount — the persisted session isn't in the prerendered HTML.
  const [resumable, setResumable] = useState<{ answered: number; total: number } | null>(null);
  useEffect(() => {
    const s = useExamStore.getState().session;
    if (s && s.mode === "exam" && s.questions.length > 0) {
      setResumable({ answered: Object.keys(s.answers).length, total: s.questions.length });
    }
  }, [attempts]);

  const href = (p: string) => localeHref(locale, p);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Intro />
      <p className="rise font-mono text-xs font-bold uppercase tracking-widest text-accent">{t.home.kicker}</p>
      <h1 className="caret rise rise-1 mt-2 font-mono text-3xl font-bold tracking-tight sm:text-4xl">Claude Certified Architect</h1>
      <p className="rise rise-1 mt-3 text-ink-soft">{t.home.scoreLine}</p>
      <div className="rise rise-2 mt-8 grid grid-cols-3 gap-4">
        <Stat label={t.home.statBestExam} value={best !== null ? String(best) : "—"} />
        <Stat label={t.home.statAttempts} value={String(attempts.length)} />
        <Stat label={t.home.statPassMark} value="720" />
      </div>
      {resumable && (
        <Link href={href("/exam")} className="rise mt-8 block rounded-md border border-accent bg-accent-soft px-6 py-4 text-center font-mono text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-paper">
          {t.home.resumeExamLine(resumable.answered, resumable.total)}
        </Link>
      )}
      <div className={`${resumable ? "mt-3" : "mt-8"} rise rise-3 flex flex-col gap-3 sm:flex-row`}>
        <Link href={href("/exam")} className="flex-1 rounded-md bg-ink px-6 py-4 text-center font-mono text-base font-semibold text-paper transition-colors hover:bg-accent">
          {resumable ? t.home.resumeExam : t.home.startExam}
        </Link>
        <Link href={href("/practice")} className="theme-smooth flex-1 rounded-md border border-line bg-card px-6 py-4 text-center font-mono text-base font-semibold transition-colors hover:border-ink-soft">{t.home.practiceByTopic}</Link>
      </div>
      <Link href={href("/study")} className="theme-smooth rise rise-4 mt-3 block rounded-md border border-line bg-card px-6 py-4 text-center font-mono text-base font-semibold transition-colors hover:border-ink-soft">{t.home.studyTheTheory}</Link>
      <Link href={href("/history")} className="arrow-nudge rise rise-4 mt-5 inline-block font-mono text-sm text-accent hover:underline">{t.home.viewHistory} <span className="arrow">→</span></Link>
    </main>
  );
}
