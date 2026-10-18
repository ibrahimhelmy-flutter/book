import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  essayStatus,
  fillBlankStatus,
  isBlankCorrect,
  questionKind,
  splitBlanks,
  tagChapterQuestions,
} from "../../src/lib/deep-question-kinds";

describe("deep question kinds", () => {
  it("unknown and legacy types are four-option questions", () => {
    assert.equal(questionKind({}), "mcq");
    assert.equal(questionKind({ type: "scenario" }), "mcq");
    assert.equal(questionKind({ type: "fill_blank" }), "fill_blank");
  });

  it("splits a question at each gap", () => {
    assert.deepEqual(splitBlanks("يستخدم ____ عاملين، و____ عاملين أو أكثر."), ["يستخدم ", " عاملين، و", " عاملين أو أكثر."]);
    assert.equal(splitBlanks("بلا فراغات").length, 1);
  });

  it("gap answers ignore hamza, taa marbuta, «ال», brackets and spacing", () => {
    const blank = { answer: "التشفير المتماثل", accept: ["التشفير بالمفتاح المتناظر"] };
    assert.ok(isBlankCorrect("  تشفير متماثل ", blank));
    assert.ok(isBlankCorrect("التشفير بالمفتاح المتناظر", blank));
    assert.ok(isBlankCorrect("الحيازه", { answer: "الحيازة" }));
    assert.ok(isBlankCorrect("(2FA)", { answer: "2fa" }));
    assert.ok(!isBlankCorrect("التشفير", blank));
    assert.ok(!isBlankCorrect("", blank));
  });

  it("chapter questions are tagged with their lesson, or the integrated entry when they span lessons", () => {
    const base = { question: "س", options: [], answer: "ج", difficulty: "hard" as const };
    const tagged = tagChapterQuestions(
      [
        { ...base, sourceBlockIds: ["sec-2-2-3"], conceptIds: ["concept-2-2-03"] },
        { ...base, conceptIds: ["concept-2-1-05", "concept-2-2-05"] },
        { ...base, sourceBlockIds: ["lesson-2-3"] },
        { ...base },
      ],
      2
    );
    assert.deepEqual(
      tagged.map((q) => q.sourceBlockIds),
      [["lesson-2-2"], ["chapter-2-integrated"], ["lesson-2-3"], ["chapter-2-integrated"]]
    );
  });

  it("fill-blank and essay statuses", () => {
    const blanks = [{ answer: "المعرفة" }, { answer: "الحيازة" }];
    assert.equal(fillBlankStatus(["المعرفة", "الحيازة"], blanks), "correct");
    assert.equal(fillBlankStatus(["المعرفة", ""], blanks), "partial");
    assert.equal(fillBlankStatus([], blanks), "wrong");
    assert.equal(essayStatus(3, 3), "correct");
    assert.equal(essayStatus(2, 4), "partial");
    assert.equal(essayStatus(1, 4), "wrong");
    assert.equal(essayStatus(0, 0), "wrong");
  });
});
