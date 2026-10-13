/**
 * Data build: book-sources/ (canonical) → public/data/ (generated, gitignored).
 *
 *   npm run build:data            # every part listed in book-sources/catalog.json
 *
 * For each AVAILABLE part it emits small, independently fetchable JSON files so that no page
 * or client bundle ever has to load a whole question bank:
 *
 *   public/data/catalog.json
 *   public/data/<grade>/<book>/<part>/
 *     manifest.json          TOC + stats + companion TOC + contentHash (light; used by every part page)
 *     lessons/<lessonId>.json        full lesson (server-rendered)
 *     assessments/<lessonId>.json    official booklet questions (companion "assessments")
 *     deep/<lessonKey>.json          authored deep questions ("1-1", "1-review")
 *     practice/<lessonKey>.json      deep questions converted to strict 4-option practice items
 *     exams-index.json               counts for the exams page
 *     glossary.json  acronyms.json  simulators.json  search-lessons.json
 *     storylines/<lessonId>.json
 *
 * Canonical files are never modified. Writes are skipped when content is unchanged (OneDrive).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { listParts, getSources, readCatalog } from "../sources-config.mjs";
import { enrichDeepQuestions } from "../../src/lib/practice";
import type { Chapter, Lesson, GlossaryTerm, AcronymTerm, SimulatorMeta, BookStats } from "../../src/types";
import type {
  Catalog,
  CatalogPart,
  CompanionManifest,
  ExamsIndex,
  NavChapter,
  PartManifest,
  SearchLesson,
} from "../../src/types/catalog";
import type { OfficialLessonAssessments } from "../../src/types/assessments";
import type { DeepChallengingQuestion } from "../../src/types/deep-questions";
import type { LessonStoryline } from "../../src/types/storyline";

/** Bump when the output format changes so content hashes (and offline packs) invalidate. */
const DATA_FORMAT_VERSION = 1;
const OUT_ROOT = path.resolve("public", "data");

const written = new Set<string>();
let changedCount = 0;

function sleep(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy wait: synchronous retry for OneDrive file locks */
  }
}

function writeJson(rel: string, data: unknown) {
  const file = path.join(OUT_ROOT, ...rel.split("/"));
  const content = JSON.stringify(data);
  written.add(path.normalize(file));
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  for (let attempt = 1; ; attempt++) {
    try {
      fs.writeFileSync(file, content, "utf8");
      changedCount++;
      return;
    } catch (err) {
      if (attempt >= 5) throw err;
      sleep(80 * attempt);
    }
  }
}

function readJson<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : fallback;
}

function hashTree(dir: string, hash: crypto.Hash) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) hashTree(full, hash);
    else if (ent.name.endsWith(".json")) {
      hash.update(ent.name);
      hash.update(fs.readFileSync(full));
    }
  }
}

function lessonKeyOf(lesson: { number: string }) {
  return lesson.number;
}

function readDeepQuestions(deepDir: string, chapters: Chapter[]): Record<string, DeepChallengingQuestion[]> {
  const byKey: Record<string, DeepChallengingQuestion[]> = {};
  if (!fs.existsSync(deepDir)) return byKey;
  const chapterDirs = fs
    .readdirSync(deepDir)
    .filter((d) => /^chapter-\d+$/.test(d) && fs.statSync(path.join(deepDir, d)).isDirectory())
    .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
  for (const dir of chapterDirs) {
    const files = fs.readdirSync(path.join(deepDir, dir)).sort();
    for (const f of files) {
      const lessonMatch = f.match(/^lesson-(\d+-\d+)\.json$/);
      const reviewMatch = f.match(/^unit-(\d+)-review\.json$/);
      const key = lessonMatch ? lessonMatch[1] : reviewMatch ? `${reviewMatch[1]}-review` : null;
      if (!key) continue;
      byKey[key] = JSON.parse(fs.readFileSync(path.join(deepDir, dir, f), "utf8"));
    }
  }
  // Normalise identifiers exactly like the previous runtime lookup did (no padding, no invented questions).
  const lessonIdByKey = new Map(chapters.flatMap((c) => c.lessons.map((l) => [l.number, l.id] as const)));
  for (const [key, list] of Object.entries(byKey)) {
    const lessonId = lessonIdByKey.get(key) ?? `chapter-${key.split("-")[0]}-review`;
    byKey[key] = list.map((q, idx) => ({
      ...q,
      index: q.index || idx + 1,
      lessonId: q.lessonId || lessonId,
      lessonNumber: q.lessonNumber || key,
    }));
  }
  return byKey;
}

