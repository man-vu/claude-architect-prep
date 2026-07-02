"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { composeExam, EXAM_DURATION_MINUTES } from "@/domain/exam";
import type { Attempt, Letter, Question } from "@/domain/types";
import { useExamStore } from "@/store/useExamStore";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsSummary } from "@/components/ResultsSummary";
import { useT, useLocale } from "@/i18n/LocaleProvider";
import { localeHref } from "@/i18n/locales";
import { getQuestions } from "@/content/i18n";

function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function QuestionMap({
  questions, answers, current, onJump,
}: {
  questions: Question[]; answers: Record<string, Letter>; current: number; onJump: (i: number) => void;
}) {
  const t = useT();
  return (
    <ol className="grid grid-cols-10 gap-1 lg:grid-cols-6">
      {questions.map((q, idx) => {
        const answered = q.id in answers;
        const cur = idx === current;
        let cls = "border-line bg-card text-ink-soft hover:border-ink-soft";
        if (cur) cls = "border-accent bg-accent-soft font-bold text-accent";
        else if (answered) cls = "cell-pop border-ink bg-ink text-paper";
        return (
          <li key={q.id}>
            <button
              type="button" onClick={() => onJump(idx)}
              aria-label={t.exam.questionAria(idx + 1, answered)}
              aria-current={cur ? "step" : undefined}
              className={`h-7 w-full rounded-sm border font-mono text-[0.6875rem] transition-colors ${cls}`}
            >
              {idx + 1}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ExamView() {
  const t = useT();
  const locale = useLocale();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Letter>>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const startSession = useExamStore((s) => s.startSession);
  const answer = useExamStore((s) => s.answer);
  const finishSession = useExamStore((s) => s.finishSession);

  // Compose (or resume) AFTER mount: the random draw would otherwise differ between the
  // prerendered static HTML and the first client render, causing a hydration mismatch.
  useEffect(() => {
    const s = useExamStore.getState().session;
    if (s && s.mode === "exam" && s.questions.length > 0) {
      // Resume the persisted in-progress exam at its first unanswered question.
      setQuestions(s.questions);
      setAnswers(s.answers);
      setStartedAt(s.startedAt);
      const firstOpen = s.questions.findIndex((q) => !(q.id in s.answers));
      setI(firstOpen === -1 ? 0 : firstOpen);
    } else {
      const qs = composeExam(getQuestions(locale), { scenarioCount: 4, perScenario: 15 });
      setQuestions(qs);
      startSession("exam", qs);
      setStartedAt(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSession]);

  const submit = useCallback(() => {
    setConfirming(false);
    setAttempt(finishSession());
  }, [finishSession]);

  // Countdown clock; auto-submit when time runs out.
  const deadline = startedAt !== null ? startedAt + EXAM_DURATION_MINUTES * 60_000 : null;
  const remaining = deadline !== null ? deadline - now : null;
  useEffect(() => {
    if (startedAt === null || attempt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt, attempt]);
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && questions && !attempt) submit();
  }, [remaining, questions, attempt, submit]);

  const select = useCallback((l: Letter) => {
    if (!questions) return;
    const q = questions[i];
    setAnswers((a) => ({ ...a, [q.id]: l }));
    answer(q.id, l);
  }, [questions, i, answer]);

  // Keyboard: A–D select, ←/→ move between questions.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!questions || attempt) return;
      const k = e.key.toUpperCase();
      if (k === "A" || k === "B" || k === "C" || k === "D") select(k as Letter);
      else if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, questions.length - 1));
      else if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions, attempt, select]);

  if (!questions) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 font-mono text-sm text-ink-soft">
        <span className="spin mr-1.5 inline-block text-accent">◐</span>{t.exam.preparingExam}
      </main>
    );
  }

  if (attempt) {
    return (
      <main className="px-6 py-8">
        <ResultsSummary attempt={attempt} questions={questions} />
        <div className="mx-auto mt-8 max-w-3xl"><Link href={localeHref(locale, "/")} className="font-mono text-sm text-accent hover:underline">{t.exam.home}</Link></div>
      </main>
    );
  }

  const q = questions[i];
  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;
  const lowTime = remaining !== null && remaining < 10 * 60_000;

  const finishBlock = (
    <div className="flex flex-col gap-2">
      {confirming && (
        <p role="alert" className="rounded-md border border-accent bg-accent-soft p-3 font-mono text-xs text-ink">
          {t.exam.unansweredConfirm(unanswered)}
        </p>
      )}
      <button
        type="button"
        onClick={() => (unanswered > 0 && !confirming ? setConfirming(true) : submit())}
        className="rounded-md bg-ink px-5 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent"
      >
        {confirming ? t.exam.submitNow : t.exam.finishExam}
      </button>
      {confirming && (
        <button type="button" onClick={() => setConfirming(false)} className="rounded-md border border-line bg-card px-5 py-2 font-mono text-xs hover:border-ink-soft">
          {t.exam.keepGoing}
        </button>
      )}
      <Link href={localeHref(locale, "/")} className="mt-1 text-center font-mono text-xs text-ink-soft hover:text-accent">
        {t.exam.saveExit}
      </Link>
    </div>
  );

  const clock = remaining !== null && (
    <div className={`font-mono text-2xl font-bold tabular-nums ${lowTime ? "pulse-soft text-bad" : "text-ink"}`} aria-label={t.exam.timeRemaining}>
      {formatClock(remaining)}
    </div>
  );

  return (
    <main className="page-enter mx-auto max-w-6xl px-6 py-8 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
      {/* Ledger rail (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 flex flex-col gap-5">
          {clock}
          <div aria-live="polite" className="font-mono text-xs text-ink-soft">{t.exam.answeredCount(answered)} / {questions.length}</div>
          <QuestionMap questions={questions} answers={answers} current={i} onJump={(idx) => setI(idx)} />
          {finishBlock}
        </div>
      </aside>

      <div>
        {/* Compact header (mobile shows clock here); right padding clears the fixed controls */}
        <div className="mb-4 flex items-center justify-between pr-40 lg:pr-0">
          <span className="caret font-mono text-sm font-bold text-accent">
            {t.exam.questionCounter(i + 1, questions.length)}
          </span>
          <div className="flex items-center gap-4">
            <span aria-live="polite" className="font-mono text-xs text-ink-soft lg:hidden">{t.exam.answeredCount(answered)}</span>
            <span className="lg:hidden">{clock}</span>
          </div>
        </div>

        {/* Mobile question map + finish */}
        <details className="mb-4 rounded-md border border-line bg-card p-3 lg:hidden">
          <summary className="cursor-pointer font-mono text-xs font-semibold uppercase tracking-widest text-ink-soft">{t.exam.questionMap}</summary>
          <div className="mt-3 flex flex-col gap-3">
            <QuestionMap questions={questions} answers={answers} current={i} onJump={(idx) => setI(idx)} />
            {finishBlock}
          </div>
        </details>

        {/* keyed on question id so the entrance animation replays per question */}
        <div key={q.id} className="q-enter">
          <QuestionCard question={q} revealed={false} selected={answers[q.id] ?? null} onSelect={select} />
        </div>

        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between">
          <button
            disabled={i === 0} onClick={() => setI(i - 1)}
            className="theme-smooth rounded-md border border-line bg-card px-5 py-2.5 font-mono text-sm font-semibold transition-colors hover:border-ink-soft disabled:opacity-40"
          >
            {t.exam.prev}
          </button>
          {i + 1 < questions.length ? (
            <button onClick={() => setI(i + 1)} className="arrow-nudge rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent">
              {t.exam.next} <span className="arrow">→</span>
            </button>
          ) : (
            <button onClick={() => (unanswered > 0 && !confirming ? setConfirming(true) : submit())} className="rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent">
              {confirming ? t.exam.submitNow : t.exam.finishExam}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
