"use client";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";
import { Stat } from "@/components/Stat";

export default function Home() {
  const attempts = useExamStore((s) => s.attempts);
  const best = useExamStore((s) => s.bestScore());
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-extrabold">Claude Certified Architect — Practice</h1>
      <p className="mt-2 text-slate-600">Foundations exam prep. Score 100–1000, pass at 720.</p>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Best exam" value={best !== null ? String(best) : "—"} />
        <Stat label="Attempts" value={String(attempts.length)} />
        <Stat label="Pass mark" value="720" />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/exam" className="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-center text-lg font-semibold text-white hover:bg-blue-700">Start exam</Link>
        <Link href="/practice" className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-4 text-center text-lg font-semibold hover:bg-slate-50">Practice by topic</Link>
      </div>
      <Link href="/history" className="mt-4 inline-block text-sm text-blue-700 hover:underline">View history →</Link>
    </main>
  );
}
