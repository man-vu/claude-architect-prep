// UI string dictionary. Every locale must implement every key (TypeScript
// enforces completeness) — the safety net for a multi-language rollout: a
// missing translation is a compile error, not a silent English fallback.
export interface UiDict {
  home: {
    kicker: string; // "▸ Foundations certification prep"
    scoreLine: string; // "Score 100–1000 · pass at 720 · 60 questions in 120 minutes."
    statBestExam: string;
    statAttempts: string;
    statPassMark: string;
    resumeExamLine: (answered: number, total: number) => string; // "Resume exam — {a}/{t} answered →"
    resumeExam: string;
    startExam: string;
    practiceByTopic: string;
    studyTheTheory: string;
    viewHistory: string;
  };
  exam: {
    preparingExam: string;
    passed: string;
    notYet: string;
    score: string;
    correct: string;
    result: string;
    pass: string;
    fail: string;
    byDomain: string;
    byScenario: string;
    review: (n: number) => string; // "Review ({n} missed)"
    why: (letter: string) => string; // "Why {letter} ▸"
    home: string;
    questionCounter: (i: number, total: number) => string; // "Q01/60"
    answeredCount: (n: number) => string; // "{n} answered"
    unansweredConfirm: (n: number) => string;
    finishExam: string;
    submitNow: string;
    keepGoing: string;
    saveExit: string;
    prev: string;
    next: string;
    questionMap: string;
    timeRemaining: string;
    questionAria: (n: number, answered: boolean) => string;
  };
  practice: {
    home: string;
    scenarioTitle: string;
    scenarioBlurb: string;
    theoryTitle: string;
    theoryBlurb: string;
    questionsCount: (n: number) => string;
    theoryDrillsCount: (n: number, weight: number) => string;
    changeTopic: string;
  };
  study: {
    home: string;
    title: string;
    blurb: string;
    examDomains: string;
    reference: string;
    back: string;
    domainWeight: (weight: number) => string;
    referenceTag: string;
    drillThisDomain: string;
    allTopics: string;
  };
  history: {
    home: string;
    title: string;
    empty: string;
  };
  intro: {
    ariaLabel: string;
    command: string; // fake terminal command, e.g. "cca-prep --init"
    scenarioBankLine: string;
    theoryDrillsLine: string;
    examEngineLine: string;
    begin: string;
    skip: string;
    ready: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
    ariaLabel: (mode: string, next: string) => string;
  };
  textSize: {
    groupAria: string;
    decrease: string;
    increase: string;
  };
  audio: {
    listenToPage: (duration: string) => string;
    resume: string;
    pause: string;
    loading: string;
    openPanel: string;
    closePanel: string;
    playAria: (label: string, duration: string) => string;
    pauseAria: (label: string) => string;
    loadingAria: (label: string) => string;
    listenLabel: string;
    tab: string;
  };
  common: {
    theoryChip: (domain: string) => string; // "▸ {domain} · theory"
    scenarioChip: (scenario: string) => string; // "▸ {scenario}"
  };
}

export const EN: UiDict = {
  home: {
    kicker: "▸ Foundations certification prep",
    scoreLine: "Score 100–1000 · pass at 720 · 60 questions in 120 minutes.",
    statBestExam: "Best exam",
    statAttempts: "Attempts",
    statPassMark: "Pass mark",
    resumeExamLine: (a, t) => `Resume exam — ${a}/${t} answered →`,
    resumeExam: "Resume exam",
    startExam: "Start exam",
    practiceByTopic: "Practice by topic",
    studyTheTheory: "Study the theory",
    viewHistory: "View history",
  },
  exam: {
    preparingExam: "Preparing your exam…",
    passed: "▸ Passed",
    notYet: "▸ Not yet",
    score: "Score",
    correct: "Correct",
    result: "Result",
    pass: "PASS",
    fail: "FAIL",
    byDomain: "▸ By domain",
    byScenario: "▸ By scenario",
    review: (n) => `▸ Review (${n} missed)`,
    why: (letter) => `Why ${letter} ▸`,
    home: "← Home",
    questionCounter: (i, total) => `Q${String(i).padStart(2, "0")}/${total}`,
    answeredCount: (n) => `${n} answered`,
    unansweredConfirm: (n) => `${n} unanswered. Submit anyway?`,
    finishExam: "Finish exam",
    submitNow: "Submit now",
    keepGoing: "Keep going",
    saveExit: "Save & exit — progress is kept",
    prev: "← Prev",
    next: "Next",
    questionMap: "Question map",
    timeRemaining: "Time remaining",
    questionAria: (n, answered) => `Question ${n}${answered ? ", answered" : ", unanswered"}`,
  },
  practice: {
    home: "← Home",
    scenarioTitle: "Practice by scenario",
    scenarioBlurb: "Exam-style situational questions — the format the real exam uses.",
    theoryTitle: "Drill the theory by domain",
    theoryBlurb: "Direct concept-recall questions from the study notes — for memorising the material.",
    questionsCount: (n) => `${n} questions`,
    theoryDrillsCount: (n, w) => `${n} theory drills · weight ${w}%`,
    changeTopic: "← Change topic",
  },
  study: {
    home: "← Home",
    title: "Study the theory",
    blurb: "Comprehensive notes for each exam domain, plus reference material. Percentages are exam weight.",
    examDomains: "▸ Exam domains",
    reference: "▸ Reference",
    back: "← Study",
    domainWeight: (w) => `▸ Domain · ${w}% of exam`,
    referenceTag: "▸ Reference",
    drillThisDomain: "Drill this domain",
    allTopics: "All topics",
  },
  history: {
    home: "← Home",
    title: "History",
    empty: "No attempts yet.",
  },
  intro: {
    ariaLabel: "Introduction",
    command: "cca-prep --init",
    scenarioBankLine: "▸ scenario bank ....... 90 questions / 6 scenarios",
    theoryDrillsLine: "▸ theory drills ....... 169 drills / 5 domains",
    examEngineLine: "▸ exam engine ......... 60Q · 120 min · pass ≥ 720",
    begin: "Begin",
    skip: "skip ▸",
    ready: "▸ ready.",
  },
  theme: {
    light: "light",
    dark: "dark",
    system: "system",
    ariaLabel: (mode, next) => `Theme: ${mode}. Switch to ${next}.`,
  },
  textSize: {
    groupAria: "Text size",
    decrease: "Decrease text size",
    increase: "Increase text size",
  },
  audio: {
    listenToPage: (d) => `▸ listen to this page ${d}`,
    resume: "▸ resume",
    pause: "❚❚ pause",
    loading: "loading…",
    openPanel: "Open audio panel",
    closePanel: "Close audio panel",
    playAria: (label, d) => `Play ${label}, ${d}`,
    pauseAria: (label) => `Pause ${label}`,
    loadingAria: (label) => `Loading ${label}`,
    listenLabel: "listen",
    tab: "LISTEN",
  },
  common: {
    theoryChip: (domain) => `▸ ${domain} · theory`,
    scenarioChip: (scenario) => `▸ ${scenario}`,
  },
};
