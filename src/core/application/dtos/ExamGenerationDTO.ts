import { ExamScope } from "../../domain/value-objects/ExamScope";
import { QuestionType } from "../../config/question-types.config";
import { DifficultyLevel } from "../../config/difficulty.config";
import { CognitiveLevel } from "../../config/cognitive.config";

export interface ExamGenerationRequest {
  bookId: string;
  scope: ExamScope;
  questionCount: number | "max";
  examCount: number; // 1, 2, 3, 4, 5, etc.
  questionTypes: QuestionType[] | "all";
  difficultyDistribution: Record<DifficultyLevel, number>;
  cognitiveLevelDistribution?: Record<CognitiveLevel, number>;
  totalMarks?: number;
  durationMinutes?: number;
  includeAnswers: boolean;
  includeSourceReferences: boolean;
  allowAiGeneration: boolean;
  saveGeneratedQuestions: boolean;
  seed?: string;
}

export interface QuestionBankCoverageReport {
  bookId: string;
  bookTitle: string;
  totalQuestions: number;
  coveragePercentage: number;
  difficultyCounts: Record<DifficultyLevel, number>;
  typeCounts: Partial<Record<QuestionType, number>>;
  cognitiveCounts: Record<CognitiveLevel, number>;
  lessonCoverage: {
    lessonId: string;
    lessonTitle: string;
    questionCount: number;
    hasEasy: boolean;
    hasMedium: boolean;
    hasHard: boolean;
    hasAdvanced: boolean;
  }[];
  missingGaps: {
    lessonId: string;
    lessonTitle: string;
    missingDifficulties: DifficultyLevel[];
    missingTypes: QuestionType[];
    recommendation: string;
  }[];
}
