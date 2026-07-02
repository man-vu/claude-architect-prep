import "./globals.css";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";

// Self-hosted at build time by next/font — no runtime CDN, offline-safe for the PWA.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbm" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-ss4" });

// PWA (service worker + manifest) is wired only for the root deploy. A subpath build
// (NEXT_PUBLIC_BASE_PATH set, e.g. mavox.ca/cca) ships as a plain static app.
const pwa = !process.env.NEXT_PUBLIC_BASE_PATH;

export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
  ...(pwa
    ? {
        manifest: "/manifest.webmanifest",
        appleWebApp: { capable: true, title: "CCA Prep", statusBarStyle: "default" },
        icons: { apple: "/icons/apple-touch-icon.png" },
      }
    : {}),
};
export const viewport: Viewport = { themeColor: "#faf8f3" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}><body className="bg-paper font-serif text-ink antialiased">
      {pwa ? (
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
          {children}
        </SerwistProvider>
      ) : (
        children
      )}
    </body></html>
  );
}
