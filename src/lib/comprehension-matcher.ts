import { Lesson, LessonSection } from "@/types";
import { DeepChallengingQuestion } from "@/data/deep-questions";

export interface QuestionWithSection extends DeepChallengingQuestion {
  assignedSectionId: string;
  assignedSectionTitle: string;
  assignedSectionIndex: number;
}

/**
 * Matches a single question to the most relevant lesson section based on:
 * 1. Primary page number match (highest precision)
 * 2. Key concept ID alignment
 * 3. Title & keyword semantic overlap
 * 4. Proportional fallback index
 */
export function matchQuestionToSection(
  question: DeepChallengingQuestion,
  sections: LessonSection[],
  lesson: Lesson,
  indexInAll: number,
  totalQuestions: number
): { sectionId: string; sectionTitle: string; sectionIndex: number } {
  if (!sections || sections.length === 0) {
    return { sectionId: "default", sectionTitle: "الدرس العام", sectionIndex: 0 };
  }

  // 1. Match by Primary Page (highest precision)
  const evidence = question.source?.curriculumEvidence;
  const evidencePage =
    typeof evidence === "object" && evidence !== null && "page" in evidence
      ? (evidence as { page?: number }).page
      : undefined;

  const qPage =
    question.source?.primaryPage ||
    evidencePage ||
    question.source?.pages?.[0];

  if (qPage) {
    const pageMatchIdx = sections.findIndex((s) => {
      if (s.source?.primaryPage === qPage) return true;
      if (s.source?.pages && s.source.pages.includes(qPage)) return true;
      return false;
    });
    if (pageMatchIdx !== -1) {
      return {
        sectionId: sections[pageMatchIdx].id,
        sectionTitle: sections[pageMatchIdx].title,
        sectionIndex: pageMatchIdx,
      };
    }
  }

  // 2. Match by Concept ID from keyConcepts
  const conceptIds = question.conceptIds || (question.conceptId ? [question.conceptId] : []);
  if (conceptIds.length > 0 && lesson.keyConcepts) {
    const matchingConcept = lesson.keyConcepts.find((c) => c.id && conceptIds.includes(c.id));
    if (matchingConcept) {
      const secIdx = sections.findIndex(
        (s) =>
          (matchingConcept.termAr &&
            (s.content.includes(matchingConcept.termAr) || s.title.includes(matchingConcept.termAr))) ||
          (matchingConcept.source?.primaryPage && s.source?.primaryPage === matchingConcept.source.primaryPage)
      );
      if (secIdx !== -1) {
        return {
          sectionId: sections[secIdx].id,
          sectionTitle: sections[secIdx].title,
          sectionIndex: secIdx,
        };
      }
    }
  }

  // 3. Match by semantic keywords in section title vs question text/title/explanation
  const qFullText = `${question.title || ""} ${question.question || ""} ${question.depthExplanation || ""}`;
  let bestScore = 0;
  let bestSecIdx = -1;

  sections.forEach((sec, idx) => {
    // Extract keywords from section title
    const words = sec.title
      .replace(/^[0-9.]+\s*/, "")
      .split(/[\s,()\-—/]+/)
      .filter((w) => w.length > 2 && !["تكنولوجيا", "المعلومات", "الدرس", "القسم", "في", "من", "عن", "مع"].includes(w));

    let score = 0;
    words.forEach((word) => {
      if (qFullText.includes(word)) score += 2;
    });

    if (score > bestScore) {
      bestScore = score;
      bestSecIdx = idx;
    }
  });

  if (bestSecIdx !== -1 && bestScore >= 2) {
    return {
      sectionId: sections[bestSecIdx].id,
      sectionTitle: sections[bestSecIdx].title,
      sectionIndex: bestSecIdx,
    };
  }

  // 4. Fallback: Proportional distribution based on question index
  const safeTotal = Math.max(1, totalQuestions);
  const fallbackIdx = Math.min(
    sections.length - 1,
    Math.floor((indexInAll / safeTotal) * sections.length)
  );

  return {
    sectionId: sections[fallbackIdx].id,
    sectionTitle: sections[fallbackIdx].title,
    sectionIndex: fallbackIdx,
  };
}

/**
 * Maps all comprehension questions of a lesson to their corresponding sections
 */
export function mapAllQuestionsToSections(
  questions: DeepChallengingQuestion[],
  lesson: Lesson
): QuestionWithSection[] {
  const sections = lesson.sections || [];
  return questions.map((q, idx) => {
    const match = matchQuestionToSection(q, sections, lesson, idx, questions.length);
    return {
      ...q,
      assignedSectionId: match.sectionId,
      assignedSectionTitle: match.sectionTitle,
      assignedSectionIndex: match.sectionIndex,
    };
  });
}

/**
 * Counts questions per section ID for a lesson
 */
export function countQuestionsPerSection(
  questions: DeepChallengingQuestion[],
  lesson: Lesson
): Record<string, number> {
  const mapped = mapAllQuestionsToSections(questions, lesson);
  const counts: Record<string, number> = {};
  mapped.forEach((q) => {
    counts[q.assignedSectionId] = (counts[q.assignedSectionId] || 0) + 1;
  });
  return counts;
}
