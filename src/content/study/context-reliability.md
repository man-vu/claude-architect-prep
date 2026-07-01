Context management is the discipline of deciding what the model sees on every single request, and reliability is the discipline of knowing when the model's output can be trusted without a human checking it. Together they cover 15% of the Foundations exam and show up in almost every scenario question about long-running agents.

## The model is stateless

The Claude API has no memory between calls. Every request is independent — there is no server-side session, no hidden conversation state, nothing the model "remembers" from a prior turn. To continue a conversation, the client must resend the **entire** message history on every request: system prompt, every prior user/assistant turn, every tool call, and every tool result.

```json
{
  "model": "claude-opus-4-8",
  "system": "You are a support agent...",
  "messages": [
    { "role": "user", "content": "My order hasn't shipped." },
    { "role": "assistant", "content": [{ "type": "tool_use", "name": "lookup_order", "input": { "order_id": "ORD-67890" } }] },
    { "role": "user", "content": [{ "type": "tool_result", "tool_use_id": "toolu_01", "content": "{...order json...}" }] },
    { "role": "assistant", "content": "I see your order ORD-67890 is delayed..." }
  ]
}
```

This has two consequences that drive everything else in this domain:

1. **Cost and latency scale with history length.** Every turn re-sends and re-processes everything that came before, which is why prompt caching exists (see the API domain) and why unbounded history growth is a real production problem, not a theoretical one.
2. **"Memory" is an application-layer illusion.** Anything that looks like persistent memory — a case file, a user profile, a running summary — is something the *application* re-injects into the prompt on each call. The model isn't remembering; the harness is re-telling it.

### What fills the context window

The context window is a fixed token budget shared by everything sent in a single request:

| Component | Notes |
|---|---|
| System prompt | Instructions, persona, policy — sent every turn |
| Tool definitions | Full JSON schema for every tool the model *might* call, whether or not it's used this turn |
| Message history | Every user/assistant turn so far |
| Tool results | Raw API/DB responses returned into the conversation — often the largest and least controlled contributor |

Tool results are the usual culprit for context bloat: a single API call can return a multi-KB JSON blob when only two fields matter, and if that blob is never trimmed it sits in every subsequent request for the rest of the conversation.

### `stop_reason` recap

Every response carries a `stop_reason` telling the caller why generation stopped: `end_turn` (natural completion), `max_tokens` (truncated — the response was cut off mid-generation, not finished), `stop_sequence`, `tool_use` (the model wants to call a tool and is pausing for the result), and `pause_turn` (long-running server-side tool use, e.g. web search, paused for continuation). Treating a `max_tokens` cutoff as a complete answer is a common and avoidable reliability bug — the caller must check `stop_reason` before trusting that a response is finished.

## Failure modes of a growing context

### Lost-in-the-middle

Models process information at the start and end of a long input more reliably than information buried in the middle. This isn't a training bug to route around with a clever prompt — it's a structural property of long-context attention, and it means **where** you place a fact matters as much as **whether** you include it. A critical constraint mentioned once, on line 400 of a 900-line tool result, is at real risk of being ignored even though it's technically "in context."

### Tool-result accumulation

Left unmanaged, tool results are the fastest-growing part of a long conversation. A discovery agent that calls a search API ten times and pastes every raw response into history can burn most of the context budget on data that was only ever needed for a moment. Left unchecked this both wastes budget and actively worsens lost-in-the-middle risk, since it pushes earlier, still-relevant facts further into the "middle."

### Summarization degrades precision

When history is compacted to save space (either by the model or by a summarization step in the harness), qualitative narrative survives well but **numeric precision does not**. An exact figure like "42.3%" or a specific date like "2024-06-15" tends to drift into "about 42%" or "sometime last year" after a round or two of summarization. This is dangerous specifically because the degraded value still *looks* confident and specific enough to be relied on — the vagueness isn't flagged, it's just quietly introduced. Any workflow that depends on exact numbers, IDs, or dates surviving a long session needs to protect them from ever entering the summarized-and-compressed part of history at all (see fact-extraction blocks, below).