function computeStats(chapters: Chapter[], glossary: GlossaryTerm[], acronyms: AcronymTerm[], simulators: SimulatorMeta[]): BookStats {
  return {
    totalChapters: chapters.length,
    totalLessons: chapters.reduce((n, ch) => n + ch.lessons.length, 0),
    totalSimulators: simulators.length,
    totalGlossaryTerms: glossary.length,
    totalAcronyms: acronyms.length,
    totalExamQuestions: chapters.reduce((n, ch) => n + ch.lessons.reduce((m, l) => m + (l.questions?.length || 0), 0), 0),
  };
}

function toNavChapters(chapters: Chapter[]): NavChapter[] {
  return chapters.map((ch) => ({
    id: ch.id,
    number: ch.number,
    title: ch.title,
    englishTitle: ch.englishTitle,
    description: ch.description,
    colorTheme: ch.colorTheme,
    icon: ch.icon,
    pageStart: ch.pageStart,
    pageEnd: ch.pageEnd,
    lessons: ch.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      number: l.number,
      title: l.title,
      englishTitle: l.englishTitle,
      pageRange: l.pageRange,
      chapterId: ch.id,
    })),
  }));
}

interface PartBuildResult {
  stats?: BookStats;
}

function buildPart(entry: { key: string; grade: any; book: any; part: any }): PartBuildResult {
  const sources = getSources(entry.key);
  const { key } = entry;

  if (entry.part.status !== "available") {
    console.log(`  ⏭️  ${key}: ${entry.part.status} (no pages generated)`);
    return {};
  }
  if (!fs.existsSync(sources.canonicalBookFile)) {
    throw new Error(`${key} is "available" but ${sources.canonicalBookFile} is missing`);
  }

  const book = readJson<{ meta?: Record<string, any>; chapters: Chapter[] }>(sources.canonicalBookFile, { chapters: [] });
  const chapters = book.chapters;
  const glossary = readJson<GlossaryTerm[]>(sources.canonicalGlossaryFile, []);
  const acronyms = readJson<AcronymTerm[]>(sources.canonicalAcronymsFile, []);
  const simulators = readJson<SimulatorMeta[]>(sources.simulatorsFile, []);
  const deepByKey = readDeepQuestions(sources.deepQuestionsDir, chapters);
  const lessonsById = new Map<string, Lesson>(chapters.flatMap((c) => c.lessons.map((l) => [l.id, l] as const)));

  const hash = crypto.createHash("sha256");
  hash.update(`format:${DATA_FORMAT_VERSION}|part:${JSON.stringify(entry.part)}`);
  hashTree(sources.canonical, hash);
  const contentHash = hash.digest("hex").slice(0, 16);

  // Lessons
  for (const lesson of lessonsById.values()) writeJson(`${key}/lessons/${lesson.id}.json`, lesson);

  // Deep + practice questions
  const practice = enrichDeepQuestions(deepByKey, chapters);
  const deepQuestionCounts: Record<string, number> = {};
  for (const [lessonKey, list] of Object.entries(deepByKey)) {
    deepQuestionCounts[lessonKey] = list.length;
    writeJson(`${key}/deep/${lessonKey}.json`, list);
    writeJson(`${key}/practice/${lessonKey}.json`, practice.filter((q) => q.lessonKey === lessonKey));
  }

  // Companions (official assessments booklet)
  const companions: CompanionManifest[] = [];
  const officialIndex: ExamsIndex["official"] = [];
  for (const c of sources.companions) {
    const lessons: CompanionManifest["lessons"] = [];
    if (c.status === "available" && fs.existsSync(c.dataDir)) {
      const files = fs.readdirSync(c.dataDir).filter((f: string) => /^lesson-\d+-\d+\.json$/.test(f)).sort();
      for (const f of files) {
        const data = readJson<OfficialLessonAssessments>(path.join(c.dataDir, f), null as never);
        const lesson = lessonsById.get(data.lessonId);
        if (!lesson) throw new Error(`${key}: companion ${c.slug} references unknown lesson ${data.lessonId}`);
        writeJson(`${key}/${c.slug}/${data.lessonId}.json`, data);
        lessons.push({
          lessonId: data.lessonId,
          lessonNumber: data.lessonNumber,
          chapterId: lesson.chapterId,
          slug: lesson.slug,
          title: data.lessonTitle,
          bookletPages: data.bookletPages,
          textbookPages: data.textbookPages,
          totalQuestions: data.questions.length,
          mcqCount: data.questions.filter((q) => q.type === "mcq").length,
          essayCount: data.questions.filter((q) => q.type === "essay").length,
        });
        if (c.kind === "assessments") {
          officialIndex.push({
            lessonId: data.lessonId,
            lessonNumber: data.lessonNumber,
            chapterId: lesson.chapterId,
            count: data.questions.length,
            mcqCount: data.questions.filter((q) => q.type === "mcq").length,
            essayCount: data.questions.filter((q) => q.type === "essay").length,
          });
        }
      }
    }
    companions.push({
      slug: c.slug,
      kind: c.kind,
      title: c.title,
      status: c.status === "available" && lessons.length > 0 ? "available" : "coming-soon",
      lessons,
      totalQuestions: lessons.reduce((n, l) => n + l.totalQuestions, 0),
    });
  }

  // Exams index
  const practiceIndex: ExamsIndex["practice"] = Object.keys(deepByKey).map((lessonKey) => {
    const items = practice.filter((q) => q.lessonKey === lessonKey);
    const first = items[0];
    const isUnitReview = lessonKey.includes("review");
    const chapterNumber = Number(lessonKey.split("-")[0]);
    const chapter = chapters.find((c) => c.number === chapterNumber);
    return {
      lessonKey,
      lessonId: first?.lessonId ?? (isUnitReview ? `chapter-${chapterNumber}-review` : `lesson-${lessonKey}`),
      chapterId: chapter?.id ?? `chapter-${chapterNumber}`,
      chapterNumber,
      title: first?.lessonTitle ?? lessonKey,
      isUnitReview,
      count: items.length,
      difficulty: {
        easy: items.filter((q) => q.difficulty === "easy").length,
        medium: items.filter((q) => q.difficulty === "medium").length,
        hard: items.filter((q) => q.difficulty === "hard").length,
      },
    };
  });
  const examsIndex: ExamsIndex = {
    practice: practiceIndex,
    official: officialIndex,
    totals: {
      practice: practiceIndex.reduce((n, l) => n + l.count, 0),
      official: officialIndex.reduce((n, l) => n + l.count, 0),
    },
  };
  writeJson(`${key}/exams-index.json`, examsIndex);

  // Glossary, acronyms, simulators
  writeJson(`${key}/glossary.json`, glossary);
  writeJson(`${key}/acronyms.json`, acronyms);
  writeJson(`${key}/simulators.json`, simulators);

  // Storylines
  const storylineLessonIds: string[] = [];
  if (fs.existsSync(sources.storylinesDir)) {
    for (const f of fs.readdirSync(sources.storylinesDir).filter((x: string) => x.endsWith(".json")).sort()) {
      for (const story of readJson<LessonStoryline[]>(path.join(sources.storylinesDir, f), [])) {
        if (!lessonsById.has(story.lessonId)) throw new Error(`${key}: storyline for unknown lesson ${story.lessonId}`);
        writeJson(`${key}/storylines/${story.lessonId}.json`, story);
        storylineLessonIds.push(story.lessonId);
      }
    }
  }

  // Lesson search records (glossary/acronyms are searched from their own files)
  const searchLessons: SearchLesson[] = chapters.flatMap((ch) =>
    ch.lessons.map((l) => ({
      id: l.id,
      number: l.number,
      title: l.title,
      englishTitle: l.englishTitle,
      chapterId: ch.id,
      chapterTitle: ch.title,
      slug: l.slug,
      coreIdea: l.coreIdea,
      concepts: l.keyConcepts.flatMap((k) => [k.termAr, k.termEn || ""]).filter(Boolean),
    }))
  );
  writeJson(`${key}/search-lessons.json`, searchLessons);

  const stats = computeStats(chapters, glossary, acronyms, simulators);
  const manifest: PartManifest = {
    key,
    ref: { gradeId: entry.grade.id, bookSlug: entry.book.slug, partId: entry.part.id },
    contentHash,
    gradeTitle: entry.grade.title,
    bookTitle: entry.book.title,
    bookEnglishTitle: entry.book.englishTitle,
    partTitle: entry.part.title,
    partShortTitle: entry.part.shortTitle,
    academicYear: entry.part.edition?.academicYear ?? book.meta?.academicYear,
    totalPages: book.meta?.totalPages,
    assetsBase: entry.part.assetsBase,
    stats,
    chapters: toNavChapters(chapters),
    companions,
    deepQuestionCounts,
    storylineLessonIds,
  };
  writeJson(`${key}/manifest.json`, manifest);

  console.log(
    `  ✅ ${key}: ${stats.totalLessons} lessons, ${practice.length} practice / ${examsIndex.totals.official} official questions, ` +
      `${storylineLessonIds.length} storylines (hash ${contentHash})`
  );
  return { stats };
}

