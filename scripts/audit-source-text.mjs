/**
 * Verbatim check: every official text in a part's book.json must be found in the PDF text layer of
 * the lesson's own pages (03-raw-extractions). Texts are compared paragraph by paragraph (table cells
 * cell by cell) as overlapping 3-word windows after normalisation (NFKC, no diacritics/tatweel,
 * unified alef/yaa/taa marbuta, no punctuation or spaces), which tolerates line breaks, column
 * interleaving and extraction spacing artefacts but not paraphrasing: a run of ≥3 consecutive missing
 * windows (i.e. a changed or invented word) fails the item outright.
 *
 * A few PDFs have text-layer defects no normalisation can fix (a side-column line glued onto a
 * main-column line with no space, a formula or a Latin product-name run emitted in reversed order,
 * or a heading printed only inside a figure). Each such item must be listed, with the reason and the
 * printed page checked, in 04-verified-exceptions.json next to the part's rawFullTextFile — never
 * silently. See that file's shape below; it is the only way to pass an item without matching text.
 *
 *   node scripts/audit-source-text.mjs --part term-2 [--chapter 5] [--lesson 5-1] [--threshold 0.9] [--verbose]
 */
import fs from 'fs';
import path from 'path';
import { partsFromArgs, loadBuildModules } from './sources-config.mjs';

const argv = process.argv.slice(2);
const opt = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback);
const THRESHOLD = Number(opt('--threshold', 0.9));
const ONLY_LESSON = opt('--lesson', null);
const CHAPTER = opt('--chapter', null);
const VERBOSE = argv.includes('--verbose');

const normalize = (s) =>
  String(s)
    .normalize('NFKC')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]+/gu, '');

const words = (s) =>
  String(s)
    .normalize('NFKC')
    .split(/[\s ]+/)
    .map(normalize)
    .filter(Boolean);

const WINDOW = 3;

/**
 * Share of the text's 3-word windows found in the page text (each paragraph scored separately).
 * A changed or invented word breaks the 3 windows that contain it; a stray label glued into the
 * text layer between two words breaks only 2. So any run of ≥ 3 consecutive missing windows marks
 * the item as not verbatim (score forced to 0), regardless of the overall share.
 */
function coverage(text, haystack) {
  let hit = 0;
  let total = 0;
  let maxRun = 0;
  for (const part of String(text).split(/\n+/)) {
    const w = words(part);
    if (w.length === 0) continue;
    if (w.length < WINDOW) {
      total++;
      if (haystack.includes(w.join(''))) hit++;
      continue;
    }
    let run = 0;
    for (let i = 0; i + WINDOW <= w.length; i++) {
      total++;
      if (haystack.includes(w.slice(i, i + WINDOW).join(''))) {
        hit++;
        run = 0;
      } else {
        run++;
        maxRun = Math.max(maxRun, run);
      }
    }
  }
  const share = total ? hit / total : 1;
  return maxRun >= WINDOW ? Math.min(share, 0) : share;
}

/** Table cells wrap over several visual lines interleaved with neighbouring cells: score by words. */
function wordCoverage(text, haystack) {
  const w = words(text);
  return w.length ? w.filter((x) => haystack.includes(x)).length / w.length : 1;
}

function lessonTexts(lesson) {
  const items = [];
  const add = (label, text, kind = 'text') => text && items.push({ label, text, kind });
  lesson.learningObjectives?.forEach((t, i) => add(`objective ${i + 1}`, t));
  add('coreIdea', lesson.coreIdea);
  add('keyQuestion', lesson.keyQuestion);
  add('exploreInPairs', lesson.exploreInPairs);
  lesson.keyConcepts?.forEach((c) => add(`concept ${c.termAr}`, c.definition));
  lesson.sections?.forEach((s) => {
    add(`section ${s.id} title`, s.title.replace(/^\d+\.\s*/, ''));
    add(`section ${s.id}`, s.content);
    s.table?.headers?.forEach((h, i) => add(`section ${s.id} table header ${i + 1}`, h, 'cell'));
    s.table?.rows?.forEach((r, i) => r.forEach((cell, j) => add(`section ${s.id} table r${i + 1}c${j + 1}`, cell, 'cell')));
    add(`section ${s.id} caption`, s.image?.caption);
  });
  lesson.callouts?.forEach((c) => {
    add(`callout ${c.id}`, c.content);
    add(`callout ${c.id} question`, c.question);
  });
  lesson.solvedExample?.items?.forEach((it) => add(`solved ${it.id}`, it.question));
  lesson.questions?.forEach((q) => {
    add(`question ${q.id}`, q.questionText);
    q.options?.forEach((o, i) => add(`question ${q.id} option ${i + 1}`, o.text));
  });
  add('engineerChallenge', lesson.engineerChallenge?.scenario);
  lesson.engineerChallenge?.steps?.forEach((s) => add(`engineer step ${s.number}`, s.description));
  add('engineer hint', lesson.engineerChallenge?.hint);
  add('appliedTask', [lesson.appliedTask?.scenario, lesson.appliedTask?.prompt].filter(Boolean).join(' '));
  add('mainQuestionAnswer', lesson.mainQuestionAnswer);
  lesson.summary?.forEach((t, i) => add(`summary ${i + 1}`, t));
  add('reflect', lesson.challengeYourself?.reflect);
  add('challenge', lesson.challengeYourself?.challenge);
  return items;
}

