import { describe, it, expect } from "vitest";
import { composeExam } from "./exam";
import { mulberry32 } from "./rng";
import type { Question, ScenarioId } from "./types";

function bank(): Question[] {
  const scenarios: ScenarioId[] = [
    "customer-support", "code-generation", "multi-agent-research", "ci",
    "developer-productivity", "structured-data-extraction",
  ];
  const out: Question[] = [];
  for (const s of scenarios) for (let i = 1; i <= 15; i++) {
    out.push({
      id: `${s}-${i}`, scenario: s, domain: "prompt-engineering",
      situation: "s", question: "q",
      options: [
        { letter: "A", text: "a", correct: true }, { letter: "B", text: "b", correct: false },
        { letter: "C", text: "c", correct: false }, { letter: "D", text: "d", correct: false },
      ], correct: "A", explanation: "e",
    });
  }
  return out;
}

describe("composeExam", () => {
  it("draws perScenario*scenarioCount questions from exactly scenarioCount distinct scenarios", () => {
    const exam = composeExam(bank(), { scenarioCount: 4, perScenario: 5 }, mulberry32(42));
    expect(exam).toHaveLength(20);
    expect(new Set(exam.map((q) => q.scenario)).size).toBe(4);
  });
  it("is deterministic for a given seed", () => {
    const a = composeExam(bank(), { scenarioCount: 4, perScenario: 5 }, mulberry32(7));
    const b = composeExam(bank(), { scenarioCount: 4, perScenario: 5 }, mulberry32(7));
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
  it("throws when too few scenarios have enough questions", () => {
    const thin = bank().filter((q) => q.scenario === "ci").slice(0, 3);
    expect(() => composeExam(thin, { scenarioCount: 4, perScenario: 5 })).toThrow();
  });
});
