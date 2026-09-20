import fs from 'fs';

const content = fs.readFileSync('book-sources/term-1/05-canonical-data/authored/chapter1.json', 'utf8');

const Q = [];
function add(qid, qtype, lessons, question, options = null, answer = null, explanation = null, model_answer = null) {
  const item = { id: qid, type: qtype, lessons, question };
  if (options !== null && options !== undefined) item.options = options;
  if (answer !== null && answer !== undefined) item.answer = answer;
  if (explanation !== null && explanation !== undefined) item.explanation = explanation;
  if (model_answer !== null && model_answer !== undefined) item.modelAnswer = model_answer;
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

const output = {
  subject: "البرمجة والذكاء الاصطناعي - الصف الثاني الثانوي - الفصل الدراسي الأول",
  coverage: "الفصل الأول: الدروس من 1-1 إلى 1-4",
  difficultyLevel: "صعب جدًا / مستوى الطالب الممتاز - أسئلة تحليلية وربط بين الدروس",
  totalQuestions: Q.length,
  breakdown: {
    mcq: Q.filter(q => q.type === 'mcq').length,
    true_false: Q.filter(q => q.type === 'true_false').length,
    essay: Q.filter(q => q.type === 'essay').length,
  },
  questions: Q,
};

const jsonStr = JSON.stringify(output, null, 2);
const lines = jsonStr.split('\n');
console.log('Total JSON lines:', lines.length);
console.log('Around line 1775:');
for (let i = 1765; i <= 1785 && i < lines.length; i++) {
  console.log(`${i}: ${lines[i]}`);
}
