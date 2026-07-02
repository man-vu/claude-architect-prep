// Supported locales. "en" is the default and lives at the unprefixed routes
// (/, /exam, /study/...) for backward compatibility with existing URLs; every
// other locale is served under /<locale>/... via the [locale] route group.
export const DEFAULT_LOCALE = "en" as const;

export interface LocaleMeta {
  code: string;
  /** Name in the language itself, for the language switcher. */
  nativeName: string;
  dir: "ltr" | "rtl";
}

export const LOCALES: LocaleMeta[] = [
  { code: "en", nativeName: "English", dir: "ltr" },
  { code: "es", nativeName: "Español", dir: "ltr" },
  { code: "fr", nativeName: "Français", dir: "ltr" },
  { code: "it", nativeName: "Italiano", dir: "ltr" },
  { code: "vi", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "tr", nativeName: "Türkçe", dir: "ltr" },
  { code: "ru", nativeName: "Русский", dir: "ltr" },
  { code: "ja", nativeName: "日本語", dir: "ltr" },
  { code: "ko", nativeName: "한국어", dir: "ltr" },
  { code: "zh", nativeName: "中文（简体）", dir: "ltr" },
  { code: "zh-tw", nativeName: "中文（繁體）", dir: "ltr" },
  { code: "ar", nativeName: "العربية", dir: "rtl" },
  { code: "he", nativeName: "עברית", dir: "rtl" },
  { code: "ur", nativeName: "اردو", dir: "rtl" },
];

// Locales served under /<locale>/... (everything except the default).
export const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) => l.code);

export function isLocale(value: string): boolean {
  return LOCALES.some((l) => l.code === value);
}

export function localeDir(locale: string): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
}

/** basePath-aware href builder: en -> "/path", es -> "/es/path". */
export function localeHref(locale: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean}`;
}
