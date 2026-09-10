import { CommitteeQuestion, CommitteeQuestionType, CognitiveLevel, DifficultyLevel } from "./types";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { SPECIALIZED_COMMITTEE_QUESTIONS } from "@/data/committee-questions";

/**
 * Base curated questions directly extracted and verified from the Egyptian Ministry of Education
 * Textbook "البرمجة والذكاء الاصطناعي - الصف الثاني الثانوي (بكالوريا مصرية) - الترم الأول".
 */

// Helper to safely convert existing curriculum questions to CommitteeQuestion
function convertCurriculumQuestions(): CommitteeQuestion[] {
  const result: CommitteeQuestion[] = [];

  CURRICULUM_DATA.forEach((ch) => {
    ch.lessons.forEach((l) => {
      l.questions.forEach((q, qIndex) => {
        let questionType: CommitteeQuestionType = "mcq";
        let cognitiveLevel: CognitiveLevel = "recall";
        let difficulty: DifficultyLevel = "medium";
        let marks = q.marks || 2;
        let estimatedTime = 1.5;

        if (q.type === "mcq") {
          questionType = "mcq";
          if (qIndex < 5) {
            cognitiveLevel = "recall";
            difficulty = "easy";
            marks = 1;
            estimatedTime = 1;
          } else if (qIndex < 8) {
            cognitiveLevel = "understanding";
            difficulty = "medium";
            marks = 2;
            estimatedTime = 1.5;
          } else {
            cognitiveLevel = "analysis";
            difficulty = "hard";
            marks = 2;
            estimatedTime = 2;
          }
        } else if (q.type === "true_false") {
          questionType = "true_false";
          cognitiveLevel = "understanding";
          difficulty = "medium";
          marks = 1.5;
          estimatedTime = 1;
        } else if (q.type === "fill_blank") {
          questionType = "complete";
          cognitiveLevel = "recall";
          difficulty = "easy";
          marks = 2;
          estimatedTime = 1.5;
        } else if (q.type === "essay") {
          questionType = "essay";
          cognitiveLevel = "higher_order";
          difficulty = "hard";
          marks = 6;
          estimatedTime = 6;
        }

        const exactAnswerStr = Array.isArray(q.correctAnswer)
          ? q.correctAnswer.join(" / ")
          : typeof q.correctAnswer === "object"
          ? JSON.stringify(q.correctAnswer)
          : String(q.correctAnswer);

        result.push({
          id: `CQ-${q.id}`,
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          lessonId: l.id,
          lessonNumber: l.number,
          lessonTitle: l.title,
          topic: l.title,
          page: l.pageRange,
          sourceSection: `تمارين نهاية الدرس ${l.number}`,
          sourceReference: `الفصل ${ch.number} (${ch.title}) → الدرس ${l.number} → ص ${l.pageRange}`,
          questionType,
          difficulty,
          cognitiveLevel,
          question: q.questionText,
          modelAnswer: exactAnswerStr,
          textbookExactAnswer: exactAnswerStr,
          explanation: q.explanation,
          rubricCriteria: q.rubricCriteria,
          options: q.options,
          marks,
          estimatedTimeMinutes: estimatedTime,
          keywords: [l.title, ch.title, q.type],
        });
      });
    });
  });

  return result;
}

// Combine all questions into the master verified pool
let cachedQuestionPool: CommitteeQuestion[] | null = null;

export function getAllCommitteeQuestions(): CommitteeQuestion[] {
  if (!cachedQuestionPool) {
    const fromCurriculum = convertCurriculumQuestions();
    cachedQuestionPool = [...fromCurriculum, ...SPECIALIZED_COMMITTEE_QUESTIONS];
  }
  return cachedQuestionPool;
}
