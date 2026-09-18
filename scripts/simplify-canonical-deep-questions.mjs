import fs from 'fs';
import path from 'path';

const DEEP_QUESTIONS_DIR = path.resolve('book-sources/term-1/05-canonical-data/authored/deep-questions');

function convertToSimple(rawQ) {
  if (!rawQ || typeof rawQ !== 'object') return null;
  if (typeof rawQ.question !== 'string' || !rawQ.question.trim()) return null;
  if (!Array.isArray(rawQ.options) || rawQ.options.length !== 4) return null;

  const options = rawQ.options.map(opt => typeof opt === 'string' ? opt.trim() : '');
  if (options.some(opt => !opt) || options.length !== 4) return null;

  let answer = '';
  if (typeof rawQ.correctAnswerText === 'string' && rawQ.correctAnswerText.trim()) {
    answer = rawQ.correctAnswerText.trim();
  } else if (typeof rawQ.correctAnswer === 'number' && rawQ.correctAnswer >= 0 && rawQ.correctAnswer < 4) {
    answer = options[rawQ.correctAnswer];
  } else if (typeof rawQ.answer === 'string' && rawQ.answer.trim()) {
    answer = rawQ.answer.trim();
  }

  if (!answer || !options.includes(answer)) return null;

  let difficulty = 'medium';
  const rawDiff = String(rawQ.difficulty || '').toLowerCase().trim();
  if (rawDiff === 'easy' || rawDiff === 'سهل') {
    difficulty = 'easy';
  } else if (rawDiff === 'hard' || rawDiff === 'very-hard' || rawDiff === 'expert' || rawDiff === 'صعب' || rawDiff === 'صعب جدا') {
    difficulty = 'hard';
  }

  const questionText = rawQ.scenario && typeof rawQ.scenario === 'string' && rawQ.scenario.trim()
    ? `${rawQ.scenario.trim()}\n${rawQ.question.trim()}`
    : rawQ.question.trim();

  // Return strictly only the 4 fields
  return {
    question: questionText,
    options,
    answer,
    difficulty,
  };
}

const chapters = fs.readdirSync(DEEP_QUESTIONS_DIR).filter(d => d.startsWith('chapter-'));
let totalFiles = 0;
let totalQuestions = 0;

for (const ch of chapters) {
  const chDir = path.join(DEEP_QUESTIONS_DIR, ch);
  const files = fs.readdirSync(chDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(chDir, file);
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (Array.isArray(rawData)) {
      const simplified = [];
      for (const q of rawData) {
        const simple = convertToSimple(q);
        if (simple) {
          simplified.push(simple);
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2), 'utf8');
      totalFiles++;
      totalQuestions += simplified.length;
      console.log(`  ✅ Simplified ${file}: ${simplified.length} questions`);
    }
  }
}

console.log(`\n🎉 Completed: ${totalQuestions} questions across ${totalFiles} lesson files simplified to strict 4 fields.`);
