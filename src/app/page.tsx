"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";
import { Stat } from "@/components/Stat";

export default function Home() {
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-accent">▸ Foundations certification prep</p>
      <h1 className="caret mt-2 font-mono text-3xl font-bold tracking-tight sm:text-4xl">Claude Certified Architect</h1>
      <p className="mt-3 text-ink-soft">Score 100–1000 · pass at 720 · 60 questions in 120 minutes.</p>
      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="Best exam" value={best !== null ? String(best) : "—"} />
        <Stat label="Attempts" value={String(attempts.length)} />
        <Stat label="Pass mark" value="720" />
      </div>
      {resumable && (
        <Link href="/exam" className="mt-8 block rounded-md border border-accent bg-accent-soft px-6 py-4 text-center font-mono text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-paper">
          Resume exam — {resumable.answered}/{resumable.total} answered →
        </Link>
      )}
      <div className={`${resumable ? "mt-3" : "mt-8"} flex flex-col gap-3 sm:flex-row`}>
        <Link href="/exam" className="flex-1 rounded-md bg-ink px-6 py-4 text-center font-mono text-base font-semibold text-paper transition-colors hover:bg-accent">
          {resumable ? "Resume exam" : "Start exam"}
        </Link>
        <Link href="/practice" className="flex-1 rounded-md border border-line bg-card px-6 py-4 text-center font-mono text-base font-semibold transition-colors hover:border-ink-soft">Practice by topic</Link>
      </div>
      <Link href="/study" className="mt-3 block rounded-md border border-line bg-card px-6 py-4 text-center font-mono text-base font-semibold transition-colors hover:border-ink-soft">Study the theory</Link>
      <Link href="/history" className="mt-5 inline-block font-mono text-sm text-accent hover:underline">View history →</Link>
    </main>
  );
}
