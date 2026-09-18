import { ALL_DEEP_QUESTIONS, DeepChallengingQuestion } from "@/data/deep-questions";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { matchesSearch } from "@/lib/arabic";
import {
  GeneratedExamModel,
  CommitteeQuestion,
  ExamBlueprint,
  ExamSection,
} from "@/lib/exam-generator/types";

export type SimpleDifficulty = "easy" | "medium" | "hard";

export interface SimpleQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: SimpleDifficulty;
}

export interface EnrichedSimpleQuestion extends SimpleQuestion {
  id: string;
  lessonKey: string; // e.g. "1-1" or "1-review"
  lessonId: string; // e.g. "lesson-1-1" or "chapter-1-review"
  lessonTitle: string;
  chapterId: string; // e.g. "chapter-1"
  chapterNumber: number;
  chapterTitle: string;
  explanation?: string;
  isUnitReview?: boolean;
}

export interface PracticeFilterOptions {
  chapterIds?: string[];
  lessonKeys?: string[];
  difficulty?: SimpleDifficulty | "all";
  searchQuery?: string;
  unitReviewOnly?: boolean;
}

export const DIFFICULTY_LABELS_AR: Record<SimpleDifficulty, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

/**
 * Validates and converts an existing deep question into a strict 4-field SimpleQuestion.
 *
 * Rules:
 * 1. Question must be a non-empty string.
 * 2. Options must contain exactly 4 non-empty string choices.
 * 3. Correct answer must exist within options.
 * 4. Difficulty must map cleanly to "easy" | "medium" | "hard".
 * 5. Returns strictly an object with only: { question, options, answer, difficulty }.
 *    Returns null if validation fails.
 */
export function validateAndConvertDeepQuestion(
  rawQuestion: unknown
): SimpleQuestion | null {
  if (!rawQuestion || typeof rawQuestion !== "object") {
    return null;
  }

  const q = rawQuestion as Partial<DeepChallengingQuestion> & { answer?: string };

  // 1. Validate question text
  if (typeof q.question !== "string" || !q.question.trim()) {
    return null;
  }

  // 2. Validate options (must be exactly 4 valid strings)
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return null;
  }

  const options = q.options.map((opt) =>
    typeof opt === "string" ? opt.trim() : ""
  );

  if (options.some((opt) => !opt) || options.length !== 4) {
    return null;
  }

  // 3. Resolve and validate the correct answer
  let answer = "";
  if (typeof q.correctAnswerText === "string" && q.correctAnswerText.trim()) {
    answer = q.correctAnswerText.trim();
  } else if (
    typeof q.correctAnswer === "number" &&
    q.correctAnswer >= 0 &&
    q.correctAnswer < options.length
  ) {
    answer = options[q.correctAnswer];
  } else if (typeof q.answer === "string" && q.answer.trim()) {
    answer = q.answer.trim();
  }

  if (!answer || !options.includes(answer)) {
    return null;
  }

  // 4. Map difficulty to standard "easy" | "medium" | "hard"
  let difficulty: SimpleDifficulty = "medium";
  const rawDiff = String(q.difficulty || "").toLowerCase().trim();

  if (rawDiff === "easy" || rawDiff === "سهل") {
    difficulty = "easy";
  } else if (
    rawDiff === "hard" ||
    rawDiff === "very-hard" ||
    rawDiff === "expert" ||
    rawDiff === "صعب" ||
    rawDiff === "صعب جدا"
  ) {
    difficulty = "hard";
  } else {
    difficulty = "medium";
  }

  // Combine scenario with question if present so the question is fully self-contained
  const fullQuestionText =
    q.scenario && typeof q.scenario === "string" && q.scenario.trim()
      ? `${q.scenario.trim()}\n${q.question.trim()}`
      : q.question.trim();

  // 5. Construct and return strictly 4 keys only (no id, no metadata)
  return {
    question: fullQuestionText,
    options,
    answer,
    difficulty,
  };
}

/**
 * Curated canonical sample dataset adhering strictly to the 4-field schema.
 */
