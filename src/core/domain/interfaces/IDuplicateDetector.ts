import { Question } from "../entities/Question";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number; // 0 to 1
  matchedQuestionId?: string;
  reason?: string;
}

export interface IDuplicateDetector {
  check(candidate: Question, existingQuestions: Question[]): DuplicateCheckResult;
}
