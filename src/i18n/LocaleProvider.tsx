"use client";
import { createContext, useContext } from "react";
import type { UiDict } from "./ui";
import { getDict } from "./dict-registry";
import { localeDir } from "./locales";
// Next.js compiles server and client components into SEPARATE module graphs, even
// during static export. content/i18n/register.ts's side effect only reached the
// server bundle when imported solely from [locale]/layout.tsx (a server component)
// -- client components (HomeView, PracticeView, ExamView, ...) got an entirely
// separate, never-populated copy of the same registry modules. Importing the
// side effect here, inside the client component every locale route actually
// renders, guarantees it runs in whichever bundle is consuming it.
import "@/content/i18n/register";

interface LocaleCtx { locale: string; t: UiDict; dir: "ltr" | "rtl" }
const LocaleContext = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const value: LocaleCtx = { locale, t: getDict(locale), dir: localeDir(locale) };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleCtx(): LocaleCtx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT/useLocale must be used within LocaleProvider");
  return ctx;
}
export const useT = (): UiDict => useLocaleCtx().t;
export const useLocale = (): string => useLocaleCtx().locale;
export const useDir = (): "ltr" | "rtl" => useLocaleCtx().dir;
