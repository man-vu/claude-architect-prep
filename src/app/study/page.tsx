import Link from "next/link";
import { STUDY_PAGES } from "@/content/study";

function Card({ slug, title, weight, blurb }: { slug: string; title: string; weight?: number; blurb: string }) {
  return (
    <Link href={`/study/${slug}`} className="rounded-xl border-2 border-slate-200 bg-white p-4 hover:bg-slate-50">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{title}</span>
        {weight != null && <span className="text-sm font-bold text-blue-700">{weight}%</span>}
      </div>
      <p className="mt-1 text-sm text-slate-500">{blurb}</p>
    </Link>
  );
}

export default function Study() {
  const domains = STUDY_PAGES.filter((p) => p.group === "domain");
  const reference = STUDY_PAGES.filter((p) => p.group === "reference");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-700">← Home</Link>
      <h1 className="mt-3 text-3xl font-extrabold">Study the theory</h1>
      <p className="mt-2 text-slate-600">Comprehensive notes for each exam domain, plus reference material. Percentages are exam weight.</p>
      <h2 className="mt-8 mb-3 text-lg font-bold">Exam domains</h2>
      <div className="grid gap-3">
        {domains.map((p) => <Card key={p.slug} slug={p.slug} title={p.title} weight={p.weight} blurb={p.blurb} />)}
      </div>
      <h2 className="mt-8 mb-3 text-lg font-bold">Reference</h2>
      <div className="grid gap-3">
        {reference.map((p) => <Card key={p.slug} slug={p.slug} title={p.title} blurb={p.blurb} />)}
      </div>
    </main>
  );
}
