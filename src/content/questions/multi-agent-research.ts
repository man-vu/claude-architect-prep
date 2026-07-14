import type { Question } from "@/domain/types";

export const multiAgentResearch: Question[] = [
  {
    "id": "multi-agent-research-01",
    "scenario": "multi-agent-research",
    "situation": "A document analysis agent discovers that two credible sources contain directly contradictory statistics for a key metric: a government report states 40% growth, while an industry analysis states 12%. Both sources look credible, and the discrepancy could materially affect the research conclusions. How should the document analysis agent handle this situation most effectively?",
    "question": "Which approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Apply credibility heuristics to pick the most likely correct number, finish analysis with that value, and add a footnote mentioning the discrepancy.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Include both numbers in the analysis output without marking them as conflicting, letting the synthesis agent decide which to use based on broader context.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Stop analysis and immediately escalate to the coordinator, asking it to decide which source is more authoritative before continuing.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Complete analysis with both numbers, explicitly annotate the conflict with source attribution, and let the coordinator decide how to reconcile the data before passing to synthesis.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "This approach preserves separation of responsibilities: the analysis agent completes its core work without blocking, preserves both conflicting values with clear attribution, and correctly passes reconciliation to the coordinator, which has broader context.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-02",
    "scenario": "multi-agent-research",
    "situation": "The web-search and document-analysis agents have completed their tasks and returned results to the coordinator. What is the next step for creating an integrated research report?",
    "question": "Which next step is most appropriate?",
    "options": [
      {
        "letter": "A",
        "text": "Each agent sends its results directly to the report-writing agent, bypassing the coordinator.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "The document analysis agent requests web-search results and merges them internally.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "The coordinator passes both sets of results to the synthesis agent for a unified integration.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "The coordinator concatenates the raw outputs from both agents and returns them as the final result.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "In a coordinator–subagent architecture, the coordinator forwards both result sets to the synthesis agent for centralized integration, preserving control and ensuring high-quality merging.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-03",
    "scenario": "multi-agent-research",
    "situation": "A document analysis subagent frequently fails when processing PDF files: some have corrupted sections that trigger parsing exceptions, others are password-protected, and sometimes the parsing library hangs on large files. Currently, any exception immediately terminates the subagent and returns an error to the coordinator, which must decide whether to retry, skip, or fail the whole task. This causes excessive coordinator involvement in routine error handling. What architectural improvement is most effective?",
    "question": "Which improvement is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Create a dedicated error-handling agent that monitors all failures via a shared queue and decides recovery actions, sending restart commands directly to subagents.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Configure the subagent to always return partial results with a success status, embedding error details in metadata; the coordinator treats all responses as successful.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Make the coordinator validate all documents before sending them to the subagent, rejecting documents that might cause failures.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Implement local recovery in the subagent for transient failures and escalate to the coordinator only errors it cannot resolve, including attempted steps and partial results.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Handle errors at the lowest level capable of resolving them. Local recovery reduces coordinator workload while still escalating truly unrecoverable issues with full context and partial progress.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-04",
    "scenario": "multi-agent-research",
    "situation": "After running the system on “AI impact on creative industries,” you observe that every subagent completes successfully: the web-search agent finds relevant articles, the document analysis agent summarizes them correctly, and the synthesis agent produces coherent text. However, final reports cover only visual art and completely miss music, literature, and film. In the coordinator logs, you see it decomposed the topic into three subtasks: “AI in digital art,” “AI in graphic design,” and “AI in photography.” What is the most likely root cause?",
    "question": "What is the most likely root cause?",
    "options": [
      {
        "letter": "A",
        "text": "The synthesis agent lacks instructions to detect coverage gaps.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "The document analysis agent filters out non-visual sources due to overly strict relevance criteria.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "The coordinator’s task decomposition is too narrow, assigning subagents work that does not cover all relevant areas.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "The web-search agent’s queries are insufficient and should be broadened to cover more sectors.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "The coordinator decomposed a broad topic only into visual-art subtasks, missing music, literature, and film entirely. Since subagents executed their assignments correctly, the narrow decomposition is the obvious root cause.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-05",
    "scenario": "multi-agent-research",
    "situation": "The web-search subagent returns results for only 3 of 5 requested source categories (competitor sites and industry reports succeed, but news archives and social feeds time out). The document analysis subagent successfully processes all provided documents. The synthesis subagent must produce a summary from mixed-quality upstream inputs. Which error-propagation strategy is most effective?",
    "question": "Which error-propagation strategy is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Continue synthesis using only successful sources and produce an output without mentioning which data was unavailable.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "The synthesis subagent returns an error to the coordinator, triggering a full retry or task failure due to incomplete data.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "The synthesis subagent asks the coordinator to retry timed-out sources with a longer timeout before starting synthesis.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Structure the synthesis output with coverage annotations that indicate which conclusions are well-supported and where gaps exist due to unavailable sources.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Coverage annotations implement graceful degradation with transparency, preserving value from completed work while propagating uncertainty to enable informed decisions about confidence.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-06",
    "scenario": "multi-agent-research",
    "situation": "The document analysis subagent encounters a corrupted PDF file that it cannot parse. When designing the system’s error handling, what is the most effective way to handle this failure?",
    "question": "Which approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Return an error with context to the coordinator agent, allowing it to decide how to proceed.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Silently skip the corrupted document and continue processing the remaining files to avoid interrupting the workflow.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Automatically retry parsing the document three times with exponential backoff before reporting a failure.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Throw an exception that terminates the entire research workflow.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Returning an error with context to the coordinator is the most effective approach because it lets the coordinator make an informed decision—skip the file, try an alternative parsing method, or notify the user—while maintaining visibility into the failure.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-07",
    "scenario": "multi-agent-research",
    "situation": "Production logs show a persistent pattern: requests like “analyze the uploaded quarterly report” are routed to the web-search agent 45% of the time instead of the document analysis agent. Reviewing tool definitions, you find that the web-search agent has a tool `analyze_content` described as “analyzes content and extracts key information,” while the document analysis agent has a tool `analyze_document` described as “analyzes documents and extracts key information.” How should you fix the misrouting problem?",
    "question": "How should you fix the misrouting problem?",
    "options": [
      {
        "letter": "A",
        "text": "Add a pre-routing classifier that detects whether the user refers to uploaded files or web content before the coordinator decides on delegation.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Rename the web-search tool to `extract_web_results` and update its description to “processes and returns information retrieved from web search and URLs.”",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Add few-shot examples to the coordinator prompt showing correct routing: “User uploads a quarterly report → document analysis agent” and “User asks about a web page → web-search agent.”",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Expand the document analysis tool description with usage examples like “Use for uploaded PDFs, Word docs, and spreadsheets,” leaving the web-search tool unchanged.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Renaming the web-search tool to `extract_web_results` and updating its description to explicitly reference web search and URLs directly removes the root cause by eliminating semantic overlap between the two tool names and descriptions. This makes each tool’s purpose unambiguous, enabling the coordinator to reliably distinguish document analysis from web search.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "multi-agent-research-08",
    "scenario": "multi-agent-research",
    "situation": "A colleague proposes that the document analysis agent should send its results directly to the synthesis agent, bypassing the coordinator. What is the main advantage of keeping the coordinator as the central hub for all communication between subagents?",
    "question": "What is the main advantage of keeping the coordinator as the central hub?",
    "options": [
      {
        "letter": "A",
        "text": "The coordinator can observe all interactions, handle errors uniformly, and decide what information each subagent should receive.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "The coordinator batches multiple requests to subagents, reducing total API calls and overall latency.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Routing through the coordinator enables automatic retry logic that direct inter-agent calls cannot support.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Subagents use isolated memory, and direct communication would require complex serialization that only the coordinator can perform.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "The coordinator pattern provides centralized visibility into all interactions, uniform error handling across the system, and fine-grained control over what information each subagent receives—these are the primary advantages of a star-shaped communication topology.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-09",
    "scenario": "multi-agent-research",
    "situation": "The web-search subagent times out while researching a complex topic. You need to design how information about this failure is returned to the coordinator. Which error-propagation approach best enables intelligent recovery?",
    "question": "Which error-propagation approach best enables intelligent recovery?",
    "options": [
      {
        "letter": "A",
        "text": "Return structured error context to the coordinator including the failure type, the query executed, any partial results, and potential alternative approaches.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Catch the timeout within the subagent and return an empty result set marked as successful.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Implement automatic exponential-backoff retries inside the subagent, only returning a generic “search unavailable” status after exhausting retries.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Propagate the timeout exception directly to the top-level handler, terminating the entire research workflow.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Returning structured error context—including failure type, executed query, partial results, and alternative approaches—gives the coordinator everything needed to make intelligent recovery decisions (e.g., retry with a modified query or continue with partial results). It preserves maximum context for informed coordination-level decision-making.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-10",
    "scenario": "multi-agent-research",
    "situation": "In your system design, you gave the document analysis agent access to a general-purpose tool `fetch_url` so it could download documents by URL. Production logs show this agent now frequently downloads search engine results pages to perform ad hoc web search—behavior that should be routed through the web-search agent—causing inconsistent results. Which fix is most effective?",
    "question": "Which fix is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Replace `fetch_url` with a `load_document` tool that validates that URLs point to document formats.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Remove `fetch_url` from the document analysis agent and route all URL fetching through the coordinator to the web-search agent.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Implement filtering that blocks `fetch_url` calls to known search engine domains while allowing other URLs.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Add instructions to the document analysis agent prompt that `fetch_url` should only be used to download document URLs, not to search.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Replacing a general-purpose tool with a document-specific tool that validates URLs against document formats fixes the root cause by constraining capability at the interface level. This follows the principle of least privilege, making undesired search behavior impossible rather than merely discouraged.",
    "domain": "tool-mcp-design"
  },
  {
    "id": "multi-agent-research-11",
    "scenario": "multi-agent-research",
    "situation": "While researching a broad topic, you observe that the web-search agent and the document analysis agent investigate the same subtopics, leading to substantial duplication in their outputs. Token usage nearly doubles without a proportional increase in research breadth or depth. What is the most effective way to address this?",
    "question": "What is the most effective way to address this?",
    "options": [
      {
        "letter": "A",
        "text": "Allow both agents to finish in parallel, then have the coordinator deduplicate overlapping results before passing them to the synthesis agent.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "The coordinator explicitly partitions the research space before delegating, assigning each agent distinct subtopics or source types.",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Implement a shared-state mechanism where agents log their current focus area so other agents can dynamically avoid duplication during execution.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Switch to sequential execution where document analysis runs only after web search completes, using web-search results as context to avoid duplication.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Having the coordinator explicitly partition the research space before delegating is most effective because it addresses the root cause—unclear task boundaries—before any work begins. It preserves parallelism while preventing duplicated effort and wasted tokens.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-12",
    "scenario": "multi-agent-research",
    "situation": "During research, the web-search subagent queries three source categories with different outcomes: academic databases return 15 relevant papers, industry reports return “0 results,” and patent databases return “Connection timeout.” When designing error propagation to the coordinator, which approach enables the best recovery decisions?",
    "question": "Which approach enables the best recovery decisions?",
    "options": [
      {
        "letter": "A",
        "text": "Aggregate the results into a single success-percentage metric (e.g., “67% source coverage”) with detailed logs available on demand.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Report both “timeout” and “0 results” as failures requiring coordinator intervention.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Retry transient failures internally and report only persistent errors.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Distinguish access failures (timeout) that require a retry decision from valid empty results (“0 results”) that represent successful queries.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "A timeout (access failure) and “0 results” (valid empty result) are semantically different outcomes requiring different responses. Distinguishing them allows the coordinator to retry the patent database while accepting the industry reports “0 results” as a valid, informative finding.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-13",
    "scenario": "multi-agent-research",
    "situation": "Production monitoring shows inconsistent synthesis quality. When aggregated results are ~75K tokens, the synthesis agent reliably cites information from the first 15K tokens (web-search headlines/snippets) and the last 10K tokens (document analysis conclusions), but often misses critical findings in the middle 50K tokens—even when they directly answer the research question. How should you restructure the aggregated input?",
    "question": "How should you restructure the aggregated input?",
    "options": [
      {
        "letter": "A",
        "text": "Summarize all subagent outputs to under 20K tokens before aggregation to keep content within the model’s reliable processing range.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Stream subagent results to the synthesis agent incrementally, processing web-search results first to completion, then adding document analysis results.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Place a key-findings summary at the start of the aggregated input and organize detailed results with explicit section headings for easier navigation.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Implement rotation that alternates which subagent’s results appear first across research tasks to ensure both sources get equal top positioning over time.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Putting a key-findings summary at the start leverages primacy effects so critical information sits in the most reliably processed position. Adding explicit section headings throughout helps the model navigate and attend to mid-input content, directly mitigating the “lost in the middle” phenomenon.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-14",
    "scenario": "multi-agent-research",
    "situation": "In testing, the combined output of the web-search agent (85K tokens including page content) and the document analysis agent (70K tokens including chains of thought) totals 155K tokens, but the synthesis agent performs best with inputs under 50K tokens. Which solution is most effective?",
    "question": "Which solution is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Modify upstream agents to return structured data (key facts, quotes, relevance scores) instead of verbose content and reasoning.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Add an intermediate summarization agent that condenses findings before passing them to synthesis.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the synthesis agent process findings in sequential batches, maintaining state between calls.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Store findings in a vector database and give the synthesis agent search tools to query during its work.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Modifying upstream agents to return structured data fixes the root cause by reducing token volume at the source while preserving essential information. It avoids passing bulky page content and reasoning traces that inflate tokens without improving the synthesis step.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-15",
    "scenario": "multi-agent-research",
    "situation": "In testing, you observe that the synthesis agent often needs to verify specific claims while merging results. Currently, when verification is needed, the synthesis agent returns control to the coordinator, which calls the web-search agent and then re-invokes synthesis with the results. This adds 2–3 extra loops per task and increases latency by 40%. Your assessment shows 85% of these verifications are simple fact checks (dates, names, stats) and 15% require deeper research. Which approach most effectively reduces overhead while preserving system reliability?",
    "question": "Which approach is most effective?",
    "options": [
      {
        "letter": "A",
        "text": "Give the synthesis agent access to all web-search tools so it can handle any verification need directly without coordinator loops.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end, which then sends them all to the web-search agent at once.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the web-search agent proactively cache extra context around each source during initial research in anticipation of synthesis needing verification.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Give the synthesis agent a limited-scope `verify_fact` tool for simple checks, while routing complex verifications through the coordinator to the web-search agent.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "A limited-scope fact-verification tool lets the synthesis agent handle 85% of simple checks directly, eliminating most loops, while preserving the coordinator delegation path for the 15% of complex verifications. This applies least privilege while significantly reducing latency.",
    "domain": "tool-mcp-design"
  },
  // Questions 16–22 adapted from "Claude Certified Architect – Foundations: Exam Prep Guide"
  // by avidevelops — https://github.com/avidevelops/claude-architect-exam-prep (CC BY 4.0).
  // Adaptations: rewritten into this bank's schema, option order shuffled, explanations condensed.
  {
    "id": "multi-agent-research-16",
    "scenario": "multi-agent-research",
    "situation": "In production, follow-up summarization requests to your research system take over 40 seconds. Investigation shows that for each follow-up, the coordinator spawns a synthesis subagent and passes it roughly 80K tokens of accumulated findings — findings the coordinator already holds in its own context from orchestrating the original research. What most effectively improves follow-up response time?",
    "question": "What most effectively improves response time?",
    "options": [
      {
        "letter": "A",
        "text": "Compress the accumulated findings before passing them to the synthesis subagent.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Cache the synthesis subagent's responses, keyed by the follow-up query.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the coordinator answer follow-up summaries directly from its existing context instead of spawning a subagent.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Use `fork_session` to make the subagent spawning itself faster.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Subagents start fresh and inherit none of the coordinator's conversation, so spawning one means re-transferring 80K tokens the coordinator already owns — pure overhead. When the coordinator already holds the needed information, it should do the work itself. Compression and caching merely soften the wrong delegation pattern, and `fork_session` exists for divergent exploration, not spawn latency.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-17",
    "scenario": "multi-agent-research",
    "situation": "The web-search and document-analysis subagents have finished their tasks, and the coordinator must now spawn a synthesis subagent to combine their findings. What is the correct way to provide the synthesis subagent with the information it needs?",
    "question": "What is the correct approach?",
    "options": [
      {
        "letter": "A",
        "text": "Let the synthesis subagent read the coordinator's session history directly to gather prior findings.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Embed the complete findings in the synthesis subagent's prompt, using a structured format that separates content from source metadata (claim, evidence, source, date).",
        "correct": true
      },
      {
        "letter": "C",
        "text": "Give the synthesis subagent the search and analysis tools so it can regather whatever it needs itself.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Pass the synthesis subagent a short prose summary of what the other agents found.",
        "correct": false
      }
    ],
    "correct": "B",
    "explanation": "Subagents start with zero knowledge and cannot inherit the coordinator's history, so every prior finding must be injected explicitly into the spawn prompt — and a structured format preserves the source attribution the synthesis step must cite. Prose summaries collapse away that metadata, and handing over search tools violates scope: a synthesis agent should synthesize, not re-research.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-18",
    "scenario": "multi-agent-research",
    "situation": "Your coordinator gives the web-search subagent exact queries, source priorities, and date filters as step-by-step instructions. In production, the subagent often reports \"insufficient results\" without trying alternatives, degrades on emerging topics, and rarely surfaces unconventional sources. What most improves the subagent's adaptability?",
    "question": "What most improves adaptability?",
    "options": [
      {
        "letter": "A",
        "text": "Replace the procedural instructions with goal-oriented prompts stating the research intent and quality criteria (minimum distinct claims, source-credibility standards).",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Expand the pre-written query lists so they also cover emerging topics.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Add a fallback instruction to report failure whenever fewer than five results are found.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Use broader, single-word queries to widen the search base.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Step-by-step procedural instructions turn the subagent into a rigid executor that dead-ends when the prescribed path fails. Stating the goal and the quality bar instead gives it authority to form its own queries and adapt when initial approaches come up short. Longer query lists are still procedural — you can't pre-write queries for unknown emerging topics — and generic single-word searches destroy specificity.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-19",
    "scenario": "multi-agent-research",
    "situation": "The document-analysis subagent processes the citations in complex legal cases one at a time; a landmark case citing 12 precedents takes over three minutes. Each citation's analysis is independent of the others. What most effectively reduces this latency?",
    "question": "What most effectively reduces latency?",
    "options": [
      {
        "letter": "A",
        "text": "Increase the subagent's context window so it can hold more citations at once.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Move citation processing to the Message Batches API.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Use `fork_session` to accelerate the sequential processing.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Have the coordinator emit all 12 Task tool calls in a single response, so the citation analyses run as parallel subagents.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "Sequential processing of independent work is the anti-pattern here: emitting all Task calls in one response turn spawns the analyses in parallel, dropping total latency from the sum of all tasks to the duration of the longest single one. The Batch API has an up-to-24-hour window and would make latency drastically worse, `fork_session` is for divergent exploration, and context size doesn't change the sequential loop.",
    "domain": "agent-architecture"
  },
  {
    "id": "multi-agent-research-20",
    "scenario": "multi-agent-research",
    "situation": "In your pipeline, the web-search agent gathered 120K tokens of raw content, the document-analysis agent distilled 15K tokens of insights, and the synthesis agent produced a 3K-token narrative draft. The coordinator must now hand context to a report-generation agent that writes the final output with proper citations. Which handoff best balances completeness and efficiency?",
    "question": "Which context-passing strategy is best?",
    "options": [
      {
        "letter": "A",
        "text": "Pass the 120K tokens of raw content plus all intermediate outputs, so nothing is lost.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Pass only the 3K-token synthesis narrative.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Pass the synthesis narrative along with a lean, structured citation index (claim, source, key quote per citation) and any conflict flags.",
        "correct": true
      },
      {
        "letter": "D",
        "text": "Pass the synthesis narrative together with the document-analysis agent's full reasoning chain.",
        "correct": false
      }
    ],
    "correct": "C",
    "explanation": "Shipping 135K+ tokens downstream wastes budget and triggers lost-in-the-middle degradation, while the bare narrative leaves the report agent no citation data — it will fabricate sources. The narrative backbone plus a compact structured citation index carries exactly the metadata the final stage needs; upstream reasoning chains are internal to the previous agent and only add noise.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-21",
    "scenario": "multi-agent-research",
    "situation": "Your synthesis agent consolidates upstream findings into a prose summary for the report-generation agent. In testing, the final reports make factual claims that cannot be attributed: URLs, publication dates, and document locations disappear during summarization. What is the most effective way to ensure proper source attribution?",
    "question": "What most effectively preserves attribution?",
    "options": [
      {
        "letter": "A",
        "text": "Assign a `citation_id` to each source at the earliest agent that touches it, have the synthesis agent write an inline-tagged narrative (e.g., `[src_014]`), and pass a structured citation index alongside the narrative.",
        "correct": true
      },
      {
        "letter": "B",
        "text": "Instruct the synthesis agent to \"preserve sources\" when writing its prose output.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Have the report agent infer the likely original sources from the content of each claim.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Require the synthesis agent to re-include the full source text inside its summary.",
        "correct": false
      }
    ],
    "correct": "A",
    "explanation": "Prose inherently destroys metadata under token pressure, so the structural fix is separating content from metadata: stable `citation_id` anchors assigned at discovery, an inline-tagged narrative, and a separate structured index that survives every hop. A \"preserve sources\" instruction is probabilistic and still drops fields, the report agent cannot infer sources it never saw without hallucinating, and re-inflating summaries with full text reintroduces the context bloat the pipeline exists to avoid.",
    "domain": "context-reliability"
  },
  {
    "id": "multi-agent-research-22",
    "scenario": "multi-agent-research",
    "situation": "A multi-agent research pipeline crashes after fully processing 12 of 18 documents, with one more document partially analyzed. You need to resume without repeating completed work — and without trusting results that may have gone stale during the crash. What is the best state-management approach?",
    "question": "What is the best approach to resume?",
    "options": [
      {
        "letter": "A",
        "text": "Run `--resume` on the crashed session and continue where it stopped.",
        "correct": false
      },
      {
        "letter": "B",
        "text": "Use `fork_session` from the crash point to branch a fresh recovery session.",
        "correct": false
      },
      {
        "letter": "C",
        "text": "Resume the crashed session and let the agent rediscover what remains by re-reading its own history.",
        "correct": false
      },
      {
        "letter": "D",
        "text": "Write the completed findings to a structured checkpoint file, start a fresh session, and inject the checkpoint stating exactly which documents are complete, partial, and pending.",
        "correct": true
      }
    ],
    "correct": "D",
    "explanation": "After a mid-execution crash, the session's cached tool results are stale and blindly resuming risks re-processing or corrupted context. Extracting completed work into a durable structured checkpoint and seeding a fresh session — with an explicit map of complete, partial, and pending items — preserves fidelity without redoing work. `fork_session` is for divergent exploration, not failure recovery, and self-rediscovery from a crashed history is exactly the stale-context trap.",
    "domain": "context-reliability"
  }
];
