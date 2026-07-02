import type { Question } from "@/domain/types";

export const codeGeneration: Question[] = [
  {
    "id": "code-generation-01",
    "scenario": "code-generation",
    "situation": "You asked Claude Code to implement a function that transforms API responses into an internal normalized format. After two iterations, the output structure still doesn’t match expectations—some fields are nested differently and timestamps are formatted incorrectly. You described requirements in prose, but Claude interprets them differently each time.",
    "question": "Which approach is most effective for the next iteration?",
    "options": [
      {
        "letter": "A",
        "text": "Write a JSON schema describing the expected output structure and validate Claude’s output against it after each iteration.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Provide 2–3 concrete input-output examples showing the expected transformation for representative API responses.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Rewrite requirements with more technical precision, specifying exact field mappings, nesting rules, and timestamp format strings.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Ask Claude to explain its current understanding of the requirements to identify where interpretations diverge.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Concrete input-output examples remove ambiguity inherent in prose descriptions by showing Claude the exact expected transformation results. This directly addresses the root cause—misinterpretation of textual requirements—by providing unambiguous patterns for field nesting and timestamp formatting.",
    "domain": "prompt-engineering"
  },
  {
    "id": "code-generation-02",
    "scenario": "code-generation",
    "situation": "You need to add Slack as a new notification channel. The existing codebase has clear, established patterns for email, SMS, and push channels. However, Slack’s API offers fundamentally different integration approaches—incoming webhooks (simple, one-way), bot tokens (support delivery confirmation and programmatic control), or Slack Apps (two-way events, requires workspace approval). Your task says “add Slack support” without specifying integration method or requiring advanced features like delivery tracking.",
    "question": "How should you approach this task?",
    "options": [
      {
        "letter": "A",
        "text": "Start in direct execution mode using incoming webhooks to match the existing one-way notification pattern.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Switch to planning mode to explore integration options and architectural implications, then present a recommendation before implementation.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Start in direct execution mode by scaffolding a Slack channel class using existing patterns, deferring the integration method decision.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Start in direct execution mode using a bot-token approach to ensure delivery confirmation is possible.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Slack integration has multiple valid approaches with significantly different architectural implications, and requirements are ambiguous. Planning mode lets you evaluate trade-offs among webhooks, bot tokens, and Slack Apps and align on an approach before implementation.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-03",
    "scenario": "code-generation",
    "situation": "Your CLAUDE.md file has grown to 400+ lines containing coding standards, testing conventions, a detailed PR review checklist, deployment instructions, and database migration procedures. You want Claude to always follow coding standards and testing conventions, but apply PR review, deploy, and migration guidance only when doing those tasks.",
    "question": "Which restructuring approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Move all guidance into separate Skills files organized by workflow type, leaving only a brief project description in CLAUDE.md.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Keep everything in CLAUDE.md but use `@import` syntax to organize into separately maintained files by category.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Split CLAUDE.md into files under `.claude/rules/` with path-bound glob patterns so each rule loads only for the relevant file types.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep universal standards in CLAUDE.md and create Skills for workflow-specific guidance (PR review, deploy, migrations) with trigger keywords.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "CLAUDE.md content loads in every session, ensuring coding standards and testing conventions always apply, while Skills are invoked on demand when Claude detects trigger keywords—ideal for workflow-specific guidance like PR review, deployment, and migrations.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-04",
    "scenario": "code-generation",
    "situation": "You’re tasked with restructuring your team’s monolithic application into microservices. This impacts changes across dozens of files and requires decisions about service boundaries and module dependencies.",
    "question": "Which approach should you choose?",
    "options": [
      {
        "letter": "A",
        "text": "Switch to planning mode to explore the codebase, understand dependencies, and design the implementation approach before making changes.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Start in direct execution mode and switch to planning only after encountering unexpected complexity during implementation.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Start in direct execution mode and make incremental changes, letting implementation reveal natural service boundaries.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Use direct execution with detailed upfront instructions that specify each service structure.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Planning mode is the right strategy for complex architectural restructuring like splitting a monolith: it allows safe exploration and informed decisions about boundaries before committing to potentially expensive changes across many files.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-05",
    "scenario": "code-generation",
    "situation": "Your team created a `/analyze-codebase` skill that performs deep code analysis—dependency scanning, test coverage counts, and code quality metrics. After running the command, team members report Claude becomes less responsive in the session and loses the context of the original task.",
    "question": "How do you most effectively fix this while keeping full analysis capabilities?",
    "options": [
      {
        "letter": "A",
        "text": "Add `context: fork` in the skill frontmatter to run the analysis in an isolated subagent context.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Add `model: haiku` in frontmatter to use a faster, cheaper model for analysis.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Split the skill into three smaller skills, each producing less output.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add instructions to the skill to compress all results into a short summary before displaying them.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "`context: fork` runs the analysis in an isolated subagent context so the large output does not pollute the main session’s context window and Claude does not lose track of the original task. It preserves full analysis capability while keeping the main session responsive.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-06",
    "scenario": "code-generation",
    "situation": "Your team uses a `/commit` skill in `.claude/skills/commit/SKILL.md`. A developer wants to customize it for their personal workflow (different commit message format, extra checks) without affecting teammates.",
    "question": "What do you recommend?",
    "options": [
      {
        "letter": "A",
        "text": "Create a personal version under `~/.claude/skills/` with a different name, e.g., `/my-commit`.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add conditional logic based on username in the project skill frontmatter.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Create a personal version at `~/.claude/skills/commit/SKILL.md` with the same name.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Set `override: true` in the personal skill frontmatter to prioritize it over the project version.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Personal skills take precedence over project skills with the same name. A personal skill at `~/.claude/skills/commit/SKILL.md` will override the team’s project skill, allowing the developer to customize their workflow while maintaining the familiar `/commit` command name for their personal use. This approach is better than option A because it preserves the original command name, improving the developer’s workflow without affecting teammates.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-07",
    "scenario": "code-generation",
    "situation": "Your team has used Claude Code for months. Recently, three developers report Claude follows the guidance “always include comprehensive error handling,” but a fourth developer who just joined says Claude does not follow it. All four work in the same repo and have up-to-date code.",
    "question": "What is the most likely cause and fix?",
    "options": [
      {
        "letter": "A",
        "text": "The guidance lives in the original developers’ user-level `~/.claude/CLAUDE.md` files, not in the project `.claude/CLAUDE.md`. Move the instruction to the project-level file so all team members receive it.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "The new developer’s `~/.claude/CLAUDE.md` contains conflicting instructions overriding project settings; they should delete the conflicting section.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Claude Code learns per-user preferences over time; the new developer must repeat the requirement until Claude “remembers” it.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Claude Code caches CLAUDE.md after first read; original developers use cached versions. Everyone should clear the Claude Code cache.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "If the guidance was added only to the original developers’ user-level configs and not to the project-level `.claude/CLAUDE.md`, new team members won’t receive it. Moving it to the project-level configuration ensures all current and future team members automatically get the guidance.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-08",
    "scenario": "code-generation",
    "situation": "You find that including 2–3 full endpoint implementation examples as context significantly improves consistency when generating new API endpoints. However, this context is useful only when creating new endpoints—not when debugging, reviewing code, or other work in the API directory.",
    "question": "Which configuration approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Add endpoint examples and pattern documentation to the project CLAUDE.md so they are always available.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Manually reference endpoint examples in every generation request by copying code into the prompt.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Configure path-specific rules in `.claude/rules/api/` that include endpoint examples and activate when working in the API directory.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Create a skill that references the endpoint examples and contains pattern-following instructions, invoked on demand via a slash command.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "A skill invoked on demand loads the example context only when generating new endpoints, not during unrelated tasks like debugging or review. This keeps the main context clean while preserving high-quality generation when needed.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-09",
    "scenario": "code-generation",
    "situation": "Your team created a `/migration` skill that generates database migration files. It takes the migration name via `$ARGUMENTS`. In production you observe three issues: (1) developers often run the skill without arguments, causing poorly named files, (2) the skill sometimes uses database schema details from unrelated prior conversations, and (3) a developer accidentally ran destructive test cleanup when the skill had broad tool access.",
    "question": "Which configuration approach fixes all three problems?",
    "options": [
      {
        "letter": "A",
        "text": "Use positional parameters `$1` and `$2` instead of `$ARGUMENTS` to enforce specific inputs, include explicit schema file references via `@` syntax for context control, and add a frontmatter description warning about destructive operations.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add `argument-hint` in frontmatter to request required parameters, use `context: fork` to isolate execution, and restrict `allowed-tools` to file-write operations.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Split into `/migration-create` and `/migration-apply` skills, add validation instructions to request migration name if missing, and use different `allowed-tools` scopes for each.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add validation instructions in the skill SKILL.md to ensure `$ARGUMENTS` is a valid name, add prompts to ignore prior conversation context, and list prohibited operations to avoid.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "This uses three separate configuration features to address each problem: `argument-hint` improves argument entry and reduces missing arguments, `context: fork` prevents context leakage from prior conversations, and `allowed-tools` constrains the skill to safe file-writing operations, preventing destructive actions.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-10",
    "scenario": "code-generation",
    "situation": "Your codebase contains areas with different coding conventions: React components use functional style with hooks, API handlers use async/await with specific error handling, and database models follow the repository pattern. Test files are distributed across the codebase next to the code under test (e.g., `Button.test.tsx` next to `Button.tsx`), and you want all tests to follow the same conventions regardless of location.",
    "question": "What is the most supported way to ensure Claude automatically applies the correct conventions when generating code?",
    "options": [
      {
        "letter": "A",
        "text": "Put all conventions in the root CLAUDE.md under headings for each area and rely on Claude to infer which section applies.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Create skills in `.claude/skills/` for each code type, embedding conventions in each SKILL.md.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Place a separate CLAUDE.md file in each subdirectory containing conventions for that area.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Create rule files under `.claude/rules/` with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "`.claude/rules/` files with YAML frontmatter and glob patterns (e.g., `**/*.test.tsx`, `src/api/**/*.ts`) enable deterministic, path-based convention application regardless of directory structure. This is the most supported approach for cross-cutting patterns like distributed test files.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-11",
    "scenario": "code-generation",
    "situation": "You want to create a custom slash command `/review` that runs your team’s standard code review checklist. It should be available to every developer when they clone or update the repository.",
    "question": "Where should you create the command file?",
    "options": [
      {
        "letter": "A",
        "text": "In `~/.claude/commands/` in each developer’s home directory.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "In the project repository under `.claude/commands/`.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "In `.claude/config.json` as an array of commands.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "In the root project CLAUDE.md.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Putting custom slash commands under `.claude/commands/` inside the project repository ensures they are version-controlled and automatically available to every developer who clones or updates the repo. This is the intended location for project-level custom commands in Claude Code.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-12",
    "scenario": "code-generation",
    "situation": "Your team’s CLAUDE.md grew beyond 500 lines mixing TypeScript conventions, testing guidance, API patterns, and deployment procedures. Developers find it hard to locate and update the right sections.",
    "question": "What approach does Claude Code support to organize project-level instructions into focused topical modules?",
    "options": [
      {
        "letter": "A",
        "text": "Define a `.claude/config.yaml` mapping file patterns to specific sections inside CLAUDE.md.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Create separate Markdown files in `.claude/rules/`, each covering one topic (e.g., `testing.md`, `api-conventions.md`).",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Split instructions into README.md files in relevant subdirectories that Claude automatically loads as instructions.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Create multiple files named CLAUDE.md at different levels of the directory tree, each overriding parent instructions.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Claude Code supports a `.claude/rules/` directory where you can create separate Markdown files for topical guidance (e.g., `testing.md`, `api-conventions.md`), allowing teams to organize large instruction sets into focused, maintainable modules.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-13",
    "scenario": "code-generation",
    "situation": "You create a custom skill `/explore-alternatives` that your team uses to brainstorm and evaluate implementation approaches before choosing one. Developers report that after running the skill, subsequent Claude responses are influenced by the alternatives discussion—sometimes referencing rejected approaches or retaining exploration context that interferes with actual implementation.",
    "question": "How should you most effectively configure this skill?",
    "options": [
      {
        "letter": "A",
        "text": "Use the `!` prefix in the skill to run exploration logic as a bash subprocess.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add `context: fork` in the skill frontmatter.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Split into two skills—`/explore-start` and `/explore-end`—to mark boundaries when exploration context should be discarded.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Create the skill in `~/.claude/skills/` instead of `.claude/skills/`.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`context: fork` runs the skill in an isolated subagent context so exploration discussions do not pollute the main conversation history. This prevents rejected approaches and brainstorming context from influencing subsequent implementation work.",
    "domain": "claude-code-config"
  },
  {
    "id": "code-generation-14",
    "scenario": "code-generation",
    "situation": "Your team wants to add a GitHub MCP server for searching PRs and checking CI status via Claude Code. Each of six developers has their own personal GitHub access token. You want consistent tooling across the team without committing credentials to version control.",
    "question": "Which configuration approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Have each developer add the server in user scope via `claude mcp add --scope user`.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Create an MCP server wrapper that reads tokens from a `.env` file and proxies GitHub API calls, then add the wrapper to the project `.mcp.json`.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add the server to the project `.mcp.json` using environment variable substitution (`${GITHUB_TOKEN}`) for auth and document the required environment variable in the project README.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Configure the server in project scope with a placeholder token, then tell developers to override it in their local config.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "A project `.mcp.json` with environment variable substitution is idiomatic: it provides a single version-controlled source of truth for MCP configuration while letting each developer supply credentials via environment variables. Documenting the variable makes onboarding easy without committing secrets.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "code-generation-15",
    "scenario": "code-generation",
    "situation": "You’re adding error-handling wrappers around external API calls across a 120-file codebase. The work has three phases: (1) discover all call sites and patterns, (2) collaboratively design the error-handling approach, and (3) implement wrappers consistently. In Phase 1, Claude generates large output listing hundreds of call sites with context, quickly filling the context window before discovery finishes.",
    "question": "Which approach is most effective to complete the task while maintaining implementation consistency?",
    "options": [
      {
        "letter": "A",
        "text": "Use an Explore subagent for Phase 1 to isolate verbose discovery output and return a summary, then continue Phases 2–3 in the main conversation.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Do all phases in the main conversation, periodically using `/compact` to reduce context usage while moving through files.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Switch to headless mode with `--continue`, passing explicit context summaries between batch calls to maintain continuity.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Define the error-handling pattern in CLAUDE.md, then process files in batches across multiple sessions relying on the shared memory file for consistency.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "An Explore subagent isolates the verbose discovery output in a separate context and returns only a concise summary to the main conversation. This preserves the main context window for the collaborative design and consistent implementation phases where retained context is most valuable.",
    "domain": "agent-architecture"
  }
];
