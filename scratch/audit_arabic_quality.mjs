import fs from 'fs';
import path from 'path';

const allAssessmentsPath = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments/all-assessments.json');
const lessons = JSON.parse(fs.readFileSync(allAssessmentsPath, 'utf8'));

let totalQuestions = 0;
let issues = [];

// Suspicious substrings / anomalies
const suspiciousPatterns = [
  { pattern: /(?<![\u0621-\u064A])كام(?![\u0621-\u064A])/, name: 'Inverted "كما" (كام)' },
  { pattern: /(?<![\u0621-\u064A])يف(?![\u0621-\u064A])/, name: 'Inverted "في" (يف)' },
  { pattern: /(?<![\u0621-\u064A])عىل(?![\u0621-\u064A])/, name: 'Inverted "على" (عىل)' },
  { pattern: /(?<![\u0621-\u064A])إىل(?![\u0621-\u064A])/, name: 'Inverted "إلى" (إىل)' },
  { pattern: /(?<![\u0621-\u064A])بني(?![\u0621-\u064A])/, name: 'Inverted "بين" (بني)' },
  { pattern: /(?<![\u0621-\u064A])غري(?![\u0621-\u064A])/, name: 'Inverted "غير" (غري)' },
  { pattern: /(?<![\u0621-\u064A])ارشح(?![\u0621-\u064A])/, name: 'Inverted "اشرح" (ارشح)' },
  { pattern: /(?<![\u0621-\u064A])ملاذا(?![\u0621-\u064A])/, name: 'Inverted "لماذا" (ملاذا)' },
  { pattern: /(?<![\u0621-\u064A])ميكن(?![\u0621-\u064A])/, name: 'Inverted "يمكن" (ميكن)' },
  { pattern: /(?<![\u0621-\u064A])منط(?![\u0621-\u064A])/, name: 'Inverted "نمط" (منط)' },
  { pattern: /(?<![\u0621-\u064A])منوذج(?![\u0621-\u064A])/, name: 'Inverted "نموذج" (منوذج)' },
  { pattern: /(?<![\u0621-\u064A])فرت/ , name: 'Inverted "فتر" (فرت)' },
  { pattern: /(?<![\u0621-\u064A])رسع/ , name: 'Inverted "سرع" (رسع)' },
  { pattern: /(?<![\u0621-\u064A])أرسع/ , name: 'Inverted "أسرع" (أرسع)' },
  { pattern: /(?<![\u0621-\u064A])نرش/ , name: 'Inverted "نشر" (نرش)' },
  { pattern: /(?<![\u0621-\u064A])تحسني(?![\u0621-\u064A])/, name: 'Inverted "تحسين" (تحسني)' },
  { pattern: /(?<![\u0621-\u064A])امل(?=[\u0621-\u064A])/, name: 'Inverted "الم" prefix (امل)' },
  { pattern: /(?<![\u0621-\u064A])االفرتا/, name: 'Inverted "الافترا" (االفرتا)' },
  { pattern: /(?<![\u0621-\u064A])املايض/, name: 'Inverted "الماضي" (املايض)' },
  { pattern: /(?<![\u0621-\u064A])مب(?![\u0621-\u064A])/, name: 'Isolated "مب"' },
  { pattern: /[\u0621-\u064A]\s+[\u0621-\u064A]\s+[\u0621-\u064A]/, name: 'Multi-isolated characters with spaces' },
  { pattern: /[\u0621-\u064A]\s+[يوا]\s+[\u0621-\u064A]/, name: 'Isolated vowel with spaces' },
  { pattern: /(?<![\u0621-\u064A])[\u0621-\u064A]\s+[\u0621-\u064A](?![\u0621-\u064A])/, name: 'Two isolated letters' },
  { pattern: /ن\b(?<=\w+\s+ن)/, name: 'Trailing isolated noon' },
  { pattern: /(?<![\u0621-\u064A])نسخت\s*ن/, name: 'نسختين broken' },
  { pattern: /(?<![\u0621-\u064A])مستخدم\s*ن/, name: 'مستخدمين broken' },
  { pattern: /(?<![\u0621-\u064A])نمط\s*ن/, name: 'نمطين broken' },
  { pattern: /(?<![\u0621-\u064A])تغي\s*ر/, name: 'تغيير broken' },
  { pattern: /(?<![\u0621-\u064A])تفك\s*ر/, name: 'تفكير broken' },
  { pattern: /(?<![\u0621-\u064A])عن\s*ر/, name: 'عنصر broken' },
  { pattern: /(?<![\u0621-\u064A])كث\s*ر/, name: 'كثير broken' },
  { pattern: /(?<![\u0621-\u064A])القر\s+ن/, name: 'القرين/القرن broken' },
];

for (const lesson of lessons) {
  for (const q of lesson.questions) {
    totalQuestions++;
    const textsToCheck = [
      { field: 'question', text: q.question },
      ...(q.options || []).map((opt, i) => ({ field: `options[${i}]`, text: opt })),
      { field: 'modelAnswer', text: q.modelAnswer || '' },
      { field: 'citation', text: q.textbookCitation?.exactText || '' },
    ];

    // Check MCQ integrity
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        issues.push({ id: q.id, lesson: lesson.lessonId, issue: `MCQ does not have 4 options: ${q.options?.length}` });
      }
      if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
        issues.push({ id: q.id, lesson: lesson.lessonId, issue: `MCQ correctAnswerIndex invalid: ${q.correctAnswerIndex}` });
      } else if (q.options && q.correctAnswer !== q.options[q.correctAnswerIndex]) {
        issues.push({ id: q.id, lesson: lesson.lessonId, issue: `MCQ correctAnswer doesn't match options[correctAnswerIndex]` });
      }
    }

    // Check Text Patterns
    for (const { field, text } of textsToCheck) {
      if (!text) continue;
      for (const { pattern, name } of suspiciousPatterns) {
        if (pattern.test(text)) {
          issues.push({
            id: q.id,
            lesson: lesson.lessonId,
            field,
            pattern: name,
            match: text.match(pattern)?.[0],
            snippet: text.substring(0, 100)
          });
        }
      }
    }
  }
}

fs.writeFileSync('scratch/issues.json', JSON.stringify(issues, null, 2), 'utf8');

// Group issues by pattern
const byPattern = {};
for (const iss of issues) {
  const p = iss.pattern || iss.issue;
  byPattern[p] = (byPattern[p] || 0) + 1;
}

console.log(`Total questions analyzed: ${totalQuestions}`);
console.log(`Total issues/suspicious occurrences found: ${issues.length}`);
console.log('Issues by pattern:', JSON.stringify(byPattern, null, 2));
