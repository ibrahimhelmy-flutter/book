import {
  ExamGenerationConfig,
  ExamSystemResult,
  ExamBlueprint,
  GeneratedExamModel,
  ExamSection,
  CommitteeQuestion,
  CommitteeQuestionType,
  CognitiveLevel,
  DifficultyLevel,
  LessonWeightItem,
  ValidationItemResult,
  SystemValidationReport,
} from "./types";
import { getAllCommitteeQuestions } from "./committeeBank";
import { CURRICULUM_DATA } from "@/data/curriculum";

// ============================================================================
// 1. ContentAnalyzer & Scope Filter
// ============================================================================
export interface AnalyzedContentScope {
  targetLessons: {
    id: string;
    number: string;
    title: string;
    chapterNumber: number;
    chapterTitle: string;
    conceptsCount: number;
    sectionsCount: number;
    weightRatio: number;
  }[];
  totalConcepts: number;
  candidateQuestions: CommitteeQuestion[];
}

export function analyzeContentScope(config: ExamGenerationConfig): AnalyzedContentScope {
  let targetLessonIds: string[] = [];

  if (config.scope === "single_lesson") {
    targetLessonIds = config.lessonIds.slice(0, 1);
  } else if (config.scope === "multiple_lessons") {
    targetLessonIds = [...config.lessonIds];
  } else if (config.scope === "chapter") {
    const ch = CURRICULUM_DATA.find((c) => c.id === config.chapterId);
    if (ch) {
      targetLessonIds = ch.lessons.map((l) => l.id);
    }
  } else {
    // Entire Curriculum
    targetLessonIds = CURRICULUM_DATA.flatMap((ch) => ch.lessons.map((l) => l.id));
  }

  // If no lessons selected, default to all
  if (targetLessonIds.length === 0) {
    targetLessonIds = CURRICULUM_DATA.flatMap((ch) => ch.lessons.map((l) => l.id));
  }

  // Calculate lesson details and weights
  let totalConceptsCount = 0;
  const targetLessons = targetLessonIds.map((lId) => {
    let foundLesson: any = null;
    let foundChapter: any = null;

    for (const ch of CURRICULUM_DATA) {
      const l = ch.lessons.find((item) => item.id === lId);
      if (l) {
        foundLesson = l;
        foundChapter = ch;
        break;
      }
    }

    const conceptsCount = foundLesson?.keyConcepts?.length || 5;
    const sectionsCount = foundLesson?.sections?.length || 3;
    totalConceptsCount += conceptsCount;

    return {
      id: lId,
      number: foundLesson?.number || "1-1",
      title: foundLesson?.title || "درس المنهج",
      chapterNumber: foundChapter?.number || 1,
      chapterTitle: foundChapter?.title || "الفصل",
      conceptsCount,
      sectionsCount,
      weightRatio: 1, // normalized later
    };
  });

  // Normalize weight ratio based on concepts
  targetLessons.forEach((tl) => {
    tl.weightRatio = totalConceptsCount > 0 ? tl.conceptsCount / totalConceptsCount : 1 / targetLessons.length;
  });

  // Filter raw pool
  const allQuestions = getAllCommitteeQuestions();
  const candidateQuestions = allQuestions.filter((q) => {
    const isTargetLesson = targetLessonIds.includes(q.lessonId);
    // Allow cross-lesson questions if ANY connected lesson is in scope
    if (q.isCrossLesson) {
      if (config.scope === "curriculum" || targetLessonIds.length >= 2) {
        return true;
      }
    }
    return isTargetLesson;
  });

  return {
    targetLessons,
    totalConcepts: totalConceptsCount,
    candidateQuestions,
  };
}

