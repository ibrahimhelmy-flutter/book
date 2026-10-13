/**
 * Builds a part's canonical official/book.json (+ glossary.json, acronyms.json) from its verbatim
 * build modules (06-build-modules/chapterN.mjs, book-meta.json, acronyms-chapterN.json).
 *
 * Build modules carry a printed `page` on sections, key concepts, callouts, solved-example items and
 * questions. This script turns them into `source` provenance records (page images = printed page +
 * edition.pageOffset), assigns concept ids, marks everything `contentOrigin: "official"`, and fails
 * when a page is missing or outside the lesson's page range. Glossary entries come only from the
 * book's own key-term definitions; acronyms only from acronyms-chapterN.json (expansions printed in the book).
 *
 *   node scripts/generate-book-json.mjs --part term-2                 # write book.json, glossary.json, acronyms.json
 *   node scripts/generate-book-json.mjs --part term-2 --chapter 5     # validate one chapter only (dry run)
 */
import fs from 'fs';
import path from 'path';
import { getSources, partArg, loadBuildModules, assertNotLegacy } from './sources-config.mjs';

const sources = getSources(partArg());
assertNotLegacy(sources);
const part = sources.catalogEntry.part;
const TERM_NUMBER = Number(part.id.replace(/\D/g, '')) || 1;
const PAGE_OFFSET = part.edition?.pageOffset ?? 0;

const errors = [];
const fail = (msg) => errors.push(msg);

const metaFile = path.join(sources.buildModules, 'book-meta.json');
if (!fs.existsSync(metaFile)) {
  console.error(`❌ ${sources.key}: missing ${path.relative(process.cwd(), metaFile)}`);
  process.exit(1);
}
const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
const chapterFilter = process.argv.includes('--chapter') ? Number(process.argv[process.argv.indexOf('--chapter') + 1]) : null;
const dryRun = process.argv.includes('--dry-run') || chapterFilter !== null;
const chapters = structuredClone(await loadBuildModules(sources)).filter((c) => chapterFilter === null || c.number === chapterFilter);
if (chapters.length === 0) {
  console.error(`❌ ${sources.key}: no 06-build-modules/chapterN.mjs found`);
  process.exit(1);
}

const pageFile = (p) => `page_${String(p + PAGE_OFFSET).padStart(2, '0')}.png`;
const source = (pages, sourceType) => ({
  term: TERM_NUMBER,
  pages,
  primaryPage: pages[0],
  sourceType,
  pageFiles: pages.map(pageFile),
});

function parseRange(range) {
  const [a, b] = String(range).split('-').map((s) => parseInt(s.trim(), 10));
  return [a, b || a];
}

/** Replaces item.page with item.source after checking it lies within the lesson. */
function withPageSource(item, lesson, [start, end], sourceType, label) {
  const page = item.page;
  if (typeof page !== 'number') {
    fail(`${lesson.id}: ${label} has no printed page`);
    return item;
  }
  if (page < start || page > end) fail(`${lesson.id}: ${label} page ${page} is outside ${start}-${end}`);
  const { page: _drop, ...rest } = item;
  return { ...rest, source: source([page], sourceType) };
}

