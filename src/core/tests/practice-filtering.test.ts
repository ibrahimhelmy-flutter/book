import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateAndConvertDeepQuestion,
  getAllSimpleQuestions,
  filterSimpleQuestionsByDifficulty,
  CANONICAL_SIMPLE_SAMPLE_QUESTIONS,
  SimpleQuestion,
} from "../../lib/practice-data";

describe("Simple Questions Data & Filtering Architecture", () => {
  const REQUIRED_KEYS = ["answer", "difficulty", "options", "question"].sort();

  it("Test 1: All canonical sample questions strictly contain exactly the 4 required keys", () => {
    assert.ok(CANONICAL_SIMPLE_SAMPLE_QUESTIONS.length > 0);
    for (const q of CANONICAL_SIMPLE_SAMPLE_QUESTIONS) {
      const actualKeys = Object.keys(q).sort();
      assert.deepEqual(
        actualKeys,
        REQUIRED_KEYS,
        `Question must only have [answer, difficulty, options, question]. Found: ${JSON.stringify(actualKeys)}`
      );
    }
  });

  it("Test 2: All canonical sample questions have exactly 4 options", () => {
    for (const q of CANONICAL_SIMPLE_SAMPLE_QUESTIONS) {
      assert.equal(
        q.options.length,
        4,
        `Question options must be exactly 4. Found: ${q.options.length} in "${q.question}"`
      );
    }
  });

  it("Test 3: All canonical sample questions have their answer included in their options", () => {
    for (const q of CANONICAL_SIMPLE_SAMPLE_QUESTIONS) {
      assert.ok(
        q.options.includes(q.answer),
        `Answer "${q.answer}" must be one of the options in "${q.question}"`
      );
    }
  });

  it("Test 4: Difficulty must be strictly one of easy, medium, hard", () => {
    const validDifficulties = new Set(["easy", "medium", "hard"]);
    for (const q of CANONICAL_SIMPLE_SAMPLE_QUESTIONS) {
      assert.ok(
        validDifficulties.has(q.difficulty),
        `Difficulty must be easy, medium, or hard. Found "${q.difficulty}"`
      );
    }
  });

  it("Test 5: validateAndConvertDeepQuestion rejects invalid questions", () => {
    // Missing question
    assert.equal(
      validateAndConvertDeepQuestion({
        options: ["1", "2", "3", "4"],
        answer: "1",
        difficulty: "easy",
      }),
      null
    );

    // Fewer than 4 options
    assert.equal(
      validateAndConvertDeepQuestion({
        question: "سؤال تجريبي؟",
        options: ["1", "2", "3"],
        answer: "1",
        difficulty: "easy",
      }),
      null
    );

    // Answer not in options
    assert.equal(
      validateAndConvertDeepQuestion({
        question: "سؤال تجريبي؟",
        options: ["1", "2", "3", "4"],
        answer: "5",
        difficulty: "easy",
      }),
      null
    );

    // Valid conversion produces strictly the 4 required keys
    const validRaw = {
      id: "q-test-01",
      lessonId: "lesson-1-1",
      title: "عنوان لا نريده",
      cognitiveLevel: "فهم عميق",
      question: "ما هو البروتوكول الآمن؟",
      options: ["HTTP", "HTTPS", "FTP", "DNS"],
      correctAnswer: 1,
      difficulty: "expert",
      misconceptionTrap: "فخ لا نريده",
    };

    const converted = validateAndConvertDeepQuestion(validRaw);
    assert.ok(converted !== null);
    assert.deepEqual(Object.keys(converted!).sort(), REQUIRED_KEYS);
    assert.equal(converted!.answer, "HTTPS");
    assert.equal(converted!.difficulty, "hard"); // expert maps to hard
    assert.equal((converted as any).id, undefined);
    assert.equal((converted as any).misconceptionTrap, undefined);
  });

  it("Test 6: getAllSimpleQuestions returns valid 4-key questions from curriculum", () => {
    const questions = getAllSimpleQuestions();
    assert.ok(questions.length > 0, "Curriculum should have questions");

    for (const q of questions) {
      const keys = Object.keys(q).sort();
      assert.deepEqual(
        keys,
        REQUIRED_KEYS,
        `Curriculum question has unexpected keys: ${JSON.stringify(keys)}`
      );
      assert.equal(q.options.length, 4);
      assert.ok(q.options.includes(q.answer));
      assert.ok(["easy", "medium", "hard"].includes(q.difficulty));
    }
  });

  it("Test 7: Filtering by difficulty works accurately", () => {
    const sampleSet: SimpleQuestion[] = [
      { question: "Q1", options: ["A", "B", "C", "D"], answer: "A", difficulty: "easy" },
      { question: "Q2", options: ["A", "B", "C", "D"], answer: "B", difficulty: "medium" },
      { question: "Q3", options: ["A", "B", "C", "D"], answer: "C", difficulty: "hard" },
      { question: "Q4", options: ["A", "B", "C", "D"], answer: "D", difficulty: "easy" },
    ];

    const easyOnly = filterSimpleQuestionsByDifficulty(sampleSet, "easy");
    assert.equal(easyOnly.length, 2);
    assert.ok(easyOnly.every((q) => q.difficulty === "easy"));

    const mediumOnly = filterSimpleQuestionsByDifficulty(sampleSet, "medium");
    assert.equal(mediumOnly.length, 1);
    assert.equal(mediumOnly[0].difficulty, "medium");

    const hardOnly = filterSimpleQuestionsByDifficulty(sampleSet, "hard");
    assert.equal(hardOnly.length, 1);
    assert.equal(hardOnly[0].difficulty, "hard");

    const all = filterSimpleQuestionsByDifficulty(sampleSet, "all");
    assert.equal(all.length, 4);
  });
});
