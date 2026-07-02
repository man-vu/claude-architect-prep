"use client";
import type { Attempt, Question } from "@/domain/types";
import { DOMAINS, SCENARIOS } from "@/content/scenarios";
import { computeBreakdown } from "@/domain/scoring";
import { Stat } from "./Stat";
import { QuestionCard } from "./QuestionCard";

export function ResultsSummary({ attempt, questions }: { attempt: Attempt; questions: Question[] }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const correct = attempt.results.filter((r) => r.correct).length;
  const domainBd = computeBreakdown(attempt.results, byId, "domain");
  const scenarioBd = computeBreakdown(attempt.results, byId, "scenario");
  const wrong = attempt.results.filter((r) => !r.correct);
  const rowCls = "flex justify-between rounded-md border border-line bg-card px-4 py-2 text-sm";
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className={`font-mono text-2xl font-bold tracking-tight ${attempt.passed ? "text-ok" : "text-ink"}`}>
        {attempt.passed ? "▸ Passed" : "▸ Not yet"}
      </h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Score" value={String(attempt.scaledScore)} />
        <Stat label="Correct" value={`${correct}/${attempt.results.length}`} />
        <Stat label="Result" value={attempt.passed ? "PASS" : "FAIL"} />
      </div>
      <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ By domain</h2>
      <ul className="mt-2 space-y-1">
        {domainBd.map((b) => (
          <li key={b.key} className={rowCls}>
            <span>{DOMAINS[b.key as keyof typeof DOMAINS]?.label ?? b.key}</span>
            <span className="font-mono font-semibold">{b.correct}/{b.total} · {b.pct}%</span>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ By scenario</h2>
      <ul className="mt-2 space-y-1">
        {scenarioBd.map((b) => (
          <li key={b.key} className={rowCls}>
            <span>{SCENARIOS[b.key as keyof typeof SCENARIOS]?.label ?? b.key}</span>
            <span className="font-mono font-semibold">{b.correct}/{b.total} · {b.pct}%</span>
          </li>
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
