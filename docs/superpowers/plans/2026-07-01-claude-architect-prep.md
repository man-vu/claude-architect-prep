# Claude Certified Architect — Practice Exam PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first Next.js PWA that expands the existing 60-question practical test into the certification guide's full 8 scenarios (~120 questions) with a scored exam engine, installable on web and iPhone.

**Architecture:** A statically-exported Next.js (App Router) app. All logic is client-side: a framework-agnostic engine (`src/domain/*`) computes scoring and exam composition over an in-repo, Zod-validated question bank (`src/content/*`); a Zustand store persists attempts to `localStorage`; React components render the exam/practice/results UI. A Serwist service worker precaches the bundle for offline + installability.

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), TypeScript (strict), Tailwind CSS v4, Zustand (+persist), Zod, react-markdown + remark-gfm, Serwist (`@serwist/next`), Vitest (jsdom), Playwright.

## Global Constraints

- **TypeScript strict mode; no `any`.** (User rule.)
- **Static export only** — no server components with server-only data, no API routes, no `next/image` optimization (`images.unoptimized = true`). Everything renders client-side.
- **Question shape is fixed:** exactly 4 options per question; exactly one option with `correct: true`; the question's `correct` letter must equal that option's `letter`.
- **Scoring:** `scaledScore = round(100 + (correct/total)*900)`; range 100–1000; **pass ≥ 720**.
- **Domains (id → weight):** `agent-architecture` 27, `claude-code-config` 20, `prompt-engineering` 20, `tool-mcp-design` 18, `context-reliability` 15.
- **8 scenario ids:** `customer-support`, `code-generation`, `multi-agent-research`, `ci`, `developer-productivity`, `structured-data-extraction`, `conversational-ai`, `agentic-ai-tools`.
- **Content is authored from the guide** (`raw.githubusercontent.com/paullarionov/claude-certified-architect/main/guide_en.md`), never invented; every authored answer is verified against the guide.
- **Commit after every task.** Stage specific files (never `git add -A`).
- **Verification bar before "done":** `npx tsc --noEmit` clean, `npm run build` clean, unit + e2e green.

---

## File Structure

```
claude-architect-prep/
  next.config.ts            # static export + Serwist wrapper
  postcss.config.mjs        # tailwind v4
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
  public/
    manifest.webmanifest
    icons/{icon-192.png,icon-512.png,apple-touch-icon.png}
  scripts/
    import-legacy.mjs        # parse practical_test_en.html -> raw questions JSON
  src/
    app/
      layout.tsx             # root layout, PWA meta, SW registration
      globals.css            # tailwind v4 entry
      page.tsx               # home
      practice/page.tsx
      exam/page.tsx
      history/page.tsx
      sw.ts                  # Serwist service worker source
    domain/
      types.ts               # Question, Option, Domain, ScenarioId, Attempt, ...
      schema.ts              # Zod schemas + validateQuestionBank()
      scoring.ts             # scaledScore, isPass, computeBreakdown
      exam.ts                # composeExam
      rng.ts                 # seedable RNG
    content/
      scenarios.ts           # scenario + domain metadata (labels, weights)
      questions/
        customer-support.ts
        code-generation.ts
        multi-agent-research.ts
        ci.ts
        developer-productivity.ts
        structured-data-extraction.ts
        conversational-ai.ts
        agentic-ai-tools.ts
        index.ts             # aggregate + validate all -> allQuestions
    store/
      useExamStore.ts        # Zustand + persist
    components/
      Markdown.tsx
      QuestionCard.tsx
      OptionList.tsx
      Explanation.tsx
      ResultsSummary.tsx
      ScenarioNav.tsx        # sidebar (desktop) / drawer (mobile)
      Stat.tsx
```

**Canonical type/function names (used across tasks — keep identical):**
`Letter = 'A'|'B'|'C'|'D'`; `Domain`; `ScenarioId`; `Option`; `Question`;
`QuestionResult = { questionId: string; chosen: Letter | null; correct: boolean }`;
`Attempt`; `validateQuestionBank(input: unknown[]): Question[]`; `allQuestions: Question[]`;
`scaledScore(correct: number, total: number): number`; `isPass(score: number): boolean`;
`computeBreakdown(results: QuestionResult[], byId: Map<string, Question>, key: 'domain'|'scenario'): BreakdownEntry[]`;
`BreakdownEntry = { key: string; correct: number; total: number; pct: number }`;
`composeExam(pool: Question[], cfg: ExamConfig, rng?: () => number): Question[]`;
`ExamConfig = { scenarioCount: number; perScenario: number }`.

---

### Task 1: Scaffold the static-export Next.js app + Tailwind v4

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize the project non-interactively**

Run (from `D:\projects\web-apps\claude-architect-prep`, which already has `.git` + `docs/`):
```bash
npm init -y
npm install next@15 react@19 react-dom@19
npm install -D typescript @types/react @types/node @types/react-dom tailwindcss @tailwindcss/postcss
```

- [ ] **Step 2: Write config files**

`next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};
export default nextConfig;
```

`postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false, "skipLibCheck": true, "strict": true,
    "noEmit": true, "esModuleInterop": true, "module": "esnext",
    "moduleResolution": "bundler", "resolveJsonModule": true,
    "isolatedModules": true, "jsx": "preserve", "incremental": true,
    "plugins": [{ "name": "next" }], "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`.gitignore`:
```
node_modules/
.next/
out/
next-env.d.ts
*.log
.DS_Store
.superpowers/
playwright-report/
test-results/
```

Add scripts to `package.json`:
```json
"scripts": { "dev": "next dev", "build": "next build", "start": "next start", "typecheck": "tsc --noEmit" }
```

- [ ] **Step 3: Write minimal app shell**

`src/app/globals.css`:
```css
@import "tailwindcss";
:root { color-scheme: light; }
html, body { height: 100%; }
```

`src/app/layout.tsx`:
```tsx
import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="bg-slate-100 text-slate-900 antialiased">{children}</body></html>
  );
}
```

`src/app/page.tsx`:
```tsx
export default function Home() {
  return <main className="p-8 text-xl font-semibold">Claude Architect Prep — scaffold OK</main>;
}
```

- [ ] **Step 4: Verify build + typecheck**

Run: `npm run typecheck && npm run build`
Expected: both succeed; `out/` directory produced with `index.html`.

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json next.config.ts postcss.config.mjs tsconfig.json .gitignore src/
git commit -m "chore: scaffold static-export Next.js app with Tailwind v4"
```

---

### Task 2: Domain types + Zod schema + bank validation

