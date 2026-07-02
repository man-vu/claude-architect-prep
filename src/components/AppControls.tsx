import { ThemeToggle } from "./ThemeToggle";
import { TextSizeControl } from "./TextSizeControl";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Fixed top controls cluster, rendered once per locale layout (inside that
 *  locale's LocaleProvider so ThemeToggle/TextSizeControl read the right dict). */
export function AppControls({ locale }: { locale: string }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-wrap items-center justify-end gap-2 rtl:right-auto rtl:left-4">
      <LanguageSwitcher locale={locale} />
      <TextSizeControl />
      <ThemeToggle />
    </div>
  );
}
