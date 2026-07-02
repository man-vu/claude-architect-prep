"use client";
import { createContext, useContext } from "react";
import type { UiDict } from "./ui";
import { getDict } from "./dict-registry";
import { localeDir } from "./locales";

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
