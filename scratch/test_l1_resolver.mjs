import fs from 'fs';
import { findBestOptionForQuestion } from '../scripts/resolve-authentic-assessment-answers.mjs';

const l = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/official-assessments/lesson-1-1.json', 'utf8'));
const def = { number: '1-1', chapterNumber: 1 };

l.questions.filter(q => q.type === 'mcq').forEach((q, i) => {
  const res = findBestOptionForQuestion(q, def);
  console.log('Q' + (i+1) + ': ' + q.question);
  console.log('  Resolved: [' + res.index + '] ' + res.option + ' (confidence: ' + res.confidence + ')');
  console.log('  Current : [' + q.correctAnswerIndex + '] ' + q.correctAnswer);
  console.log('');
});
