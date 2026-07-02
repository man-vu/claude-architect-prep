"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { allQuestions } from "@/content/questions";
import { DOMAINS, SCENARIOS } from "@/content/scenarios";
import type { Domain, Letter, ScenarioId } from "@/domain/types";
import { QuestionCard } from "@/components/QuestionCard";

type Filter = { kind: "scenario"; id: ScenarioId } | { kind: "domain"; id: Domain };

export default function Practice() {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);

  const pool = useMemo(() => {
    if (!filter) return [];
    return allQuestions.filter((q) => (filter.kind === "scenario" ? q.scenario === filter.id : q.domain === filter.id));
  }, [filter]);

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
        <h2 className="mt-8 font-mono text-2xl font-bold tracking-tight">Practice by domain</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(DOMAINS) as Domain[]).map((d, idx) => {
            const n = allQuestions.filter((q) => q.domain === d).length;
            return (
              <button key={d} disabled={n === 0} style={{ animationDelay: `${idx * 50}ms` }} onClick={() => { setFilter({ kind: "domain", id: d }); setI(0); setSelected(null); }} className={topicCls}>
                <div className="font-mono text-sm font-semibold">{DOMAINS[d].label}</div>
                <div className="mt-0.5 font-mono text-xs text-ink-soft">{n} questions · weight {DOMAINS[d].weight}%</div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  const q = pool[i];
  return (
    <main className="px-6 py-8">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <button onClick={() => setFilter(null)} className="font-mono text-sm text-accent hover:underline">← Change topic</button>
        <span className="caret font-mono text-sm font-bold text-accent">Q{String(i + 1).padStart(2, "0")}/{pool.length}</span>
      </div>
      {q && (
        <div key={q.id} className="q-enter">
          <QuestionCard question={q} revealed={selected !== null} selected={selected} onSelect={setSelected} />
        </div>
      )}
      <div className="mx-auto mt-6 flex max-w-3xl justify-end">
        <button disabled={selected === null || i + 1 >= pool.length}
          onClick={() => { setI(i + 1); setSelected(null); }}
          className="rounded-md bg-ink px-6 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent disabled:opacity-40">Next →</button>
      </div>
    </main>
  );
}
