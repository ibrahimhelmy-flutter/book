/**
 * Pure helpers for the exams page (no React, no data imports — runnable under tsx).
 *
 * Counts shown before any fetch come from the precomputed ExamsIndex; question banks are fetched
 * per lesson for the current scope only, then filtered here by difficulty / section / type / search.
 */
import type { ExamsIndex, NavChapter, NavLesson } from "@/types/catalog";
import type { OfficialAssessmentQuestion, OfficialAssessmentSectionType } from "@/types/assessments";
import type { EnrichedSimpleQuestion, SimpleDifficulty } from "@/lib/practice";
import { matchesSearch } from "@/lib/arabic";

export type ExamsTab = "official" | "practice" | "presets";
export type OfficialSectionFilter = OfficialAssessmentSectionType | "all";
export type OfficialTypeFilter = "all" | "mcq" | "essay";
export type DifficultyFilter = SimpleDifficulty | "all";
export type PracticeEntry = ExamsIndex["practice"][number];
export type OfficialEntry = ExamsIndex["official"][number];

export const PAGE_SIZE = 10;

/** Lesson selection sentinel: the user cleared every lesson (an empty selection means "all"). */
export const NO_LESSONS = "NONE";

export const OFFICIAL_SECTIONS: { id: OfficialSectionFilter; label: string; shortLabel: string }[] = [
  { id: "all", label: "جميع أقسام التقييم", shortLabel: "الكل" },
  { id: "performance_task_1", label: "المهام الأدائية (الفترة الأولى)", shortLabel: "مهام أدائية ف1" },
  { id: "performance_task_2", label: "المهام الأدائية (الفترة الثانية)", shortLabel: "مهام أدائية ف2" },
  { id: "homework", label: "أداءات منزلية (الواجب المنزلي)", shortLabel: "واجب منزلي" },
  { id: "weekly_model_a", label: "التقييم الأسبوعي — النموذج (A)", shortLabel: "نموذج A" },
  { id: "weekly_model_b", label: "التقييم الأسبوعي — النموذج (B)", shortLabel: "نموذج B" },
  { id: "weekly_model_c", label: "التقييم الأسبوعي — النموذج (C)", shortLabel: "نموذج C" },
];

export const OFFICIAL_TYPES: { id: OfficialTypeFilter; label: string }[] = [
  { id: "all", label: "جميع الأسئلة (مقالي واختيار)" },
  { id: "mcq", label: "اختيار من متعدد (MCQ)" },
  { id: "essay", label: "أسئلة مقالية ومشروعات" },
];

// ---------------------------------------------------------------------------
// Filter state (reducer)
// ---------------------------------------------------------------------------

export interface ScopeSelection {
  /** Empty = all chapters. */
  chapterIds: string[];
  /** Lesson numbers ("1-1"). Empty = every lesson of the selected chapters; [NO_LESSONS] = none. */
  lessonKeys: string[];
  /** Practice only: restrict to unit-review sets ("1-review"). */
  unitReviewOnly: boolean;
}

export interface ExamsFilterState extends ScopeSelection {
  difficulty: DifficultyFilter;
  search: string;
  officialSection: OfficialSectionFilter;
  officialType: OfficialTypeFilter;
  practicePage: number;
  officialPage: number;
  questionIndex: number;
}

export const INITIAL_FILTERS: ExamsFilterState = {
  chapterIds: [],
  lessonKeys: [],
  unitReviewOnly: false,
  difficulty: "all",
  search: "",
  officialSection: "all",
  officialType: "all",
  practicePage: 1,
  officialPage: 1,
  questionIndex: 0,
};

export type ExamsFilterAction =
  | { type: "toggleChapter"; chapterId: string }
  | { type: "allChapters" }
  | { type: "toggleLesson"; lessonKey: string }
  | { type: "allLessons" }
  | { type: "clearLessons" }
  | { type: "toggleUnitReview"; fallbackChapterId: string | null }
  | { type: "setDifficulty"; difficulty: DifficultyFilter }
  | { type: "setSearch"; search: string }
  | { type: "setOfficialSection"; section: OfficialSectionFilter }
  | { type: "setOfficialType"; officialType: OfficialTypeFilter }
  | { type: "reset" }
  | { type: "setPracticePage"; page: number }
  | { type: "setOfficialPage"; page: number }
  | { type: "setQuestionIndex"; index: number };

