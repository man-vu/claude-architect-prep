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