**Files:**
- Create: `src/domain/types.ts`, `src/domain/schema.ts`, `src/domain/schema.test.ts`
- Test: `src/domain/schema.test.ts`

**Interfaces:**
- Produces: all canonical types; `validateQuestionBank(input: unknown[]): Question[]` (throws `ZodError`/`Error` on invalid input, returns typed array on success).

- [ ] **Step 1: Install deps + test runner**
```bash
npm install zod
npm install -D vitest jsdom
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "jsdom", globals: true } });
```

- [ ] **Step 2: Write types**

`src/domain/types.ts`:
```ts
export type Letter = "A" | "B" | "C" | "D";

export type Domain =
  | "agent-architecture" | "claude-code-config" | "prompt-engineering"
  | "tool-mcp-design" | "context-reliability";

export type ScenarioId =
  | "customer-support" | "code-generation" | "multi-agent-research" | "ci"
  | "developer-productivity" | "structured-data-extraction"
  | "conversational-ai" | "agentic-ai-tools";

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
```

- [ ] **Step 3: Write the failing test**

`src/domain/schema.test.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/domain/schema.test.ts`
Expected: FAIL — `validateQuestionBank` not found.

- [ ] **Step 5: Implement the schema**

`src/domain/schema.ts`:
```ts
import { z } from "zod";
import type { Question } from "./types";

const letter = z.enum(["A", "B", "C", "D"]);
const domain = z.enum([
  "agent-architecture", "claude-code-config", "prompt-engineering",
  "tool-mcp-design", "context-reliability",
]);
const scenario = z.enum([
  "customer-support", "code-generation", "multi-agent-research", "ci",
  "developer-productivity", "structured-data-extraction",
  "conversational-ai", "agentic-ai-tools",
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/domain/schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**
```bash
git add src/domain/types.ts src/domain/schema.ts src/domain/schema.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat(domain): question types + Zod bank validation"
```

---

### Task 3: Import the 60 legacy questions

**Files:**
- Create: `scripts/import-legacy.mjs`, `src/content/questions/_raw-legacy.json` (generated output)

**Interfaces:**
- Produces: `_raw-legacy.json` — an array of 60 objects shaped `{ id, scenario, situation, question, options:[{letter,text,correct}], correct, explanation }` **without** a `domain` field (added in Task 4).

- [ ] **Step 1: Write the import script**

`scripts/import-legacy.mjs`:
```js
import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2] || "C:/Users/TIM/OneDrive/Downloads/practical_test_en.html";
const OUT = "src/content/questions/_raw-legacy.json";

const SCENARIO_MAP = {
  "Customer Support Agent": "customer-support",
  "Code Generation with Claude Code": "code-generation",
  "Multi-agent Research System": "multi-agent-research",
  "Claude Code for Continuous Integration": "ci",
};

const html = readFileSync(SRC, "utf8");
const line = html.split(/\r?\n/).find((l) => l.includes("[{") && l.includes("scenario"));
if (!line) throw new Error("could not find question data array in HTML");
const json = line.match(/\[\s*\{[\s\S]*\}\s*\]/)[0];
const raw = JSON.parse(json);

const counters = {};
const out = raw.map((q) => {
  const scenario = SCENARIO_MAP[q.scenario];
  if (!scenario) throw new Error(`unmapped scenario: ${q.scenario}`);
  counters[scenario] = (counters[scenario] || 0) + 1;
  const n = String(counters[scenario]).padStart(2, "0");
  return {
    id: `${scenario}-${n}`,
    scenario,
    situation: q.situation,
    question: q.question,
    options: q.options.map((o) => ({ letter: o.letter, text: o.text, correct: !!o.correct })),
    correct: q.correct,
    explanation: q.explanation,
  };
});

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`wrote ${out.length} questions to ${OUT}`);
console.log(counters);
```

- [ ] **Step 2: Run it**

Run: `node scripts/import-legacy.mjs`
Expected: `wrote 60 questions ...` and `{ customer-support: 15, code-generation: 15, multi-agent-research: 15, ci: 15 }`.

- [ ] **Step 3: Sanity-check the output**

Open `_raw-legacy.json`; confirm 60 entries, ids like `customer-support-01`, each with 4 options and one `correct: true` whose letter equals the top-level `correct`.

- [ ] **Step 4: Commit**
```bash
git add scripts/import-legacy.mjs src/content/questions/_raw-legacy.json
git commit -m "feat(content): import 60 legacy questions from practical_test_en.html"
```

---

### Task 4: Tag legacy questions with domains + scenario metadata

**Files:**
- Create: `src/content/scenarios.ts`, one file per legacy scenario in `src/content/questions/` (`customer-support.ts`, `code-generation.ts`, `multi-agent-research.ts`, `ci.ts`), `src/content/questions/index.ts`
- Delete after use: `src/content/questions/_raw-legacy.json`

**Interfaces:**
- Consumes: `_raw-legacy.json` (Task 3), `validateQuestionBank` (Task 2).
- Produces: `allQuestions: Question[]`, `SCENARIOS` and `DOMAINS` metadata maps.

- [ ] **Step 1: Write scenario + domain metadata**

`src/content/scenarios.ts`:
```ts
import type { Domain, ScenarioId } from "@/domain/types";

export const DOMAINS: Record<Domain, { label: string; weight: number }> = {
  "agent-architecture": { label: "Agent architecture & orchestration", weight: 27 },
  "claude-code-config": { label: "Claude Code configuration & workflows", weight: 20 },
  "prompt-engineering": { label: "Prompt engineering & structured output", weight: 20 },
  "tool-mcp-design": { label: "Tool design & MCP integration", weight: 18 },
  "context-reliability": { label: "Context management & reliability", weight: 15 },
};

export const SCENARIOS: Record<ScenarioId, { label: string }> = {
  "customer-support": { label: "Customer Support Agent" },
  "code-generation": { label: "Code Generation with Claude Code" },
  "multi-agent-research": { label: "Multi-agent Research System" },
  ci: { label: "Claude Code for Continuous Integration" },
  "developer-productivity": { label: "Developer Productivity Tools" },
  "structured-data-extraction": { label: "Structured Data Extraction" },
  "conversational-ai": { label: "Conversational AI Architecture Patterns" },
  "agentic-ai-tools": { label: "Agentic AI Tools" },
};
```

- [ ] **Step 2: Split legacy JSON into per-scenario TS files, adding a `domain` to each question**

For each of the 4 legacy scenarios, create `src/content/questions/<scenario>.ts` exporting a typed array. Copy each question object from `_raw-legacy.json` and **add a `domain` field** chosen from the 5 domains by reading the question's `situation`/`question`/`explanation` against these domain definitions:
- `agent-architecture` — agentic loops, multi-agent coordination, subagent delegation, hooks, workflow enforcement.
- `claude-code-config` — CLAUDE.md hierarchy, custom commands/skills, planning vs direct execution, CI/CD.
- `prompt-engineering` — explicit criteria, few-shot, JSON schemas, validation loops, batch processing.
- `tool-mcp-design` — tool descriptions, structured error responses, MCP server config, built-in tools.
- `context-reliability` — preserving information, escalation, error propagation, human oversight, provenance.

Example shape (`src/content/questions/customer-support.ts`):
```ts
import type { Question } from "@/domain/types";

