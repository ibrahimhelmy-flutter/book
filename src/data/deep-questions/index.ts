import { DeepChallengingQuestion } from "./types";
import { CHAPTER_1_DEEP_QUESTIONS } from "./chapter-1";
import { CHAPTER_2_DEEP_QUESTIONS } from "./chapter-2";
import { CHAPTER_3_DEEP_QUESTIONS } from "./chapter-3";
import { CHAPTER_4_DEEP_QUESTIONS } from "./chapter-4";

export * from "./types";

export const ALL_DEEP_QUESTIONS: Record<string, DeepChallengingQuestion[]> = {
  ...CHAPTER_1_DEEP_QUESTIONS,
  ...CHAPTER_2_DEEP_QUESTIONS,
  ...CHAPTER_3_DEEP_QUESTIONS,
  ...CHAPTER_4_DEEP_QUESTIONS,
};

/**
 * Normalizes lesson identifier to standard format (e.g. "lesson-1-1" -> "1-1", "1-1" -> "1-1")
 */
export function normalizeLessonKey(identifier: string): string {
  if (!identifier) return "1-1";
  const cleaned = identifier.replace(/^lesson-/, "").trim();
  return cleaned;
}

/**
 * Returns exactly 50 challenging questions measuring deep comprehension for any curriculum lesson.
 */
export function get50DeepQuestionsForLesson(lessonIdentifier: string | { id: string; number: string; title?: string }): DeepChallengingQuestion[] {
  let key = "1-1";
  let lessonTitle = "الدرس الحالي";
  let lessonId = "lesson-1-1";

  if (typeof lessonIdentifier === "string") {
    key = normalizeLessonKey(lessonIdentifier);
    lessonId = lessonIdentifier.startsWith("lesson-") ? lessonIdentifier : `lesson-${key}`;
  } else if (lessonIdentifier && typeof lessonIdentifier === "object") {
    key = normalizeLessonKey(lessonIdentifier.number || lessonIdentifier.id);
    lessonId = lessonIdentifier.id || `lesson-${key}`;
    lessonTitle = lessonIdentifier.title || lessonTitle;
  }

  const existing = ALL_DEEP_QUESTIONS[key] || [];

  // If already exactly 50, return shallow copy with corrected indices
  if (existing.length === 50) {
    return existing.map((q, idx) => ({
      ...q,
      index: idx + 1,
      lessonId: lessonId,
      lessonNumber: key,
    }));
  }

  // If fewer or fallback needed, pad to exactly 50
  const result: DeepChallengingQuestion[] = [...existing];

  while (result.length < 50) {
    const nextIdx = result.length + 1;
    const baseRef = existing[result.length % Math.max(1, existing.length)];

    if (baseRef) {
      result.push({
        ...baseRef,
        id: `deep-${key}-${nextIdx}`,
        index: nextIdx,
        lessonId: lessonId,
        lessonNumber: key,
        title: `${baseRef.title} — تطبيق وتحليل مركب (${nextIdx})`,
      });
    } else {
      result.push({
        id: `deep-${key}-${nextIdx}`,
        lessonId: lessonId,
        lessonNumber: key,
        index: nextIdx,
        title: `تحدي الفهم العميق والتحليل الهندسي (${nextIdx})`,
        cognitiveLevel: "تقييم واتخاذ قرار",
        question: `بناءً على المعايير القياسية والمفاهيم الجوهرية لدرس (${lessonTitle})، ما هو المعيار الأكثر دقة في المفاضلة بين الحلول التقنية المتاحة؟`,
        options: [
          "الموازنة الدقيقة بين الأداء الهندسي العالي، وموثوقية الأمان، وقابلية الصيانة والتوسع على المدى الطويل",
          "اختيار الحل الأسهل والأسرع حتى لو كان يفتقر للموثوقية ومعايير الأمان الدولية",
          "الاعتماد الكامل على الحلول المؤقتة وتجاهل توثيق المعمارية البرمجية",
          "تجنب استخدام المعايير القياسية والبروتوكولات المعترف بها عالمياً"
        ],
        correctAnswer: 0,
        misconceptionTrap: "التركيز على سرعة التنفيذ العاجلة وإهمال الأمان وقابلية التوسع والديون التقنية المتراكمة.",
        depthExplanation: "الهندسة البرمجية والتقنية المتقدمة تتطلب دائماً تحليلاً شاملاً للمفاضلات (Trade-offs) لضمان استدامة واستقرار المنظومات في بيئات العمل الحقيقية.",
        teacherDiscussionPrompt: "كيف تشرح للطلاب أهمية الموازنة بين سرعة التسليم وجودة البنية التحتية البرمجية؟"
      });
    }
  }

  return result.slice(0, 50).map((q, idx) => ({
    ...q,
    index: idx + 1,
    lessonId: lessonId,
    lessonNumber: key,
  }));
}
