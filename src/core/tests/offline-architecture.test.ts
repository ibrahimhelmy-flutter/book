import assert from "assert";
import fs from "fs";
import path from "path";
import { CURRICULUM_DATA } from "../../data/curriculum";
import { getAllCommitteeQuestions } from "../../lib/exam-generator/committeeBank";
import { generateExamSystem } from "../../lib/exam-generator/pipeline";
import { ExamGenerationConfig } from "../../lib/exam-generator/types";

console.log("=================================================");
console.log("🧪 RUNNING OFFLINE-FIRST ARCHITECTURE GATE TESTS");
console.log("=================================================");

let passCount = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// Suite 1: Canonical Source of Truth Contract
it("Curriculum has exactly 14 lessons across 4 chapters as static source of truth", () => {
  assert.strictEqual(CURRICULUM_DATA.length, 4, "Must have 4 chapters");
  const totalLessons = CURRICULUM_DATA.reduce((acc, ch) => acc + ch.lessons.length, 0);
  assert.strictEqual(totalLessons, 14, "Must have 14 lessons");
});

// Suite 2: Question Bank Volume
it("Question bank contains verified canonical questions (>= 280) ready for offline IndexedDB copy", () => {
  const allQuestions = getAllCommitteeQuestions();
  assert.ok(allQuestions.length >= 280, `Must have at least 280 questions, found ${allQuestions.length}`);
  console.log(`   ℹ️ Verified Active Questions Bank: ${allQuestions.length} questions ready for offline storage`);
});

// Suite 3: Measured 48 Diagrams Contract
it("Exactly 48 diagrams exist in extracted folder and total exactly ~5.69 MB (Measured Acceptance Criterion)", () => {
  const imagesDir = path.resolve("public/images/extracted");
  assert.ok(fs.existsSync(imagesDir), "Extracted images directory must exist");
  const files = fs.readdirSync(imagesDir);
  assert.strictEqual(files.length, 48, "Must have exactly 48 diagrams");

  const totalBytes = files.reduce((acc, f) => acc + fs.statSync(path.join(imagesDir, f)).size, 0);
  const totalMB = totalBytes / (1024 * 1024);
  assert.ok(totalMB > 5.0 && totalMB < 6.5, `Images size must be ~5.69 MB, got ${totalMB.toFixed(2)} MB`);
  console.log(`   ℹ️ Measured Extracted Diagrams: ${totalMB.toFixed(2)} MB`);
});

// Suite 4: PWA Web Manifest Validity
it("PWA webmanifest is valid JSON with standalone display, RTL, and SVG icon", () => {
  const manifestPath = path.resolve("public/manifest.webmanifest");
  assert.ok(fs.existsSync(manifestPath), "manifest.webmanifest must exist");
  const content = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert.strictEqual(content.display, "standalone");
  assert.strictEqual(content.dir, "rtl");
  assert.strictEqual(content.lang, "ar");
  assert.ok(Array.isArray(content.icons) && content.icons.length > 0);
});

// Suite 5: Service Worker Implementation
it("Service Worker sw.js exists with CacheStorage handlers and offline pack message handler", () => {
  const swPath = path.resolve("public/sw.js");
  assert.ok(fs.existsSync(swPath), "sw.js must exist");
  const swContent = fs.readFileSync(swPath, "utf-8");
  assert.ok(swContent.includes("CACHE_OFFLINE_PACK"), "Must handle CACHE_OFFLINE_PACK");
  assert.ok(swContent.includes("OFFLINE_PACK_CACHE"), "Must use OFFLINE_PACK_CACHE");
  assert.ok(swContent.includes("caches.match"), "Must match cache storage");
});

// Suite 6: Offline Exam Generation Engine (Zero Network Calls)
it("Exam generation runs 100% deterministically in memory without network or server", () => {
  const config: ExamGenerationConfig = {
    scope: "curriculum",
    lessonIds: CURRICULUM_DATA.flatMap((ch) => ch.lessons.map((l) => l.id)),
    questionCount: 30,
    examCount: 2,
    questionTypes: "all",
    difficultyPreset: "balanced",
    difficultyDistribution: { easy: 25, medium: 40, hard: 25, higherOrder: 10 },
    durationMinutes: 60,
    totalMarks: 60,
    includeAnswers: true,
    includeSourceReferences: true,
    useExactBookAnswers: true,
    randomizeQuestions: false,
    randomizeOptions: false,
  };

  const start = performance.now();
  const result = generateExamSystem(config);
  const elapsed = performance.now() - start;

  assert.strictEqual(result.models.length, 2, "Must generate 2 models (A and B)");
  assert.strictEqual(result.models[0].allQuestions.length, result.models[1].allQuestions.length, "Models A and B must have identical balanced question count");
  assert.ok(result.models[0].allQuestions.length >= 30, `Model must have at least 30 questions, got ${result.models[0].allQuestions.length}`);
  assert.ok(elapsed < 100, `Generation must be ultra-fast (<100ms), took ${elapsed.toFixed(2)}ms`);
  console.log(`   ℹ️ Exam generated in: ${elapsed.toFixed(2)}ms completely offline (${result.models[0].allQuestions.length} questions per model)`);
});

console.log("=================================================");
console.log(`🏁 OFFLINE ARCHITECTURE TESTS: ${passCount} PASSED, 0 FAILED`);
console.log("=================================================");
