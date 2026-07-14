import type { Question } from "@/domain/types";

// Questions 01–13 adapted from "Claude Certified Architect – Foundations: Exam Prep Guide"
// by avidevelops — https://github.com/avidevelops/claude-architect-exam-prep (CC BY 4.0).
// Adaptations: rewritten into this bank's scenario/question schema, option order shuffled,
// explanations condensed. Questions 14–15 are original.
export const toolDesign: Question[] = [
  {
    "id": "tool-design-01",
    "scenario": "tool-design",
    "situation": "An internal document-assistant agent uses a `search_documents` tool to find files, then acts on them with `share_document(document_id, email)` and `move_document(document_id, folder)`. Chaining fails intermittently because the search results don't give the agent what the follow-up tools need. How should `search_documents` format its output to make chaining reliable?",
    "question": "How should the search tool format its output?",
    "options": [
      {
        "letter": "A",
        "text": "Return clickable, human-readable URLs for each matching document.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Return structured data containing the `document_id` and key metadata for each result.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Return detailed prose summaries of each document's contents.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Return a simple list of document titles ordered by relevance.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "The downstream tools require a machine-usable `document_id`, so the upstream search tool must return exactly that identifier in structured form alongside human-readable metadata. URLs, prose summaries, or bare titles force the agent to infer or parse identifiers it was never actually given — tools meant for chaining should always return explicit IDs.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-02",
    "scenario": "tool-design",
    "situation": "Your agent platform exposes over 50 API connector tools simultaneously. The agent frequently selects the wrong connector, even after you added an explicit instruction to search for the right one before acting. What is the most effective architectural change to fix this tool-selection failure?",
    "question": "What is the most effective architectural change?",
    "options": [
      {
        "letter": "A",
        "text": "Provide a `search_connectors` tool that dynamically scopes the toolset, exposing only the 2–3 matched, relevant connectors to the agent for the next turn.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Rewrite the tool descriptions for all 50 connectors to be more detailed and distinctive.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Combine all 50 connectors into a single monolithic API tool with a `connector` parameter.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Improve error handling so the agent can recover gracefully after selecting the wrong connector.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Exposing 50+ tools at once degrades selection accuracy regardless of description quality — the fix is to reduce decision complexity by dynamically injecting only the relevant matched connectors into context. A monolithic tool hides the parameter differences the agent needs to choose correctly, and better error handling is reactive where dynamic scoping prevents the error up front.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-03",
    "scenario": "tool-design",
    "situation": "An agent queries internal databases through a `query_database(database)` tool, but users refer to databases with ambiguous natural language (\"the research database\" rather than `db_res_01`), and tool calls regularly fail with unknown-database errors. How should the tool's input schema be designed to handle this reliably?",
    "question": "How should the input schema be designed?",
    "options": [
      {
        "letter": "A",
        "text": "Use a freeform string parameter and apply fuzzy matching in the backend to find the intended database.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Allow freeform strings but reject the call at runtime with an error when the name doesn't resolve.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Use an `enum` parameter explicitly listing the exact allowed database identifiers.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Default to searching every database simultaneously whenever the reference is ambiguous.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "An enum of exact backend values creates a strict input contract: the model uses its semantic understanding to map messy natural language (\"research database\") onto the correct identifier (`db_res_01`) *before* the tool executes. Fuzzy matching pushes the ambiguity into the backend, runtime rejection wastes an execution turn, and searching everything spikes cost, latency, and context bloat.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-04",
    "scenario": "tool-design",
    "situation": "A `search_records` tool automatically fetches and returns every matching record from a database. Most agent tasks only need the first few results, yet large result sets regularly cause severe latency and context bloat. What is the best way to redesign this tool's output?",
    "question": "What is the best redesign of the tool's output?",
    "options": [
      {
        "letter": "A",
        "text": "Silently limit results to the top 5 most relevant hits.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Return the first page of results along with pagination metadata — total match count and a cursor — so the agent can fetch more if needed.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Create a separate `fetch_next_page` tool the agent can call for additional results.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add a `max_pages` parameter letting the agent decide how many pages the tool fetches internally.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Returning the first page plus explicit pagination state (`total_matches`, `next_cursor`) gives the agent the situational awareness to decide whether it has enough or should pass the cursor back for page two. Silent truncation hides potentially vital information without warning, a separate pagination tool clutters the toolset when a parameter suffices, and internal multi-page fetching recreates the original latency problem.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-05",
    "scenario": "tool-design",
    "situation": "You are designing the user-confirmation flow for an agent that consumes tools from a third-party MCP server. The server annotates its tools with `readOnlyHint: true`, and a teammate proposes skipping confirmation prompts for those tools since they can't change anything. How should the annotations be treated?",
    "question": "How should the annotations be treated?",
    "options": [
      {
        "letter": "A",
        "text": "Trust them automatically, since the MCP server runs locally on the user's machine.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Bypass confirmations safely — `readOnlyHint` guarantees no destructive action can occur.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Test the tools in a sandbox first, and trust the annotations once sandbox behavior looks safe.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Treat the annotations as untrusted, self-reported metadata, and base any confirmation-bypass policy on your trust in the server's vendor rather than the labels.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Annotations like `readOnlyHint` and `destructiveHint` are entirely self-reported by the MCP server — they are labels, not system-level guarantees. Confirmation-bypass decisions must rest on explicit trust in the vendor providing the server: local execution doesn't make code trustworthy, and clean sandbox behavior doesn't prove malicious capabilities aren't hidden.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-06",
    "scenario": "tool-design",
    "situation": "An agent repeatedly executes a two-step sequence: `get_property_details(property_id)` to obtain an address, then `get_neighborhood_info(address)` with that address. The purely mechanical hand-off adds latency and occasionally fails when the agent transcribes the address imperfectly. How should the tool design be improved?",
    "question": "How should the tool design be improved?",
    "options": [
      {
        "letter": "A",
        "text": "Modify `get_neighborhood_info` to accept a `property_id` directly and resolve the address internally.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Merge both tools into a single `get_all_property_data` tool returning everything at once.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Improve the prompt so the agent extracts and copies the address more reliably.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Create a middle-tier helper tool that manages the data hand-off between the two calls.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Forcing the agent to orchestrate a purely mechanical ID-to-address lookup wastes tokens and adds a failure point. When one tool predictably follows another, internalize the dependency: accept the `property_id` and resolve the address in the backend. Full merging over-consolidates two distinct capabilities, prompt tweaks don't remove the extra sequential call, and a helper tool adds surface area while preserving the chaining flaw.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-07",
    "scenario": "tool-design",
    "situation": "A shipment-tracking agent calls tools that wrap several shipping-carrier APIs. Each carrier returns timestamps, statuses, and delay codes in a completely different JSON layout, and the agent regularly misreads one carrier's format as another's. How should the tool output provided to the agent be designed?",
    "question": "How should the tool output be designed?",
    "options": [
      {
        "letter": "A",
        "text": "Pass the raw carrier JSON through and add extensive prompt instructions explaining how to parse each carrier's format.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Create separate tracking tools per carrier so the raw schemas stay cleanly distinct.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Normalize every carrier response into a single common schema (e.g., `status`, `estimated_delivery`) before returning it to the agent.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Return both the normalized schema and the full raw response so the agent has maximum context.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Agents reason best over consistent, predictable structures. Normalizing vendor-specific formats in your middleware lets the agent spend attention on the user's actual problem rather than on format parsing. Prompt-based parsing instructions are brittle, per-carrier tools bloat the toolset, and appending raw responses adds noise that consumes context without improving reasoning.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-08",
    "scenario": "tool-design",
    "situation": "An agent updates sports scores with an `update_game_score(date, team_name)` tool. Calls frequently fail on ambiguous team nicknames, rematches between the same teams on one day, and date-format variations. What is the most reliable tool design to fix this?",
    "question": "What is the most reliable tool design?",
    "options": [
      {
        "letter": "A",
        "text": "Require strict ISO-8601 dates and official full team names in the tool schema.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Improve the tool description with examples of correctly formatted inputs.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add regex validation to the parameters so formatting errors are caught early.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Introduce a `search_games` lookup tool that returns a `game_id`, and change the scoring tool to accept only that `game_id`.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Natural-language attributes like dates and team names are inherently ambiguous as database keys. Separating discovery from action — a lookup tool that resolves the game to a machine-usable `game_id`, and a mutating tool that accepts only that ID — removes the ambiguity structurally. Stricter formats don't disambiguate same-day rematches, and descriptions or regex validation catch format errors without helping the agent identify the right game.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-09",
    "scenario": "tool-design",
    "situation": "An agent processes employee reimbursements. Company policy requires payouts over $500 to be routed to a pending-approval queue — and this threshold must be impossible for the agent to bypass, even under hallucination or prompt injection. Where should the rule be enforced?",
    "question": "Where should the rule be enforced?",
    "options": [
      {
        "letter": "A",
        "text": "Inside the `process_reimbursement` tool's backend logic, which routes any amount over $500 to the approval queue regardless of what the agent requests.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "As a `requires_approval` boolean parameter in the tool schema that the agent must set for large amounts.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "As a strict system-prompt instruction that the agent must never disburse amounts over $500.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "As two separate tools — `disburse` and `request_approval` — with descriptions guiding the agent to select the right one.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "A rule that absolutely cannot be bypassed must be enforced deterministically in backend code, not probabilistically by the model. With the threshold inside the tool, even a hallucinated or injected request over $500 degrades gracefully to pending approval. An agent-set flag, a prompt instruction, or tool selection all leave the gate in the model's hands, where a non-zero failure rate is guaranteed.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-10",
    "scenario": "tool-design",
    "situation": "During execution, an agent repeatedly formats inputs incorrectly for the `user_id` and `fields_to_update` parameters of an update tool — wrong shapes, wrong identifier style, missing required structure. What is the most effective way to help the model understand exactly what values and formats to provide?",
    "question": "What most effectively guides the model's inputs?",
    "options": [
      {
        "letter": "A",
        "text": "Make the JSON Schema extremely strict with complex regex constraints on every field.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Rename the tool so the expected formats are hinted at in the tool name itself.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Write clear, detailed parameter descriptions in the tool schema, stating expected formats with examples (e.g., \"UUID of the user to update\").",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Add error-handling logic that explains the formatting rules whenever a call fails validation.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Tool and parameter descriptions are the primary mechanism the model uses to understand expected inputs, formats, and boundaries — explicit guidance on each property shapes generation before the call is made. Strict validation only rejects bad input without teaching the model how to produce good input, name-based hints are a poor substitute for real descriptions, and error-driven explanations waste execution turns reacting to failures the schema could have prevented.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-11",
    "scenario": "tool-design",
    "situation": "A tool your agent depends on fails in two distinct ways: transient network timeouts, and permanent input-validation errors such as malformed IDs. Today both error types are passed straight back to the agent, which wastes turns retrying calls that can never succeed. How should the tool handle these two error classes?",
    "question": "How should the tool handle the two error classes?",
    "options": [
      {
        "letter": "A",
        "text": "Pass all errors to the agent with prompt guidance to retry timeouts but stop on validation errors.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Uniformly auto-retry every error three times inside the tool before reporting failure.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Return all errors immediately as a generic \"Tool Execution Failed\" message to keep handling consistent.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Auto-retry transient timeouts inside the tool, but return validation errors immediately with specific details so the agent can correct its input.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Predictable system-level transient errors belong in an ordinary engineering retry loop inside the tool — spending agent turns on them wastes context and money. Validation errors are the opposite: only the agent's reasoning can fix the input, so they should come back immediately with explicit details. Uniform retries re-run calls that fail identically every time, and generic error messages give the model nothing to self-correct with.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-12",
    "scenario": "tool-design",
    "situation": "An agent works across several MCP servers — an issue tracker, a docs wiki, and a database-schema service. Logs show it wastes many turns making exploratory tool calls just to discover what data each server holds before it can do real work. How can data discovery be improved?",
    "question": "How can data discovery be improved?",
    "options": [
      {
        "letter": "A",
        "text": "Expose each server's content catalog (hierarchies, summaries, schemas) as MCP Resources the agent can read before making targeted tool calls.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Consolidate all the MCP servers into a single, larger endpoint.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a custom `discover_data` tool to every MCP server.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Implement keyword-based routing in the coordinator to send each query to the right server automatically.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "MCP distinguishes tools (actions and queries) from resources (exposed context and data). Publishing each server's catalog as a Resource gives the agent a lightweight map of what exists before it spends turns on targeted calls — exactly the problem the primitive was designed for. A custom discovery tool reinvents that native feature, consolidation destroys service boundaries without fixing exploration, and keyword routing is brittle for questions that span systems.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-13",
    "scenario": "tool-design",
    "situation": "A document pipeline defines `extract_metadata` (which returns a DOI) plus two enrichment tools, `lookup_citations` and `verify_doi`, that require a DOI as input. When users ask for \"the metadata plus how often it's cited,\" the model sometimes calls the enrichment tools first, and they fail for lack of a DOI. What most reliably enforces the required execution order?",
    "question": "What most reliably enforces the execution order?",
    "options": [
      {
        "letter": "A",
        "text": "Add a prompt instruction to \"always call extract_metadata first.\"",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Set `tool_choice` to force `extract_metadata` on the first turn, then switch to `\"auto\"` for subsequent turns.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Combine all three tools into a single tool that performs extraction and enrichment together.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep `tool_choice: \"auto\"` but reword the enrichment tools' descriptions to discourage calling them early.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "A strict tool dependency deserves a deterministic gate: forcing `tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"}` on the first turn guarantees the DOI exists in context before releasing the model to `\"auto\"`. Prompt instructions and description wording remain probabilistic — under `auto` the model may still parallelize the steps — and merging the tools sacrifices composability for a workaround.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-14",
    "scenario": "tool-design",
    "situation": "A billing agent has a single tool, `manage_subscription(action, subscription_id)`, where `action` may be \"view\", \"update_plan\", \"pause\", or \"cancel\". Logs show the agent occasionally issues a state-changing action when the user only asked a question, and you cannot attach a confirmation step to mutations because reads and writes flow through the same tool. What is the best redesign?",
    "question": "What is the best redesign?",
    "options": [
      {
        "letter": "A",
        "text": "Keep the single tool but add a prompt rule to use the \"view\" action unless the user explicitly requests a change.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Split it into separate tools with precise verbs — `get_subscription` for reads, and `update_subscription_plan`, `pause_subscription`, `cancel_subscription` for mutations.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Add a `confirm: boolean` parameter that the agent must set to `true` before any mutating action executes.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Log every call and alert a human reviewer whenever a mutation follows a read-only question.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "A vague \"manage\" verb hides which operations read and which change state, so neither the model nor the application can treat them differently. Splitting into narrowly named read and mutation tools makes selection unambiguous and lets confirmation policies attach exactly to the destructive tools. A prompt rule is probabilistic, an agent-set `confirm` flag leaves the gate in the model's hands, and after-the-fact alerting doesn't prevent the unwanted mutation.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "tool-design-15",
    "scenario": "tool-design",
    "situation": "A `fetch_analytics(sources, date_range)` tool aggregates data from four internal sources. When any one source is down, the tool discards everything and returns the string \"Error: fetch failed\". Agents respond by retrying the identical call, usually hitting the same failure again. How should the tool's error response be redesigned?",
    "question": "How should the error response be redesigned?",
    "options": [
      {
        "letter": "A",
        "text": "Return structured error data — an error category, the parameters that were attempted, and `partial_results` from the sources that succeeded — so the agent can use what's available and adjust only the failing part.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Have the tool retry internally until all four sources eventually succeed.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Return numeric HTTP-style status codes that the agent can look up to interpret the failure.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Return \"no data found\" for the failing source so the agent can complete the task without an error path.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "A bare failure string gives the model nothing to act on, so it blind-retries. A structured error carrying the category, what was attempted, and the partial results preserves completed work and tells the agent exactly what to change. Unbounded internal retries block on a source that may stay down, bare status codes shift interpretation work onto the model, and reporting a failure as \"no data found\" is the silent-suppression anti-pattern — it looks identical to success downstream.",
    "domain": "tool-mcp-design"
  }
];