// ============================================================================
// 2. QuestionBlueprintGenerator
// ============================================================================
export function generateQuestionBlueprint(
  config: ExamGenerationConfig,
  analysis: AnalyzedContentScope,
  actualQuestionCount: number
): ExamBlueprint {
  const totalQuestions = actualQuestionCount;
  const totalMarks = config.totalMarks || (totalQuestions <= 15 ? 30 : totalQuestions <= 30 ? 50 : 100);
  const durationMinutes =
    config.durationMinutes ||
    (totalQuestions <= 15 ? 15 : totalQuestions <= 30 ? 45 : totalQuestions <= 40 ? 60 : 90);

  // Calculate proportional lesson weights
  const lessonWeights: LessonWeightItem[] = analysis.targetLessons.map((tl) => {
    const qCount = Math.max(1, Math.round(totalQuestions * tl.weightRatio));
    return {
      lessonId: tl.id,
      lessonNumber: tl.number,
      lessonTitle: tl.title,
      chapterNumber: tl.chapterNumber,
      weightPercent: Math.round(tl.weightRatio * 100),
      questionCount: qCount,
      conceptsCount: tl.conceptsCount,
    };
  });

  // Cognitive Levels Target Distribution
  const dist = config.difficultyDistribution;
  const recallCount = Math.round(totalQuestions * (dist.easy / 100));
  const understandCount = Math.round(totalQuestions * (dist.medium / 100));
  const appCount = Math.round(totalQuestions * ((dist.hard * 0.5) / 100));
  const analysisCount = Math.round(totalQuestions * ((dist.hard * 0.5) / 100));
  const higherOrderCount = Math.max(1, totalQuestions - (recallCount + understandCount + appCount + analysisCount));

  const cognitiveDistribution: Record<CognitiveLevel, { count: number; percentage: number }> = {
    recall: { count: recallCount, percentage: dist.easy },
    understanding: { count: understandCount, percentage: dist.medium },
    application: { count: appCount, percentage: Math.round(dist.hard * 0.5) },
    analysis: { count: analysisCount, percentage: Math.round(dist.hard * 0.5) },
    higher_order: { count: higherOrderCount, percentage: dist.higherOrder },
  };

  const difficultyDistribution: Record<DifficultyLevel, { count: number; percentage: number }> = {
    easy: { count: recallCount, percentage: dist.easy },
    medium: { count: understandCount, percentage: dist.medium },
    hard: { count: appCount + analysisCount, percentage: dist.hard },
    higher_order: { count: higherOrderCount, percentage: dist.higherOrder },
  };

  let scopeLabel = "كامل المنهج الدراسي (14 درساً)";
  if (config.scope === "single_lesson") {
    scopeLabel = `الدرس ${analysis.targetLessons[0]?.number}: ${analysis.targetLessons[0]?.title}`;
  } else if (config.scope === "multiple_lessons") {
    scopeLabel = `${analysis.targetLessons.length} دروس مختارة`;
  } else if (config.scope === "chapter") {
    scopeLabel = `الفصل ${analysis.targetLessons[0]?.chapterNumber}: ${analysis.targetLessons[0]?.chapterTitle}`;
  }

  return {
    title: `جدول مواصفات الاختبار الوزاري (${scopeLabel})`,
    scopeLabel,
    totalQuestions,
    totalMarks,
    durationMinutes,
    lessonWeights,
    cognitiveDistribution,
    typeDistribution: {},
    difficultyDistribution,
  };
}

