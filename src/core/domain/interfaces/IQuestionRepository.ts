import { Question, QuestionStatus } from "../entities/Question";
import { QuestionType } from "../../config/question-types.config";
import { DifficultyLevel } from "../../config/difficulty.config";
import { CognitiveLevel } from "../../config/cognitive.config";
import { ExamScope } from "../value-objects/ExamScope";

export interface QuestionFilterCriteria {
  bookId?: string;
  chapterId?: string;
  lessonId?: string;
  lessonIds?: string[];
  type?: QuestionType | "all";
  difficulty?: DifficultyLevel | "all";
  cognitiveLevel?: CognitiveLevel | "all";
  status?: QuestionStatus;
  search?: string;
}

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByBook(bookId: string): Promise<Question[]>;
  findByLesson(bookId: string, lessonId: string): Promise<Question[]>;
  findByLessons(bookId: string, lessonIds: string[]): Promise<Question[]>;
  findByScope(scope: ExamScope): Promise<Question[]>;
  search(criteria: QuestionFilterCriteria): Promise<Question[]>;
  save(question: Question): Promise<void>;
  saveBatch(questions: Question[]): Promise<void>;
  count(criteria?: QuestionFilterCriteria): Promise<number>;
  delete(id: string): Promise<boolean>;
}
