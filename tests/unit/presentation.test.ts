import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getLesson, getPartManifest } from "../../src/content/reader";
import { auditPresentationPlan, draftPresentationPlan, splitBlocks, splitSentences } from "../../src/lib/presentation";
import type { Lesson } from "../../src/types";
import type { PresentationDeck, PresentationPlan } from "../../src/types/presentation";

/**
 * العرض التقديمي: نص الكتاب فقط، كل فقرة مرة واحدة وبترتيب الكتاب، ولا أسئلة.
 */
const PARTS = ["secondary-2/programming-ai/term-1", "secondary-2/programming-ai/term-2"];
const DATA = path.join(process.cwd(), "public", "data");

const lessons = PARTS.flatMap((key) =>
  getPartManifest(key).chapters.flatMap((c) => c.lessons.map((l) => ({ key, lesson: getLesson(key, l.id)! })))
);

function readDeck(key: string, lessonId: string): PresentationDeck {
  return JSON.parse(fs.readFileSync(path.join(DATA, ...key.split("/"), "presentations", `${lessonId}.json`), "utf8"));
}

function leafStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => leafStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => leafStrings(v, out));
  return out;
}

const paragraphs = (lesson: Lesson) => lesson.sections.flatMap((s) => splitBlocks(s.content));

/** Structural values in a deck that are not text shown as content. */
const STRUCTURAL = new Set(["cover", "objectives", "path", "introduction", "idea", "note", "summary", "answer", "previous", "current", "next"]);

describe("Lesson presentation decks", () => {
  it("every lesson has a deck", () => {
    for (const { key, lesson } of lessons) assert.equal(readDeck(key, lesson.id).lessonId, lesson.id);
  });

  it("every string in a deck is copied from the lesson itself", () => {
    for (const { key, lesson } of lessons) {
      const source = leafStrings(lesson);
      for (const s of leafStrings(readDeck(key, lesson.id))) {
        if (STRUCTURAL.has(s) || /^sec-/.test(s)) continue;
        assert.ok(source.some((t) => t.includes(s)), `${lesson.id}: "${s.slice(0, 80)}" is not in the lesson`);
      }
    }
  });

  it("presents every paragraph of every section exactly once, in the book's order", () => {
    for (const { key, lesson } of lessons) {
      const expected = lesson.sections.flatMap((s) => splitBlocks(s.content));
      const shown = readDeck(key, lesson.id).slides.flatMap((s) => (s.kind === "idea" ? s.blocks : []));
      assert.deepEqual(shown, expected, lesson.id);
    }
  });

  it("shows every figure, table, key term and «الفكرة الرئيسة» once", () => {
    for (const { key, lesson } of lessons) {
      const ideas = readDeck(key, lesson.id).slides.flatMap((s) => (s.kind === "idea" ? [s] : []));
      assert.equal(ideas.filter((s) => s.figure).length, lesson.sections.filter((s) => s.image).length, `${lesson.id} figures`);
      assert.equal(ideas.filter((s) => s.table).length, lesson.sections.filter((s) => s.table).length, `${lesson.id} tables`);
      assert.deepEqual(
        ideas.flatMap((s) => s.terms.map((t) => t.termAr)).sort(),
        lesson.keyConcepts.map((c) => c.termAr).sort(),
        `${lesson.id} terms`
      );
      const notes = readDeck(key, lesson.id).slides.flatMap((s) => (s.kind === "note" ? [s.text] : []));
      for (const c of lesson.callouts.filter((c) => c.type === "important_note" && !paragraphs(lesson).includes(c.content))) {
        assert.equal(notes.filter((t) => t === c.content).length, 1, `${lesson.id} note ${c.id}`);
      }
    }
  });

  it("never shows a note that repeats a paragraph", () => {
    for (const { key, lesson } of lessons) {
      for (const s of readDeck(key, lesson.id).slides) {
        if (s.kind === "note") assert.ok(!paragraphs(lesson).includes(s.text), `${lesson.id}: note repeats "${s.text.slice(0, 60)}"`);
      }
    }
  });

  it("chapter 1 shows the book's «الفكرة الرئيسة» box, stored there as coreIdea", () => {
    for (const id of ["lesson-1-1", "lesson-1-3", "lesson-1-4"]) {
      const { key, lesson } = lessons.find((l) => l.lesson.id === id)!;
      const notes = readDeck(key, id).slides.filter((s) => s.kind === "note" && s.text === lesson.coreIdea);
      assert.equal(notes.length, 1, id);
    }
  });

  it("contains no questions: no think-boxes, solved examples, activities or question banks", () => {
    for (const { key, lesson } of lessons) {
      const deckText = leafStrings(readDeck(key, lesson.id)).join("\n");
      const excluded = [
        ...lesson.callouts.filter((c) => c.type !== "important_note").flatMap((c) => [c.content, c.question || ""]),
        ...(lesson.solvedExample?.items || []).map((i) => i.question),
        ...(lesson.questions || []).map((q) => q.questionText),
        lesson.exploreInPairs || "",
        lesson.appliedTask?.prompt || "",
        lesson.engineerChallenge?.scenario || "",
        lesson.challengeYourself?.challenge || "",
      ].filter((t) => t.length > 20);
      for (const t of excluded) assert.ok(!deckText.includes(t), `${lesson.id}: deck contains "${t.slice(0, 60)}"`);
    }
  });

  it("opens with the key question and closes with the book's answer to it", () => {
    for (const { key, lesson } of lessons) {
      const slides = readDeck(key, lesson.id).slides;
      const cover = slides[0];
      assert.ok(cover.kind === "cover" && cover.keyQuestion === lesson.keyQuestion, lesson.id);
      const last = slides[slides.length - 1];
      assert.ok(last.kind === "answer" && last.answer === lesson.mainQuestionAnswer, lesson.id);
    }
  });

  it("splitSentences keeps the text intact", () => {
    for (const { lesson } of lessons) {
      if (lesson.introduction) assert.equal(splitSentences(lesson.introduction).join(" "), lesson.introduction.replace(/\s+/g, " ").trim());
    }
    assert.deepEqual(splitSentences("(الذكاء - AI)... مجال واسع. أمثلة: الترجمة."), ["(الذكاء - AI)... مجال واسع.", "أمثلة: الترجمة."]);
  });

  it("every lesson uses a plan reviewed against the book pages", () => {
    for (const { key, lesson } of lessons) assert.equal(readDeck(key, lesson.id).reviewed, true, lesson.id);
  });
});

