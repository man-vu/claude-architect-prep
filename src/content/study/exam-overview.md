The **Claude Certified Architect — Foundations** certification validates that you can make sound trade-off decisions when building real-world Claude solutions across four core technologies: **Claude Code, the Claude Agent SDK, the Claude API, and the Model Context Protocol (MCP)**.

## Who it's for
A **solution architect** with ~6+ months of hands-on production experience with Claude: multi-agent orchestration and subagent delegation (Agent SDK); CLAUDE.md, MCP, skills, and planning mode (Claude Code); tools & resources (MCP); JSON schemas & few-shot (prompt engineering); long-document and multi-agent context handling; CI/CD automation; and error handling / human-in-the-loop.

## Format
| Parameter | Value |
|---|---|
| Question type | Multiple choice — 1 correct of 4 |
| Scoring | 100–1000 scale; **passing = 720** |
| Guessing penalty | None — answer every question |
| Scenarios | 4 of 8 possible, randomly selected |

## The five domains (by weight)
| Domain | Weight |
|---|---|
| Agent architecture & orchestration | **27%** |
| Claude Code configuration & workflows | **20%** |
| Prompt engineering & structured output | **20%** |
| Tool design & MCP integration | **18%** |
| Context management & reliability | **15%** |

## The eight scenarios
Each exam randomly draws 4 of these 8:
1. **Customer Support Agent** — returns/billing/account issues via the Agent SDK with MCP tools (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`); target 80%+ first-contact resolution with appropriate escalation.
2. **Code Generation with Claude Code** — generation, refactoring, debugging, docs with custom slash commands, CLAUDE.md, and planning mode.
3. **Multi-Agent Research System** — a coordinator delegates to web-research, document-analysis, synthesis, and report-generation subagents; reports must include citations.
4. **Developer Productivity Tools** — exploring unfamiliar codebases, boilerplate, and automation with built-in tools (Read/Write/Bash/Grep/Glob) and MCP servers.
5. **Claude Code for Continuous Integration** — automated reviews, test generation, and PR feedback; prompts tuned to minimize false positives.
6. **Structured Data Extraction** — extract from unstructured docs, validate with JSON schemas, handle edge cases.
7. **Conversational AI Architecture Patterns** — multi-turn context management, instruction persistence, memory strategies, safe tool design, and ambiguous/conflicting inputs.
8. **Agentic AI Tools** — reported by candidates but not yet documented in the source guide; ground it in agentic-loop fundamentals.

## How to prepare
1. Build a full agent loop with the Agent SDK (tools, error handling, session management, subagents with explicit context passing).
2. Configure Claude Code for a real project (CLAUDE.md hierarchy, `.claude/rules/`, skills with `context: fork`/`allowed-tools`, MCP).
3. Design MCP tools with differentiating descriptions and structured, categorized errors.
4. Build an extraction pipeline (`tool_use` + JSON schemas, validation/retry, nullable fields, batches).
5. Practice prompt engineering (few-shot, explicit criteria, multi-pass review).
6. Study context management (fact extraction, scratchpads, subagent delegation).
7. Understand escalation & human-in-the-loop (policy gaps, explicit requests, no-progress; confidence routing).
8. Take a practice exam in the same format.

## Official documentation
The source guide links the official docs: Claude API (Messages, Tool Use, Message Batches); Agent SDK (Overview, Hooks, Subagents, Sessions); MCP (site, Tools, Resources, Servers); Claude Code (Overview, Memory, Skills, Hooks, Sub-agents, MCP, GitHub/GitLab CI/CD, Headless); Prompt Engineering; Extended Thinking; and the Anthropic Cookbook.
