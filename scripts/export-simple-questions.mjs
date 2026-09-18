import fs from 'fs';
import path from 'path';

const DEEP_QUESTIONS_DIR = path.resolve('book-sources/term-1/05-canonical-data/authored/deep-questions');
const OUTPUT_FILE = path.resolve('public/data/simple-questions.json');

function validateAndConvert(q) {
  if (!q || typeof q !== 'object') return null;
  if (typeof q.question !== 'string' || !q.question.trim()) return null;
  if (!Array.isArray(q.options) || q.options.length !== 4) return null;

  const options = q.options.map(opt => typeof opt === 'string' ? opt.trim() : '');
  if (options.some(opt => !opt) || options.length !== 4) return null;

  let answer = '';
  if (typeof q.correctAnswerText === 'string' && q.correctAnswerText.trim()) {
    answer = q.correctAnswerText.trim();
  } else if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4) {
    answer = options[q.correctAnswer];
  } else if (typeof q.answer === 'string' && q.answer.trim()) {
    answer = q.answer.trim();
  }

  if (!answer || !options.includes(answer)) return null;

  let difficulty = 'medium';
  const rawDiff = String(q.difficulty || '').toLowerCase().trim();
  if (rawDiff === 'easy' || rawDiff === 'سهل') {
    difficulty = 'easy';
  } else if (rawDiff === 'hard' || rawDiff === 'very-hard' || rawDiff === 'expert' || rawDiff === 'صعب' || rawDiff === 'صعب جدا') {
    difficulty = 'hard';
  }

  const questionText = q.scenario && typeof q.scenario === 'string' && q.scenario.trim()
    ? `${q.scenario.trim()}\n${q.question.trim()}`
    : q.question.trim();

  return {
    question: questionText,
    options,
    answer,
    difficulty,
  };
}

console.log('🔄 Exporting simplified 4-field questions from Canonical Source of Truth...');

if (!fs.existsSync(DEEP_QUESTIONS_DIR)) {
  console.error(`❌ Missing directory: ${DEEP_QUESTIONS_DIR}`);
  process.exit(1);
}

const chapters = fs.readdirSync(DEEP_QUESTIONS_DIR).filter(d => d.startsWith('chapter-'));
const allSimple = [];

for (const ch of chapters) {
  const chDir = path.join(DEEP_QUESTIONS_DIR, ch);
  const files = fs.readdirSync(chDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(chDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data)) {
        for (const rawQ of data) {
          const converted = validateAndConvert(rawQ);
          if (converted) {
            allSimple.push(converted);
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Warning reading ${file}:`, err.message);
    }
  }
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSimple, null, 2), 'utf8');

console.log(`✅ Successfully exported ${allSimple.length} simple questions to: ${OUTPUT_FILE}`);
