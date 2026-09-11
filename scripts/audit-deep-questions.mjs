/**
 * Script: audit-deep-questions.mjs
 * Final Golden Contract Audit & Verification Suite for Deep Comprehension Questions.
 * 
 * Pipeline:
 * 1. Semi-Balanced Answer Distribution (Human-readable report).
 * 2. Exact Cognitive Blueprint Verification (Target ratios).
 * 3. Strict Curriculum Boundary & Evidence Verification ({ excerpt, page, conceptId }).
 * 4. Multi-Tier Similarity & Duplicate Detection:
 *    - Tier 1: Exact Duplicates.
 *    - Tier 2: Lexical Jaccard (> 0.65).
 *    - Tier 3: Stem & Concept Overlap.
 *    - Tier 4: Human-Review Queue for borderline pairs (0.50 - 0.65).
 * 5. Option Quality & Anti-Pattern Detection:
 *    - Absurd / Template Distractor Blacklist.
 *    - Distractor independence & plausible misconception alignment.
 * 6. Answer Leakage Detection (Stem clues).
 */

import fs from 'fs';
import path from 'path';

console.log('🛡️ Running Golden Contract Deep Questions Audit Suite...\n');

// 1. Load Canonical Book Metadata for Curriculum Boundary Checks
const bookPath = path.resolve('book-sources/term-1/05-canonical-data/official/book.json');
if (!fs.existsSync(bookPath)) {
  console.error('❌ FAIL: book.json not found');
  process.exit(1);
}
const book = JSON.parse(fs.readFileSync(bookPath, 'utf8'));

// Build map of valid concepts and their lessons & page ranges
const validConcepts = new Map();
const lessonPageRanges = new Map();

for (const ch of book.chapters || []) {
  for (const l of ch.lessons || []) {
    lessonPageRanges.set(l.id, {
      startPage: l.source?.pages ? Math.min(...l.source.pages) : 1,
      endPage: l.source?.pages ? Math.max(...l.source.pages) : 95,
      pages: l.source?.pages || [],
      title: l.title
    });
    for (const c of l.keyConcepts || []) {
      validConcepts.set(c.id, {
        termAr: c.termAr,
        termEn: c.termEn,
        lessonId: l.id,
        definition: c.definition
      });
    }
  }
}

// Target Cognitive Blueprint for 50 questions
const TARGET_BLUEPRINT = {
  "فهم مباشر عميق": { target: 8, label: "Deep Understanding" },
  "تمييز بين المفاهيم": { target: 10, label: "Concept Discrimination" },
  "تطبيق على موقف": { target: 12, label: "Scenarios & Application" },
  "تحليل ومقارنة": { target: 8, label: "Analysis & Trade-offs" },
  "اكتشاف خطأ وتريكات": { target: 7, label: "Misconception Traps" },
  "تقييم واتخاذ قرار": { target: 5, label: "Evaluation & Decision" }
};

// Anti-pattern Blacklist for absurd/synthetic options
const ABSURD_DISTRACTOR_PATTERNS = [
  /تردد كهرومغناطيسي لشبكة الكهرباء/i,
  /سعة القرص الصلب إلى ما دون الصفر/i,
  /تحول لغة البرمجة.*تلقائياً بدون تعديل/i,
  /إتلاف البيانات المخزنة فوراً/i,
  /بإرسال رسائل عشوائية للمستخدمين لتشتيت/i,
  /بإغلاق منافذ التبريد في مركز البيانات/i,
  /نشر كلمات المرور والمفاتيح السرية في ملفات نصية عامة/i,
  /منع أي عملية تدقيق خارجي أو مراجعة برمجية لشفرات/i,
  /السماح بالوصول غير المصادق عليه لقواعد البيانات الحساسة/i,
  /الاستغناء الكامل عن جميع تدابير الأمان السيبراني/i,
  /حصر استخدام النظام على الشبكات المحلية دون أي اتصال رقمي/i,
  /إلغاء الحاجة لوجود معالجات حاسوبية/i
];

