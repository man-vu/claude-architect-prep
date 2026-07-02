// A translation overlay carries ONLY the prose for a question/drill, keyed by the
// English question's id. Structural fields (id, domain, scenario, correct letter,
// option ordering) always come from the English source — this guarantees a
// translation can never accidentally change which answer is correct.
export interface QuestionOverlay {
  situation: string;
  question: string;
  options: [string, string, string, string]; // same order as the English A,B,C,D
  explanation: string;
}
export interface TheoryOverlay {
  question: string;
  options: [string, string, string, string];
  explanation: string;
}

export interface ScenarioLabels { [scenarioId: string]: string }
export interface DomainLabels { [domainId: string]: string }

export interface StudyPageMeta {
  title: string;
  blurb: string;
}
