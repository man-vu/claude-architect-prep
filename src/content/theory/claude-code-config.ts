import type { TheoryQuestion } from "@/domain/types";

export const claudeCodeConfigTheory: TheoryQuestion[] = [
  {
    id: "t-cc-01",
    domain: "claude-code-config",
    question:
      "Why don't team coding standards written into `~/.claude/CLAUDE.md` reach a new developer who clones the repo?",
    options: [
      {
        letter: "A",
        text: "User-level CLAUDE.md only loads when editing files in the home directory",
        correct: false,
      },
      {
        letter: "B",
        text: "The project-level `.claude/CLAUDE.md` always overrides user-level content",
        correct: false,
      },
      {
        letter: "C",
        text: "The file lives only on the author's machine and is never version-controlled, so it was never in the repo",
        correct: true,
      },
      {
        letter: "D",
        text: "New developers must run `/memory` once before user-level files start loading",
        correct: false,
      },
    ],
    correct: "C",
    explanation:
      "User-level config (`~/.claude/CLAUDE.md`) is personal and never shared via VCS, so it is invisible to new teammates. Team standards belong in a project-level file (`.claude/CLAUDE.md` or root `CLAUDE.md`) that ships with the repo.",
  },
  {
    id: "t-cc-02",
    domain: "claude-code-config",
    question:
      "When does a `CLAUDE.md` file placed inside a subdirectory (e.g. `packages/api/CLAUDE.md`) load?",
    options: [
      {
        letter: "A",
        text: "Always, as soon as any Claude Code session starts in the repo",
        correct: false,
      },
      {
        letter: "B",
        text: "Only when Claude Code is actively working with files in that directory",
        correct: true,
      },
      {
        letter: "C",
        text: "Only when the file is referenced from `.claude/rules/`",
        correct: false,
      },
      {
        letter: "D",
        text: "Only when explicitly imported with `@path` from the root `CLAUDE.md`",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "Directory-level `CLAUDE.md` activates only when Claude Code edits files in that directory, which makes it useful for package- or module-specific conventions in a monorepo without bloating the root file.",
  },
  {
    id: "t-cc-03",
    domain: "claude-code-config",
    question: "How deeply can `@path` imports nest inside CLAUDE.md files?",
    options: [
      {
        letter: "A",
        text: "They cannot nest — only the top-level CLAUDE.md may contain imports",
        correct: false,
      },
      { letter: "B", text: "Up to 3 levels deep", correct: false },
      { letter: "C", text: "Unlimited depth", correct: false },
      { letter: "D", text: "Up to 5 levels deep", correct: true },
    ],
    correct: "D",
    explanation:
      "Imports can nest — an import inside an imported file, etc. — but only up to 5 levels deep. Also note there must be no space between `@` and the path, and both relative and absolute paths are supported.",
  },
  {
    id: "t-cc-04",
    domain: "claude-code-config",
    question: "What causes a rule file in `.claude/rules/` to load into context?",
    options: [
      {
        letter: "A",
        text: "Claude Code entering the directory where the rule file lives",
        correct: false,
      },
      {
        letter: "B",
        text: "The edited file matching the `paths` glob in the rule's YAML frontmatter, anywhere in the repo",
        correct: true,
      },
      {
        letter: "C",
        text: "The user explicitly invoking the rule with a slash command",
        correct: false,
      },
      {
        letter: "D",
        text: "The rule being imported via `@path` from the root `CLAUDE.md`",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "Rules load based on which file is being edited, not which directory you're in: the rule loads only when the touched file matches its `paths` glob. Irrelevant rules never load, which saves context tokens — the key contrast with directory-level `CLAUDE.md`.",
  },
  {
    id: "t-cc-05",
    domain: "claude-code-config",
    question:
      "Where should a `/review` slash command live so every teammate gets it the moment they clone the repo?",
    options: [
      { letter: "A", text: "`.claude/commands/` in the repo", correct: true },
      { letter: "B", text: "`~/.claude/commands/`", correct: false },
      { letter: "C", text: "`.claude/skills/review/`", correct: false },
      { letter: "D", text: "The root `CLAUDE.md` file", correct: false },
    ],
    correct: "A",
    explanation:
      "Project-scoped commands in `.claude/commands/` are version-controlled and available to the whole team on clone; `~/.claude/commands/` is personal only. A `review.md` there becomes the team-wide `/review` command.",
  },
  {
    id: "t-cc-06",
    domain: "claude-code-config",
    question:
      "Which SKILL.md frontmatter field runs the skill in an isolated subagent so its verbose tool output never pollutes the main session's context?",
    options: [
      { letter: "A", text: "`allowed-tools`", correct: false },
      { letter: "B", text: "`argument-hint`", correct: false },
      { letter: "C", text: "`context: fork`", correct: true },
      { letter: "D", text: "`isolated: true`", correct: false },
    ],
    correct: "C",
    explanation:
      "`context: fork` runs the skill in an isolated subagent: search noise and intermediate reads stay out of the main session's context window, and only the final result comes back.",
  },
  {
    id: "t-cc-07",
    domain: "claude-code-config",
    question: "What does the `allowed-tools` field in SKILL.md frontmatter enforce?",
    options: [
      {
        letter: "A",
        text: "Which arguments the user must supply when invoking the skill",
        correct: false,
      },
      {
        letter: "B",
        text: "A least-privilege restriction on which tools the skill may use, even if its instructions never mention others",
        correct: true,
      },
      {
        letter: "C",
        text: "Which subagents the skill is allowed to spawn",
        correct: false,
      },
      {
        letter: "D",
        text: "Which file globs trigger the skill to load automatically",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "`allowed-tools` is least-privilege tool restriction: a code-review skill that only needs `Read`/`Grep`/`Glob` shouldn't also be able to `Write` or `rm`. Prompting for missing arguments is the job of `argument-hint` instead.",
  },
  {
    id: "t-cc-08",
    domain: "claude-code-config",
    question: "What characterizes Claude Code's planning mode?",
    options: [
      {
        letter: "A",
        text: "It implements changes immediately but asks for confirmation before each write",
        correct: false,
      },
      {
        letter: "B",
        text: "It runs every edit inside a forked subagent",
        correct: false,
      },
      {
        letter: "C",
        text: "It executes shell commands only, never file edits",
        correct: false,
      },
      {
        letter: "D",
        text: "Read-only investigation (`Read`/`Grep`/`Glob`) that produces a plan, with zero side effects until the user approves",
        correct: true,
      },
    ],
    correct: "D",
    explanation:
      "Planning mode is read-only exploration ending in a plan for approval — nothing changes until then. It fits multi-file changes, architectural decisions, and unfamiliar codebases; direct execution suits single-file, unambiguous fixes with a clear stack trace.",
  },
  {
    id: "t-cc-09",
    domain: "claude-code-config",
    question:
      "What benefit does dispatching an Explore subagent for read-heavy discovery work give the main session?",
    options: [
      {
        letter: "A",
        text: "The main session can keep editing files while searches run with write access",
        correct: false,
      },
      {
        letter: "B",
        text: "The verbose search back-and-forth stays isolated; the main session receives only a distilled answer",
        correct: true,
      },
      {
        letter: "C",
        text: "It automatically switches the main session into planning mode",
        correct: false,
      },
      {
        letter: "D",
        text: "It refreshes stale tool results left behind by a resumed session",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "An Explore subagent handles symbol searches, directory mapping, and call-site hunting, so the main session gets a distilled answer instead of every intermediate grep result — the same context-isolation benefit `context: fork` gives skills.",
  },
  {
    id: "t-cc-10",
    domain: "claude-code-config",
    question:
      "Which CLI flag makes Claude Code non-interactive — printing the result to stdout and exiting — as required in CI?",
    options: [
      { letter: "A", text: "`--output-format json`", correct: false },
      { letter: "B", text: "`--headless`", correct: false },
      { letter: "C", text: "`-p` / `--print`", correct: true },
      { letter: "D", text: "`--resume`", correct: false },
    ],
    correct: "C",
    explanation:
      "`-p`/`--print` processes the prompt, writes to stdout, and exits — the only correct way to invoke Claude Code from a pipeline, since any other mode expects a TTY and hangs. Pair it with `--output-format json` and `--json-schema` when CI needs structured, machine-parseable output.",
  },
  {
    id: "t-cc-11",
    domain: "claude-code-config",
    question:
      "What is the recommended way to review a diff that a Claude Code session just generated?",
    options: [
      {
        letter: "A",
        text: "Start a fresh, independent session (no `--resume`) dedicated to the review",
        correct: true,
      },
      {
        letter: "B",
        text: "Ask the same session that wrote the code, since it has the most context",
        correct: false,
      },
      {
        letter: "C",
        text: "`--resume` the writing session so the reviewer sees its accumulated reasoning",
        correct: false,
      },
      {
        letter: "D",
        text: "Run `/compact` in the writing session, then review there",
        correct: false,
      },
    ],
    correct: "A",
    explanation:
      "The session that generated a diff is biased toward its own decisions, so reviewing in it is a named anti-pattern — spin up a fresh session with fresh context. On re-review after fixes, feed the prior findings in and ask for only new or unresolved issues (the delta).",
  },
  {
    id: "t-cc-12",
    domain: "claude-code-config",
    question:
      "According to the quick-reference table, which configuration mechanism has no personal (`~/.claude/`) variant?",
    options: [
      { letter: "A", text: "CLAUDE.md", correct: false },
      { letter: "B", text: "Commands", correct: false },
      { letter: "C", text: "Skills", correct: false },
      { letter: "D", text: "Rules", correct: true },
    ],
    correct: "D",
    explanation:
      "Rules exist only as team-level `.claude/rules/*.md`, while CLAUDE.md, commands, and skills each have a `~/.claude/` personal variant. The common thread: anything under `~/.claude/` is yours alone; anything under the project's `.claude/` ships with `git clone`.",
  },
  {
    id: "t-cc-13",
    domain: "claude-code-config",
    question:
      "Which built-in command opens the `CLAUDE.md` file for editing so notes persist across sessions and load automatically on startup?",
    options: [
      { letter: "A", text: "`/compact`", correct: false },
      { letter: "B", text: "`/resume`", correct: false },
      { letter: "C", text: "`/rules`", correct: false },
      { letter: "D", text: "`/memory`", correct: true },
    ],
    correct: "D",
    explanation:
      "`/memory` opens `CLAUDE.md` for editing, the alternative to re-explaining conventions every session. `/compact` instead compresses the current context by summarizing history — with the risk that exact numbers, dates, and specifics get lost, so extract critical facts first.",
  },
  {
    id: "t-cc-14",
    domain: "claude-code-config",
    question: "What risk comes with resuming a saved session via `--resume <session-name>`?",
    options: [
      {
        letter: "A",
        text: "The session's `allowed-tools` restrictions are dropped on resume",
        correct: false,
      },
      {
        letter: "B",
        text: "Prior context is automatically compacted, losing numeric details",
        correct: false,
      },
      {
        letter: "C",
        text: "Its cached tool results (file contents, grep hits) may be stale if files changed — nothing is re-read automatically",
        correct: true,
      },
      {
        letter: "D",
        text: "It forks the session, so subsequent work diverges from the original",
        correct: false,
      },
    ],
    correct: "C",
    explanation:
      "A resumed session doesn't re-read anything it already \"saw,\" so if files changed its tool results go stale — in that case start fresh with a short summary instead. Branching from a shared context point to compare approaches is `fork_session`, a separate mechanism.",
  },
  {
    id: "t-cc-15",
    domain: "claude-code-config",
    question:
      "When iterating on output, when should feedback be batched into one message versus given sequentially?",
    options: [
      {
        letter: "A",
        text: "Batch all issues when they're interdependent; give them sequentially when they're independent, so each fix is evaluated in isolation",
        correct: true,
      },
      {
        letter: "B",
        text: "Always batch — sequential feedback wastes context tokens",
        correct: false,
      },
      {
        letter: "C",
        text: "Batch when issues are independent; go sequentially when they're interdependent",
        correct: false,
      },
      {
        letter: "D",
        text: "Always give feedback sequentially, one issue per message",
        correct: false,
      },
    ],
    correct: "A",
    explanation:
      "Interdependent issues belong in one batched message; independent issues go one at a time so each fix is judged in isolation. The page pairs this with giving 2–3 concrete input/output examples and test-driven iteration as the other keys to progressive improvement.",
  },
  {
    id: "t-cc-16",
    domain: "claude-code-config",
    question: "What does the `argument-hint` field in SKILL.md frontmatter do?",
    options: [
      {
        letter: "A",
        text: "Restricts which argument values the skill will accept at invocation",
        correct: false,
      },
      {
        letter: "B",
        text: "It is shown to the user when the skill is invoked without arguments, prompting them for what to supply",
        correct: true,
      },
      {
        letter: "C",
        text: "It supplies a default argument automatically when none is given",
        correct: false,
      },
      {
        letter: "D",
        text: "It documents arguments for other developers but is never displayed",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "`argument-hint` is displayed when the skill is invoked without arguments, prompting the user for what to supply — e.g. `[effort level: low|medium|high]`. Tool restriction is `allowed-tools`; isolation is `context: fork`.",
  },
  {
    id: "t-cc-17",
    domain: "claude-code-config",
    question: "How does the page distinguish a Skill from CLAUDE.md content?",
    options: [
      {
        letter: "A",
        text: "Skills are always loaded; CLAUDE.md content loads only on demand",
        correct: false,
      },
      {
        letter: "B",
        text: "CLAUDE.md holds active procedures; skills hold passive standards",
        correct: false,
      },
      {
        letter: "C",
        text: "CLAUDE.md is always-loaded, passive, general standards; a skill is an on-demand, active procedure invoked for a specific task",
        correct: true,
      },
      {
        letter: "D",
        text: "Skills are personal-only while CLAUDE.md is team-only",
        correct: false,
      },
    ],
    correct: "C",
    explanation:
      "CLAUDE.md carries always-loaded standards like \"we use 2-space indent\"; a skill packages a whole reusable workflow invoked for a specific task (`/review`, `/deploy`) — \"it's a procedure, not a fact.\"",
  },
  {
    id: "t-cc-18",
    domain: "claude-code-config",
    question:
      "Where does a personal skill live — one you use across your own projects but haven't committed to the team repo?",
    options: [
      {
        letter: "A",
        text: "`~/.claude/skills/<name>/SKILL.md`",
        correct: true,
      },
      {
        letter: "B",
        text: "`.claude/skills/<name>/SKILL.md`",
        correct: false,
      },
      { letter: "C", text: "`~/.claude/commands/<name>.md`", correct: false },
      {
        letter: "D",
        text: "A skills section inside `~/.claude/CLAUDE.md`",
        correct: false,
      },
    ],
    correct: "A",
    explanation:
      "Like commands, skills have personal variants: `~/.claude/skills/<name>/SKILL.md` is yours alone across projects, while `.claude/skills/<name>/` in the repo is the team variant that ships with `git clone`.",
  },
  {
    id: "t-cc-19",
    domain: "claude-code-config",
    question:
      "Which of the following is listed as a trigger for direct execution rather than planning mode?",
    options: [
      {
        letter: "A",
        text: "The change spans dozens of files",
        correct: false,
      },
      {
        letter: "B",
        text: "Multiple plausible implementation approaches exist and the choice matters",
        correct: false,
      },
      {
        letter: "C",
        text: "The codebase is unfamiliar and a wrong first move is costly",
        correct: false,
      },
      {
        letter: "D",
        text: "The fix is confined to a single file with a clear stack trace pointing at the bug",
        correct: true,
      },
    ],
    correct: "D",
    explanation:
      "Direct execution suits single-file, well-understood, unambiguous changes — especially with a clear stack trace. The other three options are the page's triggers for planning mode instead.",
  },
  {
    id: "t-cc-20",
    domain: "claude-code-config",
    question:
      "In the standard workflow composing the two modes, what happens between planning mode and direct execution?",
    options: [
      {
        letter: "A",
        text: "`/compact` runs to compress the plan into context",
        correct: false,
      },
      {
        letter: "B",
        text: "The user reviews and approves the plan; direct execution then implements exactly what was approved",
        correct: true,
      },
      {
        letter: "C",
        text: "An Explore subagent independently verifies the plan",
        correct: false,
      },
      {
        letter: "D",
        text: "The session is forked so both modes proceed in parallel",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "The composition is: planning mode (investigate + design) → user reviews and approves the plan → direct execution (implement exactly what was approved). Approval is the gate — planning mode has zero side effects until it happens.",
  },
  {
    id: "t-cc-21",
    domain: "claude-code-config",
    question:
      "What does pairing `--output-format json` with `--json-schema '{...}'` accomplish?",
    options: [
      {
        letter: "A",
        text: "It makes the CLI non-interactive so it never waits for a TTY",
        correct: false,
      },
      {
        letter: "B",
        text: "It resumes the prior session with its context serialized as JSON",
        correct: false,
      },
      {
        letter: "C",
        text: "It compresses the response to save output tokens",
        correct: false,
      },
      {
        letter: "D",
        text: "It forces structured, schema-validated output instead of free-form prose, so a CI script can parse it directly",
        correct: true,
      },
    ],
    correct: "D",
    explanation:
      "The pair yields machine-parseable, schema-validated output — e.g. so CI can auto-post inline PR review comments per finding. Non-interactivity is the separate job of `-p`/`--print`.",
  },
  {
    id: "t-cc-22",
    domain: "claude-code-config",
    question:
      "When re-reviewing after fixes are pushed, what should the new review session be given and asked to do?",
    options: [
      {
        letter: "A",
        text: "Feed it the prior findings explicitly and ask it to report only new or still-unresolved issues",
        correct: true,
      },
      {
        letter: "B",
        text: "Give it only the original diff so the review stays unbiased",
        correct: false,
      },
      {
        letter: "C",
        text: "`--resume` the first review session so it remembers its findings",
        correct: false,
      },
      {
        letter: "D",
        text: "Give it a `/compact` summary of the writing session",
        correct: false,
      },
    ],
    correct: "A",
    explanation:
      "Without the prior findings and a delta-only instruction, every re-review re-lists the same already-fixed problems, drowning out what actually changed.",
  },
  {
    id: "t-cc-23",
    domain: "claude-code-config",
    question: "What does `/compact` do, and what is its documented risk?",
    options: [
      {
        letter: "A",
        text: "Saves the session under a name for later resume; risk: stale tool results",
        correct: false,
      },
      {
        letter: "B",
        text: "Clears the context entirely; risk: losing the whole conversation",
        correct: false,
      },
      {
        letter: "C",
        text: "Summarizes prior history to free up the context window; risk: exact numeric values, dates, and specific details can be lost",
        correct: true,
      },
      {
        letter: "D",
        text: "Opens CLAUDE.md for editing; risk: overwriting team standards",
        correct: false,
      },
    ],
    correct: "C",
    explanation:
      "`/compact` compresses the current context during long sessions full of verbose tool output. Because specifics can be lost in the summary, extract critical facts into a persistent block or scratchpad before compacting.",
  },
  {
    id: "t-cc-24",
    domain: "claude-code-config",
    question: "What does `fork_session` do?",
    options: [
      {
        letter: "A",
        text: "Resumes the most recent session with its tool results refreshed",
        correct: false,
      },
      {
        letter: "B",
        text: "Branches an independent session from a shared context point — both forks inherit context up to the branch, then diverge",
        correct: true,
      },
      {
        letter: "C",
        text: "Runs a skill inside an isolated subagent",
        correct: false,
      },
      {
        letter: "D",
        text: "Splits the context window between two concurrent prompts",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "`fork_session` branches from a shared context point so two sessions can diverge — useful for comparing approaches (e.g. \"Redux vs Context API\") without cross-contamination. Skill isolation is `context: fork`, a different mechanism.",
  },
  {
    id: "t-cc-25",
    domain: "claude-code-config",
    question:
      "When a saved session's tool results are stale or context has degraded, what does the page recommend instead of `--resume`?",
    options: [
      {
        letter: "A",
        text: "Start a fresh session with a short summary of prior findings (\"Here's what we found: …\")",
        correct: true,
      },
      {
        letter: "B",
        text: "Resume anyway and immediately run `/compact`",
        correct: false,
      },
      {
        letter: "C",
        text: "Resume and instruct the session to re-read every file it previously saw",
        correct: false,
      },
      {
        letter: "D",
        text: "Fork the stale session so the fork refreshes its tool results",
        correct: false,
      },
    ],
    correct: "A",
    explanation:
      "If files changed or a lot of time has passed, restart with a short summary rather than resuming with old tool data — a resumed session never automatically re-reads what it already \"saw.\"",
  },
  {
    id: "t-cc-26",
    domain: "claude-code-config",
    question:
      "What does the page name as the most effective way to communicate output expectations during iterative refinement?",
    options: [
      {
        letter: "A",
        text: "A detailed prose specification covering every requirement",
        correct: false,
      },
      {
        letter: "B",
        text: "Letting Claude interview you before starting",
        correct: false,
      },
      {
        letter: "C",
        text: "Batching all feedback into a single message",
        correct: false,
      },
      {
        letter: "D",
        text: "2–3 concrete input/output examples, including edge cases, showing the transformation you want",
        correct: true,
      },
    ],
    correct: "D",
    explanation:
      "Concrete input/output examples are called the most effective way to communicate expectations — give 2–3 samples including edge cases. The interview pattern and batching rules are separate techniques on the same page.",
  },
  {
    id: "t-cc-27",
    domain: "claude-code-config",
    question: "What is the \"interview pattern\" in iterative refinement?",
    options: [
      {
        letter: "A",
        text: "Having a second session interview the first about its diff",
        correct: false,
      },
      {
        letter: "B",
        text: "Asking the user to grade each iteration against a rubric",
        correct: false,
      },
      {
        letter: "C",
        text: "Letting Claude ask clarifying questions to surface non-obvious design considerations before implementing",
        correct: true,
      },
      {
        letter: "D",
        text: "Feeding interview-style Q&A transcripts as few-shot examples",
        correct: false,
      },
    ],
    correct: "C",
    explanation:
      "The interview pattern lets Claude ask clarifying questions first, surfacing non-obvious design considerations such as cache invalidation and failure modes before any implementation.",
  },
  {
    id: "t-cc-28",
    domain: "claude-code-config",
    question:
      "Which statement about `@path` import syntax in CLAUDE.md is correct?",
    options: [
      {
        letter: "A",
        text: "A space is required between `@` and the path",
        correct: false,
      },
      {
        letter: "B",
        text: "No space is allowed between `@` and the path, and both relative and absolute paths are supported",
        correct: true,
      },
      {
        letter: "C",
        text: "Only absolute paths are supported",
        correct: false,
      },
      {
        letter: "D",
        text: "Imports may only appear in the root CLAUDE.md",
        correct: false,
      },
    ],
    correct: "B",
    explanation:
      "The rules are: no space between `@` and the path, with both relative (`@./standards/x.md`) and absolute paths supported. This lets a monorepo keep one canonical `coding-style.md` referenced from every package's CLAUDE.md instead of duplicating it.",
  },
  {
    id: "t-cc-29",
    domain: "claude-code-config",
    question:
      "Per the page's selection rule, where do conventions for a file type scattered across the repo (e.g. all `*.test.tsx`) go, versus conventions for everything under one directory (e.g. `packages/api/`)?",
    options: [
      {
        letter: "A",
        text: "File type: `.claude/rules/` with a `paths` glob; directory: a directory-level `CLAUDE.md`",
        correct: true,
      },
      {
        letter: "B",
        text: "File type: a directory-level `CLAUDE.md`; directory: `.claude/rules/` with a `paths` glob",
        correct: false,
      },
      {
        letter: "C",
        text: "Both belong in the root `CLAUDE.md` via `@path` imports",
        correct: false,
      },
      {
        letter: "D",
        text: "Both belong in `.claude/rules/`; directory-level CLAUDE.md is deprecated",
        correct: false,
      },
    ],
    correct: "A",
    explanation:
      "Both mechanisms scope content but on different dimensions: `.claude/rules/` triggers on a file-pattern glob anywhere in the repo, while directory-level `CLAUDE.md` triggers on physical location. \"All test files\" is a glob rule; \"everything under `packages/api/`\" is a directory CLAUDE.md.",
  },
  {
    id: "t-cc-30",
    domain: "claude-code-config",
    question:
      "Which locations count as project-level CLAUDE.md, and what is their scope?",
    options: [
      {
        letter: "A",
        text: "`~/.claude/CLAUDE.md` or root `CLAUDE.md`; visible only to the repo owner",
        correct: false,
      },
      {
        letter: "B",
        text: "`.claude/rules/CLAUDE.md` only; all contributors",
        correct: false,
      },
      {
        letter: "C",
        text: "`.claude/CLAUDE.md` or a root `CLAUDE.md`; version-controlled and applying to all contributors to the repo",
        correct: true,
      },
      {
        letter: "D",
        text: "Root `CLAUDE.md` only, and only for contributors who have run `/memory`",
        correct: false,
      },
    ],
    correct: "C",
    explanation:
      "Project level means `.claude/CLAUDE.md` or a repo-root `CLAUDE.md` — committed to version control so it ships with `git clone` and reaches every contributor, unlike the personal `~/.claude/CLAUDE.md`.",
  },
  {
    id: "t-cc-31",
    domain: "claude-code-config",
    question: "What does the page's \"test-driven iteration\" technique entail?",
    options: [
      {
        letter: "A",
        text: "Running the full e2e suite after every prompt",
        correct: false,
      },
      {
        letter: "B",
        text: "Asking Claude to generate tests once the implementation is complete",
        correct: false,
      },
      {
        letter: "C",
        text: "Iterating on the tests until they match whatever the implementation does",
        correct: false,
      },
      {
        letter: "D",
        text: "Writing the tests / expected behavior first, then iterating based on failures",
        correct: true,
      },
    ],
    correct: "D",
    explanation:
      "Test-driven iteration means specifying expected behavior as tests up front and letting failures drive each refinement pass — one of the page's core iterative-refinement techniques alongside concrete I/O examples.",
  },
  {
    id: "t-cc-32",
    domain: "claude-code-config",
    question:
      "In a CI pipeline, how does an automated Claude Code run learn the project's testing standards, fixture conventions, and review criteria?",
    options: [
      { letter: "A", text: "From command-line arguments passed on every `claude -p` invocation", correct: false },
      { letter: "B", text: "From the checked-in CLAUDE.md, which carries project context since no human is present to explain conventions", correct: true },
      { letter: "C", text: "It infers them automatically by scanning the repository's git history", correct: false },
      { letter: "D", text: "From a `--conventions` flag pointing at a YAML config file", correct: false },
    ],
    correct: "B",
    explanation:
      "CLAUDE.md is the mechanism that gives a CI-invoked Claude Code its project context — documenting testing standards, available fixtures, and review criteria there measurably improves generated-test quality and reduces low-value output.",
  },
  {
    id: "t-cc-33",
    domain: "claude-code-config",
    question:
      "When using Claude Code to generate tests in CI, why should the existing test files be included in its context?",
    options: [
      { letter: "A", text: "So the generator can copy their formatting style exactly", correct: false },
      { letter: "B", text: "Because test generation fails outright without at least one example test", correct: false },
      { letter: "C", text: "So it knows which scenarios are already covered and targets uncovered behavior instead of proposing duplicates", correct: true },
      { letter: "D", text: "To let the generator delete outdated tests in the same pass", correct: false },
    ],
    correct: "C",
    explanation:
      "Without the existing suite in context the generator can't know what's already tested and will propose duplicate scenarios; with it, generation aims at genuinely uncovered behavior.",
  },
  // t-cc-34..35 are original additions covering parallel work with git worktrees,
  // an exam topic not yet drilled by the study-page-derived set.
  {
    id: "t-cc-34",
    domain: "claude-code-config",
    question:
      "What is the recommended way to run two Claude Code sessions on the same repository in parallel — one building a feature, one fixing an unrelated bug?",
    options: [
      { letter: "A", text: "Run both sessions in the same directory on different branches; git isolates their changes automatically", correct: false },
      { letter: "B", text: "Make a full second clone of the repository and manually sync branches between the two copies", correct: false },
      { letter: "C", text: "Give each session its own git worktree — a separate working directory checked out to its own branch — so file edits and git state cannot collide", correct: true },
      { letter: "D", text: "Run both in one directory and instruct each session to touch only its own files", correct: false },
    ],
    correct: "C",
    explanation:
      "`git worktree add` creates an additional working directory attached to the same repository, each checked out to its own branch — two sessions get isolated files and git state while sharing one object store. Branches do not isolate uncommitted edits in a shared directory (a checkout switches files under the other session's feet), a second clone works but needs manual branch syncing, and \"only touch your own files\" is a probabilistic instruction, not an isolation boundary.",
  },
  {
    id: "t-cc-35",
    domain: "claude-code-config",
    question:
      "Two Claude Code sessions work in separate git worktrees of the same repository. Which constraint should you plan around?",
    options: [
      { letter: "A", text: "The same branch cannot be checked out in two worktrees at once — give each session its own branch and merge when the work lands", correct: true },
      { letter: "B", text: "Commits made in one worktree are invisible to the other until pushed to the remote", correct: false },
      { letter: "C", text: "Each worktree keeps its own full copy of the repository history, doubling disk usage", correct: false },
      { letter: "D", text: "Worktrees cannot share a remote, so each must be configured with its own origin", correct: false },
    ],
    correct: "A",
    explanation:
      "Worktrees share one underlying repository: commits made in one are immediately visible to the other with no remote round-trip, history isn't duplicated, and they share the same remotes. The real constraint is that git refuses to check out a branch that is already checked out in another worktree — so parallel sessions each need their own branch, integrated by merge or rebase afterward.",
  },
];
