import type { Question, TheoryQuestion, Domain, ScenarioId } from "@/domain/types";
import { allQuestions } from "@/content/questions";
import { allTheoryQuestions } from "@/content/theory";
import { DOMAINS as EN_DOMAINS, SCENARIOS as EN_SCENARIOS } from "@/content/scenarios";
import { STUDY_PAGES as EN_STUDY_PAGES } from "@/content/study";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import type { QuestionOverlay, TheoryOverlay, ScenarioLabels, DomainLabels, StudyPageMeta } from "./types";

// Client-safe: no Node.js fs access here (getStudyMarkdown lives in ./server.ts
// instead) — this module is imported by client components like ExamView.

// Registries filled in per-locale as translations ship. Any locale/id not present
// falls back to English — a partial rollout degrades gracefully instead of breaking.
const QUESTION_OVERLAYS: Record<string, Record<string, QuestionOverlay>> = {};
const THEORY_OVERLAYS: Record<string, Record<string, TheoryOverlay>> = {};
const SCENARIO_LABELS: Record<string, ScenarioLabels> = {};
const DOMAIN_LABELS: Record<string, DomainLabels> = {};
const STUDY_META: Record<string, Record<string, StudyPageMeta>> = {};

export function registerQuestionOverlay(locale: string, overlay: Record<string, QuestionOverlay>) {
  QUESTION_OVERLAYS[locale] = overlay;
}
export function registerTheoryOverlay(locale: string, overlay: Record<string, TheoryOverlay>) {
  THEORY_OVERLAYS[locale] = overlay;
}
export function registerScenarioLabels(locale: string, labels: ScenarioLabels) {
  SCENARIO_LABELS[locale] = labels;
}
export function registerDomainLabels(locale: string, labels: DomainLabels) {
  DOMAIN_LABELS[locale] = labels;
}
export function registerStudyMeta(locale: string, meta: Record<string, StudyPageMeta>) {
  STUDY_META[locale] = meta;
}

export function getQuestions(locale: string): Question[] {
  if (locale === DEFAULT_LOCALE) return allQuestions;
  const overlay = QUESTION_OVERLAYS[locale];
  if (!overlay) return allQuestions;
  return allQuestions.map((q) => {
    const tr = overlay[q.id];
    if (!tr) return q;
    return {
      ...q,
      situation: tr.situation,
      question: tr.question,
      explanation: tr.explanation,
      options: q.options.map((o, i) => ({ ...o, text: tr.options[i] })),
    };
  });
}

export function getTheoryQuestions(locale: string): TheoryQuestion[] {
  if (locale === DEFAULT_LOCALE) return allTheoryQuestions;
  const overlay = THEORY_OVERLAYS[locale];
  if (!overlay) return allTheoryQuestions;
  return allTheoryQuestions.map((q) => {
    const tr = overlay[q.id];
    if (!tr) return q;
    return {
      ...q,
      question: tr.question,
      explanation: tr.explanation,
      options: q.options.map((o, i) => ({ ...o, text: tr.options[i] })),
    };
  });
}

export function getScenarioLabel(locale: string, id: ScenarioId): string {
  return SCENARIO_LABELS[locale]?.[id] ?? EN_SCENARIOS[id].label;
}
export function getDomainLabel(locale: string, id: Domain): string {
  return DOMAIN_LABELS[locale]?.[id] ?? EN_DOMAINS[id].label;
}
export function getDomainWeight(id: Domain): number {
  return EN_DOMAINS[id].weight; // weights are numeric, not translated
}

export function getStudyPages(locale: string) {
  const meta = STUDY_META[locale];
  return EN_STUDY_PAGES.map((p) => ({
    ...p,
    title: meta?.[p.slug]?.title ?? p.title,
    blurb: meta?.[p.slug]?.blurb ?? p.blurb,
  }));
}