/** Every filter change sends both lists back to page 1 and the single-question player to the first question. */
const PAGES_RESET = { practicePage: 1, officialPage: 1, questionIndex: 0 } as const;

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function examsFilterReducer(state: ExamsFilterState, action: ExamsFilterAction): ExamsFilterState {
  switch (action.type) {
    case "toggleChapter":
      // Changing chapters resets the lesson selection to "all lessons of the selected chapters".
      return { ...state, ...PAGES_RESET, chapterIds: toggleIn(state.chapterIds, action.chapterId), lessonKeys: [] };
    case "allChapters":
      return { ...state, ...PAGES_RESET, chapterIds: [], lessonKeys: [], unitReviewOnly: false };
    case "toggleLesson": {
      const base = state.lessonKeys.includes(NO_LESSONS) ? [] : state.lessonKeys;
      return { ...state, ...PAGES_RESET, lessonKeys: toggleIn(base, action.lessonKey) };
    }
    case "allLessons":
      return { ...state, ...PAGES_RESET, lessonKeys: [] };
    case "clearLessons":
      return { ...state, ...PAGES_RESET, lessonKeys: [NO_LESSONS] };
    case "toggleUnitReview": {
      const next = !state.unitReviewOnly;
      const chapterIds =
        next && state.chapterIds.length === 0 && action.fallbackChapterId ? [action.fallbackChapterId] : state.chapterIds;
      return { ...state, ...PAGES_RESET, unitReviewOnly: next, chapterIds, lessonKeys: [] };
    }
    case "setDifficulty":
      return { ...state, ...PAGES_RESET, difficulty: action.difficulty };
    case "setSearch":
      return { ...state, ...PAGES_RESET, search: action.search };
    case "setOfficialSection":
      return { ...state, ...PAGES_RESET, officialSection: action.section };
    case "setOfficialType":
      return { ...state, ...PAGES_RESET, officialType: action.officialType };
    case "reset":
      return INITIAL_FILTERS;
    case "setPracticePage":
      return { ...state, practicePage: action.page };
    case "setOfficialPage":
      return { ...state, officialPage: action.page };
    case "setQuestionIndex":
      return { ...state, questionIndex: action.index };
  }
}

// ---------------------------------------------------------------------------
// Scope resolution against the index (decides which lesson files to fetch)
// ---------------------------------------------------------------------------

export function isNoLessonSelected(scope: Pick<ScopeSelection, "lessonKeys">): boolean {
  return scope.lessonKeys.includes(NO_LESSONS);
}

/** Practice lesson sets (incl. unit reviews) in scope; one practice/<lessonKey>.json per entry. */
export function practiceScope(index: ExamsIndex, scope: ScopeSelection): PracticeEntry[] {
  if (isNoLessonSelected(scope)) return [];
  const chapters = new Set(scope.chapterIds);
  const lessons = new Set(scope.lessonKeys);
  return index.practice.filter(
    (e) =>
      (chapters.size === 0 || chapters.has(e.chapterId)) &&
      (!scope.unitReviewOnly || e.isUnitReview) &&
      (lessons.size === 0 || lessons.has(e.lessonKey) || lessons.has(e.lessonId))
  );
}

/** Official booklet lessons in scope; one <companionSlug>/<lessonId>.json per entry. */
export function officialScope(index: ExamsIndex, scope: Omit<ScopeSelection, "unitReviewOnly">): OfficialEntry[] {
  if (isNoLessonSelected(scope)) return [];
  const chapters = new Set(scope.chapterIds);
  const lessons = new Set(scope.lessonKeys);
  return index.official.filter(
    (e) =>
      (chapters.size === 0 || chapters.has(e.chapterId)) &&
      (lessons.size === 0 || lessons.has(e.lessonNumber) || lessons.has(e.lessonId))
  );
}

