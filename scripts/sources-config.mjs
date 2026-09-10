import path from 'path';

/**
 * Universal Source Configuration supporting multi-term scalability.
 * Term 1 is currently active, and Term 2 will follow the exact same schema.
 * 
 * @param {string} term - e.g. 'term-1', 'term-2'
 * @returns {object} Canonical paths for the specified term
 */
export function getSources(term = 'term-1') {
  const root = path.resolve('book-sources', term);
  const canonicalRoot = path.join(root, '05-canonical-data');
  const officialRoot = path.join(canonicalRoot, 'official');
  const authoredRoot = path.join(canonicalRoot, 'authored');

  return {
    term,
    root,
    pdf: path.join(root, '01-pdf-document'),
    pdfFile: path.join(root, '01-pdf-document', 'Programming-ArtificialIntelligence-Ar-EB-part1.pdf'),
    pages: path.join(root, '02-page-scans'),
    raw: path.join(root, '03-raw-extractions'),
    rawFullTextFile: path.join(root, '03-raw-extractions', 'Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json'),
    diagrams: path.join(root, '04-extracted-diagrams'),
    canonical: canonicalRoot,
    canonicalOfficial: officialRoot,
    canonicalAuthored: authoredRoot,
    canonicalBookFile: path.join(officialRoot, 'book.json'),
    canonicalGlossaryFile: path.join(officialRoot, 'glossary.json'),
    canonicalAcronymsFile: path.join(officialRoot, 'acronyms.json'),
    canonicalBaselineSpec: path.join(officialRoot, 'curriculum-baseline-spec.json'),
    officialLessonsDir: path.join(officialRoot, 'official-lessons'),
    deepQuestionsDir: path.join(authoredRoot, 'deep-questions'),
    committeeQuestionsFile: path.join(authoredRoot, 'committee-questions.json'),
    simulatorsFile: path.join(authoredRoot, 'simulators.json'),
    buildModules: path.join(root, '06-build-modules'),
    validation: path.join(root, '07-validation'),
    sourceManifestFile: path.join(root, '07-validation', 'source-manifest.json'),
    pageHashesFile: path.join(root, '07-validation', 'page-hashes.json'),
    canonicalHashesFile: path.join(root, '07-validation', 'canonical-hashes.json'),
    provenanceReportFile: path.join(root, '07-validation', 'provenance-report.json'),
  };
}

export const CURRENT_TERM = 'term-1';
export const CURRENT_SOURCES = getSources(CURRENT_TERM);
export const sources = CURRENT_SOURCES;
