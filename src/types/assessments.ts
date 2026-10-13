/** Official Ministry assessments booklet (كتيب التقييمات) — one file per lesson. */

export type OfficialAssessmentSectionType =
  | "performance_task_1"
  | "performance_task_2"
  | "homework"
  | "weekly_model_a"
  | "weekly_model_b"
  | "weekly_model_c";

export interface OfficialAssessmentCitation {
  page: number;
  exactText: string;
  topic?: string;
}

export interface OfficialAssessmentQuestion {
  id: string;
  lessonId: string;
  lessonNumber: string;
  lessonTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  sectionType: OfficialAssessmentSectionType;
  sectionNameAr: string;
  type: "mcq" | "essay";
  questionNumber: number;
  question: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswerIndex?: number;
  modelAnswer: string;
  textbookCitation: OfficialAssessmentCitation;
  pageInPdf: number;
  difficulty: "easy" | "medium" | "hard";
  cognitiveLevel: string;
}

export interface OfficialLessonAssessments {
  lessonId: string;
  lessonNumber: string;
  lessonTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  term: number;
  bookletPages: string;
  textbookPages: string;
  totalQuestions: number;
  mcqCount: number;
  essayCount: number;
  questions: OfficialAssessmentQuestion[];
}
