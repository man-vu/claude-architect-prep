import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DOMAINS } from "@/content/scenarios";
import { STUDY_DOMAINS } from "@/content/study";
import type { Domain } from "@/domain/types";
import { Prose } from "@/components/Prose";

export function generateStaticParams() {
  return STUDY_DOMAINS.map((domain) => ({ domain }));
}
export const dynamicParams = false;

export default async function StudyDomain({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  if (!STUDY_DOMAINS.includes(domain as Domain)) notFound();
  const d = domain as Domain;
  const md = readFileSync(join(process.cwd(), "src/content/study", `${d}.md`), "utf8");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/study" className="text-sm text-blue-700">← Study</Link>
      <div className="mt-3 mb-6">
        <span className="text-xs font-bold uppercase tracking-wide text-blue-700">Domain · {DOMAINS[d].weight}% of exam</span>
        <h1 className="mt-1 text-3xl font-extrabold">{DOMAINS[d].label}</h1>
      </div>
      <Prose>{md}</Prose>
      <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <Link href={`/practice?domain=${d}`} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Practice this domain →</Link>
        <Link href="/study" className="rounded-lg border-2 border-slate-300 px-5 py-2.5 font-semibold hover:bg-slate-50">All topics</Link>
      </div>
    </main>
  );
}
