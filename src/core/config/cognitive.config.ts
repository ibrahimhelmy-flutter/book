/**
 * Standard Cognitive Levels Configuration (Bloom's Revised Taxonomy aligned)
 * Independent of Difficulty Level.
 */

export type CognitiveLevel =
  | "recall" // تذكر واسترجاع
  | "understanding" // فهم واستيعاب
  | "application" // تطبيق
  | "analysis" // تحليل
  | "evaluation" // تقييم ونقد
  | "integration"; // تكامل ودمج

export interface CognitiveConfigItem {
  id: CognitiveLevel;
  levelNumber: number;
  labelAr: string;
  labelEn: string;
  actionVerbsAr: string[];
  colorTheme: string;
}

export const COGNITIVE_CONFIG: Record<CognitiveLevel, CognitiveConfigItem> = {
  recall: {
    id: "recall",
    levelNumber: 1,
    labelAr: "المستوى 1: التذكر والاسترجاع المباشر",
    labelEn: "Recall / Knowledge",
    actionVerbsAr: ["عرّف", "اذكر", "عدد", "أكمل", "سمّ", "متى", "أين"],
    colorTheme: "text-sky-400 bg-sky-500/15 border-sky-500/30",
  },
  understanding: {
    id: "understanding",
    levelNumber: 2,
    labelAr: "المستوى 2: الفهم والاستيعاب والتعليل",
    labelEn: "Comprehension / Understanding",
    actionVerbsAr: ["اشرح", "علل", "وضح", "ما المقصود بـ", "ما العلاقة بين"],
    colorTheme: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  },
  application: {
    id: "application",
    levelNumber: 3,
    labelAr: "المستوى 3: التطبيق في مواقف وسيناريوهات",
    labelEn: "Application",
    actionVerbsAr: ["طبق", "استخدم", "احسب", "ماذا يحدث لو", "حدد الإجراء"],
    colorTheme: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  },
  analysis: {
    id: "analysis",
    levelNumber: 4,
    labelAr: "المستوى 4: التحليل والمقارنة والتصنيف",
    labelEn: "Analysis",
    actionVerbsAr: ["قارن", "ميز", "حلل", "رتب", "صنف", "استخرج الكلمة الشاذة"],
    colorTheme: "text-purple-400 bg-purple-500/15 border-purple-500/30",
  },
  evaluation: {
    id: "evaluation",
    levelNumber: 5,
    labelAr: "المستوى 5: التقييم ونقد الحلول",
    labelEn: "Evaluation",
    actionVerbsAr: ["قيم", "احكم", "برر", "انقد", "اختر الحل الأنسب مع التعليل"],
    colorTheme: "text-pink-400 bg-pink-500/15 border-pink-500/30",
  },
  integration: {
    id: "integration",
    levelNumber: 6,
    labelAr: "المستوى 6: التكامل والربط بين الدروس",
    labelEn: "Integration / Synthesis",
    actionVerbsAr: ["اربط بين", "ادمج", "استنتج أثر تكامل", "صمم حلاً متكاملاً"],
    colorTheme: "text-rose-400 bg-rose-500/15 border-rose-500/30",
  },
};
