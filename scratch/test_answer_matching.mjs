import fs from 'fs';
import { extractRawQuestionsForLesson, fixArabicLigatures } from '../scripts/extract-official-assessments.mjs';

const canonicalBook = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/book.json', 'utf8'));
const glossary = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/glossary.json', 'utf8'));

const def1 = { id: 'lesson-1-1', number: '1-1', chapterNumber: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', startPage: 3, endPage: 9, textbookPages: [4, 11] };

const qs = extractRawQuestionsForLesson(def1);
const mcqs = qs.filter(q => q.type === 'mcq');

console.log('Testing answer matching on Lesson 1-1 MCQs (' + mcqs.length + ' questions)...');

const concepts = canonicalBook.chapters[0].lessons[0].keyConcepts;

mcqs.forEach((m, idx) => {
  console.log(`\nQ${idx + 1}: ${m.question}`);
  m.options.forEach((opt, oIdx) => {
    console.log(`   [${['أ', 'ب', 'ج', 'د'][oIdx]}] ${opt}`);
  });
});
