import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllSimpleQuestions,
  getAllEnrichedQuestions,
  filterEnrichedQuestions,
  createExamModelFromQuestions,
} from "../../lib/practice-data";

describe("Unified Questions & Exams - Filtering & Exam Generation", () => {
  const allQuestions = getAllEnrichedQuestions();

  it("Test 1: getAllEnrichedQuestions returns questions with complete lesson and chapter metadata", () => {
    assert.ok(allQuestions.length > 500, `Expected >500 questions, found ${allQuestions.length}`);

    for (const q of allQuestions) {
      assert.ok(q.id, "Question must have an id");
      assert.ok(q.lessonKey, "Question must have a lessonKey");
      assert.ok(q.lessonId, "Question must have a lessonId");
      assert.ok(q.lessonTitle, "Question must have a lessonTitle");
      assert.ok(q.chapterId, "Question must have a chapterId");
      assert.ok(q.chapterNumber > 0, "Question must have positive chapterNumber");
      assert.ok(q.chapterTitle, "Question must have a chapterTitle");
      assert.ok(q.question, "Question must have question text");
      assert.equal(q.options.length, 4, "Question must have exactly 4 options");
      assert.ok(q.options.includes(q.answer), "Answer must be one of options");
      assert.ok(["easy", "medium", "hard"].includes(q.difficulty));
    }
  });

  it("Test 2: Filtering by a single lesson (درس) returns only questions for that specific lesson", () => {
    const lesson1_1Questions = filterEnrichedQuestions(allQuestions, {
      lessonKeys: ["1-1"],
    });

    assert.ok(lesson1_1Questions.length > 0, "Should have questions for lesson 1-1");
    assert.ok(
      lesson1_1Questions.every((q) => q.lessonKey === "1-1"),
      "Every question must strictly belong to lesson 1-1"
    );
  });

  it("Test 3: Filtering by multiple lessons (دروس) accurately includes all selected lessons and excludes others", () => {
    const multiLessonQuestions = filterEnrichedQuestions(allQuestions, {
      lessonKeys: ["1-1", "1-2", "2-1"],
    });

    assert.ok(multiLessonQuestions.length > 0);
    const validKeys = new Set(["1-1", "1-2", "2-1"]);

    assert.ok(
      multiLessonQuestions.every((q) => validKeys.has(q.lessonKey)),
      "Every question must belong to one of the selected lessons"
    );

    // Verify all requested lessons are represented
    assert.ok(multiLessonQuestions.some((q) => q.lessonKey === "1-1"));
    assert.ok(multiLessonQuestions.some((q) => q.lessonKey === "1-2"));
    assert.ok(multiLessonQuestions.some((q) => q.lessonKey === "2-1"));
    // Ensure an unselected lesson is not included
    assert.ok(!multiLessonQuestions.some((q) => q.lessonKey === "3-1"));
  });

  it("Test 4: Filtering by a single unit (وحدة) returns all lessons of that chapter", () => {
    const chapter1Questions = filterEnrichedQuestions(allQuestions, {
      chapterIds: ["chapter-1"],
    });

    assert.ok(chapter1Questions.length > 0);
    assert.ok(
      chapter1Questions.every((q) => q.chapterId === "chapter-1"),
      "All questions must belong to chapter-1"
    );

    // Chapter 1 has lessons 1-1, 1-2, 1-3, 1-4
    assert.ok(chapter1Questions.some((q) => q.lessonKey === "1-1"));
    assert.ok(chapter1Questions.some((q) => q.lessonKey === "1-2"));
    assert.ok(chapter1Questions.some((q) => q.lessonKey === "1-3"));
    assert.ok(chapter1Questions.some((q) => q.lessonKey === "1-4"));
  });

  it("Test 5: Filtering by multiple units (وحدات) returns questions from only the selected chapters", () => {
    const multiChapterQuestions = filterEnrichedQuestions(allQuestions, {
      chapterIds: ["chapter-2", "chapter-3"],
    });

    assert.ok(multiChapterQuestions.length > 0);
    const validCh = new Set(["chapter-2", "chapter-3"]);

    assert.ok(
      multiChapterQuestions.every((q) => validCh.has(q.chapterId)),
      "All questions must belong to either chapter-2 or chapter-3"
    );
    assert.ok(!multiChapterQuestions.some((q) => q.chapterId === "chapter-1"));
    assert.ok(!multiChapterQuestions.some((q) => q.chapterId === "chapter-4"));
  });

  it("Test 6: Filtering by lesson + difficulty works in combination", () => {
    const mediumLesson1_1 = filterEnrichedQuestions(allQuestions, {
      lessonKeys: ["1-1"],
      difficulty: "medium",
    });

    assert.ok(mediumLesson1_1.length > 0);
    assert.ok(mediumLesson1_1.every((q) => q.lessonKey === "1-1" && q.difficulty === "medium"));
  });

  it("Test 7: Filtering with search query finds relevant questions across normalized text", () => {
    const searchResults = filterEnrichedQuestions(allQuestions, {
      searchQuery: "مور", // Moore's law
    });

    assert.ok(searchResults.length > 0, "Search for 'مور' should yield results");
    assert.ok(
      searchResults.some((q) => q.question.includes("مور") || q.options.some((o) => o.includes("مور")))
    );
  });

  it("Test 8: createExamModelFromQuestions generates valid GeneratedExamModel runnable by ExamInteractiveRunner", () => {
    const samplePool = allQuestions.slice(0, 25);
    const examModel = createExamModelFromQuestions(samplePool, {
      title: "اختبار تجريبي اختباري",
      durationMinutes: 45,
      maxQuestions: 15,
    });

    assert.ok(examModel.modelId);
    assert.equal(examModel.title, "اختبار تجريبي اختباري");
    assert.equal(examModel.durationMinutes, 45);
    assert.equal(examModel.sections.length, 1);
    assert.equal(examModel.sections[0].questions.length, 15);

    for (const q of examModel.sections[0].questions) {
      assert.ok(q.id);
      assert.ok(q.question);
      assert.equal(q.questionType, "mcq");
      assert.equal(q.options?.length, 4);
      assert.ok(q.modelAnswer);
      assert.ok(q.marks > 0);
    }
  });

  it("Test 9: Backward compatibility - getAllSimpleQuestions still strictly adheres to 4-key schema", () => {
    const simple = getAllSimpleQuestions();
    const REQUIRED_KEYS = ["answer", "difficulty", "options", "question"].sort();

    assert.ok(simple.length > 0);
    for (const q of simple) {
      const keys = Object.keys(q).sort();
      assert.deepEqual(keys, REQUIRED_KEYS);
    }
  });

  it("Test 10: Filtering with unitReviewOnly returns exactly the 30 unit review questions from chapter1.md", () => {
    const unitReviewQuestions = filterEnrichedQuestions(allQuestions, {
      unitReviewOnly: true,
    });

    assert.equal(unitReviewQuestions.length, 30, "Must return exactly 30 questions from chapter1.md");
    assert.ok(
      unitReviewQuestions.every((q) => q.isUnitReview === true),
      "All returned questions must have isUnitReview: true"
    );
    assert.ok(
      unitReviewQuestions.every((q) => q.chapterId === "chapter-1"),
      "All unit 1 review questions must belong to chapter-1"
    );
  });

  it("Test 11: Unit review questions have 4 options, valid answers, explanations, and generate valid exam", () => {
    const unitReviewQuestions = filterEnrichedQuestions(allQuestions, {
      unitReviewOnly: true,
    });

    for (const q of unitReviewQuestions) {
      assert.equal(q.options.length, 4, "Every question must have 4 options");
      assert.ok(q.options.includes(q.answer), "Answer must be one of options");
      assert.ok(q.explanation && q.explanation.length > 0, "Must have an explanation");
      assert.ok(["easy", "medium", "hard"].includes(q.difficulty));
    }

    const reviewExam = createExamModelFromQuestions(unitReviewQuestions, {
      title: "امتحان مراجعة الوحدة الأولى الشامل",
      durationMinutes: 45,
      maxQuestions: 30,
    });

    assert.equal(reviewExam.sections[0].questions.length, 30);
    assert.equal(reviewExam.durationMinutes, 45);
  });
});

