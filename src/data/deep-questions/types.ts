export type CognitiveLevel =
  | "تحليل ومقارنة"
  | "تقييم واتخاذ قرار"
  | "تطبيق مركب"
  | "استكشاف أخطاء ونمذجة";

export interface DeepChallengingQuestion {
  id: string;
  lessonId: string;
  lessonNumber: string; // e.g. "1-1", "1-2", "4-4"
  index: number; // 1 to 50
  title: string;
  cognitiveLevel: CognitiveLevel;
  scenario?: string;
  question: string;
  options: string[]; // 4 options
  correctAnswer: number; // 0 | 1 | 2 | 3
  misconceptionTrap: string; // الفخ المفاهيمي: لماذا يقع الطلاب في الخطأ الشائع
  depthExplanation: string; // التفسير والعمق العلمي المعتمد
  teacherDiscussionPrompt: string; // إرشاد المعلم للنقاش الصفي
}
