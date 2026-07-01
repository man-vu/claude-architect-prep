import Link from "next/link";
import { DOMAINS } from "@/content/scenarios";
import { STUDY_DOMAINS, STUDY_BLURBS } from "@/content/study";

export default function Study() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-700">← Home</Link>
      <h1 className="mt-3 text-3xl font-extrabold">Study the theory</h1>
      <p className="mt-2 text-slate-600">Comprehensive notes for each exam domain. The percentage is the domain&apos;s weight on the exam.</p>
      <div className="mt-6 grid gap-3">
        {STUDY_DOMAINS.map((d) => (
          <Link key={d} href={`/study/${d}`} className="rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{DOMAINS[d].label}</span>
              <span className="text-sm font-bold text-blue-700">{DOMAINS[d].weight}%</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{STUDY_BLURBS[d]}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
