import fs from 'fs';
import path from 'path';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

lessonFiles.forEach(file => {
  const filePath = path.join(CANONICAL_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const mcqs = data.questions.filter(q => q.type === 'mcq');
  console.log(`\n================== ${data.lessonNumber}: ${data.lessonTitle} (${mcqs.length} MCQs) ==================`);
  mcqs.forEach((q, idx) => {
    console.log(`\n[${idx + 1}] ${q.id}:`);
    console.log(`  Q: ${q.question}`);
    q.options.forEach((opt, oIdx) => {
      const mark = oIdx === q.correctAnswerIndex ? ' <-- CURRENT' : '';
      console.log(`    [${oIdx}] ${opt}${mark}`);
    });
  });
});
