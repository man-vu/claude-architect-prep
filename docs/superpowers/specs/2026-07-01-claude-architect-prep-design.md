# Claude Certified Architect — Practice Exam PWA — Design

**Date:** 2026-07-01
**Status:** Approved (design), pending implementation plan

## Problem & goal

Expand an existing single-file practice test (`practical_test_en.html`, 60 questions
across 4 scenarios) into a full practice-exam application for the **Claude Certified
Architect — Foundations** certification. The app must be accessible on **web and
mobile**, cover the guide's full **8 scenarios** (~120 questions), tag content by the
**5 weighted domains**, and simulate real exam mechanics (4 random scenarios per
sitting, score 100–1000, pass ≥ 720).

Source of truth for content: the certification guide at
`https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md`
(raw: `raw.githubusercontent.com/paullarionov/claude-certified-architect/main/guide_en.md`).

### Decisions locked
- **Stack/host:** new **Next.js PWA** (own repo). Not exam-master-v2, not a fork of ielts-pro.
- **Scope:** full ~120-question bank + real exam engine (weighted-domain breakdown, scored exam mode).
- **Accounts:** local-only to start (no backend, no login).

### Why not the two existing apps (investigation findings)
- `exam-master-v2` — despite the name, is a **spaced-repetition flashcard app,
  mobile-only (Expo/RN)**. No MCQ/options/correct-answer/scoring model, no web app.
  Reusable only as scaffolding (monorepo, Firebase, Zod). Its one deck ("GH-600 —
  Developing in Agentic AI Systems", 138 cards) is useful *content reference*.
- `ielts-pro` — mature **web-only SaaS** (Next.js 16 / Supabase / Stripe). Has a real
  MCQ engine + objective grader, but ~50% is IELTS-specific (Slate/DOL content format,
  band 0–9 scoring, Gemini essay marking, speaking/writing/vocab) that would be stripped.
  No native mobile. A fork-and-strip, not a config switch.

Neither cleanly matches "expand this MCQ practice exam for web+mobile", so we build
purpose-built.

## Tech stack

- **Next.js (App Router)** + **TypeScript strict**. No `any`.
- **Tailwind CSS v4** for styling.
- **Statically exportable** (`output: 'export'`) — no server logic; deploys to any static host.
- **PWA:** web app manifest + service worker (installable + offline). Since all content
  is bundled, full offline works.

### iPhone install (no Mac required)
Delivered as a PWA, so iOS install needs **no MacBook, Xcode, Apple Developer account,
or App Store review**: host the static export over HTTPS (free Vercel/Netlify deploy, or
a tunnel from the dev machine), open the URL in **Safari → Share → Add to Home Screen**.
The manifest + service worker give it a home-screen icon, fullscreen launch, and offline
use. A native App Store app (which *would* need a Mac + Xcode + signing, cf. wispr-clone's
`docs/superpowers/plans/2026-05-18-ios-keyboard-dictation.md`) is out of scope for this plan.
- **State/persistence:** Zustand + `persist` middleware → `localStorage`.
- **Markdown:** react-markdown + remark-gfm (question/option/explanation text contains inline `code`).
- **Validation:** Zod for the question bank.
- **Tests:** Vitest (unit) + Playwright (e2e).

## Data model

```ts
type Domain =
  | 'agent-architecture'      // 27%
  | 'claude-code-config'      // 20%
  | 'prompt-engineering'      // 20%
  | 'tool-mcp-design'         // 18%
  | 'context-reliability';    // 15%

type ScenarioId =
  | 'customer-support' | 'code-generation' | 'multi-agent-research' | 'ci'
  | 'developer-productivity' | 'structured-data-extraction'
  | 'conversational-ai' | 'agentic-ai-tools';

interface Option { letter: 'A' | 'B' | 'C' | 'D'; text: string; correct: boolean }

interface Question {
  id: string;                 // stable, unique (e.g. `${scenario}-NN`)
  scenario: ScenarioId;
  domain: Domain;             // primary domain — enables weighted breakdown
  situation: string;          // markdown
  question: string;           // the prompt, markdown
  options: Option[];          // exactly 4
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;        // markdown
}
```

- Bank stored as typed content in-repo, **one file per scenario** for authorability.
- **Zod validation at load** (and in a test): unique ids, exactly 4 options, exactly one
  `correct: true`, `correct` letter matches the flagged option, domain/scenario are valid enums.
- Existing 60 questions map 1:1; they only need a `domain` tag added during import.

## Modes

1. **Exam mode (simulated).** Selects **4 random scenarios of 8**; draws a fixed number
   per scenario (default **5 → 20-question exam**, configurable). No feedback until submit.
   On submit → scaled score + pass/fail + breakdown + review. Optional timer (off by default).
2. **Practice mode.** Pick a **scenario or a domain**; immediate per-question feedback +
   explanation (behavior of the current HTML). Untimed.
3. **Review / history.** List past attempts; revisit missed questions.

## Scoring

- **Scaled score** = `round(100 + (correct / total) * 900)` → range **100–1000**,
  **pass ≥ 720** (≈ 69% correct). Faithful to the guide's stated scale.
- Results screen additionally shows **per-domain** and **per-scenario** accuracy. This is
  where the 5 weighted domains surface as analytics.
- **Decision:** the single score uses overall ratio, *not* domain-weighted, because a
  random 4-scenario draw need not cover all 5 domains evenly; weighting a partial-coverage
  draw distorts the score. Domain weighting lives in the breakdown, not the headline number.

## Persistence (local, no backend)

- Zustand store persisted to `localStorage`.
- Attempt record:
  ```ts
  interface Attempt {
    id: string; mode: 'exam' | 'practice';
    startedAt: number; finishedAt: number;
    scenariosUsed: ScenarioId[];
    results: { questionId: string; chosen: 'A'|'B'|'C'|'D' | null; correct: boolean }[];
    scaledScore: number; passed: boolean;
  }
  ```
- Derived stats: best score, per-domain/scenario accuracy, attempt count.
- **Cap** stored history (keep last ~50 attempts) to bound storage.

## Content plan (largest effort)

1. **Import** the 60 existing questions by parsing the data array in
   `practical_test_en.html` → typed content; add `domain` tags.
2. **Author ~60 new questions** for the 4 missing scenarios (Developer Productivity,
   Structured Data Extraction, Conversational AI, Agentic AI Tools), **grounded in the
   guide** — 4 options, exactly one correct, explanation covering why the right answer is
   right (and ideally why others are wrong). Each new answer **verified against the guide**,
   not invented.
3. Reference material for the Agentic AI Tools scenario (incomplete even in the guide):
   exam-master-v2's `gh-600` deck (138 cards, "Developing in Agentic AI Systems").
4. **Re-fetch the full guide first** — the initial fetch captured ~70%; ground authoring on
   the complete text.

## UI / responsive

- Reuse the existing HTML's visual language (clean, already good):
  scenario sidebar, question card, lettered options with large tap targets, explanation
  panel, results screen with score cards + wrong-answer review grouped by scenario.
- **Responsive:** fixed 260px sidebar collapses to a **hamburger drawer** on mobile;
  question card goes full-width; options are big touch targets.
- **Home screen:** choose Exam or Practice; show best score / progress.
- Markdown rendered for situation/question/option/explanation.

## Verification (definition of done)

- Zod bank validation passes as a test (no malformed/duplicate questions).
- Unit tests: scoring (ratio→scaled, threshold at 720), exam composition (4 *distinct*
  scenarios, correct total length), breakdown math.
- Playwright e2e: complete an exam → submit → see score; practice a scenario → see
  explanation; PWA install/offline smoke.
- `tsc --noEmit` clean; `next build` clean.

## Risks / adversarial callouts

1. **Scenarios ≠ domains** (orthogonal). Every question carries both tags; scoring uses
   overall ratio + domain breakdown (see Scoring decision).
2. **Exam length (20 = 5×4) is an assumption** — the guide fixes "4 scenarios" but not
   questions-per-scenario. Configurable knob.
3. **Content accuracy is the top risk.** New questions must derive from the guide and be
   verified. A multi-agent author→verify workflow is a good fit at implementation time.
4. **Guide capture was ~70%** on first fetch; re-fetch full text before authoring.

## Build phases (preview for the implementation plan)

1. Scaffold Next.js PWA (static export, manifest, service worker, Tailwind).
2. Data model + Zod + import & tag the existing 60 questions.
3. Engine: exam composition, scoring, domain/scenario breakdown, persistence.
4. UI: home, exam flow, practice flow, results/review; responsive + markdown.
5. Author 60 new questions (verified against the guide).
6. Tests (unit + e2e) + `tsc`/`build` green.
7. Deploy to a static host; verify installable/offline on a phone.
