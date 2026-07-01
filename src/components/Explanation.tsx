"use client";
import type { Letter } from "@/domain/types";
import { Markdown } from "./Markdown";
export function Explanation({ correct, text }: { correct: Letter; text: string }) {
  return (
    <div className="mt-4 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
      <strong>Why {correct}: </strong>
      <span><Markdown>{text}</Markdown></span>
    </div>
  );
}
