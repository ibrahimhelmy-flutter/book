import fs from 'fs';
const pages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

// Lesson boundaries defined by the start pages:
const lessons = [
  { id: 'lesson-1-1', key: '1-1', chapter: 1, title: 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', startPage: 3, endPage: 9 },
  { id: 'lesson-1-2', key: '1-2', chapter: 1, title: 'كيف يعمل الذكاء الاصطناعي', startPage: 10, endPage: 16 },
  { id: 'lesson-1-3', key: '1-3', chapter: 1, title: 'الذكاء الاصطناعي في الحياة اليومية والصناعة', startPage: 17, endPage: 22 },
  { id: 'lesson-1-4', key: '1-4', chapter: 1, title: 'القضايا الأخلاقية المتعلقة بالذكاء الاصطناعي', startPage: 23, endPage: 29 },
  { id: 'lesson-2-1', key: '2-1', chapter: 2, title: 'تقنيات التشفير والمصادقة', startPage: 30, endPage: 35 },
  { id: 'lesson-2-2', key: '2-2', chapter: 2, title: 'تصميم أمان الشبكات', startPage: 36, endPage: 42 },
  { id: 'lesson-2-3', key: '2-3', chapter: 2, title: 'الاستجابة للحوادث وإدارة المخاطر', startPage: 43, endPage: 47 },
  { id: 'lesson-3-1', key: '3-1', chapter: 3, title: 'البنية العامة لتطبيقات الويب', startPage: 48, endPage: 52 },
  { id: 'lesson-3-2', key: '3-2', chapter: 3, title: 'طرق اتصال تطبيقات الويب', startPage: 53, endPage: 57 },
  { id: 'lesson-3-3', key: '3-3', chapter: 3, title: 'أساسيات تقنية الواجهة الأمامية', startPage: 58, endPage: 62 },
  { id: 'lesson-4-1', key: '4-1', chapter: 4, title: 'أنواع الوسائط وخصائصها', startPage: 63, endPage: 67 },
  { id: 'lesson-4-2', key: '4-2', chapter: 4, title: 'تصميم المعلومات وتجربة المستخدم للمواقع الإلكترونية', startPage: 68, endPage: 74 },
  { id: 'lesson-4-3', key: '4-3', chapter: 4, title: 'طرق تقييم المواقع الإلكترونية', startPage: 75, endPage: 80 },
  { id: 'lesson-4-4', key: '4-4', chapter: 4, title: 'عملية التحسين التكراري للمواقع الإلكترونية', startPage: 81, endPage: 87 },
];

for (const l of lessons) {
  let text = '';
  for (let p = l.startPage; p <= l.endPage; p++) {
    text += pages[p - 1].lines.join('\n') + '\n';
  }
  
  // Count questions
  // Questions typically start with number followed by dash: 1-, 2-, 3-, 4-
  const mcqMatches = (text.match(/اختيار من متعدد/g) || []).length;
  const essayMatches = (text.match(/الأسئلة المقالية|االسئلة املقالية|األسئلة املقالية/g) || []).length;
  const modelMatches = (text.match(/النموذج\s*\([ABCأبج]\)/g) || []).length;
  
  console.log(`Lesson ${l.key} (${l.title}) P${l.startPage}-${l.endPage}: MCQ sections=${mcqMatches}, Essay sections=${essayMatches}, Weekly Models=${modelMatches}`);
}
