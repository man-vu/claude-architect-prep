"use client";
import type { Letter } from "@/domain/types";
import { Markdown } from "./Markdown";
export function Explanation({ correct, text }: { correct: Letter; text: string }) {
  return (
    <div className="mt-4 rounded-r-md border-l-2 border-accent bg-accent-soft/60 p-4 text-sm">
      <div className="mb-1 font-mono text-xs font-bold uppercase tracking-widest text-accent">Why {correct} ▸</div>
      <Markdown>{text}</Markdown>
    </div>
  );
}
