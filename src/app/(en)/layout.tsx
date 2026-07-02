import { LocaleProvider } from "@/i18n/LocaleProvider";
import { AppControls } from "@/components/AppControls";

// English lives at the unprefixed routes (/, /exam, ...) for backward compatibility
// with existing URLs. The (en) segment is a route group — it doesn't add a URL prefix.
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="en">
      <AppControls locale="en" />
      {children}
    </LocaleProvider>
  );
}
