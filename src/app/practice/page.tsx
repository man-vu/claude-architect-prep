"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { allQuestions } from "@/content/questions";
import { allTheoryQuestions } from "@/content/theory";
import { DOMAINS, SCENARIOS } from "@/content/scenarios";
import type { Domain, Letter, ScenarioId } from "@/domain/types";
import { QuestionCard } from "@/components/QuestionCard";
import { TheoryCard } from "@/components/TheoryCard";

// Scenario practice = exam-style questions; domain practice = theory-recall drills.
type Filter = { kind: "scenario"; id: ScenarioId } | { kind: "domain"; id: Domain };

export default function Practice() {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);

  const scenarioPool = useMemo(
    () => (filter?.kind === "scenario" ? allQuestions.filter((q) => q.scenario === filter.id) : []),
    [filter],
  );
  const theoryPool = useMemo(
    () => (filter?.kind === "domain" ? allTheoryQuestions.filter((q) => q.domain === filter.id) : []),
    [filter],
  );
  const poolLength = filter?.kind === "scenario" ? scenarioPool.length : theoryPool.length;

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("domain");
    if (d && (Object.keys(DOMAINS) as string[]).includes(d)) {
      setFilter({ kind: "domain", id: d as Domain });
      setI(0);
      setSelected(null);
    }
  }, []);

  const topicCls = "rise theme-smooth rounded-md border border-line bg-card p-4 text-left transition-colors hover:border-ink-soft disabled:opacity-40";

  if (!filter) {
    return (
      <main className="page-enter mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="font-mono text-sm text-accent hover:underline">← Home</Link>
        <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight">Practice by scenario</h1>
        <p className="mt-1 text-sm text-ink-soft">Exam-style situational questions — the format the real exam uses.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((s, idx) => {
            const n = allQuestions.filter((q) => q.scenario === s).length;
            return (
              <button key={s} disabled={n === 0} style={{ animationDelay: `${idx * 50}ms` }} onClick={() => { setFilter({ kind: "scenario", id: s }); setI(0); setSelected(null); }} className={topicCls}>
                <div className="font-mono text-sm font-semibold">{SCENARIOS[s].label}</div>
                <div className="mt-0.5 font-mono text-xs text-ink-soft">{n} questions</div>
              </button>
            );
          })}
        </div>
        <h2 className="mt-8 font-mono text-2xl font-bold tracking-tight">Drill the theory by domain</h2>
        <p className="mt-1 text-sm text-ink-soft">Direct concept-recall questions from the study notes — for memorising the material.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(DOMAINS) as Domain[]).map((d, idx) => {
            const n = allTheoryQuestions.filter((q) => q.domain === d).length;
            return (
              <button key={d} disabled={n === 0} style={{ animationDelay: `${idx * 50}ms` }} onClick={() => { setFilter({ kind: "domain", id: d }); setI(0); setSelected(null); }} className={topicCls}>
                <div className="font-mono text-sm font-semibold">{DOMAINS[d].label}</div>
                <div className="mt-0.5 font-mono text-xs text-ink-soft">{n} theory drills · weight {DOMAINS[d].weight}%</div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between pr-40 lg:pr-0">
        <button onClick={() => setFilter(null)} className="font-mono text-sm text-accent hover:underline">← Change topic</button>
        <span className="caret font-mono text-sm font-bold text-accent">Q{String(i + 1).padStart(2, "0")}/{poolLength}</span>
      </div>
      {filter.kind === "scenario" && scenarioPool[i] && (
        <div key={scenarioPool[i].id} className="q-enter">
          <QuestionCard question={scenarioPool[i]} revealed={selected !== null} selected={selected} onSelect={setSelected} />
        </div>
      )}
      {filter.kind === "domain" && theoryPool[i] && (
        <div key={theoryPool[i].id} className="q-enter">
          <TheoryCard question={theoryPool[i]} revealed={selected !== null} selected={selected} onSelect={setSelected} />
        </div>
      )}
      <div className="mx-auto mt-6 flex max-w-3xl justify-end">
        <button disabled={selected === null || i + 1 >= poolLength}
          onClick={() => { setI(i + 1); setSelected(null); }}
          className="arrow-nudge rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent disabled:opacity-40">Next <span className="arrow">→</span></button>
      </div>
    </main>
  );
}
