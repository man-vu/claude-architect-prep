Agentic systems are built from a small number of load-bearing primitives — a stateless request/response loop, narrowly-scoped agent definitions, a coordinator that owns delegation, and deterministic guardrails around anything that isn't safe to leave to a prompt. This page covers the loop mechanics, hub-and-spoke orchestration, hooks, task decomposition strategies, and error handling — the material most exam questions probe by presenting a broken or naive implementation and asking what's wrong with it.

## The Agentic Loop

Every agentic system, however elaborate its orchestration, is built on top of one mechanical loop:

1. Send a request to the model: system prompt + the **full conversation history** + tool definitions.
2. Receive a response. Inspect `stop_reason`.
3. If `stop_reason == "tool_use"`: execute the requested tool(s), append the `tool_result` block(s) to the conversation history, and go back to step 1.
4. If `stop_reason == "end_turn"`: the model has nothing further to do. Return the result.

```python
messages = [{"role": "user", "content": user_input}]

while True:
    response = client.messages.create(
        model="claude-opus-4-8",
        system=system_prompt,
        messages=messages,
        tools=tool_definitions,
    )
    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "tool_use":
        tool_result = execute_tool(response.content)
        messages.append({"role": "user", "content": [tool_result]})
        continue

    if response.stop_reason == "end_turn":
        break
    # handle "max_tokens", "stop_sequence" etc. as application-specific cases
```

The loop is **model-driven**: Claude decides which tool to call next by reasoning over the current context, rather than following a hardcoded decision tree or a fixed, pre-scripted tool sequence. That adaptivity is the whole point of an agent — and it's why the control signal below (`stop_reason`) carries so much weight: you aren't dictating each step, so you need a reliable way to know when the model is finished.

### The model is stateless

The model holds no memory between calls. Every single request re-sends the entire message history — system prompt, every prior user turn, every prior assistant turn, every tool call and its result. "Context" is not something the model remembers; it's something your application resubmits each time. This has direct consequences for cost (tokens re-billed every turn, mitigated by prompt caching) and for architecture (anything the model needs to "recall" must be in the messages array you send).

### The only reliable stop signal

`stop_reason == "end_turn"` is the **only** trustworthy signal that the model is done. Everything else is a proxy that can be wrong:

| Approach | Why it fails |
|---|---|
| Parse assistant text for words like "done", "completed", "finished" | The model can say "I've completed step 1 of 3" — text matching can't distinguish sub-task completion from task completion, and phrasing varies across runs |
| Use an arbitrary `max_iterations` as the primary stop condition | Cuts off legitimately long tasks early, or lets short-circuited loops run needlessly long; iteration count has no semantic relationship to task completion |
| Stop when the model expresses high confidence or positive sentiment | Self-assessed confidence is not calibrated to actual correctness |

A `max_iterations` cap is still good practice — but only as a **backstop** against runaway loops (e.g., a tool that keeps returning errors the model keeps retrying), never as the primary completion criterion. The primary criterion is always `stop_reason`.

```python
MAX_ITERATIONS = 25  # backstop, not the completion signal

for i in range(MAX_ITERATIONS):
    response = client.messages.create(...)
    if response.stop_reason == "end_turn":
        return response
    if response.stop_reason == "tool_use":
        # execute + append, continue loop
        ...
# only reached if the backstop tripped — treat as an error condition, not success
raise RuntimeError("Loop exceeded max_iterations without end_turn")
```

## AgentDefinition

A subagent (in a hub-and-spoke system, or a Claude Code subagent) is configured with four core fields:

```python
AgentDefinition(
    name="refund_processor",
    description="Handles refund requests: validates eligibility, checks order history, and processes approved refunds up to policy limits.",
    system_prompt="""You are a refund-processing agent. You only handle refund
requests. Verify order eligibility against the return policy before taking
action. Do not process refunds for orders older than 90 days or for
non-refundable categories.""",
    allowed_tools=["get_order", "check_return_policy", "process_refund"],
)
```

| Field | Purpose |
|---|---|
| `name` | Unique identifier used for routing/logging |
| `description` | **Used by coordinators to decide whether to delegate to this agent.** This is not documentation — it's the input a routing model reads to choose between subagents, so it must precisely describe scope and boundaries |
| `system_prompt` | Role, constraints, and behavioral rules for the subagent. Loaded once per subagent invocation — it is not re-negotiated mid-task |
| `allowed_tools` | The tool allowlist — enforces least privilege |