export const CANONICAL_SIMPLE_SAMPLE_QUESTIONS: SimpleQuestion[] = [
  {
    question: "ما الفكرة التي تلخص تطور تكنولوجيا المعلومات كما يعرضها المنهج؟",
    options: [
      "كل مرحلة أضافت جهازًا جديدًا وغيّرت طريقة تواصل المجتمع وعمله وتجارته",
      "كل مرحلة غيّرت شكل الأجهزة فقط دون أثر اجتماعي",
      "التطور اقتصر على زيادة عدد التطبيقات",
      "التطور انتهى مع ظهور الإنترنت",
    ],
    answer: "كل مرحلة أضافت جهازًا جديدًا وغيّرت طريقة تواصل المجتمع وعمله وتجارته",
    difficulty: "medium",
  },
  {
    question: "أي العبارات الآتية تصف قانون مور (Moore's Law) بدقة وفق الكتاب المدرسي؟",
    options: [
      "مضاعفة عدد الترانزستورات على شريحة السيليكون كل عامين تقريباً مع انخفاض التكلفة",
      "مضاعفة سرعة الإنترنت كل ستة أشهر عالمياً",
      "انخفاض حجم أجهزة الحاسوب إلى النصف كل عشر سنوات",
      "ثبات عدد الترانزستورات مع مضاعفة استهلاك الطاقة الكهربائية",
    ],
    answer: "مضاعفة عدد الترانزستورات على شريحة السيليكون كل عامين تقريباً مع انخفاض التكلفة",
    difficulty: "easy",
  },
  {
    question: "ما الفرق الجوهري بين التشفير المتماثل (Symmetric) وغير المتماثل (Asymmetric)؟",
    options: [
      "المتماثل يستخدم نفس المفتاح للتشفير وفك التشفير بينما غير المتماثل يستخدم مفتاحين (عام وخاص)",
      "المتماثل يستخدم للشبكات اللاسلكية فقط وغير المتماثل للشبكات السلكية",
      "غير المتماثل أسرع في المعالجة من المتماثل لجميع أحجام البيانات",
      "المتماثل لا يحتاج إلى مفاتيح إطلاقاً بينما غير المتماثل يتطلب ثلاثة مفاتيح",
    ],
    answer: "المتماثل يستخدم نفس المفتاح للتشفير وفك التشفير بينما غير المتماثل يستخدم مفتاحين (عام وخاص)",
    difficulty: "hard",
  },
  {
    question: "ما الدور الرئيسي لبروتوكول HTTPS عند تصفح مواقع الويب؟",
    options: [
      "تأمين وتشفير نقل البيانات بين متصفح المستخدم والخادم عبر طبقة TLS/SSL",
      "زيادة سرعة تحميل الصور ومقاطع الفيديو على صفحات الويب",
      "تخزين قواعد البيانات على جهاز العميل تلقائياً",
      "إنشاء تصميمات متجاوبة تتوافق مع الهواتف الذكية",
    ],
    answer: "تأمين وتشفير نقل البيانات بين متصفح المستخدم والخادم عبر طبقة TLS/SSL",
    difficulty: "easy",
  },
];

/**
 * Retrieves all validated simple questions from the curriculum deep questions bank.
 */
export function getAllSimpleQuestions(): SimpleQuestion[] {
  const result: SimpleQuestion[] = [];
  const seenQuestions = new Set<string>();

  for (const lessonKey of Object.keys(ALL_DEEP_QUESTIONS)) {
    const list = ALL_DEEP_QUESTIONS[lessonKey] || [];
    for (const rawQ of list) {
      const converted = validateAndConvertDeepQuestion(rawQ);
      if (converted && !seenQuestions.has(converted.question)) {
        seenQuestions.add(converted.question);
        result.push(converted);
      }
    }
  }

  // Fallback to canonical sample if question bank is somehow empty
  if (result.length === 0) {
    return CANONICAL_SIMPLE_SAMPLE_QUESTIONS;
  }

  return result;
}

/**
 * Filter simple questions by difficulty.
 */
export function filterSimpleQuestionsByDifficulty(
  questions: SimpleQuestion[],
  difficulty: SimpleDifficulty | "all"
): SimpleQuestion[] {
  if (!difficulty || difficulty === "all") {
    return questions;
  }
  return questions.filter((q) => q.difficulty === difficulty);
}

// Build lesson metadata lookup map
const LESSON_METADATA_MAP = new Map<
  string,
  {
    chapterId: string;
    chapterNumber: number;
    chapterTitle: string;
    lessonId: string;
    lessonTitle: string;
  }
>();

