import { Book, BookStats } from "@/types";
import { CURRICULUM_DATA } from "./curriculum";
import { GLOSSARY_DATA } from "./glossary";
import { ACRONYMS_DATA } from "./acronyms";
import { SIMULATORS_DATA } from "./simulators";

// 1. Primary Book: Programming & AI for Secondary 2 (Term 1)
export const PRIMARY_BOOK: Book = {
  id: "it-secondary-2",
  slug: "programming-and-ai",
  title: "البرمجة والذكاء الاصطناعي",
  englishTitle: "Programming & Artificial Intelligence",
  stage: "المرحلة الثانوية",
  grade: "الصف الثاني الثانوي",
  term: "الفصل الدراسي الأول",
  accreditation: [
    "وزارة التربية والتعليم والتعليم الفني 🇪🇬",
    "Advised by International Baccalaureate (IB) 🌐",
    "رؤية مصر 2030 🚀"
  ],
  description: "المنصة التفاعلية الرسمية المتكاملة لمحتوى الكتاب المدرسي لشهادة الثانوية المصرية. تجمع بين المحاكيات الهندسية الحية، والتمارين المصححة آلياً، ونماذج امتحانات الثانوية العامة مع سلالم التصحيح النموذجية.",
  colorTheme: "from-indigo-600 via-purple-600 to-pink-600",
  icon: "Cpu",
  chapters: CURRICULUM_DATA,
  glossary: GLOSSARY_DATA,
  acronyms: ACRONYMS_DATA,
  simulators: SIMULATORS_DATA,
};

// 2. Extensible Books Registry (Easily add more books here)
export const BOOKS_REGISTRY: Book[] = [
  PRIMARY_BOOK,
];

export const DEFAULT_BOOK_ID = PRIMARY_BOOK.id;
export const CURRENT_BOOK: Book = PRIMARY_BOOK;

// Helper: Get all available books
export function getAllBooks(): Book[] {
  return BOOKS_REGISTRY;
}

// Helper: Get book by ID or fallback to primary
export function getBookById(bookId?: string): Book {
  if (!bookId) return PRIMARY_BOOK;
  const found = BOOKS_REGISTRY.find((b) => b.id === bookId || b.slug === bookId);
  return found || PRIMARY_BOOK;
}

// Helper: Compute dynamic stats for any book
export function getBookStats(book: Book = CURRENT_BOOK): BookStats {
  const chapters = book.chapters || [];
  const totalChapters = chapters.length;
  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons ? ch.lessons.length : 0), 0);
  const totalSimulators = book.simulators ? book.simulators.length : 0;
  const totalGlossaryTerms = book.glossary ? book.glossary.length : 0;
  const totalAcronyms = book.acronyms ? book.acronyms.length : 0;
  
  const totalExamQuestions = chapters.reduce((acc, ch) => {
    return acc + ch.lessons.reduce((lAcc, l) => {
      const examCount = (l.questions || []).filter((q) => q.category === "exam_style").length;
      return lAcc + examCount;
    }, 0);
  }, 0);

  return {
    totalChapters,
    totalLessons,
    totalSimulators,
    totalGlossaryTerms,
    totalAcronyms,
    totalExamQuestions,
  };
}
