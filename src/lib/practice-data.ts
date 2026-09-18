import { ALL_DEEP_QUESTIONS, DeepChallengingQuestion } from "@/data/deep-questions";

export type SimpleDifficulty = "easy" | "medium" | "hard";

export interface SimpleQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: SimpleDifficulty;
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
