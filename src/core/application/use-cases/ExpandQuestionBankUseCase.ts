import { IQuestionRepository } from "../../domain/interfaces/IQuestionRepository";
import { IBookRepository } from "../../domain/interfaces/IBookRepository";
import { IAiQuestionGenerator } from "../../domain/interfaces/IAiQuestionGenerator";
import { ValidateQuestionUseCase } from "./ValidateQuestionUseCase";
import { Question } from "../../domain/entities/Question";
import { QuestionType } from "../../config/question-types.config";
import { DifficultyLevel } from "../../config/difficulty.config";

export interface ExpandQuestionBankParams {
  bookId: string;
  lessonId?: string;
  requestedCount: number;
  targetDifficulties?: DifficultyLevel[];
  targetTypes?: QuestionType[];
}

export class ExpandQuestionBankUseCase {
  constructor(
    private questionRepository: IQuestionRepository,
    private bookRepository: IBookRepository,
    private aiGenerator: IAiQuestionGenerator,
    private validator: ValidateQuestionUseCase
  ) {}

  public async execute(params: ExpandQuestionBankParams): Promise<{
    addedQuestions: Question[];
    rejectedCount: number;
    totalStoredNow: number;
  }> {
    const book = await this.bookRepository.getById(params.bookId);
    if (!book) {
      throw new Error(`Book with id ${params.bookId} not found`);
    }

    const allLessons = book.chapters.flatMap((ch) => ch.lessons);
    const targetLessons = params.lessonId
      ? allLessons.filter((l) => l.id === params.lessonId)
      : allLessons;

    if (targetLessons.length === 0) {
      throw new Error("No matching lessons found to expand");
    }

    const existingQuestions = await this.questionRepository.findByBook(params.bookId);
    const addedQuestions: Question[] = [];
    let rejectedCount = 0;

    // Distribute requested count across target lessons
    const perLessonCount = Math.max(1, Math.ceil(params.requestedCount / targetLessons.length));

    for (const lesson of targetLessons) {
      if (addedQuestions.length >= params.requestedCount) break;

      const generated = await this.aiGenerator.generateQuestions({
        book,
        lesson,
        missingTypes: params.targetTypes,
        missingDifficulties: params.targetDifficulties,
        requestedCount: perLessonCount,
      });

      for (const q of generated) {
        if (addedQuestions.length >= params.requestedCount) break;

        const validation = this.validator.execute(q, [...existingQuestions, ...addedQuestions]);
        if (validation.isValid) {
          q.status = "approved";
          addedQuestions.push(q);
        } else {
          rejectedCount++;
        }
      }
    }

    // Persist all approved questions
    if (addedQuestions.length > 0) {
      await this.questionRepository.saveBatch(addedQuestions);
    }

    const totalStoredNow = await this.questionRepository.count({ bookId: params.bookId });

    return {
      addedQuestions,
      rejectedCount,
      totalStoredNow,
    };
  }
}
