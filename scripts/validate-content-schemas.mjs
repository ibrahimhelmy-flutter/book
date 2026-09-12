import fs from 'fs';
import path from 'path';
import { sources } from './sources-config.mjs';

console.log('📋 Running Content Schemas & Referential Integrity Validation Gate...');

let totalErrors = 0;
function logError(msg) {
  console.error(`  ❌ ERROR: ${msg}`);
  totalErrors++;
}

// 1. Load Official Book & Concepts
if (!fs.existsSync(sources.canonicalBookFile)) {
  logError(`Official book.json missing at: ${sources.canonicalBookFile}`);
  process.exit(1);
}
const book = JSON.parse(fs.readFileSync(sources.canonicalBookFile, 'utf8'));

const validLessonIds = new Set();
const validConceptIds = new Set();
const lessonConceptMap = new Map(); // lessonId -> Set of conceptIds

if (!Array.isArray(book.chapters) || book.chapters.length === 0) {
  logError(`Official book has no chapters!`);
} else {
  book.chapters.forEach(ch => {
    if (!ch.id || !ch.title || typeof ch.number !== 'number') {
      logError(`Invalid chapter structure: ${ch.id}`);
    }
    if (!Array.isArray(ch.lessons) || ch.lessons.length === 0) {
      logError(`Chapter ${ch.id} has no lessons!`);
    } else {
      ch.lessons.forEach(l => {
        if (!l.id || !l.number || !l.title) {
          logError(`Invalid lesson structure in chapter ${ch.id}: ${l.id}`);
        }
        validLessonIds.add(l.id);
        const cSet = new Set();

        if (Array.isArray(l.keyConcepts)) {
          l.keyConcepts.forEach((c, cIdx) => {
            if (!c.id) logError(`Concept #${cIdx + 1} in lesson ${l.id} has no id!`);
            if (!c.termAr) logError(`Concept ${c.id} in lesson ${l.id} has no termAr!`);
            if (!c.definition) logError(`Concept ${c.id} in lesson ${l.id} has no definition!`);
            if (!c.source || !Array.isArray(c.source.pages) || c.source.pages.length === 0) {
              logError(`Concept ${c.id} in lesson ${l.id} has missing or empty source.pages!`);
            }
            if (c.id) {
              validConceptIds.add(c.id);
              cSet.add(c.id);
            }
          });
        }
        lessonConceptMap.set(l.id, cSet);
      });
    }
  });
}
console.log(`  ✅ Official Curriculum Schema: verified ${book.chapters.length} chapters, ${validLessonIds.size} lessons, ${validConceptIds.size} concepts.`);

// 2. Validate Glossary Schema
if (fs.existsSync(sources.canonicalGlossaryFile)) {
  const glossary = JSON.parse(fs.readFileSync(sources.canonicalGlossaryFile, 'utf8'));
  glossary.forEach((g, idx) => {
    if (!g.id || !g.termAr || !g.definitionAr) {
      logError(`Invalid glossary term at index ${idx}`);
    }
    if (g.contentOrigin !== 'official') {
      logError(`Glossary term ${g.id} has invalid contentOrigin: ${g.contentOrigin}`);
    }
  });
  console.log(`  ✅ Official Glossary Schema: verified ${glossary.length} terms.`);
}

// 3. Validate Acronyms Schema
if (fs.existsSync(sources.canonicalAcronymsFile)) {
  const acronyms = JSON.parse(fs.readFileSync(sources.canonicalAcronymsFile, 'utf8'));
  acronyms.forEach((a, idx) => {
    if (!a.short || !a.fullAr || !a.fullEn) {
      logError(`Invalid acronym at index ${idx}`);
    }
    if (a.contentOrigin !== 'official') {
      logError(`Acronym ${a.short} has invalid contentOrigin: ${a.contentOrigin}`);
    }
  });
  console.log(`  ✅ Official Acronyms Schema: verified ${acronyms.length} acronyms.`);
}

// 4. Validate Authored Deep Questions Schema (Modular lesson-based structure)
const chapterDirs = fs.existsSync(sources.deepQuestionsDir)
  ? fs.readdirSync(sources.deepQuestionsDir)
      .filter(f => /^chapter-\d+$/.test(f) && fs.statSync(path.join(sources.deepQuestionsDir, f)).isDirectory())
      .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))
  : [];

let totalDeepQuestions = 0;
let totalLessonFiles = 0;

