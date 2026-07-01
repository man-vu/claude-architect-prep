import type { Domain } from "@/domain/types";

// Ordered by exam weight (desc).
export const STUDY_DOMAINS: Domain[] = [
  "agent-architecture",
  "claude-code-config",
  "prompt-engineering",
  "tool-mcp-design",
  "context-reliability",
];

export const STUDY_BLURBS: Record<Domain, string> = {
  "agent-architecture": "Agentic loops, coordinator/subagent orchestration, hooks, task decomposition, and multi-agent error handling.",
  "claude-code-config": "CLAUDE.md hierarchy, rules, skills & commands, planning mode, and the CLI for CI/CD.",
  "prompt-engineering": "Few-shot, explicit criteria, prompt chaining, validation loops, self-correction, and batch processing.",
  "tool-mcp-design": "Tool descriptions, JSON-schema design, tool_choice, MCP servers, and the built-in tools.",
  "context-reliability": "Statelessness, context management, escalation & human-in-the-loop, and provenance.",
};
