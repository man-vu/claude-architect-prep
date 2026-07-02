import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STUDY_SLUGS, studyPage } from "@/content/study";
import { Prose } from "@/components/Prose";

export function generateStaticParams() {
  return STUDY_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;

export default async function StudyPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = studyPage(slug);
  if (!page) notFound();
  const md = readFileSync(join(process.cwd(), "src/content/study", `${slug}.md`), "utf8");
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/study" className="font-mono text-sm text-accent hover:underline">← Study</Link>
      <div className="mt-3 mb-6">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
          {page.group === "domain" ? `▸ Domain · ${page.weight}% of exam` : "▸ Reference"}
        </span>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight">{page.title}</h1>
      </div>
      <Prose>{md}</Prose>
      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
        {page.group === "domain" && (
          <Link href={`/practice?domain=${slug}`} className="rounded-md bg-ink px-5 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent">Practice this domain →</Link>
        )}
        <Link href="/study" className="rounded-md border border-line bg-card px-5 py-2.5 font-mono text-sm font-semibold transition-colors hover:border-ink-soft">All topics</Link>
      </div>
    </main>
  );
}
