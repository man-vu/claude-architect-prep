Claude Code is configured through a layered set of files and directories rather than a single settings blob. Knowing *which layer* a piece of configuration belongs in — user vs. project vs. directory, always-loaded vs. on-demand — is the core skill this domain tests, since most exam scenarios are diagnostic: "a teammate isn't getting X, where was it misconfigured?"

## CLAUDE.md hierarchy

Claude Code loads project context from `CLAUDE.md` files at three distinct levels. Each level answers a different question: *who* should see this, and *when*.

| Level | Location | Scope | Version-controlled? |
|---|---|---|---|
| User | `~/.claude/CLAUDE.md` | Only that user, across all their projects | No — personal, never shared via VCS |
| Project | `.claude/CLAUDE.md` or root `CLAUDE.md` | All contributors to the repo | Yes — committed, team-wide |
| Directory | `CLAUDE.md` inside a subdirectory | Only loads when Claude Code edits files in that directory | Yes (lives in the repo) |

The distinction that matters most for the exam: **user-level config is invisible to new teammates.** If you put team coding standards in `~/.claude/CLAUDE.md`, they live only on your machine — a new developer who clones the repo and runs Claude Code gets none of it, because that file was never in the repo to begin with.

> **Classic diagnostic scenario:** A new team member's Claude Code sessions don't follow the team's API conventions, even though "everyone already has this working." Root cause: the conventions were written into the tech lead's `~/.claude/CLAUDE.md` instead of the project's `.claude/CLAUDE.md`. Fix: move the content into a project-level (version-controlled) file so it ships with the repo.

Directory-level `CLAUDE.md` is narrower still — it only activates when Claude Code is actively working with files *in that directory*, which makes it useful for package-specific or module-specific conventions in a monorepo without bloating the root file.

```
repo/
├── CLAUDE.md                 # project-wide, all contributors
├── packages/
│   ├── api/
│   │   └── CLAUDE.md         # loads only when editing files under packages/api/
│   └── web/
│       └── CLAUDE.md         # loads only when editing files under packages/web/
```

## @path imports

Rather than writing one giant `CLAUDE.md`, you can split content into focused files and pull them in with `@path` references:

```markdown
Coding standards are described in @./standards/coding-style.md
Refer to @README.md for project overview.
```

Rules:
- No space between `@` and the path.
- Both relative (`@./standards/x.md`) and absolute paths are supported.
- Imports can nest, but only up to **5 levels deep** — an import inside an imported file inside an imported file, etc., capped at 5.

This avoids duplication: a large monorepo can keep one canonical `coding-style.md` and reference it from every package's `CLAUDE.md`, so each package pulls in only the standards relevant to it instead of a single monolithic file everyone has to scroll through.

## `.claude/rules/` — path-scoped conditional loading

`CLAUDE.md` (at any level) is always loaded once its directory is in scope. `.claude/rules/` offers a different axis: rules that load based on **which file is being edited**, not which directory you're in.

```
.claude/rules/
├── testing.md
└── api-conventions.md
```

Each rule file carries YAML frontmatter with a `paths` glob:

```markdown
---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---

# Testing conventions

- Use `describe`/`it`, not `test()`.
- Mock network calls with MSW, never real fetch.
```

The rule loads **only** when Claude Code touches a file matching that glob — regardless of which directory the file lives in. This is the key contrast with directory-level `CLAUDE.md`:

| Mechanism | Trigger | Best for |
|---|---|---|
| Directory-level `CLAUDE.md` | Editing any file in a specific directory | Conventions tied to one place (e.g. `packages/api/`) |
| `.claude/rules/*.md` with `paths` | Editing any file matching a glob, anywhere in the repo | Conventions tied to a file *type*, scattered across the repo (e.g. all `*.test.tsx`, all API route handlers) |

Because irrelevant rules simply never load, this also **saves context tokens** — a rule about test conventions doesn't get pulled into context while you're editing a config file.

## Custom commands

Custom slash commands live in Markdown files and can be scoped the same way as CLAUDE.md:

| Location | Scope | Version-controlled? |
|---|---|---|
| `.claude/commands/` | Whole team, available the moment someone clones the repo | Yes |
| `~/.claude/commands/` | Just you, across all projects | No |

```
.claude/commands/
└── review.md      # becomes the team-wide /review command
```

If the exam asks "where do you put a `/review` command so the whole team gets it on clone" — the answer is `.claude/commands/` in the repo, not the user directory, for the same version-control reasoning as CLAUDE.md.

## Skills

Skills package a reusable capability (a whole workflow, not just a prompt snippet) under `.claude/skills/<name>/SKILL.md`, with YAML frontmatter controlling how it runs:

```markdown
---
name: review
description: Reviews the current diff for correctness bugs and simplification opportunities.
context: fork
allowed-tools: ["Read", "Grep", "Glob", "Bash(git diff:*)"]
argument-hint: "[effort level: low|medium|high]"
---

# Review

1. Run `git diff` against the base branch.
2. ...
```

Key frontmatter fields:

- **`context: fork`** — runs the skill in an isolated subagent. Its verbose tool output (search noise, intermediate reads) never pollutes the main session's context window; only the final result comes back.
- **`allowed-tools`** — least-privilege tool restriction. A code-review skill that only needs `Read`/`Grep`/`Glob` shouldn't also be able to `Write` or `rm`; declaring `allowed-tools` enforces that even if the skill's instructions never mention writing.
- **`argument-hint`** — shown to the user when the skill is invoked without arguments, prompting them for what to supply (e.g. `[effort level: low|medium|high]`).

**Skills vs. CLAUDE.md** is a frequently tested distinction:

