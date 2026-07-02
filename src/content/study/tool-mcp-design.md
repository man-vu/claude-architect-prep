Tools turn Claude from a text generator into an agent that can look things up, take actions, and integrate with real systems. This domain covers how to design tools the model will pick correctly and use safely, how MCP standardizes integrations across servers, and how Claude Code's built-in tools support incremental, evidence-based investigation.

## Tool definition: the three parts that matter

Every tool Claude can call is defined with three fields:

```json
{
  "name": "get_customer",
  "description": "Finds a customer by email or ID. Returns the customer profile, including name, email, order history, and account status. Use this tool BEFORE lookup_order to verify the customer's identity. Accepts an email (format: user@domain.com) or a numeric customer_id.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string", "description": "Customer email" },
      "customer_id": { "type": "integer", "description": "Numeric customer ID" }
    },
    "required": []
  }
}
```

- `name` — a short identifier. It matters far less than most people assume.
- `description` — the **primary mechanism** the model uses to *select* a tool. Claude reads descriptions, not source code, to decide which tool fits the current step.
- `input_schema` — a JSON Schema describing the shape of the arguments Claude must produce.

### Weak vs. strong descriptions

A weak description gives the model nothing to disambiguate on:

```json
{ "name": "get_customer", "description": "Retrieves customer information." }
```

If a second tool (`lookup_order`) has an equally vague description, Claude has no signal for which one applies when both could plausibly return "customer info." This is the single most common cause of wrong-tool selection in production agents.

A strong description (like the `get_customer` example above) states:

1. **What it does and returns** — "Returns the customer profile, including name, email, order history, and account status."
2. **Input formats, with examples** — "Accepts an email (format: `user@domain.com`) or a numeric `customer_id`."
3. **When to use it vs. a similar tool** — "Use this tool BEFORE `lookup_order` to verify the customer's identity."

### Anti-patterns in tool design

| Anti-pattern | Why it fails |
|---|---|
| Identical or near-identical descriptions across tools | Model can't distinguish `get_customer` from `find_customer` — arbitrary/wrong selection |
| No input examples | Model guesses at format (e.g., whether `customer_id` is a string or int) and may fabricate a value |
| No stated boundary vs. similar tools | Model can't decide between overlapping tools (`analyze_content` vs. a more specific `extract_web_results`) |
| Vague verbs ("process", "handle", "manage") | Doesn't tell the model what changes state vs. what only reads |

When two tools genuinely overlap in function, the fix is often to **rename and narrow scope** rather than write a longer description — e.g., renaming `analyze_content` to `extract_web_results` removes the ambiguity at the name level, backed by a description that states the narrower purpose.

## input_schema: JSON Schema for arguments

The `input_schema` is a JSON Schema object. Its design choices directly control whether the model fabricates data or honestly reports uncertainty.

### Required means "always available" — not "important"

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string" },
    "customer_id": { "type": "integer" }
  },
  "required": []
}
```

Mark a field `required` **only if the information is always available** at call time. If a field is marked required but the input data sometimes lacks it, Claude will invent a plausible-looking value to satisfy the schema rather than fail the call. Required fields are a promise about availability, not a statement of importance — an important-but-sometimes-missing field belongs in the schema as optional and nullable, not as required.

### Nullable fields prevent hallucination

```json
{
  "optional_field": {
    "type": ["string", "null"],
    "description": "Null if the information was not found in the source"
  }
}
```

Using a type union like `["string", "null"]` gives the model an explicit, valid way to say "this genuinely isn't there" — it returns `null` instead of hallucinating a value to fill the slot. Any field describing information that might not exist in the underlying data should be nullable.

### Enums need escape hatches

```json
{
  "category": {
    "type": "string",
    "enum": ["bug", "feature", "docs", "unclear", "other"]
  },
  "category_detail": {
    "type": ["string", "null"],
    "description": "Details if category = 'other' or 'unclear'"
  }
}
```

A closed enum without an escape hatch forces the model to jam every real-world case into one of the listed buckets, even when none fit. Two additions fix this:

- **`"other"`** — paired with a free-text detail field (`category_detail`), so information outside the predefined categories isn't silently dropped.
- **`"unclear"`** — for genuine ambiguity. When the model cannot confidently pick a category, an honest `"unclear"` is better than a confident wrong answer.

### Numeric and string constraints

Use standard JSON Schema keywords to narrow the space of valid values and catch malformed input before it reaches your system:

```json
{
  "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
  "severity": { "type": "string", "enum": ["critical", "high", "medium", "low"] },
  "zip_code": { "type": "string", "pattern": "^[0-9]{5}$" }
}
```

`minimum` / `maximum` bound numeric ranges (e.g., a confidence score can't be 1.5). `pattern` enforces string shape (e.g., a 5-digit ZIP). These are cheap, deterministic guardrails — they can't fix bad reasoning, but they eliminate a whole category of malformed output before it's ever executed.

### Full schema example

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["bug", "feature", "docs", "unclear", "other"]
    },
    "category_detail": {
      "type": ["string", "null"],
      "description": "Details if category = 'other' or 'unclear'"
    },
    "severity": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "optional_field": {
      "type": ["string", "null"],
      "description": "Null if the information was not found in the source"
    }
  },
  "required": ["category", "severity"]
}
```

