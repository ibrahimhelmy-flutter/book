/**
 * تسلسل الأفكار: شرح مبسط ومتدرج لكل درس، مربوط بنص الكتاب.
 *
 * - النصوص في `fromBook` و`bookTable` و`keyQuestion` و`bookSummary` منقولة حرفيًا
 *   من الكتاب، ويتحقق منها `tests/unit/storylines.test.ts`.
 * - باقي الحقول (`startingPoint`، `explanation`، `example`، `bridge`، `chain`)
 *   شرح إضافي مؤلف، وتعرضه الواجهة بعلامة "توضيح إضافي" أو "مثال من الواقع".
 */

/** نص منقول حرفيًا من الكتاب */
export interface BookQuote {
  text: string;
  page: number;
  /** عنوان قصير يسبق النص، مثل اسم المرحلة أو المصطلح كما ورد في الكتاب */
  label?: string;
}

/** جدول (أو جزء من جدول) منقول حرفيًا من الكتاب */
export interface BookTable {
  page: number;
  headers: string[];
  rows: string[][];
}

/** اسم الفكرة كما ورد في الكتاب، يظهر بعد فهم الفكرة */
export interface BookTerm {
  ar: string;
  en?: string;
}

export interface IdeaStep {
  id: string;
  /** عنوان بسيط للفكرة */
  title: string;
  /** السؤال الذي تجيب عنه هذه الخطوة */
  question: string;
  /** شرح مبسط بكلمات سهلة (توضيح إضافي) */
  explanation: string;
  /** ما قاله الكتاب حرفيًا عن هذه الفكرة */
  fromBook: BookQuote[];
  bookTable?: BookTable;
  /** مثال من الحياة اليومية (توضيح إضافي) */
  example?: string;
  bookTerms?: BookTerm[];
  /** الجملة التي تنقلنا إلى الخطوة التالية */
  bridge?: string;
}

export interface LessonStoryline {
  lessonId: string;
  lessonSlug: string;
  lessonNumber: string;
  chapterId: string;
  title: string;
  /** نقطة البداية: من أين ننطلق قبل الدخول في الدرس */
  startingPoint: string;
  /** السؤال الرئيسي للدرس كما في الكتاب */
  keyQuestion: BookQuote;
  steps: IdeaStep[];
  wrapUp: {
    /** الأفكار بالترتيب في سطور قصيرة */
    chain: string[];
    /** خلاصة الدرس كما في الكتاب */
    bookSummary: BookQuote;
  };
}