function removeStaleFiles(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.normalize(path.join(dir, ent.name));
    if (ent.isDirectory()) {
      removeStaleFiles(full);
      if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
    } else if (!written.has(full)) {
      fs.rmSync(full);
      changedCount++;
    }
  }
}

function main() {
  console.log("🏗️  Building per-part data from book-sources/ → public/data/");
  const rawCatalog = readCatalog();
  const results = new Map<string, PartBuildResult>();
  for (const entry of listParts()) results.set(entry.key, buildPart(entry));

  const catalog: Catalog = {
    version: 1,
    grades: [...rawCatalog.grades]
      .sort((a: any, b: any) => a.order - b.order)
      .map((g: any) => ({
        id: g.id,
        title: g.title,
        stage: g.stage,
        order: g.order,
        books: g.books.map((b: any) => ({
          slug: b.slug,
          title: b.title,
          englishTitle: b.englishTitle,
          icon: b.icon,
          colorTheme: b.colorTheme,
          description: b.description,
          accreditation: b.accreditation,
          parts: [...b.parts]
            .sort((x: any, y: any) => x.order - y.order)
            .map<CatalogPart>((p: any) => {
              const key = `${g.id}/${b.slug}/${p.id}`;
              return {
                id: p.id,
                key,
                title: p.title,
                shortTitle: p.shortTitle,
                order: p.order,
                status: p.status,
                academicYear: p.edition?.academicYear,
                stats: results.get(key)?.stats,
                companions: (p.companions || []).map((c: any) => ({
                  slug: c.slug,
                  kind: c.kind,
                  title: c.title,
                  status: p.status === "available" ? c.status : "coming-soon",
                })),
              };
            }),
        })),
      })),
  };
  writeJson("catalog.json", catalog);

  removeStaleFiles(OUT_ROOT);
  console.log(`✨ Data build finished (${written.size} files, ${changedCount} changed).`);
}

main();
