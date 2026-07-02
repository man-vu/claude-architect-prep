"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, DEFAULT_LOCALE, NON_DEFAULT_LOCALES } from "@/i18n/locales";

// Strip a leading /<locale> segment (if present) to get the locale-independent
// path, then rebuild it under the target locale.
function pathWithoutLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (NON_DEFAULT_LOCALES.includes(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest || "/";
  }
  return pathname;
}

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  const base = pathWithoutLocale(pathname ?? "/");

  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Choose language"
        className="theme-smooth rounded-md border border-line bg-card px-3 py-1.5 font-mono text-xs font-semibold text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
      >
        {current.code.toUpperCase()}
      </button>
      {open && (
        <ul className="theme-smooth absolute right-0 z-50 mt-1 max-h-72 w-44 overflow-y-auto rounded-md border border-line bg-card p-1 shadow-lg rtl:right-auto rtl:left-0">
          {LOCALES.map((l) => {
            const href = l.code === DEFAULT_LOCALE ? base : `/${l.code}${base === "/" ? "" : base}`;
            return (
              <li key={l.code}>
                <a
                  href={href} dir={l.dir}
                  className={`block rounded px-2 py-1.5 text-left font-mono text-xs transition-colors hover:text-accent ${l.code === locale ? "bg-accent-soft text-accent" : "text-ink-soft"}`}
                >
                  {l.nativeName}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
