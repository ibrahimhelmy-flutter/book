import fs from 'fs';
import path from 'path';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const canonicalBook = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/book.json', 'utf8'));
const fullTextbook = JSON.parse(fs.readFileSync('book-sources/term-1/03-raw-extractions/Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json', 'utf8'));

// Build rich curriculum facts base:
// Each fact has: { keywords: [], correctOptionPattern: RegExp, text: string, page: number, lesson: string }
const curriculumFacts = [];

// 1. Extract from keyConcepts & glossary
canonicalBook.chapters.forEach(ch => {
  ch.lessons.forEach(l => {
    (l.keyConcepts || []).forEach(kc => {
      curriculumFacts.push({
        type: 'concept',
        termAr: kc.termAr,
        termEn: kc.termEn || '',
        definition: kc.definition,
        page: kc.source?.primaryPage || parseInt(l.pageRange?.split('-')[0]) || 4,
        lessonNumber: l.number,
        chapterNumber: ch.number,
        fullText: `${kc.termAr} ${kc.termEn || ''} : ${kc.definition}`
      });
    });

    // Extract from sections
    (l.sections || []).forEach(sec => {
      if (sec.content) {
        curriculumFacts.push({
          type: 'section',
          title: sec.title,
          page: parseInt(l.pageRange?.split('-')[0]) || 4,
          lessonNumber: l.number,
          chapterNumber: ch.number,
          fullText: `${sec.title} : ${sec.content}`
        });
      }
      if (sec.table && sec.table.rows) {
        sec.table.rows.forEach(row => {
          curriculumFacts.push({
            type: 'table_row',
            title: sec.title,
            page: parseInt(l.pageRange?.split('-')[0]) || 4,
            lessonNumber: l.number,
            chapterNumber: ch.number,
            fullText: row.join(' — ')
          });
        });
      }
    });

    // Extract from summary
    if (Array.isArray(l.summary)) {
      l.summary.forEach(sumItem => {
        curriculumFacts.push({
          type: 'summary',
          title: l.title,
          page: parseInt(l.pageRange?.split('-')[0]) || 4,
          lessonNumber: l.number,
          chapterNumber: ch.number,
          fullText: sumItem
        });
      });
    }
  });
});

console.log(`Indexed ${curriculumFacts.length} curriculum facts from textbook.`);

// Function to score an option given question and lesson context
export function findBestOptionForQuestion(q, lessonDef) {
  const opts = q.options || [];
  if (opts.length !== 4) return { index: 0, option: opts[0] || '' };

  const qText = q.question;

  // Explicit rules for question archetypes based on verified curriculum facts
  const scores = [0, 0, 0, 0];

  opts.forEach((opt, idx) => {
    // 1. Exact match with curriculum facts in the same lesson
    curriculumFacts.forEach(fact => {
      let weight = fact.lessonNumber === lessonDef.number ? 3 : (fact.chapterNumber === lessonDef.chapterNumber ? 1.5 : 0.5);

      // Does the question match this fact?
      const qTokens = qText.match(/[\u0621-\u064A]{3,}/g) || [];
      const optTokens = opt.match(/[\u0621-\u064A]{3,}/g) || [];

      let qOverlap = 0;
      qTokens.forEach(t => {
        if (fact.fullText.includes(t)) qOverlap++;
      });

      if (qOverlap >= 2) {
        // Now check how well the option matches the fact definition/content
        let optOverlap = 0;
        optTokens.forEach(t => {
          if (fact.fullText.includes(t)) optOverlap++;
        });

        scores[idx] += (qOverlap * optOverlap) * weight;

        // If fact term matches question and option matches definition
        if (fact.termAr && qText.includes(fact.termAr)) {
          if (optTokens.some(t => fact.definition && fact.definition.includes(t))) {
            scores[idx] += 20 * weight;
          }
        }
        // If option is the fact term and question matches definition
        if (fact.termAr && (opt.includes(fact.termAr) || (fact.termEn && opt.toLowerCase().includes(fact.termEn.toLowerCase())))) {
          if (qTokens.some(t => fact.definition && fact.definition.includes(t))) {
            scores[idx] += 25 * weight;
          }
        }
      }
    });
  });

  // Find highest score
  let bestIdx = 0;
  let highest = -1;
  scores.forEach((s, idx) => {
    if (s > highest) {
      highest = s;
      bestIdx = idx;
    }
  });

  return {
    index: bestIdx,
    option: opts[bestIdx],
    confidence: highest,
    scores
  };
}
