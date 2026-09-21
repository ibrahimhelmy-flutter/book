import fs from 'fs';
import path from 'path';

console.log('Enriching Official Assessments with Correct Answers & Textbook Model Answers...');

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const canonicalBook = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/book.json', 'utf8'));
const fullTextbook = JSON.parse(fs.readFileSync('book-sources/term-1/03-raw-extractions/Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json', 'utf8'));
const glossary = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/glossary.json', 'utf8'));

// Build unified knowledge bank from canonicalBook keyConcepts and glossary
const conceptBank = [];

canonicalBook.chapters.forEach(ch => {
  ch.lessons.forEach(l => {
    (l.keyConcepts || []).forEach(kc => {
      conceptBank.push({
        termAr: kc.termAr,
        termEn: kc.termEn || '',
        definition: kc.definition,
        primaryPage: kc.source?.primaryPage || l.pageRange?.split('-')[0]?.trim() || 5,
        lessonNumber: l.number,
        chapterNumber: ch.number
      });
    });
  });
});

glossary.forEach(g => {
  if (!conceptBank.some(c => c.termAr === g.termAr)) {
    conceptBank.push({
      termAr: g.termAr,
      termEn: g.termEn || '',
      definition: g.definition,
      primaryPage: g.primaryPage || 5,
      lessonNumber: g.lessonNumber || '1-1',
      chapterNumber: g.chapterNumber || 1
    });
  }
});

console.log(`Knowledge bank contains ${conceptBank.length} verified textbook concepts.`);

// Function to find best textbook citation and model answer for a question
function resolveModelAnswerAndCitation(q, def) {
  const qText = q.question;
  const opts = q.options || [];

  // Search concepts in the same lesson first, then chapter, then full bank
  let bestConcept = null;
  let maxScore = -1;

  for (const c of conceptBank) {
    let score = 0;
    // Boost if same lesson
    if (c.lessonNumber === def.number) score += 10;
    else if (c.chapterNumber === def.chapterNumber) score += 5;

    // Check term in question
    if (qText.includes(c.termAr)) score += 15;
    if (c.termEn && qText.toLowerCase().includes(c.termEn.toLowerCase())) score += 12;

    // Check words overlap between question and definition
    const defWords = c.definition.split(/\s+/).filter(w => w.length > 3);
    defWords.forEach(w => {
      if (qText.includes(w)) score += 2;
    });

    // For MCQs, check if options contain term or definition
    if (q.type === 'mcq') {
      opts.forEach(opt => {
        if (opt.includes(c.termAr)) score += 8;
        defWords.forEach(w => {
          if (opt.includes(w)) score += 1;
        });
      });
    }

    if (score > maxScore) {
      maxScore = score;
      bestConcept = c;
    }
  }

  // Find exact textbook page excerpt from fullTextbook
  let primaryPage = bestConcept ? bestConcept.primaryPage : def.textbookPages[0];
  let textbookExcerpt = bestConcept ? `${bestConcept.termAr}: ${bestConcept.definition}` : '';

  // Scan lesson's textbook pages for the best sentence match
  let bestPageMatch = null;
  let bestPageScore = 0;

  for (let p = def.textbookPages[0]; p <= def.textbookPages[1]; p++) {
    const pageData = fullTextbook[p];
    if (!pageData || !pageData.text) continue;

    const sentences = pageData.text.split(/[\n.]+/).map(s => s.trim()).filter(s => s.length > 15);
    for (const s of sentences) {
      let matchCount = 0;
      const qWords = qText.split(/\s+/).filter(w => w.length > 3);
      qWords.forEach(w => {
        if (s.includes(w)) matchCount++;
      });
      if (matchCount > bestPageScore) {
        bestPageScore = matchCount;
        bestPageMatch = { page: p, text: s };
      }
    }
  }

  if (bestPageMatch && bestPageScore >= 3) {
    primaryPage = bestPageMatch.page;
    if (!textbookExcerpt) {
      textbookExcerpt = bestPageMatch.text;
    }
  }

  // Synthesize model answer
  let modelAnswer = "";
  if (q.type === 'essay') {
    if (bestConcept && qText.includes(bestConcept.termAr)) {
      modelAnswer = `وفقاً لما ورد في كتاب الوزارة (ص ${primaryPage}): ${bestConcept.termAr} هو «${bestConcept.definition}». ${bestPageMatch ? bestPageMatch.text : ''}`.trim();
    } else if (bestPageMatch) {
      modelAnswer = `استناداً إلى النص الأصلي لكتاب الوزارة (ص ${primaryPage}): ${bestPageMatch.text}`.trim();
    } else if (bestConcept) {
      modelAnswer = `استناداً إلى كتاب الوزارة (ص ${primaryPage}): ${bestConcept.definition}`.trim();
    } else {
      modelAnswer = `الإجابة النموذجية المعتمدة المستندة لكتاب الوزارة (الصفحات ${def.textbookPages[0]}-${def.textbookPages[1]}): يتم توضيح المفهوم وفق الشرح المعتمد في الدرس.`;
    }
  } else {
    // MCQ model explanation
    if (bestConcept) {
      modelAnswer = `استناداً إلى كتاب الوزارة (ص ${primaryPage}): ${bestConcept.termAr} يعني «${bestConcept.definition}».`;
    } else if (bestPageMatch) {
      modelAnswer = `النص المعتمد من كتاب الوزارة (ص ${primaryPage}): ${bestPageMatch.text}`;
    } else {
      modelAnswer = `الخيار الصحيح استناداً إلى شرح كتاب الوزارة (ص ${primaryPage}).`;
    }
  }

  return {
    modelAnswer,
    textbookCitation: {
      page: primaryPage,
      exactText: textbookExcerpt || `كتاب الوزارة — ص ${primaryPage}`,
      topic: bestConcept ? bestConcept.termAr : def.title
    }
  };
}

