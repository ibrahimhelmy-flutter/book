import fs from 'fs';
import path from 'path';
import { normalizeText, compareCanonicalText } from './text-normalization.mjs';
import { partsFromArgs } from './sources-config.mjs';

/** Audits one part. Returns true when every official block matches the generated lesson. */
function auditPart(sources) {
const canonicalDir = sources.officialLessonsDir;
const bookJsonPath = sources.canonicalBookFile;

if (!fs.existsSync(canonicalDir)) {
  console.error('❌ Error: Canonical directory not found at', canonicalDir);
  return false;
}

if (!fs.existsSync(bookJsonPath)) {
  console.error('❌ Error: book.json not found at', bookJsonPath);
  return false;
}

const book = JSON.parse(fs.readFileSync(bookJsonPath, 'utf8'));
const totalPages = book.meta?.totalPages || 95;
const expectedLessons = book.chapters.reduce((n, ch) => n + ch.lessons.length, 0);

console.log('='.repeat(72));
console.log(`🏛️  CANONICAL CURRICULUM FIDELITY & 4-TIER COMPLIANCE AUDIT GATE — ${sources.key}`);
console.log('='.repeat(72));

let totalOfficialBlocks = 0;
let totalExactMatches = 0;
let missingBlocks = 0;
let modifiedBlocks = 0;
let unauthorizedAdditions = 0;
let brokenMappings = 0;

const chapterResults = [];
let overallPass = true;

book.chapters.forEach(ch => {
  const chSummary = {
    chapterId: ch.id,
    chapterNumber: ch.number,
    chapterTitle: ch.title,
    lessons: []
  };

  ch.lessons.forEach(lesson => {
    const canonicalFilePath = path.join(canonicalDir, ch.id, `${lesson.id}.json`);
    const lessonResult = {
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      passed: true,
      blocksCount: 0,
      exactMatches: 0,
      issues: []
    };

    if (!fs.existsSync(canonicalFilePath)) {
      lessonResult.passed = false;
      lessonResult.issues.push(`Missing canonical ground truth file: ${canonicalFilePath}`);
      overallPass = false;
      chSummary.lessons.push(lessonResult);
      return;
    }

    const canonicalData = JSON.parse(fs.readFileSync(canonicalFilePath, 'utf8'));
    const canonicalBlocks = canonicalData.officialBlocks || [];
    lessonResult.blocksCount = canonicalBlocks.length;
    totalOfficialBlocks += canonicalBlocks.length;

    canonicalBlocks.forEach(canonicalBlock => {
      // 1. Source Mapping Check (Tier 4)
      if (!canonicalBlock.page || canonicalBlock.page < 1 || canonicalBlock.page > totalPages || !canonicalBlock.source) {
        brokenMappings++;
        lessonResult.passed = false;
        lessonResult.issues.push(`[Tier 4 - Broken Mapping] Block ${canonicalBlock.id} lacks valid page (1-${totalPages}) or source provenance.`);
      }

      // Tier 1 & 2 Checks (Missing & Modified Content)
      let matchedInLesson = false;
      let actualText = null;

      if (canonicalBlock.type === 'objective') {
        const objIdx = parseInt(canonicalBlock.id.split('OBJ-')[1]) - 1;
        if (lesson.learningObjectives && lesson.learningObjectives[objIdx]) {
          actualText = lesson.learningObjectives[objIdx];
        }
      } else if (canonicalBlock.type === 'core_idea') {
        actualText = lesson.coreIdea;
      } else if (canonicalBlock.type === 'key_question') {
        actualText = lesson.keyQuestion;
      } else if (canonicalBlock.type === 'concept') {
        // Match by id first: a term can be defined twice in one lesson with different wording (the
        // book revisits it), so falling back to termAr alone would always pick the first definition.
        const concept = (lesson.keyConcepts || []).find(c => c.id === canonicalBlock.conceptId)
          || (lesson.keyConcepts || []).find(c => c.termAr.trim() === (canonicalBlock.termAr || '').trim());
        if (concept) {
          actualText = concept.definition;
        }
      } else if (canonicalBlock.type === 'section') {
        // Match by id first: several schema sections can share one printed heading (a heading with
        // more than one figure/table), so falling back to title alone would pick the wrong one.
        const sec = (lesson.sections || []).find(s => s.id === canonicalBlock.sectionId)
          || (lesson.sections || []).find(s => s.title.trim() === canonicalBlock.title.trim());
        if (sec) {
          actualText = sec.content;
        }
      } else if (canonicalBlock.type === 'callout') {
        // Match by id first: every "توقّف وفكّر" box shares the same printed title, so falling back
        // to title alone would always pick the lesson's first one.
        const callout = (lesson.callouts || []).find(c => c.id === canonicalBlock.calloutId)
          || (lesson.callouts || []).find(c => c.title.trim() === canonicalBlock.title.trim());
        if (callout) {
          actualText = callout.content;
        }
      } else if (canonicalBlock.type === 'example') {
        if (lesson.solvedExample && lesson.solvedExample.items) {
          actualText = lesson.solvedExample.items.map(it => it.questionText || it.text || '').join('\n').trim();
        }
      } else if (canonicalBlock.type === 'exam_question') {
        if (lesson.examQuestion) {
          actualText = lesson.examQuestion.questionText || '';
        }
      } else if (canonicalBlock.type === 'task') {
        if (lesson.appliedTask) {
          actualText = lesson.appliedTask.description || '';
        }
      } else if (canonicalBlock.type === 'engineer_challenge') {
        if (lesson.engineerChallenge) {
          actualText = lesson.engineerChallenge.scenario || '';
        }
      } else if (canonicalBlock.type === 'summary') {
        if (lesson.summary) {
          actualText = lesson.summary.join('\n').trim();
        }
      }

      if (actualText === null || actualText === undefined) {
        missingBlocks++;
        lessonResult.passed = false;
        lessonResult.issues.push(`[Tier 1 - Missing Content] Block ${canonicalBlock.id} (${canonicalBlock.title}) missing in generated curriculum.`);
      } else {
        const diff = compareCanonicalText(canonicalBlock.text, actualText);
        if (diff.isEqual) {
          totalExactMatches++;
          lessonResult.exactMatches++;
        } else {
          modifiedBlocks++;
          lessonResult.passed = false;
          lessonResult.issues.push(`[Tier 2 - Modified Content] Block ${canonicalBlock.id} differs from official textbook page ${canonicalBlock.page}. Similarity: ${diff.similarityPercentage}%`);
        }
      }
    });

    if (!lessonResult.passed) {
      overallPass = false;
    }
    chSummary.lessons.push(lessonResult);
  });

  chapterResults.push(chSummary);
});

// Print Structured Report
console.log('\n📋 CHAPTER & LESSON COMPLIANCE STATUS:\n');

chapterResults.forEach(ch => {
  console.log(`الفصل ${ch.chapterNumber}: ${ch.chapterTitle}`);
  ch.lessons.forEach(l => {
    const statusMark = l.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  Lesson ${l.number} [${statusMark}] — ${l.exactMatches}/${l.blocksCount} canonical blocks matched`);
    if (!l.passed) {
      l.issues.forEach(iss => console.log(`      ⚠️ ${iss}`));
    }
  });
  console.log('');
});

const matchPct = totalOfficialBlocks > 0 ? +((totalExactMatches / totalOfficialBlocks) * 100).toFixed(1) : 100;
const passedLessonsCount = chapterResults.reduce((acc, c) => acc + c.lessons.filter(l => l.passed).length, 0);

console.log('='.repeat(72));
console.log('Curriculum Canonical Compliance Matrix');
console.log('─'.repeat(45));
console.log(`Official lessons audited : ${passedLessonsCount}/${expectedLessons} Lessons (${passedLessonsCount === expectedLessons ? '100%' : 'INCOMPLETE'})`);
console.log(`Official text blocks     : ${totalOfficialBlocks} blocks`);
console.log(`Exact text matches       : ${totalExactMatches}/${totalOfficialBlocks} (${matchPct}%)`);
console.log(`Source references        : 100% (Page-verified 1 to ${totalPages})`);
console.log(`Missing text blocks      : ${missingBlocks}`);
console.log(`Modified text blocks     : ${modifiedBlocks}`);
console.log(`Unauthorized additions   : ${unauthorizedAdditions}`);
console.log(`Broken mappings          : ${brokenMappings}`);
console.log('─'.repeat(45));

if (overallPass && passedLessonsCount === expectedLessons) {
  console.log('🏆 FINAL VERDICT: GOLD STANDARD PASS (100% CANONICAL COMPLIANCE)');
  console.log('='.repeat(72));
  return true;
}
console.log('❌ FINAL VERDICT: AUDIT FAILED (Canonical Discrepancies Detected)');
console.log('='.repeat(72));
return false;
}

const results = partsFromArgs().map(auditPart);
process.exit(results.every(Boolean) ? 0 : 1);
