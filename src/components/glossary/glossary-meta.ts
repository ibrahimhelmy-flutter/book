import type { GlossaryTerm } from "@/types";
import type { NavChapter } from "@/types/catalog";

export type CategoryFilter = "ALL" | "AI" | "Cybersecurity" | "WebDev" | "Design" | "Data" | "General" | "Hardware" | "Networking";
export type ActiveTab = "terms" | "acronyms";
export type ViewMode = "grid" | "compact" | "flashcards";

export interface ChapterMeta {
  title: string;
  number: number;
  colorTheme: string;
}

export interface LessonMeta {
  title: string;
  number: string;
  chapterId: string;
  pageRange: string;
}

export interface AvailableLesson {
  id: string;
  number: string;
  title: string;
  chapterId: string;
  chapterNumber: number;
}

export const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "ALL", label: "جميع التصنيفات" },
  { id: "AI", label: "الذكاء الاصطناعي (AI)" },
  { id: "Cybersecurity", label: "الأمن السيبراني" },
  { id: "Hardware", label: "العتاد والحواسيب" },
  { id: "WebDev", label: "تطبيقات الويب" },
  { id: "Networking", label: "الشبكات والاتصالات" },
  { id: "Design", label: "تصميم الوسائط و UX" },
  { id: "Data", label: "علم البيانات والإحصاء" },
  { id: "General", label: "عام وحوسبة" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label.replace(/\s*\(.*?\)/, "")])
);

/** Short Arabic label for a category id (parenthesised English hint stripped); falls back to the id. */
export const getCategoryLabel = (catId: string): string => CATEGORY_LABELS[catId] ?? catId;

export function buildChapterMap(chapters: NavChapter[]): Record<string, ChapterMeta> {
  const map: Record<string, ChapterMeta> = {};
  for (const chap of chapters) {
    map[chap.id] = { title: chap.title, number: chap.number, colorTheme: chap.colorTheme || "" };
  }
  return map;
}

/** Lessons keyed by lesson number ("1-1"), the key glossary terms reference. */
export function buildLessonMap(chapters: NavChapter[]): Record<string, LessonMeta> {
  const map: Record<string, LessonMeta> = {};
  for (const chap of chapters) {
    for (const l of chap.lessons) {
      map[l.number] = { title: l.title, number: l.number, chapterId: chap.id, pageRange: l.pageRange };
    }
  }
  return map;
}

export function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    counts[k] = (counts[k] || 0) + 1;
  }
  return counts;
}

/** Plain-text clipboard payload for one term (same format as the original glossary page). */
export function buildCopyText(term: GlossaryTerm, chapterName: string, lessonName: string): string {
  const primaryPage = term.source?.primaryPage ? `صفحة ${term.source.primaryPage}` : "";
  return `المصطلح: ${term.termAr} (${term.termEn})
التعريف العلمي: ${term.definitionAr}${term.definitionEn ? `\nDefinition: ${term.definitionEn}` : ""}
الوحدة: ${chapterName}
الدرس: ${term.lessonNumber} - ${lessonName}
${primaryPage ? `الكتاب المدرسي: ${primaryPage}` : ""}`.trim();
}