if (chapterDirs.length > 0) {
  for (const chDir of chapterDirs) {
    const chPath = path.join(sources.deepQuestionsDir, chDir);
    const lessonFiles = fs.readdirSync(chPath).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

    for (const lFile of lessonFiles) {
      totalLessonFiles++;
      const match = lFile.match(/^lesson-(\d+-\d+)\.json$/);
      const lessonNum = match[1];
      const lessonId = `lesson-${lessonNum}`;
      if (!validLessonIds.has(lessonId)) {
        logError(`Deep question file '${lFile}' references unknown lesson '${lessonId}'`);
      }

      const availableLessonConcepts = lessonConceptMap.get(lessonId) || new Set();
      const filePath = path.join(chPath, lFile);
      const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      questions.forEach((q, qIdx) => {
        totalDeepQuestions++;
        if (!q.id || !q.title || !q.question) {
          logError(`Deep question #${qIdx + 1} in lesson ${lessonNum} has missing mandatory fields.`);
        }
        if (q.contentOrigin !== 'authored') {
          logError(`Deep question ${q.id} must have contentOrigin: 'authored', found: '${q.contentOrigin}'`);
        }
        if (!['easy', 'medium', 'hard', 'very-hard', 'expert'].includes(q.difficulty)) {
          logError(`Deep question ${q.id} has invalid difficulty: '${q.difficulty}'`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          logError(`Deep question ${q.id} must have exactly 4 options!`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          logError(`Deep question ${q.id} has invalid correctAnswer index: ${q.correctAnswer}`);
        }
        if (!Array.isArray(q.conceptIds)) {
          logError(`Deep question ${q.id} has invalid conceptIds format!`);
        } else {
          q.conceptIds.forEach(cid => {
            if (!validConceptIds.has(cid)) {
              logError(`Deep question ${q.id} references non-existent conceptId: '${cid}'`);
            } else if (!availableLessonConcepts.has(cid)) {
              logError(`Deep question ${q.id} in lesson ${lessonId} references concept '${cid}' from a DIFFERENT lesson!`);
            }
          });
        }
        if (!q.source || !Array.isArray(q.source.pages) || q.source.pages.length === 0) {
          logError(`Deep question ${q.id} has missing or invalid source provenance.`);
        }
      });
    }
  }
  console.log(`  ✅ Authored Deep Questions Schema: verified ${totalDeepQuestions} questions across ${totalLessonFiles} modular lesson files in ${chapterDirs.length} chapters.`);
} else {
  const deepFiles = fs.readdirSync(sources.deepQuestionsDir).filter(f => /^chapter-\d+\.json$/.test(f));
  for (const file of deepFiles) {
    const filePath = path.join(sources.deepQuestionsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    for (const [lessonNum, questions] of Object.entries(data)) {
      const lessonId = `lesson-${lessonNum}`;
      if (!validLessonIds.has(lessonId)) {
        logError(`Deep question group '${lessonNum}' references unknown lesson '${lessonId}'`);
      }

      const availableLessonConcepts = lessonConceptMap.get(lessonId) || new Set();

      questions.forEach((q, qIdx) => {
        totalDeepQuestions++;
        if (!q.id || !q.title || !q.question) {
          logError(`Deep question #${qIdx + 1} in lesson ${lessonNum} has missing mandatory fields.`);
        }
        if (q.contentOrigin !== 'authored') {
          logError(`Deep question ${q.id} must have contentOrigin: 'authored', found: '${q.contentOrigin}'`);
        }
        if (!['easy', 'medium', 'hard', 'very-hard', 'expert'].includes(q.difficulty)) {
          logError(`Deep question ${q.id} has invalid difficulty: '${q.difficulty}'`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          logError(`Deep question ${q.id} must have exactly 4 options!`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          logError(`Deep question ${q.id} has invalid correctAnswer index: ${q.correctAnswer}`);
        }
        if (!Array.isArray(q.conceptIds)) {
          logError(`Deep question ${q.id} has invalid conceptIds format!`);
        } else {
          q.conceptIds.forEach(cid => {
            if (!validConceptIds.has(cid)) {
              logError(`Deep question ${q.id} references non-existent conceptId: '${cid}'`);
            } else if (!availableLessonConcepts.has(cid)) {
              logError(`Deep question ${q.id} in lesson ${lessonId} references concept '${cid}' from a DIFFERENT lesson!`);
            }
          });
        }
        if (!q.source || !Array.isArray(q.source.pages) || q.source.pages.length === 0) {
          logError(`Deep question ${q.id} has missing or invalid source provenance.`);
        }
      });
    }
  }
  console.log(`  ✅ Authored Deep Questions Schema: verified ${totalDeepQuestions} questions across ${deepFiles.length} chapter files.`);
}

// 5. Validate Authored Committee Questions Schema
if (fs.existsSync(sources.committeeQuestionsFile)) {
  const cq = JSON.parse(fs.readFileSync(sources.committeeQuestionsFile, 'utf8'));
  cq.forEach((q, idx) => {
    if (!q.id || !q.question || !q.modelAnswer) {
      logError(`Committee question #${idx + 1} has missing core fields.`);
    }
    if (q.contentOrigin !== 'authored') {
      logError(`Committee question ${q.id} must have contentOrigin: 'authored'`);
    }
    if (q.questionOrigin !== 'specialized-committee-style') {
      logError(`Committee question ${q.id} must have questionOrigin: 'specialized-committee-style'`);
    }
    if (q.lessonId && !validLessonIds.has(q.lessonId)) {
      logError(`Committee question ${q.id} references unknown lessonId: '${q.lessonId}'`);
    }
    if (Array.isArray(q.conceptIds)) {
      q.conceptIds.forEach(cid => {
        if (!validConceptIds.has(cid)) {
          logError(`Committee question ${q.id} references non-existent conceptId: '${cid}'`);
        }
      });
    }
  });
  console.log(`  ✅ Authored Committee Questions Schema: verified ${cq.length} questions.`);
}

// 6. Validate Authored Simulators Schema
if (fs.existsSync(sources.simulatorsFile)) {
  const sims = JSON.parse(fs.readFileSync(sources.simulatorsFile, 'utf8'));
  sims.forEach((s, idx) => {
    if (!s.id || !s.title || !s.description) {
      logError(`Simulator #${idx + 1} has missing core fields.`);
    }
    if (s.contentOrigin !== 'authored') {
      logError(`Simulator ${s.id} must have contentOrigin: 'authored'`);
    }
    if (!s.source || s.source.sourceType !== 'curriculum-derived') {
      logError(`Simulator ${s.id} must have sourceType: 'curriculum-derived'`);
    }
  });
  console.log(`  ✅ Authored Simulators Schema: verified ${sims.length} simulators.`);
}

console.log('======================================================');
if (totalErrors === 0) {
  console.log('🏆 ALL CONTENT SCHEMAS & REFERENTIAL INTEGRITY VERIFIED (0 ERRORS)!');
  process.exit(0);
} else {
  console.error(`❌ FAILED: Found ${totalErrors} schema / referential integrity errors.`);
  process.exit(1);
}