## Context management techniques

### 1. Fact-extraction / persistent "case facts" block

The core fix for summarization-driven precision loss: pull the handful of facts that must never drift into a small, structured block that is **not** part of the summarized history — it's regenerated or carried forward verbatim and injected into every prompt regardless of how much the surrounding conversation gets compacted.

```
=== CASE FACTS (updated whenever a new fact appears; never summarized) ===
Customer ID: CUST-12345
Order ID: ORD-67890
Order Date: 2025-01-15
Refund requested: $89.99
Policy reference: RETURNS-14D
===
```

Because this block lives outside the summarization path, "$89.99" stays "$89.99" turn 50 just as much as turn 1 — it never gets a chance to become "about $90."

### 2. Tool-result trimming

A `PostToolUse` hook (see the Development Lifecycle domain for the hook mechanics) intercepts a tool's raw output before it's added to context and keeps only the fields that matter, discarding the rest.

```python
# PostToolUse hook: trim a verbose order-lookup response
def trim_order_lookup(tool_result: dict) -> dict:
    return {
        "order_id": tool_result["order_id"],
        "status": tool_result["status"],
        "total": tool_result["total"],
        "items": [i["sku"] for i in tool_result["items"]],
        # dropped: internal warehouse routing, carrier metadata,
        # audit trail, 40+ other fields the agent never needs
    }
```

This directly targets tool-result accumulation: the raw API response might be 5 KB; the trimmed version the model actually sees might be 200 bytes, and that saving compounds every subsequent turn because the trimmed result — not the raw one — is what gets resent.

### 3. Position-aware placement

Given lost-in-the-middle, deliberately structure what you inject rather than dumping it in encounter order:

- **Top** — key findings / the answer so far, so it survives even if nothing else is read carefully.
- **Middle** — full supporting detail, evidence, raw data.
- **Bottom** — action items / next steps, since recency also aids retrieval.

```
## KEY FINDING
Root cause: expired API credential, rotated 2025-06-30. Fix confirmed working.

## SUPPORTING DETAIL
[...longer investigation log, logs, stack traces...]

## NEXT ACTIONS
1. Notify customer fix is deployed.
2. Monitor error rate for 24h.
```

This counters lost-in-the-middle by construction: the parts most likely to be skimmed or missed (the middle) are exactly the parts that matter least for the immediate decision.

### 4. Scratchpad files for cross-session persistence

For work that spans sessions or exceeds a single context window, write key findings to a file on disk rather than relying on them staying in the live conversation. A fresh session (or subagent) can then read the scratchpad instead of needing the full prior transcript re-sent — trading a large amount of conversation history for a small, targeted file read.

### 5. Subagent delegation to isolate verbose discovery

Route open-ended, output-heavy exploration (log grepping, multi-step web research, broad code search) to a subagent rather than doing it inline. The subagent burns its *own* context budget on the raw, noisy discovery process and returns only a distilled summary to the parent. The parent's context — and the eventual user-facing conversation — never sees the raw dumps at all, which sidesteps both context bloat and lost-in-the-middle simultaneously.

```
Parent: "Find why the nightly job failed last night."
  → Subagent: greps 3 log files, checks 2 API statuses, reads 400 lines of stack trace
  → Subagent returns: "Root cause: DB connection pool exhausted at 02:14 UTC after
     a deploy bumped max_connections down. Fix: revert config, restart pool."
Parent context gains: ~2 sentences, not 400 lines.
```

### 6. Structured state persistence for crash recovery

For long-running or multi-agent workflows, persist state to a **known location** on disk rather than only in memory — a per-agent state file plus a manifest that indexes all of them.

```json
// state/agent-3.json
{
  "status": "in_progress",
  "phase": "data_extraction",
  "completed_phases": ["discovery", "planning"],
  "key_findings": ["Source API rate-limits at 100 req/min"],
  "coverage_gaps": ["No data for region EU-WEST after 2025-06-20"]
}
```

