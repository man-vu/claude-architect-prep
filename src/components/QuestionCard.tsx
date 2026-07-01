"use client";
import type { Letter, Question } from "@/domain/types";
import { SCENARIOS } from "@/content/scenarios";
import { Markdown } from "./Markdown";
import { OptionList } from "./OptionList";
import { Explanation } from "./Explanation";

export function QuestionCard({
  question, revealed, selected, onSelect,
}: {
  question: Question; revealed: boolean; selected: Letter | null; onSelect: (l: Letter) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
        {SCENARIOS[question.scenario].label}
      </span>
      <div className="my-4 rounded-xl border border-blue-100 bg-white p-4 text-[16px] font-medium shadow-sm">
        <Markdown>{question.situation}</Markdown>
      </div>
      <div className="mb-4 text-[17px] font-bold"><Markdown>{question.question}</Markdown></div>
      <OptionList
        options={question.options} selected={selected} correct={question.correct}
        revealed={revealed} onSelect={onSelect}
      />
      {revealed && <Explanation correct={question.correct} text={question.explanation} />}
    </div>
  );
}
