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
