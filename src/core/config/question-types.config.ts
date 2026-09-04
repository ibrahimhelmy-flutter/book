/**
 * Generic Standard Question Types Configuration
 * Fully extensible and configurable without touching domain logic.
 */

export type QuestionType =
  | "mcq"
  | "true_false"
  | "complete"
  | "matching"
  | "definition"
  | "give_reason"
  | "explain"
  | "compare"
  | "what_if"
  | "order"
  | "classify"
  | "odd_one_out"
  | "short_answer"
  | "essay"
  | "scenario"
  | "integrated";

export interface QuestionTypeConfigItem {
  id: QuestionType;
  labelAr: string;
  labelEn: string;
  category: "objective" | "short_constructed" | "extended_constructed";
  defaultMarks: number;
  estimatedMinutes: number;
}

export const QUESTION_TYPES_CONFIG: Record<QuestionType, QuestionTypeConfigItem> = {
  mcq: {
    id: "mcq",
    labelAr: "اختيار من متعدد",
    labelEn: "Multiple Choice (MCQ)",
    category: "objective",
    defaultMarks: 1,
    estimatedMinutes: 1,
  },
  true_false: {
    id: "true_false",
    labelAr: "صواب أم خطأ",
    labelEn: "True / False",
    category: "objective",
    defaultMarks: 1,
    estimatedMinutes: 1,
  },
  complete: {
    id: "complete",
    labelAr: "إكمال الفراغات",
    labelEn: "Fill in the Blank",
    category: "short_constructed",
    defaultMarks: 1.5,
    estimatedMinutes: 1.5,
  },
  matching: {
    id: "matching",
    labelAr: "المطابقة والتوصيل",
    labelEn: "Matching",
    category: "objective",
    defaultMarks: 3,
    estimatedMinutes: 2,
  },
  definition: {
    id: "definition",
    labelAr: "المصطلح العلمي والتعريفات",
    labelEn: "Definitions / Scientific Terminology",
    category: "short_constructed",
    defaultMarks: 2,
    estimatedMinutes: 1.5,
  },
  give_reason: {
    id: "give_reason",
    labelAr: "علل واذكر السبب العلمي",
    labelEn: "Give Reasons / Justification",
    category: "short_constructed",
    defaultMarks: 3,
    estimatedMinutes: 2,
  },
  explain: {
    id: "explain",
    labelAr: "اشرح ووضح",
    labelEn: "Explain / Elaborate",
    category: "short_constructed",
    defaultMarks: 3,
    estimatedMinutes: 2.5,
  },
  compare: {
    id: "compare",
    labelAr: "مقارنة ومفاضلة في جدول",
    labelEn: "Compare & Contrast",
    category: "extended_constructed",
    defaultMarks: 4,
    estimatedMinutes: 3,
  },
  what_if: {
    id: "what_if",
    labelAr: "ماذا يحدث لو / ما النتائج",
    labelEn: "What If / Consequences",
    category: "short_constructed",
    defaultMarks: 3,
    estimatedMinutes: 2.5,
  },
  order: {
    id: "order",
    labelAr: "ترتيب تسلسلي ومنطقي",
    labelEn: "Chronological / Logical Order",
    category: "objective",
    defaultMarks: 3,
    estimatedMinutes: 2,
  },
  classify: {
    id: "classify",
    labelAr: "تصنيف العناصر حسب الفئات",
    labelEn: "Classification",
    category: "objective",
    defaultMarks: 3,
    estimatedMinutes: 2.5,
  },
  odd_one_out: {
    id: "odd_one_out",
    labelAr: "اختر الكلمة الشاذة مع التعليل",
    labelEn: "Odd Item Out",
    category: "short_constructed",
    defaultMarks: 3,
    estimatedMinutes: 2,
  },
  short_answer: {
    id: "short_answer",
    labelAr: "أسئلة مقالية قصيرة",
    labelEn: "Short Answer",
    category: "short_constructed",
    defaultMarks: 2,
    estimatedMinutes: 2,
  },
  essay: {
    id: "essay",
    labelAr: "سؤال مقالي وزاري شامل [6 درجات]",
    labelEn: "Extended Essay with Rubric",
    category: "extended_constructed",
    defaultMarks: 6,
    estimatedMinutes: 5,
  },
  scenario: {
    id: "scenario",
    labelAr: "سيناريوهات وحل المشكلات",
    labelEn: "Scenario-based Problem Solving",
    category: "extended_constructed",
    defaultMarks: 5,
    estimatedMinutes: 4,
  },
  integrated: {
    id: "integrated",
    labelAr: "أسئلة ربط تكاملي بين الدروس",
    labelEn: "Cross-Lesson Integrated",
    category: "extended_constructed",
    defaultMarks: 6,
    estimatedMinutes: 5,
  },
};