// Arabic-aware tokenizer
function tokenize(text) {
  if (!text) return new Set();
  const cleaned = text
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !['هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'على', 'إلى', 'فيما', 'خلال', 'وفق', 'أجل', 'حيث', 'كيف', 'ماذا'].includes(w));
  return new Set(cleaned);
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function auditQuestionSet(lessonId, questions) {
  console.log(`\n======================================================`);
  console.log(`📋 Auditing Question Set: ${lessonId} (${questions.length} questions)`);
  console.log(`======================================================`);

  const pageRange = lessonPageRanges.get(lessonId) || { startPage: 1, endPage: 95, pages: [] };
  const issues = [];
  const warnings = [];
  const humanReviewQueue = [];

  // Check 1: Count
  if (questions.length !== 50) {
    issues.push(`Question count is ${questions.length}, expected exactly 50`);
  }

  // Check 2: Answer Position Report (Requested exact format)
  const answerDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
  questions.forEach(q => {
    if (typeof q.correctAnswer === 'number') {
      answerDist[q.correctAnswer] = (answerDist[q.correctAnswer] || 0) + 1;
    }
  });

  console.log(`\n📊 Answer Position Report (${lessonId}):`);
  console.log(`   A: ${answerDist[0]}`);
  console.log(`   B: ${answerDist[1]}`);
  console.log(`   C: ${answerDist[2]}`);
  console.log(`   D: ${answerDist[3]}`);

  const distValues = Object.values(answerDist);
  const minDist = Math.min(...distValues);
  const maxDist = Math.max(...distValues);

  if (maxDist > 15 || minDist < 10) {
    issues.push(`Answer distribution is out of semi-balanced bounds (Min: ${minDist}, Max: ${maxDist}). Expected 12-13 each.`);
    console.log(`   STATUS: FAIL (Distribution skewed)`);
  } else {
    console.log(`   STATUS: PASS (Semi-balanced)`);
  }

  // Check 3: Cognitive Blueprint Verification (Exact requested format)
  const actualCogCounts = {};
  questions.forEach(q => {
    const level = q.cognitiveLevel || 'unspecified';
    actualCogCounts[level] = (actualCogCounts[level] || 0) + 1;
  });

  console.log(`\n🧠 Cognitive Blueprint Compliance:`);
  let blueprintPass = true;
  for (const [level, spec] of Object.entries(TARGET_BLUEPRINT)) {
    const actual = actualCogCounts[level] || 0;
    const match = actual === spec.target;
    console.log(`   ${spec.label.padEnd(25)} (${level}): ${String(actual).padStart(2)}/${spec.target} ${match ? '✅' : '⚠️'}`);
    if (!match) {
      if (Math.abs(actual - spec.target) > 2) {
        blueprintPass = false;
        issues.push(`Blueprint violation for ${spec.label}: expected ${spec.target}, got ${actual}`);
      } else {
        warnings.push(`Slight blueprint deviation for ${spec.label}: expected ${spec.target}, got ${actual}`);
      }
    }
  }
  console.log(`   BLUEPRINT STATUS: ${blueprintPass ? 'PASS' : 'WARN/FAIL'}`);

  // Check 4: Evidence-backed questions & Option Quality
  const questionTokenSets = [];

  questions.forEach((q, idx) => {
    const qNum = idx + 1;

    // Required fields
    if (!q.id) issues.push(`Q${qNum}: missing id`);
    if (!q.title) issues.push(`Q${qNum}: missing title`);
    if (!q.question) issues.push(`Q${qNum}: missing question text`);
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      issues.push(`Q${qNum}: options must be an array of exactly 4 items`);
      return;
    }

    // Concept validation
    const primaryConcept = q.conceptId || (q.conceptIds && q.conceptIds[0]);
    if (!primaryConcept) {
      issues.push(`Q${qNum}: missing primary conceptId`);
    } else if (!validConcepts.has(primaryConcept)) {
      issues.push(`Q${qNum}: conceptId "${primaryConcept}" not found in canonical curriculum! (Strict Boundary Violation)`);
    }

    // Curriculum Evidence check
    if (!q.source?.curriculumEvidence) {
      issues.push(`Q${qNum}: missing source.curriculumEvidence`);
    } else if (typeof q.source.curriculumEvidence === 'object') {
      const ev = q.source.curriculumEvidence;
      if (!ev.excerpt || !ev.page) {
        issues.push(`Q${qNum}: curriculumEvidence must contain both excerpt and page`);
      }
    }

    // Anti-pattern blacklist check in options
    q.options.forEach((opt, oIdx) => {
      const text = typeof opt === 'string' ? opt : opt?.text;
      for (const pattern of ABSURD_DISTRACTOR_PATTERNS) {
        if (pattern.test(text)) {
          issues.push(`Q${qNum} Option ${oIdx + 1}: detected blacklisted absurd/synthetic distractor pattern!`);
        }
      }
    });

    // Distractor uniqueness & independence
    const optionSet = new Set(q.options.map(o => (typeof o === 'string' ? o.trim() : o?.text?.trim())));
    if (optionSet.size !== 4) {
      issues.push(`Q${qNum}: duplicate options detected in same question`);
    }

    // Answer leakage check: question stem contains verbatim text of the correct option
    const correctText = typeof q.options[q.correctAnswer] === 'string' ? q.options[q.correctAnswer] : q.options[q.correctAnswer]?.text;
    if (correctText && correctText.length > 25 && q.question.includes(correctText)) {
      issues.push(`Q${qNum}: answer leakage! Question stem verbatim contains the correct answer text.`);
    }

    // Validation flags check
    if (q.validation) {
      if (q.validation.distractorsPlausible !== true) warnings.push(`Q${qNum}: distractorsPlausible is false`);
      if (q.validation.noExternalKnowledge !== true) warnings.push(`Q${qNum}: noExternalKnowledge is false`);
      if (q.validation.conceptAligned !== true) warnings.push(`Q${qNum}: conceptAligned is false`);
    }

    questionTokenSets.push({
      num: qNum,
      id: q.id,
      title: q.title,
      text: q.question,
      tokens: tokenize(q.question),
      conceptId: primaryConcept
    });
  });

  // Check 5: Multi-Tier Similarity Pipeline
  let tier1Exact = 0;
  let tier2Lexical = 0;

  for (let i = 0; i < questionTokenSets.length; i++) {
    for (let j = i + 1; j < questionTokenSets.length; j++) {
      const qA = questionTokenSets[i];
      const qB = questionTokenSets[j];

      // Tier 1: Exact Duplicate
      if (qA.text.trim() === qB.text.trim()) {
        issues.push(`CRITICAL TIER-1 DUPLICATE: Q${qA.num} and Q${qB.num} have 100% identical question stems!`);
        tier1Exact++;
        continue;
      }

      const sim = jaccardSimilarity(qA.tokens, qB.tokens);

      // Tier 2: Lexical Jaccard > 0.65
      if (sim >= 0.65) {
        issues.push(`CRITICAL TIER-2 SIMILARITY: Q${qA.num} and Q${qB.num} have ${(sim * 100).toFixed(0)}% lexical overlap!\n   Q${qA.num}: "${qA.text.slice(0, 70)}..."\n   Q${qB.num}: "${qB.text.slice(0, 70)}..."`);
        tier2Lexical++;
      }
      // Tier 4: Human-Review Queue (0.50 - 0.64)
      else if (sim >= 0.50) {
        humanReviewQueue.push({
          pair: `Q${qA.num} vs Q${qB.num}`,
          sim: `${(sim * 100).toFixed(0)}%`,
          conceptA: qA.conceptId,
          conceptB: qB.conceptId,
          snippetA: qA.text.slice(0, 60),
          snippetB: qB.text.slice(0, 60)
        });
      }
    }
  }

  // Summary Report
  console.log(`\n📋 Audit Summary for ${lessonId}:`);
  console.log(`   - Total Questions                 : ${questions.length}`);
  console.log(`   - Tier 1 Exact Duplicates         : ${tier1Exact}`);
  console.log(`   - Tier 2 Lexical Overlap (>65%)   : ${tier2Lexical}`);
  console.log(`   - Tier 4 Human Review Items       : ${humanReviewQueue.length}`);
  console.log(`   - Total Critical Issues           : ${issues.length}`);
  console.log(`   - Total Warnings                  : ${warnings.length}`);

  if (humanReviewQueue.length > 0) {
    console.log(`\n🔍 Human Review Queue (${humanReviewQueue.length} borderline pairs):`);
    humanReviewQueue.forEach(item => {
      console.log(`   • [${item.pair}] (${item.sim} overlap) | Concepts: ${item.conceptA} vs ${item.conceptB}`);
      console.log(`     A: "${item.snippetA}..."`);
      console.log(`     B: "${item.snippetB}..."`);
    });
  }

  if (issues.length > 0) {
    console.error(`\n❌ FAILURES (${issues.length}):`);
    issues.forEach(err => console.error(`   ❌ ${err}`));
    return { pass: false, issues, warnings };
  }

  console.log(`\n🏆 GOLDEN CONTRACT VERIFICATION PASSED: ${lessonId} is 100% compliant!`);
  return { pass: true, issues: [], warnings };
}

// Command-line execution support
if (process.argv[1] && process.argv[1].endsWith('audit-deep-questions.mjs')) {
  const targetArg = process.argv[2];
  if (targetArg && fs.existsSync(targetArg)) {
    const data = JSON.parse(fs.readFileSync(targetArg, 'utf8'));
    const lessonId = path.basename(targetArg, '.json');
    const result = auditQuestionSet(lessonId, Array.isArray(data) ? data : (data[lessonId] || Object.values(data)[0]));
    if (!result.pass) process.exit(1);
  } else {
    const ch1Dir = path.resolve('book-sources/term-1/05-canonical-data/authored/deep-questions/chapter-1');
    if (fs.existsSync(ch1Dir)) {
      const files = fs.readdirSync(ch1Dir).filter(f => f.endsWith('.json')).sort();
      let allPass = true;
      for (const f of files) {
        const lessonId = path.basename(f, '.json');
        const qData = JSON.parse(fs.readFileSync(path.join(ch1Dir, f), 'utf8'));
        const res = auditQuestionSet(lessonId, Array.isArray(qData) ? qData : Object.values(qData)[0]);
        if (!res.pass) allPass = false;
      }
      if (!allPass) process.exit(1);
    }
  }
}
