import { describe, it, expect } from "vitest";
import { scaledScore, isPass, computeBreakdown } from "./scoring";
import type { Question, QuestionResult } from "./types";

describe("scaledScore", () => {
  it("maps 0% -> 100 and 100% -> 1000", () => {
    expect(scaledScore(0, 20)).toBe(100);
    expect(scaledScore(20, 20)).toBe(1000);
  });
  it("passes at >= 720 (~69%)", () => {
    expect(scaledScore(14, 20)).toBe(730); // 14/20 -> above threshold
    expect(isPass(730)).toBe(true);
    expect(scaledScore(13, 20)).toBe(685); // 13/20 -> below threshold
    expect(isPass(685)).toBe(false);
    expect(isPass(719)).toBe(false);
  });
  it("guards total = 0", () => { expect(scaledScore(0, 0)).toBe(100); });
});

describe("computeBreakdown", () => {
  it("aggregates accuracy by key", () => {
    const q = (id: string, domain: Question["domain"]): Question => ({
      id, scenario: "ci", domain, situation: "s", question: "q",
      options: [
        { letter: "A", text: "a", correct: true }, { letter: "B", text: "b", correct: false },
        { letter: "C", text: "c", correct: false }, { letter: "D", text: "d", correct: false },
      ], correct: "A", explanation: "e",
    });
    const byId = new Map([q("1","prompt-engineering"), q("2","prompt-engineering"), q("3","tool-mcp-design")].map((x) => [x.id, x]));
    const results: QuestionResult[] = [
      { questionId: "1", chosen: "A", correct: true },
      { questionId: "2", chosen: "B", correct: false },
      { questionId: "3", chosen: "A", correct: true },
    ];
    const bd = computeBreakdown(results, byId, "domain");
    const pe = bd.find((b) => b.key === "prompt-engineering")!;
    expect(pe).toEqual({ key: "prompt-engineering", correct: 1, total: 2, pct: 50 });
  });
});
