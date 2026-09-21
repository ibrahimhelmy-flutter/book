import fs from 'fs';
import path from 'path';
import { fixExtractedArabicText } from '../scripts/arabic-cleaner.mjs';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

// Specific corrections for questions where options, answers, or model answers need precise adjustment
const SPECIFIC_FIXES = {
  // Lesson 1-1
  'OFFICIAL-1-1-WEEKLY_MODEL_C-MCQ-3': {
    options: [
      'شبكات التواصل الاجتماعي (SNS).',
      'التجارة الإلكترونية.',
      'العمل عن بعد.',
      'الحوسبة السحابية.'
    ],
    correctAnswerIndex: 0
  },

  // Lesson 2-1
  'OFFICIAL-2-1-HOMEWORK-ESSAY-1': {
    modelAnswer: 'تكمن أهمية المصادقة متعددة العوامل (MFA) في أنها تتطلب عاملين مستقلين أو أكثر للتحقق من هوية المستخدم (مثل كلمة المرور مع رمز مؤقت على الهاتف)، مما يقلل احتمالية الوصول غير المصرح به حتى في حال كشف كلمة المرور أو سرقتها.'
  },
  'OFFICIAL-2-1-PERFORMANCE_TASK_2-ESSAY-2': {
    modelAnswer: 'وفقاً لما ورد في كتاب الوزارة (ص 35): الشهادة الرقمية هي شهادة إلكترونية تُصدرها جهة موثوقة (CA) لإثبات هوية مالك المفتاح العام، وتُستخدم لتأمين الاتصالات والتحقق من موثوقية المواقع والخدمات.'
  },
  'OFFICIAL-2-1-WEEKLY_MODEL_B-ESSAY-4': {
    modelAnswer: 'وفقاً لكتاب الوزارة (ص 33): تسهم المصادقة متعددة العوامل في تعزيز الأمان من خلال اشتراط التحقق بأكثر من وسيلة مستقلة، بحيث إذا تم اختراق أو كشف كلمة المرور، يظل الحساب محمياً بواسطة العامل الآخر (مثل رمز التحقق أو البصمة الحيوية).'
  },

  // Lesson 2-2
  'OFFICIAL-2-2-PERFORMANCE_TASK_1-ESSAY-1': {
    modelAnswer: 'وفقاً لكتاب الوزارة (ص 41): الدفاع في العمق هو استراتيجية أمنية تقوم على تطبيق طبقات حماية متعددة، بحيث يكون أمان الشبكة في أقوى حالاته عندما تتكامل إجراءات الحماية عبر طبقات متعددة، فإذا فشلت إحدى الطبقات أو تم اختراقها، تتصدى الطبقات الأخرى لمنع التهديد أو تقليل أثره.'
  },
  'OFFICIAL-2-2-WEEKLY_MODEL_B-ESSAY-2': {
    modelAnswer: 'وفقاً لكتاب الوزارة (ص 42): تتضمن طبقات الدفاع في العمق الأساسية: 1) مدخل الشبكة (محيط الشبكة وموجهات الدخول)، 2) مسار الاتصال وجدران الحماية، 3) منطقة الخوادم والخدمات، 4) الأجهزة الطرفية والمستخدمين، 5) حماية البيانات في مراكز الحفظ والتخزين.'
  },
  'OFFICIAL-2-2-WEEKLY_MODEL_B-MCQ-4': {
    options: [
      'جدار الحماية (Firewall).',
      'الشبكة الافتراضية الخاصة.',
      'الكيوبت.',
      'الحوسبة الطرفية.'
    ],
    correctAnswerIndex: 0
  },

  // Lesson 3-1
  'OFFICIAL-3-1-HOMEWORK-ESSAY-2': {
    modelAnswer: 'وفقاً لما ورد في كتاب الوزارة (ص 53): قاعدة البيانات هي الطبقة المسؤولة عن تنظيم البيانات وتخزينها واسترجاعها وإدارتها بأمان وموثوقية لتلبية طلبات الواجهة الخلفية.'
  },
  'OFFICIAL-3-1-WEEKLY_MODEL_B-MCQ-2': {
    options: [
      'الواجهة الأمامية.',
      'الواجهة الخلفية.',
      'قاعدة البيانات.',
      'المتصفح.'
    ],
    correctAnswerIndex: 2
  },
  'OFFICIAL-3-1-WEEKLY_MODEL_B-MCQ-4': {
    options: [
      'أن التطبيق يُبنى من ثلاث طبقات تتعاون معاً.',
      'أن كل طبقة تعمل منفردة دون تعاون.',
      'أن التطبيق يعمل من خلال المتصفح فقط.',
      'أن التطبيق يعتمد فقط على قاعدة البيانات.'
    ],
    correctAnswerIndex: 0
  },

  // Lesson 3-2
  'OFFICIAL-3-2-PERFORMANCE_TASK_1-MCQ-1': {
    correctAnswerIndex: 1 // البرنامج أو الجهاز الذي يرسل الطلبات
  },
  'OFFICIAL-3-2-HOMEWORK-MCQ-1': {
    options: [
      'خطأ داخلي في الخادم.',
      'نجاح الطلب.',
      'المورد غير موجود.',
      'طلب غير مصرح به.'
    ],
    correctAnswerIndex: 1 // نجاح الطلب
  },
  'OFFICIAL-3-2-HOMEWORK-MCQ-2': {
    options: [
      'نجاح الطلب.',
      'خطأ داخلي في الخادم.',
      'المورد غير موجود.',
      'الاتصال آمن.'
    ],
    correctAnswerIndex: 2 // المورد غير موجود
  },
  'OFFICIAL-3-2-WEEKLY_MODEL_A-MCQ-4': {
    correctAnswerIndex: 2 // المورد المطلوب غير موجود
  },
  'OFFICIAL-3-2-WEEKLY_MODEL_B-MCQ-3': {
    correctAnswerIndex: 1 // API
  },
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-1': {
    correctAnswerIndex: 2 // 500
  },
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-2': {
    correctAnswerIndex: 1 // GET
  },
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-4': {
    correctAnswerIndex: 1 // HTTPS
  },

  // Lesson 3-3
  'OFFICIAL-3-3-PERFORMANCE_TASK_1-MCQ-2': {
    options: [
      'header',
      'mail',
      'main',
      'footer'
    ],
    correctAnswerIndex: 1 // mail
  },
  'OFFICIAL-3-3-HOMEWORK-MCQ-2': {
    options: [
      'العناوين والفقرات.',
      'الألوان والخطوط.',
      'السلوك التفاعلي.',
      'عناصر دلالية.'
    ],
    correctAnswerIndex: 2 // السلوك التفاعلي
  },
  'OFFICIAL-3-3-WEEKLY_MODEL_B-MCQ-4': {
    options: [
      'React',
      'Vue',
      'Next.js',
      'HTML'
    ],
    correctAnswerIndex: 2 // Next.js
  },
  'OFFICIAL-3-3-WEEKLY_MODEL_C-MCQ-4': {
    question: 'أي مما يأتي يعد إطار عمل JavaScript يتيح بناء تطبيقات تدريجياً؟',
    options: [
      'React',
      'Vue',
      'Next.js',
      'HTML'
    ],
    correctAnswerIndex: 1 // Vue
  },

  // Lesson 4-1
  'OFFICIAL-4-1-HOMEWORK-ESSAY-1': {
    modelAnswer: 'وفقاً لكتاب الوزارة (ص 71): تتيح وسائل الإعلام عبر الفيديو إعلام وإيصال الرسالة إلى عدد كبير من الناس في آن واحد وبانتشار واسع، مع الجمع بين الصورة والحركة والصوت لجذب الانتباه وزيادة التأثير وسرعة استيعاب المحتوى.'
  }
};

