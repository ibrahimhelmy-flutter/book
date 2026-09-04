import { IQuestionRepository } from "../../domain/interfaces/IQuestionRepository";
import { IBookRepository } from "../../domain/interfaces/IBookRepository";
import { QuestionBankCoverageReport } from "../dtos/ExamGenerationDTO";
import { DifficultyLevel } from "../../config/difficulty.config";
import { QuestionType } from "../../config/question-types.config";
import { CognitiveLevel } from "../../config/cognitive.config";

export class AnalyzeQuestionBankUseCase {
  constructor(
    private questionRepository: IQuestionRepository,
    private bookRepository: IBookRepository
  ) {}

  public async execute(bookId: string): Promise<QuestionBankCoverageReport> {
    const book = await this.bookRepository.getById(bookId);
    if (!book) {
      throw new Error(`Book with id ${bookId} not found`);
    }

    const questions = await this.questionRepository.findByBook(bookId);

    const difficultyCounts: Record<DifficultyLevel, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
      advanced: 0,
    };

    const cognitiveCounts: Record<CognitiveLevel, number> = {
      recall: 0,
      understanding: 0,
      application: 0,
      analysis: 0,
      evaluation: 0,
      integration: 0,
    };

    const typeCounts: Partial<Record<QuestionType, number>> = {};

    questions.forEach((q) => {
      if (difficultyCounts[q.difficulty] !== undefined) {
        difficultyCounts[q.difficulty]++;
      }
      if (cognitiveCounts[q.cognitiveLevel] !== undefined) {
        cognitiveCounts[q.cognitiveLevel]++;
      }
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    });

    const allLessons = book.chapters.flatMap((ch) => ch.lessons);
    let coveredLessonsCount = 0;

    const lessonCoverage = allLessons.map((l) => {
      const lessonQs = questions.filter((q) => q.lessonId === l.id);
      const hasEasy = lessonQs.some((q) => q.difficulty === "easy");
      const hasMedium = lessonQs.some((q) => q.difficulty === "medium");
      const hasHard = lessonQs.some((q) => q.difficulty === "hard");
      const hasAdvanced = lessonQs.some((q) => q.difficulty === "advanced");

      if (lessonQs.length >= 5) {
        coveredLessonsCount++;
      }

      return {
        lessonId: l.id,
        lessonTitle: l.title,
        questionCount: lessonQs.length,
        hasEasy,
        hasMedium,
        hasHard,
        hasAdvanced,
      };
    });

    // Detect gaps
    const missingGaps: QuestionBankCoverageReport["missingGaps"] = [];
    allLessons.forEach((l) => {
      const lessonQs = questions.filter((q) => q.lessonId === l.id);
      const missingDiffs: DifficultyLevel[] = [];
      if (!lessonQs.some((q) => q.difficulty === "hard")) missingDiffs.push("hard");
      if (!lessonQs.some((q) => q.difficulty === "advanced")) missingDiffs.push("advanced");

      const missingTypes: QuestionType[] = [];
      if (!lessonQs.some((q) => q.type === "give_reason")) missingTypes.push("give_reason");
      if (!lessonQs.some((q) => q.type === "compare")) missingTypes.push("compare");
      if (!lessonQs.some((q) => q.type === "essay")) missingTypes.push("essay");

      if (missingDiffs.length > 0 || missingTypes.length > 0 || lessonQs.length < 10) {
        missingGaps.push({
          lessonId: l.id,
          lessonTitle: l.title,
          missingDifficulties: missingDiffs,
          missingTypes: missingTypes.slice(0, 3),
          recommendation: `يوصى بتوليد ${Math.max(0, 15 - lessonQs.length)} سؤالاً إضافياً لتعزيز مستويات التحليل والتفكير العليا.`,
        });
      }
    });

    const coveragePercentage =
      allLessons.length > 0 ? Math.round((coveredLessonsCount / allLessons.length) * 100) : 100;

    return {
      bookId: book.id,
      bookTitle: book.title,
      totalQuestions: questions.length,
      coveragePercentage,
      difficultyCounts,
      typeCounts,
      cognitiveCounts,
      lessonCoverage,
      missingGaps,
    };
  }
}
