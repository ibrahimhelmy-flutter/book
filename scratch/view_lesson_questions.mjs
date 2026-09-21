import fs from 'fs';
import path from 'path';

const lessonFile = process.argv[2] || 'lesson-1-1.json';
const p = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments', lessonFile);
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

console.log(`=== ${data.lessonNumber} : ${data.lessonTitle} (${data.questions.length} questions) ===\n`);
data.questions.forEach((q, idx) => {
  console.log(`--------------------------------------------------`);
  console.log(`[${idx + 1}] ID: ${q.id} | Section: ${q.sectionNameAr} | Type: ${q.type}`);
  console.log(`السؤال: ${q.question}`);
  if (q.type === 'mcq') {
    console.log(`الخيارات:`);
    q.options.forEach((opt, oIdx) => {
      const marker = oIdx === q.correctAnswerIndex ? ' [صحيح]' : '';
      console.log(`   ${oIdx}: ${opt}${marker}`);
    });
  }
  console.log(`الإجابة النموذجية الحالية: ${q.modelAnswer}`);
  console.log(`مرجع الكتاب: ص ${q.textbookCitation?.page} - ${q.textbookCitation?.topic}`);
});
