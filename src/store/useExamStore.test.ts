import { describe, it, expect, beforeEach } from "vitest";
import { useExamStore } from "./useExamStore";
import type { Question } from "@/domain/types";

const q = (id: string): Question => ({
  id, scenario: "ci", domain: "claude-code-config", situation: "s", question: "q",
  options: [
    { letter: "A", text: "a", correct: true }, { letter: "B", text: "b", correct: false },
    { letter: "C", text: "c", correct: false }, { letter: "D", text: "d", correct: false },
  ], correct: "A", explanation: "e",
});

beforeEach(() => {
  localStorage.clear();
  useExamStore.setState({ attempts: [], session: null });
});

describe("exam store", () => {
  it("records an attempt with a scaled score on finish", () => {
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "A"); // correct
    useExamStore.getState().answer("2", "B"); // wrong
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.results).toHaveLength(2);
    expect(attempt?.scaledScore).toBe(550);
    expect(useExamStore.getState().attempts).toHaveLength(1);
  });
  it("scores unanswered questions as incorrect (chosen null)", () => {
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "A");
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.results[1]).toEqual({ questionId: "2", chosen: null, correct: false });
  });
  it("re-answering the same question overwrites, not corrupts", () => {
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "B"); // wrong first
    useExamStore.getState().answer("1", "A"); // corrected
    useExamStore.getState().answer("2", "A");
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.scaledScore).toBe(1000);
  });
  it("bestScore is the max exam score, null when no exams", () => {
    expect(useExamStore.getState().bestScore()).toBeNull();
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "A");
    useExamStore.getState().answer("2", "A");
    useExamStore.getState().finishSession();
    expect(useExamStore.getState().bestScore()).toBe(1000);
  });
  it("caps stored history at 50", () => {
    for (let i = 0; i < 55; i++) {
      useExamStore.getState().startSession("practice", [q("x")]);
      useExamStore.getState().answer("x", "A");
      useExamStore.getState().finishSession();
    }
    expect(useExamStore.getState().attempts.length).toBe(50);
  });
});
