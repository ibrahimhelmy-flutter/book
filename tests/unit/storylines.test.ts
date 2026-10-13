import fs from "fs";
import path from "path";
import { getLesson, getPartManifest, getStoryline } from "../../src/content/reader";
import type { BookQuote } from "../../src/types/storyline";

/**
 * يتحقق من أن "تسلسل الأفكار" مربوط بنص الكتاب:
 * كل نص في fromBook / bookTable / keyQuestion / bookSummary / bookTerms
 * يجب أن يوجد حرفيًا في النص الرسمي للدرس نفسه.
 */

const CANONICAL_DIR = path.join(
  process.cwd(),
  "book-sources/secondary-2/programming-ai/term-1/05-canonical-data/official/official-lessons"
);
const TERM1 = "secondary-2/programming-ai/term-1";
const CURRICULUM_DATA = getPartManifest(TERM1).chapters.map((c) => ({
  ...c,
  lessons: c.lessons.map((l) => getLesson(TERM1, l.id)!),
}));
const getStorylineForLesson = (_chapterId: string, slug: string) => {
  const ref = CURRICULUM_DATA.flatMap((c) => c.lessons).find((l) => l.slug === slug);
  return ref ? getStoryline(TERM1, ref.id) : null;
};

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    passCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failCount++;
  }
}

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

function collectStrings(value: unknown, out: string[]) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
}

console.log("=================================================");
console.log("🧪 RUNNING STORYLINE (تسلسل الأفكار) FIDELITY TESTS");
console.log("=================================================");

for (const chapter of CURRICULUM_DATA) {
  for (const lesson of chapter.lessons) {
    const label = `[${lesson.number}]`;
    const story = getStorylineForLesson(chapter.id, lesson.slug);
    assert(!!story, `${label} has a storyline`);
    if (!story) continue;

    assert(story.lessonSlug === lesson.slug, `${label} slug matches curriculum`);
    assert(story.lessonId === lesson.id, `${label} lessonId matches curriculum`);
    assert(story.chapterId === chapter.id, `${label} chapterId matches curriculum`);
    assert(story.lessonNumber === lesson.number, `${label} lessonNumber matches curriculum`);
    assert(story.title === lesson.title, `${label} title matches curriculum`);

    // Official corpus: canonical lesson blocks + tables from the generated curriculum
    const canonicalFile = path.join(CANONICAL_DIR, chapter.id, `${lesson.id}.json`);
    const canonical = JSON.parse(fs.readFileSync(canonicalFile, "utf8"));
    const strings: string[] = [];
    collectStrings(canonical.officialBlocks, strings);
    for (const section of (lesson as any).sections || []) {
      if (section.table) collectStrings(section.table, strings);
    }
    const corpus = strings.map(normalize);
    const inBook = (text: string) => {
      const needle = normalize(text);
      return needle.length > 0 && corpus.some((s) => s.includes(needle));
    };

    const [startPage, endPage] = [canonical.meta.startPage, canonical.meta.endPage];
    const checkQuote = (q: BookQuote, where: string) => {
      assert(inBook(q.text), `${label} ${where}: quote is verbatim from the book → "${q.text.slice(0, 60)}…"`);
      assert(q.page >= startPage && q.page <= endPage, `${label} ${where}: page ${q.page} within ${startPage}-${endPage}`);
    };

    checkQuote(story.keyQuestion, "keyQuestion");
    checkQuote(story.wrapUp.bookSummary, "bookSummary");
    assert(story.startingPoint.trim().length > 0, `${label} has a starting point`);
    assert(story.wrapUp.chain.length > 0, `${label} has a wrap-up chain`);
    assert(story.steps.length >= 3, `${label} has at least 3 steps`);

    const ids = new Set<string>();
    story.steps.forEach((step, i) => {
      const where = `step ${i + 1} (${step.id})`;
      assert(!ids.has(step.id), `${label} ${where}: unique id`);
      ids.add(step.id);
      assert(step.title.trim().length > 0 && step.question.trim().length > 0, `${label} ${where}: has title and question`);
      assert(step.explanation.trim().length > 0, `${label} ${where}: has explanation`);
      assert(step.fromBook.length > 0 || !!step.bookTable, `${label} ${where}: is tied to the book text`);
      step.fromBook.forEach((q) => checkQuote(q, where));

      if (step.bookTable) {
        const t = step.bookTable;
        assert(t.page >= startPage && t.page <= endPage, `${label} ${where}: table page within range`);
        [...t.headers, ...t.rows.flat()].forEach((cell) =>
          assert(inBook(cell), `${label} ${where}: table cell is verbatim → "${cell.slice(0, 60)}"`)
        );
        assert(t.rows.every((r) => r.length === t.headers.length), `${label} ${where}: table rows match headers`);
      }

      (step.bookTerms || []).forEach((term) => {
        assert(inBook(term.ar), `${label} ${where}: term "${term.ar}" is from the book`);
        if (term.en) assert(inBook(term.en), `${label} ${where}: term "${term.en}" is from the book`);
      });

      const isLast = i === story.steps.length - 1;
      assert(isLast ? !step.bridge : !!step.bridge, `${label} ${where}: ${isLast ? "last step has no bridge" : "links to the next step"}`);
    });
  }
}

console.log(`\n📊 storylines: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) process.exit(1);
