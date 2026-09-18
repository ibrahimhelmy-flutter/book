import { ProvenanceSource } from "@/types";

export type CognitiveLevel =
  | "تحليل ومقارنة"
  | "تقييم واتخاذ قرار"
  | "تطبيق مركب"
  | "استكشاف أخطاء ونمذجة"
  | "فهم مباشر عميق"
  | "تمييز بين المفاهيم"
  | "تطبيق على موقف"
  | "تحليل واستنتاج"
  | "اكتشاف خطأ وتريكات"
  | "هلوسة والتحقق"
  | "أسئلة مركبة صعبة"
  | "فهم وتعريف"
  | "تطبيق سيناريو"
  | "كشف مفهوم خاطئ"
  | "تقييم"
  | "تحليل وربط"
  | "تركيب"
  | "تركيب وتقييم";

export type QuestionDifficulty = "easy" | "medium" | "hard" | "very-hard" | "expert";

export interface DeepQuestionProvenance {
  question: "derived-from-curriculum" | "official";
  explanation: "pedagogical-explanation";
  teacherPrompt: "pedagogical-extension";
}

export interface DeepQuestionValidation {
  distractorsPlausible: boolean;
  noExternalKnowledge: boolean;
  noDuplicate: boolean;
  conceptAligned: boolean;
  noAnswerLeakage?: boolean;
  optionsIndependent?: boolean;
}

export interface CurriculumEvidenceItem {
  excerpt: string;
  page: number;
  conceptId?: string;
}

export interface DeepChallengingQuestion {
  question: string;
  options: string[]; // 4 options
  answer: string;
  difficulty: QuestionDifficulty;
  id?: string;
  lessonId?: string;
  lessonNumber?: string; // e.g. "1-1", "1-2", "4-4"
  index?: number; // 1 to 50
  type?: "mcq" | "true_false" | "scenario" | "essay";
  title?: string;
  cognitiveLevel?: CognitiveLevel;
  conceptId?: string;
  secondaryConceptIds?: string[];
  conceptIds?: string[];
  contentOrigin?: "official" | "authored";
  contentProvenance?: DeepQuestionProvenance;
  scenario?: string;
  correctAnswer?: number; // 0 | 1 | 2 | 3
  correctAnswerText?: string;
  misconceptionTrap?: string;
  depthExplanation?: string;
  teacherDiscussionPrompt?: string;
  trapType?: string;
  isExamLikely?: boolean;
  source?: ProvenanceSource & {
    curriculumEvidence?: string | CurriculumEvidenceItem;
  };
  validation?: DeepQuestionValidation;
  sourceBlockIds?: string[];
}
