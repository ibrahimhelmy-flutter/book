import fs from 'fs';

// Load unit-1-review.json
const unit1Review = JSON.parse(
  fs.readFileSync('book-sources/term-1/05-canonical-data/authored/deep-questions/chapter-1/unit-1-review.json', 'utf8')
);

// Load parsed from chapter1.json
import { execSync } from 'child_process';
const content = fs.readFileSync('book-sources/term-1/05-canonical-data/authored/chapter1.json', 'utf8');

const Q = [];
function add(qid, qtype, lessons, question, options = null, answer = null, explanation = null, model_answer = null) {
  const item = { id: qid, type: qtype, lessons, question, options, answer, explanation, modelAnswer: model_answer };
  Q.push(item);
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

const jsonQMap = new Map();
Q.forEach(q => jsonQMap.set(q.id, q));

console.log('Unit 1 review count:', unit1Review.length);
let exactMatches = 0;
let mismatches = [];

unit1Review.forEach((uq, idx) => {
  const qid = `Q0${61 + idx}`;
  const jq = jsonQMap.get(qid);
  if (!jq) {
    mismatches.push(`Missing in chapter1.json: ${qid}`);
    return;
  }
  const qMatch = uq.question === jq.question;
  const aMatch = uq.answer === jq.answer;
  const oMatch = JSON.stringify(uq.options) === JSON.stringify(jq.options);
  if (qMatch && aMatch && oMatch) {
    exactMatches++;
  } else {
    mismatches.push({
      qid,
      qMatch,
      aMatch,
      oMatch,
      uq_q: uq.question.substring(0, 30),
      jq_q: jq.question.substring(0, 30),
    });
  }
});

console.log('Exact matches:', exactMatches, '/ 30');
if (mismatches.length > 0) {
  console.log('Mismatches:', mismatches);
}
