import type { Question } from "@/domain/types";

export const ci: Question[] = [
  {
    "id": "ci-01",
    "scenario": "ci",
    "situation": "Your CI pipeline runs the Claude Code CLI (in `--print` mode) using CLAUDE.md to provide project context for code review, and developers generally find the reviews substantive. However, they report that integrating findings into the workflow is difficult—Claude outputs narrative paragraphs that must be manually copied into PR comments. The team wants to automatically post each finding as a separate inline PR comment at the relevant place in code, which requires structured data with file path, line number, severity level, and suggested fix. Which approach is most effective?",
    "question": "Which approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Add an “Output Format for Review” section to CLAUDE.md with examples of structured findings so Claude learns the expected format from project context.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Use the CLI flags `--output-format json` and `--json-schema` to enforce structured findings, then parse the output to post inline comments via the GitHub API.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Include explicit formatting instructions in the review prompt requiring each finding to follow a parseable template like `[FILE:path] [LINE:n] [SEVERITY:level] ...`.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep narrative review format but add a summarization step that uses Claude to generate a structured JSON summary of findings.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Using `--output-format json` with `--json-schema` enforces structured output at the CLI level, guaranteeing well-formed JSON with the required fields (file path, line number, severity, suggested fix) that can be reliably parsed and posted as inline PR comments via the GitHub API. It leverages built-in CLI capabilities designed specifically for structured output.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-02",
    "scenario": "ci",
    "situation": "Your team uses Claude Code for generating code suggestions, but you notice a pattern: non-obvious issues—performance optimizations that break edge cases, cleanups that unexpectedly change behavior—are only caught when another team member reviews the PR. Claude’s reasoning during generation shows it considered these cases but concluded its approach was correct. Which approach directly addresses the root cause of this self-check limitation?",
    "question": "Which approach directly addresses the root cause?",
    "options": [
      {
        "letter": "A",
        "text": "Run a second independent instance of Claude Code to review the changes without access to the generator’s reasoning.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Enable extended thinking mode for the generation stage to allow more thorough deliberation before producing suggestions.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add explicit self-review instructions to the generation prompt asking Claude to critique its own suggestions before finalizing output.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Include full test files and documentation in prompt context so Claude better understands expected behavior during generation.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "A second independent Claude Code instance without access to the generator’s reasoning directly addresses the root cause by avoiding confirmation bias. This “fresh eyes” perspective mirrors human peer review, where another reviewer catches issues the author rationalized.",
    "domain": "agent-architecture"
  },
  {
    "id": "ci-03",
    "scenario": "ci",
    "situation": "Your code review component is iterative: Claude analyzes the changed file, then may request related files (imports, base classes, tests) via tool calls to understand context before providing final feedback. Your application defines a tool that lets Claude request file contents; Claude calls the tool, gets results, and continues analysis. You’re evaluating batch processing to reduce API cost. What is the primary technical limitation when considering batch processing for this workflow?",
    "question": "What is the primary technical limitation?",
    "options": [
      {
        "letter": "A",
        "text": "Batch processing does not include correlation IDs to map outputs back to input requests.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "The asynchronous model cannot execute tools mid-request and return results for Claude to continue analysis.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "The Batch API does not support tool definitions in request parameters.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The batch processing latency of up to 24 hours is too slow for pull request feedback, although the workflow would otherwise function.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "A “fire-and-forget” asynchronous Batch API model has no mechanism to intercept a tool call during a request, execute the tool, and return results for Claude to continue analysis. This is fundamentally incompatible with iterative tool-calling workflows that require multiple tool request/response rounds within a single logical interaction.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-04",
    "scenario": "ci",
    "situation": "Your CI/CD system runs three Claude-based analyses: (1) fast style checks on every PR that block merging until completion, (2) comprehensive weekly security audits of the entire codebase, and (3) nightly test-case generation for recently changed modules. The Message Batches API offers 50% savings but processing can take up to 24 hours. You want to optimize API cost while maintaining an acceptable developer experience. Which combination correctly matches each task to an API approach?",
    "question": "Which combination is correct?",
    "options": [
      {
        "letter": "A",
        "text": "Use the Message Batches API for all three tasks to maximize 50% savings, configuring the pipeline to poll for batch completion.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Use synchronous calls for PR style checks; use the Message Batches API for weekly security audits and nightly test generation.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Use synchronous calls for all three tasks for consistent response times, relying on prompt caching to reduce costs across workloads.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Use synchronous calls for PR style checks and nightly test generation; use the Message Batches API only for weekly security audits.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "PR style checks block developers and require immediate responses via synchronous calls, while weekly security audits and nightly test generation are scheduled tasks with flexible deadlines that can tolerate up to a 24-hour batch window—capturing 50% savings for both.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-05",
    "scenario": "ci",
    "situation": "Your automated reviews find real issues, but developers report the feedback is not actionable. Findings include phrases like “complex ticket routing logic” or “potential null pointer” without specifying what exactly to change. When you add detailed instructions like “always include concrete fix suggestions,” the model still produces inconsistent output—sometimes detailed, sometimes vague. Which prompting technique most reliably produces consistently actionable feedback?",
    "question": "Which prompting technique is most reliable?",
    "options": [
      {
        "letter": "A",
        "text": "Further refine instructions with more explicit requirements for each part of the feedback format (location, issue, severity, proposed fix).",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Expand the context window to include more surrounding codebase so the model has enough information to propose concrete fixes.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Implement a two-pass approach where one prompt identifies issues and a second generates fixes, allowing specialization.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add 3–4 few-shot examples showing the exact required format: identified issue, location in code, concrete fix suggestion.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Few-shot examples are the most effective technique for achieving consistent output format when instructions alone produce variable results. Providing 3–4 examples that show the exact desired structure (issue, location, concrete fix) gives the model a concrete pattern to follow, which is more reliable than abstract instructions.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-06",
    "scenario": "ci",
    "situation": "Your CI pipeline includes two Claude-based code review modes: a pre-merge-commit hook that blocks PR merge until completion, and a “deep analysis” that runs overnight, polls for batch completion, and posts detailed suggestions to the PR. You want to reduce API cost using the Message Batches API, which offers 50% savings but requires polling and can take up to 24 hours. Which mode should use batch processing?",
    "question": "Which mode should use batch processing?",
    "options": [
      {
        "letter": "A",
        "text": "Only the pre-merge-commit hook.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Only the deep analysis.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Both modes.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Neither mode.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Deep analysis is an ideal candidate for batch processing because it already runs overnight, tolerates delay, and uses a polling model before publishing results—matching the asynchronous, polling-based architecture of the Message Batches API while capturing 50% savings.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-07",
    "scenario": "ci",
    "situation": "Your automated review analyzes comments and docstrings. The current prompt instructs Claude to “check that comments are accurate and up to date.” Findings often flag acceptable patterns (TODO markers, simple descriptions) while missing comments describing behavior the code no longer implements. What change addresses the root cause of this inconsistent analysis?",
    "question": "What change addresses the root cause?",
    "options": [
      {
        "letter": "A",
        "text": "Include `git blame` data so Claude can identify comments that predate recent code changes.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add few-shot examples of misleading comments to help the model recognize similar patterns in the codebase.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Filter TODO, FIXME, and descriptive comment patterns before analysis to reduce noise.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Specify explicit criteria: flag comments only when the behavior they claim contradicts the code’s actual behavior.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Explicit criteria—flagging comments only when claimed behavior contradicts actual code behavior—directly addresses the root cause by replacing a vague instruction with a precise definition of what constitutes a problem. This reduces false positives on acceptable patterns and misses of truly misleading comments.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-08",
    "scenario": "ci",
    "situation": "Your automated code review system shows inconsistent severity ratings—similar issues like null pointer risks are rated “critical” in some PRs but only “medium” in others. Developer surveys show growing distrust—many start dismissing findings without reading because “half are wrong.” High-false-positive categories erode trust in accurate categories. Which approach best restores developer trust while improving the system?",
    "question": "Which approach best restores developer trust?",
    "options": [
      {
        "letter": "A",
        "text": "Temporarily disable high-false-positive categories (style, naming, documentation) and keep only high-precision categories while improving prompts.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Keep all categories enabled but display confidence scores with each finding so developers can decide what to investigate.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Keep all categories enabled and add few-shot examples to improve accuracy for each category over the next few weeks.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Apply a uniform strictness reduction across all categories to bring the overall false-positive rate down.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Temporarily disabling high-false-positive categories immediately stops trust erosion by removing noisy findings that cause developers to dismiss everything, while preserving value from high-precision categories like security and correctness. It also creates space to improve prompts for problematic categories before re-enabling them.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-09",
    "scenario": "ci",
    "situation": "Your automated review generates test-case suggestions for each PR. Reviewing a PR that adds course completion tracking, Claude suggests 10 test cases, but developer feedback shows that 6 duplicate scenarios already covered by the existing test suite. What change most effectively reduces duplicate suggestions?",
    "question": "What change is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Include the existing test file in context so Claude can determine what scenarios are already covered.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Reduce the requested number of suggestions from 10 to 5, assuming Claude prioritizes the most valuable cases first.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add instructions directing Claude to focus exclusively on edge cases and error conditions rather than success paths.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Implement post-processing that filters suggestions whose descriptions match existing test names via keyword overlap.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Including the existing test file fixes the root cause of duplication: Claude can only avoid suggesting already-covered scenarios if it knows what tests already exist. This gives Claude the information needed to propose genuinely new, valuable tests.",
    "domain": "context-reliability"
  },
  {
    "id": "ci-10",
    "scenario": "ci",
    "situation": "After an initial automated review identifies 12 findings, a developer pushes new commits to address issues. Re-running review produces 8 findings, but developers report that 5 duplicate previous comments on code that was already fixed in the new commits. What is the most effective way to eliminate this redundant feedback while maintaining thoroughness?",
    "question": "What is the most effective way to eliminate redundant feedback?",
    "options": [
      {
        "letter": "A",
        "text": "Run review only when the PR is created and in the final pre-merge state, skipping intermediate commits.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add a post-processing filter that removes findings that match previous ones by file paths and issue descriptions before posting comments.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Restrict review scope to files changed in the most recent push, excluding files from earlier commits.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Include previous review findings in context and instruct Claude to report only new or still-unresolved issues.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Including prior review findings in context lets Claude distinguish new problems from those already addressed in recent commits. This preserves review thoroughness while using Claude’s reasoning to avoid redundant feedback on fixed code.",
    "domain": "context-reliability"
  },
  {
    "id": "ci-11",
    "scenario": "ci",
    "situation": "Your pipeline script runs `claude \"Analyze this pull request for security issues\"`, but the job hangs indefinitely. Logs show Claude Code is waiting for interactive input. What is the correct approach to run Claude Code in an automated pipeline?",
    "question": "What is the correct approach?",
    "options": [
      {
        "letter": "A",
        "text": "Add a `--batch` flag: `claude --batch \"Analyze this pull request for security issues\"`.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add the `-p` flag: `claude -p \"Analyze this pull request for security issues\"`.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Redirect stdin from `/dev/null`: `claude \"Analyze this pull request for security issues\" < /dev/null`.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Set the environment variable `CLAUDE_HEADLESS=true` before running the command.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "The `-p` (or `--print`) flag is the documented way to run Claude Code non-interactively. It processes the prompt, prints the result to stdout, and exits without waiting for user input—ideal for CI/CD pipelines.",
    "domain": "claude-code-config"
  },
  {
    "id": "ci-12",
    "scenario": "ci",
    "situation": "A pull request changes 14 files in an inventory tracking module. A single-pass review that analyzes all files together produces inconsistent results: detailed feedback on some files but shallow comments on others, missed obvious bugs, and contradictory feedback (a pattern is flagged in one file but identical code is approved in another file in the same PR). How should you restructure the review?",
    "question": "How should you restructure the review?",
    "options": [
      {
        "letter": "A",
        "text": "Run three independent full-PR review passes and flag only issues that appear in at least two of the three runs.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Split into focused passes: review each file individually for local issues, then run a separate integration-oriented pass to examine cross-file data flows.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Require developers to split large PRs into smaller submissions of 3–4 files before running automated review.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Switch to a larger model with a bigger context window so it can pay sufficient attention to all 14 files in one pass.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Focused per-file passes address the root cause—attention dilution—by ensuring consistent depth and reliable local issue detection. A separate integration-oriented pass then covers cross-file concerns such as dependency and data-flow interactions.",
    "domain": "agent-architecture"
  },
  {
    "id": "ci-13",
    "scenario": "ci",
    "situation": "Your automated code review averages 15 findings per pull request, and developers report a 40% false-positive rate. The bottleneck is investigation time: developers must click into each finding to read Claude’s rationale before deciding whether to fix or dismiss it. Your CLAUDE.md already contains comprehensive rules for acceptable patterns, and stakeholders rejected any approach that filters findings before developers see them. What change best addresses investigation time?",
    "question": "What change best addresses investigation time?",
    "options": [
      {
        "letter": "A",
        "text": "Require Claude to include its rationale and confidence estimate directly in each finding.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Add a post-processor that analyzes finding patterns and automatically suppresses those that match historical false-positive signatures.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Categorize findings as “blocking issues” vs “suggestions,” with different review requirements by level.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Configure Claude to show only high-confidence findings, filtering uncertain flags before developers see them.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Including rationale and confidence directly in each finding reduces investigation time by letting developers quickly triage without opening each finding. It satisfies the “no filtering” constraint because all findings remain visible while accelerating developer decision-making.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-14",
    "scenario": "ci",
    "situation": "Analysis of your automated code review shows large differences in false-positive rates by finding category: security/correctness findings have 8% false positives, performance findings 18%, style/naming findings 52%, and documentation findings 48%. Developer surveys show growing distrust—many start dismissing findings without reading because “half are wrong.” High-false-positive categories erode trust in accurate categories. Which approach best restores developer trust while improving the system?",
    "question": "Which approach best restores developer trust?",
    "options": [
      {
        "letter": "A",
        "text": "Temporarily disable high-false-positive categories (style, naming, documentation) and keep only high-precision categories while improving prompts.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Keep all categories enabled but display confidence scores with each finding so developers can decide what to investigate.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Keep all categories enabled and add few-shot examples to improve accuracy for each category over the next few weeks.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Apply a uniform strictness reduction across all categories to bring the overall false-positive rate down.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Temporarily disabling high-false-positive categories immediately stops trust erosion by removing noisy findings that cause developers to dismiss everything, while preserving value from high-precision categories like security and correctness. It also creates space to improve prompts for problematic categories before re-enabling them.",
    "domain": "prompt-engineering"
  },
  {
    "id": "ci-15",
    "scenario": "ci",
    "situation": "Your team wants to reduce API costs for automated analysis. Currently, synchronous Claude calls support two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes moving both to the Message Batches API to save 50%. How should you evaluate this proposal?",
    "question": "How should you evaluate this proposal?",
    "options": [
      {
        "letter": "A",
        "text": "Move both to batch processing with fallback to synchronous calls if batches take too long.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Move both workflows to batch processing with status polling to verify completion.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Use batch processing only for technical debt reports; keep synchronous calls for pre-merge checks.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Keep synchronous calls for both workflows to avoid issues with batch result ordering.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Message Batches API processing can take up to 24 hours with no latency SLA, which is acceptable for overnight technical debt reports but unacceptable for blocking pre-merge checks where developers wait. This matches each workflow to the right API based on latency requirements.",
    "domain": "prompt-engineering"
  }
];
