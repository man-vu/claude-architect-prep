"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Attempt, Letter, Question, QuestionResult } from "@/domain/types";
import { isPass, scaledScore } from "@/domain/scoring";

const HISTORY_CAP = 50;
let counter = 0;
function newId(): string { counter += 1; return `a${Date.now()}-${counter}`; }

interface Session {
  mode: "exam" | "practice";
  questions: Question[];
  answers: Record<string, Letter>;
  startedAt: number;
}

interface ExamState {
  attempts: Attempt[];
  session: Session | null;
  startSession: (mode: "exam" | "practice", questions: Question[]) => void;
  answer: (questionId: string, letter: Letter) => void;
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
        set({ session: { mode, questions, answers: {}, startedAt: Date.now() } }),
      // Answers keyed by questionId — safe against re-selection and out-of-order navigation.
      answer: (questionId, letter) => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, answers: { ...s.answers, [questionId]: letter } } });
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
        const scenariosUsed = [...new Set(s.questions.map((q) => q.scenario))];
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
    // session is persisted so an in-progress exam survives refresh/close (resumed by the exam page).
    { name: "cca-prep", partialize: (s) => ({ attempts: s.attempts, session: s.session }) },
  ),
);
