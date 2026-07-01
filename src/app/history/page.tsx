"use client";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";

export default function History() {
  const attempts = useExamStore((s) => s.attempts);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-700">← Home</Link>
      <h1 className="mt-3 text-2xl font-bold">History</h1>
      {attempts.length === 0 && <p className="mt-4 text-slate-500">No attempts yet.</p>}
      <ul className="mt-4 space-y-2">
        {attempts.map((a) => {
          const correct = a.results.filter((r) => r.correct).length;
          return (
            <li key={a.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div>
                <div className="font-semibold capitalize">{a.mode}</div>
                <div className="text-xs text-slate-500">{new Date(a.finishedAt).toLocaleString()} · {correct}/{a.results.length}</div>
              </div>
              <div className={`text-lg font-extrabold ${a.passed ? "text-green-600" : "text-slate-700"}`}>{a.scaledScore}</div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
