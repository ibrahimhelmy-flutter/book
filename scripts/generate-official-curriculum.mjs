import fs from 'fs';
import path from 'path';
import { chapter1 } from '../book-sources/term-1/06-build-modules/chapter1.mjs';
import { chapter2 } from '../book-sources/term-1/06-build-modules/chapter2.mjs';
import { chapter3 } from '../book-sources/term-1/06-build-modules/chapter3.mjs';
import { chapter4 } from '../book-sources/term-1/06-build-modules/chapter4.mjs';
import { getSources } from './sources-config.mjs';

const sources = getSources('term-1');
const allChapters = [chapter1, chapter2, chapter3, chapter4];
const baseDir = sources.officialLessonsDir;

console.log('Building Official Canonical Curriculum Source in:', baseDir);

allChapters.forEach(chapter => {
  const chapterDir = path.join(baseDir, chapter.id);
  if (!fs.existsSync(chapterDir)) {
    fs.mkdirSync(chapterDir, { recursive: true });
  }

  chapter.lessons.forEach(lesson => {
    const pageRangeParts = lesson.pageRange.split('-').map(s => parseInt(s.trim()));
    const startPage = pageRangeParts[0] || 1;
    const endPage = pageRangeParts[1] || startPage;

    const officialBlocks = [];

    // 1. Learning Objectives
    (lesson.learningObjectives || []).forEach((obj, idx) => {
      officialBlocks.push({
        id: `L${lesson.number}.OBJ-${String(idx + 1).padStart(2, '0')}`,
        type: 'objective',
        source: 'كتاب الوزارة الرسمي — جمهورية مصر العربية',
        page: startPage,
        title: `هدف تعلم ${idx + 1}`,
        text: obj.trim()
      });
    });

    // 2. Core Idea
    if (lesson.coreIdea) {
      officialBlocks.push({
        id: `L${lesson.number}.CORE-01`,
        type: 'core_idea',
        source: 'كتاب الوزارة الرسمي — جمهورية مصر العربية',
        page: startPage,
        title: 'الفكرة الأساسية للدرس',
        text: lesson.coreIdea.trim()
      });
    }

    // 3. Key Question
    if (lesson.keyQuestion) {
      officialBlocks.push({
        id: `L${lesson.number}.QUESTION-01`,
        type: 'key_question',
        source: 'كتاب الوزارة الرسمي — جمهورية مصر العربية',
        page: startPage,
        title: 'السؤال الرئيسي للدرس',
        text: lesson.keyQuestion.trim()
      });
    }

    // 4. Key Concepts / Definitions
    (lesson.keyConcepts || []).forEach((concept, idx) => {
      officialBlocks.push({
        id: `L${lesson.number}.CONCEPT-${String(idx + 1).padStart(2, '0')}`,
        type: 'concept',
        source: 'كتاب الوزارة الرسمي — هوامش وخريطة الدرس',
        page: startPage + 1,
        termAr: concept.termAr.trim(),
        termEn: (concept.termEn || '').trim(),
        title: `المفهوم الأساسي: ${concept.termAr}`,
        text: concept.definition.trim()
      });
    });

    // 5. Content Sections
    (lesson.sections || []).forEach((sec, idx) => {
      officialBlocks.push({
        id: `L${lesson.number}.SEC-${String(idx + 1).padStart(2, '0')}`,
        type: 'section',
        source: 'كتاب الوزارة الرسمي — متن الشرح',
        page: startPage + Math.min(idx + 1, endPage - startPage),
        sectionId: sec.id,
        title: sec.title.trim(),
        text: sec.content.trim(),
        hasImage: !!sec.image,
        hasTable: !!sec.table
      });
    });

    // 6. Callouts (توقف وفكر / ملحوظة مهمة)
    (lesson.callouts || []).forEach((c, idx) => {
      officialBlocks.push({
        id: `L${lesson.number}.CALLOUT-${String(idx + 1).padStart(2, '0')}`,
        type: 'callout',
        source: 'كتاب الوزارة الرسمي — صناديق التفكير والهوامش',
        page: startPage + 1 + idx,
        calloutType: c.type,
        title: c.title.trim(),
        text: c.content.trim(),
        question: c.question ? c.question.trim() : undefined
      });
    });

    // 7. Solved Example
    if (lesson.solvedExample) {
      officialBlocks.push({
        id: `L${lesson.number}.EXAMPLE-01`,
        type: 'example',
        source: 'كتاب الوزارة الرسمي — مثال محلول',
        page: endPage - 1,
        title: lesson.solvedExample.title || 'مثال محلول',
        text: (lesson.solvedExample.items || []).map(it => it.questionText || it.text || '').join('\n').trim()
      });
    }

    // 8. Exam Question (سؤال على نمط الامتحان)
    if (lesson.examQuestion) {
      officialBlocks.push({
        id: `L${lesson.number}.EXAM-01`,
        type: 'exam_question',
        source: 'كتاب الوزارة الرسمي — سؤال على نمط الامتحان',
        page: endPage - 1,
        title: lesson.examQuestion.title || 'سؤال على نمط الامتحان',
        text: lesson.examQuestion.questionText ? lesson.examQuestion.questionText.trim() : ''
      });
    }

    // 9. Applied Task (طبق ما تعلمته)
    if (lesson.appliedTask) {
      officialBlocks.push({
        id: `L${lesson.number}.TASK-01`,
        type: 'task',
        source: 'كتاب الوزارة الرسمي — طبق ما تعلمته',
        page: endPage - 1,
        title: lesson.appliedTask.title || 'طبق ما تعلمته',
        text: lesson.appliedTask.description ? lesson.appliedTask.description.trim() : ''
      });
    }

    // 10. Think like an engineer (فكر كمهندس)
    if (lesson.engineerChallenge) {
      officialBlocks.push({
        id: `L${lesson.number}.ENG-01`,
        type: 'engineer_challenge',
        source: 'كتاب الوزارة الرسمي — فكر كمهندس: ابحث ثم قرر',
        page: endPage - 1,
        title: lesson.engineerChallenge.title || 'فكر كمهندس',
        text: lesson.engineerChallenge.scenario ? lesson.engineerChallenge.scenario.trim() : ''
      });
    }

    // 11. Summary (الخلاصة: تذكر)
    if (lesson.summary && lesson.summary.length > 0) {
      officialBlocks.push({
        id: `L${lesson.number}.SUM-01`,
        type: 'summary',
        source: 'كتاب الوزارة الرسمي — الخلاصة: تذكر',
        page: endPage,
        title: 'الخلاصة',
        text: lesson.summary.join('\n').trim()
      });
    }

    const canonicalLessonData = {
      meta: {
        curriculum: "جمهورية مصر العربية - وزارة التربية والتعليم والتعليم الفني",
        subject: "البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي",
        term: "الفصل الدراسي الأول",
        officialSource: "الكتاب المدرسي المعتمد 2026 - 2027",
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        lessonId: lesson.id,
        lessonNumber: lesson.number,
        title: lesson.title,
        englishTitle: lesson.englishTitle || '',
        pageRange: lesson.pageRange,
        startPage,
        endPage,
        totalOfficialBlocks: officialBlocks.length
      },
      officialBlocks
    };

    const filePath = path.join(chapterDir, `${lesson.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(canonicalLessonData, null, 2), 'utf8');
    console.log(`  ✓ Generated ${lesson.number} -> ${filePath} (${officialBlocks.length} canonical blocks)`);
  });
});

console.log('\nCanonical Official Source generated successfully for all 14 lessons.');
