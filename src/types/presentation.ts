/**
 * العرض التقديمي للدرس: شرح المدرس في الفصل، فكرة في كل شريحة وبترتيب الكتاب.
 *
 * الخطة (`PresentationPlan`) ملف مؤلف في
 * `book-sources/<part>/05-canonical-data/authored/presentations/<lessonId>.json`
 * لا يحتوي أي نص: يحدد فقط كيف تُقسم فقرات الكتاب على الشرائح، وأين يظهر الشكل
 * والجدول وتعريف كل مصطلح. `npm run build:data` يتحقق منها (`auditPresentationPlan`)
 * ثم يحولها إلى عرض جاهز (`PresentationDeck`) كل نصوصه منقولة من الدرس نفسه.
 * الدرس الذي ليس له خطة يأخذ مسودة آلية (`draftPresentationPlan`) تمر بالتحقق نفسه.
 */

/** شريحة فكرة: فقرات متتالية من قسم واحد في الكتاب */
export interface PlanIdeaSlide {
  section: string;
  /** أرقام الفقرات (أسطر `content`) بالترتيب، تبدأ من 0 */
  blocks: number[];
  /** يظهر شكل القسم في هذه الشريحة */
  figure?: boolean;
  /** يظهر جدول القسم في هذه الشريحة */
  table?: boolean;
  /** معرفات المصطلحات (`keyConcepts[].id`) التي تُعرّف في هذه الشريحة */
  terms?: string[];
}

/**
 * شريحة «الفكرة الرئيسة»: معرف callout من نوع important_note، أو "coreIdea" عندما يحفظ الدرس
 * مربع «الفكرة الرئيسة» في `coreIdea` فقط (الفصل الأول من الترم الأول).
 */
export interface PlanNoteSlide {
  note: string;
}

export type PlanSlide = PlanIdeaSlide | PlanNoteSlide;

export interface PresentationPlan {
  lessonId: string;
  /** جسم العرض فقط؛ الغلاف والأهداف والمقدمة والخلاصة والإجابة ثابتة */
  slides: PlanSlide[];
}

export interface DeckTerm {
  termAr: string;
  termEn?: string;
  /** يُحذف إذا كان التعريف مكتوبًا بالفعل في نص الشريحة */
  definition?: string;
}

export interface DeckTable {
  headers: string[];
  rows: string[][];
}

export interface DeckFigure {
  src: string;
  caption: string;
}

export type DeckSlide =
  | {
      kind: "cover";
      number: string;
      title: string;
      englishTitle?: string;
      chapterNumber: number;
      pageRange: string;
      keyQuestion: string;
    }
  | { kind: "objectives"; items: string[] }
  | { kind: "path"; items: { label: "previous" | "current" | "next"; text: string }[] }
  | { kind: "introduction"; sentences: string[] }
  | {
      kind: "idea";
      sectionId: string;
      sectionTitle: string;
      /** رقم القسم في الدرس (1..sectionCount) */
      sectionNumber: number;
      sectionCount: number;
      /** ترتيب الشريحة داخل القسم */
      part: number;
      partCount: number;
      blocks: string[];
      figure?: DeckFigure;
      table?: DeckTable;
      terms: DeckTerm[];
    }
  /** title is absent for the coreIdea note; the view then shows the book's label «الفكرة الرئيسة». */
  | { kind: "note"; title?: string; text: string }
  | { kind: "summary"; items: string[] }
  | { kind: "answer"; question: string; answer: string };

export type DeckSlideKind = DeckSlide["kind"];

export interface PresentationDeck {
  lessonId: string;
  /** true: خطة مراجعة يدويًا؛ false: مسودة آلية */
  reviewed: boolean;
  slides: DeckSlide[];
}
