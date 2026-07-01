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
    <div className="flex flex-col gap-2.5">
      {options.map((o) => {
        const isSel = selected === o.letter;
        let cls = "border-slate-200 bg-white";
        if (revealed && o.letter === correct) cls = "border-green-500 bg-green-50";
        else if (revealed && isSel) cls = "border-red-400 bg-red-50";
        else if (isSel) cls = "border-blue-400 bg-blue-50";
        return (
          <button
            key={o.letter} type="button" disabled={revealed}
            onClick={() => onSelect(o.letter)}
            className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition ${cls} disabled:cursor-default`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{o.letter}</span>
            <span className="pt-0.5 text-[15px]"><Markdown>{o.text}</Markdown></span>
          </button>
        );
      })}
    </div>
  );
}
