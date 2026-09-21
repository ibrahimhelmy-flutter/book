import fs from 'fs';
import path from 'path';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

console.log(`Auditing ${lessonFiles.length} official assessment lesson files...\n`);

let totalQuestions = 0;
let issues = [];
let ligatureMatches = [];
let boilerplateMatches = [];
let shortOrTruncated = [];
let optionCountIssues = [];
let answerIssues = [];

const KNOWN_BOILERPLATE = [
  'جمهورية مصر العربية',
  'وزارة التربية والتعليم',
  'الإدارة المركزية',
  'تطوير المناهج',
  'الصف الأول الثانوي',
  'الفصل الدراسي الأول',
  'العام الدراسي',
  'مكتب مستشار',
  'التقييم الأسبوعي', // when leaking into question body
  'أداءات منزلية',
  'المهام الأدائية'
];

const SUSPICIOUS_LIGATURES = [
  /\bامل[^\s]/,
  /\bإىل\b/,
  /\bفرت[ةهت]/,
  /\bكام\b/,
  /\bرسعة\b/,
  /\bنرش\b/,
  /\bرشائها\b/,
  /\bمبصطلح\b/,
  /\bمبثال/,
  /\bتقيض\b/,
  /\bع ى\b/,
  /\bغ ر\b/,
  /\bكل عام ن\b/,
  /\bميثل\b/,
  /\bالرتانزستورات\b/,
  /\bالرتاكب\b/,
  /\bالكالسييك\b/,
  /\bاالجتامعي\b/,
  /\bارشح\b/,
  /\bالصاممات\b/,
  /\bاالفرتايض\b/,
  /\bافرتائي\b/,
  /\bاألوىل\b/,
  /\bالثان\b/,
  /\bالثا\b/,
  /\bعرب\b(?!\s+(السعودية|المحيط|الحدود))/ // 'عرب' often meant 'عبر' (through) unless referring to Arabs
];

for (const file of lessonFiles) {
  const filePath = path.join(CANONICAL_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.questions.forEach((q, idx) => {
    totalQuestions++;

    // 1. Check option count for MCQs
    if (q.type === 'mcq') {
      if (!q.options || q.options.length !== 4) {
        optionCountIssues.push({ id: q.id, issue: `Options length is ${q.options ? q.options.length : 0}` });
      } else {
        // Check for empty or duplicate options
        const uniqueOpts = new Set(q.options.map(o => o.trim()));
        if (uniqueOpts.size !== 4) {
          optionCountIssues.push({ id: q.id, issue: `Duplicate options found: ${JSON.stringify(q.options)}` });
        }
        q.options.forEach((opt, oIdx) => {
          if (!opt || opt.trim().length === 0) {
            optionCountIssues.push({ id: q.id, issue: `Option ${oIdx} is empty` });
          }
        });
      }

      // Check correctAnswer validity
      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= 4) {
        answerIssues.push({ id: q.id, issue: `Invalid correctAnswerIndex: ${q.correctAnswerIndex}` });
      }
      if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        answerIssues.push({ id: q.id, issue: `correctAnswer does not match options: "${q.correctAnswer}"` });
      }
    }

    const qText = q.question || q.questionText || '';

    // 2. Check for boilerplate leakage in questionText
    for (const bp of KNOWN_BOILERPLATE) {
      if (qText.includes(bp)) {
        boilerplateMatches.push({ id: q.id, text: qText, match: bp });
      }
    }

    // 3. Check for truncated / too short question text
    if (qText.trim().length < 15) {
      shortOrTruncated.push({ id: q.id, text: qText });
    }

    // 4. Check for suspicious ligatures in question text, options, and model answer
    const textToScan = [
      qText,
      ...(q.options || []),
      q.modelAnswer || ''
    ].join(' ');

    for (const regex of SUSPICIOUS_LIGATURES) {
      const match = textToScan.match(regex);
      if (match) {
        ligatureMatches.push({ id: q.id, pattern: regex.toString(), snippet: match[0], context: textToScan.substring(Math.max(0, match.index - 20), match.index + 30) });
      }
    }
  });
}

console.log(`Total questions audited: ${totalQuestions}`);
console.log(`Option count issues: ${optionCountIssues.length}`);
if (optionCountIssues.length > 0) console.log(JSON.stringify(optionCountIssues, null, 2));

console.log(`Answer validation issues: ${answerIssues.length}`);
if (answerIssues.length > 0) console.log(JSON.stringify(answerIssues, null, 2));

console.log(`Boilerplate leakage matches: ${boilerplateMatches.length}`);
if (boilerplateMatches.length > 0) console.log(JSON.stringify(boilerplateMatches.slice(0, 10), null, 2));

console.log(`Suspiciously short questions: ${shortOrTruncated.length}`);
if (shortOrTruncated.length > 0) console.log(JSON.stringify(shortOrTruncated, null, 2));

console.log(`Suspicious ligatures found: ${ligatureMatches.length}`);
if (ligatureMatches.length > 0) console.log(JSON.stringify(ligatureMatches.slice(0, 20), null, 2));
