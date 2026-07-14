import { describe, it, expect } from "vitest";
import { allQuestions } from "./index";

// Per-scenario counts are pinned — lowering one is a coverage regression, and any
// scenario dropping below 15 stops being exam-eligible (composeExam needs perScenario=15).
const EXPECTED: Record<string, number> = {
  "customer-support": 15,
  "code-generation": 15,
  "multi-agent-research": 22,
  ci: 16,
  "developer-productivity": 15,
  "structured-data-extraction": 19,
  "tool-design": 15,
};

describe("question bank", () => {
  it("keeps pinned question counts per scenario (117 total)", () => {
    for (const [s, n] of Object.entries(EXPECTED)) {
      expect(allQuestions.filter((q) => q.scenario === s), s).toHaveLength(n);
    }
    expect(allQuestions).toHaveLength(117);
  });
  it("every scenario stays exam-eligible with at least 15 questions", () => {
    for (const s of Object.keys(EXPECTED)) {
      expect(allQuestions.filter((q) => q.scenario === s).length, s).toBeGreaterThanOrEqual(15);
    }
  });
  it("every question has a valid domain", () => {
    for (const q of allQuestions) expect(q.domain).toBeTruthy();
  });
});
