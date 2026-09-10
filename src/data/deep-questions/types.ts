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
  | "أسئلة مركبة صعبة";

export type QuestionDifficulty = "easy" | "medium" | "hard" | "very-hard";

export interface DeepChallengingQuestion {
  id: string;
  lessonId: string;
  lessonNumber: string; // e.g. "1-1", "1-2", "4-4"
  index: number; // 1 to 50
  type?: "mcq" | "true_false" | "scenario" | "essay";
  title: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: QuestionDifficulty;
  conceptIds: string[];
  contentOrigin: "official" | "authored";
  scenario?: string;
  question: string;
  options: string[]; // 4 options
  correctAnswer: number; // 0 | 1 | 2 | 3
  correctAnswerText?: string;
  misconceptionTrap: string; // الفخ المفاهيمي: لماذا يقع الطلاب في الخطأ الشائع
  depthExplanation: string; // التفسير والعمق العلمي المعتمد
  teacherDiscussionPrompt: string; // إرشاد المعلم للنقاش الصفي
  trapType?: string;
  isExamLikely?: boolean;
  source?: ProvenanceSource;
}
