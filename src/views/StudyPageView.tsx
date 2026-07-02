import { notFound } from "next/navigation";
import Link from "next/link";
import { studyPage } from "@/content/study";
import { getStudyPages } from "@/content/i18n";
import { getStudyMarkdown } from "@/content/i18n/server";
import { getDict } from "@/i18n/dict-registry";
import { localeHref } from "@/i18n/locales";
import { Prose } from "@/components/Prose";
import { StudyAudio } from "@/components/StudyAudio";

// Server component: runs at build time (static export), so it reads the dict via
// the plain getDict(locale) function rather than the useT() client hook.
export async function StudyPageView({ locale, slug }: { locale: string; slug: string }) {
  const page = studyPage(slug);
  if (!page) notFound();
  const t = getDict(locale);
  const localizedMeta = getStudyPages(locale).find((p) => p.slug === slug)!;
  const md = getStudyMarkdown(locale, slug);
  const href = (p: string) => localeHref(locale, p);
  return (
    <>
      {/* Outside <main>: a completed CSS animation leaves a resolved (if identity)
          transform on the element, which creates a new containing block for any
          position:fixed descendant — breaking the audio drawer's viewport docking. */}
      <StudyAudio slug={slug} />
      <Link
        href={href("/study")}
        aria-label={t.study.allTopics}
        className="theme-smooth fixed top-4 left-4 z-[51] rounded-md border border-line bg-card px-3 py-2 font-mono text-xs font-semibold text-accent shadow-md transition-colors hover:bg-accent hover:text-paper rtl:right-4 rtl:left-auto"
      >
        {t.study.back}
      </Link>
      <main className="page-enter mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
            {page.group === "domain" ? t.study.domainWeight(page.weight!) : t.study.referenceTag}
          </span>
          <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight">{localizedMeta.title}</h1>
        </div>
        <Prose slug={slug}>{md}</Prose>
        <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
          {page.group === "domain" && (
            <Link href={href(`/practice?domain=${slug}`)} className="rounded-md bg-ink px-5 py-2.5 font-mono text-sm font-semibold text-paper transition-colors hover:bg-accent">{t.study.drillThisDomain} →</Link>
          )}
          <Link href={href("/study")} className="rounded-md border border-line bg-card px-5 py-2.5 font-mono text-sm font-semibold transition-colors hover:border-ink-soft">{t.study.allTopics}</Link>
        </div>
      </main>
    </>
  );
}