/**
 * Exceptions file, next to the part's raw text: an array of
 *   { lesson: "7-3", label: "section sec-7-3-3", page: 70, reason: "..." }
 * `label` must match an item's label exactly (printed on failure, so copy it from there).
 * Loaded per part; missing file = no exceptions.
 */
function loadExceptions(sources) {
  const file = path.join(path.dirname(sources.rawFullTextFile), '04-verified-exceptions.json');
  if (!fs.existsSync(file)) return new Map();
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  const map = new Map();
  for (const e of list) {
    if (!e.lesson || !e.label || !e.page || !e.reason) throw new Error(`${file}: every exception needs lesson, label, page and reason`);
    map.set(`${e.lesson}\u0000${e.label}`, e);
  }
  return map;
}

let failures = 0;
for (const sources of partsFromArgs()) {
  if (sources.legacy) {
    console.log(`⏭️  ${sources.key}: legacy part (its raw text layer predates logical-order extraction)`);
    continue;
  }
  if (!fs.existsSync(sources.rawFullTextFile) || (!CHAPTER && !fs.existsSync(sources.canonicalBookFile))) {
    console.log(`⏭️  ${sources.key}: no book.json or raw text yet`);
    continue;
  }
  const offset = sources.catalogEntry.part.edition?.pageOffset ?? 0;
  const raw = JSON.parse(fs.readFileSync(sources.rawFullTextFile, 'utf8'));
  const pageText = new Map(raw.map((p) => [p.page, p.text]));
  // --chapter N checks that chapter's build module directly (no book.json needed).
  const book = CHAPTER
    ? { chapters: (await loadBuildModules(sources)).filter((c) => c.number === Number(CHAPTER)) }
    : JSON.parse(fs.readFileSync(sources.canonicalBookFile, 'utf8'));
  const exceptions = loadExceptions(sources);
  const usedExceptions = new Set();

  console.log(`🔎 ${sources.key}: verbatim check against the PDF text layer (threshold ${THRESHOLD})`);
  for (const ch of book.chapters) {
    for (const lesson of ch.lessons) {
      if (ONLY_LESSON && lesson.number !== ONLY_LESSON) continue;
      const [a, b] = lesson.pageRange.split('-').map((x) => parseInt(x.trim(), 10));
      let hay = '';
      for (let p = a; p <= (b || a); p++) hay += normalize(pageText.get(p + offset) || '');
      const results = lessonTexts(lesson).map((it) => {
        const score = it.kind === 'cell' ? Math.max(coverage(it.text, hay), wordCoverage(it.text, hay)) : coverage(it.text, hay);
        if (score >= THRESHOLD) return { ...it, score, exempt: false };
        const key = `${lesson.number}\u0000${it.label}`;
        const exception = exceptions.get(key);
        if (exception) usedExceptions.add(key);
        return { ...it, score, exempt: !!exception, exception };
      });
      const bad = results.filter((r) => r.score < THRESHOLD && !r.exempt);
      const exempted = results.filter((r) => r.exempt);
      failures += bad.length;
      const mean = results.reduce((n, r) => n + r.score, 0) / (results.length || 1);
      const verified = results.length - bad.length - exempted.length;
      const status = bad.length ? '❌' : exempted.length ? '✅ (with verified exceptions)' : '✅';
      console.log(
        `  ${status} ${lesson.number} ${lesson.title}: ${verified}/${results.length} verbatim` +
          `${exempted.length ? `, ${exempted.length} verified by page image` : ''} (mean ${(mean * 100).toFixed(1)}%)`
      );
      for (const r of VERBOSE ? results.filter((r) => !r.exempt) : bad) {
        console.log(`      ${r.score < THRESHOLD ? '⚠️' : '·'} ${(r.score * 100).toFixed(0)}% ${r.label}: ${r.text.slice(0, 90).replace(/\n/g, ' ')}`);
      }
      for (const r of exempted) {
        console.log(`      📷 p.${r.exception.page} ${r.label} — ${r.exception.reason}`);
      }
    }
  }

  for (const [key, e] of exceptions) {
    if (!usedExceptions.has(key)) console.log(`  ⚠️  ${sources.key}: unused exception for "${e.label}" (lesson ${e.lesson}) — remove it or fix the label`);
  }
}

if (failures) {
  console.error(`\n❌ ${failures} item(s) not found verbatim in the book's text layer.`);
  process.exit(1);
}
console.log('\n✅ All official texts are verbatim from the book pages (unlisted exceptions: none).');
