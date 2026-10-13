/**
 * Catalog model: grade (الصف) → book (الكتاب) → part (الجزء/الترم) → companion books (e.g. كتيب التقييمات).
 * Source: book-sources/catalog.json (hand-edited). Generated per-part data lives in public/data/<partKey>/.
 */
import type { BookStats } from "./index";

export type ContentStatus = "available" | "coming-soon";

export interface PartRef {
  gradeId: string;
  bookSlug: string;
  partId: string;
}

/** "<gradeId>/<bookSlug>/<partId>", e.g. "secondary-2/programming-ai/term-1". Also the data folder path. */
export type PartKey = string;

export interface CatalogCompanion {
  slug: string;
  kind: "assessments";
  title: string;
  status: ContentStatus;
}

export interface CatalogPart {
  id: string;
  key: PartKey;
  title: string;
  shortTitle: string;
  order: number;
  status: ContentStatus;
  academicYear?: string;
  stats?: BookStats;
  companions: CatalogCompanion[];
}

export interface CatalogBook {
  slug: string;
  title: string;
  englishTitle?: string;
  icon?: string;
  colorTheme?: string;
  description?: string;
  accreditation?: string[];
  parts: CatalogPart[];
}

export interface CatalogGrade {
  id: string;
  title: string;
  stage: string;
  order: number;
  books: CatalogBook[];
}

export interface Catalog {
  version: 1;
  grades: CatalogGrade[];
}

export interface NavLesson {
  id: string;
  slug: string;
  number: string;
  title: string;
  englishTitle?: string;
  pageRange: string;
  chapterId: string;
}

export interface NavChapter {
  id: string;
  number: number;
  title: string;
  englishTitle?: string;
  description?: string;
  colorTheme?: string;
  icon?: string;
  pageStart?: number;
  pageEnd?: number;
  lessons: NavLesson[];
}

export interface CompanionLessonRef {
  lessonId: string;
  lessonNumber: string;
  chapterId: string;
  slug: string;
  title: string;
  bookletPages: string;
  textbookPages: string;
  totalQuestions: number;
  mcqCount: number;
  essayCount: number;
}

export interface CompanionManifest extends CatalogCompanion {
  lessons: CompanionLessonRef[];
  totalQuestions: number;
}

/** Light per-part manifest: everything navigation, search and progress UIs need. No lesson bodies. */
export interface PartManifest {
  key: PartKey;
  ref: PartRef;
  contentHash: string;
  gradeTitle: string;
  bookTitle: string;
  bookEnglishTitle?: string;
  partTitle: string;
  partShortTitle: string;
  academicYear?: string;
  totalPages?: number;
  assetsBase: string;
  stats: BookStats;
  chapters: NavChapter[];
  companions: CompanionManifest[];
  /** lessonKey ("1-1", "1-review") → deep question count; empty when a lesson has no authored set. */
  deepQuestionCounts: Record<string, number>;
  storylineLessonIds: string[];
}

/** Precomputed counts for the exams page (rendered before any question bank is fetched). */
export interface ExamsIndex {
  practice: {
    lessonKey: string;
    lessonId: string;
    chapterId: string;
    chapterNumber: number;
    title: string;
    isUnitReview: boolean;
    count: number;
    difficulty: { easy: number; medium: number; hard: number };
  }[];
  official: {
    lessonId: string;
    lessonNumber: string;
    chapterId: string;
    count: number;
    mcqCount: number;
    essayCount: number;
  }[];
  totals: { practice: number; official: number };
}

/** Lesson search record (search-lessons.json), fetched with glossary.json and acronyms.json when search opens. */
export interface SearchLesson {
  id: string;
  number: string;
  title: string;
  englishTitle: string;
  chapterId: string;
  chapterTitle: string;
  slug: string;
  coreIdea: string;
  concepts: string[];
}

/** Slim catalog for the global navbar (titles, keys and status only). */
export interface NavCatalog {
  grades: {
    id: string;
    title: string;
    books: { slug: string; title: string; parts: { id: string; key: PartKey; shortTitle: string; status: ContentStatus }[] }[];
  }[];
}
