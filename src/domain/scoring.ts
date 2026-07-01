import type { BreakdownEntry, Question, QuestionResult } from "./types";

export function scaledScore(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round(100 + (correct / total) * 900);
}

export function isPass(score: number): boolean {
  return score >= 720;
}

export function computeBreakdown(
  results: QuestionResult[],
  byId: Map<string, Question>,
  key: "domain" | "scenario",
): BreakdownEntry[] {
  const acc = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const q = byId.get(r.questionId);
    if (!q) continue;
    const k = q[key];
    const cur = acc.get(k) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (r.correct) cur.correct += 1;
    acc.set(k, cur);
  }
  return [...acc.entries()].map(([k, v]) => ({
    key: k, correct: v.correct, total: v.total,
    pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));
}