```json
// state/manifest.json
{ "agents": ["agent-1", "agent-2", "agent-3"], "updated_at": "2025-06-30T14:02:00Z" }
```

If the process crashes or the session is interrupted, a new agent can read the manifest, load each agent's state file, and resume from `completed_phases` instead of restarting the whole workflow — and the `coverage_gaps` field is what later feeds honest, caveated reporting instead of silently pretending the work was complete.

## Escalation and human-in-the-loop

Deciding *when* to hand off to a human is itself a reliability problem: the signals that feel intuitive (tone, self-reported confidence) are frequently the wrong ones to trust.

### Reliable triggers

| Trigger | Why it's reliable |
|---|---|
| Explicit human request | Unambiguous customer intent — escalate immediately, no further attempts |
| Policy is silent on the request | The agent has no authorized action to take; guessing is worse than asking |
| No progress after N attempts | Concrete, measurable evidence the current approach isn't working |
| Financial op over a policy threshold | Objective, pre-agreed dollar/risk boundary, not a judgment call |
| Multiple lookup matches | Ambiguity should be resolved with a clarifying question first, and only escalated if the clarifier itself fails |

### Unreliable triggers

- **Sentiment analysis.** Customer mood does not correlate with case complexity — a furious customer can have a trivial one-line fix, and a perfectly calm one can be sitting on a genuinely unresolvable edge case.
- **The model's self-rated confidence.** A model can be confidently wrong; self-reported confidence is not a calibrated probability and shouldn't be treated as one.
- **An automatic complexity classifier.** Without a labeled training set matched to your actual case distribution, a complexity classifier is guessing too — it just hides that guessing behind a number that looks objective.

None of these track the thing you actually care about (is this case solvable by policy, right now, by this agent), so building escalation logic around them produces escalations that don't correlate with real need.

### Escalation patterns

- **Immediate** — triggered by an explicit human request. No attempt to resolve first; escalate on the spot.
- **Attempt-then-escalate** — for a plausibly solvable issue: try the fix, verify it, and only escalate if it doesn't resolve the case.
- **Acknowledge → offer a concrete resolution → escalate only on reiterated insistence** — for frustration or pushback: acknowledge the issue, propose a specific fix, and escalate only if the customer insists *again* after that offer — not at the first sign of annoyance. Escalating at the first hint of frustration both overloads human queues and trains customers that frustration is the fastest path to a human, which is a bad incentive to build into a support system.

### Structured, self-contained handoff

A human picking up an escalation should be able to act **without reading the full transcript**. That means the handoff itself is a structured payload, not "here's the conversation, good luck":

```json
{
  "customer_id": "CUST-12345",
  "customer_name": "Jordan Lee",
  "order_id": "ORD-67890",
  "issue_summary": "Refund requested for damaged item outside the 14-day policy window.",
  "actions_taken": ["Verified order and delivery date", "Checked return policy RETURNS-14D", "Offered store credit as an alternative"],
  "root_cause": "Item arrived damaged; customer reported it 21 days post-delivery, 7 days past policy window.",
  "recommended_action": "Approve one-time policy exception given documented shipping damage.",
  "escalation_reason": "Refund exceeds automated approval threshold and requires policy exception."
}
```

Every field here answers a question the human would otherwise have to reconstruct by reading the transcript: what happened, what's already been tried, why it wasn't enough, and what to do next.

### Confidence calibration and stratified sampling

Aggregate accuracy hides pattern-specific failure. A system reporting **97% overall accuracy** can still be failing **40% of the time on one rare document type or edge case** if that type is a small enough share of the total to not move the aggregate number. This is why blended accuracy metrics are a weak signal on their own for reliability decisions.