export function sumBy<T>(items: T[], key: (item: T) => string, weight: (item: T) => number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] || 0) + weight(item);
  }
  return out;
}

export interface DifficultyCounts {
  all: number;
  easy: number;
  medium: number;
  hard: number;
}

export function difficultyCountsFromIndex(entries: PracticeEntry[]): DifficultyCounts {
  const out: DifficultyCounts = { all: 0, easy: 0, medium: 0, hard: 0 };
  for (const e of entries) {
    out.all += e.count;
    out.easy += e.difficulty.easy;
    out.medium += e.difficulty.medium;
    out.hard += e.difficulty.hard;
  }
  return out;
}

export function difficultyCountsFromQuestions(questions: { difficulty: SimpleDifficulty }[]): DifficultyCounts {
  const out: DifficultyCounts = { all: questions.length, easy: 0, medium: 0, hard: 0 };
  for (const q of questions) out[q.difficulty] += 1;
  return out;
}

export interface OfficialStats {
  total: number;
  mcqs: number;
  essays: number;
}

/** Index-only estimate (ignores section and search, which need the question text). */
export function officialStatsFromIndex(entries: OfficialEntry[], type: OfficialTypeFilter): OfficialStats {
  let mcqs = 0;
  let essays = 0;
  for (const e of entries) {
    if (type !== "essay") mcqs += e.mcqCount;
    if (type !== "mcq") essays += e.essayCount;
  }
  return { total: mcqs + essays, mcqs, essays };
}

export function officialStatsFromQuestions(questions: OfficialAssessmentQuestion[]): OfficialStats {
  const mcqs = questions.filter((q) => q.type === "mcq").length;
  return { total: questions.length, mcqs, essays: questions.length - mcqs };
}

// ---------------------------------------------------------------------------
// Filtering fetched banks
// ---------------------------------------------------------------------------

export function filterOfficialQuestions(
  questions: OfficialAssessmentQuestion[],
  opts: { section: OfficialSectionFilter; type: OfficialTypeFilter; search: string }
): OfficialAssessmentQuestion[] {
  const query = opts.search.trim();
  return questions.filter((q) => {
    if (opts.section !== "all" && q.sectionType !== opts.section) return false;
    if (opts.type !== "all" && q.type !== opts.type) return false;
    if (!query) return true;
    return (
      matchesSearch(q.question, query) ||
      matchesSearch(q.modelAnswer, query) ||
      (q.textbookCitation ? matchesSearch(q.textbookCitation.exactText, query) : false) ||
      (q.options?.some((opt) => matchesSearch(opt, query)) ?? false)
    );
  });
}

/** Official 4-option MCQs converted to the practice shape used by createExamModelFromQuestions. */
export function officialExamPool(questions: OfficialAssessmentQuestion[]): EnrichedSimpleQuestion[] {
  return questions
    .filter((q) => q.type === "mcq" && q.options && q.options.length === 4)
    .map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options || [],
      answer: q.correctAnswer || (q.options ? q.options[0] : ""),
      difficulty: q.difficulty || "medium",
      lessonKey: q.lessonNumber,
      lessonId: q.lessonId,
      lessonTitle: q.lessonTitle,
      chapterId: `chapter-${q.chapterNumber}`,
      chapterNumber: q.chapterNumber,
      chapterTitle: q.chapterTitle,
      explanation: `${q.modelAnswer}\n(مرجع كتاب الوزارة ص ${q.textbookCitation.page}: ${q.textbookCitation.exactText})`,
    }));
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): { items: T[]; page: number; totalPages: number } {
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages };
}

export const examDurationMinutes = (count: number) => Math.max(15, Math.round(count * 1.8));

// ---------------------------------------------------------------------------
// Labels, titles and summaries
// ---------------------------------------------------------------------------

const UNIT_ORDINALS = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"];

/** "الوحدة الأولى" … ; falls back to "الوحدة 7". */
export function unitOrdinalLabel(chapterNumber: number): string {
  const ordinal = UNIT_ORDINALS[chapterNumber - 1];
  return ordinal ? `الوحدة ${ordinal}` : `الوحدة ${chapterNumber}`;
}

