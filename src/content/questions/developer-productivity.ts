import type { Question } from "@/domain/types";

export const developerProductivity: Question[] = [
  {
    "id": "developer-productivity-01",
    "scenario": "developer-productivity",
    "situation": "You're investigating a bug report claiming a deprecated helper function `formatLegacyDate` is still being called somewhere in a 300-file TypeScript monorepo. You don't know which files call it, only the function's name.",
    "question": "Which built-in tool should you use first to locate every call site?",
    "options": [
      {
        "letter": "A",
        "text": "Run `Glob` with the pattern `**/formatLegacyDate*.ts` to find matching files.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Run `Grep` for the literal string `formatLegacyDate` across the repository.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Read every file under `src/` and manually scan for the function name.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Run `Bash` with `ls -R` to list all files, then open whichever ones look related.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`Grep` searches file contents, which is exactly what's needed to find call sites of a function by name. `Glob` only matches file paths and names, not what's written inside files, so it would only find a file literally named `formatLegacyDate*.ts`, not files that merely call the function. Reading every file or guessing from a directory listing doesn't scale and burns context on irrelevant files.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-02",
    "scenario": "developer-productivity",
    "situation": "You're asked to fix a bug in the checkout flow where discount codes apply twice. The codebase is large and unfamiliar to you.",
    "question": "Which investigation approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Glob for `**/*.ts` to list every file, then Read each one in order until you find the discount logic.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Ask the user to point you to the exact file and line before doing any exploration yourself.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Grep for the entry point (e.g. `applyDiscount`), Read that file to trace the logic, then Grep for other usages of the functions involved and Read the relevant consumer files.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Read the entire `src/checkout` directory in one pass to build full context before making any changes.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Incremental investigation — grep for an entry point, read to trace the flow, grep for usages, then read the consumer files — builds exactly the context needed without loading unrelated files. Reading everything in a directory or the whole repo up front wastes context on code unrelated to the bug, and skipping exploration to ask the user first forfeits information you can find yourself quickly.",
    "domain": "context-reliability"
  },
  {
    "id": "developer-productivity-03",
    "scenario": "developer-productivity",
    "situation": "You need to update a `timeout: 30` setting in a config file, but that exact text appears five times for five different services, and only one of them should change.",
    "question": "`Edit` fails because the target text isn't unique. What's the correct fallback?",
    "options": [
      {
        "letter": "A",
        "text": "Read the file, apply the change programmatically to the correct occurrence based on surrounding context, then Write the full file back.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Retry `Edit` with `replace_all: true`, since that will succeed without an ambiguity error.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Run a `Bash` command with `sed` to replace all occurrences of `timeout: 30` in the file.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Delete the file and recreate it from scratch with `Write`, manually retyping the entire contents.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "When `Edit` can't find a unique match, the reliable fallback is to `Read` the file, make the change programmatically using surrounding context to target the right occurrence, and `Write` the result back. `replace_all: true` and a blanket `sed` substitution share the same flaw: they'd change all five occurrences when only one should change.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-04",
    "scenario": "developer-productivity",
    "situation": "You've built a personal skill that reformats your commit messages in a style your team hasn't agreed to adopt. You want it available in every project you personally work on, without affecting teammates or requiring it to be committed to any repo.",
    "question": "Where should this skill live?",
    "options": [
      {
        "letter": "A",
        "text": "In `.claude/skills/` inside each project repository, committed alongside the project's code.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "In `.claude/commands/` in whichever project you're currently working in.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "As a section in the project's `CLAUDE.md` describing the desired commit format.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "In `~/.claude/skills/`, your personal, user-level skills directory.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "`~/.claude/skills/` is the personal, user-level location: it's available across every project you work on and isn't committed to any repository, so it never gets shared with or imposed on teammates. Putting it in `.claude/skills/` or `CLAUDE.md` at the project level would commit it to the repo and apply it to the whole team.",
    "domain": "claude-code-config"
  },
  {
    "id": "developer-productivity-05",
    "scenario": "developer-productivity",
    "situation": "Your team's `/find-todos` skill scans the codebase for `TODO` comments and reports them. During one run, Claude decided a TODO looked easy to resolve and used `Edit` to fix it directly — surprising the developer, who only wanted a report.",
    "question": "What configuration change best prevents this?",
    "options": [
      {
        "letter": "A",
        "text": "Add stronger wording to `SKILL.md` instructing Claude to never modify files during this skill.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Restrict the skill's `allowed-tools` in frontmatter to read-only tools like `Grep`, `Glob`, and `Read`.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Add `context: fork` so the skill runs in an isolated subagent.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Rename the skill to `/find-todos-readonly` to signal intent to Claude.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Restricting `allowed-tools` to read-only tools mechanically prevents the skill from ever calling `Edit`, regardless of what Claude decides mid-run. Instructions alone or a suggestive name can still be second-guessed, and `context: fork` isolates output/context but doesn't restrict which tools the skill can call.",
    "domain": "claude-code-config"
  },
  {
    "id": "developer-productivity-06",
    "scenario": "developer-productivity",
    "situation": "A `/find-usages` skill searches the entire codebase for every call site of a given function and returns a long, detailed listing. Developers notice that after running it, the main conversation becomes sluggish and Claude seems to lose track of the original task.",
    "question": "What frontmatter change best addresses this?",
    "options": [
      {
        "letter": "A",
        "text": "Add `context: fork` so the verbose discovery output runs and stays in an isolated subagent context.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Set `allowed-tools` to only `Grep` so the skill can't accidentally modify files.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add `argument-hint` so developers must specify a narrower search scope.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Truncate the skill's output to only the first 20 matches.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "`context: fork` runs the verbose discovery in an isolated subagent, so its large output never pollutes the main session's context — fixing the sluggishness and lost task-tracking. Restricting `allowed-tools` addresses safety, not context bloat, and truncating output or narrowing scope lose information rather than isolating it.",
    "domain": "claude-code-config"
  },
  {
    "id": "developer-productivity-07",
    "scenario": "developer-productivity",
    "situation": "You built an automated code-quality analysis skill. Developers want to pipe its findings into a dashboard that groups issues by severity and jumps straight to the offending code.",
    "question": "How should the skill's findings be formatted?",
    "options": [
      {
        "letter": "A",
        "text": "As a narrative markdown report summarizing overall code health and general recommendations.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "As a plain list of issue descriptions ordered by the file's position in the directory tree.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "As JSON objects with `location` (e.g. `src/auth/login.ts:42`), `issue`, `severity`, and `suggested fix` fields.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "As inline code comments (like `// FIXME`) inserted directly into the source files during the scan.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Structured JSON with `location`, `issue`, `severity`, and `suggested fix` fields is machine-actionable: a dashboard can parse it, group by severity, and navigate straight to `file:line`. Narrative prose or an unordered description list can't be reliably parsed or sorted, and writing comments into source files during a read-only analysis conflates reporting with modification.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-08",
    "scenario": "developer-productivity",
    "situation": "You want to review only the test files for the `Button` component located at `src/components/Button/`. You run `Glob` with the pattern `**/*.test.*`.",
    "question": "What's the problem with this approach, and what should you do instead?",
    "options": [
      {
        "letter": "A",
        "text": "`Glob` can't match test files at all; use `Grep` for the word `test` instead.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "`Glob` doesn't support the `**` wildcard; use `src/components/Button/*.test.tsx` with a single `*`.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Nothing is wrong — broader results just give you more context to work with.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The pattern is too broad and returns every test file in the monorepo; scope it to `src/components/Button/**/*.test.tsx` instead.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "`**/*.test.*` matches every test file in the entire monorepo, pulling in hundreds of unrelated files for a task scoped to one component. Anchoring the pattern to `src/components/Button/` returns only what's relevant. `Glob` does support `**` for nested directories and does match by file name, so A and B are factually wrong, and unrelated matches aren't 'more context' — they're noise.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-09",
    "scenario": "developer-productivity",
    "situation": "While cleaning up build artifacts, a skill proposes running `Bash` with `rm -rf ./dist/*`, where the target path is built from a user-supplied variable.",
    "question": "What should happen before this command executes?",
    "options": [
      {
        "letter": "A",
        "text": "The command and its resolved target path should be validated before running, since a destructive, wildcard-expanding command built from a variable path could delete the wrong directory.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Run it immediately — deleting a `dist` folder is a routine, safe operation.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Replace `Bash` with `Edit` to remove the files instead, since `Edit` is safer by design.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Skip validation, but log the command to a file afterward for an audit trail.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Running `Bash` without validating safety is exactly the anti-pattern to avoid, especially for a destructive, wildcard command whose target path is dynamically constructed — if the variable resolves unexpectedly, it could delete far more than intended. Assuming it's routine, swapping in a tool not designed for directory deletion, or logging only after the fact don't prevent the damage.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-10",
    "scenario": "developer-productivity",
    "situation": "You're asked to summarize the architecture of an unfamiliar 400-file service before proposing a refactor.",
    "question": "Which approach best balances thoroughness with context budget?",
    "options": [
      {
        "letter": "A",
        "text": "Read every file in the repository sequentially to guarantee nothing is missed.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Ask the user to provide an architecture diagram instead of exploring the codebase.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Glob for high-signal entry points (e.g. `**/index.ts`, `**/main.ts`, config files) and Read only those first, then Grep for key patterns to decide which additional files merit a closer look.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Use `Bash` to count lines of code per directory and infer the architecture from file sizes alone.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Targeted exploration — starting from high-signal entry points and using Grep results to decide what else is worth reading — builds an accurate mental model without loading the entire 400-file repository into context. Reading everything is the anti-pattern this avoids; line counts reveal size, not structure; and asking the user skips using the tools available to answer the question directly.",
    "domain": "context-reliability"
  },
  {
    "id": "developer-productivity-11",
    "scenario": "developer-productivity",
    "situation": "Your team wants a shared `/scaffold-component` skill that generates a new React component. It requires a component name argument; when developers forget to supply one, Claude asks a clarifying question mid-run, breaking the flow.",
    "question": "Which change best fixes this while keeping the skill available to the whole team?",
    "options": [
      {
        "letter": "A",
        "text": "Move the skill to `~/.claude/skills/` so only developers who remember the argument can run it.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Keep the skill in `.claude/skills/` and add `argument-hint` in its frontmatter so the expected argument is clear upfront.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Add a `required: true` field to the skill's frontmatter to block execution without arguments.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Remove the argument entirely and always generate a component named `NewComponent` that developers rename manually.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`argument-hint` in a project skill's frontmatter — kept in `.claude/skills/` so it stays shared with the team — surfaces the expected argument shape upfront, reducing missing-argument runs without moving the skill out of team scope. `required: true` isn't a supported skill frontmatter field, moving it to personal scope removes it from the team, and dropping the argument sacrifices the skill's usefulness.",
    "domain": "claude-code-config"
  },
  {
    "id": "developer-productivity-12",
    "scenario": "developer-productivity",
    "situation": "An automated review skill reports: 'Code quality issue found in the payment module.' Developers can't act on this without further digging.",
    "question": "What's wrong with this finding, and how should it be corrected?",
    "options": [
      {
        "letter": "A",
        "text": "It's too short; the fix is to add more prose explaining general best practices for payment code.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "It should be removed entirely, since vague findings provide no value and only add noise.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "It should be escalated straight to a human reviewer without further detail, since Claude found it worth reporting.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "It lacks a precise location and concrete rationale; it should instead read something like `src/payments/charge.ts:88 — missing null check on card.token before use; severity: high; suggested fix: add a guard clause`.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "The anti-pattern here is a generic finding with no location or rationale developers can act on. The fix isn't more general prose or discarding the finding — it's making it specific: a precise `file:line`, the actual issue, severity, and a concrete suggested fix. Escalating without detail just moves the same vagueness onto a human.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-13",
    "scenario": "developer-productivity",
    "situation": "An MCP tool your team built for repository search returns a response with `isError: true` and a message explaining the query syntax was invalid, rather than throwing a network exception.",
    "question": "How should this response be handled?",
    "options": [
      {
        "letter": "A",
        "text": "Recognize it as a validation error surfaced through the tool result, and adjust the query rather than blindly retrying.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Treat it identically to a network failure and retry the exact same request automatically.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Ignore the `isError` flag, since MCP tool results are always well-formed successful data by design.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Terminate the agent session immediately, since any `isError: true` response indicates an unrecoverable permission failure.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "MCP errors fall into categories like transient, validation, and permission, and this one — invalid query syntax — is a validation error, not a transport failure or a permission failure. The right response is to fix the query. Retrying the identical request ignores that the request itself was malformed, and the other options misread what `isError: true` signals.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "developer-productivity-14",
    "scenario": "developer-productivity",
    "situation": "You want a nightly script to invoke Claude Code to scan for outdated dependencies and write a report to a file, with no interactive prompts and no terminal session attached.",
    "question": "Which invocation is correct for this automated context?",
    "options": [
      {
        "letter": "A",
        "text": "`claude 'scan for outdated dependencies'` run as-is inside a cron job.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "`claude -p 'scan for outdated dependencies' > report.txt`, using the print flag for non-interactive output.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "`claude --resume nightly-scan 'scan for outdated dependencies'` to reuse a saved session.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "`claude --output-format json 'scan for outdated dependencies'` with no other flags.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`-p`/`--print` is the documented flag for running Claude Code non-interactively: it processes the prompt and exits without waiting for input, which is required in a cron job with no attached terminal. Running the bare command hangs waiting for interactive input; `--resume` continues a session but doesn't make a run headless; and `--output-format json` alone doesn't suppress interactive mode either.",
    "domain": "claude-code-config"
  },
  {
    "id": "developer-productivity-15",
    "scenario": "developer-productivity",
    "situation": "Early in a long refactor session, you Grep for all call sites of `calculateShipping` and get 12 results. Over the next hour, you edit many files, including adding two new call sites of `calculateShipping` while fixing related bugs. Now you're ready to do a final pass to confirm every call site uses the new function signature.",
    "question": "What should you do before finalizing the change?",
    "options": [
      {
        "letter": "A",
        "text": "Rely on the original 12 results from earlier in the session, since Grep results don't change unless you search again.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Use Glob to find files modified in the last hour, and assume any file not in that list has no new call sites.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Re-run Grep for `calculateShipping` now, since the original 12 results may be stale after the edits made since then.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Ask the user to confirm whether any new call sites were added during the session.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "The original Grep results reflect the codebase as it was an hour ago; two new call sites have been added since. Re-running Grep gets a current, accurate list before finalizing — relying on the stale list misses the new sites, and modified-file heuristics or asking the user are indirect substitutes for just checking directly.",
    "domain": "context-reliability"
  },
  // Question 16 is an original addition covering parallel sessions via git worktrees.
  {
    "id": "developer-productivity-16",
    "scenario": "developer-productivity",
    "situation": "You want Claude Code to build a new feature while a second session simultaneously fixes an unrelated production bug in the same repository. Both tasks involve editing files, running tests, and committing. How should the parallel work be set up?",
    "question": "How should the parallel work be set up?",
    "options": [
      {
        "letter": "A",
        "text": "Run both sessions in the same working directory on separate branches, letting git keep their changes apart.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Copy the repository folder for the second session and manually copy its changed files back when finished.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Run the bug fix first and the feature afterward in a single session, so nothing can conflict.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Create a separate git worktree — its own directory checked out to its own branch — for each session, and run them independently.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Separate worktrees give each session an isolated working directory and branch backed by the same repository: edits, test runs, and commits proceed in parallel without collisions, and the branches merge normally afterward. Two sessions in one directory fight over a single working tree — branches don't isolate uncommitted edits, and a checkout by one session switches files under the other. Sequential work gives up the parallelism, and a manual folder copy loses git tracking and invites error-prone hand-merging.",
    "domain": "claude-code-config"
  }
];
