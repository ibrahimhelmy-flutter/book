/**
 * Centralized Exam Presets & Blueprint Profiles
 */

export interface ExamPresetProfile {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  defaultQuestionsCount: number | "max";
  defaultDurationMinutes: number;
  defaultMarks: number;
  recommendedExamCount: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    advanced: number;
  };
}

export const EXAM_PROFILES_CONFIG: Record<string, ExamPresetProfile> = {
  quick_quiz: {
    id: "quick_quiz",
    titleAr: "اختبار تشخيصي سريع (Quick Quiz)",
    titleEn: "Quick Diagnostic Quiz",
    descriptionAr: "10 إلى 15 سؤالاً للتحقق السريع من الاستيعاب المباشر والمفاهيم الأساسية.",
    defaultQuestionsCount: 15,
    defaultDurationMinutes: 15,
    defaultMarks: 30,
    recommendedExamCount: 1,
    difficultyDistribution: { easy: 50, medium: 35, hard: 15, advanced: 0 },
  },
  lesson_test: {
    id: "lesson_test",
    titleAr: "اختبار الدرس التقييمي (Lesson Test)",
    titleEn: "Lesson Mastery Test",
    descriptionAr: "تقييم شامل ومتدرج لدرس واحد من الاسترجاع حتى التطبيق والتحليل.",
    defaultQuestionsCount: 25,
    defaultDurationMinutes: 30,
    defaultMarks: 50,
    recommendedExamCount: 1,
    difficultyDistribution: { easy: 25, medium: 45, hard: 20, advanced: 10 },
  },
  monthly_exam: {
    id: "monthly_exam",
    titleAr: "اختبار الشهر المعتمد (Monthly Exam)",
    titleEn: "Monthly Assessment",
    descriptionAr: "اختبار شهري وزاري يغطي فصلاً أو عدة دروس بتوازن معياري دقيق.",
    defaultQuestionsCount: 35,
    defaultDurationMinutes: 45,
    defaultMarks: 70,
    recommendedExamCount: 1,
    difficultyDistribution: { easy: 25, medium: 40, hard: 25, advanced: 10 },
  },
  midterm_exam: {
    id: "midterm_exam",
    titleAr: "امتحان منتصف الفصل (Midterm Exam)",
    titleEn: "Midterm Exam",
    descriptionAr: "امتحان متوازن يغطي نصف المنهج بنسب مواصفات متكافئة.",
    defaultQuestionsCount: 40,
    defaultDurationMinutes: 60,
    defaultMarks: 80,
    recommendedExamCount: 2,
    difficultyDistribution: { easy: 20, medium: 45, hard: 25, advanced: 10 },
  },
  final_exam: {
    id: "final_exam",
    titleAr: "امتحان نهاية الترم الشامل (Final Exam)",
    titleEn: "Final Comprehensive Exam",
    descriptionAr: "البوكليت الوزاري النهائي الشامل لكافة فصول ودروس الكتاب.",
    defaultQuestionsCount: 50,
    defaultDurationMinutes: 90,
    defaultMarks: 100,
    recommendedExamCount: 3,
    difficultyDistribution: { easy: 20, medium: 45, hard: 25, advanced: 10 },
  },
  revision_bank: {
    id: "revision_bank",
    titleAr: "بنك المراجعة العامة الشامل (Revision Bank)",
    titleEn: "Complete Revision Bank",
    descriptionAr: "الحد الأقصى المفيد من الأسئلة المحلولة لجميع الدروس مع النصوص المرجعية.",
    defaultQuestionsCount: "max",
    defaultDurationMinutes: 120,
    defaultMarks: 150,
    recommendedExamCount: 1,
    difficultyDistribution: { easy: 30, medium: 40, hard: 20, advanced: 10 },
  },
  honors_exam: {
    id: "honors_exam",
    titleAr: "امتحان الطلاب الفائقين والمتفوقين (Honors)",
    titleEn: "Honors & Olympiad Exam",
    descriptionAr: "تركيز مكثف على مستويات التفكير العليا والتكامل والتحليل المعمق.",
    defaultQuestionsCount: 30,
    defaultDurationMinutes: 60,
    defaultMarks: 60,
    recommendedExamCount: 1,
    difficultyDistribution: { easy: 10, medium: 25, hard: 45, advanced: 20 },
  },
  parallel_models: {
    id: "parallel_models",
    titleAr: "نماذج اختبارية متكافئة للجان (A / B / C Models)",
    titleEn: "Parallel Balanced Exam Models",
    descriptionAr: "عدة نماذج متطابقة في المواصفات لتفادي الغش في اللجان الامتحانية.",
    defaultQuestionsCount: 30,
    defaultDurationMinutes: 60,
    defaultMarks: 60,
    recommendedExamCount: 4,
    difficultyDistribution: { easy: 25, medium: 40, hard: 25, advanced: 10 },
  },
};
