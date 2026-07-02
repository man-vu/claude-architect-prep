import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_LOCALE } from "@/i18n/locales";

// Server-only (Node.js fs) — import ONLY from server components (e.g. StudyPageView),
// never from a "use client" file, or webpack will try to bundle node:fs for the browser.
export function getStudyMarkdown(locale: string, slug: string): string {
  if (locale !== DEFAULT_LOCALE) {
    const localizedPath = join(process.cwd(), "src/content/i18n", locale, "study", `${slug}.md`);
    if (existsSync(localizedPath)) return readFileSync(localizedPath, "utf8");
  }
  return readFileSync(join(process.cwd(), "src/content/study", `${slug}.md`), "utf8");
}
