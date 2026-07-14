import type { Question } from "@/domain/types";

export const structuredDataExtraction: Question[] = [
  {
    "id": "structured-data-extraction-01",
    "scenario": "structured-data-extraction",
    "situation": "You are designing the JSON Schema for an invoice-extraction pipeline. The field `purchase_order_number` appears on roughly 60% of vendor invoices; the rest simply don't reference a PO. Early testing shows that when the field is marked `required` with type `\"string\"`, Claude sometimes invents a plausible-looking PO number for invoices that never had one, because the schema gives it no way to say the data isn't there. Which schema change best fixes this?",
    "question": "Which schema change best fixes this?",
    "options": [
      {
        "letter": "A",
        "text": "Keep the field required and typed as `\"string\"`, but instruct Claude in the prompt to write `\"N/A\"` when no PO number is present.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Change the field's type to `[\"string\", \"null\"]` and remove it from the `required` array, so Claude can return `null` when the source document has no PO number.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Replace the field with an enum of `[\"present\", \"absent\"]` and add a separate free-text field for the value.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep the field required but allow an empty string `\"\"` as a valid value to represent a missing PO number.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "A nullable type (`[\"string\", \"null\"]`) combined with dropping the field from `required` gives Claude an explicit, honest way to represent \"this data isn't in the document\" instead of fabricating a value to satisfy the schema. Instructing a placeholder string like `\"N/A\"` or reusing an empty string still forces a fabricated stand-in and is ambiguous to downstream consumers; an enum of presence/absence just recreates the same problem with more indirection.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-02",
    "scenario": "structured-data-extraction",
    "situation": "A document-classification tool extracts a `payment_method` field from receipts. The initial schema uses `\"enum\": [\"credit_card\", \"cash\", \"check\", \"bank_transfer\"]`. In production, about 5% of receipts show payment methods outside this list (e.g., store credit, gift card, cryptocurrency), and Claude is forced to either misclassify them into the closest enum value or fail validation entirely. How should the schema be extended?",
    "question": "How should the schema be extended?",
    "options": [
      {
        "letter": "A",
        "text": "Add every payment method you can think of to the enum list so the set is exhaustive.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Add an `\"other\"` value to the enum plus a companion `payment_method_detail` string field Claude fills in when `\"other\"` is chosen.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Remove the enum constraint entirely and accept any free-text string for `payment_method`.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep the enum as-is and add post-processing that maps unrecognized values to the nearest existing category.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "An `\"other\"` enum value paired with a detail string is extensible: it never blocks extraction on an unanticipated value while still preserving the raw information for later review or reclassification. Trying to enumerate every possibility is a losing battle, dropping the enum loses the benefit of structured categorization, and silently remapping to the nearest category discards real information and hides that a new category exists.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-03",
    "scenario": "structured-data-extraction",
    "situation": "Your extraction pipeline calls Claude with a `tool_use` block whose `input_schema` is strict JSON Schema for a purchase order (line items, unit prices, quantities, `line_total`, `order_total`). Since adopting this, malformed JSON has dropped to zero. However, spot checks still find purchase orders where a `line_total` doesn't equal `unit_price * quantity`, or where a discount value was placed in the wrong line item. What does this tell you about `tool_use` with a JSON Schema?",
    "question": "What does this tell you about `tool_use` with a JSON Schema?",
    "options": [
      {
        "letter": "A",
        "text": "It guarantees syntactic validity of the output but not semantic correctness of the extracted values, so business-logic checks are still needed.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "The schema must be misconfigured, since a correctly defined JSON Schema should also enforce that computed fields are arithmetically consistent.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "`tool_use` schemas only validate top-level fields, so nested line-item arrays need a second, separate tool call to validate.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The model is failing to use the tool correctly and the fix is to lower `temperature` to zero for more deterministic output.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "JSON Schema validation checks structure and types — it cannot know that `line_total` should equal `unit_price * quantity`, or that a discount belongs on a different line. Eliminating syntax errors is a real win, but semantic/business-logic errors require separate validators (e.g., recomputing totals and comparing). Schemas don't do arithmetic checks, the nesting depth isn't the issue, and lowering temperature doesn't address a validation gap that the schema itself can't express.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "structured-data-extraction-04",
    "scenario": "structured-data-extraction",
    "situation": "A validation step rejects an extracted medical-record JSON because `medication_dosage` is a string like `\"see label\"` instead of the required numeric `mg` value. You need to re-prompt Claude to fix the extraction. Which retry strategy is most effective?",
    "question": "Which retry strategy is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Re-send only the validation error message (`\"medication_dosage must be a number\"`) and ask Claude to output a corrected JSON object.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Re-send the original source document along with the incorrect extraction and the specific validation error, then ask Claude to correct just that field.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Re-send the original source document alone with a generic instruction to \"extract more carefully this time.\"",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Switch to a larger model and re-run the extraction from scratch without any reference to the previous attempt.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Effective retry-with-feedback needs all three pieces: the original document (so Claude can re-check the source), the incorrect extraction (so it sees exactly what it produced), and the specific validation error (so it knows exactly what was wrong). The error alone loses the source context, the document alone loses the specific failure signal, and a full restart with a bigger model discards useful signal without addressing the root cause.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-05",
    "scenario": "structured-data-extraction",
    "situation": "You're building a few-shot prompt for extracting citations from academic papers. So far you've included four examples, all APA-style references from single-column PDF journal articles. In production, the pipeline also receives IEEE-style citations, footnote-style legal citations, and two-column conference papers, and extraction accuracy on those formats is noticeably worse than on the APA examples. What is the most effective fix to the few-shot examples?",
    "question": "What is the most effective fix?",
    "options": [
      {
        "letter": "A",
        "text": "Add more APA-style examples so the model has a larger sample of the highest-quality citation format.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Replace the four examples with 2–4 examples that span the different citation styles and document layouts actually seen in production (APA, IEEE, footnote-style, multi-column).",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Remove the few-shot examples and rely solely on the JSON Schema, since schema constraints should generalize across formats better than examples.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep the four APA examples but add an explicit instruction listing the names of the other citation styles the model might encounter.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Few-shot examples teach by demonstration; if all examples share one format, the model has no pattern to draw on for other formats. Covering 2–4 examples across the actual variety of document formats/layouts/citation styles the pipeline will see is what improves generalization. Adding more of the same format, dropping examples in favor of schema alone, or merely naming other styles in text doesn't give the model a concrete pattern to imitate.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-06",
    "scenario": "structured-data-extraction",
    "situation": "Your extraction pipeline for insurance claim forms needs two layers of quality assurance: catching cases where Claude itself is unsure about a value, and catching cases where the output is well-formed but violates domain rules (e.g., claim date is after the policy expiration date). Which combination correctly addresses both concerns?",
    "question": "Which combination correctly addresses both concerns?",
    "options": [
      {
        "letter": "A",
        "text": "Add field-level confidence scores to the extraction output for uncertainty, use Pydantic for structural validation, and add custom validators for business-logic rules like date ordering.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Use Pydantic for both structural validation and business-logic rules, and rely on a low `temperature` setting to eliminate uncertainty instead of confidence scores.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add field-level confidence scores for both uncertainty and business-logic checks, skipping Pydantic since confidence scores already indicate reliability.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Use custom validators for structural validation (types, required fields) and Pydantic only for business-logic rules like date ordering.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "These are three distinct concerns best handled by three distinct mechanisms: field-level confidence scores surface the model's own uncertainty, Pydantic (or an equivalent schema library) enforces structural correctness (types, required fields), and custom validators encode business logic that no generic schema can express, like \"claim date must precede policy expiration.\" Collapsing these into one mechanism (temperature, confidence scores alone, or swapping Pydantic/custom validators) leaves at least one concern unaddressed.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-07",
    "scenario": "structured-data-extraction",
    "situation": "A scanned contract has a smudged signature block where the effective date is only partially legible — it could be \"03/14/2024\" or \"08/14/2024.\" The current schema requires `effective_date` as a plain date string, and Claude picks one of the two readings without flagging the ambiguity. How should the schema and prompt be changed to handle this correctly?",
    "question": "How should this be handled?",
    "options": [
      {
        "letter": "A",
        "text": "Allow `effective_date` to take an `\"unclear\"` value alongside valid dates, and instruct Claude to flag ambiguous or illegible source text for review rather than guessing.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Instruct Claude to always choose the date reading that is closer to the contract's signing-page date, since that is statistically more likely to be correct.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Increase the model's `temperature` so it explores both possible readings and picks the more confident one.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Keep the field as a required plain date string, and rely on downstream human review to catch any incorrect dates.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Adding an `\"unclear\"` value plus explicit conflict-detection instructions lets Claude surface genuine ambiguity instead of silently guessing — the goal is to preserve the fact that the source is ambiguous, not to produce a single confident-looking value. Guessing based on a heuristic or on `temperature` is still guessing, and requiring a clean date string with no escape hatch guarantees the ambiguity gets silently swallowed before any human ever reviews it.",
    "domain": "context-reliability"
  },
  {
    "id": "structured-data-extraction-08",
    "scenario": "structured-data-extraction",
    "situation": "An invoice-extraction schema outputs `order_total` as extracted directly from the printed total on the invoice. Occasionally that printed total is wrong (a vendor arithmetic error) or was misread, and there's currently no way to detect this downstream. What schema change lets you catch these reconciliation problems?",
    "question": "What schema change lets you catch this?",
    "options": [
      {
        "letter": "A",
        "text": "Output both `stated_total` (the total as printed on the invoice) and `calculated_total` (the sum of extracted line items), so a mismatch flags a reconciliation conflict.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Output only `calculated_total`, computed by summing line items, and discard the printed total since it may be wrong.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Output only `stated_total` as printed, and trust it since it reflects the vendor's own record.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add a boolean `total_is_correct` field and instruct Claude to determine on its own whether the printed total is accurate.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Outputting both the stated and calculated totals lets a downstream check compare them and flag a conflict for review — this is the self-correction pattern of surfacing disagreement rather than silently resolving it. Keeping only one of the two values throws away the information needed to detect a mismatch, and a self-declared `total_is_correct` boolean just asks the model to assert confidence rather than exposing the actual discrepancy for verification.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-09",
    "scenario": "structured-data-extraction",
    "situation": "You're building a research-synthesis pipeline that extracts claims (e.g., \"drug X reduced symptom severity by 30%\") from dozens of clinical study PDFs into a single structured summary. A reviewer later asks which specific paper supports a given claim in the summary, and there's no way to trace it back. What should the extraction schema include to prevent this?",
    "question": "What should the extraction schema include?",
    "options": [
      {
        "letter": "A",
        "text": "A `source_summary` field with a one-sentence paraphrase of the entire source document.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "A claim-to-source mapping — each extracted claim paired with an explicit citation to the document (and location) it came from.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "A single `sources` array listing all documents processed in the batch, attached at the top level of the summary.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "A `confidence` score for each claim, on the assumption that high-confidence claims came from more reliable sources.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Provenance requires a per-claim mapping to its specific source — a batch-level list of documents or a document-level paraphrase doesn't tell you which document backs which individual claim. A confidence score describes the model's certainty, not where the claim came from, so it's not a substitute for an explicit citation.",
    "domain": "context-reliability"
  },
  {
    "id": "structured-data-extraction-10",
    "scenario": "structured-data-extraction",
    "situation": "Your pipeline aggregates quarterly revenue figures extracted from press releases and financial filings published over several years, spanning different fiscal calendars and reporting periods. An analyst notices the aggregated summary compares a company's Q1 2023 figure against what was actually a Q4 2022 figure from a differently-dated filing, producing a misleading trend line. What extraction requirement would have prevented this?",
    "question": "What extraction requirement would have prevented this?",
    "options": [
      {
        "letter": "A",
        "text": "Extracting only the revenue figure itself, since the aggregation logic can infer the reporting period from the order documents were processed in.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Requiring every extracted figure to preserve its publication/collection date and an explicit citation to its reporting period, so aggregation logic can correctly align figures temporally.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Normalizing all figures to a single fiscal calendar during extraction itself, before any aggregation occurs.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Extracting only the most recent filing for each company to avoid the need for temporal alignment altogether.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Preserving publication/collection dates and explicit citations for each extracted figure is what lets downstream aggregation correctly interpret and align data across time — without it, there's no reliable way to know which reporting period a figure actually belongs to. Inferring the period from processing order is fragile and unrelated to the source data, normalizing calendars during extraction pushes an aggregation concern into extraction without solving the missing-metadata problem, and dropping all but the most recent filing discards the very trend data the pipeline is meant to produce.",
    "domain": "context-reliability"
  },
  {
    "id": "structured-data-extraction-11",
    "scenario": "structured-data-extraction",
    "situation": "A team's schema for extracting vendor contracts marks every field — including `renewal_notice_period`, `early_termination_fee`, and `auto_renewal_clause` — as `required`, on the theory that a stricter schema produces more complete extractions. In practice, many contracts simply don't include some of these clauses, and the pipeline now either fails validation or gets a fabricated placeholder value for clauses that were never in the document. What is the root cause and fix?",
    "question": "What is the root cause and fix?",
    "options": [
      {
        "letter": "A",
        "text": "The root cause is an under-specified prompt; adding stricter instructions to \"never fabricate\" alongside the all-required schema will resolve it.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "The root cause is marking fields required when the underlying data may legitimately be absent; the fix is making genuinely optional clauses nullable and non-required, reserving `required` for fields that are always present.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "The root cause is the model's context window; providing the full contract text instead of excerpts will let it correctly determine which clauses are present.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The root cause is insufficient few-shot examples; adding more examples of contracts containing all three clauses will train the model to extract them reliably.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "This is the classic anti-pattern of over-constraining a schema: marking every field required regardless of whether the source data is always present forces the model to either fail validation or invent a value. The fix is schema-level — make legitimately optional/absent fields nullable and non-required — not a prompting instruction layered on top of the same rigid schema, not a context-window issue, and not a few-shot gap (more examples of contracts that *do* have the clause won't teach the model what to do when it's genuinely missing).",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-12",
    "scenario": "structured-data-extraction",
    "situation": "Your extraction pipeline's validation layer raises errors as a single generic message: `\"validation failed\"`, with no indication of which field or value triggered it. When retry-with-feedback re-prompts Claude with this message, correction accuracy on the second attempt is barely better than the first attempt. What is the most likely reason, and how should it be fixed?",
    "question": "What is the most likely reason, and how should it be fixed?",
    "options": [
      {
        "letter": "A",
        "text": "The model needs a stronger instruction to \"try harder\" on retry; add that phrase to the re-prompt.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "A generic \"validation failed\" message gives Claude no way to know what specifically was wrong; validation errors should identify the specific field, the invalid value, and the rule that was violated.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Retry-with-feedback is fundamentally unreliable and should be replaced with a from-scratch re-extraction on every failure.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The validation layer should be removed, since Claude cannot reliably act on validation feedback of any kind.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Retry-with-feedback only works if the feedback is specific enough to act on. A generic \"validation failed\" message with no field, value, or rule gives the model nothing to correct, so retries barely improve on the first attempt. Adding a vague \"try harder\" instruction doesn't supply that missing information, discarding the previous extraction on every retry wastes the useful signal it does have, and abandoning validation feedback altogether ignores that specific, actionable errors are what make the pattern effective in the first place.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-13",
    "scenario": "structured-data-extraction",
    "situation": "Two supplier invoices for the same purchase order list different unit prices for the same SKU — one says $12.50, the other $13.75 — likely due to a pricing update mid-order. The current pipeline logic picks the price from whichever invoice was processed first and discards the other value entirely. A downstream reconciliation report later shows an unexplained cost discrepancy with no way to trace its origin. What should the extraction logic do instead?",
    "question": "What should the extraction logic do instead?",
    "options": [
      {
        "letter": "A",
        "text": "Continue picking one value, but switch the rule to always prefer the invoice processed most recently instead of first.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Average the two conflicting prices to produce a single representative value.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Preserve both conflicting values along with their source attribution and flag the conflict, rather than arbitrarily resolving it to a single number.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Discard both values from the reconciliation report, since conflicting data cannot be trusted.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "When sources genuinely conflict, silently picking one value (whether by \"first,\" \"most recent,\" or an average) destroys information and produces exactly the kind of untraceable discrepancy described here. The correct approach is to preserve both values with attribution to their sources and flag the conflict for review, so a human (or downstream logic) can resolve it with full information rather than having it arbitrarily resolved and hidden.",
    "domain": "context-reliability"
  },
  {
    "id": "structured-data-extraction-14",
    "scenario": "structured-data-extraction",
    "situation": "An extraction pipeline handles four document types: typed invoices, handwritten expense forms, scanned legal contracts, and email receipts. Aggregate field-level accuracy across all document types is measured at 97%, and the team concludes the system is production-ready. Three months later, complaints reveal the handwritten expense forms are extracted correctly only about 60% of the time, while the other three document types are consistently above 99%. What evaluation practice would have caught this earlier?",
    "question": "What evaluation practice would have caught this earlier?",
    "options": [
      {
        "letter": "A",
        "text": "Running a larger overall test set so the 97% aggregate figure is measured with tighter statistical confidence.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Stratified sampling and reporting accuracy separately by document type, rather than relying on a single aggregate accuracy figure.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Re-running the same aggregate evaluation quarterly instead of once, to catch drift over time.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Raising the overall accuracy bar required for production sign-off from 97% to 99%.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "A single aggregate accuracy number can mask badly underperforming subgroups if they're a minority of the test set — exactly what happened here, where three strong document types pulled the average up over one weak one. Stratified sampling that reports accuracy per document type surfaces this immediately. A bigger test set or repeated measurement of the same aggregate metric doesn't fix the aggregation problem itself, and raising the overall bar doesn't reveal which document type is failing.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-15",
    "scenario": "structured-data-extraction",
    "situation": "A validation rule requires every extracted employment contract to include a `signing_bonus` amount. For a subset of contracts, the source document simply never mentions a signing bonus because none was offered — but the pipeline treats every validation failure identically and automatically retries the extraction up to three times with the retry-with-feedback pattern, burning API calls without ever succeeding. What is the flaw in this retry logic?",
    "question": "What is the flaw in this retry logic?",
    "options": [
      {
        "letter": "A",
        "text": "The retry count of three is too low; increasing it to five or more attempts would eventually succeed.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Retry-with-feedback is being applied to a case where the required information is simply absent from the source document, not to a case where Claude made an extraction error — no amount of retrying will produce data that isn't there.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "The retries should use a different prompt template entirely rather than the original retry-with-feedback pattern.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The model should be swapped for a larger one on the second retry attempt to increase the chance of finding the bonus amount.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Retry-with-feedback is designed to correct extraction mistakes — it assumes the correct value is derivable from the source and Claude simply got it wrong. When the required information is genuinely absent from the document, retrying (regardless of count, prompt template, or model size) cannot succeed, because there's nothing to extract. The fix is distinguishing \"absent from source\" (which should make the field nullable/optional, not trigger endless retries) from an actual extraction error.",
    "domain": "prompt-engineering"
  },
  // Questions 16–19 adapted from "Claude Certified Architect – Foundations: Exam Prep Guide"
  // by avidevelops — https://github.com/avidevelops/claude-architect-exam-prep (CC BY 4.0).
  // Adaptations: rewritten into this bank's schema, option order shuffled, explanations condensed.
  {
    "id": "structured-data-extraction-16",
    "scenario": "structured-data-extraction",
    "situation": "You are about to process 50,000 legacy documents with the Message Batches API. A pilot on 500 documents shows that 18% of them needed two or three rounds of prompt refinement before extracting correctly. What is the most cost-efficient way to scale up?",
    "question": "What is the most cost-efficient strategy?",
    "options": [
      {
        "letter": "A",
        "text": "Refine the prompt interactively against a representative sample until first-pass success is high, then submit all 50,000 documents as a batch.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Submit all 50,000 documents immediately, identify the failures at scale, and resubmit them.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Process all 50,000 through the synchronous API so the prompt can be adjusted dynamically per document.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Submit 5,000-document batches and learn the failure modes incrementally in production.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Iterative resubmission at production scale destroys the Batch API's ~50% cost savings — the cheap place to pay for prompt learning is a small representative sample, iterated interactively until failure modes are fixed. Submitting everything immediately (or in 5,000-document waves) pays for that learning at full scale, and the synchronous API forfeits the batch discount entirely.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-17",
    "scenario": "structured-data-extraction",
    "situation": "Your extraction service accepts documents continuously and guarantees results within 30 hours of submission. You process them with the Message Batches API, which can take up to 24 hours per batch. Which submission schedule meets the SLA while maximizing cost efficiency?",
    "question": "Which schedule best meets the SLA at lowest cost?",
    "options": [
      {
        "letter": "A",
        "text": "Submit one large batch at the end of each day.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Submit batches every 4 hours.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Submit batches every 6 hours.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Switch to the synchronous API to guarantee the SLA.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "A request waits at most one interval before submission, so worst-case turnaround = interval + 24h of processing; meeting the 30-hour SLA requires interval ≤ 6h. Six hours is the *longest* interval that still guarantees compliance — the fewest submissions and lowest overhead. Every 4 hours also meets the SLA but submits more batches than necessary, daily batching fails outright (24h + 24h = 48h), and the synchronous API needlessly sacrifices the ~50% batch discount.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-18",
    "scenario": "structured-data-extraction",
    "situation": "A nightly batch of 10,000 documents completes with 300 failures (3%), all `context_length_exceeded` errors, each identified in the result file by its `custom_id`. What is the most cost-effective way to process the failures?",
    "question": "What is the most cost-effective approach?",
    "options": [
      {
        "letter": "A",
        "text": "Resubmit all 10,000 documents with a smaller chunk size applied across the board.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Extract the 300 failed documents by `custom_id`, split each into smaller chunks, and resubmit only those as a new batch.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Reprocess the 300 failed documents through the synchronous API, which handles longer inputs.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Raise the model's context-window limit in the batch configuration for the next run.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Resubmitting everything pays again for the 97% that already succeeded — the `custom_id` mapping exists precisely to isolate failures. Since the error is `context_length_exceeded`, those documents are too large for a single request and must be chunked before resubmission as a new batch. The synchronous API has the same context limits at roughly double the price, and a model's context window is a fixed constraint, not a configurable setting.",
    "domain": "prompt-engineering"
  },
  {
    "id": "structured-data-extraction-19",
    "scenario": "structured-data-extraction",
    "situation": "An extraction system uses a 12-field JSON schema with detailed tool descriptions totaling ~2,500 tokens, plus a ~1,500-token system prompt, on a model with a 200K-token context window. Documents under 150K tokens extract at 98% accuracy, but documents of 175K–185K tokens drop to 71% — with fields from the final third of the document consistently missing. What is the most likely cause?",
    "question": "What is the most likely cause?",
    "options": [
      {
        "letter": "A",
        "text": "Schemas beyond 8–10 fields inherently increase decision complexity and degrade extraction accuracy.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Very long documents trigger the lost-in-the-middle effect, causing mid-document content to be dropped.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "The model distributes attention proportionally across the input, so later content receives too small a share.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "The tool definitions and system prompt consume part of the fixed context budget, pushing large documents near the absolute limit — where attention over content at the end of the input degrades.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "The schema and system prompt share the same fixed token budget as the document, so a 180K-token document puts the total input close to the 200K boundary — and degradation near the absolute limit shows up as the *end* of the input going missing. Lost-in-the-middle would affect the middle, not specifically the final third; the same 12-field schema achieves 98% on shorter documents, ruling out field-count complexity; and proportional attention distribution is a fabricated mechanism.",
    "domain": "context-reliability"
  }
];
