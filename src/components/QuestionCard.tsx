"use client";
import type { Letter, Question } from "@/domain/types";
import { SCENARIOS } from "@/content/scenarios";
import { situationRepeatsQuestion } from "@/domain/text";
import { Markdown } from "./Markdown";
import { OptionList } from "./OptionList";
import { Explanation } from "./Explanation";
import { AudioButton } from "./AudioButton";

export function QuestionCard({
  question, revealed, selected, onSelect,
}: {
  question: Question; revealed: boolean; selected: Letter | null; onSelect: (l: Letter) => void;
}) {
  // Some questions restate the ask at the end of the situation — render it once.
  const askShownInSituation = situationRepeatsQuestion(question.situation, question.question);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
          ▸ {SCENARIOS[question.scenario].label}
        </span>
        <AudioButton id={`q-${question.id}`} />
      </div>
      <div className="my-4 rounded-md border border-line bg-card p-4 text-[16px]">
        <Markdown>{question.situation}</Markdown>
      </div>
      {!askShownInSituation && (
        <div className="mb-4 text-[17px] font-bold"><Markdown>{question.question}</Markdown></div>
      )}
      <OptionList
        options={question.options} selected={selected} correct={question.correct}
        revealed={revealed} onSelect={onSelect}
      />
      {revealed && <Explanation correct={question.correct} text={question.explanation} audioId={`e-${question.id}`} />}
    </div>
  );
}
