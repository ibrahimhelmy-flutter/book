import fs from 'fs';
import path from 'path';

const dir = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const files = fs.readdirSync(dir).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

const summary = [];

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  let boilerplateCount = 0;
  let shortCount = 0;
  let detailedCount = 0;

  for (const q of data.questions) {
    const ans = q.modelAnswer || '';
    if (ans.startsWith('استناداً إلى النص الأصلي لكتاب الوزارة') || ans.startsWith('وفقاً لما ورد في كتاب الوزارة') || ans.startsWith('استناداً إلى كتاب الوزارة')) {
      boilerplateCount++;
    }
    if (ans.length < 100) {
      shortCount++;
    } else {
      detailedCount++;
    }
  }

  summary.push({
    file: f,
    lesson: data.lessonNumber,
    total: data.questions.length,
    boilerplateCount,
    shortCount,
    detailedCount
  });
}

console.log(JSON.stringify(summary, null, 2));