### Syntax errors vs. semantic errors

`tool_use` combined with a JSON Schema is the **most reliable** way to get structured output from Claude, but it solves only one class of problem:

| Error type | Example | What eliminates it |
|---|---|---|
| Syntax | Missing brace, trailing comma, wrong field type, missing required field | `tool_use` + JSON Schema — the API enforces valid JSON matching the schema |
| Semantic | Line-item totals don't sum correctly, a value is placed in the wrong (schema-valid) field | **Not** solved by the schema — needs application-level validation and a retry loop with feedback |

A response can be perfectly schema-valid and still be *wrong*. Schema validation guarantees shape; it says nothing about correctness. Semantic errors require your own checks (e.g., recompute a total and compare) and, on failure, feeding the discrepancy back to the model for a corrected attempt.

## tool_choice

The `tool_choice` parameter controls whether — and which — tool Claude must call on a given turn.

| Value | Behavior | When to use |
|---|---|---|
| `{"type": "auto"}` | Model decides whether to call a tool or respond in plain text | Default for most conversational/agentic use — let the model reason about whether a tool is needed |
| `{"type": "any"}` | Model **must** call some tool (any one of those provided) | You need guaranteed structured/tool-shaped output and don't care which tool, as long as one fires |
| `{"type": "tool", "name": "verify_customer"}` | Model **must** call the named tool | You need to force a specific first step or enforce execution order |

A common pattern: force a specific tool on the first turn to guarantee a required precondition runs (e.g., `{"type": "tool", "name": "verify_customer"}` to make identity verification non-optional), then switch to `{"type": "auto"}` on the next turn so the model can reason freely once that precondition is satisfied. Forcing a tool on every turn removes the model's ability to recognize when no tool call is appropriate, so it's typically a one-shot technique rather than a steady-state setting.

## The tool_use cycle

Tool calling is a loop, not a single request. Claude does not execute tools itself — it emits a request to call one, your application executes it, and you feed the result back.

1. **You send** a request with the conversation history and available `tools`.
2. **Claude responds** with `stop_reason: "tool_use"` and one or more `tool_use` content blocks:

```json
{
  "stop_reason": "tool_use",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_01A09q90qw90lq917835lq9",
      "name": "get_customer",
      "input": { "email": "user@domain.com" }
    }
  ]
}
```

3. **Your application executes** the tool (calls the real API/DB/function) using `name` and `input`.
4. **You append a `tool_result` block**, matched to the call by `tool_use_id`, as the *next user turn*:

```json
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
      "content": "{\"name\":\"Jane Doe\",\"status\":\"active\",\"orders\":3}"
    }
  ]
}
```

5. **You send the full updated history** back to Claude. The model has no memory between requests — every request must carry the complete conversation so far, including all prior tool calls and results.
6. **Repeat** until `stop_reason` comes back as `"end_turn"` (task complete) rather than `"tool_use"`.

### stop_reason reference

| Value | Meaning / action |
|---|---|
| `"end_turn"` | Claude is done — show the result to the user |
| `"tool_use"` | Claude wants to call a tool — execute it and return a `tool_result` |
| `"max_tokens"` | Response was truncated — may need a higher token limit |
| `"stop_sequence"` | A configured stop sequence was hit — handle per your application logic |

