/**
 * Value Object: ExamScope
 * Defines the educational content boundary for question/exam generation.
 */

export type ExamScopeType = "lesson" | "lessons" | "chapter" | "book" | "curriculum";

export interface ExamScope {
  type: ExamScopeType;
  bookId: string;
  chapterId?: string;
  lessonIds?: string[];
}
