import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/next/react";
export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "CCA Prep", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#2563eb" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="bg-slate-100 text-slate-900 antialiased">
      <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
        {children}
      </SerwistProvider>
    </body></html>
  );
}
