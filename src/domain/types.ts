export type Letter = "A" | "B" | "C" | "D";

export type Domain =
  | "agent-architecture" | "claude-code-config" | "prompt-engineering"
  | "tool-mcp-design" | "context-reliability";

export type ScenarioId =
  | "customer-support" | "code-generation" | "multi-agent-research" | "ci"
  | "developer-productivity" | "structured-data-extraction";

export interface Option { letter: Letter; text: string; correct: boolean }

export interface Question {
  id: string;
  scenario: ScenarioId;
  domain: Domain;
  situation: string;
  question: string;
  options: Option[];
  correct: Letter;
  explanation: string;
}

// Direct theory-recall question (no scenario framing) — used by practice-by-domain.
export interface TheoryQuestion {
  id: string;
  domain: Domain;
  question: string;
  options: Option[];
  correct: Letter;
  explanation: string;
}

export interface QuestionResult { questionId: string; chosen: Letter | null; correct: boolean }

export interface Attempt {
  id: string;
  mode: "exam" | "practice";
  startedAt: number;
  finishedAt: number;
  scenariosUsed: ScenarioId[];
  results: QuestionResult[];
  scaledScore: number;
  passed: boolean;
}

export interface BreakdownEntry { key: string; correct: number; total: number; pct: number }
export interface ExamConfig { scenarioCount: number; perScenario: number }