export const customerSupport: Question[] = [
  {
    id: "customer-support-01",
    scenario: "customer-support",
    domain: "context-reliability", // chosen per the definition above
    situation: "…copied verbatim from _raw-legacy.json…",
    question: "…",
    options: [
      { letter: "A", text: "…", correct: false },
      { letter: "B", text: "…", correct: true },
      { letter: "C", text: "…", correct: false },
      { letter: "D", text: "…", correct: false },
    ],
    correct: "B",
    explanation: "…",
  },
  // … 14 more …
];
```
Repeat for `code-generation.ts`, `multi-agent-research.ts`, `ci.ts`.

- [ ] **Step 3: Create empty stubs for the 4 new scenarios (filled in Task 15)**

Create `developer-productivity.ts`, `structured-data-extraction.ts`, `conversational-ai.ts`, `agentic-ai-tools.ts`, each exporting an empty typed array, e.g.:
```ts
import type { Question } from "@/domain/types";
export const developerProductivity: Question[] = [];
```

- [ ] **Step 4: Aggregate + validate**

`src/content/questions/index.ts`:
```ts
import { validateQuestionBank } from "@/domain/schema";
import type { Question } from "@/domain/types";
import { customerSupport } from "./customer-support";
import { codeGeneration } from "./code-generation";
import { multiAgentResearch } from "./multi-agent-research";
import { ci } from "./ci";
import { developerProductivity } from "./developer-productivity";
import { structuredDataExtraction } from "./structured-data-extraction";
import { conversationalAi } from "./conversational-ai";
import { agenticAiTools } from "./agentic-ai-tools";

const raw = [
  ...customerSupport, ...codeGeneration, ...multiAgentResearch, ...ci,
  ...developerProductivity, ...structuredDataExtraction, ...conversationalAi, ...agenticAiTools,
];

// Throws at import time if any question is malformed or ids collide.
export const allQuestions: Question[] = validateQuestionBank(raw);
```

- [ ] **Step 5: Add a content test**

`src/content/questions/index.test.ts`:
```ts
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
});
```

- [ ] **Step 6: Run tests, then delete the raw file**

Run: `npx vitest run src/content/questions/index.test.ts`
Expected: PASS. Then delete `_raw-legacy.json`.

- [ ] **Step 7: Commit**
```bash
git add src/content/ && git rm src/content/questions/_raw-legacy.json
git commit -m "feat(content): domain-tag legacy questions + scenario metadata + aggregation"
```

---

### Task 5: Scoring + breakdown

**Files:**
- Create: `src/domain/scoring.ts`, `src/domain/scoring.test.ts`

**Interfaces:**
- Produces: `scaledScore(correct, total)`, `isPass(score)`, `computeBreakdown(results, byId, key)`.

- [ ] **Step 1: Write the failing test**

`src/domain/scoring.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { scaledScore, isPass, computeBreakdown } from "./scoring";
import type { Question, QuestionResult } from "./types";

describe("scaledScore", () => {
  it("maps 0% -> 100 and 100% -> 1000", () => {
    expect(scaledScore(0, 20)).toBe(100);
    expect(scaledScore(20, 20)).toBe(1000);
  });
  it("passes at >= 720 (~69%)", () => {
    expect(scaledScore(14, 20)).toBe(730); // 14/20 -> above threshold
    expect(isPass(730)).toBe(true);
    expect(scaledScore(13, 20)).toBe(685); // 13/20 -> below threshold
    expect(isPass(685)).toBe(false);
    expect(isPass(719)).toBe(false);
  });
  it("guards total = 0", () => { expect(scaledScore(0, 0)).toBe(100); });
});

