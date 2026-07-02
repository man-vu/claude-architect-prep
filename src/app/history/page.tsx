"use client";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";

export default function History() {
  const attempts = useExamStore((s) => s.attempts);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="font-mono text-sm text-accent hover:underline">← Home</Link>
      <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight">History</h1>
      {attempts.length === 0 && <p className="mt-4 text-ink-soft">No attempts yet.</p>}
      <ul className="mt-4 space-y-2">
        {attempts.map((a) => {
          const correct = a.results.filter((r) => r.correct).length;
          return (
            <li key={a.id} className="flex items-center justify-between rounded-md border border-line bg-card px-4 py-3">
              <div>
                <div className="font-mono text-sm font-semibold capitalize">{a.mode}</div>
                <div className="font-mono text-xs text-ink-soft">{new Date(a.finishedAt).toLocaleString()} · {correct}/{a.results.length}</div>
              </div>
              <div className={`font-mono text-lg font-bold ${a.passed ? "text-ok" : "text-ink-soft"}`}>{a.scaledScore}</div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
