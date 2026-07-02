import "./globals.css";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Self-hosted at build time by next/font — no runtime CDN, offline-safe for the PWA.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbm" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-ss4" });

// The service worker + manifest are wired only for the root deploy. A subpath build
// (NEXT_PUBLIC_BASE_PATH set, e.g. mavox.ca/cca) ships without them, but keeps the
// apple-web-app metadata so iOS "Add to Home Screen" still installs it standalone.
const pwa = !process.env.NEXT_PUBLIC_BASE_PATH;

export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
  appleWebApp: { capable: true, title: "CCA Prep", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  ...(pwa ? { manifest: "/manifest.webmanifest" } : {}),
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#16151c" },
  ],
};

// Runs before paint so a stored dark preference never flashes light.
const themeInit = `(function(){try{var t=localStorage.getItem("cca-theme");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${mono.variable} ${serif.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body className="bg-paper font-serif text-ink antialiased">
        <ThemeToggle />
        {pwa ? (
          <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
            {children}
          </SerwistProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