The fix is **stratified sampling**: audit accuracy by segment (document type, field, customer tier, language) rather than only in aggregate, so a hidden pocket of failure surfaces instead of being averaged away. Combined with **field-level confidence scores**, this lets you set per-segment thresholds for what gets auto-processed versus routed to human review — a segment with historically weak performance gets a stricter threshold even if the overall system-wide number looks healthy.

## Preserving provenance

When an agent synthesizes findings from multiple sources (research, RAG, multi-agent aggregation), losing the link back to *where* a claim came from is a silent reliability failure — the output can look equally confident whether it's well-sourced or fabricated.

### Claim-to-source mapping

Preserve attribution as structured data alongside the claim, not just as a footnote in prose:

```json
{
  "claim": "The AI music generation market is estimated at $3.2B.",
  "source_url": "https://example.com/market-report-2024",
  "source_name": "Example Market Research",
  "publication_date": "2024-06-15",
  "confidence": 0.9
}
```

`source_url`, `source_name`, `publication_date`, and `confidence` together let a downstream consumer (human or agent) judge how much weight to put on the claim without re-doing the research.

### Conflicting data: preserve, don't average

When two sources disagree, do **not** average the numbers or silently pick one — that destroys information and can produce a value neither source actually reported. Instead, preserve both values with their attribution and flag the conflict explicitly:

```json
{
  "metric": "market_size_usd_billions",
  "values": [
    { "value": 3.2, "source_name": "Example Market Research", "publication_date": "2024-06-15" },
    { "value": 4.8, "source_name": "Other Analyst Firm", "publication_date": "2025-01-10" }
  ],
  "conflict_detected": true
}
```

A `conflict_detected` flag pushes the decision about which value (or both) to trust to whoever has more context — the coordinator agent or the end user — instead of the aggregation step making that call silently.

### Dates matter for interpretation

Preserving `publication_date` isn't just bookkeeping — it changes what "conflicting" values actually mean. A 2023 source reporting 10% and a 2024 source reporting 15% for the same metric is very likely **growth over time**, not a contradiction, but only if the dates are preserved long enough to be checked. Strip the dates during aggregation and the same two numbers look like an unexplained inconsistency instead of a trend.

### Render by content type

Match the output format to the kind of information: tables for numeric/comparable data, prose for narrative explanation, lists for action items. Forcing everything into prose buries numbers exactly where lost-in-the-middle and summarization drift do the most damage; forcing narrative into a table strips the nuance a reader needs to interpret it correctly.

## Exam focus

- Know that the API is **stateless** — the full history (system prompt + messages + tool defs + tool results) is resent on every call, and that "memory" is an application-layer illusion built on top of this.
- Be able to identify the three core context failure modes by name: **lost-in-the-middle**, **tool-result accumulation**, and **summarization-driven precision loss** (numbers/dates going vague).
- Recognize the six management techniques and what each one specifically counters: case-facts block (precision loss), trimming hooks (tool-result bloat), position-aware placement (lost-in-the-middle), scratchpads (cross-session persistence), subagent delegation (isolating verbose discovery), structured state + manifest (crash recovery).
- Be able to separate **reliable** escalation triggers (explicit request, silent policy, no progress after N attempts, financial threshold, multiple matches) from **unreliable** ones (sentiment, self-rated confidence, complexity classifiers) — expect scenario questions that present a plausible-sounding but unreliable trigger as a distractor.
- Know the three escalation patterns (immediate / attempt-then-escalate / acknowledge-offer-escalate-on-reiteration) and that escalating on the *first* sign of frustration is the wrong pattern.
- Know what a self-contained handoff must include so a human can act without reading the transcript: customer/order facts, `actions_taken`, `root_cause`, `recommended_action`, `escalation_reason`.
- Remember that aggregate accuracy can hide segment-specific failure (the 97%-overall/40%-on-one-type scenario) and that stratified sampling — not a higher overall threshold — is the fix.
- On provenance questions: conflicting data is preserved with attribution and a `conflict_detected` flag, never averaged or silently resolved; `publication_date` is what distinguishes real contradictions from temporal trends.
