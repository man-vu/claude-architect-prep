import type { Question } from "@/domain/types";

export const conversationalAi: Question[] = [
  {
    "id": "conversational-ai-01",
    "scenario": "conversational-ai",
    "situation": "A developer builds a support agent and keeps a `messages` array on the server that accumulates every turn of the conversation. On turn 4, the agent responds as if it has never heard the customer's stated shipping preference from turn 1. Investigation shows only the latest user message is being sent to the `/v1/messages` endpoint each time, while earlier turns are simply stored in the server's array without being included in the request payload.",
    "question": "What is the root cause of the agent losing earlier context?",
    "options": [
      {
        "letter": "A",
        "text": "The context window is too small to hold the full conversation history.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Claude does not persist state between API calls, so the full conversation history must be sent on every request or earlier turns are effectively invisible to the model.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "The system prompt needs to be rewritten each turn to include a running memory summary.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The temperature setting is causing inconsistent recall of prior turns.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Claude has no memory between requests; every API call must include the full conversation history for the model to have access to it. Storing history server-side is necessary but not sufficient -- it must actually be included in each request's messages array.",
    "domain": "context-reliability"
  },
  {
    "id": "conversational-ai-02",
    "scenario": "conversational-ai",
    "situation": "A team builds a customer support agent with `get_customer`, `lookup_order`, `process_refund`, and `escalate_to_human`. During development, they also add `restart_server` and `view_system_logs`, reasoning that a customer's technical complaint might occasionally require deeper system investigation.",
    "question": "What is the primary risk of including `restart_server` and `view_system_logs` on this agent?",
    "options": [
      {
        "letter": "A",
        "text": "These tools consume extra context tokens, leaving less room for conversation history.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Giving an agent tools outside its role broadens the tool set with options irrelevant to most requests, which reduces the reliability of tool selection and increases the chance of an unsafe or irrelevant call.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Claude will refuse to call any tool if administrative tools are present in the same request.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "MCP servers cannot expose more than four tools to a single agent.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Role-scoped tool access is a core reliability pattern: giving an agent only the tools relevant to its role improves tool-selection accuracy. Adding system-administration tools to a support agent widens the tool set with irrelevant, higher-risk options and makes correct selection less reliable.",
    "domain": "agent-architecture"
  },
  {
    "id": "conversational-ai-03",
    "scenario": "conversational-ai",
    "situation": "A team building a Claude Code-based agent notices that a project convention discussed and agreed upon in one session (\"always use snake_case for API routes\") is not applied when a new session starts the next day.",
    "question": "What is the best way to make this convention persist across sessions?",
    "options": [
      {
        "letter": "A",
        "text": "Increase `max_tokens` so the previous session's conversation carries over automatically.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Rely on the model's training data, since Claude has likely seen similar conventions before.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Record the convention in `CLAUDE.md` (or add it via the `/memory` command) so it is loaded into context automatically at the start of future sessions.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Manually retype the convention into the first user message of every new session going forward.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "`CLAUDE.md` and the `/memory` command are the designed mechanisms for persisting context across sessions, since Claude does not otherwise retain anything once a session ends. Manually retyping the convention every session is brittle and easy to forget.",
    "domain": "claude-code-config"
  },
  {
    "id": "conversational-ai-04",
    "scenario": "conversational-ai",
    "situation": "A `find_customer` tool currently accepts one parameter, `identifier: string`, which may hold a customer ID, an email address, a phone number, or a name depending on what the caller happens to provide.",
    "question": "What is the recommended improvement to this tool's input design?",
    "options": [
      {
        "letter": "A",
        "text": "Add a `format` string parameter so the model can label what kind of value it is passing in `identifier`.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Replace the generic `identifier` field with explicit, constrained parameters, such as a numeric `customer_id` or a validated-format `email`, so the model does not have to guess intent.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Keep the single generic parameter, but add more few-shot examples showing each identifier type.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Split the tool into four separate tools -- find_by_id, find_by_email, find_by_phone, and find_by_name -- one per identifier type.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Constrained, explicit input fields (a numeric `customer_id` or a specified-format `email`) let the model and any validation logic reason precisely about what is being passed, instead of overloading a single generic field. Splitting into four tools trades one ambiguity for a new tool-selection ambiguity rather than fixing the underlying design.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "conversational-ai-05",
    "scenario": "conversational-ai",
    "situation": "A user says \"Can you check on my order?\" and the agent calls `get_customer`, which returns three customer records matching the name provided, with no further disambiguating detail.",
    "question": "What should the agent do next?",
    "options": [
      {
        "letter": "A",
        "text": "Automatically select the record with the most recent order activity, since it is statistically the most likely match.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Ask the customer for an additional identifying detail, such as an email address or order number, before taking any customer-specific action.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Summarize information from all three matching records so the customer can pick out which one is theirs.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Escalate to a human agent immediately, since resolving identity ambiguity always requires human judgment.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "When a lookup returns multiple matches, the agent should ask for an additional identifier before proceeding -- guessing based on recency risks acting on the wrong account, and surfacing all matches risks leaking another customer's data.",
    "domain": "context-reliability"
  },
  {
    "id": "conversational-ai-06",
    "scenario": "conversational-ai",
    "situation": "An agent summarizes history to manage context length in long support conversations. After summarization runs at turn 20, the agent can no longer recall the exact refund amount ($42.50) agreed to at turn 3, and instead refers to it vaguely as \"the discussed refund amount.\"",
    "question": "What is the most robust fix?",
    "options": [
      {
        "letter": "A",
        "text": "Raise the token threshold before summarization triggers, so more raw turns are preserved before compression happens.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Instruct the summarization prompt to preserve numeric details \"when possible.\"",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Maintain a persistent \"case facts\" block -- amounts, order numbers, agreed terms -- that is updated whenever new information appears and is included verbatim in every prompt, independent of the summarized history.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Disable summarization entirely for support conversations so the full history is always sent.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "A persistent case-facts block survives summarization because it is carried outside the summarized history and updated directly, guaranteeing transactional details remain available regardless of how much of the raw transcript gets compressed away. Raising the threshold only delays the same failure; disabling summarization does not scale for long conversations.",
    "domain": "context-reliability"
  },
  {
    "id": "conversational-ai-07",
    "scenario": "conversational-ai",
    "situation": "An MCP tool `process_refund` occasionally returns a result with `isError: true` and a message such as \"Refund amount exceeds order total.\"",
    "question": "How should the agent loop handle this response?",
    "options": [
      {
        "letter": "A",
        "text": "Treat the call as a normal successful tool_use and only check for errors by scanning Claude's follow-up text.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Feed the error content back to Claude as the tool result so it can reason about the failure and decide the next step, such as asking for a corrected amount or escalating.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Terminate the conversation immediately, since `isError` always indicates a fatal, unrecoverable problem.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Automatically retry the same call up to three times unmodified, since `isError` responses are always transient.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "An `isError` result should be returned to Claude as the tool result so it can reason about the failure and choose an appropriate next step. This particular error is a validation problem (the amount is invalid), not a transient one, so blindly retrying the identical call would fail the same way every time.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "conversational-ai-08",
    "scenario": "conversational-ai",
    "situation": "Compliance requires that no refund over $500 is ever processed without human review, regardless of what the model decides in the moment.",
    "question": "What is the most reliable way to enforce this rule?",
    "options": [
      {
        "letter": "A",
        "text": "Add a strongly worded instruction in the system prompt telling Claude never to approve refunds over $500 without human review.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Use a hook that inspects the `process_refund` call's parameters before execution and blocks or redirects to escalation whenever the amount exceeds $500, regardless of the model's stated reasoning.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Add few-shot examples showing the agent refusing to approve refunds above $500.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add a note in the tool's description mentioning that amounts over $500 require review.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Hooks provide deterministic, code-level policy enforcement that runs regardless of what the model outputs, which is what a hard compliance rule requires. Prompt instructions, examples, and description notes are all just guidance the model could fail to follow.",
    "domain": "agent-architecture"
  },
  {
    "id": "conversational-ai-09",
    "scenario": "conversational-ai",
    "situation": "When escalating a case, the current implementation passes the human agent a link to the raw conversation transcript, expecting them to read through it to find the relevant details before acting.",
    "question": "What is the problem with this escalation design, and the better alternative?",
    "options": [
      {
        "letter": "A",
        "text": "The transcript is too long to read quickly; the fix is to truncate it to the last five messages.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "There is no real problem -- raw transcripts give humans full context and are the most accurate source of truth.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Escalation handoffs should be structured and self-contained -- including a summary, the current case-facts, and the reason for escalation -- rather than depending on a human re-reading the raw transcript.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "The fix is to have the model append a one-sentence summary to the end of the same transcript.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Escalation handoffs need to be structured and self-contained so a human can act without depending on the raw transcript. Truncating or appending a summary to the transcript still leaves the human reliant on reconstructing context from raw conversation text.",
    "domain": "context-reliability"
  },
  {
    "id": "conversational-ai-10",
    "scenario": "conversational-ai",
    "situation": "A `lookup_order` MCP tool returns a large JSON payload with over 40 fields -- internal warehouse codes, carrier API metadata, raw timestamps -- on every call, even though the agent only ever needs order status, items, and delivery date to answer customers.",
    "question": "What is the recommended fix?",
    "options": [
      {
        "letter": "A",
        "text": "Trim the tool's output down to the fields relevant to the agent's task before it is added to context, rather than passing through the entire raw payload.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Increase the context window configuration so the full payload is never truncated.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a system prompt instruction telling Claude to ignore irrelevant fields when reading tool results.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Ask the MCP server maintainer to remove all fields except the three the agent needs, since other fields are never useful.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Trimming verbose tool outputs to the fields actually relevant to the task keeps context focused and reduces the chance of the model latching onto irrelevant data. Relying on a prompt instruction to \"ignore\" noisy fields is unreliable and wastes tokens every turn; removing fields at the server level could break other consumers of the same tool.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "conversational-ai-11",
    "scenario": "conversational-ai",
    "situation": "A user's first message is \"Something's wrong with my last order.\" The agent has `get_customer` and `lookup_order` available, but no order number and no description of the actual issue.",
    "question": "What is the best next step, following the \"interview\" pattern for handling ambiguity?",
    "options": [
      {
        "letter": "A",
        "text": "Call `lookup_order` using whatever order ID `get_customer` happens to list first.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Ask a clarifying question -- which order, and what the issue is -- before calling any tools, rather than guessing intent from a vague statement.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Call every order-related tool in parallel to gather as much information as possible before responding.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Escalate to a human immediately, since \"something's wrong\" is too vague for the agent to act on.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "The interview pattern calls for asking clarifying questions before acting when a request is ambiguous, rather than guessing which order or issue the customer means. Guessing risks acting on the wrong order, and immediate escalation skips a resolution the agent could easily handle after one clarifying question.",
    "domain": "prompt-engineering"
  },
  {
    "id": "conversational-ai-12",
    "scenario": "conversational-ai",
    "situation": "During a scripted escalation flow, once the agent determines a case must go to a human, the next Claude turn must call `escalate_to_human` and nothing else -- not a different tool, and not free text.",
    "question": "Which API parameter enforces this?",
    "options": [
      {
        "letter": "A",
        "text": "Set `tool_choice` to `{\"type\": \"tool\", \"name\": \"escalate_to_human\"}` so Claude is forced to call that specific tool on the next turn.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Set `tool_choice` to `\"any\"`, which restricts Claude to calling only the single most relevant tool.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Temporarily remove every other tool definition from the request so Claude has no other option.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Set `stop_reason` to `tool_use` in the request payload to force a tool call.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "`tool_choice` with `{type: \"tool\", name: ...}` forces Claude to call that exact tool on the next turn. `\"any\"` still lets Claude pick among all available tools rather than forcing one specific tool, and `stop_reason` is a field in Claude's response, not a request parameter that can be set.",
    "domain": "agent-architecture"
  },
  {
    "id": "conversational-ai-13",
    "scenario": "conversational-ai",
    "situation": "A team builds a Claude Code skill for refund investigations. They want the skill's tool calls (`get_customer`, `lookup_order`) to run in an isolated context so intermediate tool outputs don't clutter the main conversation, with only a final summary returned to it.",
    "question": "Which SKILL.md configuration supports this?",
    "options": [
      {
        "letter": "A",
        "text": "Set `allowed-tools` to list only `get_customer` and `lookup_order`, restricting which tools the skill can call.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Set `context: fork` so the skill executes in a forked context, keeping its intermediate tool calls out of the main conversation and returning only its final result.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Set the skill's `model` to a smaller model to run the investigation more cheaply.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Remove all tools from the skill so it relies only on the existing conversation context.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "`context: fork` runs the skill in an isolated context, so its intermediate tool calls don't pollute the main conversation and only its final output is returned. `allowed-tools` controls which tools the skill may use, but does not isolate its context from the main conversation.",
    "domain": "claude-code-config"
  },
  {
    "id": "conversational-ai-14",
    "scenario": "conversational-ai",
    "situation": "Mid-conversation, a customer says \"I already told you my order number is #7789\" -- but the agent's internal record shows it never called `lookup_order` with that number; the number appeared only in the customer's message text, never verified against a system lookup.",
    "question": "This scenario highlights the importance of distinguishing which two things?",
    "options": [
      {
        "letter": "A",
        "text": "Model temperature versus system prompt length.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Conversation state -- what the customer has said -- versus agent state -- what the agent has actually verified or done, such as which tools it has called.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Claude's context window size versus the MCP server's processing capacity.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The `tool_choice` setting versus the `stop_reason` value.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "A customer's stated claim (conversation state) is not the same as something the agent has actually verified through a tool call (agent state). Treating an unverified claim as if it were confirmed system fact risks acting on incorrect information.",
    "domain": "context-reliability"
  },
  {
    "id": "conversational-ai-15",
    "scenario": "conversational-ai",
    "situation": "The `process_refund` tool returns `{\"status\": \"pending\", \"confirmation_id\": null}` when a refund requires manual approval, but the agent's current logic treats any response that doesn't throw an exception as a successful refund and tells the customer \"Your refund has been processed.\"",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Validate the tool's output fields, such as `status` and `confirmation_id`, before generating a customer-facing confirmation, rather than assuming any non-thrown response means success.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Wrap the tool call in a try/catch and continue treating any thrown exception as the only failure signal.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a system prompt note telling Claude to \"always double check refund results before responding.\"",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Reduce the tool's possible `status` values down to just \"success\" and \"error\" to simplify parsing.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Tool outputs need to be validated on their actual field values before the agent acts on them -- a response without a thrown exception is not the same as a confirmed success. Collapsing `status` to two values would just erase the pending/manual-review distinction rather than fix the validation gap.",
    "domain": "tool-mcp-design"
  }
];
