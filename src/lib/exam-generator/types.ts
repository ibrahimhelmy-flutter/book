/**
 * Advanced AI Exam & Question Bank Generator - Type System
 * Designed according to Educational Measurement and Curriculum Assessment standards.
 */

export type ExamScope = "single_lesson" | "multiple_lessons" | "chapter" | "curriculum";

export type CognitiveLevel =
  | "recall" // المستوى 1: التذكر والاسترجاع المباشر
  | "understanding" // المستوى 2: الفهم والاستيعاب والتعليل
  | "application" // المستوى 3: التطبيق في مواقف وسيناريوهات
  | "analysis" // المستوى 4: التحليل والمقارنة والتصنيف والترتيب
  | "higher_order"; // المستوى 5: التفكير العليا والتقييم والتكامل بين الدروس

export type DifficultyLevel = "easy" | "medium" | "hard" | "higher_order";

export type CommitteeQuestionType =
  | "mcq" // اختيار من متعدد
  | "true_false" // صواب أم خطأ مع تصحيح الخطأ
  | "complete" // إكمال العبارات بالفراغات
  | "matching" // المطابقة والتوصيل
  | "term" // المصطلح العلمي والمفاهيم
  | "give_reason" // علل واذكر السبب العلمي
  | "explain" // اشرح ووضح المفهوم أو الآلية
  | "compare" // قارن وميز في جدول
  | "what_if" // ماذا يحدث لو / ما النتائج المترتبة
  | "order" // رتب تسلسلياً / خطوات منطقية
  | "classify" // صنف العناصر حسب فئاتها
  | "odd_one_out" // اختر الكلمة الشاذة غير المناسبة مع التعليل
  | "short_answer" // أسئلة مقالية قصيرة
  | "essay" // سؤال مقالي وزاري شامل [6 درجات]
  | "cross_lesson"; // سؤال ربط تكاملي بين الدروس

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface OddItemData {
  items: string[];
  oddItem: string;
  reason: string;
}

export interface ClassificationData {
  categories: string[];
  items: { item: string; category: string }[];
}

export interface CommitteeQuestion {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  lessonId: string;
  lessonNumber: string;
  lessonTitle: string;
  topic: string;
  page: number | string;
  sourceSection: string;
  sourceReference: string; // e.g. "الفصل 1 → الدرس 1-1 → تاريخ تكنولوجيا المعلومات → ص 6"
  questionType: CommitteeQuestionType;
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;
  question: string;
  modelAnswer: string;
  textbookExactAnswer: string;
  explanation?: string;
  rubricCriteria?: string[];
  options?: QuestionOption[];
  matchingPairs?: MatchingPair[];
  oddItemData?: OddItemData;
  orderItems?: string[];
  classificationData?: ClassificationData;
  falseCorrection?: string;
  marks: number;
  estimatedTimeMinutes: number;
  keywords: string[];
  isCrossLesson?: boolean;
  connectedLessons?: string[];
}

export interface ExamGenerationConfig {
  scope: ExamScope;
  lessonIds: string[];
  chapterId?: string;
  questionCount: number | "max";
  examCount: number; // 1, 3, 5, 10, etc.
  questionTypes: CommitteeQuestionType[] | "all";
  difficultyPreset: "balanced" | "recall_heavy" | "analytical" | "excellent_student" | "custom";
  difficultyDistribution: {
    easy: number; // e.g. 25
    medium: number; // e.g. 40
    hard: number; // e.g. 25
    higherOrder: number; // e.g. 10
  };
  totalMarks?: number;
  durationMinutes?: number;
  includeAnswers: boolean;
  includeSourceReferences: boolean;
  useExactBookAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  selectedProfile?: string;
}

export interface LessonWeightItem {
  lessonId: string;
  lessonNumber: string;
  lessonTitle: string;
  chapterNumber: number;
  weightPercent: number;
  questionCount: number;
  conceptsCount: number;
}

export interface ExamBlueprint {
  title: string;
  scopeLabel: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  lessonWeights: LessonWeightItem[];
  cognitiveDistribution: Record<CognitiveLevel, { count: number; percentage: number }>;
  typeDistribution: Record<string, number>;
  difficultyDistribution: Record<DifficultyLevel, { count: number; percentage: number }>;
}

export interface ExamSection {
  id: string;
  sectionKey: "A" | "B" | "C" | "D" | "E";
  title: string;
  subtitle: string;
  marks: number;
  questions: CommitteeQuestion[];
}

export interface GeneratedExamModel {
  modelId: string;
  modelLetter: string; // أ، ب، جـ، د، هـ
  modelCode: string; // EXAM-2026-A
  title: string;
  subject: string;
  academicYear: string;
  durationMinutes: number;
  totalMarks: number;
  blueprint: ExamBlueprint;
  sections: ExamSection[];
  allQuestions: CommitteeQuestion[];
}

export interface ExamSystemResult {
  config: ExamGenerationConfig;
  blueprint: ExamBlueprint;
  models: GeneratedExamModel[];
  totalQuestionsInPool: number;
  generatedAt: string;
}

export interface ValidationItemResult {
  questionId: string;
  passed: boolean;
  score: number; // 0 to 10
  issues: string[];
}

export interface SystemValidationReport {
  totalQuestionsChecked: number;
  passCount: number;
  failCount: number;
  averageScore: number;
  results: ValidationItemResult[];
}

export interface ProfilePreset {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  config: Partial<ExamGenerationConfig>;
}
