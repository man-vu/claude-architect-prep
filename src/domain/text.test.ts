import { describe, it, expect } from "vitest";
import { situationRepeatsQuestion } from "./text";

describe("situationRepeatsQuestion", () => {
  it("detects a situation that ends with the question verbatim", () => {
    expect(situationRepeatsQuestion(
      "The web-search subagent times out. Which error-propagation approach best enables intelligent recovery?",
      "Which error-propagation approach best enables intelligent recovery?",
    )).toBe(true);
  });
  it("ignores markdown/punctuation differences", () => {
    expect(situationRepeatsQuestion(
      "You need to update a `timeout: 30` setting. **What's the correct fallback?**",
      "What's the correct fallback?",
    )).toBe(true);
  });
  it("returns false when the situation only sets context", () => {
    expect(situationRepeatsQuestion(
      "You are building a support agent with MCP tools and an 80% resolution target.",
      "What change would most effectively address this reliability issue?",
    )).toBe(false);
  });
  it("returns false when the question appears mid-situation, not at the end", () => {
    expect(situationRepeatsQuestion(
      "Which tool should you use? Consider that the file appears five times.",
      "Which tool should you use?",
    )).toBe(false);
  });
});
