import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

const LESSON_DEFS = [
  { id: 'lesson-1-1', key: '1-1', chapter: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', startPage: 3, endPage: 9 },
  { id: 'lesson-1-2', key: '1-2', chapter: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'كيف يعمل الذكاء الاصطناعي', startPage: 10, endPage: 16 },
  { id: 'lesson-1-3', key: '1-3', chapter: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'الذكاء الاصطناعي في الحياة اليومية والصناعة', startPage: 17, endPage: 22 },
  { id: 'lesson-1-4', key: '1-4', chapter: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'القضايا الأخلاقية المتعلقة بالذكاء الاصطناعي', startPage: 23, endPage: 29 },
  { id: 'lesson-2-1', key: '2-1', chapter: 2, chapterTitle: 'الأمن السيبراني', title: 'تقنيات التشفير والمصادقة', startPage: 30, endPage: 35 },
  { id: 'lesson-2-2', key: '2-2', chapter: 2, chapterTitle: 'الأمن السيبراني', title: 'تصميم أمان الشبكات', startPage: 36, endPage: 42 },
  { id: 'lesson-2-3', key: '2-3', chapter: 2, chapterTitle: 'الأمن السيبراني', title: 'الاستجابة للحوادث وإدارة المخاطر', startPage: 43, endPage: 47 },
  { id: 'lesson-3-1', key: '3-1', chapter: 3, chapterTitle: 'تطبيقات الويب', title: 'البنية العامة لتطبيقات الويب', startPage: 48, endPage: 52 },
  { id: 'lesson-3-2', key: '3-2', chapter: 3, chapterTitle: 'تطبيقات الويب', title: 'طرق اتصال تطبيقات الويب', startPage: 53, endPage: 57 },
  { id: 'lesson-3-3', key: '3-3', chapter: 3, chapterTitle: 'تطبيقات الويب', title: 'أساسيات تقنية الواجهة الأمامية', startPage: 58, endPage: 62 },
  { id: 'lesson-4-1', key: '4-1', chapter: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'أنواع الوسائط وخصائصها', startPage: 63, endPage: 67 },
  { id: 'lesson-4-2', key: '4-2', chapter: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'تصميم المعلومات وتجربة المستخدم للمواقع الإلكترونية', startPage: 68, endPage: 74 },
  { id: 'lesson-4-3', key: '4-3', chapter: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'طرق تقييم المواقع الإلكترونية', startPage: 75, endPage: 80 },
  { id: 'lesson-4-4', key: '4-4', chapter: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'عملية التحسين التكراري للمواقع الإلكترونية', startPage: 81, endPage: 87 },
];

function cleanLine(l) {
  return l
    .replace(/[\u064B-\u0652\u0670]/g, "") // remove tashkeel
    .replace(/\u0640/g, "") // remove kashida
    .replace(/\s+/g, " ")
    .trim();
}

console.log('Testing question extractor across all 14 lessons...');

for (const l of LESSON_DEFS) {
  let questionsFound = 0;
  let mcqCount = 0;
  let essayCount = 0;
  
  for (let p = l.startPage; p <= l.endPage; p++) {
    const pageObj = pages[p - 1];
    for (const rawLine of pageObj.lines) {
      const line = cleanLine(rawLine);
      if (/^\d+\s*[-–.]/.test(line)) {
        questionsFound++;
        // check if this is after an MCQ or Essay header
      }
    }
  }
  console.log(`Lesson ${l.key}: ${questionsFound} numbered items found.`);
}
