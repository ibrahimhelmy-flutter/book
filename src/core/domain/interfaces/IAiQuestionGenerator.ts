import { Book } from "../entities/Book";
import { Lesson } from "../entities/Lesson";
import { Question } from "../entities/Question";
import { QuestionType } from "../../config/question-types.config";
import { DifficultyLevel } from "../../config/difficulty.config";

export interface GenerateAiQuestionsParams {
  book: Book;
  lesson: Lesson;
  missingTypes?: QuestionType[];
  missingDifficulties?: DifficultyLevel[];
  requestedCount: number;
}

export interface IAiQuestionGenerator {
  generateQuestions(params: GenerateAiQuestionsParams): Promise<Question[]>;
}
