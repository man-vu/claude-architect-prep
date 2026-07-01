Prompt engineering for production agents is less about clever wording and more about giving Claude *evidence* — concrete examples, explicit success criteria, and a feedback loop it can act on. This page covers few-shot prompting, chaining, validation/retry loops, self-correction, structured output, and the Message Batches API.

## Few-shot prompting

A vague instruction like "be more precise" or "be conservative" can be interpreted many different ways. An example unambiguously shows the expected format *and* the decision logic behind it — that's why 2–4 targeted examples usually outperform another paragraph of description. Few-shot is especially strong when inputs are informal or highly varied (free-text tickets, hand-written measurements, mixed document formats) because a rule can't enumerate every variant, but a handful of representative examples let the model generalize.

Keep the example count small and targeted (2–4). More examples add tokens without adding new decision boundaries; pick examples that each teach a *different* edge case rather than restating the same one.

Five example types that consistently earn their tokens:

**1. Ambiguous tool selection.** Show the reasoning, not just the call:

```
User: "My order is broken, it says delivered but I don't have it."
→ get_customer_context → lookup_order (routine investigation)

User: "Get me a manager right now."
→ escalate_to_human immediately (no lookup first — explicit escalation request)
```

**2. Output formatting.** A complete worked example beats a schema description alone:

```json
{
  "location": "src/auth/session.ts:142",
  "issue": "Session token compared with == instead of ===",
  "severity": "HIGH",
  "suggested_fix": "Use strict equality to avoid type-coercion bypass"
}
```

**3. Acceptable vs. problematic code.** Pair a flagged case with a clean one so the model learns the boundary, not just the bad pattern:

```
// Flag:
if (session.token == true) { ... }        // loose equality, coercion risk

// Do not flag:
if (session.token === true) { ... }        // strict equality
```

**4. Extraction across document formats.** The same fact appears differently depending on source shape:

```
Inline citation:  "...as shown in prior work (Smith, 2020)."
Bibliography entry: Smith, J. (2020). Title. Journal, 12(3), 45-67.
```
Both should resolve to the same normalized `{"author": "Smith", "year": 2020}` record — the example teaches the model to extract past the surface formatting.

**5. Informal measurements.** Free-text quantities need a conversion example, not just a unit list:

```
"two handfuls of rice" → {"amount": 100, "unit": "g"}   (~50g per handful)
```

## Explicit success criteria

Replace vague qualifiers ("be conservative," "flag important issues") with an enumerated allow/deny list. Ambiguity in the instruction becomes ambiguity — and drift — in the output.

```
Flag ONLY if:
  1. The issue causes a runtime failure or incorrect result for some input.
  2. The issue is a security vulnerability (injection, auth bypass, secret leak).
  3. The issue silently corrupts data or state.

Do NOT flag:
  - Style preferences (naming, formatting, import order)
  - Missing tests, unless the change is untestable as written
  - Pre-existing issues outside the diff
```

Pairing criteria with a severity rubric removes the remaining interpretation gap — each level gets a concrete example, not just a label:

| Severity | Definition | Example |
|---|---|---|
| `CRITICAL` | Runtime failure for users | Null pointer / unhandled exception during payment |
| `HIGH` | Security vulnerability | SQL injection, XSS, missing authorization check |
| `MEDIUM` | Logic bug, no immediate outage | Wrong sort order, off-by-one error |
| `LOW` | Code quality only | Duplication, suboptimal algorithm, naming |

Explicit criteria plus a rubric like this measurably reduces both drift (the model inventing its own bar over a long run) and false positives (flagging style as if it were a defect).

## Prompt chaining (sequential focused steps)

Chaining breaks a task into a fixed sequence of focused prompts, each with a narrow job, rather than asking one prompt to do everything at once:

```
Document → metadata extraction → data extraction → validation → enrichment
```

For code review specifically: run a **per-file pass** first (local issues only — each file gets full attention), then a separate **cross-file integration pass** that only looks at how the already-identified pieces interact (data flow between files, contract mismatches, duplicated logic across modules).

Why a single multi-file pass tends to fail:

- **Attention dilution** — the more files and concerns stuffed into one context, the less scrutiny any single line gets.
- **Inconsistent flagging** — the same bug pattern gets caught in file A but missed in file D because the model's internal bar shifts across a long response.
- **Missed obvious bugs** — issues that would be a one-shot catch in isolation get lost in the volume.

