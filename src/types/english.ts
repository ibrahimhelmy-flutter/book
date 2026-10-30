/**
 * النص الإنجليزي الرسمي للدرس (نسخة مدارس اللغات من كتاب الوزارة).
 *
 * - يُستخرج حرفيًا من طبقة نص ملف PDF الإنجليزي بواسطة `scripts/extract-english-text.mjs`
 *   إلى `05-canonical-data/official/english/<lessonId>.json`؛ لا ترجمة ولا إعادة صياغة.
 * - في الملف المُولَّد (`public/data/.../english/<lessonId>.json`) تُربط الأقسام بمعرّف القسم
 *   العربي عن طريق رقم العنوان ("1. …")، لأن ترقيم صفحات النسختين قد يختلف.
 */

export type EnglishBlock =
  | { type: "p"; text: string }
  | { type: "caption"; text: string }
  | { type: "table"; rows: string[][] };

export interface EnglishSection {
  number: number;
  title: string;
  blocks: EnglishBlock[];
  pdfPages: number[];
}

/** Canonical record (book-sources/…/official/english/<lessonId>.json). */
export interface EnglishLessonSource {
  lessonId: string;
  number: string;
  title: string;
  learningObjectives: string[];
  guidingQuestion: string | null;
  sections: EnglishSection[];
  contentOrigin: "official";
  source: { edition: "english"; pdfFile: string; pdfPages: number[] };
}

/** Generated file: English sections keyed by the Arabic section id they accompany. */
export interface EnglishLesson {
  lessonId: string;
  title: string;
  learningObjectives: string[];
  guidingQuestion: string | null;
  sections: Record<string, EnglishSection>;
}
