"use client";
import type { Letter } from "@/domain/types";
import { Markdown } from "./Markdown";
import { AudioButton } from "./AudioButton";
import { useT } from "@/i18n/LocaleProvider";

export function Explanation({ correct, text, audioId }: { correct: Letter; text: string; audioId?: string }) {
  const t = useT();
  return (
    <div className="rise mt-4 rounded-r-md border-l-2 border-accent bg-accent-soft/60 p-4 text-sm">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">{t.exam.why(correct)}</span>
        {audioId && <AudioButton id={audioId} />}
      </div>
      <Markdown>{text}</Markdown>
    </div>
  );
}