for (const ch of CURRICULUM_DATA) {
  // Register Unit Review metadata for each chapter
  const reviewMeta = {
    chapterId: ch.id,
    chapterNumber: ch.number,
    chapterTitle: ch.title,
    lessonId: `chapter-${ch.number}-review`,
    lessonTitle: `مراجعة شاملة على الوحدة ${ch.number} (أسئلة الربط والتحليل)`,
  };
  LESSON_METADATA_MAP.set(`${ch.number}-review`, reviewMeta);
  LESSON_METADATA_MAP.set(`unit-${ch.number}-review`, reviewMeta);
  LESSON_METADATA_MAP.set(`chapter-${ch.number}-review`, reviewMeta);

  for (const l of ch.lessons) {
    const meta = {
      chapterId: ch.id,
      chapterNumber: ch.number,
      chapterTitle: ch.title,
      lessonId: l.id,
      lessonTitle: l.title,
    };
    LESSON_METADATA_MAP.set(l.number, meta);
    LESSON_METADATA_MAP.set(l.id, meta);
    LESSON_METADATA_MAP.set(l.id.replace(/^lesson-/, ""), meta);
  }
}

/**
 * Retrieves all validated questions enriched with lesson and chapter metadata.
 */
export function getAllEnrichedQuestions(): EnrichedSimpleQuestion[] {
  const result: EnrichedSimpleQuestion[] = [];
  const seenQuestions = new Set<string>();

  for (const rawKey of Object.keys(ALL_DEEP_QUESTIONS)) {
    const list = ALL_DEEP_QUESTIONS[rawKey] || [];
    const meta = LESSON_METADATA_MAP.get(rawKey) || {
      chapterId: "chapter-1",
      chapterNumber: 1,
      chapterTitle: "المنهج الدراسي",
      lessonId: `lesson-${rawKey}`,
      lessonTitle: `الدرس ${rawKey}`,
    };
    const isReview = rawKey.includes("-review") || rawKey.startsWith("unit-") || rawKey.endsWith("-review");

    list.forEach((rawQ, idx) => {
      const converted = validateAndConvertDeepQuestion(rawQ);
      if (converted && !seenQuestions.has(converted.question)) {
        seenQuestions.add(converted.question);
        result.push({
          ...converted,
          id: `EQ-${rawKey}-${idx + 1}`,
          lessonKey: rawKey,
          lessonId: meta.lessonId,
          lessonTitle: meta.lessonTitle,
          chapterId: meta.chapterId,
          chapterNumber: meta.chapterNumber,
          chapterTitle: meta.chapterTitle,
          explanation:
            typeof rawQ.depthExplanation === "string" && rawQ.depthExplanation.trim().length > 0
              ? rawQ.depthExplanation.trim()
              : undefined,
          isUnitReview: isReview,
        });
      }
    });
  }

  // If question bank is somehow empty, fall back to sample questions
  if (result.length === 0) {
    return CANONICAL_SIMPLE_SAMPLE_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `SAMPLE-EQ-${idx + 1}`,
      lessonKey: "1-1",
      lessonId: "lesson-1-1",
      lessonTitle: "تطور تكنولوجيا المعلومات والتحول الاجتماعي",
      chapterId: "chapter-1",
      chapterNumber: 1,
      chapterTitle: "تكنولوجيا المعلومات والمجتمع",
      isUnitReview: false,
    }));
  }

  return result;
}

/**
 * Filters enriched questions by chapter(s), lesson(s), difficulty, search query, and unit review.
 */
export function filterEnrichedQuestions(
  questions: EnrichedSimpleQuestion[],
  options: PracticeFilterOptions
): EnrichedSimpleQuestion[] {
  let filtered = questions;

  // 1. Filter by Chapter(s)
  if (options.chapterIds && options.chapterIds.length > 0) {
    const chSet = new Set(options.chapterIds);
    filtered = filtered.filter((q) => chSet.has(q.chapterId));
  }

  // 2. Filter by Unit Review Only
  if (options.unitReviewOnly) {
    filtered = filtered.filter((q) => q.isUnitReview || q.lessonKey.includes("-review"));
  }

  // 3. Filter by Lesson(s)
  if (options.lessonKeys && options.lessonKeys.length > 0) {
    const lessonSet = new Set(options.lessonKeys);
    filtered = filtered.filter(
      (q) => lessonSet.has(q.lessonKey) || lessonSet.has(q.lessonId)
    );
  }

  // 4. Filter by Difficulty
  if (options.difficulty && options.difficulty !== "all") {
    filtered = filtered.filter((q) => q.difficulty === options.difficulty);
  }

  // 5. Filter by Search Query
  if (options.searchQuery && options.searchQuery.trim() !== "") {
    const query = options.searchQuery.trim();
    filtered = filtered.filter((q) => {
      if (matchesSearch(q.question, query)) return true;
      if (matchesSearch(q.lessonTitle, query)) return true;
      if (matchesSearch(q.chapterTitle, query)) return true;
      return q.options.some((opt) => matchesSearch(opt, query));
    });
  }

  return filtered;
}