### Least privilege in `allowed_tools`

A well-scoped subagent typically has **4–6 tools**. This isn't an arbitrary number — tool selection reliability degrades as the tool list grows, because the model has to discriminate between more options with overlapping applicability on every turn. Two failure modes follow directly:

- **Over-broad tool lists** reduce selection accuracy. An agent with 20 loosely-related tools will more often pick a plausible-but-wrong one than an agent with 5 tightly-scoped ones.
- **System-prompt wording creates unintended tool associations.** A instruction like "always verify the customer's identity before helping them" can cause the model to call `get_customer` on every single turn — including turns where identity was already verified — because the prompt created a strong, repeated association between "helping" and "verifying." Precise, scoped instructions ("verify identity once per conversation, before the first account-modifying action") avoid this.

```python
# Too broad — invites wrong-tool selection and prompt/tool crosstalk
allowed_tools=["get_customer", "get_order", "get_order_history", "get_invoice",
               "get_shipping_status", "update_customer", "update_order",
               "process_refund", "process_exchange", "send_email",
               "create_ticket", "escalate_ticket", "search_kb", "get_product"]

# Scoped to the agent's actual job
allowed_tools=["get_order", "check_return_policy", "process_refund"]
```

## Hub-and-Spoke Orchestration

The dominant multi-agent topology is **hub-and-spoke** (a star topology): one coordinator at the center, multiple specialized subagents at the spokes, with no direct spoke-to-spoke edges.

```
                 ┌───────────────┐
                 │  Coordinator   │  ← sole interface to the user
                 └───────┬───────┘
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
 │  Subagent A  │  │  Subagent B  │  │  Subagent C  │
 └─────────────┘  └─────────────┘  └─────────────┘
```

