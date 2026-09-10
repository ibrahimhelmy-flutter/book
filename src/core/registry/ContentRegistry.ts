import { Book, Chapter, Lesson, GlossaryTerm, AcronymTerm, SimulatorMeta } from "@/types";
import { DeepChallengingQuestion } from "@/data/deep-questions/types";
import { CommitteeQuestion } from "@/lib/exam-generator/types";
import { PRIMARY_BOOK } from "@/data/books";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { GLOSSARY_DATA } from "@/data/glossary";
import { ACRONYMS_DATA } from "@/data/acronyms";
import { SIMULATORS_DATA } from "@/data/simulators";
import { SPECIALIZED_COMMITTEE_QUESTIONS } from "@/data/committee-questions";
import { ALL_DEEP_QUESTIONS } from "@/data/deep-questions";

/**
 * Unified Educational Content Package Contract.
 * Abstracts all term data into a single, standardized, multi-term runtime interface.
 */
export interface BookContentPackage {
  term: string;
  book: Book;
  chapters: Chapter[];
  lessons: Lesson[];
  glossary: GlossaryTerm[];
  acronyms: AcronymTerm[];
  simulators: SimulatorMeta[];
  committeeQuestions: CommitteeQuestion[];
  deepQuestions: Record<string, DeepChallengingQuestion[]>;
}

// Registry map for multi-term scalability
const REGISTRY = new Map<string, BookContentPackage>();

// Pre-register active Term 1 package
const term1Package: BookContentPackage = {
  term: "term-1",
  book: PRIMARY_BOOK,
  chapters: CURRICULUM_DATA,
  lessons: CURRICULUM_DATA.flatMap((ch) => ch.lessons),
  glossary: GLOSSARY_DATA,
  acronyms: ACRONYMS_DATA,
  simulators: SIMULATORS_DATA,
  committeeQuestions: SPECIALIZED_COMMITTEE_QUESTIONS,
  deepQuestions: ALL_DEEP_QUESTIONS,
};

REGISTRY.set("term-1", term1Package);
REGISTRY.set("it-secondary-2", term1Package);
REGISTRY.set("programming-and-ai", term1Package);

/**
 * Retrieves the complete educational content package for the given term or book ID.
 * Defaults to Term 1 if not specified.
 */
export function getBookContent(termOrId: string = "term-1"): BookContentPackage {
  const found = REGISTRY.get(termOrId);
  if (found) return found;
  return term1Package;
}

/**
 * Dynamically registers a new book term (e.g. Term 2) at runtime without modifying components.
 */
export function registerBookContent(pkg: BookContentPackage): void {
  REGISTRY.set(pkg.term, pkg);
  if (pkg.book?.id) REGISTRY.set(pkg.book.id, pkg);
  if (pkg.book?.slug) REGISTRY.set(pkg.book.slug, pkg);
}

/**
 * Returns all currently registered term identifiers.
 */
export function getRegisteredTerms(): string[] {
  return Array.from(new Set(Array.from(REGISTRY.values()).map((p) => p.term)));
}
