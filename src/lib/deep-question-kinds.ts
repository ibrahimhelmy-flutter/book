/**
 * Question kinds of the deep-comprehension bank (pure, client-safe).
 *
 * A lesson bank may mix: mcq (4 options), true_false (options ["صواب", "خطأ"], plus a
 * `correction` when the statement is false), fill_blank (`____` gaps + `blanks`) and essay
 * (`modelAnswer` + `keyPoints` the learner checks against their own answer).
 */
import type { DeepChallengingQuestion, FillBlank } from "@/types/deep-questions";
import { normalizeArabicText } from "@/lib/arabic";

export type DeepQuestionKind = "mcq" | "true_false" | "fill_blank" | "essay";

export const KIND_LABELS: Record<DeepQuestionKind, string> = {
  mcq: "اختيار من متعدد",
  true_false: "صواب أم خطأ",
  fill_blank: "أكمل",
  essay: "مقالي",
};

export const KIND_ORDER: DeepQuestionKind[] = ["mcq", "true_false", "fill_blank", "essay"];

export const TRUE_FALSE_OPTIONS = ["صواب", "خطأ"];

/** Marks a gap in a fill_blank question. */
export const BLANK_PATTERN = /_{3,}/g;

/** Legacy "scenario" items are four-option questions too. */
export function questionKind(q: Pick<DeepChallengingQuestion, "type">): DeepQuestionKind {
  if (q.type === "true_false" || q.type === "fill_blank" || q.type === "essay") return q.type;
  return "mcq";
}

/** Splits a fill_blank question into the text around its gaps (`parts.length === gaps + 1`). */
export function splitBlanks(text: string): string[] {
  return text.split(BLANK_PATTERN);
}

function normalizeAnswer(text: string): string {
  return normalizeArabicText(text.replace(/[()[\]«»"'.,،؛:!?؟\-–—]/g, " "))
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.startsWith("ال") ? w.slice(2) : w))
    .join(" ");
}

/** A typed gap answer is correct when it equals the answer or an accepted form (normalized, «ال» optional). */
export function isBlankCorrect(input: string, blank: FillBlank): boolean {
  const typed = normalizeAnswer(input);
  if (!typed) return false;
  return [blank.answer, ...(blank.accept || [])].some((a) => normalizeAnswer(a) === typed);
}

export type AnswerStatus = "correct" | "partial" | "wrong";

/** Fill-blank result: all gaps right → correct, some → partial, none → wrong. */
export function fillBlankStatus(inputs: string[], blanks: FillBlank[]): AnswerStatus {
  const right = blanks.filter((b, i) => isBlankCorrect(inputs[i] || "", b)).length;
  if (right === blanks.length) return "correct";
  return right > 0 ? "partial" : "wrong";
}

/** Section-strip id of a chapter bank's questions that span several lessons. */
export const integratedSectionId = (chapterNumber: number) => `chapter-${chapterNumber}-integrated`;

/**
 * Chapter banks filter by lesson: tags each question with the one lesson its section/concept ids
 * point to, or with the chapter's integrated entry when they span several lessons (or none).
 */
export function tagChapterQuestions(questions: DeepChallengingQuestion[], chapterNumber: number): DeepChallengingQuestion[] {
  return questions.map((q) => {
    const ids = [...(q.sourceBlockIds || []), ...(q.conceptIds || [])];
    const lessons = new Set(
      ids.map((id) => id.match(/^(?:sec|concept|lesson)-(\d+-\d+)/)?.[1]).filter((n): n is string => !!n)
    );
    const target = lessons.size === 1 ? `lesson-${[...lessons][0]}` : integratedSectionId(chapterNumber);
    return { ...q, sourceBlockIds: [target] };
  });
}

/** Essay self-check: every key point covered → correct, at least half → partial. */
export function essayStatus(covered: number, total: number): AnswerStatus {
  if (total > 0 && covered >= total) return "correct";
  return covered * 2 >= total && covered > 0 ? "partial" : "wrong";
}
