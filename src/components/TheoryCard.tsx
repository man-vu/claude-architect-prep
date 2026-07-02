"use client";
import type { Letter, TheoryQuestion } from "@/domain/types";
import { DOMAINS } from "@/content/scenarios";
import { Markdown } from "./Markdown";
import { OptionList } from "./OptionList";
import { Explanation } from "./Explanation";

export function TheoryCard({
  question, revealed, selected, onSelect,
}: {
  question: TheoryQuestion; revealed: boolean; selected: Letter | null; onSelect: (l: Letter) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
        ▸ {DOMAINS[question.domain].label} · theory
      </span>
      <div className="my-4 text-[17px] font-bold"><Markdown>{question.question}</Markdown></div>
      <OptionList
        options={question.options} selected={selected} correct={question.correct}
        revealed={revealed} onSelect={onSelect}
      />
      {revealed && <Explanation correct={question.correct} text={question.explanation} />}
    </div>
  );
}
