import "./globals.css";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";

// Self-hosted at build time by next/font — no runtime CDN, offline-safe for the PWA.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbm" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-ss4" });

// The service worker + manifest are wired only for the root deploy. A subpath build
// (NEXT_PUBLIC_BASE_PATH set, e.g. mavox.ca/cca) ships without them, but keeps the
// apple-web-app metadata so iOS "Add to Home Screen" still installs it standalone.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pwa = !basePath;

export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
  appleWebApp: { capable: true, title: "CCA Prep", statusBarStyle: "default" },
  icons: { apple: `${basePath}/icons/apple-touch-icon.png` },
  other: { "apple-mobile-web-app-capable": "yes" },
  ...(pwa ? { manifest: "/manifest.webmanifest" } : {}),
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#16151c" },
  ],
};

// Runs before paint so a stored dark preference, text-size preference, and the
// locale's language/direction (read from the URL path, since a static-export root
// layout has no access to descendant route params) never flash the wrong value.
const RTL_LOCALES = ["ar", "he", "ur"];
const themeInit = `(function(){try{
var t=localStorage.getItem("cca-theme");
var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);
if(d)document.documentElement.classList.add("dark");
var f=parseFloat(localStorage.getItem("cca-font")||"1");
if(f&&f!==1)document.documentElement.style.fontSize=(f*100)+"%";
var seg=(location.pathname.split("/")[1]||"").split(".")[0];
var rtl=${JSON.stringify(RTL_LOCALES)};
if(seg){document.documentElement.lang=seg;if(rtl.indexOf(seg)!==-1)document.documentElement.dir="rtl"}
}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${mono.variable} ${serif.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body className="bg-paper font-serif text-ink antialiased">
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