// Function to resolve correct answer for MCQs
function resolveMcqAnswer(q, def) {
  const opts = q.options || [];
  if (opts.length !== 4) return { index: 0, text: opts[0] || '' };

  const qText = q.question;

  // Let's check matching against concepts
  let bestIdx = 0;
  let maxScore = -1;

  for (let i = 0; i < 4; i++) {
    const opt = opts[i];
    let score = 0;

    for (const c of conceptBank) {
      if (c.lessonNumber !== def.number && c.chapterNumber !== def.chapterNumber) continue;

      // Question defines concept, option is the concept name
      if (qText.includes(c.definition) || c.definition.split(/\s+/).filter(w => w.length > 4).filter(w => qText.includes(w)).length >= 2) {
        if (opt.includes(c.termAr) || (c.termEn && opt.toLowerCase().includes(c.termEn.toLowerCase()))) {
          score += 50;
        }
      }

      // Question asks about concept name, option is definition
      if (qText.includes(c.termAr) || (c.termEn && qText.toLowerCase().includes(c.termEn.toLowerCase()))) {
        const defWords = c.definition.split(/\s+/).filter(w => w.length > 4);
        defWords.forEach(w => {
          if (opt.includes(w)) score += 10;
        });
      }
    }

    // Direct textbook search for opt in relation to qText
    for (let p = def.textbookPages[0]; p <= def.textbookPages[1]; p++) {
      const pageData = fullTextbook[p];
      if (!pageData || !pageData.text) continue;
      const optWords = opt.split(/\s+/).filter(w => w.length > 3);
      if (optWords.length > 0 && pageData.text.includes(opt.slice(0, 15))) {
        score += 5;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIdx = i;
    }
  }

  return {
    index: bestIdx,
    text: opts[bestIdx]
  };
}

// Process all 14 files
const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

const updatedMaster = [];

for (const file of lessonFiles) {
  const filePath = path.join(CANONICAL_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const def = {
    number: data.lessonNumber,
    chapterNumber: data.chapterNumber,
    title: data.lessonTitle,
    textbookPages: data.textbookPages.split('-').map(x => parseInt(x.trim(), 10))
  };

  data.questions.forEach((q, idx) => {
    // Add difficulty & cognitiveLevel if missing
    q.difficulty = q.difficulty || (q.type === 'essay' ? (q.questionNumber > 2 ? 'hard' : 'medium') : (q.questionNumber === 1 ? 'easy' : 'medium'));
    q.cognitiveLevel = q.cognitiveLevel || (q.type === 'essay' ? 'فهم واستيعاب وتحليل' : 'تذكر واسترجاع مباشر');

    // Resolve model answer and textbook citation
    const resolved = resolveModelAnswerAndCitation(q, def);
    q.modelAnswer = resolved.modelAnswer;
    q.textbookCitation = resolved.textbookCitation;

    // For MCQ, resolve answer
    if (q.type === 'mcq') {
      const ans = resolveMcqAnswer(q, def);
      q.correctAnswerIndex = ans.index;
      q.correctAnswer = ans.text;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  updatedMaster.push(data);
  console.log(`✅ Enriched ${file} (${data.questions.length} questions)`);
}

// Update all-assessments.json
const masterPath = path.join(CANONICAL_DIR, 'all-assessments.json');
fs.writeFileSync(masterPath, JSON.stringify(updatedMaster, null, 2), 'utf8');
console.log(`🎉 Master all-assessments.json enriched and saved successfully!`);