describe("computeBreakdown", () => {
  it("aggregates accuracy by key", () => {
    const q = (id: string, domain: Question["domain"]): Question => ({
      id, scenario: "ci", domain, situation: "s", question: "q",
      options: [
        { letter: "A", text: "a", correct: true }, { letter: "B", text: "b", correct: false },
        { letter: "C", text: "c", correct: false }, { letter: "D", text: "d", correct: false },
      ], correct: "A", explanation: "e",
    });
    const byId = new Map([q("1","prompt-engineering"), q("2","prompt-engineering"), q("3","tool-mcp-design")].map((x) => [x.id, x]));
    const results: QuestionResult[] = [
      { questionId: "1", chosen: "A", correct: true },
      { questionId: "2", chosen: "B", correct: false },
      { questionId: "3", chosen: "A", correct: true },
    ];
    const bd = computeBreakdown(results, byId, "domain");
    const pe = bd.find((b) => b.key === "prompt-engineering")!;
    expect(pe).toEqual({ key: "prompt-engineering", correct: 1, total: 2, pct: 50 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/scoring.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement**

`src/domain/scoring.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/scoring.test.ts` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/domain/scoring.ts src/domain/scoring.test.ts
git commit -m "feat(domain): scaled scoring + pass threshold + accuracy breakdown"
```

---

### Task 6: Exam composition (seedable)

**Files:**
- Create: `src/domain/rng.ts`, `src/domain/exam.ts`, `src/domain/exam.test.ts`

**Interfaces:**
- Consumes: `Question`, `ExamConfig` (Task 2).
- Produces: `mulberry32(seed): () => number`; `composeExam(pool, cfg, rng?): Question[]`.

- [ ] **Step 1: Write the failing test**

`src/domain/exam.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails** → FAIL (modules not found).

- [ ] **Step 3: Implement**

`src/domain/rng.ts`:
```ts
// Deterministic PRNG for testable composition; defaults to Math.random in prod.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

`src/domain/exam.ts`:
```ts
import type { ExamConfig, Question, ScenarioId } from "./types";

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
```

- [ ] **Step 4: Run test to verify it passes** → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/domain/rng.ts src/domain/exam.ts src/domain/exam.test.ts
git commit -m "feat(domain): seedable exam composition (4 scenarios x N)"
```

---

### Task 7: Zustand store (attempts + session + persistence)

**Files:**
- Create: `src/store/useExamStore.ts`, `src/store/useExamStore.test.ts`

**Interfaces:**
- Consumes: `Attempt`, `Letter`, `Question`, `QuestionResult`; `scaledScore`, `isPass`, `computeBreakdown`.
- Produces: `useExamStore` with state `{ attempts, session }` and actions
  `startSession(mode, questions)`, `answer(questionId, letter)`, `finishSession(): Attempt | null`, `resetSession()`;
  selectors `bestScore(): number | null`. Answers are addressed by `questionId` (not a
  running index) so re-selecting or out-of-order navigation can't corrupt the recorded answers.

- [ ] **Step 1: Install + write the failing test**
```bash
npm install zustand
```

`src/store/useExamStore.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useExamStore } from "./useExamStore";
import type { Question } from "@/domain/types";

const q = (id: string): Question => ({
  id, scenario: "ci", domain: "claude-code-config", situation: "s", question: "q",
  options: [
    { letter: "A", text: "a", correct: true }, { letter: "B", text: "b", correct: false },
    { letter: "C", text: "c", correct: false }, { letter: "D", text: "d", correct: false },
  ], correct: "A", explanation: "e",
});

beforeEach(() => {
  localStorage.clear();
  useExamStore.setState({ attempts: [], session: null });
});

describe("exam store", () => {
  it("records an attempt with a scaled score on finish", () => {
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "A"); // correct
    useExamStore.getState().answer("2", "B"); // wrong
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.results).toHaveLength(2);
    expect(attempt?.scaledScore).toBe(550); // 1/2 correct -> 100+450
    expect(useExamStore.getState().attempts).toHaveLength(1);
  });
  it("scores unanswered questions as incorrect (chosen null)", () => {
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "A");
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.results[1]).toEqual({ questionId: "2", chosen: null, correct: false });
  });
  it("re-answering the same question overwrites, not corrupts", () => {
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "B"); // wrong first
    useExamStore.getState().answer("1", "A"); // corrected
    useExamStore.getState().answer("2", "A");
    const attempt = useExamStore.getState().finishSession();
    expect(attempt?.scaledScore).toBe(1000); // both correct
  });
  it("bestScore is the max exam score, null when no exams", () => {
    expect(useExamStore.getState().bestScore()).toBeNull();
    useExamStore.getState().startSession("exam", [q("1"), q("2")]);
    useExamStore.getState().answer("1", "A");
    useExamStore.getState().answer("2", "A");
    useExamStore.getState().finishSession();
    expect(useExamStore.getState().bestScore()).toBe(1000);
  });
  it("caps stored history at 50", () => {
    for (let i = 0; i < 55; i++) {
      useExamStore.getState().startSession("practice", [q("x")]);
      useExamStore.getState().answer("x", "A");
      useExamStore.getState().finishSession();
    }
    expect(useExamStore.getState().attempts.length).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** → FAIL (module not found).

- [ ] **Step 3: Implement the store**

`src/store/useExamStore.ts`:
```ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Attempt, Letter, Question, QuestionResult } from "@/domain/types";
import { isPass, scaledScore } from "@/domain/scoring";

const HISTORY_CAP = 50;
let counter = 0;
function newId(): string { counter += 1; return `a${Date.now()}-${counter}`; }

interface Session {
  mode: "exam" | "practice";
  questions: Question[];
  answers: Record<string, Letter>;
  startedAt: number;
}

interface ExamState {
  attempts: Attempt[];
  session: Session | null;
  startSession: (mode: "exam" | "practice", questions: Question[]) => void;
  answer: (questionId: string, letter: Letter) => void;
  finishSession: () => Attempt | null;
  resetSession: () => void;
  bestScore: () => number | null;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      attempts: [],
      session: null,
      startSession: (mode, questions) =>
        set({ session: { mode, questions, answers: {}, startedAt: Date.now() } }),
      // Answers are keyed by questionId — safe against re-selection and out-of-order navigation.
      answer: (questionId, letter) => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, answers: { ...s.answers, [questionId]: letter } } });
      },
      finishSession: () => {
        const s = get().session;
        if (!s) return null;
        const results: QuestionResult[] = s.questions.map((q) => {
          const chosen = s.answers[q.id] ?? null;
          return { questionId: q.id, chosen, correct: chosen === q.correct };
        });
        const correct = results.filter((r) => r.correct).length;
        const score = scaledScore(correct, results.length);
        const scenariosUsed = [...new Set(s.questions.map((q) => q.scenario))];
        const attempt: Attempt = {
          id: newId(), mode: s.mode, startedAt: s.startedAt, finishedAt: Date.now(),
          scenariosUsed, results, scaledScore: score, passed: isPass(score),
        };
        set({ attempts: [attempt, ...get().attempts].slice(0, HISTORY_CAP), session: null });
        return attempt;
      },
      resetSession: () => set({ session: null }),
      bestScore: () => {
        const scores = get().attempts.filter((a) => a.mode === "exam").map((a) => a.scaledScore);
        return scores.length ? Math.max(...scores) : null;
      },
    }),
    { name: "cca-prep", partialize: (s) => ({ attempts: s.attempts }) },
  ),
);
```

- [ ] **Step 4: Run test to verify it passes** → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/store/useExamStore.ts src/store/useExamStore.test.ts package.json package-lock.json
git commit -m "feat(store): persisted attempts + session state with history cap"
```

---

### Task 8: Presentation components (Markdown, QuestionCard, OptionList, Explanation)

**Files:**
- Create: `src/components/Markdown.tsx`, `src/components/OptionList.tsx`, `src/components/Explanation.tsx`, `src/components/QuestionCard.tsx`

**Interfaces:**
- Produces: `<QuestionCard question revealed selected onSelect />` where
  `revealed: boolean` (caller-driven — practice reveals on select, exam stays false until results),
  `selected: Letter | null`, `onSelect: (l: Letter) => void`. No `mode` prop; reveal timing is the caller's job.

- [ ] **Step 1: Install markdown deps**
```bash
npm install react-markdown remark-gfm
```

- [ ] **Step 2: Markdown wrapper**

`src/components/Markdown.tsx`:
```tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ children }) => (
            <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[0.85em] text-slate-800">{children}</code>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: OptionList**

`src/components/OptionList.tsx`:
```tsx
"use client";
import type { Letter, Option } from "@/domain/types";
import { Markdown } from "./Markdown";

