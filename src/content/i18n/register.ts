// Side-effect module: importing this registers every shipped locale's content
// overlay. A locale with no import here simply falls back to English content
// everywhere (graceful partial rollout) — add one import block per language
// as its translation lands.
export {};
