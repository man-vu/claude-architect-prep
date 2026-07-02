"use client";
import type { Letter, Option } from "@/domain/types";
import { Markdown } from "./Markdown";

export function OptionList({
  options, selected, correct, revealed, onSelect,
}: {
  options: Option[]; selected: Letter | null; correct: Letter;
  revealed: boolean; onSelect: (l: Letter) => void;
}) {
  return (
    // Toggle-button semantics (aria-pressed) rather than the radio pattern: arrow keys
    // are reserved for question navigation, which the radio pattern would claim.
    <div role="group" aria-label="Answer choices A to D" className="flex flex-col gap-2.5">
      {options.map((o) => {
        const isSel = selected === o.letter;
        let cls = "border-line bg-card hover:border-ink-soft";
        let letterCls = "text-ink-soft";
        if (revealed && o.letter === correct) { cls = "border-ok bg-ok-soft"; letterCls = "text-ok"; }
        else if (revealed && isSel) { cls = "border-bad bg-bad-soft"; letterCls = "text-bad"; }
        else if (isSel) { cls = "border-accent bg-accent-soft"; letterCls = "text-accent"; }
        return (
          <button
            key={o.letter} type="button" disabled={revealed} aria-pressed={isSel}
            onClick={() => onSelect(o.letter)}
            className={`flex items-start gap-3 rounded-md border p-3.5 text-left transition-colors active:scale-[0.995] ${cls} disabled:cursor-default`}
          >
            <span className={`shrink-0 pt-0.5 font-mono text-sm font-bold ${letterCls}`}>[{o.letter}]</span>
            <span className="min-w-0 pt-0.5 text-[15px]"><Markdown>{o.text}</Markdown></span>
          </button>
        );
      })}
    </div>
  );
}
