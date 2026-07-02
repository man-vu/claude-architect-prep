import { validateTheoryBank } from "@/domain/schema";
import type { TheoryQuestion } from "@/domain/types";
import { agentArchitectureTheory } from "./agent-architecture";
import { claudeCodeConfigTheory } from "./claude-code-config";
import { promptEngineeringTheory } from "./prompt-engineering";
import { toolMcpDesignTheory } from "./tool-mcp-design";
import { contextReliabilityTheory } from "./context-reliability";

const raw = [
  ...agentArchitectureTheory, ...claudeCodeConfigTheory, ...promptEngineeringTheory,
  ...toolMcpDesignTheory, ...contextReliabilityTheory,
];

// Throws at import time if any question is malformed or ids collide.
export const allTheoryQuestions: TheoryQuestion[] = validateTheoryBank(raw);
