import fs from 'fs';
import path from 'path';
import { fixExtractedArabicText } from '../arabic-cleaner.mjs';
import { cleanArabicTypography } from '../clean-arabic-text.mjs';
const cleanArabicText = (text) => cleanArabicTypography(fixExtractedArabicText(text));
import { CHAPTER_1_ANSWERS } from './chapter1.mjs';
import { chapter2Answers } from './chapter2.mjs';
import { chapter3Answers } from './chapter3.mjs';
import { chapter4Answers } from './chapter4.mjs';

const OFFICIAL_DIR = 'book-sources/term-1/05-canonical-data/official/official-assessments';
const ALL_ASSESSMENTS_PATH = 'book-sources/term-1/05-canonical-data/official/all-assessments.json';

const lessonFiles = [
  'lesson-1-1.json',
  'lesson-1-2.json',
  'lesson-1-3.json',
  'lesson-1-4.json',
  'lesson-2-1.json',
  'lesson-2-2.json',
  'lesson-2-3.json',
  'lesson-3-1.json',
  'lesson-3-2.json',
  'lesson-3-3.json',
  'lesson-4-1.json',
  'lesson-4-2.json',
  'lesson-4-3.json',
  'lesson-4-4.json'
];

let totalQuestionsUpdated = 0;
let totalMcqsChecked = 0;
let totalEssaysUpdated = 0;
const allQuestionsList = [];
const allLessonsList = [];

console.log('=== Applying Comprehensive Model Answers Across All 14 Lessons ===\n');

for (const file of lessonFiles) {
  const filePath = path.join(OFFICIAL_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }

  const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const lessonId = lessonData.lessonId;

  // Answer sets can be under lessonId or direct (as in Chapter 1)
  const chapterSet = chapter2Answers[lessonId] || chapter3Answers[lessonId] || chapter4Answers[lessonId];

  let fileUpdatedCount = 0;

  for (const q of lessonData.questions) {
    // Clean Arabic text
    q.question = cleanArabicText(q.question);
    if (q.options) {
      q.options = q.options.map(opt => cleanArabicText(opt));
    }

    // Lookup in chapterSet or CHAPTER_1_ANSWERS
    const answerInfo = (chapterSet && chapterSet[q.id]) || CHAPTER_1_ANSWERS[q.id];

    if (answerInfo) {
      // Update Model Answer
      if (answerInfo.modelAnswer) {
        q.modelAnswer = cleanArabicText(answerInfo.modelAnswer.trim());
        fileUpdatedCount++;
        totalQuestionsUpdated++;
        if (q.type === 'essay') {
          totalEssaysUpdated++;
        }
      }

      // Update Citation
      if (answerInfo.textbookCitation) {
        q.textbookCitation = {
          page: answerInfo.textbookCitation.page,
          topic: cleanArabicText(answerInfo.textbookCitation.topic),
          exactText: answerInfo.textbookCitation.exactText 
            ? cleanArabicText(answerInfo.textbookCitation.exactText)
            : cleanArabicText(answerInfo.textbookCitation.topic)
        };
      }

      // Update MCQ Answer
      if (q.type === 'mcq') {
        totalMcqsChecked++;
        if (typeof answerInfo.correctAnswerIndex === 'number') {
          q.correctAnswerIndex = answerInfo.correctAnswerIndex;
          if (answerInfo.correctAnswer) {
            q.correctAnswer = cleanArabicText(answerInfo.correctAnswer);
            if (q.options) {
              q.options[q.correctAnswerIndex] = q.correctAnswer;
            }
          } else if (q.options && q.options[q.correctAnswerIndex]) {
            q.correctAnswer = q.options[q.correctAnswerIndex];
          }
        }
      }
    } else {
      console.warn(`Warning: Question ${q.id} in ${lessonId} has no custom model answer entry!`);
    }

    allQuestionsList.push(q);
  }

  // Save updated lesson file
  fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2), 'utf8');
  allLessonsList.push(lessonData);
  console.log(`✓ ${lessonId}: Updated ${fileUpdatedCount} / ${lessonData.questions.length} questions.`);
}

// Write combined all-assessments.json for official root
const combinedData = {
  metadata: {
    title: 'التقييمات والواجبات الرسمية - كتاب الحوسبة والذكاء الاصطناعي - الفصل الدراسي الأول',
    academicYear: '2024/2025',
    totalLessons: lessonFiles.length,
    totalQuestions: allQuestionsList.length,
    totalMcqs: allQuestionsList.filter(q => q.type === 'mcq').length,
    totalEssays: allQuestionsList.filter(q => q.type === 'essay').length,
    qualityStandard: 'صياغة نموذجية شاملة مستندة إلى فهم السؤال ونص الكتاب الأصلي',
    updatedAt: new Date().toISOString()
  },
  questions: allQuestionsList
};

fs.writeFileSync(ALL_ASSESSMENTS_PATH, JSON.stringify(combinedData, null, 2), 'utf8');
console.log(`\n✓ Combined all assessments written to ${ALL_ASSESSMENTS_PATH}`);

// Also write canonical lessons array to official-assessments/all-assessments.json
const officialAssessmentsFile = path.join(OFFICIAL_DIR, 'all-assessments.json');
fs.writeFileSync(officialAssessmentsFile, JSON.stringify(allLessonsList, null, 2), 'utf8');
console.log(`✓ Canonical lessons array written to ${officialAssessmentsFile}`);

console.log(`Summary: Total Updated: ${totalQuestionsUpdated} | Essays: ${totalEssaysUpdated} | MCQs Checked: ${totalMcqsChecked} | Total: ${allQuestionsList.length}`);
