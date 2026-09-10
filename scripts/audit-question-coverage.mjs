import fs from 'fs';
import path from 'path';
import { sources } from './sources-config.mjs';

console.log('📊 Generating Question Coverage Matrix across Curriculum Concepts...');

// 1. Load book and all concepts
const book = JSON.parse(fs.readFileSync(sources.canonicalBookFile, 'utf8'));
const lessons = book.chapters.flatMap(ch => ch.lessons);

const lessonStats = new Map();
// lessonNum -> { lessonTitle, chapterNum, concepts: Map(conceptId -> { termAr, count, easy, medium, hard, veryHard }) }

lessons.forEach(l => {
  const cMap = new Map();
  if (Array.isArray(l.keyConcepts)) {
    l.keyConcepts.forEach(c => {
      cMap.set(c.id, {
        termAr: c.termAr,
        count: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        veryHard: 0
      });
    });
  }
  lessonStats.set(l.number, {
    lessonId: l.id,
    lessonTitle: l.title,
    chapterNum: l.chapterNumber,
    concepts: cMap,
    totalQuestions: 0,
    difficultyCounts: { easy: 0, medium: 0, hard: 0, veryHard: 0 }
  });
});

// 2. Aggregate Deep Questions
const deepFiles = fs.readdirSync(sources.deepQuestionsDir).filter(f => /^chapter-\d+\.json$/.test(f));
for (const file of deepFiles) {
  const filePath = path.join(sources.deepQuestionsDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [lessonNum, questions] of Object.entries(data)) {
    const stat = lessonStats.get(lessonNum);
    if (!stat) continue;
    stat.totalQuestions += questions.length;

    questions.forEach(q => {
      const diffKey = q.difficulty === 'very-hard' ? 'veryHard' : q.difficulty;
      stat.difficultyCounts[diffKey] = (stat.difficultyCounts[diffKey] || 0) + 1;

      if (Array.isArray(q.conceptIds)) {
        q.conceptIds.forEach(cid => {
          const cStat = stat.concepts.get(cid);
          if (cStat) {
            cStat.count++;
            cStat[diffKey]++;
          }
        });
      }
    });
  }
}

// 3. Print Matrix & Check Invariants
console.log('\n========================================================================================');
console.log('📖 OFFICIAL CONCEPT ASSESSMENT COVERAGE MATRIX');
console.log('========================================================================================');
console.log('Lesson | Total Concepts | Covered | Zero Coverage | Questions | Easy | Medium | Hard | Very-Hard');
console.log('-------+----------------+---------+---------------+-----------+------+--------+------+----------');

let totalConceptsAll = 0;
let totalCoveredAll = 0;
let totalZeroCoverageAll = 0;
let totalQuestionsAll = 0;
const uncoveredConcepts = [];

for (const [lessonNum, stat] of lessonStats.entries()) {
  const totalConcepts = stat.concepts.size;
  let covered = 0;
  let zeroCount = 0;

  for (const [cid, c] of stat.concepts.entries()) {
    if (c.count > 0) {
      covered++;
    } else {
      zeroCount++;
      uncoveredConcepts.push({ lessonNum, cid, termAr: c.termAr });
    }
  }

  totalConceptsAll += totalConcepts;
  totalCoveredAll += covered;
  totalZeroCoverageAll += zeroCount;
  totalQuestionsAll += stat.totalQuestions;

  const d = stat.difficultyCounts;
  const zeroStr = zeroCount === 0 ? '     0      ' : `   ❌ ${zeroCount}    `;
  console.log(
    `${lessonNum.padEnd(6)} | ${String(totalConcepts).padStart(14)} | ${String(covered).padStart(7)} | ${zeroStr} | ${String(stat.totalQuestions).padStart(9)} | ${String(d.easy).padStart(4)} | ${String(d.medium).padStart(6)} | ${String(d.hard).padStart(4)} | ${String(d.veryHard).padStart(9)}`
  );
}

console.log('-------+----------------+---------+---------------+-----------+------+--------+------+----------');
console.log(
  `TOTAL  | ${String(totalConceptsAll).padStart(14)} | ${String(totalCoveredAll).padStart(7)} | ${String(totalZeroCoverageAll).padStart(13)} | ${String(totalQuestionsAll).padStart(9)} |`
);
console.log('========================================================================================\n');

if (totalZeroCoverageAll > 0) {
  console.error(`❌ CRITICAL FAILURE: Found ${totalZeroCoverageAll} concepts without any assessment coverage:`);
  uncoveredConcepts.forEach(u => {
    console.error(`  - [Lesson ${u.lessonNum}] Concept ${u.cid} (${u.termAr}): 0 questions`);
  });
  process.exit(1);
} else {
  console.log(`🏆 PERFECT COVERAGE GATE: 100% of curriculum concepts (${totalConceptsAll}/${totalConceptsAll}) have rigorous assessment coverage!`);
  process.exit(0);
}