**Coordinator responsibilities:**
- Decompose the incoming request into subtasks
- Select which subagent(s) handle each subtask (using each subagent's `description`)
- Delegate work via the `Task` tool (Claude Code UI now calls this the `Agent` tool; the SDK and most written documentation still refer to it as `Task` — expect either term). The coordinator's own `allowed_tools`/`allowedTools` **must include `Task`**, or it has no mechanism to spawn subagents at all
- Aggregate subagent results into a coherent response
- Handle errors surfaced by subagents
- Track overall task/conversation state
- Serve as the **sole user-facing interface** — the user never talks to a subagent directly

### Isolation is the defining constraint

Subagents do **not** inherit the coordinator's conversation history. Each subagent invocation starts with a blank context containing only what the coordinator explicitly put in the `Task` prompt. There is no shared memory between subagents, and no subagent can message another subagent directly — every piece of inter-agent communication is mediated by the coordinator.

This means **prompt design for delegation is the highest-leverage skill in hub-and-spoke systems.** A vague delegation prompt produces a vague result, because the subagent literally has no other context to draw on.

```
BAD Task prompt:
  "Analyze the document."

GOOD Task prompt:
  "Analyze the following support ticket for refund eligibility.

   Ticket text: <full ticket text>
   Customer order history: <retrieved order records>
   Applicable return policy: <policy section 4.2, full text>

   Determine: (1) is this order within the 90-day return window,
   (2) is the item category refundable per policy, (3) has this
   customer already received a refund on this order.

   Output as JSON: {eligible: bool, reason: string, order_id: string}.

   If order history is missing or ambiguous, do not guess — return
   eligible: false with reason: 'insufficient data' rather than assuming
   eligibility."
```

A well-formed `Task` prompt specifies:

- **Explicit goal** — what decision or artifact is being produced, not just a topic
- **Full data context** — every fact the subagent needs, inlined (the subagent cannot go fetch what the coordinator already knows)
- **Output format** — a schema or structure the coordinator can parse deterministically
- **Edge-case handling** — what to do when data is missing, ambiguous, or contradictory
- **Quality criteria** — what "good" looks like, so the subagent doesn't have to infer it

### Parallel delegation

Multiple `Task` calls issued in a single coordinator response run **in parallel** — the subagents execute concurrently, and the coordinator receives all results before proceeding. This is the primary lever for latency reduction in a hub-and-spoke system: independent subtasks (e.g., "check inventory" and "check customer credit history") should be dispatched together rather than sequentially, as long as neither depends on the other's output.

```python
# Two independent checks — dispatch both in one turn, not one after the other
Task(agent="inventory_checker", prompt="Check stock for SKU-4471...")
Task(agent="credit_checker", prompt="Check credit standing for customer C-9910...")
```

### Dynamic delegation and iterative refinement

A coordinator should not blindly run every subagent on every request. Three related skills separate a robust orchestrator from a naive pipeline:

- **Dynamic selection** — analyze the request and invoke only the subagents it actually needs, rather than always routing through the full pipeline. A simple factual lookup shouldn't wake the entire fleet.
- **Scope partitioning** — when fanning out, assign each subagent a *distinct* slice (different subtopics or source types) so their work doesn't overlap and duplicate effort.
- **Iterative refinement loops** — after synthesis, the coordinator evaluates the result for **coverage gaps**, re-delegates targeted follow-up queries to the search/analysis subagents, and re-invokes synthesis — repeating until coverage is sufficient. A single decomposition pass often misses whole sub-areas: the classic failure is decomposing "creative industries" into only visual-arts subtasks (digital art, graphic design, photography) and never covering music, writing, or film, while every subagent still reports success on the narrow task it was actually given.

Routing all subagent communication back through the coordinator is what makes this possible: the coordinator is the single point with the **observability** to notice a gap, apply consistent error handling, and control what information flows where.

## Session state, resumption, and forking

Agent work often spans multiple sessions, and how you resume matters for reliability.

- **`--resume <session-name>`** continues a specific named prior conversation, reloading its history so the agent picks up where it left off. Name investigation sessions deliberately so you can return to the right one later.
- **`fork_session`** branches from a shared analysis baseline into independent lines of work — e.g., exploring two refactoring or testing strategies from the same codebase analysis without either branch's context contaminating the other.
- **Resume vs. start fresh.** Resuming is right when the prior context is *mostly still valid*. When the prior tool results are **stale** — files have changed since they were captured — starting a new session seeded with a compact structured summary is more reliable than resuming on top of outdated results the model may still treat as current.
- **Tell a resumed session what changed.** If files were modified after the session's analysis, explicitly inform the agent of the specific changes so it re-analyzes just those, rather than trusting stale reads or being forced to re-explore the whole codebase.

## Hooks: Deterministic Enforcement

Prompt instructions are **probabilistic** — a well-written system prompt rule is followed *most* of the time by a capable model, but it always carries a **non-zero failure rate**, which is not good enough for anything where being wrong has real consequences. **Hooks** intercept tool calls at defined lifecycle points and enforce rules with code, giving **100% deterministic** compliance regardless of what the model decided to do.

| | Prompt instructions | Hooks |
|---|---|---|
| Enforcement | Probabilistic (non-zero failure rate) | Deterministic (100%) |
| Where it lives | System prompt text | Application code, outside the model's control |
| Can the model talk its way around it | Yes, in principle (edge cases, adversarial input, drift) | No — the hook runs regardless of model reasoning |
| Best for | Style, tone, preferences, soft guidance | Financial limits, legal/compliance rules, safety-critical actions |
| Failure mode if skipped | Inconsistent behavior, occasional rule violations | N/A — it isn't optional |

**`PreToolUse`** runs before a tool call executes. It can inspect the proposed call and **block or redirect** it:

```python
@hook("PreToolUse")
def enforce_refund_limit(tool_call):
    if tool_call.name == "process_refund" and tool_call.args["amount"] > 500:
        return redirect_to_escalation(tool_call)  # blocked; routed to a human/queue instead
    return allow(tool_call)
```

**`PostToolUse`** runs after a tool call returns, before the result is appended to history. It can **normalize or trim** the result before the model ever sees it:

```python
@hook("PostToolUse")
def normalize_dates(tool_result):
    # e.g. convert a raw Unix timestamp from the API into ISO 8601
    # before the model reasons over it
    return normalized_result
```

**The governing rule:** if a mistake here is financial, legal, or safety-critical, put a hook in front of it. If it's a matter of preference, tone, or style, a prompt instruction is sufficient and a hook would be overkill. A system prompt saying "never approve refunds over $500 without manager approval" is good hygiene, but it is not a control — a `PreToolUse` hook that mechanically blocks the `process_refund` call is the control.

## Task Decomposition Strategies

There are two broad strategies for breaking a large task into subtasks, and picking the wrong one for the situation is a common design mistake.

### Fixed pipeline (prompt chaining)

A predetermined, ordered sequence of steps, each with a clear input and output, run in a fixed order every time:

```
Extract metadata → Extract structured data → Validate → Enrich → Output
```

Use this when the task shape is known in advance and repeatable. Advantages: predictable, easy to test each stage in isolation, reproducible across runs, and easy to reason about failure (you know exactly which stage broke).

**Multi-pass code review** is the canonical example: rather than handing one subagent the entire diff and every file at once, split into passes —

```
Pass 1 (per file): review each changed file independently for local issues
                    (style, obvious bugs, missing null checks)
Pass 2 (cross-file): review the changes as a whole for integration issues
                    (does file A's new function signature match how file B calls it?)
```

This avoids **attention dilution**: a single giant prompt containing every file competes for the model's attention across all of it simultaneously, and subtle issues get missed. A fixed two-pass pipeline forces focused attention within each pass, then a dedicated pass for the cross-cutting concern.

### Dynamic (adaptive) decomposition

The subtask structure is not known in advance — it emerges from what earlier steps discover. Each step's results determine what the next step should even be.

```
Investigate why production error rate spiked
  → step 1 result: errors cluster in the payment service
    → step 2 (now scoped based on step 1): check recent payment service deploys
      → step 2 result: a config change 3 hours ago
        → step 3 (now scoped based on step 2): diff the config change against
          the previous version and check for a causal link
```

Use this for open-ended investigation, debugging, or research tasks where the scope genuinely cannot be predetermined — a fixed pipeline would either be too rigid (forcing steps that turn out to be irrelevant) or would need to enumerate every possible branch in advance, which defeats the purpose.

| | Fixed pipeline | Dynamic decomposition |
|---|---|---|
| Step order | Predetermined | Emerges during execution |
| Best for | Repeatable, well-understood tasks | Open-ended investigation |
| Reproducibility | High — same steps every run | Lower — path depends on intermediate findings |
| Failure diagnosis | Easy (know which fixed stage failed) | Harder (path itself may be the issue) |

## Error Handling in Multi-Agent Systems

Errors in a multi-agent system need to be categorized, because the correct response differs sharply by category — treating every error identically (e.g., always retry, or always propagate) is itself the anti-pattern.

| Category | Example | Retryable? | Correct action |
|---|---|---|---|
| **Transient** | Timeout, HTTP 503, rate limit | Yes | Retry with exponential backoff |
| **Validation** | Malformed or missing input | No | Fix the input; retrying the same bad input blindly will fail again |
| **Business** | Policy violation, ineligible request | No | Explain why, propose an alternative path |
| **Permission** | Access denied, insufficient scope | No | Escalate — the subagent cannot resolve this itself |

### Local recovery before propagation

A subagent should attempt **local recovery first** — typically 1–2 retries for transient failures, with backoff — before surfacing anything to the coordinator. Only errors the subagent genuinely cannot resolve on its own should propagate upward. This keeps the coordinator from being flooded with noise it can't do anything about, and keeps recoverable blips from turning into workflow-level failures.

```python
def call_with_local_recovery(tool_fn, *args, max_retries=2):
    for attempt in range(max_retries + 1):
        try:
            return tool_fn(*args)
        except TransientError as e:
            if attempt == max_retries:
                # exhausted local recovery — now it's the coordinator's problem
                return structured_error(e, category="transient", attempts=attempt + 1)
            backoff_sleep(attempt)
        except (ValidationError, PermissionError) as e:
            # not retryable locally — propagate immediately with category
            return structured_error(e, category=type(e).__name__)
```

### Structured error responses

An error returned to the coordinator should never be a bare string. It should be structured so the coordinator can make an informed decision about what to do next:

```json
{
  "isError": true,
  "errorCategory": "transient",
  "attempted_query": "search: refund policy electronics category",
  "partial_results": [
    { "source": "policy_db", "section": "4.1", "status": "retrieved" },
    { "source": "policy_db", "section": "4.2", "status": "timeout" }
  ],
  "completion_rate": 0.5,
  "failed_sections": ["4.2"]
}
```

Key fields worth calling out:

- **`isError` + `errorCategory`** — lets the coordinator branch on category (retry vs. escalate vs. explain) rather than string-matching on error text
- **`attempted_query`** — preserves what was actually tried, so the coordinator (or a human) can distinguish "this genuinely returned nothing" from "this failed before it could search"
- **`partial_results`** — a subagent that got 3 of 5 things done should return the 3, not discard them because the task as a whole didn't fully succeed
- **`completion_rate` / `failed_sections`** — coverage annotations that let the coordinator (or downstream consumer) know exactly how much to trust the result and what's missing

### Anti-patterns

- **Generic "operation failed"** — gives the coordinator nothing to act on; it can't distinguish a transient blip from a permission problem from a malformed request
- **Silent suppression** — treating an empty result as a successful "no data found" when it was actually a failed call. This is the most dangerous anti-pattern because it looks identical to success downstream
- **Aborting the entire workflow on one subagent's failure** — if 4 of 5 parallel subtasks succeeded, the workflow should generally return the 4 with an annotated gap, not throw away all of it
- **Infinite retries** — a subagent that keeps retrying a transient error forever without a cap turns a blip into a hang
- **Hiding errors from the coordinator** — a subagent that catches an exception and returns a plausible-looking but fabricated success response denies the coordinator the chance to route around the problem

### Escalation to humans

Related but distinct from error handling: some situations should route to a human regardless of whether anything technically "failed." Legitimate triggers include an explicit user request ("get me a manager"), a genuine policy gap (the situation isn't covered by any rule the agent has), repeated failed attempts at automated resolution, or a financial operation above a defined threshold (this is the same class of concern a `PreToolUse` hook enforces deterministically). Sentiment analysis, the model's self-rated confidence, and generic classifiers are **not** reliable escalation triggers — they're proxies with the same weaknesses as using them for loop-termination.

## Exam focus

- The only reliable loop-termination signal is `stop_reason == "end_turn"`. `max_iterations` is a valid backstop, never the primary stop condition; parsing assistant text for completion words is always wrong.
- The model is stateless — the full message history (system prompt + every prior turn + every tool result) is resent on every single API call.
- `AgentDefinition.description` isn't documentation — it's the field a coordinator's routing logic reads to decide delegation, so it must precisely state scope and boundaries.
- Keep `allowed_tools` to ~4–6 per subagent. Larger tool lists measurably degrade tool-selection reliability; imprecise system-prompt wording ("always verify the customer") can also create unwanted tool-call habits.
- Hub-and-spoke: the coordinator is the sole user-facing interface, owns decomposition/delegation/aggregation/error-handling, and is the only path for inter-agent communication — subagents never talk to each other directly.
- Subagents have **isolated context** — no inherited history, no shared memory. A vague `Task` prompt ("Analyze the document") produces a vague result because there is nothing else for the subagent to draw on; a good prompt inlines full data context, states the goal, specifies output format, and covers edge cases.
- Multiple `Task`/`Agent` calls issued in the same coordinator turn run in **parallel** — dispatch independent subtasks together, not sequentially.
- A coordinator must have `Task` in its own `allowedTools` to spawn subagents; it should select subagents dynamically (not always the full pipeline), partition scope to avoid duplicate work, and run **iterative refinement loops** — re-delegating and re-synthesizing until coverage gaps close (the "only visual arts, never music/film" failure is too-narrow decomposition, not a broken subagent).
- Session control: `--resume <name>` continues a named session; `fork_session` branches from a shared baseline. Prefer a fresh session seeded with a structured summary over resuming on **stale** tool results, and tell a resumed session which files changed so it re-analyzes only those.
- Hooks are deterministic (100%); prompts are probabilistic (a non-zero failure rate, however well-written). Route financial, legal, and safety-critical rules through `PreToolUse`/`PostToolUse` hooks, not prompt instructions. `PreToolUse` can block/redirect a call before it executes; `PostToolUse` can normalize/trim a result before the model sees it.
- Fixed pipelines suit predictable, repeatable, ordered work (e.g., per-file then cross-file code review, which avoids attention dilution); dynamic decomposition suits open-ended tasks where each step's scope depends on the previous step's findings.
- Error categories dictate response: transient → retry with backoff; validation → fix input, don't blindly retry; business → explain and propose an alternative; permission → escalate. Attempt 1–2 local retries inside the subagent before propagating to the coordinator.
- Structured error responses (`isError`, `errorCategory`, `attempted_query`, `partial_results`, `completion_rate`, `failed_sections`) let the coordinator make an informed recovery decision — a bare "operation failed" string does not.
- Anti-patterns to flag on sight: generic error strings, silently treating empty results as success, aborting an entire workflow because one of several subtasks failed, unbounded retries, and using sentiment/self-confidence as an escalation or stop-loop trigger.
