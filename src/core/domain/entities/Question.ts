import { QuestionType } from "../../config/question-types.config";
import { DifficultyLevel } from "../../config/difficulty.config";
import { CognitiveLevel } from "../../config/cognitive.config";
import { SourceReference } from "../value-objects/SourceReference";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MatchingPairEntity {
  id: string;
  left: string;
  right: string;
}

export type QuestionStatus = "draft" | "approved" | "rejected";
export type GenerationSource = "ai" | "manual";

export interface Question {
  id: string;
  bookId: string;
  chapterId?: string;
  lessonId?: string;
  sectionId?: string;

  type: QuestionType;
  question: string;
  modelAnswer: string;

  // Single Source of Truth text fidelity
  sourceText?: string;
  sourceReference?: SourceReference;

  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;

  marks: number;
  estimatedTime?: number; // minutes

  options?: QuestionOption[];
  matchingPairs?: MatchingPairEntity[];
  orderItems?: string[];
  oddItemData?: {
    items: string[];
    oddItem: string;
    reason: string;
  };
  classificationData?: {
    categories: string[];
    items: { item: string; category: string }[];
  };

  rubricCriteria?: string[];
  keywords?: string[];

  status: QuestionStatus;
  generationSource: GenerationSource;

  isCrossLesson?: boolean;
  connectedLessonIds?: string[];

  createdAt: string | Date;
  updatedAt: string | Date;
}
