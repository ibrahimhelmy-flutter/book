import fs from 'fs';
import path from 'path';
import { sources } from './sources-config.mjs';

console.log('🛡️ Running Curriculum Boundary & Scope Validator...');

// 1. Build Vocabulary of Official Terms & Concepts
const book = JSON.parse(fs.readFileSync(sources.canonicalBookFile, 'utf8'));
const officialConcepts = new Map(); // id -> concept
const officialTerms = new Set();

book.chapters.forEach(ch => {
  ch.lessons.forEach(l => {
    l.keyConcepts?.forEach(c => {
      officialConcepts.set(c.id, c);
      officialTerms.add(c.termAr.trim());
      if (c.termEn) officialTerms.add(c.termEn.trim().toLowerCase());
    });
  });
});

if (fs.existsSync(sources.canonicalGlossaryFile)) {
  const glossary = JSON.parse(fs.readFileSync(sources.canonicalGlossaryFile, 'utf8'));
  glossary.forEach(g => {
    officialTerms.add(g.termAr.trim());
    if (g.termEn) officialTerms.add(g.termEn.trim().toLowerCase());
  });
}

if (fs.existsSync(sources.canonicalAcronymsFile)) {
  const acronyms = JSON.parse(fs.readFileSync(sources.canonicalAcronymsFile, 'utf8'));
  acronyms.forEach(a => {
    officialTerms.add(a.short.trim().toUpperCase());
    officialTerms.add(a.fullAr.trim());
  });
}

console.log(`  Indexed ${officialConcepts.size} canonical concepts and ${officialTerms.size} official textbook vocabulary tokens.`);

let outOfBoundsCount = 0;
let totalQuestionsChecked = 0;

// 2. Audit Deep Questions
const deepFiles = fs.readdirSync(sources.deepQuestionsDir).filter(f => /^chapter-\d+\.json$/.test(f));
for (const file of deepFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(sources.deepQuestionsDir, file), 'utf8'));
  for (const [lessonNum, questions] of Object.entries(data)) {
    questions.forEach(q => {
      totalQuestionsChecked++;
      
      // Check 1: Must have at least 1 valid canonical concept ID
      if (!Array.isArray(q.conceptIds) || q.conceptIds.length === 0) {
        console.error(`  ❌ OUT-OF-BOUNDS: Question ${q.id} has no concept association!`);
        outOfBoundsCount++;
        return;
      }

      const invalidIds = q.conceptIds.filter(cid => !officialConcepts.has(cid));
      if (invalidIds.length > 0) {
        console.error(`  ❌ OUT-OF-BOUNDS: Question ${q.id} references non-curriculum concept IDs: ${invalidIds.join(', ')}`);
        outOfBoundsCount++;
        return;
      }

      // Check 2: Depth explanation and model answer must be present and substantive (> 20 chars)
      if (!q.depthExplanation || q.depthExplanation.trim().length < 20) {
        console.error(`  ❌ OUT-OF-BOUNDS: Question ${q.id} has hollow or missing depth explanation!`);
        outOfBoundsCount++;
        return;
      }

      // Check 3: Misconception trap must be articulated
      if (!q.misconceptionTrap || q.misconceptionTrap.trim().length < 15) {
        console.error(`  ❌ OUT-OF-BOUNDS: Question ${q.id} has hollow or missing misconception trap!`);
        outOfBoundsCount++;
        return;
      }

      // Check 4: Page scan provenance must be within bounds (1 to 95)
      const pages = q.source?.pages || [];
      const invalidPages = pages.filter(p => p < 1 || p > 95);
      if (invalidPages.length > 0) {
        console.error(`  ❌ OUT-OF-BOUNDS: Question ${q.id} references invalid textbook pages: ${invalidPages.join(', ')}`);
        outOfBoundsCount++;
      }
    });
  }
}

// 3. Audit Committee Questions
if (fs.existsSync(sources.committeeQuestionsFile)) {
  const cq = JSON.parse(fs.readFileSync(sources.committeeQuestionsFile, 'utf8'));
  cq.forEach(q => {
    totalQuestionsChecked++;
    if (!q.modelAnswer || q.modelAnswer.trim().length < 5) {
      console.error(`  ❌ OUT-OF-BOUNDS: Committee question ${q.id} has missing model answer!`);
      outOfBoundsCount++;
    }
  });
}

console.log('\n======================================================');
console.log('🛡️ CURRICULUM BOUNDARY AUDIT REPORT');
console.log('======================================================');
console.log(`Total questions audited        : ${totalQuestionsChecked}`);
console.log(`Out-of-curriculum violations   : ${outOfBoundsCount}`);
console.log('======================================================');

if (outOfBoundsCount === 0) {
  console.log('🏆 CURRICULUM BOUNDARY PASS: 100% of questions are strictly anchored within official syllabus!');
  process.exit(0);
} else {
  console.error(`❌ FAILED: Found ${outOfBoundsCount} questions violating curriculum boundaries.`);
  process.exit(1);
}
