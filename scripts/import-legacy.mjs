import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2] || "C:/Users/TIM/OneDrive/Downloads/practical_test_en.html";
const OUT = "src/content/questions/_raw-legacy.json";

const SCENARIO_MAP = {
  "Customer Support Agent": "customer-support",
  "Code Generation with Claude Code": "code-generation",
  "Multi-agent Research System": "multi-agent-research",
  "Claude Code for Continuous Integration": "ci",
};

const html = readFileSync(SRC, "utf8");
const line = html.split(/\r?\n/).find((l) => l.includes("[{") && l.includes("scenario"));
if (!line) throw new Error("could not find question data array in HTML");
const json = line.match(/\[\s*\{[\s\S]*\}\s*\]/)[0];
const raw = JSON.parse(json);

const counters = {};
const out = raw.map((q) => {
  const scenario = SCENARIO_MAP[q.scenario];
  if (!scenario) throw new Error(`unmapped scenario: ${q.scenario}`);
  counters[scenario] = (counters[scenario] || 0) + 1;
  const n = String(counters[scenario]).padStart(2, "0");
  return {
    id: `${scenario}-${n}`,
    scenario,
    situation: q.situation,
    question: q.question,
    options: q.options.map((o) => ({ letter: o.letter, text: o.text, correct: !!o.correct })),
    correct: q.correct,
    explanation: q.explanation,
  };
});

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`wrote ${out.length} questions to ${OUT}`);
console.log(counters);