// ============================================================================
// 3. QuestionValidator (10-Point Committee Checklist)
// ============================================================================
export function validateQuestion(q: CommitteeQuestion, targetLessonIds: string[]): ValidationItemResult {
  const issues: string[] = [];
  let score = 10;

  // 1. Is it answerable from source?
  if (!q.modelAnswer || q.modelAnswer.trim().length === 0) {
    issues.push("لا توجد إجابة نموذجية مدعومة");
    score -= 3;
  }

  // 2. Is textbook answer provided?
  if (!q.textbookExactAnswer || q.textbookExactAnswer.trim().length === 0) {
    issues.push("النص الحرفي للكتاب غير مرفق");
    score -= 1;
  }

  // 3. Belongs to target lessons or valid cross-lesson
  if (!targetLessonIds.includes(q.lessonId) && !q.isCrossLesson) {
    issues.push("السؤال لا ينتمي للدروس المحددة لنطاق الامتحان");
    score -= 3;
  }

  // 4. Reasonable difficulty
  if (!["easy", "medium", "hard", "higher_order"].includes(q.difficulty)) {
    issues.push("تصنيف الصعوبة غير قياسي");
    score -= 1;
  }

  // 5. MCQ options validity
  if (q.questionType === "mcq") {
    if (!q.options || q.options.length < 2) {
      issues.push("خيارات الاختيار من متعدد غير كافية");
      score -= 2;
    }
  }

  // 6. Source reference exists
  if (!q.sourceReference || q.sourceReference.trim().length === 0) {
    issues.push("مرجع صفحة الكتاب مفقود");
    score -= 1;
  }

  // 7. Question text length
  if (!q.question || q.question.trim().length < 10) {
    issues.push("صياغة السؤال مقتضبة جداً");
    score -= 2;
  }

  const passed = score >= 7;
  return {
    questionId: q.id,
    passed,
    score: Math.max(0, score),
    issues,
  };
}

// ============================================================================
// 4. DuplicateDetector (Semantic and Exact Matching)
// ============================================================================
function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // Diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟"']/g, "")
    .replace(/\s+/g, " ");
}