- **CLAUDE.md** — always-loaded, passive, general standards ("we use 2-space indent," "tests go in `__tests__/`").
- **Skill** — on-demand, active, invoked for a specific task (`/review`, `/analyze`, `/deploy`). It's a procedure, not a fact.

Like commands, skills have personal variants: `~/.claude/skills/<name>/SKILL.md` for a skill you use across your own projects but haven't (or shouldn't) commit to the team repo.

## Planning mode vs. direct execution

Claude Code can operate in two modes, and picking the right one for the situation is itself an exam-tested judgment call.

**Planning mode** is read-only exploration: the model uses `Read`/`Grep`/`Glob` (and similar) to investigate the codebase, then produces a plan for the user to approve — **zero side effects** until that approval happens. Use it when:

- The change spans dozens of files.
- Multiple plausible implementation approaches exist and the choice matters.
- You're migrating a library or making an architectural decision.
- The codebase is unfamiliar and a wrong first move is costly.

**Direct execution** skips straight to implementation. Use it when:

- The fix is confined to a single file.
- There's a clear stack trace pointing at the bug.
- The change is well-understood and unambiguous — there's really only one reasonable way to do it.

The two compose into a standard workflow:

```
Planning mode (investigate + design)
        ↓
User reviews and approves the plan
        ↓
Direct execution (implement exactly what was approved)
```

A related pattern: dispatching an **Explore subagent** to do the read-heavy discovery work (searching for symbols, mapping a directory tree, finding call sites) isolates that verbose back-and-forth from the main session's context — the main session receives a distilled answer instead of every intermediate grep result, the same benefit `context: fork` gives skills.

## CLI for CI/CD

Running Claude Code inside a pipeline requires different flags than interactive use.

```bash
# Non-interactive: print the result and exit — never waits for a TTY.
# This is the ONLY correct way to invoke Claude Code from CI.
claude -p "Summarize the failing tests in this PR" 

# Structured output for machine parsing (e.g. posting inline PR comments)
claude -p "Review this diff for bugs" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"issues":{"type":"array"}}}'
```

- **`-p` / `--print`** — non-interactive mode. Processes the prompt, writes the result to stdout, and exits. Any other mode expects a TTY and will hang in CI, which is why this is the only correct flag for pipeline use.
- **`--output-format json`** paired with **`--json-schema '{...}'`** — forces structured, schema-validated output instead of free-form prose, so a CI script can parse it directly (e.g. to auto-post inline PR review comments per finding).
- **`--resume <session-name>`** — continues a previously saved session with its accumulated context, useful for long investigations spread across multiple invocations. **Risk:** if files changed since the session was saved, the session's cached tool results (file contents, grep hits) go stale — the resumed session doesn't automatically re-read anything it already "saw."

### Review session hygiene

A best practice worth internalizing: **review code in an independent session from the one that wrote it.** The session that generated a diff is biased toward its own decisions — it's poorly positioned to catch its own mistakes. Spin up a fresh session (fresh context, no `--resume`) specifically to review.

When re-reviewing after fixes are pushed, feed the new session the prior findings explicitly and ask it to report only **new or still-unresolved** issues — otherwise every re-review re-lists the same already-fixed problems, drowning out what actually changed.

```bash
# First pass — independent reviewer, structured output for tooling
claude -p "Review this PR diff" --output-format json --json-schema "$SCHEMA"

# Second pass — pass prior findings in, ask for delta only
claude -p "Here are the prior review findings: $PRIOR_JSON.
Re-review the current diff. Report ONLY new or unresolved issues."
```

## Quick reference: all mechanisms at a glance

| Mechanism | Personal variant | Team variant | Loads when... |
|---|---|---|---|
| CLAUDE.md | `~/.claude/CLAUDE.md` | `.claude/CLAUDE.md` or root `CLAUDE.md` | Always (project/user), or when in that directory (directory-level) |
| Rules | — | `.claude/rules/*.md` | The edited file matches the rule's `paths` glob |
| Commands | `~/.claude/commands/` | `.claude/commands/` | Explicitly invoked (`/command-name`) |
| Skills | `~/.claude/skills/<name>/` | `.claude/skills/<name>/` | Explicitly invoked, optionally forked into a subagent |

The common thread: anything under `~/.claude/` is yours alone and invisible to collaborators; anything under the project's `.claude/` (or a repo-root `CLAUDE.md`) ships with `git clone` and is what the whole team sees.

## Exam focus

- **Placement diagnostics are the recurring question type**: given a symptom ("new hire missing standards," "command not available to the team," "rule loading everywhere instead of just tests"), identify which config layer was used incorrectly. Know the four placement axes cold: user (`~/.claude/`) vs. project (`.claude/`) vs. directory-level `CLAUDE.md` vs. path-scoped `.claude/rules/`.
- **`.claude/rules/` vs. directory-level `CLAUDE.md`**: both scope content, but on different dimensions — file pattern (`paths` glob, anywhere in the repo) vs. physical directory. A rule for "all test files" is `.claude/rules/` with a glob; a rule for "everything under `packages/api/`" is a directory-level `CLAUDE.md`.
- **Skill frontmatter fields and what each buys you**: `context: fork` (context isolation), `allowed-tools` (least privilege), `argument-hint` (UX for missing args). Know that Skills are on-demand procedures, CLAUDE.md is always-loaded standards.
- **`-p`/`--print` is the only correct CI mode** — memorize this framing; expect a question phrased as "why does the pipeline hang" with the answer being a missing `-p` flag.
- **`--resume` staleness risk**: a resumed session's tool-call results don't refresh automatically if underlying files changed — don't assume a resumed session has current information.
- **Independent review sessions**: reviewing in the same session that wrote the code is a named anti-pattern; expect a question testing whether you'd reuse the generating session (wrong) or start fresh (right), plus the delta-reporting technique for re-reviews.