/**
 * Generates an interactive exam model ready for ExamInteractiveRunner from an array of questions.
 */
export function createExamModelFromQuestions(
  questions: EnrichedSimpleQuestion[],
  options?: {
    title?: string;
    durationMinutes?: number;
    maxQuestions?: number;
    randomize?: boolean;
  }
): GeneratedExamModel {
  const maxCount = options?.maxQuestions || 20;
  let pool = [...questions];

  if (options?.randomize !== false) {
    // Deterministic or pseudorandom shuffle
    pool = pool.sort(() => 0.5 - Math.random());
  }

  const selected = pool.slice(0, Math.min(pool.length, maxCount));
  const count = selected.length;
  const duration = options?.durationMinutes || Math.max(15, Math.round(count * 1.8));
  const totalMarks = count * 2;

  const committeeQuestions: CommitteeQuestion[] = selected.map((q, idx) => ({
    id: q.id || `EXAM-Q-${idx + 1}`,
    chapterId: q.chapterId,
    chapterNumber: q.chapterNumber,
    chapterTitle: q.chapterTitle,
    lessonId: q.lessonId,
    lessonNumber: q.lessonKey,
    lessonTitle: q.lessonTitle,
    topic: q.lessonTitle,
    page: "كتاب الوزارة",
    sourceSection: q.lessonTitle,
    sourceReference: `${q.chapterTitle} ← ${q.lessonTitle}`,
    questionType: "mcq",
    difficulty: q.difficulty,
    cognitiveLevel: "understanding",
    question: q.question,
    options: q.options.map((opt, oIdx) => ({
      id: ["a", "b", "c", "d"][oIdx] || `opt-${oIdx}`,
      text: opt,
    })),
    modelAnswer: q.answer,
    textbookExactAnswer: q.answer,
    marks: 2,
    estimatedTimeMinutes: 1.5,
    keywords: [q.lessonTitle, q.chapterTitle],
  }));

  const blueprint: ExamBlueprint = {
    title: options?.title || "اختبار إلكتروني مخصص",
    scopeLabel: "نطاق مخصص",
    totalQuestions: count,
    totalMarks,
    durationMinutes: duration,
    lessonWeights: [],
    cognitiveDistribution: {
      recall: { count: 0, percentage: 0 },
      understanding: { count, percentage: 100 },
      application: { count: 0, percentage: 0 },
      analysis: { count: 0, percentage: 0 },
      higher_order: { count: 0, percentage: 0 },
    },
    typeDistribution: { mcq: count },
    difficultyDistribution: {
      easy: {
        count: selected.filter((q) => q.difficulty === "easy").length,
        percentage: 0,
      },
      medium: {
        count: selected.filter((q) => q.difficulty === "medium").length,
        percentage: 0,
      },
      hard: {
        count: selected.filter((q) => q.difficulty === "hard").length,
        percentage: 0,
      },
      higher_order: { count: 0, percentage: 0 },
    },
  };

  const sections: ExamSection[] = [
    {
      id: "section-1",
      sectionKey: "A",
      title: "القسم الأول: أسئلة الاختيار من متعدد",
      subtitle: `${count} أسئلة موضوعية تقيس الفهم والتطبيق`,
      marks: totalMarks,
      questions: committeeQuestions,
    },
  ];

  return {
    modelId: `custom-exam-${Date.now()}`,
    modelLetter: "أ",
    modelCode: "EXAM-PRACTICE-1",
    title: options?.title || "اختبار تدريبي إلكتروني",
    subject: "تكنولوجيا المعلومات والذكاء الاصطناعي",
    academicYear: "2025 / 2026",
    durationMinutes: duration,
    totalMarks,
    blueprint,
    sections,
    allQuestions: committeeQuestions,
  };
}
