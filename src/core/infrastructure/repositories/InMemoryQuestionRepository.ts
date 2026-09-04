import { IQuestionRepository, QuestionFilterCriteria } from "../../domain/interfaces/IQuestionRepository";
import { Question } from "../../domain/entities/Question";
import { ExamScope } from "../../domain/value-objects/ExamScope";

function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

export class InMemoryQuestionRepository implements IQuestionRepository {
  private questions: Map<string, Question> = new Map();

  constructor(initialQuestions: Question[] = []) {
    initialQuestions.forEach((q) => this.questions.set(q.id, q));
  }

  public async findById(id: string): Promise<Question | null> {
    return this.questions.get(id) || null;
  }

  public async findByBook(bookId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter((q) => q.bookId === bookId);
  }

  public async findByLesson(bookId: string, lessonId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (q) => q.bookId === bookId && q.lessonId === lessonId
    );
  }

  public async findByLessons(bookId: string, lessonIds: string[]): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (q) => q.bookId === bookId && q.lessonId && lessonIds.includes(q.lessonId)
    );
  }

  public async findByScope(scope: ExamScope): Promise<Question[]> {
    const allBookQuestions = await this.findByBook(scope.bookId);

    if (scope.type === "lesson" && scope.lessonIds && scope.lessonIds.length > 0) {
      return allBookQuestions.filter((q) => q.lessonId === scope.lessonIds![0]);
    }

    if (scope.type === "lessons" && scope.lessonIds && scope.lessonIds.length > 0) {
      return allBookQuestions.filter(
        (q) => (q.lessonId && scope.lessonIds!.includes(q.lessonId)) || (q.isCrossLesson)
      );
    }

    if (scope.type === "chapter" && scope.chapterId) {
      return allBookQuestions.filter((q) => q.chapterId === scope.chapterId);
    }

    // Full book / curriculum
    return allBookQuestions;
  }

  public async search(criteria: QuestionFilterCriteria): Promise<Question[]> {
    let result = Array.from(this.questions.values());

    if (criteria.bookId) {
      result = result.filter((q) => q.bookId === criteria.bookId);
    }

    if (criteria.chapterId && criteria.chapterId !== "ALL") {
      result = result.filter((q) => q.chapterId === criteria.chapterId);
    }

    if (criteria.lessonId && criteria.lessonId !== "ALL") {
      result = result.filter((q) => q.lessonId === criteria.lessonId);
    }

    if (criteria.lessonIds && criteria.lessonIds.length > 0) {
      result = result.filter((q) => q.lessonId && criteria.lessonIds!.includes(q.lessonId));
    }

    if (criteria.type && criteria.type !== "all") {
      result = result.filter((q) => q.type === criteria.type);
    }

    if (criteria.difficulty && criteria.difficulty !== "all") {
      result = result.filter((q) => q.difficulty === criteria.difficulty);
    }

    if (criteria.cognitiveLevel && criteria.cognitiveLevel !== "all") {
      result = result.filter((q) => q.cognitiveLevel === criteria.cognitiveLevel);
    }

    if (criteria.status) {
      result = result.filter((q) => q.status === criteria.status);
    }

    if (criteria.search && criteria.search.trim().length > 0) {
      const qNorm = normalizeText(criteria.search);
      result = result.filter(
        (q) =>
          normalizeText(q.question).includes(qNorm) ||
          normalizeText(q.modelAnswer).includes(qNorm) ||
          (q.keywords && q.keywords.some((k) => normalizeText(k).includes(qNorm)))
      );
    }

    return result;
  }

  public async save(question: Question): Promise<void> {
    this.questions.set(question.id, question);
  }

  public async saveBatch(questions: Question[]): Promise<void> {
    questions.forEach((q) => this.questions.set(q.id, q));
  }

  public async count(criteria?: QuestionFilterCriteria): Promise<number> {
    if (!criteria) {
      return this.questions.size;
    }
    const filtered = await this.search(criteria);
    return filtered.length;
  }

  public async delete(id: string): Promise<boolean> {
    return this.questions.delete(id);
  }
}
