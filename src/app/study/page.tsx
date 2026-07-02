import Link from "next/link";
import { STUDY_PAGES } from "@/content/study";

function Card({ slug, title, weight, blurb, delayMs }: { slug: string; title: string; weight?: number; blurb: string; delayMs: number }) {
  return (
    <Link href={`/study/${slug}`} style={{ animationDelay: `${delayMs}ms` }} className="rise theme-smooth rounded-md border border-line bg-card p-4 transition-colors hover:border-ink-soft">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-sm font-semibold">{title}</span>
        {weight != null && <span className="font-mono text-sm font-bold text-accent">{weight}%</span>}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{blurb}</p>
    </Link>
  );
}

export default function Study() {
  const domains = STUDY_PAGES.filter((p) => p.group === "domain");
  const reference = STUDY_PAGES.filter((p) => p.group === "reference");
  return (
    <main className="page-enter mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="font-mono text-sm text-accent hover:underline">← Home</Link>
      <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight">Study the theory</h1>
      <p className="mt-2 text-ink-soft">Comprehensive notes for each exam domain, plus reference material. Percentages are exam weight.</p>
      <h2 className="mt-8 mb-3 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ Exam domains</h2>
      <div className="grid gap-3">
        {domains.map((p, idx) => <Card key={p.slug} slug={p.slug} title={p.title} weight={p.weight} blurb={p.blurb} delayMs={idx * 60} />)}
      </div>
      <h2 className="mt-8 mb-3 font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">▸ Reference</h2>
      <div className="grid gap-3">
        {reference.map((p, idx) => <Card key={p.slug} slug={p.slug} title={p.title} blurb={p.blurb} delayMs={(domains.length + idx) * 60} />)}
      </div>
    </main>
  );
}
