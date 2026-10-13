import fs from 'fs';
import path from 'path';

/**
 * Catalog-driven source configuration.
 *
 * `book-sources/catalog.json` (hand-edited) lists grades → books → parts → companions.
 * Every part lives in `book-sources/<gradeId>/<bookSlug>/<partId>/` with the fixed layout
 * 01-pdf-document … 07-validation, plus `companions/<slug>/` for companion books.
 *
 * A part is addressed by its key `"<gradeId>/<bookSlug>/<partId>"`. The alias `'term-1'`
 * resolves to the legacy (first) part so older scripts keep working.
 */

export const BOOK_SOURCES_ROOT = path.resolve('book-sources');
export const CATALOG_FILE = path.join(BOOK_SOURCES_ROOT, 'catalog.json');

let catalogCache = null;
export function readCatalog() {
  if (!catalogCache) catalogCache = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
  return catalogCache;
}

/** Flattened list of parts with their grade/book context. */
export function listParts({ status } = {}) {
  const parts = [];
  for (const grade of readCatalog().grades) {
    for (const book of grade.books) {
      for (const part of book.parts) {
        const key = `${grade.id}/${book.slug}/${part.id}`;
        if (status && part.status !== status) continue;
        parts.push({ key, grade, book, part });
      }
    }
  }
  return parts;
}

export function resolvePartKey(keyOrAlias = 'term-1') {
  const all = listParts();
  const exact = all.find((p) => p.key === keyOrAlias);
  if (exact) return exact.key;
  if (keyOrAlias === 'term-1') {
    const legacy = all.find((p) => p.part.legacy);
    if (legacy) return legacy.key;
  }
  const byPartId = all.filter((p) => p.part.id === keyOrAlias);
  if (byPartId.length === 1) return byPartId[0].key;
  throw new Error(`Unknown part "${keyOrAlias}". Known parts: ${all.map((p) => p.key).join(', ')}`);
}

/**
 * Canonical paths for one part.
 * @param {string} keyOrAlias - "secondary-2/programming-ai/term-1", or a unique part id like "term-2", or the alias "term-1"
 */
export function getSources(keyOrAlias = 'term-1') {
  const key = resolvePartKey(keyOrAlias);
  const entry = listParts().find((p) => p.key === key);
  const { part } = entry;
  const root = path.join(BOOK_SOURCES_ROOT, ...key.split('/'));
  const canonicalRoot = path.join(root, '05-canonical-data');
  const officialRoot = path.join(canonicalRoot, 'official');
  const authoredRoot = path.join(canonicalRoot, 'authored');
  const pdfName = part.edition?.pdfFile || null;
  const rawName = part.edition?.rawFullTextFile || (pdfName ? pdfName.replace(/\.pdf$/i, '_full_text.json') : null);

  const companions = (part.companions || []).map((c) => {
    const companionRoot = path.join(root, 'companions', c.slug);
    return {
      ...c,
      root: companionRoot,
      pdfFile: c.pdfFile ? path.join(companionRoot, '01-pdf-document', c.pdfFile) : null,
      pages: path.join(companionRoot, '02-page-scans'),
      dataDir: path.join(root, c.dataDir),
    };
  });

  return {
    key,
    term: part.id,
    gradeId: entry.grade.id,
    bookSlug: entry.book.slug,
    partId: part.id,
    status: part.status,
    legacy: !!part.legacy,
    assetsBase: part.assetsBase,
    catalogEntry: entry,
    root,
    pdf: path.join(root, '01-pdf-document'),
    pdfFile: pdfName ? path.join(root, '01-pdf-document', pdfName) : null,
    pages: path.join(root, '02-page-scans'),
    raw: path.join(root, '03-raw-extractions'),
    rawFullTextFile: rawName ? path.join(root, '03-raw-extractions', rawName) : null,
    diagrams: path.join(root, '04-extracted-diagrams'),
    canonical: canonicalRoot,
    canonicalOfficial: officialRoot,
    canonicalAuthored: authoredRoot,
    canonicalBookFile: path.join(officialRoot, 'book.json'),
    canonicalGlossaryFile: path.join(officialRoot, 'glossary.json'),
    canonicalAcronymsFile: path.join(officialRoot, 'acronyms.json'),
    canonicalBaselineSpec: path.join(officialRoot, 'curriculum-baseline-spec.json'),
    officialLessonsDir: path.join(officialRoot, 'official-lessons'),
    officialAssessmentsDir: path.join(officialRoot, 'official-assessments'),
    deepQuestionsDir: path.join(authoredRoot, 'deep-questions'),
    committeeQuestionsFile: path.join(authoredRoot, 'committee-questions.json'),
    simulatorsFile: path.join(authoredRoot, 'simulators.json'),
    storylinesDir: path.join(authoredRoot, 'storylines'),
    companions,
    buildModules: path.join(root, '06-build-modules'),
    validation: path.join(root, '07-validation'),
    sourceManifestFile: path.join(root, '07-validation', 'source-manifest.json'),
    pageHashesFile: path.join(root, '07-validation', 'page-hashes.json'),
    canonicalHashesFile: path.join(root, '07-validation', 'canonical-hashes.json'),
    provenanceReportFile: path.join(root, '07-validation', 'provenance-report.json'),
  };
}

