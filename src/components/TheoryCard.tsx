"use client";
import type { Letter, TheoryQuestion } from "@/domain/types";
import { Markdown } from "./Markdown";
import { OptionList } from "./OptionList";
import { Explanation } from "./Explanation";
import { AudioButton } from "./AudioButton";
import { useT, useLocale } from "@/i18n/LocaleProvider";
import { getDomainLabel } from "@/content/i18n";

export function TheoryCard({
  question, revealed, selected, onSelect,
}: {
  question: TheoryQuestion; revealed: boolean; selected: Letter | null; onSelect: (l: Letter) => void;
}) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
          {t.common.theoryChip(getDomainLabel(locale, question.domain))}
        </span>
        <AudioButton id={`q-${question.id}`} />
      </div>
      <div className="my-4 text-[1.0625rem] font-bold"><Markdown>{question.question}</Markdown></div>
      <OptionList
        options={question.options} selected={selected} correct={question.correct}
        revealed={revealed} onSelect={onSelect}
      />
      {revealed && <Explanation correct={question.correct} text={question.explanation} audioId={`e-${question.id}`} />}
    </div>
  );
}
