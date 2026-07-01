A quick reference to the technologies and concepts the exam draws on — use it to check a term is familiar before diving into the domain pages.

## Technologies & concepts
| Technology | Key aspects |
|---|---|
| **Claude Agent SDK** | `AgentDefinition`, agent loops, `stop_reason`, hooks (PostToolUse), spawning subagents via `Task`, `allowedTools` |
| **Model Context Protocol (MCP)** | MCP servers, tools, resources, `isError`, tool descriptions, `.mcp.json`, environment variables |
| **Claude Code** | CLAUDE.md hierarchy, `.claude/rules/` with glob patterns, `.claude/commands/`, `.claude/skills/` with SKILL.md, planning mode, `/compact`, `--resume`, `fork_session` |
| **Claude Code CLI** | `-p` / `--print` (non-interactive), `--output-format json`, `--json-schema` |
| **Claude API** | `tool_use` with JSON schemas, `tool_choice` (`auto`/`any`/forced), `stop_reason`, `max_tokens`, system prompts |
| **Message Batches API** | ~50% savings, up to 24-hour window, `custom_id`, no multi-turn tool calling |
| **JSON Schema** | Required vs optional, nullable fields, enum types, `"other"` + detail, strict mode |
| **Pydantic** | Schema validation, semantic errors, validation/retry loops |
| **Built-in tools** | Read, Write, Edit, Bash, Grep, Glob — purpose and selection criteria |
| **Few-shot prompting** | Targeted examples for ambiguous situations, generalization to new patterns |
| **Prompt chaining** | Sequential decomposition into focused passes |
| **Context window** | Token budgets, progressive summarization, "lost in the middle", scratchpad files |
| **Session management** | Resume, `fork_session`, named sessions, context isolation |
| **Confidence calibration** | Field-level scoring, calibration on labeled sets, stratified sampling |
