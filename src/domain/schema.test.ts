import { describe, it, expect } from "vitest";
import { validateQuestionBank } from "./schema";

const ok = {
  id: "customer-support-01", scenario: "customer-support", domain: "context-reliability",
  situation: "s", question: "q",
  options: [
    { letter: "A", text: "a", correct: false }, { letter: "B", text: "b", correct: true },
    { letter: "C", text: "c", correct: false }, { letter: "D", text: "d", correct: false },
  ],
  correct: "B", explanation: "e",
};

describe("validateQuestionBank", () => {
  it("accepts a well-formed question", () => {
    expect(validateQuestionBank([ok])).toHaveLength(1);
  });
  it("rejects a question without exactly one correct option", () => {
    const two = { ...ok, options: ok.options.map((o) => ({ ...o, correct: true })) };
    expect(() => validateQuestionBank([two])).toThrow();
  });
  it("rejects when `correct` letter does not match the correct option", () => {
    expect(() => validateQuestionBank([{ ...ok, correct: "A" }])).toThrow();
  });
  it("rejects fewer than 4 options", () => {
    expect(() => validateQuestionBank([{ ...ok, options: ok.options.slice(0, 3) }])).toThrow();
  });
  it("rejects duplicate ids", () => {
    expect(() => validateQuestionBank([ok, ok])).toThrow(/duplicate/i);
  });
});
