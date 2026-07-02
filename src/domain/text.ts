const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** True when the situation text already ends with the question text (ignoring
 *  markdown/punctuation), i.e. rendering both would show the ask twice. */
export function situationRepeatsQuestion(situation: string, question: string): boolean {
  const q = normalize(question);
  return q.length > 0 && normalize(situation).endsWith(q);
}