export interface UnitReviewInfo {
  chapterIds: string[];
  lessonKeys: string[];
  /** "الوحدة الأولى" for a single review set, "الوحدات" when several units have one. */
  label: string;
  totalCount: number;
}

export function unitReviewInfo(index: ExamsIndex): UnitReviewInfo | null {
  const reviews = index.practice.filter((e) => e.isUnitReview);
  if (reviews.length === 0) return null;
  return {
    chapterIds: [...new Set(reviews.map((e) => e.chapterId))],
    lessonKeys: reviews.map((e) => e.lessonKey),
    label: reviews.length === 1 ? unitOrdinalLabel(reviews[0].chapterNumber) : "الوحدات",
    totalCount: reviews.reduce((n, e) => n + e.count, 0),
  };
}

/** Unit-review questions within the selected chapters (all chapters when none is selected). */
export function unitReviewCountInScope(index: ExamsIndex, chapterIds: string[]): number {
  return practiceScope(index, { chapterIds, lessonKeys: [], unitReviewOnly: true }).reduce((n, e) => n + e.count, 0);
}

export function countLessons(chapters: NavChapter[]): number {
  return chapters.reduce((n, ch) => n + ch.lessons.length, 0);
}

function findLesson(chapters: NavChapter[], lessonNumber: string): NavLesson | undefined {
  for (const ch of chapters) {
    const lesson = ch.lessons.find((l) => l.number === lessonNumber);
    if (lesson) return lesson;
  }
  return undefined;
}

const findChapter = (chapters: NavChapter[], id: string) => chapters.find((c) => c.id === id);

export function officialScopeSummary(
  chapters: NavChapter[],
  f: Pick<ExamsFilterState, "chapterIds" | "lessonKeys" | "officialSection" | "officialType">
): string {
  const chCount = f.chapterIds.length;
  const lCount = f.lessonKeys.length;
  let base: string;
  if (isNoLessonSelected(f)) {
    base = "لم يتم تحديد أي درس";
  } else if (chCount === 0 && lCount === 0) {
    base = `كتاب تقييمات الوزارة كاملاً (${chapters.length} وحدات • ${countLessons(chapters)} درساً)`;
  } else if (chCount === 1 && lCount === 0) {
    const ch = findChapter(chapters, f.chapterIds[0]);
    base = `الوحدة ${ch?.number ?? ""}: ${ch?.title ?? ""}`;
  } else if (chCount > 1 && lCount === 0) {
    base = `${chCount} وحدات محددة من كتاب التقييمات`;
  } else if (lCount === 1) {
    base = `الدرس ${f.lessonKeys[0]}: ${findLesson(chapters, f.lessonKeys[0])?.title || ""}`;
  } else {
    base = `${lCount} دروس محددة`;
  }

  if (f.officialSection !== "all") {
    base += ` • ${OFFICIAL_SECTIONS.find((s) => s.id === f.officialSection)?.label || ""}`;
  }
  if (f.officialType === "mcq") base += " (اختيار من متعدد فقط)";
  else if (f.officialType === "essay") base += " (أسئلة مقالية فقط)";
  return base;
}

export function practiceScopeSummary(chapters: NavChapter[], scope: ScopeSelection, review: UnitReviewInfo | null): string {
  const chCount = scope.chapterIds.length;
  const lCount = scope.lessonKeys.length;

  if (scope.unitReviewOnly) {
    if (chCount === 1) {
      const ch = findChapter(chapters, scope.chapterIds[0]);
      return `مراجعة شاملة: الوحدة ${ch?.number ?? ""} (${ch?.title ?? ""}) • أسئلة ربط وتحليل`;
    }
    return "مراجعة شاملة على الوحدات (أسئلة ربط متقدمة بين الدروس)";
  }
  if (isNoLessonSelected(scope)) return "لم يتم تحديد أي درس";
  if (chCount === 0 && lCount === 0) {
    return `كامل المنهج الدراسي (${chapters.length} وحدات • ${countLessons(chapters)} درساً${review ? " ومراجعة شاملة" : ""})`;
  }
  if (chCount === 1 && lCount === 0) {
    const ch = findChapter(chapters, scope.chapterIds[0]);
    return `الوحدة ${ch?.number ?? ""}: ${ch?.title ?? ""} (جميع دروسها ومراجعتها)`;
  }
  if (chCount > 1 && lCount === 0) return `${chCount} وحدات محددة (جميع دروسها)`;
  if (lCount === 1) {
    const key = scope.lessonKeys[0];
    if (key.endsWith("-review")) {
      return `مراجعة شاملة على ${unitOrdinalLabel(Number.parseInt(key, 10))} (أسئلة الربط والتحليل)`;
    }
    return `الدرس ${key}: ${findLesson(chapters, key)?.title || ""}`;
  }
  return `${lCount} دروس ومراجعات محددة من المنهج`;
}

