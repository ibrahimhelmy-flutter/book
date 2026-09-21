import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  OFFICIAL_LESSONS_ASSESSMENTS,
  ALL_OFFICIAL_QUESTIONS,
  OFFICIAL_ASSESSMENTS_BY_LESSON,
  getOfficialAssessmentsForLesson,
  getOfficialQuestionsForLesson,
} from "../../data/official-assessments";

describe("Official Ministry Assessments Architecture Tests", () => {
  it("Test 1: Exactly 14 lessons are loaded from the official assessments booklet", () => {
    assert.equal(OFFICIAL_LESSONS_ASSESSMENTS.length, 14);
    const lessonNumbers = OFFICIAL_LESSONS_ASSESSMENTS.map((l) => l.lessonNumber);
    const expected = [
      "1-1", "1-2", "1-3", "1-4",
      "2-1", "2-2", "2-3",
      "3-1", "3-2", "3-3",
      "4-1", "4-2", "4-3", "4-4",
    ];
    assert.deepEqual(lessonNumbers.sort(), expected.sort());
  });

  it("Test 2: Question bank contains all official questions (> 550 questions)", () => {
    assert.ok(ALL_OFFICIAL_QUESTIONS.length >= 550, `Expected >= 550 questions, found ${ALL_OFFICIAL_QUESTIONS.length}`);
  });

  it("Test 3: Every lesson contains both MCQs and Essay questions across official sections", () => {
    OFFICIAL_LESSONS_ASSESSMENTS.forEach((l) => {
      assert.ok(l.mcqCount >= 14, `Lesson ${l.lessonNumber} should have >= 14 MCQs, has ${l.mcqCount}`);
      assert.ok(l.essayCount >= 14, `Lesson ${l.lessonNumber} should have >= 14 Essay questions, has ${l.essayCount}`);
      assert.equal(l.totalQuestions, l.mcqCount + l.essayCount);
    });
  });

  it("Test 4: All MCQs strictly possess exactly 4 options", () => {
    const mcqs = ALL_OFFICIAL_QUESTIONS.filter((q) => q.type === "mcq");
    mcqs.forEach((q) => {
      assert.ok(Array.isArray(q.options), `Question ${q.id} options must be an array`);
      assert.equal(q.options.length, 4, `Question ${q.id} must have exactly 4 options`);
      q.options.forEach((opt, idx) => {
        assert.ok(typeof opt === "string" && opt.trim().length > 0, `Option ${idx} in ${q.id} cannot be empty`);
      });
    });
  });

  it("Test 5: All MCQs possess a valid correct answer matching their options", () => {
    const mcqs = ALL_OFFICIAL_QUESTIONS.filter((q) => q.type === "mcq");
    mcqs.forEach((q) => {
      assert.ok(typeof q.correctAnswerIndex === "number", `Question ${q.id} must have correctAnswerIndex`);
      assert.ok(q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4, `Invalid correctAnswerIndex for ${q.id}`);
      assert.ok(typeof q.correctAnswer === "string" && q.correctAnswer.trim().length > 0, `Question ${q.id} must have correctAnswer text`);
      assert.equal(q.correctAnswer, q.options![q.correctAnswerIndex]);
    });
  });

  it("Test 6: All questions possess textbook-grounded model answers and citations", () => {
    ALL_OFFICIAL_QUESTIONS.forEach((q) => {
      assert.ok(q.modelAnswer && q.modelAnswer.trim().length > 0, `Question ${q.id} must have a model answer`);
      assert.ok(q.textbookCitation, `Question ${q.id} must have a textbookCitation`);
      assert.ok(q.textbookCitation.page >= 4 && q.textbookCitation.page <= 95, `Citation page for ${q.id} must be within 4-95`);
      assert.ok(q.textbookCitation.exactText && q.textbookCitation.exactText.length > 0, `Citation text for ${q.id} must not be empty`);
    });
  });

  it("Test 7: Section types match the official 6 assessment periods and models", () => {
    const validSections = new Set([
      "performance_task_1",
      "performance_task_2",
      "homework",
      "weekly_model_a",
      "weekly_model_b",
      "weekly_model_c",
    ]);

    ALL_OFFICIAL_QUESTIONS.forEach((q) => {
      assert.ok(validSections.has(q.sectionType), `Invalid sectionType ${q.sectionType} in ${q.id}`);
      assert.ok(q.sectionNameAr && q.sectionNameAr.length > 0, `Missing sectionNameAr in ${q.id}`);
    });
  });

  it("Test 8: Lookup helpers by lesson work accurately", () => {
    const l1 = getOfficialAssessmentsForLesson("1-1");
    assert.ok(l1);
    assert.equal(l1.lessonNumber, "1-1");
    assert.equal(l1.chapterNumber, 1);

    const l1Questions = getOfficialQuestionsForLesson("1-1");
    assert.equal(l1Questions.length, l1.totalQuestions);

    const l2QuestionsWithPrefix = getOfficialQuestionsForLesson("lesson-1-2");
    assert.ok(l2QuestionsWithPrefix.length > 0);
  });
});
