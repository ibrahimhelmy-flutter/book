import fs from 'fs';
import path from 'path';
import { sources } from './sources-config.mjs';

console.log('🔍 Running Smart Question Duplicate & Semantic Similarity Audit...');

// Load all authored questions: deep questions + committee questions
const allQuestions = [];

const deepFiles = fs.readdirSync(sources.deepQuestionsDir).filter(f => /^chapter-\d+\.json$/.test(f));
for (const file of deepFiles) {
  const filePath = path.join(sources.deepQuestionsDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [lessonNum, questions] of Object.entries(data)) {
    questions.forEach(q => {
      allQuestions.push({
        id: q.id,
        lessonNumber: lessonNum,
        title: q.title,
        question: q.question,
        options: q.options || [],
        type: 'deep'
      });
    });
  }
}

if (fs.existsSync(sources.committeeQuestionsFile)) {
  const cq = JSON.parse(fs.readFileSync(sources.committeeQuestionsFile, 'utf8'));
  cq.forEach(q => {
    allQuestions.push({
      id: q.id,
      lessonNumber: q.lessonNumber,
      title: q.topic || q.question,
      question: q.question,
      options: (q.options || []).map(o => typeof o === 'string' ? o : o.text),
      type: 'committee'
    });
  });
}

console.log(`  Loaded ${allQuestions.length} authored questions for duplicate analysis.`);

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  return new Set(normalizeText(text).split(' ').filter(t => t.length > 2));
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

const exactDuplicates = [];
const highSimilarityPairs = [];

// Check pairwise within same lesson
const questionsByLesson = new Map();
allQuestions.forEach(q => {
  const list = questionsByLesson.get(q.lessonNumber) || [];
  list.push(q);
  questionsByLesson.set(q.lessonNumber, list);
});

for (const [lessonNum, qList] of questionsByLesson.entries()) {
  for (let i = 0; i < qList.length; i++) {
    const q1 = qList[i];
    const normQ1 = normalizeText(q1.question);
    const tokensQ1 = getTokens(q1.question);

    for (let j = i + 1; j < qList.length; j++) {
      const q2 = qList[j];
      const normQ2 = normalizeText(q2.question);

      if (normQ1 === normQ2) {
        exactDuplicates.push({ q1: q1.id, q2: q2.id, lesson: lessonNum, text: q1.question.slice(0, 70) });
      } else {
        const tokensQ2 = getTokens(q2.question);
        const sim = jaccardSimilarity(tokensQ1, tokensQ2);
        if (sim >= 0.92) {
          highSimilarityPairs.push({ q1: q1.id, q2: q2.id, lesson: lessonNum, similarity: (sim * 100).toFixed(1) });
        }
      }
    }
  }
}

console.log('\n======================================================');
console.log('🔍 QUESTION SIMILARITY & DUPLICATE REPORT');
console.log('======================================================');
console.log(`Total questions analyzed        : ${allQuestions.length}`);
console.log(`Exact text duplicates detected  : ${exactDuplicates.length}`);
console.log(`High similarity pairs (>= 92%)  : ${highSimilarityPairs.length}`);

if (exactDuplicates.length > 0) {
  console.error('\n❌ CRITICAL: Exact duplicates found:');
  exactDuplicates.slice(0, 10).forEach(d => {
    console.error(`  - [Lesson ${d.lesson}] ${d.q1} === ${d.q2} ("${d.text}...")`);
  });
  process.exit(1);
}

if (highSimilarityPairs.length > 0) {
  console.warn('\n⚠️ WARNING: High similarity question pairs detected:');
  highSimilarityPairs.slice(0, 5).forEach(p => {
    console.warn(`  - [Lesson ${p.lesson}] ${p.q1} ~ ${p.q2} (${p.similarity}%)`);
  });
}

console.log('🏆 DUPLICATE AUDIT PASSED: 0 exact duplicate questions detected!');
process.exit(0);