export function isDuplicateQuestion(candidate: CommitteeQuestion, existingList: CommitteeQuestion[]): boolean {
  const candNorm = normalizeText(candidate.question);
  const candAnswer = normalizeText(candidate.modelAnswer);

  for (const item of existingList) {
    if (item.id === candidate.id) return true;

    const itemNorm = normalizeText(item.question);
    // Exact or near-exact match on question text
    if (candNorm === itemNorm) return true;

    // Same question text starts
    if (candNorm.length > 25 && itemNorm.length > 25) {
      if (candNorm.includes(itemNorm) || itemNorm.includes(candNorm)) return true;
    }

    // Same question type, same lesson, and identical answer
    if (
      item.lessonId === candidate.lessonId &&
      item.questionType === candidate.questionType &&
      candAnswer === normalizeText(item.modelAnswer) &&
      candAnswer.length > 8
    ) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// 5. ExamComposer & Multiple Model Generator
// ============================================================================
const MODEL_LETTERS = ["أ", "ب", "جـ", "د", "هـ", "و", "ز", "ح", "ط", "ي"];

export function generateExamSystem(config: ExamGenerationConfig): ExamSystemResult {
  const analysis = analyzeContentScope(config);
  const candidatePool = [...analysis.candidateQuestions];

  // Filter by allowed question types if not "all"
  let eligiblePool = candidatePool;
  if (config.questionTypes !== "all" && Array.isArray(config.questionTypes) && config.questionTypes.length > 0) {
    eligiblePool = candidatePool.filter((q) => config.questionTypes.includes(q.questionType));
  }
  if (eligiblePool.length === 0) {
    eligiblePool = candidatePool;
  }

  // Determine requested question count per exam
  let actualQuestionCount = 30;
  if (config.questionCount === "max") {
    actualQuestionCount = Math.min(eligiblePool.length, 120);
  } else if (typeof config.questionCount === "number") {
    actualQuestionCount = Math.min(config.questionCount, eligiblePool.length);
  }

  const blueprint = generateQuestionBlueprint(config, analysis, actualQuestionCount);
  const modelsCount = Math.max(1, Math.min(config.examCount || 1, 10));
  const models: GeneratedExamModel[] = [];

  // Track global usage across models for fair rotation
  const questionUsageCount: Record<string, number> = {};
  eligiblePool.forEach((q) => {
    questionUsageCount[q.id] = 0;
  });

  // Generate each Model (A, B, C, D...)
  for (let mIndex = 0; mIndex < modelsCount; mIndex++) {
    const letter = MODEL_LETTERS[mIndex] || `نموذج ${mIndex + 1}`;
    const code = `EXAM-2026-M${mIndex + 1}`;
    const selectedForThisModel: CommitteeQuestion[] = [];

    // Sort candidate pool dynamically favoring questions with least usage across previous models
    const sortedPool = [...eligiblePool].sort((a, b) => {
      const usageDiff = (questionUsageCount[a.id] || 0) - (questionUsageCount[b.id] || 0);
      if (usageDiff !== 0) return usageDiff;
      // Add slight randomness when usages are equal
      return 0.5 - Math.random();
    });

    // 1. Ensure proportional coverage per lesson
    for (const lw of blueprint.lessonWeights) {
      const lessonQuestions = sortedPool.filter(
        (q) => q.lessonId === lw.lessonId && !selectedForThisModel.some((sel) => sel.id === q.id)
      );

      const targetCountForLesson = Math.max(1, Math.round(actualQuestionCount * (lw.weightPercent / 100)));
      const taken = lessonQuestions.slice(0, targetCountForLesson);
      taken.forEach((q) => {
        if (!isDuplicateQuestion(q, selectedForThisModel)) {
          selectedForThisModel.push(q);
          questionUsageCount[q.id] = (questionUsageCount[q.id] || 0) + 1;
        }
      });
    }

    // 2. Fill remaining questions if needed up to actualQuestionCount
    if (selectedForThisModel.length < actualQuestionCount) {
      for (const q of sortedPool) {
        if (selectedForThisModel.length >= actualQuestionCount) break;
        if (!selectedForThisModel.some((sel) => sel.id === q.id) && !isDuplicateQuestion(q, selectedForThisModel)) {
          selectedForThisModel.push(q);
          questionUsageCount[q.id] = (questionUsageCount[q.id] || 0) + 1;
        }
      }
    }

    // 3. Randomize or sort options if requested
    const finalizedQuestions = selectedForThisModel.map((q) => {
      const qCopy = { ...q };
      if (config.randomizeOptions && qCopy.options && qCopy.options.length > 0) {
        qCopy.options = [...qCopy.options].sort(() => 0.5 - Math.random());
      }
      return qCopy;
    });

    // 4. Categorize into Official Ministry Exam Sections (A..E)
    // Section A: الاختيار من متعدد والمصطلحات
    const sectionA_Qs = finalizedQuestions.filter((q) => q.questionType === "mcq" || q.questionType === "term");
    // Section B: الصواب والخطأ والإكمال والمطابقة
    const sectionB_Qs = finalizedQuestions.filter(
      (q) => q.questionType === "true_false" || q.questionType === "complete" || q.questionType === "matching"
    );
    // Section C: التعليل والتفسير والمقارنة
    const sectionC_Qs = finalizedQuestions.filter(
      (q) => q.questionType === "give_reason" || q.questionType === "explain" || q.questionType === "compare"
    );
    // Section D: التطبيق والتحليل والترتيب والتصنيف
    const sectionD_Qs = finalizedQuestions.filter(
      (q) =>
        q.questionType === "what_if" ||
        q.questionType === "order" ||
        q.questionType === "classify" ||
        q.questionType === "odd_one_out" ||
        q.questionType === "short_answer"
    );
    // Section E: المستويات العليا والمقال الوزاري والربط بين الدروس
    const sectionE_Qs = finalizedQuestions.filter(
      (q) => q.questionType === "essay" || q.questionType === "cross_lesson"
    );

    const sections: ExamSection[] = [];

    if (sectionA_Qs.length > 0) {
      sections.push({
        id: `sec-A-${mIndex}`,
        sectionKey: "A",
        title: "القسم الأول (أ): أسئلة الاختيار من متعدد والمصطلحات العلمية",
        subtitle: "اختر الإجابة الصحيحة أو اكتب المصطلح العلمي الدال على كل عبارة بدقة",
        marks: sectionA_Qs.reduce((acc, q) => acc + q.marks, 0),
        questions: sectionA_Qs,
      });
    }

    if (sectionB_Qs.length > 0) {
      sections.push({
        id: `sec-B-${mIndex}`,
        sectionKey: "B",
        title: "القسم الثاني (ب): أسئلة الصواب والخطأ وإكمال الفراغات والتوصيل",
        subtitle: "ضع علامة صواب أو خطأ مع تصحيح الخطأ، وأكمل العبارات العلمية التالية",
        marks: sectionB_Qs.reduce((acc, q) => acc + q.marks, 0),
        questions: sectionB_Qs,
      });
    }

    if (sectionC_Qs.length > 0) {
      sections.push({
        id: `sec-C-${mIndex}`,
        sectionKey: "C",
        title: "القسم الثالث (جـ): أسئلة التعليل والتفسير العلمي والمقارنة",
        subtitle: "علل لما يأتي بأسلوب علمي وقارن بدقة بين المفاهيم المحددة في الجدول",
        marks: sectionC_Qs.reduce((acc, q) => acc + q.marks, 0),
        questions: sectionC_Qs,
      });
    }

    if (sectionD_Qs.length > 0) {
      sections.push({
        id: `sec-D-${mIndex}`,
        sectionKey: "D",
        title: "القسم الرابع (د): أسئلة التطبيق والترتيب والتصنيف المنطقي",
        subtitle: "طبق القواعد البرمجية والتقنية ورتب الخطوات وصنف العناصر التالية",
        marks: sectionD_Qs.reduce((acc, q) => acc + q.marks, 0),
        questions: sectionD_Qs,
      });
    }

    if (sectionE_Qs.length > 0) {
      sections.push({
        id: `sec-E-${mIndex}`,
        sectionKey: "E",
        title: "القسم الخامس (هـ): الأسئلة المقالية الوزارية ومستويات التفكير العليا",
        subtitle: "أجب عن الأسئلة المقالية التحليلية وأسئلة الربط التكاملي بين مفاهيم المنهج",
        marks: sectionE_Qs.reduce((acc, q) => acc + q.marks, 0),
        questions: sectionE_Qs,
      });
    }

    // Fallback: If no sections created (unlikely), wrap all into single section
    if (sections.length === 0) {
      sections.push({
        id: `sec-all-${mIndex}`,
        sectionKey: "A",
        title: "كافة أسئلة الامتحان",
        subtitle: "أجب عن كافة الأسئلة التالية",
        marks: finalizedQuestions.reduce((acc, q) => acc + q.marks, 0),
        questions: finalizedQuestions,
      });
    }

    const calculatedTotalMarks = finalizedQuestions.reduce((acc, q) => acc + q.marks, 0);

    models.push({
      modelId: `model-${mIndex + 1}`,
      modelLetter: letter,
      modelCode: code,
      title: `امتحان مادة البرمجة والذكاء الاصطناعي — النموذج (${letter})`,
      subject: "البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي (بكالوريا مصرية)",
      academicYear: "العام الدراسي 2026 / 2027",
      durationMinutes: blueprint.durationMinutes,
      totalMarks: calculatedTotalMarks,
      blueprint,
      sections,
      allQuestions: finalizedQuestions,
    });
  }

  // Update blueprint type distribution
  const typeMap: Record<string, number> = {};
  models[0]?.allQuestions.forEach((q) => {
    typeMap[q.questionType] = (typeMap[q.questionType] || 0) + 1;
  });
  blueprint.typeDistribution = typeMap;

  return {
    config,
    blueprint,
    models,
    totalQuestionsInPool: eligiblePool.length,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// 6. System Validation Report
// ============================================================================
export function runSystemValidationCheck(questions: CommitteeQuestion[]): SystemValidationReport {
  const targetLessonIds = CURRICULUM_DATA.flatMap((ch) => ch.lessons.map((l) => l.id));
  const results: ValidationItemResult[] = [];
  let totalScore = 0;
  let passCount = 0;

  for (const q of questions) {
    const res = validateQuestion(q, targetLessonIds);
    results.push(res);
    totalScore += res.score;
    if (res.passed) passCount++;
  }

  return {
    totalQuestionsChecked: questions.length,
    passCount,
    failCount: questions.length - passCount,
    averageScore: questions.length > 0 ? Math.round((totalScore / questions.length) * 10) / 10 : 10,
    results,
  };
}
