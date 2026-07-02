import { NON_DEFAULT_LOCALES } from "@/i18n/locales";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { AppControls } from "@/components/AppControls";
import "@/content/i18n/register";

export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((locale) => ({ locale }));
}
export const dynamicParams = false;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LocaleProvider locale={locale}>
      <AppControls locale={locale} />
      {children}
    </LocaleProvider>
  );
}
