import type { Domain } from "@/domain/types";

export interface StudyPage {
  slug: string;
  title: string;
  group: "domain" | "reference";
  weight?: number;
  blurb: string;
}

export const STUDY_PAGES: StudyPage[] = [
  { slug: "agent-architecture", title: "Agent architecture & orchestration", group: "domain", weight: 27, blurb: "Agentic loops, coordinator/subagent orchestration, hooks, task decomposition, and multi-agent error handling." },
  { slug: "claude-code-config", title: "Claude Code configuration & workflows", group: "domain", weight: 20, blurb: "CLAUDE.md hierarchy, rules, skills & commands, planning mode, session/memory commands, and the CLI for CI/CD." },
  { slug: "prompt-engineering", title: "Prompt engineering & structured output", group: "domain", weight: 20, blurb: "Few-shot, explicit criteria, chaining, the interview pattern, validation loops, self-correction, and batches." },
  { slug: "tool-mcp-design", title: "Tool design & MCP integration", group: "domain", weight: 18, blurb: "Tool descriptions, JSON-schema design, tool_choice, MCP servers, and the built-in tools." },
  { slug: "context-reliability", title: "Context management & reliability", group: "domain", weight: 15, blurb: "Statelessness, context management, escalation & human-in-the-loop, and provenance." },
  { slug: "exam-overview", title: "Exam format & scenarios", group: "reference", blurb: "Format, scoring, the 5 weighted domains, the 6 scenarios, prep recommendations, and official docs." },
  { slug: "glossary", title: "Technologies & concepts (glossary)", group: "reference", blurb: "Quick reference of the SDK, MCP, Claude Code, API, and prompt-engineering concepts." },
  { slug: "out-of-scope", title: "Out-of-scope topics", group: "reference", blurb: "What the exam does NOT cover — so you don't over-study." },
];

export const STUDY_SLUGS = STUDY_PAGES.map((p) => p.slug);
export function studyPage(slug: string): StudyPage | undefined {
  return STUDY_PAGES.find((p) => p.slug === slug);
}
// Domain slugs equal Domain-union values; used for the practice deep-link.
export const DOMAIN_SLUGS = STUDY_PAGES.filter((p) => p.group === "domain").map((p) => p.slug) as Domain[];
