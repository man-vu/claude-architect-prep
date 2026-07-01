"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { allQuestions } from "@/content/questions";
import { composeExam } from "@/domain/exam";
import type { Attempt, Letter, Question } from "@/domain/types";
import { useExamStore } from "@/store/useExamStore";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsSummary } from "@/components/ResultsSummary";

export default function Exam() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Letter>>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const startSession = useExamStore((s) => s.startSession);
  const answer = useExamStore((s) => s.answer);
  const finishSession = useExamStore((s) => s.finishSession);

  // Compose the exam AFTER mount: the random draw would otherwise differ between the
  // prerendered static HTML and the first client render, causing a hydration mismatch.
  // Both the server output and the first client render show the loading state, so they match.
  useEffect(() => {
    const qs = composeExam(allQuestions, { scenarioCount: 4, perScenario: 5 });
    setQuestions(qs);
    startSession("exam", qs);
  }, [startSession]);

  if (!questions) {
    return <main className="mx-auto max-w-3xl px-6 py-10 text-slate-500">Preparing your exam…</main>;
  }

  if (attempt) {
    return (
      <main className="px-6 py-8">
        <ResultsSummary attempt={attempt} questions={questions} />
        <div className="mx-auto mt-8 max-w-3xl"><Link href="/" className="text-blue-700">← Home</Link></div>
      </main>
    );
  }

  const q = questions[i];
  const answered = Object.keys(answers).length;
  const select = (l: Letter) => {
    setAnswers((a) => ({ ...a, [q.id]: l }));
    answer(q.id, l);
  };
  const submit = () => setAttempt(finishSession());

  return (
    <main className="px-6 py-8">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <span className="text-sm text-slate-500">Question {i + 1} / {questions.length}</span>
        <span className="text-sm text-slate-500">{answered} answered</span>
      </div>
      <QuestionCard question={q} revealed={false} selected={answers[q.id] ?? null} onSelect={select} />
      <div className="mx-auto mt-6 flex max-w-3xl justify-between">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-lg border-2 border-slate-300 px-5 py-2.5 disabled:opacity-40">Prev</button>
        {i + 1 < questions.length
          ? <button onClick={() => setI(i + 1)} className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white">Next</button>
          : <button onClick={submit} className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white">Finish</button>}
      </div>
    </main>
  );
}
