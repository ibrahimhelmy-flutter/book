import fs from 'fs';
import path from 'path';

const allAssessmentsPath = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments/all-assessments.json');
const lessons = JSON.parse(fs.readFileSync(allAssessmentsPath, 'utf8'));

const suspiciousModelAnswers = [];

for (const lesson of lessons) {
  for (const q of lesson.questions) {
    const ma = q.modelAnswer || '';
    const cite = q.textbookCitation?.exactText || '';

    // Check for weird characters, consecutive tashkeel, reversed text patterns
    const weirdPatterns = [
      /دََُّّتكُ/,
      /ٍفي آ/,
      /\b[أ-ي]\s+مدخل/,
      /حاالته في/,
      /[أ-ي]\s+[أ-ي]\s+[أ-ي]/,
      /ٍ/,
      /ـ\s+ب/,
      /ة\s+ب\s+ا/,
      /ي\s+آ\s+م/,
      /متعددة طبقات/,
      /بالفيديو\s*ٍن/
    ];

    for (const pat of weirdPatterns) {
      if (pat.test(ma) || pat.test(cite)) {
        suspiciousModelAnswers.push({
          id: q.id,
          lesson: lesson.lessonId,
          modelAnswer: ma,
          citation: cite,
          match: (ma.match(pat) || cite.match(pat))?.[0]
        });
        break;
      }
    }
  }
}

console.log(`Found ${suspiciousModelAnswers.length} suspicious model answers or citations:`);
console.log(JSON.stringify(suspiciousModelAnswers, null, 2));
