import fs from 'fs';
import path from 'path';

const allAssessmentsPath = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments/all-assessments.json');
const lessons = JSON.parse(fs.readFileSync(allAssessmentsPath, 'utf8'));

const wordCounts = {};

function addWords(text) {
  if (!text) return;
  // Remove punctuation, english, numbers
  const cleaned = text
    .replace(/[a-zA-Z0-9.,;:!?()\[\]{}«»"'/\\<>_-]/g, ' ')
    .replace(/\s+/g, ' ');
  const words = cleaned.split(' ').filter(w => w.length > 1 && /^[\u0621-\u064A]+$/.test(w));
  for (const w of words) {
    wordCounts[w] = (wordCounts[w] || 0) + 1;
  }
}

for (const lesson of lessons) {
  for (const q of lesson.questions) {
    addWords(q.question);
    (q.options || []).forEach(opt => addWords(opt));
    addWords(q.modelAnswer);
    addWords(q.textbookCitation?.exactText);
  }
}

// Check words against suspicious patterns
const suspiciousWords = [];
for (const word of Object.keys(wordCounts)) {
  const reasons = [];

  if (/رش/.test(word) && !/(ورش|عرش|فرش|قرش|كرش|حرش|أرش|رش|رشد|ترش|رشح|رشق|رشت|رشوة)/.test(word)) {
    reasons.push('Contains "رش"');
  }
  if (/رص/.test(word) && !/(قرص|حرص|فرص|برص|رصف|رصاص|رصد|مرصد|رصين|رصانة)/.test(word)) {
    reasons.push('Contains "رص"');
  }
  if (/هام$/.test(word) && !/(إلهام|السهام|الأوهام|أوهام|اتهام|استفهام|المهام|مهام|هام|إبهام|اقتحام)/.test(word)) {
    reasons.push('Ends with "هام" (possible "هما")');
  }
  if (/^مل[بتثجحخدذرزسشصضطظعغفقكلمنهوي]/.test(word) && !/(ملكية|ملف|ملفات|ملح|ملحق|ملحقات|ملايين|مليار|ملموس|ملء|مليء|ملائم|ملائمة)/.test(word)) {
    reasons.push('Starts with "مل" (possible "لم")');
  }
  if (/^مب[بتثجحخدذرزسشصضطظعغفقكلمنهوي]/.test(word) && !/(مبدأ|مبادئ|مباشر|مباشرة|مباشراً|مبكر|مبكرة|مبتكر|مبتكرة|مبني|مبنية|مبسط|مبسطة|مبسطاً|مبهم|مبهمة|مبلغ|مبالغ)/.test(word)) {
    reasons.push('Starts with "مب" (possible "بم")');
  }
  if (/عنر/.test(word)) reasons.push('عنر');
  if (/إكامل/.test(word)) reasons.push('إكامل');
  if (/تغيري/.test(word)) reasons.push('تغيري');
  if (/تحسينني/.test(word)) reasons.push('تحسينني');
  if (/التحسينني/.test(word)) reasons.push('التحسينني');
  if (/عميل/.test(word) && !/(عميل|عملاء|العميل)/.test(word)) reasons.push('عميل check');
  if (/يسري/.test(word)) reasons.push('يسري');
  if (/يعاين/.test(word)) reasons.push('يعاين');
  if (/خطويت/.test(word)) reasons.push('خطويت');
  if (/االستامع/.test(word)) reasons.push('االستامع');
  if (/ضامن/.test(word)) reasons.push('ضامن');
  if (/مرتاح/.test(word) || /مرتاحة/.test(word)) reasons.push('مرتاح');
  if (/إلكترتوين/.test(word) || /إلكرتوين/.test(word)) reasons.push('إلكترتوين');
  if (/تفسري/.test(word)) reasons.push('تفسري');
  if (/مؤرش/.test(word)) reasons.push('مؤرش');
  if (/ترصف/.test(word)) reasons.push('ترصف');

  if (reasons.length > 0) {
    suspiciousWords.push({ word, count: wordCounts[word], reasons });
  }
}

suspiciousWords.sort((a, b) => b.count - a.count);
console.log(`Total unique words: ${Object.keys(wordCounts).length}`);
console.log(`Suspicious words count: ${suspiciousWords.length}`);
fs.writeFileSync('scratch/suspicious_words.json', JSON.stringify(suspiciousWords, null, 2), 'utf8');
console.log('Saved to scratch/suspicious_words.json');
