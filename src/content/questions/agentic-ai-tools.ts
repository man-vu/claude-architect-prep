import type { Question } from "@/domain/types";

// NOTE: this scenario is under-documented in the source guide; questions lean on agentic-loop
// fundamentals (Ch.3) + platform reference (stop_reason, tool_choice, MCP isError categories,
// Agent SDK hub-and-spoke orchestration, Claude Code hooks/skills).
export const agenticAiTools: Question[] = [
  {
    "id": "agentic-ai-tools-01",
    "scenario": "agentic-ai-tools",
    "situation": "An agentic coding assistant runs a tool-use loop with `read_file`, `edit_file`, and `run_tests`. The loop calls tools whenever the model's response has `stop_reason: \"tool_use\"`, executes them, feeds back `tool_result` blocks, and repeats. On a difficult refactor, the model oscillates between editing and re-running tests for over 200 iterations with no natural stopping point, until an engineer manually kills the process. Which change most directly fixes the underlying design flaw?",
    "question": "Which change most directly fixes the underlying design flaw?",
    "options": [
      {
        "letter": "A",
        "text": "Give the model a larger context window so it can remember which edits it already tried and avoid repeating them.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add an explicit completion criterion (e.g., a defined \"tests pass\" signal alongside `stop_reason: \"end_turn\"`) and a hard maximum-iteration guard that ends the loop with a reported failure once reached.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Switch `tool_choice` from `{type: \"auto\"}` to `{type: \"any\"}` so the model is forced to keep calling tools and never stalls.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add a system-prompt instruction telling the model to \"try to wrap up within about 10 steps.\"",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "The agentic loop needs an explicit, checkable completion criterion plus a hard iteration cap as a backstop; without both, a loop with no natural stopping condition can run indefinitely. (D) relies on the model voluntarily honoring a soft instruction, which is not a deterministic safeguard. (C) forces more tool calls, which does not bound the loop and may make the oscillation worse. (A) doesn't address the missing stop condition or bound at all.",
    "domain": "agent-architecture"
  },
  {
    "id": "agentic-ai-tools-02",
    "scenario": "agentic-ai-tools",
    "situation": "An `update_inventory` MCP tool can fail for three different reasons: a transient database timeout (a quick retry usually succeeds), an invalid SKU that doesn't exist (retrying is pointless without different input), and a caller lacking write permission (retrying is pointless under any input). Today the tool returns the same plain-text message, \"Operation failed,\" for all three, so the calling agent applies the same generic retry logic every time -- including retrying permission failures it can never fix by itself. What is the most effective fix?",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Have the tool return a structured error response (`isError: true`) with a distinct category -- transient, validation, or permission -- for each failure mode, so the model can choose retry, input correction, or escalation accordingly.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Reduce the number of retries the agent is allowed to attempt for any tool failure.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the tool always return `success: false` with the same generic message, and log the real cause only in server-side logs for engineers to review later.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add a fixed exponential-backoff retry inside the tool for every failure type before it ever reports back to the agent.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Structured, categorized errors (isError plus transient/validation/permission) let the calling model recover intelligently -- retrying transient failures, correcting input for validation failures, and escalating permission failures instead of retrying them. (D) is tempting since backoff helps transient failures, but it wastes time retrying validation and permission failures that will never succeed. (B) and (C) don't give the model the information it needs to differentiate the failure modes at all.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "agentic-ai-tools-03",
    "scenario": "agentic-ai-tools",
    "situation": "A writing assistant has two tools: `create_document`, described as \"Creates a new document,\" and `append_to_document`, described as \"Adds content to a document.\" When a user asks to \"add a paragraph to my quarterly report,\" the model sometimes calls `create_document` instead, overwriting the user's existing report. What is the most effective fix?",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Rewrite both descriptions to be explicit and disambiguating: `create_document` for starting a brand-new, empty document, and `append_to_document` for adding content to an existing document identified by ID or path -- since tool descriptions are the model's primary basis for choosing between tools.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Rename `create_document` to `create_document_v2` so the two tools are easier to tell apart.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a few-shot example to the system prompt showing an \"add a paragraph\" request being routed to `append_to_document`.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Insert a pre-routing keyword classifier that checks for words like \"add\" or \"append\" before the model is given any tools to choose from.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Tool descriptions are the primary mechanism the model uses to select between tools, so removing the ambiguity there fixes the root cause directly. (C) can help but treats the symptom with prompt patching rather than fixing the ambiguous descriptions themselves. (B) changes only the name, leaving the vague, overlapping descriptions intact. (D) adds an entire extra routing layer to work around a problem that clear tool descriptions would have prevented.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "agentic-ai-tools-04",
    "scenario": "agentic-ai-tools",
    "situation": "A financial-analysis agent normally decides for itself whether to call `get_stock_price` or answer from memory. However, in a compliance-mandated \"verified-quote\" mode, every response must include a value fetched live from `get_stock_price` rather than a number recalled from training data. The agent also has other unrelated tools available, such as `get_company_filing`. Which `tool_choice` configuration correctly supports both modes?",
    "question": "Which `tool_choice` configuration correctly supports both modes?",
    "options": [
      {
        "letter": "A",
        "text": "Default mode: `{type: \"auto\"}`. Verified-quote mode: `{type: \"any\"}`, since forcing some tool call guarantees fresh data.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Default mode: `{type: \"auto\"}`. Verified-quote mode: `{type: \"tool\", name: \"get_stock_price\"}`, which forces exactly that tool so a live lookup always occurs.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Default mode: `{type: \"tool\", name: \"get_stock_price\"}`. Verified-quote mode: `{type: \"auto\"}`.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Use `{type: \"auto\"}` in both modes, and add a prompt instruction requiring a tool call whenever verified-quote mode is active.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`{type: \"tool\", name}` forces the model to use that specific tool, which is the only setting that guarantees a live price lookup happens. (A) is tempting because `{type: \"any\"}` does force some tool call, but with `get_company_filing` also available, it does not guarantee the specific `get_stock_price` call compliance requires. (C) reverses the two modes. (D) relies on the model reliably following a prompt instruction rather than a deterministic parameter.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "agentic-ai-tools-05",
    "scenario": "agentic-ai-tools",
    "situation": "A research coordinator delegates to three subagents -- market-data, news-sentiment, and regulatory-filings -- and merges their findings into one report. Currently it just concatenates each subagent's raw text output, with no indication of which subagent, source, or date produced a given claim. A reviewer cannot tell whether a specific growth figure came from a verified regulatory filing or an unverified news article. What should the coordinator do differently when aggregating?",
    "question": "What should the coordinator do differently when aggregating?",
    "options": [
      {
        "letter": "A",
        "text": "Aggregate the findings while explicitly preserving provenance for each claim -- source, subagent, and retrieval date -- so reviewers can trace and weigh each claim's reliability.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Deduplicate any numbers that appear in more than one subagent's output and keep only the first occurrence.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Require all three subagents to write in the exact same prose style before merging so the final report reads as one voice.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Let the coordinator silently rank sources by an internal confidence heuristic and include only the highest-ranked claim for each topic.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Preserving provenance -- source, subagent, and date -- during aggregation is what lets a downstream reviewer evaluate reliability instead of trusting an undifferentiated merge. (D) is tempting because ranking sounds helpful, but doing it silently still discards the attribution a reviewer needs and hides the disagreement. (B) and (C) address deduplication and style, not the missing attribution that is actually the problem.",
    "domain": "context-reliability"
  },
  {
    "id": "agentic-ai-tools-06",
    "scenario": "agentic-ai-tools",
    "situation": "A code-review coordinator delegates full-repository analysis to a subagent that reads 40 files and produces roughly 60K tokens of intermediate reasoning before condensing its findings into a 500-word summary. The subagent currently returns both the full intermediate reasoning and the summary to the coordinator, and after a few delegated tasks the coordinator's own context window is nearly full. What is the most effective fix?",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Have the subagent return only its condensed findings to the coordinator, keeping the verbose intermediate exploration isolated within the subagent's own context.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Give the coordinator a larger context window so it can hold the full intermediate reasoning from every subagent.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the coordinator periodically clear its entire conversation history to free up space.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Switch the subagent to a smaller model so it naturally produces less intermediate reasoning.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "One of the core benefits of subagent delegation is isolating verbose exploratory work from the coordinator's context; returning only the condensed result preserves that benefit. (B) just delays the same problem at a higher cost. (C) risks discarding information the coordinator still needs, not just the excess. (D) doesn't guarantee good analysis and doesn't address that the coordinator shouldn't receive the raw reasoning in the first place.",
    "domain": "agent-architecture"
  },
  {
    "id": "agentic-ai-tools-07",
    "scenario": "agentic-ai-tools",
    "situation": "An agent performs a complex multi-file refactor: a shared interface changes, and every call site must be updated in the right order so nothing breaks mid-refactor. With a simple auto-tool-choice loop, the model tends to make one edit, discover a downstream dependency it didn't foresee, and backtrack -- costing several extra tool-call iterations. Which change most directly addresses the planning problem before tool calls begin?",
    "question": "Which change most directly addresses the planning problem?",
    "options": [
      {
        "letter": "A",
        "text": "Enable extended thinking so the model reasons through the full dependency plan before issuing its first tool call, rather than discovering dependencies only as it reacts to each tool result.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Raise the maximum-iteration guard so the model has more room to backtrack and retry.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Switch `tool_choice` to `{type: \"any\"}` so the model starts calling tools sooner.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Split the refactor across several subagents, each independently responsible for one file.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Extended thinking gives the model space for the multi-step planning and reasoning this task requires before it starts acting, which is exactly what reduces backtracking. (D) is tempting as a scaling strategy, but independent per-file subagents would make ordering the interface change across dependent call sites harder, not easier. (B) only gives more room for the same reactive backtracking to occur; it doesn't improve the plan. (C) forces earlier tool use, the opposite of what's needed when the problem is insufficient upfront planning.",
    "domain": "prompt-engineering"
  },
  {
    "id": "agentic-ai-tools-08",
    "scenario": "agentic-ai-tools",
    "situation": "An operations agent is authorized to autonomously restart services, rotate configuration values, and delete database backups older than 90 days. In production, a bug in its retention-window query caused it to delete backups that were later needed for a compliance audit. Which design principle would most effectively have limited this damage?",
    "question": "Which design principle would most effectively have limited this damage?",
    "options": [
      {
        "letter": "A",
        "text": "Require human approval before irreversible, high-risk actions like permanent data deletion, even though the agent operates autonomously for lower-risk actions.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Log every deletion the agent performs so the actions can be reviewed after the fact.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Give the agent a larger context window so it can double-check its own retention-window query before running it.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Have the agent re-run its own reasoning a second time to confirm the deletion before proceeding.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Irreversible, high-risk actions warrant a human-in-the-loop checkpoint precisely because a bug in the agent's own reasoning -- as happened here -- can't reliably be caught by the same agent checking itself. (D) is the closest distractor, but self-confirmation shares the same blind spot as the original bug and would not have caught it. (B) only helps after the damage is done. (C) doesn't guarantee the query bug is found and isn't a systematic safeguard for irreversible actions.",
    "domain": "agent-architecture"
  },
  {
    "id": "agentic-ai-tools-09",
    "scenario": "agentic-ai-tools",
    "situation": "A financial-services team instructs its coding agent, via CLAUDE.md, to never commit hardcoded API keys and never force-push to the main branch. Despite this, when a user insists strongly enough, the agent occasionally force-pushes to main anyway, because the instruction is ultimately just a prompt the model can be talked out of. What is the most effective way to enforce these two rules?",
    "question": "What is the most effective way to enforce these two rules?",
    "options": [
      {
        "letter": "A",
        "text": "Reword the CLAUDE.md rules in stronger language (e.g., all-caps \"NEVER\") and repeat them more than once.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Implement a deterministic hook that inspects and blocks the specific tool calls -- a force-push to main, or a commit containing API-key-like patterns -- before they execute, rather than relying only on prompt instructions.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Ask the agent to self-report before running any dangerous command so a human can review the chat transcript afterward.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add the same reminder to the system prompt on every single turn instead of just once in CLAUDE.md.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "For critical business rules, deterministic enforcement in code (a hook that blocks the matching tool call) cannot be argued out of, unlike prompt-only guidance. (A) and (D) are still prompt-only guidance and remain overridable, which is exactly the failure mode described. (C) only creates an after-the-fact record; it doesn't prevent the force-push from happening.",
    "domain": "claude-code-config"
  },
  {
    "id": "agentic-ai-tools-10",
    "scenario": "agentic-ai-tools",
    "situation": "A pipeline that stores agent responses currently treats every API response as \"final\" the moment it arrives, without checking `stop_reason`. This causes two bugs: responses cut off by `stop_reason: \"max_tokens\"` get stored as complete final answers, and responses with `stop_reason: \"tool_use\"` get stored as final answers before the tool-result loop has even run. What is the most effective fix?",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Increase the `max_tokens` limit high enough that truncation stops happening in practice.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Branch explicitly on `stop_reason`: continue the tool-execution loop on `tool_use`, flag the response as truncated and handle continuation on `max_tokens`, and only persist a response as final on `end_turn` (or a matching `stop_sequence`).",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Check only whether the response body contains any tool-use content blocks, and ignore `stop_reason` entirely.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Automatically re-send every request a second time regardless of `stop_reason`, to be safe.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`stop_reason` is exactly the signal that distinguishes these cases, so branching on it directly fixes both bugs at once. (A) only reduces how often truncation occurs; it doesn't fix the tool_use bug and doesn't eliminate truncation as a possibility. (C) partially helps for tool_use but still can't distinguish a truncated max_tokens response from a genuine final answer. (D) wastes calls and still doesn't tell the pipeline which responses were actually final.",
    "domain": "context-reliability"
  },
  {
    "id": "agentic-ai-tools-11",
    "scenario": "agentic-ai-tools",
    "situation": "A document-ingestion subagent occasionally hits a brief network blip when fetching a file from cloud storage. Today, any exception immediately propagates to the coordinator, which pauses the entire multi-agent workflow to decide whether to retry -- even though about 95% of these failures resolve on a second attempt within a second or two. What is the most effective fix?",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Have the subagent retry transient failures locally first, and escalate to the coordinator -- with structured error context and a note on what was already attempted -- only once a failure proves non-transient.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Have the coordinator apply one uniform retry policy to every error from every subagent, regardless of error category.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a `max_retries` setting to the coordinator so it re-invokes the entire subagent from scratch whenever any error is reported.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Have the subagent return `isError: false` with an empty result on failure, logging the true error only server-side.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Recovering locally within the subagent for transient failures -- before involving the coordinator at all -- avoids pausing the whole workflow for issues that resolve themselves almost every time. (B) still routes routine transient failures up to the coordinator instead of handling them at the lowest capable level. (C) is far more expensive than a quick local retry and unnecessarily restarts good work. (D) hides the failure from the coordinator entirely, which prevents it from ever being addressed if it isn't actually transient.",
    "domain": "context-reliability"
  },
  {
    "id": "agentic-ai-tools-12",
    "scenario": "agentic-ai-tools",
    "situation": "A team is building a coordinator agent on the Claude Agent SDK. They want the coordinator to spin up specialized subagents -- for example, a research subagent and a coding subagent -- dynamically, based on what a given user request actually needs, rather than hardcoding one fixed pipeline of subagents for every request. Which built-in mechanism should they use?",
    "question": "Which built-in mechanism should they use?",
    "options": [
      {
        "letter": "A",
        "text": "The Agent tool (formerly named Task), which lets the coordinator spawn subagents as needed for a given request.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "A hook configured to intercept and enforce policy on every tool call.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "A SKILL.md file with `context: fork` for each possible subagent.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "A separate custom MCP server exposing one tool per subagent type.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "The Agent SDK's Agent tool (formerly named Task; some legacy contexts still emit `Task`) is the mechanism for a coordinator to spawn subagents dynamically in a hub-and-spoke arrangement. (C) is tempting because it also involves forking context, but that's a Claude Code skill mechanism for isolating a skill's own execution, not how an SDK coordinator spawns subagents. (B) is for deterministic policy enforcement, not for creating subagents. (D) would work but is unnecessary infrastructure for something the SDK already provides directly.",
    "domain": "agent-architecture"
  },
  {
    "id": "agentic-ai-tools-13",
    "scenario": "agentic-ai-tools",
    "situation": "A team builds a Claude Code skill for a \"deep code audit\" that reads dozens of files and produces lengthy intermediate analysis before a short final report. They want this exploration to run isolated from the main conversation's context, and they want the skill restricted to read-only tools so it can never modify files. Which two SKILL.md options address these two needs, respectively?",
    "question": "Which two SKILL.md options address these two needs, respectively?",
    "options": [
      {
        "letter": "A",
        "text": "`context: fork`, to isolate the skill's execution in a forked context; and `allowed-tools`, to restrict it to a read-only tool set.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "`isolation: worktree`, to isolate the skill in a separate git worktree; and `allowed-tools`, to restrict it to read-only tools.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "`context: fork`, to isolate the skill's execution; and a `PreToolUse` hook applied globally, to restrict tools.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "An Agent-tool call (formerly Task) to spawn a subagent for the audit; and a prompt instruction telling it not to edit files.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "`context: fork` isolates the skill's own execution and verbose intermediate work from the main conversation, while `allowed-tools` directly scopes which tools the skill may use -- here, a match for read-only exploration. (B) is tempting since `isolation: worktree` is a real option, but it isolates the filesystem for git operations, not the conversation context, so it doesn't address the first need. (C) uses a hook where a simple, skill-scoped `allowed-tools` setting is the more direct fit. (D) relies on a prompt instruction rather than an enforced tool restriction, and isn't the SKILL.md mechanism at all.",
    "domain": "claude-code-config"
  },
  {
    "id": "agentic-ai-tools-14",
    "scenario": "agentic-ai-tools",
    "situation": "An agent calls a `delete_record` MCP tool, which returns `isError: true` with error category `permission`, because the authenticated API key lacks delete rights. The agent's current recovery logic treats every `isError: true` response identically: it rewrites the input and retries, up to three times. What is the correct fix?",
    "question": "What is the correct fix?",
    "options": [
      {
        "letter": "A",
        "text": "Treat `permission` errors as non-retryable regardless of input changes, and escalate for a differently scoped credential or human intervention instead of retrying.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Keep retrying with exponential backoff, since enough attempts will eventually succeed.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the agent reclassify the response as a `validation` error so its existing retry logic can handle it consistently.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep the same retry logic, but reduce the retry count from three to one to save latency.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "A `permission` category means no amount of retrying or input reformatting will fix the underlying authorization gap, so the correct response is to stop retrying and escalate for different credentials. (B) is the exact mistake in the scenario: no number of retries fixes a missing permission. (C) doesn't change the actual cause of the failure -- relabeling the category doesn't grant the agent delete rights. (D) still wastes at least one retry on something that cannot succeed.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "agentic-ai-tools-15",
    "scenario": "agentic-ai-tools",
    "situation": "A market-intelligence coordinator merges output from a pricing subagent, which pulled data the same day, and a competitor subagent, which -- due to a stale-cache bug -- returned data collected three weeks earlier. The merged report presents both prices side by side with no indication that one is far less current than the other, and a customer made a purchasing decision based on the stale number, believing it to be current. What should the coordinator have done differently while aggregating?",
    "question": "What should the coordinator have done differently while aggregating?",
    "options": [
      {
        "letter": "A",
        "text": "Preserve and surface provenance for each data point -- including its source and retrieval date -- so consumers can see that the competitor figure was three weeks stale relative to the same-day pricing data.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Always prefer whichever subagent's data arrives first, regardless of source.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Average the two price points into a single blended figure for the report.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Instruct the competitor subagent to disable caching entirely so every result is always fetched live.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Attaching retrieval-date provenance to each aggregated value is what lets a reader see that the competitor figure was stale, which is the actual root cause of the customer being misled. (D) would prevent this specific staleness but is a heavy-handed infrastructure change that doesn't address the more general problem of the report failing to expose data recency at all. (B) is unrelated to freshness -- arriving first doesn't mean being current. (C) produces a number that mixes same-day and three-week-old data into something meaningless.",
    "domain": "context-reliability"
  }
];
