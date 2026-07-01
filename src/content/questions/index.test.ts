import { describe, it, expect } from "vitest";
import { allQuestions } from "./index";

describe("question bank", () => {
  it("has the 60 legacy questions across 4 scenarios", () => {
    expect(allQuestions.length).toBeGreaterThanOrEqual(60);
    const legacy = ["customer-support", "code-generation", "multi-agent-research", "ci"] as const;
    for (const s of legacy) {
      expect(allQuestions.filter((q) => q.scenario === s)).toHaveLength(15);
    }
  });
  it("every question has a valid domain", () => {
    for (const q of allQuestions) expect(q.domain).toBeTruthy();
  });
  it("has 15 questions in every one of the 8 scenarios (120 total)", () => {
    const all = [
      "customer-support", "code-generation", "multi-agent-research", "ci",
      "developer-productivity", "structured-data-extraction",
      "conversational-ai", "agentic-ai-tools",
    ] as const;
    for (const s of all) expect(allQuestions.filter((q) => q.scenario === s)).toHaveLength(15);
    expect(allQuestions).toHaveLength(120);
  });
});
