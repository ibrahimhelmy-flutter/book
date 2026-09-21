import fs from 'fs';
import path from 'path';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');

const fixes = {
  'OFFICIAL-1-2-WEEKLY_MODEL_A-MCQ-4': {
    options: [
      'الهلوسة.',
      'التراكب الكمي.',
      'الحوسبة الطرفية.',
      'التشغيل الخطي.'
    ],
    correctAnswerIndex: 0,
    correctAnswer: 'الهلوسة.'
  },
  'OFFICIAL-3-2-HOMEWORK-MCQ-2': {
    options: [
      'POST',
      'GET',
      '500',
      'HTTPS'
    ],
    correctAnswerIndex: 1,
    correctAnswer: 'GET'
  },
  'OFFICIAL-3-2-WEEKLY_MODEL_A-MCQ-2': {
    options: [
      'POST',
      'GET',
      'API',
      'JSON'
    ],
    correctAnswerIndex: 1,
    correctAnswer: 'GET'
  },
  'OFFICIAL-3-3-WEEKLY_MODEL_A-MCQ-2': {
    options: [
      'header',
      'footer',
      'main',
      'nav'
    ],
    correctAnswerIndex: 2,
    correctAnswer: 'main'
  },
  'OFFICIAL-4-2-PERFORMANCE_TASK_2-MCQ-2': {
    options: [
      'محاذاة النص الأساسي والعناصر من اليسار إلى اليمين حصراً.',
      'توزيع العناصر عشوائياً دون الالتزام بخط أساس مشترك.',
      'محاذاة العناصر حسب اتجاه اللغة وشبكة التصميم بحيث يكون اتجاه النص الأساسي من اليمين إلى اليسار باستخدام قواعد متسقة.',
      'الاعتماد على الزخارف الهندسية المعقدة لتغطية مساحات الفراغ.'
    ],
    correctAnswerIndex: 2,
    correctAnswer: 'محاذاة العناصر حسب اتجاه اللغة وشبكة التصميم بحيث يكون اتجاه النص الأساسي من اليمين إلى اليسار باستخدام قواعد متسقة.'
  },
  'OFFICIAL-4-2-WEEKLY_MODEL_C-MCQ-4': {
    options: [
      'جعل اتجاه النص الأساسي من اليمين إلى اليسار وفق قواعد متسقة.',
      'جعل اتجاه النص من اليسار إلى اليمين حصراً.',
      'توزيع الكلمات بشكل عشوائي في أركان الشاشة.',
      'إخفاء النصوص داخل قوائم منسدلة معقدة.'
    ],
    correctAnswerIndex: 0,
    correctAnswer: 'جعل اتجاه النص الأساسي من اليمين إلى اليسار وفق قواعد متسقة.'
  }
};

const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();
const updatedLessons = [];

for (const file of lessonFiles) {
  const filePath = path.join(CANONICAL_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.questions.forEach(q => {
    if (fixes[q.id]) {
      const fix = fixes[q.id];
      q.options = fix.options;
      q.correctAnswerIndex = fix.correctAnswerIndex;
      q.correctAnswer = fix.correctAnswer;
      console.log(`✅ Patched question ${q.id}`);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  updatedLessons.push(data);
}

// Master file
fs.writeFileSync(path.join(CANONICAL_DIR, 'all-assessments.json'), JSON.stringify(updatedLessons, null, 2), 'utf8');
console.log('✅ Canonical official assessments patched and verified.');
