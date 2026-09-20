import fs from 'fs';

const filePath = 'book-sources/term-1/05-canonical-data/authored/deep-questions/chapter-1/unit-1-review.json';
const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

questions.forEach((q, idx) => {
  q.source = {
    term: 1,
    lessonId: "chapter-1-review",
    pages: [4, 30],
    primaryPage: 4,
    sourceType: "authored-unit-review",
    sourceFile: "chapter1.json",
    authoredQuestionId: `Q0${61 + idx}`,
  };
});

fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
console.log('Updated unit-1-review.json with sourceFile: chapter1.json for', questions.length, 'questions');
