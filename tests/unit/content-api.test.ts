import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import {
  getCatalog,
  listParts,
  getPartManifest,
  getLesson,
  getLessonNav,
  getCompanionLesson,
  getDeepQuestions,
  getStoryline,
  getExamsIndex,
  getLegacyPartKey,
  staticParams,
} from "../../src/content/reader";
import { lessonHref, partHref, parsePartKey, toPartKey } from "../../src/content/paths";

const TERM1 = "secondary-2/programming-ai/term-1";
const TERM2 = "secondary-2/programming-ai/term-2";

describe("Content API (public/data via reader.ts)", () => {
  it("catalog lists grades → books → parts, both term-1 and term-2 available", () => {
    const catalog = getCatalog();
    assert.ok(catalog.grades.length >= 1);
    const parts = listParts();
    assert.equal(parts.find((p) => p.part.key === TERM1)?.part.status, "available");
    assert.equal(parts.find((p) => p.part.key === TERM2)?.part.status, "available");
    assert.equal(getLegacyPartKey(), TERM1);
  });

  it("term-1 manifest has 4 chapters / 14 lessons and every lesson resolves to a full lesson file", () => {
    const m = getPartManifest(TERM1);
    assert.equal(m.chapters.length, 4);
    const lessons = m.chapters.flatMap((c) => c.lessons);
    assert.equal(lessons.length, 14);
    for (const ref of lessons) {
      const lesson = getLesson(TERM1, ref.id);
      assert.ok(lesson, `missing lesson ${ref.id}`);
      assert.equal(lesson!.slug, ref.slug);
      assert.ok(lesson!.source?.pages?.length, `lesson ${ref.id} must cite source pages`);
    }
  });

  it("prev/next navigation crosses chapter boundaries", () => {
    const nav = getLessonNav(TERM1, "lesson-2-1");
    assert.equal(nav.prev?.id, "lesson-1-4");
    assert.equal(nav.next?.id, "lesson-2-2");
    assert.equal(getLessonNav(TERM1, "lesson-1-1").prev, undefined);
  });

  it("assessments companion: one file per lesson whose lessonNumber matches the manifest", () => {
    const companion = getPartManifest(TERM1).companions.find((c) => c.slug === "assessments");
    assert.equal(companion?.status, "available");
    assert.equal(companion!.lessons.length, 14);
    for (const ref of companion!.lessons) {
      const data = getCompanionLesson(TERM1, "assessments", ref.lessonId);
      assert.ok(data);
      assert.equal(data!.lessonNumber, ref.lessonNumber);
      assert.equal(data!.questions.length, ref.totalQuestions);
    }
  });

  it("deep questions are real authored sets (no placeholder padding)", () => {
    const m = getPartManifest(TERM1);
    for (const [key, count] of Object.entries(m.deepQuestionCounts)) {
      const qs = getDeepQuestions(TERM1, key);
      assert.equal(qs.length, count);
      assert.ok(qs.every((q) => !String(q.id || "").startsWith(`deep-${key}-`) || q.contentOrigin), "no generated filler");
    }
    assert.deepEqual(getDeepQuestions(TERM1, "9-9"), []);
  });

  it("exams index totals match per-lesson counts", () => {
    const idx = getExamsIndex(TERM1);
    assert.equal(idx.totals.practice, idx.practice.reduce((n, l) => n + l.count, 0));
    assert.equal(idx.totals.official, 558);
  });

  it("storylines exist for every term-1 lesson", () => {
    const m = getPartManifest(TERM1);
    assert.equal(m.storylineLessonIds.length, 14);
    assert.equal(getStoryline(TERM1, "lesson-1-1")?.lessonNumber, "1-1");
  });

  it("static params include every available part", () => {
    assert.ok(staticParams.parts().some((p) => p.partId === "term-1"));
    assert.ok(staticParams.parts().some((p) => p.partId === "term-2"));
    assert.equal(staticParams.lessons().length, 14 + 9);
    assert.equal(staticParams.companionLessons().length, 14); // term-2 has no assessments booklet yet
  });

  it("term-2 manifest has 3 chapters / 9 lessons, verbatim source pages, no authored content yet", () => {
    const m = getPartManifest(TERM2);
    assert.equal(m.chapters.length, 3);
    const lessons = m.chapters.flatMap((c) => c.lessons);
    assert.equal(lessons.length, 9);
    for (const ref of lessons) {
      const lesson = getLesson(TERM2, ref.id);
      assert.ok(lesson, `missing lesson ${ref.id}`);
      assert.ok(lesson!.source?.pages?.length, `lesson ${ref.id} must cite source pages`);
    }
    assert.equal(m.companions.find((c) => c.slug === "assessments")?.status, "coming-soon");
    assert.deepEqual(m.deepQuestionCounts, {});
    assert.deepEqual(m.storylineLessonIds, []);
  });

  it("paths build trailing-slash routes", () => {
    assert.equal(partHref(TERM1), `/g/${TERM1}/`);
    assert.equal(partHref(TERM1, "exams"), `/g/${TERM1}/exams/`);
    assert.equal(lessonHref(TERM1, "chapter-1", "x"), `/g/${TERM1}/chapters/chapter-1/x/`);
    assert.equal(toPartKey(parsePartKey(TERM1)), TERM1);
  });

  it("data build is deterministic (same contentHash when run twice)", () => {
    const before = getPartManifest(TERM1).contentHash;
    execFileSync(process.execPath, [path.resolve("node_modules/tsx/dist/cli.mjs"), "scripts/data/build-data.ts"], { stdio: "pipe" });
    const after = JSON.parse(fs.readFileSync(`public/data/${TERM1}/manifest.json`, "utf8")).contentHash;
    assert.equal(after, before);
  });
});