let totalCleaned = 0;
const updatedLessons = [];

lessonFiles.forEach(file => {
  const filePath = path.join(CANONICAL_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.lessonTitle = fixExtractedArabicText(data.lessonTitle);

  data.questions.forEach((q, qIdx) => {
    totalCleaned++;

    // 1. Text cleaning
    q.lessonTitle = fixExtractedArabicText(q.lessonTitle);
    q.sectionNameAr = fixExtractedArabicText(q.sectionNameAr);
    q.question = fixExtractedArabicText(q.question);

    if (q.options && Array.isArray(q.options)) {
      q.options = q.options.map(opt => fixExtractedArabicText(opt));
    }

    if (q.modelAnswer) {
      q.modelAnswer = fixExtractedArabicText(q.modelAnswer);
    }

    if (q.textbookCitation) {
      if (q.textbookCitation.exactText) {
        q.textbookCitation.exactText = fixExtractedArabicText(q.textbookCitation.exactText);
      }
      if (q.textbookCitation.topic) {
        q.textbookCitation.topic = fixExtractedArabicText(q.textbookCitation.topic);
      }
    }

    // 2. Apply specific fixes if defined
    if (SPECIFIC_FIXES[q.id]) {
      const fix = SPECIFIC_FIXES[q.id];
      if (fix.question) q.question = fix.question;
      if (fix.options) q.options = fix.options;
      if (fix.modelAnswer) q.modelAnswer = fix.modelAnswer;
      if (typeof fix.correctAnswerIndex === 'number') {
        q.correctAnswerIndex = fix.correctAnswerIndex;
      }
    }

    // 3. Ensure correctAnswer matches options[correctAnswerIndex]
    if (q.type === 'mcq') {
      if (typeof q.correctAnswerIndex === 'number' && q.options && q.options[q.correctAnswerIndex]) {
        q.correctAnswer = q.options[q.correctAnswerIndex];
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  updatedLessons.push(data);
  console.log(`✅ Fully cleaned and verified: ${file}`);
});

// Master all-assessments.json
const masterPath = path.join(CANONICAL_DIR, 'all-assessments.json');
fs.writeFileSync(masterPath, JSON.stringify(updatedLessons, null, 2), 'utf8');
console.log(`\n✅ Saved master file: ${masterPath}`);
