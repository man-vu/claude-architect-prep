import type { Question } from "@/domain/types";

export const customerSupport: Question[] = [
  {
    "id": "customer-support-01",
    "scenario": "customer-support",
    "situation": "While testing, you notice the agent often calls `get_customer` when users ask about order status, even though `lookup_order` would be more appropriate. What should you check first to address this problem?",
    "question": "What should you check first?",
    "options": [
      {
        "letter": "A",
        "text": "Implement a preprocessing classifier to detect order-related requests and route them directly to `lookup_order`.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Reduce the number of tools available to the agent to simplify choice.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add few-shot examples to the system prompt covering all possible order request patterns to improve tool selection.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Check the tool descriptions to ensure they clearly differentiate each tool’s purpose.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Tool descriptions are the primary input the model uses to decide which tool to call. When an agent consistently picks the wrong tool, the first diagnostic step is to verify that tool descriptions clearly separate each tool’s purpose and usage boundaries.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "customer-support-02",
    "scenario": "customer-support",
    "situation": "Your agent handles single-issue requests with 94% accuracy (e.g., “I need a refund for order #1234”). But when customers include multiple issues in one message (e.g., “I need a refund for order #1234 and also want to update the shipping address for order #5678”), tool selection accuracy drops to 58%. The agent usually solves only one issue or mixes parameters across requests. What approach most effectively improves reliability for multi-issue requests?",
    "question": "What approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Implement a preprocessing layer that uses a separate model call to decompose multi-issue messages into separate requests, handle each independently, and merge results.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Combine related tools into fewer universal tools.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add few-shot examples to the prompt demonstrating correct reasoning and tool sequencing for multi-issue requests.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Implement response validation that detects incomplete answers and automatically reprompts the agent to resolve missed issues.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Few-shot examples that demonstrate correct reasoning and tool sequencing for multi-issue requests are most effective because the agent already performs well on single issues—what it needs is guidance on the pattern for decomposing and routing multiple issues and keeping parameters separated.",
    "domain": "prompt-engineering"
  },
  {
    "id": "customer-support-03",
    "scenario": "customer-support",
    "situation": "Production logs show that for simple requests like “refund for order #1234,” your agent resolves the issue in 3–4 tool calls with 91% success. But for complex requests like “I was billed twice, my discount didn’t apply, and I want to cancel,” the agent averages 12+ tool calls with only 54% success—often investigating issues sequentially and fetching redundant customer data for each. What change most effectively improves handling of complex requests?",
    "question": "What change is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Add explicit verification checkpoints between stages, requiring the agent to record progress after resolving each issue before moving to the next.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Reduce the number of tools by combining `get_customer`, `lookup_order`, and billing-related tools into a single `investigate_issue` tool.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Decompose the request into separate issues, then investigate each in parallel using shared customer context before synthesizing a final resolution.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Add few-shot examples to the system prompt demonstrating ideal tool-call sequences for various multi-faceted billing scenarios.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Decomposing into separate issues and investigating in parallel with shared customer context fixes both key problems: it eliminates redundant data retrieval by reusing shared context across issues and reduces total tool-call loops by parallelizing investigation before synthesizing a single resolution.",
    "domain": "agent-architecture"
  },
  {
    "id": "customer-support-04",
    "scenario": "customer-support",
    "situation": "Your agent achieves 55% first-contact resolution, well below the 80% target. Logs show it escalates simple cases (standard replacements for damaged goods with photo proof) while trying to handle complex situations requiring policy exceptions autonomously. What is the most effective way to improve escalation calibration?",
    "question": "What is the most effective way to improve escalation calibration?",
    "options": [
      {
        "letter": "A",
        "text": "Require the agent to self-rate confidence on a 1–10 scale before each response and automatically route to humans when confidence drops below a threshold.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent starts processing.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add explicit escalation criteria to the system prompt with few-shot examples showing when to escalate versus resolve autonomously.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Implement sentiment analysis to determine customer frustration level and automatically escalate past a negative sentiment threshold.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Explicit escalation criteria with few-shot examples directly address the root cause—unclear decision boundaries between simple and complex cases. It’s the most proportional, effective first intervention that teaches the agent when to escalate and when to resolve autonomously without extra infrastructure.",
    "domain": "context-reliability"
  },
  {
    "id": "customer-support-05",
    "scenario": "customer-support",
    "situation": "After calling `get_customer` and `lookup_order`, the agent has all available system data but still faces uncertainty. Which situation is the most justified trigger for calling `escalate_to_human`?",
    "question": "Which situation is most justified for escalation?",
    "options": [
      {
        "letter": "A",
        "text": "A customer wants to cancel an order shipped yesterday and arriving tomorrow. The agent should escalate because the customer might change their mind after receiving the package.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "A customer claims they didn’t receive an order, but tracking shows it was delivered and signed for at their address three days ago. The agent should escalate because presenting contradictory evidence could harm the customer relationship.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "A customer requests competitor price matching. Your policies allow price adjustments for price drops on your own site within 14 days, but say nothing about competitor prices. The agent should escalate for policy interpretation.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "A customer message contains both a billing question and a product return. The agent should escalate so a human can coordinate both issues in one interaction.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "This is a genuine policy gap: company rules cover price drops on your own site but do not address competitor price matching. The agent must not invent policy and should escalate for human judgment on how to interpret or extend existing rules.",
    "domain": "context-reliability"
  },
  {
    "id": "customer-support-06",
    "scenario": "customer-support",
    "situation": "Production logs show that in 12% of cases your agent skips `get_customer` and calls `lookup_order` directly using only the customer-provided name, sometimes leading to misidentified accounts and incorrect refunds. What change most effectively fixes this reliability problem?",
    "question": "What change is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Add few-shot examples showing that the agent always calls `get_customer` first, even when customers voluntarily provide order details.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Implement a routing classifier that analyzes each request and enables only a subset of tools appropriate for that request type.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a programmatic precondition that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer identifier.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Strengthen the system prompt stating that customer verification via `get_customer` is mandatory before any order operations.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "A programmatic precondition provides a deterministic guarantee that required sequencing is followed. It’s the most effective approach because it eliminates the possibility of skipping verification, regardless of LLM behavior.",
    "domain": "agent-architecture"
  },
  {
    "id": "customer-support-07",
    "scenario": "customer-support",
    "situation": "Production metrics show that when resolving complex billing disputes or multi-order returns, customer satisfaction scores are 15% lower than for simple cases—even when the resolution is technically correct. Root-cause analysis shows the agent provides accurate solutions but inconsistently explains rationale: sometimes omitting relevant policy details, sometimes missing timeline info or next steps. The specific context gaps vary case by case. You want to improve solution quality without adding human oversight. What approach is most effective?",
    "question": "What approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Add a self-critique stage where the agent evaluates a draft response for completeness—ensuring it resolves the customer’s issue, includes relevant context, and anticipates follow-up questions.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Add a confirmation stage where the agent asks “Does this fully resolve your issue?” before closing, allowing customers to request additional information if needed.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Upgrade the model from Haiku to Sonnet for complex cases, routing based on a defined complexity metric.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Implement few-shot examples in the system prompt showing complete explanations for five common complex case types, demonstrating how to include policy context, timelines, and next steps.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "A self-critique stage (the evaluator-optimizer pattern) directly addresses inconsistent explanation completeness by forcing the agent to assess its own draft against concrete criteria—such as policy context, timelines, and next steps—before presenting it. This catches case-specific gaps without human oversight.",
    "domain": "agent-architecture"
  },
  {
    "id": "customer-support-08",
    "scenario": "customer-support",
    "situation": "Production metrics show your agent averages 4+ API loops per resolution. Analysis reveals Claude often requests `get_customer` and `lookup_order` in separate sequential turns even when both are needed initially. What is the most effective way to reduce the number of loops?",
    "question": "What is the most effective way to reduce loops?",
    "options": [
      {
        "letter": "A",
        "text": "Implement speculative execution that automatically calls likely-needed tools in parallel with any requested tool and returns all results regardless of what was requested.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Increase `max_tokens` to give Claude more room to plan and naturally combine tool requests.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Create composite tools like `get_customer_with_orders` that bundle common lookup combinations into single calls.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Instruct Claude in the prompt to bundle tool requests into one turn and return all results together before the next API call.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Prompting Claude to bundle related tool requests into a single turn leverages its native ability to request multiple tools at once. It directly fixes the sequential-call pattern with minimal architectural change.",
    "domain": "agent-architecture"
  },
  {
    "id": "customer-support-09",
    "scenario": "customer-support",
    "situation": "Production logs show a pattern: customers reference specific amounts (e.g., “the 15% discount I mentioned”), but the agent responds with incorrect values. Investigation shows these details were mentioned 20+ turns ago and condensed into vague summaries like “promotional pricing was discussed.” What fix is most effective?",
    "question": "What fix is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Increase the summarization threshold from 70% to 85% so conversations have more room before summarization triggers.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Store full conversation history in external storage and implement retrieval when the agent detects references like “as I mentioned.”",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Extract transactional facts (amounts, dates, order numbers) into a persistent “case facts” block included in every prompt outside the summarized history.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Revise the summarization prompt to explicitly preserve all numbers, percentages, dates, and customer-stated expectations verbatim.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Summarization inherently loses precise details. Extracting transactional facts into a structured “case facts” block outside the summarized history preserves critical information so it’s reliably available in every prompt regardless of how many turns have been summarized.",
    "domain": "context-reliability"
  },
  {
    "id": "customer-support-10",
    "scenario": "customer-support",
    "situation": "Your `get_customer` tool returns all matches when searching by name. Currently, when there are multiple results, Claude picks the customer with the most recent order, but production data shows this selects the wrong account 15% of the time for ambiguous matches. How should you address this?",
    "question": "How should you address this?",
    "options": [
      {
        "letter": "A",
        "text": "Implement a confidence scoring system that acts autonomously above 85% confidence and requests clarification below the threshold.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Instruct Claude to request an additional identifier (email, phone, or order number) when `get_customer` returns multiple matches before taking any customer-specific action.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Modify `get_customer` to return only a single most-likely match based on a ranking algorithm, eliminating ambiguity.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add few-shot examples to the prompt demonstrating correct reasoning and tool sequencing for ambiguous matches.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Asking the user for an additional identifier is the most reliable way to resolve ambiguity because the user has definitive knowledge of their identity. One extra conversational turn is a small price to pay to eliminate a 15% error rate caused by choosing the wrong account.",
    "domain": "context-reliability"
  },
  {
    "id": "customer-support-11",
    "scenario": "customer-support",
    "situation": "Production logs show a consistent pattern: when customers include the word “account” in their message (e.g., “I want to check my account for an order I made yesterday”), the agent calls `get_customer` first 78% of the time. When customers phrase similar requests without “account” (e.g., “I want to check an order I made yesterday”), it calls `lookup_order` first 93% of the time. Tool descriptions are clear and unambiguous. What is the most likely root cause of this discrepancy?",
    "question": "What is the most likely root cause?",
    "options": [
      {
        "letter": "A",
        "text": "The system prompt contains keyword-sensitive instructions that steer behavior based on terms like “account,” creating unintended tool-selection patterns.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "The model’s base training creates associations between “account” terminology and customer-related operations that override tool descriptions.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "The model needs more training data on multi-concept messages and should be fine-tuned on examples containing both account and order terminology.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Tool descriptions need additional negative examples specifying when NOT to use each tool to prevent this keyword-induced confusion.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "The systematic keyword-driven pattern (78% vs 93%) strongly indicates explicit routing logic in the system prompt reacting to the word “account” and steering the agent toward customer-related tools. Since tool descriptions are already clear, the discrepancy points to prompt-level instructions creating unintended behavioral steering.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "customer-support-12",
    "scenario": "customer-support",
    "situation": "Production logs show the agent often calls `get_customer` when users ask about orders (e.g., “check my order #12345”) instead of calling `lookup_order`. Both tools have minimal descriptions (“Gets customer information” / “Gets order details”) and accept similar-looking identifier formats. What is the most effective first step to improve tool selection reliability?",
    "question": "What is the most effective first step?",
    "options": [
      {
        "letter": "A",
        "text": "Implement a routing layer that analyzes user input before each turn and preselects the correct tool based on detected keywords and ID patterns.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Combine both tools into a single `lookup_entity` that accepts any identifier and internally decides which backend to query.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5–8 examples routing order-related queries to `lookup_order`.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Expand each tool’s description to include input formats, example queries, edge cases, and boundaries explaining when to use it versus similar tools.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Expanding tool descriptions with input formats, example queries, edge cases, and clear boundaries directly fixes the root cause—minimal descriptions that don’t give the LLM enough information to distinguish similar tools. It’s a low-effort, high-impact first step that improves the primary mechanism the LLM uses for tool selection.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "customer-support-13",
    "scenario": "customer-support",
    "situation": "You are implementing the agent loop for your support agent. After each Claude API call, you must decide whether to continue the loop (run requested tools and call Claude again) or stop (present the final answer to the customer). What determines this decision?",
    "question": "What determines this decision?",
    "options": [
      {
        "letter": "A",
        "text": "Check the `stop_reason` field in Claude’s response—continue if it is `tool_use` and stop if it is `end_turn`.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Parse Claude’s text for phrases like “I’m done” or “Can I help with anything else?”—natural language signals indicate task completion.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Set a maximum iteration count (e.g., 10 calls) and stop when reached, regardless of whether Claude indicates more work is needed.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Check whether the response contains assistant text content—if Claude generated explanatory text, the loop should terminate.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "`stop_reason` is Claude’s explicit structured signal for loop control: `tool_use` indicates Claude wants to run a tool and receive results back, while `end_turn` indicates Claude has completed its response and the loop should end.",
    "domain": "agent-architecture"
  },
  {
    "id": "customer-support-14",
    "scenario": "customer-support",
    "situation": "Production logs show the agent misinterprets outputs from your MCP tools: Unix timestamps from `get_customer`, ISO 8601 dates from `lookup_order`, and numeric status codes (1=pending, 2=shipped). Some tools are third-party MCP servers you cannot modify. Which approach to data format normalization is most maintainable?",
    "question": "Which approach is most maintainable?",
    "options": [
      {
        "letter": "A",
        "text": "Use a PostToolUse hook to intercept tool outputs and apply formatting transformations before the agent processes them.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Modify tools you control to return human-readable formats and create wrappers for third-party tools.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Create a `normalize_data` tool that the agent calls after every data retrieval to transform values.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add detailed format documentation to the system prompt explaining each tool’s data conventions.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "A PostToolUse hook provides a centralized, deterministic point to intercept and normalize all tool outputs—including third-party MCP server data—before the agent processes them. It’s more maintainable because transformations live in code and apply uniformly, rather than relying on LLM interpretation.",
    "domain": "agent-architecture"
  },
  {
    "id": "customer-support-15",
    "scenario": "customer-support",
    "situation": "Production logs show the agent sometimes chooses `get_customer` when `lookup_order` would be more appropriate, especially for ambiguous queries like “I need help with my recent purchase.” You decide to add few-shot examples to the system prompt to improve tool selection. Which approach most effectively addresses the problem?",
    "question": "Which approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Add explicit “use when” and “don’t use when” guidance in each tool description covering ambiguous cases.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add examples grouped by tool—all `get_customer` scenarios together, then all `lookup_order` scenarios.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add 4–6 examples targeted at ambiguous scenarios, each with rationale for why one tool was chosen over plausible alternatives.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Add 10–15 examples of clear, unambiguous requests demonstrating correct tool choice for typical scenarios for each tool.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Targeting few-shot examples at the specific ambiguous scenarios where errors occur, with explicit rationale for why one tool is preferable to alternatives, teaches the model the comparative decision process needed for edge cases. This is more effective than generic examples or declarative rules.",
    "domain": "prompt-engineering"
  }
];