const glossary = [];
for (const ch of chapters) {
  ch.contentOrigin = 'official';
  const glossaryCategory = ch.glossaryCategory || 'General';
  delete ch.glossaryCategory;

  for (const lesson of ch.lessons) {
    const range = parseRange(lesson.pageRange);
    const pages = [];
    for (let p = range[0]; p <= range[1]; p++) pages.push(p);
    lesson.contentOrigin = 'official';
    lesson.source = source(pages, 'official-page-scan');

    lesson.keyConcepts = (lesson.keyConcepts || []).map((c, i) => {
      const id = `concept-${lesson.number}-${String(i + 1).padStart(2, '0')}`;
      const out = withPageSource({ id, ...c, contentOrigin: 'official' }, lesson, range, 'official-margin-definition', `concept "${c.termAr}"`);
      glossary.push({
        id: `g-${lesson.number}-${String(i + 1).padStart(2, '0')}`,
        termAr: c.termAr,
        termEn: c.termEn || '',
        definitionAr: c.definition,
        definitionEn: '',
        chapterId: ch.id,
        lessonNumber: lesson.number,
        category: c.glossaryCategory || glossaryCategory,
        source: out.source,
        contentOrigin: 'official',
      });
      delete out.glossaryCategory;
      return out;
    });

    lesson.sections = (lesson.sections || []).map((s) => {
      const out = withPageSource(s, lesson, range, 'official-textbook-section', `section ${s.id}`);
      if (out.image?.src && !out.image.src.startsWith(part.assetsBase + '/')) {
        fail(`${lesson.id}: section ${s.id} image must live under ${part.assetsBase}/`);
      }
      if (out.image?.src) {
        const file = path.join(sources.diagrams, path.basename(out.image.src));
        if (!fs.existsSync(file)) fail(`${lesson.id}: image ${out.image.src} missing in 04-extracted-diagrams (run crop-figures)`);
      }
      return out;
    });
    lesson.callouts = (lesson.callouts || []).map((c) => withPageSource(c, lesson, range, 'official-textbook-callout', `callout ${c.id}`));
    lesson.questions = (lesson.questions || []).map((q) => ({
      contentOrigin: 'official',
      ...withPageSource(q, lesson, range, 'official-textbook-question', `question ${q.id}`),
    }));
    if (lesson.solvedExample?.items) {
      lesson.solvedExample.items = lesson.solvedExample.items.map((it) =>
        withPageSource(it, lesson, range, 'official-solved-example', `solved example ${it.id}`)
      );
    }

    for (const field of ['learningObjectives', 'coreIdea', 'keyQuestion', 'sections', 'mainQuestionAnswer', 'summary']) {
      const v = lesson[field];
      if (!v || (Array.isArray(v) && v.length === 0)) fail(`${lesson.id}: missing ${field}`);
    }
    const sectionIds = new Set(lesson.sections.map((s) => s.id));
    for (const c of lesson.callouts) if (c.sectionId && !sectionIds.has(c.sectionId)) fail(`${lesson.id}: callout ${c.id} → unknown section ${c.sectionId}`);
  }
}

// Acronyms: only entries whose expansion is printed in the book (hand-collected per chapter, with page).
const acronyms = [];
for (const f of fs.readdirSync(sources.buildModules).filter((x) => /^acronyms-chapter\d+\.json$/.test(x)).sort()) {
  for (const a of JSON.parse(fs.readFileSync(path.join(sources.buildModules, f), 'utf8'))) {
    if (!a.short || !a.fullAr || typeof a.page !== 'number') fail(`${f}: acronym ${a.short} needs short, fullAr and page`);
    const { page, ...rest } = a;
    acronyms.push({ ...rest, source: source([page], 'official-textbook-acronym'), contentOrigin: 'official' });
  }
}
const seenShort = new Set();
for (const a of acronyms) {
  if (seenShort.has(a.short.toUpperCase())) fail(`duplicate acronym ${a.short}`);
  seenShort.add(a.short.toUpperCase());
}

if (errors.length) {
  console.error(`❌ ${sources.key}: ${errors.length} provenance/structure error(s):`);
  errors.forEach((e) => console.error(`   - ${e}`));
  process.exit(1);
}

const lessonsCount = chapters.reduce((n, c) => n + c.lessons.length, 0);
if (dryRun) {
  console.log(`✅ ${sources.key}${chapterFilter !== null ? ` chapter ${chapterFilter}` : ''}: valid (${lessonsCount} lessons, ${glossary.length} terms, ${acronyms.length} acronyms) — dry run, nothing written`);
  process.exit(0);
}
const book = { meta: { ...meta, chaptersCount: chapters.length, lessonsCount }, chapters };
fs.mkdirSync(sources.canonicalOfficial, { recursive: true });
fs.writeFileSync(sources.canonicalBookFile, JSON.stringify(book, null, 2) + '\n');
fs.writeFileSync(sources.canonicalGlossaryFile, JSON.stringify(glossary, null, 2) + '\n');
fs.writeFileSync(sources.canonicalAcronymsFile, JSON.stringify(acronyms, null, 2) + '\n');
console.log(
  `✅ ${sources.key}: book.json (${chapters.length} chapters, ${lessonsCount} lessons), ` +
    `glossary.json (${glossary.length} terms), acronyms.json (${acronyms.length})`
);
