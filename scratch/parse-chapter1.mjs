import fs from 'fs';

const content = fs.readFileSync('book-sources/term-1/05-canonical-data/authored/chapter1.json', 'utf8');

// The file defines:
// add(qid, qtype, lessons, question, options=None, answer=None, explanation=None, model_answer=None)
// Since it's valid Python syntax, we can write a Python-to-JSON evaluator or regex parser in JS.

// Let's create an evaluator by simulating Python in JS:
// Replace Python None with null, True with true, False with false
const Q = [];
function add(qid, qtype, lessons, question, options = null, answer = null, explanation = null, model_answer = null) {
  const item = { id: qid, type: qtype, lessons, question };
  if (options !== null && options !== undefined) item.options = options;
  if (answer !== null && answer !== undefined) item.answer = answer;
  if (explanation !== null && explanation !== undefined) item.explanation = explanation;
  if (model_answer !== null && model_answer !== undefined) item.modelAnswer = model_answer;
  Q.push(item);
}

// Convert python file to JS:
// 1. replace `model_answer=` with positional or handle kwargs
// 2. handle comments #
let jsCode = content
  .replace(/#.*$/gm, '')
  .replace(/\bNone\b/g, 'null')
  .replace(/\bTrue\b/g, 'true')
  .replace(/\bFalse\b/g, 'false')
  .replace(/model_answer\s*=/g, 'null, null, null, ');

// We don't need the header (import json, def add) or footer (output = ..., with open...)
const addStartIndex = jsCode.indexOf('add("Q001"');
const outputIndex = jsCode.indexOf('output =');
const body = jsCode.substring(addStartIndex, outputIndex !== -1 ? outputIndex : undefined);

const fn = new Function('add', body);
fn(add);

console.log('Successfully parsed questions count:', Q.length);
const types = {};
Q.forEach(q => {
  types[q.type] = (types[q.type] || 0) + 1;
});
console.log('Types:', types);

const reviewQuestions = Q.filter(q => q.id >= 'Q061' && q.id <= 'Q090');
console.log('Review MCQs (Q061-Q090):', reviewQuestions.length);

const allReviewQuestions = Q.filter(q => q.lessons.length > 1 || q.id >= 'Q061');
console.log('All multi-lesson or review questions:', allReviewQuestions.length);
