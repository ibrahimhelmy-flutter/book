import fs from 'fs';
import path from 'path';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

console.log('Loading all 279 MCQs to inspect and verify correct answers...\n');

const mcqBank = [];
lessonFiles.forEach(file => {
  const filePath = path.join(CANONICAL_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.questions.filter(q => q.type === 'mcq').forEach(q => {
    mcqBank.push({
      file,
      id: q.id,
      lessonNumber: q.lessonNumber,
      sectionType: q.sectionType,
      question: q.question,
      options: q.options,
      currentAns: q.correctAnswer,
      currentIdx: q.correctAnswerIndex
    });
  });
});

console.log(`Total MCQs loaded: ${mcqBank.length}`);

// Dump all MCQs into a clean text file for fast inspection
const lines = [];
mcqBank.forEach((item, idx) => {
  lines.push(`--- [${idx + 1}/${mcqBank.length}] ${item.id} (Lesson ${item.lessonNumber}) ---`);
  lines.push(`Q: ${item.question}`);
  item.options.forEach((opt, oIdx) => {
    const isCurrent = oIdx === item.currentIdx ? ' [*]' : '';
    lines.push(`  [${oIdx}] ${opt}${isCurrent}`);
  });
  lines.push('');
});

fs.writeFileSync('scratch/all_mcqs_for_review.txt', lines.join('\n'), 'utf8');
console.log('Saved scratch/all_mcqs_for_review.txt');
