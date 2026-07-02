"use client";
import type { Attempt, Question } from "@/domain/types";
import { DOMAINS, SCENARIOS } from "@/content/scenarios";
import { computeBreakdown } from "@/domain/scoring";
import type { BreakdownEntry } from "@/domain/types";
import { Stat } from "./Stat";
import { QuestionCard } from "./QuestionCard";

function BreakdownRow({ entry, label, delayMs }: { entry: BreakdownEntry; label: string; delayMs: number }) {
  return (
    <li className="theme-smooth rounded-md border border-line bg-card px-4 py-2 text-sm">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono font-semibold">{entry.correct}/{entry.total} · {entry.pct}%</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
        <div
          className={`grow-bar h-full rounded-full ${entry.pct >= 72 ? "bg-ok" : "bg-accent"}`}
          style={{ width: `${entry.pct}%`, animationDelay: `${delayMs}ms` }}
        />
      </div>
    </li>
  );
}

export function ResultsSummary({ attempt, questions }: { attempt: Attempt; questions: Question[] }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const correct = attempt.results.filter((r) => r.correct).length;
  const domainBd = computeBreakdown(attempt.results, byId, "domain");
  const scenarioBd = computeBreakdown(attempt.results, byId, "scenario");
  const wrong = attempt.results.filter((r) => !r.correct);
  return (
    <div className="page-enter mx-auto max-w-3xl">
      <h1 className={`stamp font-mono text-2xl font-bold tracking-tight ${attempt.passed ? "text-ok" : "text-ink"}`}>
        {attempt.passed ? "▸ Passed" : "▸ Not yet"}
      </h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Score" value={String(attempt.scaledScore)} />
        <Stat label="Correct" value={`${correct}/${attempt.results.length}`} />
        <Stat label="Result" value={attempt.passed ? "PASS" : "FAIL"} />
      </div>
      <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ By domain</h2>
      <ul className="mt-2 space-y-1">
        {domainBd.map((b, idx) => (
          <BreakdownRow key={b.key} entry={b} delayMs={idx * 90} label={DOMAINS[b.key as keyof typeof DOMAINS]?.label ?? b.key} />
        ))}
      </ul>
      <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ By scenario</h2>
      <ul className="mt-2 space-y-1">
        {scenarioBd.map((b, idx) => (
          <BreakdownRow key={b.key} entry={b} delayMs={idx * 90} label={SCENARIOS[b.key as keyof typeof SCENARIOS]?.label ?? b.key} />
        ))}
      </ul>
      {wrong.length > 0 && (
        <>
          <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ Review ({wrong.length} missed)</h2>
          <div className="mt-3 space-y-8">
            {wrong.map((r) => {
              const q = byId.get(r.questionId)!;
              return <QuestionCard key={q.id} question={q} revealed selected={r.chosen} onSelect={() => {}} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