Chaining is the right fit when the task is **predictable and repeatable** — the steps and their order are known in advance regardless of input (e.g., extract → validate → enrich, every time). When the task is **open-ended** — the scope only becomes clear once you've seen intermediate results (e.g., an investigation that branches based on what the first query turns up) — use dynamic decomposition instead: let the model (or an orchestrator) generate the next subtask from the current findings rather than following a fixed pipeline.

## Validation loops and retry-with-feedback

The core loop: **extract → validate → retry with feedback on failure.**

1. **Extract** structured data from the source document.
2. **Validate** against a JSON Schema (or a Pydantic model) and business rules.
3. **On failure**, re-prompt — but not with a bare "try again." Include:
   - the **original source document**
   - the **previous (incorrect) extraction**
   - the **specific error**, stated concretely

```
Field 'total' = 150, but sum(line_items) = 145. Re-check the line items
and the total against the source document.
```

A specific error message lets the model localize the mistake instead of re-deriving the whole extraction from scratch.

**When retry works:** format/structure violations (wrong type, missing required field), and arithmetic/consistency errors (a total that doesn't match its parts) — these are checkable against the document and the model can re-derive the correct value.

**When retry fails:** information that is simply **absent from the source** (no amount of re-prompting invents a number that was never in the document), and **hallucinations** the model is confident about — repeating "check again" doesn't help if the model isn't aware it fabricated the value in the first place. In both cases, the fix is to surface the field as `null`/`unclear` and route to a human, not to keep retrying.

### Pydantic's three roles in the loop

1. **Structural validation** — types, required fields, enum membership. This is what a plain JSON Schema check gives you for free.
2. **Custom validators for business logic** — rules a schema alone can't express: `sum(line_items) == total`, `end_date > start_date`, cross-field consistency.
3. **Schema generation for `tool_use`** — the same Pydantic model that validates the output can generate the JSON Schema passed to the `tool_use` tool definition, so the validation contract and the generation contract never drift apart.

```python
from pydantic import BaseModel, model_validator

class Invoice(BaseModel):
    stated_total: float
    line_items: list[float]

    @model_validator(mode="after")
    def check_total(self):
        if abs(sum(self.line_items) - self.stated_total) > 0.01:
            raise ValueError(
                f"total={self.stated_total} but sum(line_items)="
                f"{sum(self.line_items)}"
            )
        return self
```

On a `ValidationError`, feed `str(error)` straight back into the retry prompt as the "specific error" — that's the same message a human reviewer would want.

## Self-correction

Rather than validating only after the fact, some errors can be caught *within* a single extraction by asking for two independently derived values instead of one:

```json
{
  "stated_total": 150.00,
  "calculated_total": 145.00,
  "conflict_detected": true
}
```

`stated_total` is read directly off the document; `calculated_total` is derived by summing the line items. If they disagree, `conflict_detected` flips to `true` — the discrepancy surfaces immediately, without a second round trip. This is cheaper than a full retry loop for the specific case of "does the document agree with itself," and it composes with retry-with-feedback: use dual-value extraction for the fields where an internal check is possible, and fall back to validate → retry for cross-document or business-rule errors that require external context.

## Structured output basics

`tool_use` with a JSON Schema is the reliable way to get schema-conformant output — it guarantees valid **syntax** (no malformed JSON, no missing brackets) but not **semantics** (a schema-valid response can still be wrong, incomplete, or hallucinated). Syntax guarantees are a floor, not a substitute for the validation loop above. See the tool-design domain for the full mechanics of `tool_use` and `tool_choice`; the schema-authoring habits worth calling out here:

- **Nullable fields** for information that may genuinely be absent — `{"type": ["string", "null"]}` — rather than forcing the model to fabricate a value to satisfy a required string.
- **`enum` plus an escape hatch** — `"enum": ["bug", "feature", "docs", "unclear", "other"]` — so the model has a legitimate way to say "doesn't fit the categories" instead of guessing the closest one. Pair `"other"` with a free-text `*_detail` field for the specifics.
- **`required` only for fields that are always present.** Marking a sometimes-absent field as required just forces bad data into it; use nullable instead and treat `null` as a real, valid answer.

```json
{
  "category": {
    "type": "string",
    "enum": ["bug", "feature", "docs", "unclear", "other"]
  },
  "category_detail": {
    "type": ["string", "null"],
    "description": "Free-text detail when category = 'other'"
  }
}
```

Normalization rules belong in the prompt, not just the schema — a schema can constrain shape but not, for example, which calendar format a date string uses:

| Type | Rule | Example |
|---|---|---|
| Dates | ISO 8601 (`YYYY-MM-DD`); resolve relative dates to absolute | "next Friday" → `2026-07-10` |
| Currency | Numeric amount + ISO currency code | "five bucks" → `{"amount": 5, "currency": "USD"}` |
| Percentages | Decimal fraction | "half" → `0.5` |

## Message Batches API

The Batches API trades latency for cost: **asynchronous** processing, roughly **50% cheaper** than the synchronous Messages API, with a processing window of **up to 24 hours** (no guarantee of finishing sooner). Each request in a batch carries a `custom_id` that correlates it to its response — since batch responses can arrive out of order and separately from submission, `custom_id` is the only reliable join key. A batch is **single request → single response** per item — there's no multi-turn conversation or tool-use loop within a batch entry; if the workflow needs Claude to call a tool and see the result before responding, that doesn't fit the batch model.

**Use the Batches API for** non-blocking bulk work where nobody is waiting synchronously: overnight report generation, processing 10,000+ documents, weekly audit sweeps.

**Use the synchronous Messages API for** anything blocking or interactive: a pre-merge PR check a developer is waiting on, a chat response, any path where the caller can't proceed until the answer arrives.

**SLA math:** work backward from the deadline. If results are due in 30 hours and the batch can take up to 24 hours to process, the batch must be *submitted* within the first 6 hours of that window — i.e., `submission_deadline = final_deadline - 24h`. Cutting it closer than the 24-hour ceiling risks missing the deadline with no recourse, since the Batches API gives no latency guarantee.

**Partial failure handling:** batches don't fail atomically — some items succeed, some error out. Iterate the results, identify failed entries by their `custom_id`, and re-submit only those as a new (much smaller) batch rather than resubmitting the entire original set.

## The interview pattern

Before committing to an implementation, have Claude ask clarifying questions instead of guessing — surfacing non-obvious design decisions early:

```
Claude: "Before implementing caching for the API, a few questions:
1. Which cache-invalidation strategy do you prefer — TTL or event-based?
2. Is stale data acceptable when the cache is unavailable?
3. Should caching be per-user or global?
4. What is the expected data volume to cache?"
```

**When it's worth it:**
- Unfamiliar domain (fintech, healthcare, legal)
- Tasks with non-obvious implications (cache strategies, failure modes)
- Multiple viable approaches where the best choice depends on context you weren't given

Asking first is cheaper than building the wrong thing and reworking it — and the questions themselves document the assumptions behind the design.

## Exam focus

- Recognize *why* an example works: it encodes both the format and the decision logic a rule can't fully spell out — expect scenario questions where the "best" prompt fix is adding 2–4 examples, not more prose.
- Given a vague criterion ("be conservative," "flag important bugs"), pick the answer that replaces it with an enumerated allow/deny list plus a severity rubric with concrete examples.
- Distinguish prompt chaining (fixed, predictable pipeline) from dynamic decomposition (scope emerges at runtime) — and know *why* single-pass multi-file review underperforms (attention dilution, inconsistent flagging, missed obvious bugs).
- Know the retry-with-feedback recipe cold: original document + previous extraction + specific error — and be able to tell "retry will fix this" (format, arithmetic) from "retry cannot fix this" (data absent from source, confident hallucination).
- Know Pydantic's three jobs: structural validation, custom business-logic validators, and JSON Schema generation for `tool_use`.
- Self-correction via dual-value extraction (`stated_total` / `calculated_total` / `conflict_detected`) catches internal inconsistency without a retry round trip — don't confuse it with the validate-then-retry loop, which handles errors that need external checking.
- `tool_use` guarantees valid JSON syntax, never semantic correctness — a schema-conformant response can still be wrong.
- Batches API: async, ~50% cheaper, up to 24h processing, `custom_id` for correlation, one request → one response (no tool loops), and the SLA math of subtracting the 24h ceiling from the deadline to get the submission window. Pick sync over batch whenever anything is blocking on the result.
