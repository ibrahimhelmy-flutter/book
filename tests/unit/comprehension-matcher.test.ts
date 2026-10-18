import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchQuestionToSection } from "../../src/lib/comprehension-matcher";
import type { Lesson } from "../../src/types";
import type { DeepChallengingQuestion } from "../../src/types/deep-questions";

const sections = [
  { id: "sec-a", title: "1. الأول", content: "نص القسم الأول", source: { pages: [4], primaryPage: 4 } },
  { id: "sec-b", title: "2. الثاني", content: "نص القسم الثاني", source: { pages: [5], primaryPage: 5 } },
] as unknown as Lesson["sections"];
const lesson = { id: "lesson-x", sections, keyConcepts: [] } as unknown as Lesson;
const question = (extra: Partial<DeepChallengingQuestion>): DeepChallengingQuestion => ({
  question: "سؤال",
  options: ["أ", "ب", "ج", "د"],
  answer: "أ",
  difficulty: "medium",
  ...extra,
});

describe("comprehension matcher", () => {
  it("an explicit section id in sourceBlockIds wins over the page number", () => {
    const q = question({ sourceBlockIds: ["sec-b"], source: { pages: [4], primaryPage: 4 } as DeepChallengingQuestion["source"] });
    assert.equal(matchQuestionToSection(q, sections, lesson, 0, 1).sectionId, "sec-b");
  });

  it("an unknown section id falls back to the page match", () => {
    const q = question({ sourceBlockIds: ["sec-z"], source: { pages: [4], primaryPage: 4 } as DeepChallengingQuestion["source"] });
    assert.equal(matchQuestionToSection(q, sections, lesson, 0, 1).sectionId, "sec-a");
  });
});
