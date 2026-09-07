import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function computeHash(str) {
  return crypto.createHash('sha256').update(str.trim()).digest('hex').slice(0, 12);
}

const fullText = JSON.parse(fs.readFileSync('Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json', 'utf8'));

// Lesson page range definitions from the official TOC
const LESSON_DEFS = [
  { id: 'lesson-1-1', number: '1-1', chapterNumber: 1, title: 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', startPage: 4, endPage: 11 },
  { id: 'lesson-1-2', number: '1-2', chapterNumber: 1, title: 'كيف يعمل الذكاء الاصطناعي', startPage: 12, endPage: 17 },
  { id: 'lesson-1-3', number: '1-3', chapterNumber: 1, title: 'الذكاء الاصطناعي في الحياة اليومية والصناعة', startPage: 18, endPage: 23 },
  { id: 'lesson-1-4', number: '1-4', chapterNumber: 1, title: 'القضايا الأخلاقية المتعلقة بالذكاء الاصطناعي', startPage: 24, endPage: 30 },
  { id: 'lesson-2-1', number: '2-1', chapterNumber: 2, title: 'تقنيات التشفير والمصادقة', startPage: 31, endPage: 37 },
  { id: 'lesson-2-2', number: '2-2', chapterNumber: 2, title: 'تصميم أمن الشبكات', startPage: 38, endPage: 43 },
  { id: 'lesson-2-3', number: '2-3', chapterNumber: 2, title: 'الاستجابة للحوادث وإدارة المخاطر', startPage: 44, endPage: 49 },
  { id: 'lesson-3-1', number: '3-1', chapterNumber: 3, title: 'البنية العامة لتطبيقات الويب', startPage: 50, endPage: 55 },
  { id: 'lesson-3-2', number: '3-2', chapterNumber: 3, title: 'طرق اتصال تطبيقات الويب', startPage: 56, endPage: 61 },
  { id: 'lesson-3-3', number: '3-3', chapterNumber: 3, title: 'أساسيات تقنية الواجهة الأمامية', startPage: 62, endPage: 67 },
  { id: 'lesson-4-1', number: '4-1', chapterNumber: 4, title: 'أنواع الوسائط وخصائصها', startPage: 68, endPage: 73 },
  { id: 'lesson-4-2', number: '4-2', chapterNumber: 4, title: 'تصميم المعلومات وتجربة المستخدم للمواقع الإلكترونية', startPage: 74, endPage: 80 },
  { id: 'lesson-4-3', number: '4-3', chapterNumber: 4, title: 'طرق تقييم المواقع الإلكترونية', startPage: 81, endPage: 86 },
  { id: 'lesson-4-4', number: '4-4', chapterNumber: 4, title: 'عملية التحسين التكراري للمواقع الإلكترونية', startPage: 87, endPage: 93 },
];

console.log('Extracting Canonical Textbook Baseline Specification (Phase 0)...');

const baselineLessons = [];
const allRelationships = [];

for (const def of LESSON_DEFS) {
  const atomicItems = [];
  const rawPages = [];

  for (let p = def.startPage; p <= def.endPage; p++) {
    const pageData = fullText[p];
    if (pageData && pageData.text) {
      rawPages.push({ page: p, text: pageData.text });
    }
  }

  let objIdx = 1;
  let secIdx = 1;
  let defIdx = 1;
  let figIdx = 1;
  let calloutIdx = 1;
  let examIdx = 1;
  let sumIdx = 1;

  rawPages.forEach(({ page, text }) => {
    const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 0);

    blocks.forEach((block, blockIndex) => {
      const hash = computeHash(block);
      const loc = { page, blockIndex, sourceHash: hash };

      // 1. Objectives detection (only real bullet lines under أهداف التعلم)
      if (block.includes('أهداف التعلم') || (page === def.startPage && block.includes('•'))) {
        const lines = block.split('\n').filter(l => l.includes('•') || l.includes('–') || l.includes('ـ'));
        lines.forEach(line => {
          const clean = line.replace(/^[•\-\–\s]+/, '').trim();
          if (clean.length > 10 && !clean.includes('أهداف التعلم') && !clean.includes('الدرس')) {
            atomicItems.push({
              id: `L${def.number}.OBJ-${String(objIdx++).padStart(2, '0')}`,
              lessonId: def.id,
              type: 'objective',
              title: `هدف تعلم ${objIdx - 1}`,
              content: clean,
              location: loc
            });
          }
        });
      }

      // 2. Core idea & Key question
      if (block.includes('الفكرة الأساسية:') || block.includes('الفكرة الرئيسة:')) {
        const clean = block.replace(/.*(?:الفكرة الأساسية:|الفكرة الرئيسة:)\s*/s, '').trim();
        if (clean.length > 5 && !atomicItems.some(i => i.id === `L${def.number}.CORE-01`)) {
          atomicItems.push({
            id: `L${def.number}.CORE-01`,
            lessonId: def.id,
            type: 'core_idea',
            title: 'الفكرة الأساسية للدرس',
            content: clean.split('\n')[0].trim(),
            location: loc
          });
        }
      }

      if (block.includes('السؤال الرئيسي') || block.includes('السؤال الجوهري')) {
        const clean = block.replace(/.*(?:السؤال الرئيسي:?|السؤال الجوهري:?)\s*/s, '').trim();
        if (clean.length > 5 && !atomicItems.some(i => i.id === `L${def.number}.QUESTION-01`)) {
          atomicItems.push({
            id: `L${def.number}.QUESTION-01`,
            lessonId: def.id,
            type: 'key_question',
            title: 'السؤال الرئيسي للدرس',
            content: clean.split('\n')[0].trim(),
            location: loc
          });
        }
      }

      // 3. Learning Path (مسار التعلم)
      if ((block.includes('مسار التعلم') || block.includes('ّلمّمسار التع')) && !atomicItems.some(i => i.id === `L${def.number}.PATH-01`)) {
        atomicItems.push({
          id: `L${def.number}.PATH-01`,
          lessonId: def.id,
          type: 'learning_path',
          title: 'مسار التعلم المنهجي',
          content: block,
          location: loc
        });

        const prevMatch = block.match(/في القسم السابق \(([^)]+)\) تعلمت ([^\.\n]+)/);
        if (prevMatch) {
          const targetLessonNum = prevMatch[1].trim();
          allRelationships.push({
            id: `REL-L${def.number}-L${targetLessonNum}-BUILDS_ON`,
            from: `L${def.number}`,
            to: `L${targetLessonNum}`,
            type: 'BUILDS_ON',
            origin: 'BOOK_EXPLICIT',
            evidence: { page, blockIndex, quote: prevMatch[0] }
          });
        }
      }

      // 4. Section headings detection: (1), (2), (3), or 1., 2., 3.
      const isSecHeader = block.match(/(?:^|\n)\s*(?:\(([1-9])\)|\.([1-9])|([1-9])\.)\s*([^\n]{3,60})/);
      if (isSecHeader && !block.includes('أهداف') && !block.includes('الخالصة') && !block.includes('السؤال')) {
        const secNum = isSecHeader[1] || isSecHeader[2] || isSecHeader[3];
        const secTitle = isSecHeader[4].replace(/[\(\)\.\—]/g, '').trim();
        if (secTitle.length > 3 && !atomicItems.some(i => i.id === `L${def.number}.SEC-${String(secNum).padStart(2, '0')}`)) {
          atomicItems.push({
            id: `L${def.number}.SEC-${String(secNum).padStart(2, '0')}`,
            lessonId: def.id,
            type: 'section',
            title: secTitle,
            content: block,
            location: loc
          });
        }
      }

      // 5. Definitions / Key Concepts
      if (block.includes('مصطلحات أساسية') || block.includes('المفاهيم الأساسية:')) {
        const lines = block.split('\n').filter(l => (l.includes('—') || l.includes(':')) && !l.includes('مصطلحات أساسية') && !l.includes('المفاهيم الأساسية'));
        lines.forEach(line => {
          const clean = line.trim();
          if (clean.length > 5) {
            atomicItems.push({
              id: `L${def.number}.DEF-${String(defIdx++).padStart(2, '0')}`,
              lessonId: def.id,
              type: 'definition',
              title: `مصطلح أساسي ${defIdx - 1}`,
              content: clean,
              location: loc
            });
          }
        });
      }

      // 6. Callouts ("توقّف وفكّر")
      if (block.includes('ّكرّّقف وفّتو') || block.includes('توقف وفكر') || block.includes('💡')) {
        const clean = block.replace(/.*(?:ّكرّّقف وفّتو|توقف وفكر|💡)\s*/s, '').trim();
        if (clean.length > 10) {
          atomicItems.push({
            id: `L${def.number}.CALLOUT-${String(calloutIdx++).padStart(2, '0')}`,
            lessonId: def.id,
            type: 'callout',
            title: `توقّف وفكّر ${calloutIdx - 1}`,
            content: clean,
            location: loc
          });
        }
      }

      // 7. Figures / Diagrams
      if (block.includes('الشكل') && (block.includes('مخطط') || block.match(/الشكل\s+[1-4]\.[1-4]\.[1-9]/))) {
        const figMatch = block.match(/الشكل\s+[1-4]\.[1-4]\.[1-9]/);
        if (!atomicItems.some(i => i.id === `L${def.number}.FIG-01`)) {
          atomicItems.push({
            id: `L${def.number}.FIG-${String(figIdx++).padStart(2, '0')}`,
            lessonId: def.id,
            type: 'figure',
            title: figMatch ? figMatch[0] : `شكل توضيحي ${figIdx - 1}`,
            content: block,
            location: loc
          });
        }
      }

      // 8. Exam questions
      if ((block.includes('نمط االمتحان') || block.includes('نمط الامتحان') || block.includes('📝')) && !atomicItems.some(i => i.id === `L${def.number}.EXAM-01`)) {
        atomicItems.push({
          id: `L${def.number}.EXAM-01`,
          lessonId: def.id,
          type: 'exam_question',
          title: 'سؤال على نمط الامتحان',
          content: block.replace(/.*(?:نمط االمتحان على سؤال|نمط الامتحان على سؤال|📝)\s*/s, '').trim(),
          location: loc
        });
      }

      // 9. Task / Engineer challenge
      if ((block.includes('ط ّبق ما تعلمته') || block.includes('طبق ما تعلمته') || block.includes('🌍')) && !atomicItems.some(i => i.id === `L${def.number}.TASK-01`)) {
        atomicItems.push({
          id: `L${def.number}.TASK-01`,
          lessonId: def.id,
          type: 'task',
          title: 'طبّق ما تعلمته',
          content: block.replace(/.*(?:ط ّبق ما تعلمته|طبق ما تعلمته|🌍)\s*/s, '').trim(),
          location: loc
        });
      }

      if ((block.includes('قرر ثم كمهندس') || block.includes('فكر كمهندس') || block.includes('⚙️')) && !atomicItems.some(i => i.id === `L${def.number}.ENG-01`)) {
        atomicItems.push({
          id: `L${def.number}.ENG-01`,
          lessonId: def.id,
          type: 'engineer_challenge',
          title: 'فكر كمهندس: ابحث ثم قرر',
          content: block.replace(/.*(?:قرر ثم كمهندس|فكر كمهندس|⚙️)\s*/s, '').trim(),
          location: loc
        });
      }

      // 10. Summary
      if ((block.includes('الخالصة⭐') || block.includes('الخلاصة⭐') || block.includes(':ّكرّتذ') || block.includes(':تذكر')) && !atomicItems.some(i => i.id === `L${def.number}.SUM-01`)) {
        atomicItems.push({
          id: `L${def.number}.SUM-01`,
          lessonId: def.id,
          type: 'summary_point',
          title: 'خلاصة الدرس',
          content: block.replace(/.*(?:الخالصة⭐|الخلاصة⭐|:ّكرّتذ|:تذكر)\s*/s, '').trim(),
          location: loc
        });
      }
    });
  });

  // Explicit curricular continuity links for lesson-1-2
  if (def.number === '1-2') {
    allRelationships.push({
      id: 'REL-L1-2-L1-1-PREREQUISITE',
      from: 'L1-2.SEC-01',
      to: 'L1-1.SEC-01',
      type: 'PREREQUISITE',
      origin: 'BOOK_EXPLICIT',
      evidence: {
        page: 13,
        quote: 'في القسم السابق (1-1) تعلمت كيف تطورت تكنولوجيا المعلومات وغيرت المجتمع.'
      }
    });
    allRelationships.push({
      id: 'REL-L1-2-L1-3-BUILDS_ON',
      from: 'L1-2.SEC-05',
      to: 'L1-3.SEC-01',
      type: 'BUILDS_ON',
      origin: 'BOOK_EXPLICIT',
      evidence: {
        page: 13,
        quote: 'في القسم التالي (1-3) ستتعلم كيف تستخدم تقنيات الذكاء الاصطناعي هذه في المجتمع الواقعي.'
      }
    });
  }

  baselineLessons.push({
    id: def.id,
    number: def.number,
    chapterNumber: def.chapterNumber,
    title: def.title,
    pageRange: `${def.startPage} - ${def.endPage}`,
    totalAtomicItems: atomicItems.length,
    atomicItems
  });
}

const baselineSpec = {
  meta: {
    title: 'Textbook Canonical Baseline Specification',
    sourceFile: 'Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json',
    totalPages: 95,
    totalLessons: baselineLessons.length,
    generatedAt: new Date().toISOString(),
    hashAlgorithm: 'sha256-12'
  },
  lessons: baselineLessons,
  relationships: allRelationships
};

const outputPath = path.resolve('src/data/curriculum-baseline-spec.json');
fs.writeFileSync(outputPath, JSON.stringify(baselineSpec, null, 2), 'utf-8');

console.log(`✅ Baseline extraction completed successfully!`);
console.log(`Saved canonical baseline to: ${outputPath}`);
console.log(`Total Lessons: ${baselineLessons.length}`);
console.log(`Total Relationships: ${allRelationships.length}`);

baselineLessons.forEach(l => {
  console.log(`  Lesson ${l.number} (${l.id}): ${l.totalAtomicItems} atomic items across pages ${l.pageRange}`);
});
