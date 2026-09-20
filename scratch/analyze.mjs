import fs from 'fs';

const content = fs.readFileSync('book-sources/term-1/05-canonical-data/authored/chapter1.json', 'utf8');

const Q = [];
function add(qid, qtype, lessons, question, options = null, answer = null, explanation = null, model_answer = null) {
  Q.push({ id: qid, type: qtype, lessons, question, options, answer, explanation, modelAnswer: model_answer });
}

let jsCode = content
  .replace(/#.*$/gm, '')
  .replace(/\bNone\b/g, 'null')
  .replace(/\bTrue\b/g, 'true')
  .replace(/\bFalse\b/g, 'false')
  .replace(/model_answer\s*=/g, 'null, null, null, ');

const addStartIndex = jsCode.indexOf('add("Q001"');
const outputIndex = jsCode.indexOf('output =');
const body = jsCode.substring(addStartIndex, outputIndex !== -1 ? outputIndex : undefined);

const fn = new Function('add', body);
fn(add);

console.log('Total questions:', Q.length);
console.log('Section A (Q001-Q015): Lesson 1-1, count:', Q.slice(0, 15).length);
console.log('Section B (Q016-Q030): Lesson 1-2, count:', Q.slice(15, 30).length);
console.log('Section C (Q031-Q045): Lesson 1-3, count:', Q.slice(30, 45).length);
console.log('Section D (Q046-Q060): Lesson 1-4, count:', Q.slice(45, 60).length);
console.log('Section E (Q061-Q090): Cross-lesson Unit Review, count:', Q.slice(60, 90).length);
console.log('Section F (Q091-Q100): True/False, count:', Q.slice(90, 100).length);
console.log('Section G (Q101-Q115): Essay with Model Answers, count:', Q.slice(100, 115).length);
