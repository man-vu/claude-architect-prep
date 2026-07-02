import { STUDY_SLUGS } from "@/content/study";
import { StudyPageView } from "@/views/StudyPageView";

export function generateStaticParams() {
  return STUDY_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  return <StudyPageView locale={locale} slug={slug} />;
}
