import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="bg-slate-100 text-slate-900 antialiased">{children}</body></html>
  );
}
