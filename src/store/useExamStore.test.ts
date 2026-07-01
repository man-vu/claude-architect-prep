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
    const s = useExamStore.getState();
    s.startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answerCurrent("A"); // correct
    useExamStore.getState().answerCurrent("B"); // wrong
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.results).toHaveLength(2);
    expect(attempt?.scaledScore).toBe(550); // 1/2 correct -> 100+450
    expect(useExamStore.getState().attempts).toHaveLength(1);
  });
  it("caps stored history at 50", () => {
    for (let i = 0; i < 55; i++) {
      useExamStore.getState().startSession("practice", [q("x")]);
      useExamStore.getState().answerCurrent("A");
      useExamStore.getState().finishSession();
    }
    expect(useExamStore.getState().attempts.length).toBe(50);
  });
});
