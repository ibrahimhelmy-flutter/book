import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sectionNumbers, topLevelSections } from "../../src/lib/sections";
import { getLesson } from "../../src/content/reader";

const sec = (id: string, parentId?: string) => ({ id, title: id, content: "", parentId });

describe("lesson section numbering", () => {
  it("sub-items take their heading's number instead of a number of their own", () => {
    const sections = [sec("a"), sec("b"), sec("b1", "b"), sec("b2", "b"), sec("c")];
    assert.deepEqual([...sectionNumbers(sections).values()], ["1", "2", "2.1", "2.2", "3"]);
    assert.deepEqual(topLevelSections(sections).map((s) => s.id), ["a", "b", "c"]);
  });

  it("«طرق اتصال تطبيقات الويب» counts the book's four headings", () => {
    const lesson = getLesson("secondary-2/programming-ai/term-1", "lesson-3-2");
    assert.ok(lesson);
    assert.equal(topLevelSections(lesson.sections).length, 4);
    assert.equal(sectionNumbers(lesson.sections).get("sec-3-2-4"), "3.1");
  });
});
