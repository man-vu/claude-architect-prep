// Side-effect module: importing this registers every shipped locale's content
// overlay. A locale with no import block here simply falls back to English
// content everywhere (graceful partial rollout) — add one block per language
// as its translation lands.
import { registerQuestionOverlay, registerTheoryOverlay, registerScenarioLabels, registerDomainLabels, registerStudyMeta } from "./index";
import { registerDict } from "@/i18n/dict-registry";

import { esQuestions } from "./es/questions";
import { esTheory } from "./es/theory";
import { esScenarioLabels, esDomainLabels } from "./es/scenarios";
import { esStudyMeta } from "./es/study-meta";
import { ES } from "@/i18n/dict/es";

registerQuestionOverlay("es", esQuestions);
registerTheoryOverlay("es", esTheory);
registerScenarioLabels("es", esScenarioLabels);
registerDomainLabels("es", esDomainLabels);
registerStudyMeta("es", esStudyMeta);
registerDict("es", ES);
