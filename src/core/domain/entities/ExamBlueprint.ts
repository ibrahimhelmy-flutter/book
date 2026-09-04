import { CognitiveLevel } from "../../config/cognitive.config";
import { DifficultyLevel } from "../../config/difficulty.config";
import { QuestionType } from "../../config/question-types.config";

export interface LessonWeightItem {
  lessonId: string;
  lessonNumber: string;
  lessonTitle: string;
  weightPercent: number;
  questionCount: number;
}

export interface ExamBlueprint {
  title: string;
  scopeDescription: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  lessonWeights: LessonWeightItem[];
  cognitiveDistribution: Record<CognitiveLevel, { count: number; percentage: number }>;
  difficultyDistribution: Record<DifficultyLevel, { count: number; percentage: number }>;
  typeDistribution: Partial<Record<QuestionType, number>>;
}
