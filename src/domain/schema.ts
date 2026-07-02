import { z } from "zod";
import type { Question, TheoryQuestion } from "./types";

const letter = z.enum(["A", "B", "C", "D"]);
const domain = z.enum([
  "agent-architecture", "claude-code-config", "prompt-engineering",
  "tool-mcp-design", "context-reliability",
]);
const scenario = z.enum([
  "customer-support", "code-generation", "multi-agent-research", "ci",
  "developer-productivity", "structured-data-extraction",
]);

const questionSchema = z
  .object({
    id: z.string().min(1),
    scenario, domain,
    situation: z.string().min(1),
    question: z.string().min(1),
    options: z
      .array(z.object({ letter, text: z.string().min(1), correct: z.boolean() }))
      .length(4),
    correct: letter,
    explanation: z.string().min(1),
  })
  .refine((q) => q.options.filter((o) => o.correct).length === 1, {
    message: "exactly one option must be correct",
  })
  .refine((q) => q.options.every((o, i) => o.letter === ["A", "B", "C", "D"][i]), {
    message: "option letters must be A,B,C,D in order",
  })
  .refine((q) => q.options.find((o) => o.correct)?.letter === q.correct, {
    message: "`correct` must match the correct option's letter",
  });

const theorySchema = z
  .object({
    id: z.string().min(1),
    domain,
    question: z.string().min(1),
    options: z
      .array(z.object({ letter, text: z.string().min(1), correct: z.boolean() }))
      .length(4),
    correct: letter,
    explanation: z.string().min(1),
  })
  .refine((q) => q.options.filter((o) => o.correct).length === 1, {
    message: "exactly one option must be correct",
  })
  .refine((q) => q.options.every((o, i) => o.letter === ["A", "B", "C", "D"][i]), {
    message: "option letters must be A,B,C,D in order",
  })
  .refine((q) => q.options.find((o) => o.correct)?.letter === q.correct, {
    message: "`correct` must match the correct option's letter",
  });

export function validateTheoryBank(input: unknown[]): TheoryQuestion[] {
  const parsed = input.map((q, i) => {
    const r = theorySchema.safeParse(q);
    if (!r.success) throw new Error(`Theory question ${i} invalid: ${r.error.message}`);
    return r.data as TheoryQuestion;
  });
  const ids = new Set<string>();
  for (const q of parsed) {
    if (ids.has(q.id)) throw new Error(`duplicate theory question id: ${q.id}`);
    ids.add(q.id);
  }
  return parsed;
}

export function validateQuestionBank(input: unknown[]): Question[] {
  const parsed = input.map((q, i) => {
    const r = questionSchema.safeParse(q);
    if (!r.success) throw new Error(`Question ${i} invalid: ${r.error.message}`);
    return r.data as Question;
  });
  const ids = new Set<string>();
  for (const q of parsed) {
    if (ids.has(q.id)) throw new Error(`duplicate question id: ${q.id}`);
    ids.add(q.id);
  }
  return parsed;
}
