import type { UiDict } from "./ui";
import { EN } from "./ui";
import { DEFAULT_LOCALE } from "./locales";

// No "use client" here — getDict must be callable from server components
// (StudyPageView) as well as the client LocaleProvider; a plain function export
// from a "use client" module can't be invoked directly from server code.
const REGISTRY: Record<string, UiDict> = {};

export function registerDict(locale: string, dict: UiDict) {
  REGISTRY[locale] = dict;
}

export function getDict(locale: string): UiDict {
  if (locale === DEFAULT_LOCALE) return EN;
  return REGISTRY[locale] ?? EN;
}
