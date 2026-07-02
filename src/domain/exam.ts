import type { ExamConfig, Question, ScenarioId } from "./types";

// Real exam: 60 questions in 120 minutes.
export const EXAM_DURATION_MINUTES = 120;

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function composeExam(
  pool: Question[],
  cfg: ExamConfig,
  rng: () => number = Math.random,
): Question[] {
  const byScenario = new Map<ScenarioId, Question[]>();
  for (const q of pool) {
    const list = byScenario.get(q.scenario) ?? [];
    list.push(q);
    byScenario.set(q.scenario, list);
  }
  const eligible = [...byScenario.entries()].filter(([, qs]) => qs.length >= cfg.perScenario);
  if (eligible.length < cfg.scenarioCount) {
    throw new Error(
      `need ${cfg.scenarioCount} scenarios with >=${cfg.perScenario} questions; only ${eligible.length} eligible`,
    );
  }
  const chosen = shuffle(eligible.map(([s]) => s), rng).slice(0, cfg.scenarioCount);
  const out: Question[] = [];
  for (const s of chosen) out.push(...shuffle(byScenario.get(s)!, rng).slice(0, cfg.perScenario));
  return out;
}