export function practiceExamTitle(chapters: NavChapter[], scope: Pick<ScopeSelection, "chapterIds" | "lessonKeys">): string {
  if (scope.chapterIds.length === 1) {
    return `اختبار ${findChapter(chapters, scope.chapterIds[0])?.title || "الفصل"}`;
  }
  if (scope.lessonKeys.length === 1) return `اختبار الدرس ${scope.lessonKeys[0]}`;
  return "اختبار تدريبي مخصص على الدروس المحددة";
}

export function officialExamTitle(chapters: NavChapter[], scope: Pick<ScopeSelection, "chapterIds" | "lessonKeys">): string {
  if (scope.lessonKeys.length === 1) return `اختبار التقييمات الرسمية للوزارة: الدرس ${scope.lessonKeys[0]}`;
  if (scope.chapterIds.length === 1) {
    return `اختبار التقييمات الرسمية: ${findChapter(chapters, scope.chapterIds[0])?.title || "الوحدة"}`;
  }
  return "اختبار إلكتروني موقوت على أسئلة التقييمات الرسمية للوزارة";
}

export function officialExportFileName(scope: Pick<ScopeSelection, "chapterIds" | "lessonKeys">): string {
  if (scope.lessonKeys.length === 1 && !isNoLessonSelected(scope)) {
    return `official-assessments-lesson-${scope.lessonKeys[0]}.json`;
  }
  if (scope.chapterIds.length === 1) return `official-assessments-${scope.chapterIds[0]}.json`;
  return "all-official-assessments-filtered.json";
}

// ---------------------------------------------------------------------------
// Ready-made booklet presets
// ---------------------------------------------------------------------------

/** "FINAL" (whole part), "REVIEW" (every unit-review set) or a chapter id. */
export type PresetKey = string;
export const FINAL_PRESET: PresetKey = "FINAL";
export const REVIEW_PRESET: PresetKey = "REVIEW";

export interface PresetRecipe {
  lessonKeys: string[];
  durationMinutes: number;
  maxQuestions: number;
  title: (poolSize: number) => string;
}

export function presetRecipe(key: PresetKey, index: ExamsIndex, chapters: NavChapter[]): PresetRecipe | null {
  if (key === FINAL_PRESET) {
    return {
      lessonKeys: index.practice.map((e) => e.lessonKey),
      durationMinutes: 60,
      maxQuestions: 30,
      title: () => "امتحان البوكليت الشامل لكامل المنهج (30 سؤالاً)",
    };
  }
  if (key === REVIEW_PRESET) {
    const review = unitReviewInfo(index);
    if (!review) return null;
    return {
      lessonKeys: review.lessonKeys,
      durationMinutes: 45,
      maxQuestions: 30,
      title: (n) => `امتحان مراجعة ${review.label}: أسئلة الربط والتحليل الشاملة (${Math.min(n, 30)} سؤالاً)`,
    };
  }
  const ch = findChapter(chapters, key);
  if (!ch) return null;
  return {
    lessonKeys: index.practice.filter((e) => e.chapterId === ch.id).map((e) => e.lessonKey),
    durationMinutes: 35,
    maxQuestions: 18,
    title: () => `امتحان بوكليت ${ch.title} (الفصل ${ch.number})`,
  };
}