describe("auditPresentationPlan", () => {
  const lesson: Lesson = lessons.find((l) => l.lesson.id === "lesson-1-2")!.lesson;
  const valid = (): PresentationPlan => JSON.parse(JSON.stringify(draftPresentationPlan(lesson)));
  const ideaIndex = (plan: PresentationPlan) => plan.slides.findIndex((s) => "section" in s && s.blocks.length > 1);

  it("accepts the mechanical draft of every lesson", () => {
    for (const { lesson: l } of lessons) assert.deepEqual(auditPresentationPlan(l, draftPresentationPlan(l)), [], l.id);
  });

  it("rejects a dropped paragraph", () => {
    const plan = valid();
    const s = plan.slides[ideaIndex(plan)] as { blocks: number[] };
    s.blocks.pop();
    assert.ok(auditPresentationPlan(lesson, plan).some((e) => e.includes("not presented")));
  });

  it("rejects a repeated paragraph", () => {
    const plan = valid();
    plan.slides.push({ section: "sec-1-2-1", blocks: [0] });
    assert.ok(auditPresentationPlan(lesson, plan).some((e) => e.includes("more than once")));
  });

  it("rejects slides out of the book's order", () => {
    const plan = valid();
    const [a, b] = plan.slides.flatMap((s, i) => ("section" in s ? [i] : []));
    [plan.slides[a], plan.slides[b]] = [plan.slides[b], plan.slides[a]];
    assert.ok(auditPresentationPlan(lesson, plan).some((e) => e.includes("order")));
  });

  it("rejects any text in a plan", () => {
    const plan = valid();
    (plan.slides[0] as unknown as Record<string, unknown>).text = "شرح إضافي";
    assert.ok(auditPresentationPlan(lesson, plan).some((e) => e.includes("unexpected fields")));
  });

  it("rejects a missing figure and an unplaced key term", () => {
    const plan = valid();
    for (const s of plan.slides) if ("section" in s) {
      delete s.figure;
      s.terms = [];
    }
    const errors = auditPresentationPlan(lesson, plan);
    assert.ok(errors.some((e) => e.startsWith("figure of")));
    assert.ok(errors.some((e) => e.startsWith("key term")));
  });

  it("rejects a note that repeats a paragraph, and a second coreIdea note", () => {
    const l11 = lessons.find((l) => l.lesson.id === "lesson-1-1")!.lesson;
    const plan = JSON.parse(JSON.stringify(draftPresentationPlan(l11))) as PresentationPlan;
    plan.slides.push({ note: "callout-1-1-1" }, { note: "coreIdea" }, { note: "coreIdea" });
    const errors = auditPresentationPlan(l11, plan);
    assert.ok(errors.some((e) => e.includes("callout-1-1-1")));
    assert.ok(errors.some((e) => e.includes("coreIdea note appears more than once")));
  });

  it("rejects a think-box placed as a note", () => {
    const plan = valid();
    const reflect = lesson.callouts.find((c) => c.type === "pause_and_reflect")!;
    plan.slides.push({ note: reflect.id });
    assert.ok(auditPresentationPlan(lesson, plan).some((e) => e.includes("not a presentable important_note")));
  });
});