## Model Context Protocol (MCP)

MCP is a standard protocol for connecting Claude to external systems — data sources, APIs, and tools — without writing bespoke integration code for every combination of model and service.

### Three primitives

| Primitive | Purpose | Example |
|---|---|---|
| **Tools** | Actions that can modify state or trigger side effects | Create a Jira ticket, send a Slack message, run a query that writes data |
| **Resources** | Read-only context the model can pull in | A file, a database schema, a content catalog, documentation |
| **Prompts** | Predefined prompt templates exposed by the server | A "summarize this ticket" template with server-defined variables |

The key distinction is **tools act, resources inform**. Resources exist so the model (or application) has an immediate "map" of what's available — e.g., a catalog of all project tasks or a database schema — without needing to make exploratory tool calls just to discover structure.

### Server configuration: project vs. user

**Project-level — `.mcp.json`** (at the project root, version-controlled, shared with the team):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

- Committed to the repo so every teammate gets the same server configuration.
- Secrets are referenced via `${VAR}` environment variable substitution — the **token itself is never committed**, only the reference to an env var the developer's shell provides.

**User-level — `~/.claude.json`** (in the user's home directory, not version-controlled):

- Personal servers, experiments, or credentials specific to one developer.
- Not shared with the team — appropriate for testing a server before proposing it at the project level, or for purely personal integrations.

### Community vs. custom servers

For standard integrations — GitHub, Jira, Slack, and similar widely-used systems — prefer existing **community MCP servers** over building your own. They're already tested against the target API's quirks and maintained independently of your project.

Build a **custom server** only for unique, team-specific workflows that no community server covers — e.g., a proprietary internal system or a workflow specific to your organization's data model. Writing a custom server is justified by uniqueness, not by a desire for extra control over a well-covered integration.

### Structured error handling

A tool or MCP server that returns only `"Operation failed"` on error gives the calling agent nothing to act on — it can't tell whether to retry, adjust its input, or give up and tell the user. Structured errors fix this.

**Generic (bad):**

```json
{ "isError": true, "content": "Operation failed" }
```

**Structured (good):**

```json
{
  "isError": true,
  "content": {
    "errorCategory": "transient",
    "isRetryable": true,
    "message": "The service is temporarily unavailable.",
    "attempted_query": "order_id=12345",
    "partial_results": null
  }
}
```

Key fields beyond the `isError` flag:

- `errorCategory` — classifies the failure so the caller (or the model) can decide how to react.
- `isRetryable` — an explicit boolean, not something to infer from prose.
- `attempted_query` — what was actually sent, so a retry can adjust the right parameter instead of guessing.
- `partial_results` — anything usable that was recovered before the failure, so a partial failure doesn't discard everything.
- `message` — a human-readable explanation, but as a supplement to the structured fields, not a replacement for them.

### Error category → action

| `errorCategory` | Example | Typical action |
|---|---|---|
| `transient` | Timeout, 503, network blip | Retry (often with backoff) |
| `validation` | Malformed input, missing required parameter | Fix the input — do not retry unchanged |
| `business` | Policy violation, threshold exceeded | Do not retry — surface to user or escalate |
| `permission` | Access denied, insufficient scope | Do not retry — needs different credentials or human intervention |

Anti-patterns to avoid on the server (or tool) side: generic status strings with no category; silently treating an empty result as success; aborting the entire operation on the first failure instead of returning partial results; and retrying indefinitely without a cap regardless of category.

## Built-in tools (Claude Code)

Claude Code exposes a small set of built-in tools for interacting with a real codebase and shell.

| Task | Tool | Example |
|---|---|---|
| Find files by path/name pattern | **Glob** | `**/*.test.tsx`, `src/components/**/*.ts` |
| Search file *contents* | **Grep** | A function name, error string, or import statement |
| Read a file in full | **Read** | Load a file for analysis before editing it |
| Write a new file | **Write** | Create a file from scratch (or a full rewrite) |
| Edit an existing file precisely | **Edit** | Replace a snippet via a unique text match |
| Run a shell command | **Bash** | `git`, package manager commands, tests, builds |

Note the split between **Glob** and **Grep**: Glob matches on file *paths and names* (structure), Grep matches on file *contents* (text inside files). Reaching for Grep when you only need to locate files by name pattern — or vice versa — wastes a step.

### Incremental investigation

The recommended pattern is to build understanding incrementally rather than reading everything up front:

1. **Glob/Grep** — find entry points (files by name, or a symbol/string by content).
2. **Read** — load the files that surfaced.
3. **Grep** — find usages of what you just read (callers, references, imports).
4. **Read** — load the consumer files that reference it.
5. **Repeat** until the picture is complete.

This Glob → Grep → Read → Grep → Read cycle keeps context focused on what's relevant to the current question, rather than front-loading the entire codebase into context before knowing what matters.

### Edit's non-unique match fallback

**Edit** works by matching a unique snippet of existing text and replacing it. If the target snippet appears more than once in the file, Edit fails rather than guessing which occurrence was intended. The fallback sequence is:

1. **Read** — load the full file content.
2. Modify the content **programmatically** (in memory), disambiguating by surrounding context or line position.
3. **Write** — write the updated full content back to the file.

This fallback trades Edit's precision for Write's brute-force replace-everything semantics, which is why Edit is preferred whenever a unique match is available — Write risks clobbering unrelated changes if the in-memory reconstruction is wrong.

### Anti-patterns

- **Reading all files at once** instead of following leads incrementally — burns context and dilutes attention across files that don't matter to the task.
- **Overly broad Glob patterns** (e.g., `**/*` across a whole monorepo) that return too many candidates to reason about.
- **Unsafe Bash usage** — running destructive or irreversible shell commands without confirming scope first (e.g., broad deletes, force-pushes, unscoped `rm`).
- **Findings without a precise `file:line` reference** — "there's a bug in the auth module" is not actionable; "the null check is missing at `auth.ts:42`" is.

## Exam focus

- **Description, not name, drives tool selection.** If Claude picks the wrong tool between two options, the fix is almost always a sharper `description` (what it returns, input formats, when to use it vs. the alternative) — not a different `name`.
- **`required` = always available, not "important."** A field that's sometimes missing should be optional and nullable (`["string", "null"]`), or the model will fabricate a value to satisfy the schema.
- **Enums need `"other"` + detail and `"unclear"`.** Without these, real-world inputs that don't fit the predefined categories get force-fit into a wrong bucket, or an ambiguous case gets a falsely confident answer.
- **Schema validation ≠ correctness.** `tool_use` + JSON Schema eliminates *syntax* errors (malformed JSON, wrong types, missing required fields) but cannot catch *semantic* errors (wrong-but-valid values, totals that don't add up). Semantic errors need your own validation + a retry loop.
- **`tool_choice: {"type": "tool", ...}` is a one-shot forcing move**, typically used to guarantee a precondition (e.g., verification) runs first, then followed by a switch back to `"auto"` — not left on for every turn.
- **The loop requires full history every time.** Claude has no memory between API calls; every request resends the whole conversation, including prior `tool_use`/`tool_result` pairs. Match each `tool_result` to its call via `tool_use_id`.
- **MCP: tools act, resources inform, prompts template.** Don't design a "resource" that has side effects, or a "tool" that's really just read-only lookup data better served as a resource.
- **`.mcp.json` is team config with env-var secrets; `~/.claude.json` is personal.** Never commit an actual token — only the `${VAR}` reference — into `.mcp.json`.
- **Prefer community MCP servers for standard integrations.** Building a custom server is justified only when the workflow is unique to your team, not as a default.
- **Structured MCP errors need `errorCategory` + `isRetryable`, not just `isError: true` and a message.** `transient` → retry; `validation`/`business`/`permission` → do not blindly retry, fix input or escalate instead.
- **Glob finds files by name/path; Grep searches contents.** Confusing the two, or reading an entire codebase up front instead of following Glob → Grep → Read incrementally, are the classic anti-patterns.
- **Edit requires a unique match and fails otherwise.** The correct fallback is Read (full content) → modify programmatically → Write — not retrying Edit with a slightly different snippet and hoping.
