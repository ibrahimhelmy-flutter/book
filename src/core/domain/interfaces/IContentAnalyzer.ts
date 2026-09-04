import { Lesson } from "../entities/Lesson";

export interface ExtractedConcept {
  term: string;
  definition: string;
  importance: "high" | "medium";
}

export interface ContentAnalysisReport {
  lessonId: string;
  title: string;
  concepts: ExtractedConcept[];
  factsCount: number;
  sectionsCount: number;
  examinablePoints: string[];
  recommendedQuestionCount: number;
}

export interface IContentAnalyzer {
  analyzeLesson(lesson: Lesson): ContentAnalysisReport;
}