/**
 * Parts selected by the `--part <key|id>` CLI flag (repeatable), or every available part.
 * Scripts that audit content use this so coming-soon parts are skipped by default.
 */
export function partsFromArgs(argv = process.argv.slice(2), { status = 'available' } = {}) {
  const requested = [];
  argv.forEach((arg, i) => {
    if (arg === '--part' && argv[i + 1]) requested.push(argv[i + 1]);
    else if (arg.startsWith('--part=')) requested.push(arg.slice('--part='.length));
  });
  if (requested.length) return requested.map((k) => getSources(k));
  return listParts({ status }).map((p) => getSources(p.key));
}

/** Dynamically import every `06-build-modules/chapterN.mjs` of a part, ordered by N. */
export async function loadBuildModules(sources) {
  const { pathToFileURL } = await import('url');
  if (!fs.existsSync(sources.buildModules)) return [];
  const files = fs.readdirSync(sources.buildModules)
    .map((f) => ({ f, n: Number((f.match(/^chapter(\d+)\.mjs$/) || [])[1]) }))
    .filter((x) => x.n)
    .sort((a, b) => a.n - b.n);
  const modules = [];
  for (const { f, n } of files) {
    const mod = await import(pathToFileURL(path.join(sources.buildModules, f)).href);
    modules.push(mod[`chapter${n}`] ?? mod.default);
  }
  return modules;
}

export const CURRENT_TERM = 'term-1';
export const CURRENT_SOURCES = getSources(CURRENT_TERM);
export const sources = CURRENT_SOURCES;

/** The single `--part <key|id>` value for scripts that work on one part (default: the legacy term-1 part). */
export function partArg(argv = process.argv.slice(2), fallback = 'term-1') {
  const i = argv.indexOf('--part');
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  const eq = argv.find((a) => a.startsWith('--part='));
  return eq ? eq.slice('--part='.length) : fallback;
}

/** Exits with an actionable message when a part's source files are not in place yet. */
export function assertPartSources(sources, fields) {
  for (const field of fields) {
    const file = sources[field];
    if (file && fs.existsSync(file)) continue;
    console.error(`❌ ${sources.key}: missing ${field}${file ? ` (${file})` : ''}.`);
    console.error(`   Put the Ministry PDF in ${path.relative(process.cwd(), sources.pdf)} and set edition.pdfFile` +
      ` (and edition.rawFullTextFile once extracted) for this part in book-sources/catalog.json.`);
    process.exit(1);
  }
}

/** Generators that rewrite canonical data must not run on the legacy (hand-curated) part by accident. */
export function assertNotLegacy(sources, argv = process.argv.slice(2)) {
  if (sources.legacy && !argv.includes('--force-legacy')) {
    console.error(`❌ ${sources.key} is the legacy part; its canonical data is curated by hand. Pass --part <other> (or --force-legacy).`);
    process.exit(1);
  }
}
