"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Attempt, Letter, Question, QuestionResult, ScenarioId } from "@/domain/types";
import { isPass, scaledScore } from "@/domain/scoring";

const HISTORY_CAP = 50;
let counter = 0;
function newId(): string { counter += 1; return `a${Date.now()}-${counter}`; }

interface Session {
  mode: "exam" | "practice";
  questions: Question[];
  index: number;
  answers: Record<string, Letter | null>;
  startedAt: number;
}

interface ExamState {
  attempts: Attempt[];
  session: Session | null;
  startSession: (mode: "exam" | "practice", questions: Question[]) => void;
  answerCurrent: (letter: Letter) => void;
  goto: (index: number) => void;
  finishSession: () => Attempt | null;
  resetSession: () => void;
  bestScore: () => number | null;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      attempts: [],
      session: null,
      startSession: (mode, questions) =>
        set({ session: { mode, questions, index: 0, answers: {}, startedAt: Date.now() } }),
      answerCurrent: (letter) => {
        const s = get().session;
        if (!s) return;
        const qid = s.questions[s.index].id;
        const answers = { ...s.answers, [qid]: letter };
        const index = Math.min(s.index + 1, s.questions.length);
        set({ session: { ...s, answers, index } });
      },
      goto: (index) => {
        const s = get().session;
        if (s) set({ session: { ...s, index } });
      },
      finishSession: () => {
        const s = get().session;
        if (!s) return null;
        const results: QuestionResult[] = s.questions.map((q) => {
          const chosen = s.answers[q.id] ?? null;
          return { questionId: q.id, chosen, correct: chosen === q.correct };
        });
        const correct = results.filter((r) => r.correct).length;
        const score = scaledScore(correct, results.length);
        const scenariosUsed = [...new Set(s.questions.map((q) => q.scenario))] as ScenarioId[];
        const attempt: Attempt = {
          id: newId(), mode: s.mode, startedAt: s.startedAt, finishedAt: Date.now(),
          scenariosUsed, results, scaledScore: score, passed: isPass(score),
        };
        set({ attempts: [attempt, ...get().attempts].slice(0, HISTORY_CAP), session: null });
        return attempt;
      },
      resetSession: () => set({ session: null }),
      bestScore: () => {
        const scores = get().attempts.filter((a) => a.mode === "exam").map((a) => a.scaledScore);
        return scores.length ? Math.max(...scores) : null;
      },
    }),
    { name: "cca-prep", partialize: (s) => ({ attempts: s.attempts }) },
  ),
);
