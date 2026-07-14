import { describe, it, expect } from "vitest";
import { allTheoryQuestions } from "./index";
import { allQuestions } from "@/content/questions";

// Per-domain counts are pinned at full-coverage levels (every concept in the
// study page drilled at least once) — lowering one is a coverage regression.
const EXPECTED: Record<string, number> = {
  "agent-architecture": 36,
  "claude-code-config": 35,
  "prompt-engineering": 37,
  "tool-mcp-design": 34,
  "context-reliability": 35,
};

describe("theory bank", () => {
  it("keeps full-coverage question counts per domain (177 total)", () => {
    for (const [d, n] of Object.entries(EXPECTED)) {
      expect(allTheoryQuestions.filter((q) => q.domain === d), d).toHaveLength(n);
    }
    expect(allTheoryQuestions).toHaveLength(177);
  });
  it("ids never collide with the scenario bank", () => {
    const examIds = new Set(allQuestions.map((q) => q.id));
    for (const q of allTheoryQuestions) expect(examIds.has(q.id)).toBe(false);
  });
  it("questions are theory-style, not scenario-framed", () => {
    for (const q of allTheoryQuestions) {
      expect(q.question, q.id).not.toMatch(/^You(r team| are|'ve| need)/);
    }
  });
  it("no single correct letter dominates the bank", () => {
    const total = allTheoryQuestions.length;
    for (const letter of ["A", "B", "C", "D"] as const) {
      const n = allTheoryQuestions.filter((q) => q.correct === letter).length;
      expect(n, `letter ${letter}`).toBeGreaterThan(total * 0.15);
      expect(n, `letter ${letter}`).toBeLessThan(total * 0.35);
    }
  });
});
