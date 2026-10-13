import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LEGACY_PART_KEY,
  migrateLegacyKeyName,
  migrateProgressV1,
  sanitizeProgressV2,
} from "../../src/lib/storage";

describe("Progress storage v1 → v2 migration", () => {
  const v1 = {
    completedLessons: ["lesson-1-1", "lesson-2-3", 42],
    bookmarks: ["lesson-1-2"],
    quizScores: { "lesson-1-1": { score: 8, total: 10, date: "2026-09-01T00:00:00.000Z" } },
    notes: { "lesson-1-1": "ملاحظة" },
    streakDays: 4,
    lastActiveDate: "2026-09-30",
    points: 350,
    badges: ["مستكشف المعرفة الأول", "العلامة الكاملة 🎯"],
  };

  it("moves per-lesson data under the legacy term-1 part and keeps global stats", () => {
    const v2 = migrateProgressV1(v1);
    assert.equal(v2.version, 2);
    assert.deepEqual(Object.keys(v2.parts), [LEGACY_PART_KEY]);
    const part = v2.parts[LEGACY_PART_KEY];
    assert.deepEqual(part.completedLessons, ["lesson-1-1", "lesson-2-3"], "non-string ids are dropped");
    assert.deepEqual(part.bookmarks, ["lesson-1-2"]);
    assert.equal(part.quizScores["lesson-1-1"].score, 8);
    assert.equal(part.notes["lesson-1-1"], "ملاحظة");
    assert.equal(v2.global.points, 350);
    assert.equal(v2.global.streakDays, 4);
    assert.deepEqual(v2.global.badges, v1.badges);
  });

  it("is safe on corrupted input", () => {
    assert.deepEqual(migrateProgressV1(null).parts, {});
    assert.deepEqual(migrateProgressV1("garbage").parts, {});
    assert.deepEqual(sanitizeProgressV2({ version: 1 }).parts, {});
    const bad = sanitizeProgressV2({ version: 2, parts: { x: { completedLessons: "nope" } }, global: { points: -5 } });
    assert.deepEqual(bad.parts.x.completedLessons, []);
    assert.equal(bad.global.points, 0);
  });

  it("round-trips a migrated value through the sanitizer unchanged", () => {
    const v2 = migrateProgressV1(v1);
    assert.deepEqual(sanitizeProgressV2(JSON.parse(JSON.stringify(v2))), v2);
  });

  it("renames essay and glossary keys into part-scoped names", () => {
    assert.equal(migrateLegacyKeyName("essay_ans_lesson-1-2_Q7"), `essay_ans:${LEGACY_PART_KEY}:lesson-1-2:Q7`);
    assert.equal(migrateLegacyKeyName("essay_score_lesson-3-1_essay_2"), `essay_score:${LEGACY_PART_KEY}:lesson-3-1:essay_2`);
    assert.equal(migrateLegacyKeyName("glossary_bookmarks_v1"), `glossary_bookmarks:v2:${LEGACY_PART_KEY}`);
    assert.equal(migrateLegacyKeyName("lesson_font_size"), null, "UI preferences stay global");
  });
});