export function OptionList({
  options, selected, correct, revealed, onSelect,
}: {
  options: Option[]; selected: Letter | null; correct: Letter;
  revealed: boolean; onSelect: (l: Letter) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => {
        const isSel = selected === o.letter;
        let cls = "border-slate-200 bg-white";
        if (revealed && o.letter === correct) cls = "border-green-500 bg-green-50";
        else if (revealed && isSel) cls = "border-red-400 bg-red-50";
        else if (isSel) cls = "border-blue-400 bg-blue-50";
        return (
          <button
            key={o.letter} type="button" disabled={revealed}
            onClick={() => onSelect(o.letter)}
            className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition ${cls} disabled:cursor-default`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{o.letter}</span>
            <span className="pt-0.5 text-[15px]"><Markdown>{o.text}</Markdown></span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Explanation + QuestionCard**

`src/components/Explanation.tsx`:
```tsx
"use client";
import type { Letter } from "@/domain/types";
import { Markdown } from "./Markdown";
export function Explanation({ correct, text }: { correct: Letter; text: string }) {
  return (
    <div className="mt-4 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
      <strong>Why {correct}: </strong>
      <span><Markdown>{text}</Markdown></span>
    </div>
  );
}
```

`src/components/QuestionCard.tsx`:
```tsx
"use client";
import type { Letter, Question } from "@/domain/types";
import { SCENARIOS } from "@/content/scenarios";
import { Markdown } from "./Markdown";
import { OptionList } from "./OptionList";
import { Explanation } from "./Explanation";

export function QuestionCard({
  question, revealed, selected, onSelect,
}: {
  question: Question; revealed: boolean; selected: Letter | null; onSelect: (l: Letter) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
        {SCENARIOS[question.scenario].label}
      </span>
      <div className="my-4 rounded-xl border border-blue-100 bg-white p-4 text-[16px] font-medium shadow-sm">
        <Markdown>{question.situation}</Markdown>
      </div>
      <div className="mb-4 text-[17px] font-bold"><Markdown>{question.question}</Markdown></div>
      <OptionList
        options={question.options} selected={selected} correct={question.correct}
        revealed={revealed} onSelect={onSelect}
      />
      {revealed && <Explanation correct={question.correct} text={question.explanation} />}
    </div>
  );
}
```

- [ ] **Step 5: Verify typecheck**

Run: `npm run typecheck`
Expected: clean (components compile; unused-until-wired is fine).

- [ ] **Step 6: Commit**
```bash
git add src/components/ package.json package-lock.json
git commit -m "feat(ui): question card, options, explanation, markdown renderer"
```

---

### Task 9: Home page + navigation shell

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/Stat.tsx`

- [ ] **Step 1: Stat component**

`src/components/Stat.tsx`:
```tsx
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <div className="text-3xl font-extrabold text-blue-700">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Home page (client component reading store)**

`src/app/page.tsx`:
```tsx
"use client";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";
import { Stat } from "@/components/Stat";

export default function Home() {
  const attempts = useExamStore((s) => s.attempts);
  const best = useExamStore((s) => s.bestScore());
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-extrabold">Claude Certified Architect — Practice</h1>
      <p className="mt-2 text-slate-600">Foundations exam prep. Score 100–1000, pass at 720.</p>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Best exam" value={best !== null ? String(best) : "—"} />
        <Stat label="Attempts" value={String(attempts.length)} />
        <Stat label="Pass mark" value="720" />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/exam" className="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-center text-lg font-semibold text-white hover:bg-blue-700">Start exam</Link>
        <Link href="/practice" className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-4 text-center text-lg font-semibold hover:bg-slate-50">Practice by topic</Link>
      </div>
      <Link href="/history" className="mt-4 inline-block text-sm text-blue-700 hover:underline">View history →</Link>
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build` → clean; `out/index.html` produced.

- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx src/components/Stat.tsx
git commit -m "feat(ui): home page with best score, attempts, entry points"
```

---

### Task 10: Practice mode

**Files:**
- Create: `src/app/practice/page.tsx`

**Behavior:** pick a scenario or domain → answer questions with immediate feedback (reveal explanation after each selection) → "next" advances.

- [ ] **Step 1: Implement the practice page**

`src/app/practice/page.tsx`:
```tsx
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { allQuestions } from "@/content/questions";
import { DOMAINS, SCENARIOS } from "@/content/scenarios";
import type { Domain, Letter, ScenarioId } from "@/domain/types";
import { QuestionCard } from "@/components/QuestionCard";

type Filter = { kind: "scenario"; id: ScenarioId } | { kind: "domain"; id: Domain };

export default function Practice() {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<Letter | null>(null);

  const pool = useMemo(() => {
    if (!filter) return [];
    return allQuestions.filter((q) => (filter.kind === "scenario" ? q.scenario === filter.id : q.domain === filter.id));
  }, [filter]);

  if (!filter) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="text-sm text-blue-700">← Home</Link>
        <h1 className="mt-3 text-2xl font-bold">Practice by scenario</h1>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((s) => {
            const n = allQuestions.filter((q) => q.scenario === s).length;
            return (
              <button key={s} disabled={n === 0} onClick={() => { setFilter({ kind: "scenario", id: s }); setI(0); setSelected(null); }}
                className="rounded-xl border-2 border-slate-200 bg-white p-4 text-left hover:bg-slate-50 disabled:opacity-40">
                <div className="font-semibold">{SCENARIOS[s].label}</div>
                <div className="text-xs text-slate-500">{n} questions</div>
              </button>
            );
          })}
        </div>
        <h2 className="mt-8 text-2xl font-bold">Practice by domain</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(DOMAINS) as Domain[]).map((d) => {
            const n = allQuestions.filter((q) => q.domain === d).length;
            return (
              <button key={d} disabled={n === 0} onClick={() => { setFilter({ kind: "domain", id: d }); setI(0); setSelected(null); }}
                className="rounded-xl border-2 border-slate-200 bg-white p-4 text-left hover:bg-slate-50 disabled:opacity-40">
                <div className="font-semibold">{DOMAINS[d].label}</div>
                <div className="text-xs text-slate-500">{n} questions · weight {DOMAINS[d].weight}%</div>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  const q = pool[i];
  return (
    <main className="px-6 py-8">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <button onClick={() => setFilter(null)} className="text-sm text-blue-700">← Change topic</button>
        <span className="text-sm text-slate-500">{i + 1} / {pool.length}</span>
      </div>
      {q && (
        <QuestionCard question={q} revealed={selected !== null} selected={selected} onSelect={setSelected} />
      )}
      <div className="mx-auto mt-6 flex max-w-3xl justify-end">
        <button disabled={selected === null || i + 1 >= pool.length}
          onClick={() => { setI(i + 1); setSelected(null); }}
          className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white disabled:opacity-40">Next</button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build + manual smoke**

Run: `npm run build`. Then `npm run dev`, open `/practice`, pick a scenario, answer → explanation reveals, Next advances.

- [ ] **Step 3: Commit**
```bash
git add src/app/practice/page.tsx
git commit -m "feat(practice): scenario/domain practice with immediate feedback"
```

---

### Task 11: Exam mode + results

**Files:**
- Create: `src/app/exam/page.tsx`, `src/components/ResultsSummary.tsx`

**Behavior:** on mount compose a 20-question exam (4×5); answer without feedback; on submit compute the attempt, show `ResultsSummary` (scaled score, pass/fail, domain + scenario breakdown, wrong-answer review).

- [ ] **Step 1: ResultsSummary**

`src/components/ResultsSummary.tsx`:
```tsx
"use client";
import type { Attempt, Question } from "@/domain/types";
import { DOMAINS, SCENARIOS } from "@/content/scenarios";
import { computeBreakdown } from "@/domain/scoring";
import { Stat } from "./Stat";
import { QuestionCard } from "./QuestionCard";

export function ResultsSummary({ attempt, questions }: { attempt: Attempt; questions: Question[] }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const correct = attempt.results.filter((r) => r.correct).length;
  const domainBd = computeBreakdown(attempt.results, byId, "domain");
  const scenarioBd = computeBreakdown(attempt.results, byId, "scenario");
  const wrong = attempt.results.filter((r) => !r.correct);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold">{attempt.passed ? "Passed 🎉" : "Not yet"}</h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Score" value={String(attempt.scaledScore)} />
        <Stat label="Correct" value={`${correct}/${attempt.results.length}`} />
        <Stat label="Result" value={attempt.passed ? "PASS" : "FAIL"} />
      </div>
      <h2 className="mt-8 text-lg font-bold">By domain</h2>
      <ul className="mt-2 space-y-1">
        {domainBd.map((b) => (
          <li key={b.key} className="flex justify-between rounded-lg bg-white px-4 py-2 text-sm shadow-sm">
            <span>{DOMAINS[b.key as keyof typeof DOMAINS]?.label ?? b.key}</span>
            <span className="font-semibold">{b.correct}/{b.total} · {b.pct}%</span>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-lg font-bold">By scenario</h2>
      <ul className="mt-2 space-y-1">
        {scenarioBd.map((b) => (
          <li key={b.key} className="flex justify-between rounded-lg bg-white px-4 py-2 text-sm shadow-sm">
            <span>{SCENARIOS[b.key as keyof typeof SCENARIOS]?.label ?? b.key}</span>
            <span className="font-semibold">{b.correct}/{b.total} · {b.pct}%</span>
          </li>
        ))}
      </ul>
      {wrong.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-bold">Review ({wrong.length} missed)</h2>
          <div className="mt-3 space-y-8">
            {wrong.map((r) => {
              const q = byId.get(r.questionId)!;
              return <QuestionCard key={q.id} question={q} revealed selected={r.chosen} onSelect={() => {}} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Exam page**

`src/app/exam/page.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { allQuestions } from "@/content/questions";
import { composeExam } from "@/domain/exam";
import type { Attempt, Letter } from "@/domain/types";
import { useExamStore } from "@/store/useExamStore";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsSummary } from "@/components/ResultsSummary";

export default function Exam() {
  const [questions] = useState(() => composeExam(allQuestions, { scenarioCount: 4, perScenario: 5 }));
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Letter>>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const startSession = useExamStore((s) => s.startSession);
  const answer = useExamStore((s) => s.answer);
  const finishSession = useExamStore((s) => s.finishSession);

  // Start the persisted session on mount.
  useEffect(() => {
    startSession("exam", questions);
  }, [questions, startSession]);

  if (attempt) {
    return (
      <main className="px-6 py-8">
        <ResultsSummary attempt={attempt} questions={questions} />
        <div className="mx-auto mt-8 max-w-3xl"><Link href="/" className="text-blue-700">← Home</Link></div>
      </main>
    );
  }

  const q = questions[i];
  const answered = Object.keys(answers).length;
  const select = (l: Letter) => {
    setAnswers((a) => ({ ...a, [q.id]: l }));
    answer(q.id, l);
  };
  const submit = () => setAttempt(finishSession());

  return (
    <main className="px-6 py-8">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <span className="text-sm text-slate-500">Question {i + 1} / {questions.length}</span>
        <span className="text-sm text-slate-500">{answered} answered</span>
      </div>
      <QuestionCard question={q} revealed={false} selected={answers[q.id] ?? null} onSelect={select} />
      <div className="mx-auto mt-6 flex max-w-3xl justify-between">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="rounded-lg border-2 border-slate-300 px-5 py-2.5 disabled:opacity-40">Prev</button>
        {i + 1 < questions.length
          ? <button onClick={() => setI(i + 1)} className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white">Next</button>
          : <button onClick={submit} className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white">Finish</button>}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify build + manual smoke**

Run: `npm run build`. Then `npm run dev`: `/exam` shows 20 questions across 4 scenarios; Finish shows score + breakdown + review; refresh `/` shows updated best score.

- [ ] **Step 4: Commit**
```bash
git add src/app/exam/page.tsx src/components/ResultsSummary.tsx
git commit -m "feat(exam): scored exam flow with results + breakdown + review"
```

---

### Task 12: History page

**Files:**
- Create: `src/app/history/page.tsx`

- [ ] **Step 1: Implement**

`src/app/history/page.tsx`:
```tsx
"use client";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";

export default function History() {
  const attempts = useExamStore((s) => s.attempts);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-700">← Home</Link>
      <h1 className="mt-3 text-2xl font-bold">History</h1>
      {attempts.length === 0 && <p className="mt-4 text-slate-500">No attempts yet.</p>}
      <ul className="mt-4 space-y-2">
        {attempts.map((a) => {
          const correct = a.results.filter((r) => r.correct).length;
          return (
            <li key={a.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
              <div>
                <div className="font-semibold capitalize">{a.mode}</div>
                <div className="text-xs text-slate-500">{new Date(a.finishedAt).toLocaleString()} · {correct}/{a.results.length}</div>
              </div>
              <div className={`text-lg font-extrabold ${a.passed ? "text-green-600" : "text-slate-700"}`}>{a.scaledScore}</div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Build + commit**
```bash
npm run build
git add src/app/history/page.tsx
git commit -m "feat(history): list past attempts with scores"
```

---

### Task 13: Responsive polish

**Files:**
- Modify: `src/app/exam/page.tsx`, `src/app/practice/page.tsx`, `src/components/QuestionCard.tsx` (as needed)

- [ ] **Step 1: Manual responsive review at 375px and 768px**

Run `npm run dev`, open Chrome DevTools device toolbar (iPhone SE / 375px). Verify: question card is full-width with comfortable padding; option buttons are full-width with ≥44px tap height; nav buttons don't overflow; text wraps. Adjust Tailwind classes only where something overflows or is cramped (e.g., ensure `px-4` on small screens, stack nav with `flex-wrap gap-2`).

- [ ] **Step 2: Confirm no horizontal scroll**

At 375px width there must be no horizontal scrollbar on `/`, `/exam`, `/practice`, `/history`.

- [ ] **Step 3: Commit**
```bash
git add src/
git commit -m "style: mobile responsiveness pass (375px/768px)"
```

---

### Task 14: PWA — manifest, icons, service worker, offline

> **Post-implementation correction (commit 9cd386f):** the `defaultCache` from
> `@serwist/next/worker` is a Next *server* preset and does NOT serve exported HTML
> documents offline — a dynamic offline test (Playwright, network offline) confirmed the
> installed PWA failed to load offline. The shipped `src/app/sw.ts` instead uses explicit
> `runtimeCaching` (navigate → NetworkFirst, style/script/worker → StaleWhileRevalidate,
> image/font → CacheFirst) with `navigationPreload: false`, and `next.config.ts` adds
> `additionalPrecacheEntries` for `/`, `/exam`, `/practice`, `/history` (git-hash revision)
> so every route's HTML is precached and served offline. The code below is the original
> plan; see the repo for the corrected version.

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png`, `src/app/sw.ts`
- Modify: `next.config.ts`, `src/app/layout.tsx`

- [ ] **Step 1: Install Serwist**
```bash
npm install @serwist/next && npm install -D serwist
```

- [ ] **Step 2: Manifest + icons**

`public/manifest.webmanifest`:
```json
{
  "name": "Claude Architect Prep",
  "short_name": "CCA Prep",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```
Create the three PNG icons (solid `#2563eb` background with a white "CCA" wordmark is fine for v1). Generate them any way available (e.g., a one-off `sharp`/canvas script, or an online generator). 192×192, 512×512, and a 180×180 `apple-touch-icon.png`.

- [ ] **Step 3: Wire Serwist into next.config + a SW source**

`src/app/sw.ts`:
```ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: (string | { url: string })[] };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
serwist.addEventListeners();
```

`next.config.ts`:
```ts
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({ swSrc: "src/app/sw.ts", swDest: "public/sw.js" });
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true } };
export default withSerwist(nextConfig);
```

- [ ] **Step 4: Reference manifest + apple meta in layout**

In `src/app/layout.tsx`, extend `metadata`:
```ts
export const metadata: Metadata = {
  title: "Claude Certified Architect — Practice Exam",
  description: "Practice exam for the Claude Certified Architect — Foundations certification.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "CCA Prep", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};
export const viewport = { themeColor: "#2563eb" };
```

- [ ] **Step 5: Build and verify SW + offline**

Run: `npm run build`
Expected: build succeeds and `public/sw.js` is generated (and `out/sw.js` present in export).
Then: `npx serve out` (or any static server), open in Chrome → DevTools → Application → Manifest shows "Installable"; Service Worker is activated. Toggle "Offline" and reload — the app still loads.

- [ ] **Step 6: Commit**
```bash
git add public/manifest.webmanifest public/icons/ src/app/sw.ts next.config.ts src/app/layout.tsx package.json package-lock.json
git commit -m "feat(pwa): installable + offline via Serwist, manifest, icons"
```

---

### Task 15: Author 60 new questions (4 scenarios × 15), verified against the guide

**Files:**
- Modify: `src/content/questions/developer-productivity.ts`, `structured-data-extraction.ts`, `conversational-ai.ts`, `agentic-ai-tools.ts`

**Source of truth:** the full guide (fetch `https://raw.githubusercontent.com/paullarionov/claude-certified-architect/main/guide_en.md`). Scenario notes for these four are summarized in the design doc; re-read the guide sections for each before authoring. **Scenario 8 (Agentic AI Tools) is incomplete in the guide** — ground it in the guide's Chapter 3 (agentic loop) plus the exam-master-v2 `gh-600` deck (`D:\projects\web-apps\exam-master-v2\decks\gh-600.deck.json`, "Developing in Agentic AI Systems").

**Quality bar per question:** 4 options (A–D in order); exactly one correct; a plausible-but-wrong distractor set; an `explanation` that states why the correct answer is right and ideally why the tempting wrong one is wrong; a `domain` tag from the 5 domains; a scenario-appropriate `situation`. Ids `<scenario>-01`..`<scenario>-15`.

- [ ] **Step 1: Author `developer-productivity.ts` (15 questions)**

Ground in the guide's Scenario 4 facts: Glob (find files by pattern) vs Grep (search content) vs Read/Write/Edit vs Bash; incremental investigation; Edit-fails-on-non-unique-match → Read+Write fallback; `~/.claude/skills/` (personal) vs `.claude/skills/` (project); `allowed-tools` restriction; `context: fork` to isolate verbose discovery; findings as JSON with `location`/`issue`/`severity`/`suggested fix`; precise `file:line` locations. Write 15 questions to the typed array. Example (one entry, to match the required shape):
```ts
{
  id: "developer-productivity-01",
  scenario: "developer-productivity",
  domain: "tool-mcp-design",
  situation: "A code-audit skill returns findings like `File: src/utils.js, Issue: unclear variable names, Severity: medium`. Developers say the findings are not actionable.",
  question: "Which change most improves actionability?",
  options: [
    { letter: "A", text: "Increase the model's temperature so it generates more findings", correct: false },
    { letter: "B", text: "Include a precise `file:line` location and a concrete suggested fix for each finding", correct: true },
    { letter: "C", text: "Return findings as prose paragraphs instead of structured fields", correct: false },
    { letter: "D", text: "Raise every finding's severity to high", correct: false },
  ],
  correct: "B",
  explanation: "Developers navigate by exact location; actionable findings carry `src/file.ts:42` plus a specific fix, not broad observations. Structured JSON with location/issue/severity/suggested-fix is the recommended shape.",
},
```

- [ ] **Step 2: Author `structured-data-extraction.ts` (15 questions)**

Ground in Scenario 6 facts: nullable schema fields `"type": ["string","null"]` to avoid fabrication; enums with `"other"`/`"unclear"` + detail; `tool_use` removes syntax but not semantic errors; retry-with-feedback (original doc + bad extraction + specific validation error); few-shot for varied layouts; field-level confidence; Pydantic + custom validators; emit `stated_total` vs `calculated_total` to detect conflicts; preserve provenance + dates; don't retry when info is simply absent; stratified sampling to catch per-type degradation. 15 questions.

- [ ] **Step 3: Author `conversational-ai.ts` (15 questions)**

Ground in Scenario 7 facts: full history sent every request (model is stateless); role-scoped tool access (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`); persistent case-facts block surviving summarization; interview pattern for ambiguity; constrained tool inputs (`customer_id` numeric / `email` format, not generic "identifier"); ask for more identifiers on multiple matches; don't escalate on sentiment/self-confidence alone; trim verbose tool outputs. 15 questions.

- [ ] **Step 4: Author `agentic-ai-tools.ts` (15 questions)**

Ground in Chapter 3 (agentic loop lifecycle: tool-use handling, error recovery, completion criteria), agent/tool composition, extended thinking for planning, tool orchestration at scale, autonomous execution — cross-checked against the `gh-600` deck. Note in a top-of-file comment that this scenario is under-documented in the guide and questions lean on Chapter 3 + gh-600. 15 questions.

- [ ] **Step 5: Verify each authored answer against the guide (adversarial pass)**

For every new question, re-read the relevant guide passage and confirm the keyed answer is the one the guide supports and the distractors are genuinely wrong. This is a good fit for a subagent-driven verification pass: dispatch a reviewer per scenario file that, given the guide text + the 15 questions, flags any answer not grounded in the guide. Fix flagged items.

- [ ] **Step 6: Validate the full bank**

The aggregation in `src/content/questions/index.ts` runs `validateQuestionBank` at import. Extend the content test:
```ts
it("has 15 questions in every one of the 8 scenarios", () => {
  const all = ["customer-support","code-generation","multi-agent-research","ci",
    "developer-productivity","structured-data-extraction","conversational-ai","agentic-ai-tools"] as const;
  for (const s of all) expect(allQuestions.filter((q) => q.scenario === s)).toHaveLength(15);
  expect(allQuestions).toHaveLength(120);
});
```
Run: `npx vitest run src/content/questions/index.test.ts` → PASS.

- [ ] **Step 7: Commit**
```bash
git add src/content/questions/ 
git commit -m "content: author 60 verified questions for the 4 remaining scenarios"
```

---

### Task 16: E2E, final verification, deploy, iPhone install

**Files:**
- Create: `playwright.config.ts`, `e2e/exam.spec.ts`, `e2e/practice.spec.ts`

- [ ] **Step 1: Install Playwright**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

`playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  webServer: { command: "npx serve out -l 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI },
  use: { baseURL: "http://localhost:3100" },
});
```
Add `serve`: `npm install -D serve`. Add script `"e2e": "playwright test"`.

- [ ] **Step 2: Write e2e specs**

`e2e/exam.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
test("completes an exam and sees a score", async ({ page }) => {
  await page.goto("/exam");
  for (let i = 0; i < 20; i++) {
    await page.getByRole("button", { name: /^A/ }).first().click();
    const finish = page.getByRole("button", { name: "Finish" });
    if (await finish.isVisible().catch(() => false)) { await finish.click(); break; }
    await page.getByRole("button", { name: "Next" }).click();
  }
  await expect(page.getByText(/Score/)).toBeVisible();
});
```

`e2e/practice.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
test("practice reveals an explanation", async ({ page }) => {
  await page.goto("/practice");
  await page.getByRole("button", { name: /Customer Support Agent/ }).click();
  await page.getByRole("button", { name: /^A/ }).first().click();
  await expect(page.getByText(/^Why [A-D]:/)).toBeVisible();
});
```

- [ ] **Step 3: Full verification gate**

Run in order:
```bash
npm run typecheck        # clean
npm run test             # all unit tests pass
npm run build            # clean; out/ produced
npm run e2e              # both specs pass
```
Expected: all green. Fix anything red before proceeding.

- [ ] **Step 4: Deploy to a static host**

Deploy `out/` to Vercel or Netlify (drag-and-drop `out/`, or connect the repo). Confirm the deployed HTTPS URL loads and the SW registers (DevTools → Application).

- [ ] **Step 5: Install on iPhone (no Mac needed)**

On the iPhone: open the deployed HTTPS URL in **Safari** → Share → **Add to Home Screen**. Launch from the home-screen icon; confirm it opens fullscreen (standalone), an exam runs, and it still works with the phone in Airplane Mode (offline via SW).

- [ ] **Step 6: Commit**
```bash
git add playwright.config.ts e2e/ package.json package-lock.json
git commit -m "test(e2e): exam + practice smoke; final verification"
```

---

## Self-Review

**Spec coverage:**
- Next.js static PWA → Tasks 1, 14. Local-only persistence → Task 7. `Question` model + scenario/domain tags → Tasks 2, 4. Zod validation → Task 2/4. Import 60 legacy → Task 3. Author 60 new (verified) → Task 15. Three modes: practice → Task 10, exam → Task 11, review/history → Tasks 11–12. Scoring 100–1000 / pass 720 + domain breakdown → Tasks 5, 11. Responsive UI → Task 13. Markdown → Task 8. Verification (tsc/build/unit/e2e) → Tasks scattered + Task 16. iPhone install → Task 16. All spec sections map to tasks.

**Placeholder scan:** No "TBD/TODO". Task 15 intentionally does not inline all 60 questions (authoring is the execution work), but it fixes format, source grounding, per-question quality bar, an example entry, and a validation+verification gate — not a vague "write questions" instruction.

**Type consistency:** `Letter`, `Domain`, `ScenarioId`, `Option`, `Question`, `QuestionResult`, `Attempt`, `BreakdownEntry`, `ExamConfig` defined once (Task 2) and reused verbatim. `validateQuestionBank`, `allQuestions`, `scaledScore`, `isPass`, `computeBreakdown`, `composeExam`, `mulberry32`, and store actions (`startSession`/`answer`/`finishSession`/`bestScore`) are named identically across tasks. Scenario ids and domain ids match the Global Constraints list.

**Known risk carried forward:** exam length (20 = 4×5) is a config default; the guide fixes 4 scenarios but not questions-per-scenario. `composeExam` throws clearly if fewer than 4 scenarios have ≥5 questions — which is why Task 15 (fill all 8 scenarios) must land before exam mode is considered production-complete, though exam mode already works on the 4 legacy scenarios after Task 11.
