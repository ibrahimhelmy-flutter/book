import fs from 'fs';
import path from 'path';

console.log('Building canonical official assessments for all 14 lessons...');

const rawPages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));
const canonicalBook = JSON.parse(fs.readFileSync('book-sources/term-1/05-canonical-data/official/book.json', 'utf8'));
const fullTextbook = JSON.parse(fs.readFileSync('book-sources/term-1/03-raw-extractions/Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json', 'utf8'));

const CANONICAL_OUTPUT_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
if (!fs.existsSync(CANONICAL_OUTPUT_DIR)) {
  fs.mkdirSync(CANONICAL_OUTPUT_DIR, { recursive: true });
}

const LESSON_DEFS = [
  { id: 'lesson-1-1', number: '1-1', chapterNumber: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', startPage: 3, endPage: 9, textbookPages: [4, 11] },
  { id: 'lesson-1-2', number: '1-2', chapterNumber: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'كيف يعمل الذكاء الاصطناعي', startPage: 10, endPage: 16, textbookPages: [12, 17] },
  { id: 'lesson-1-3', number: '1-3', chapterNumber: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'الذكاء الاصطناعي في الحياة اليومية والصناعة', startPage: 17, endPage: 22, textbookPages: [18, 23] },
  { id: 'lesson-1-4', number: '1-4', chapterNumber: 1, chapterTitle: 'تكنولوجيا المعلومات والمجتمع', title: 'القضايا الأخلاقية المتعلقة بالذكاء الاصطناعي', startPage: 23, endPage: 29, textbookPages: [24, 30] },
  { id: 'lesson-2-1', number: '2-1', chapterNumber: 2, chapterTitle: 'الأمن السيبراني', title: 'تقنيات التشفير والمصادقة', startPage: 30, endPage: 35, textbookPages: [31, 37] },
  { id: 'lesson-2-2', number: '2-2', chapterNumber: 2, chapterTitle: 'الأمن السيبراني', title: 'تصميم أمان الشبكات', startPage: 36, endPage: 42, textbookPages: [38, 43] },
  { id: 'lesson-2-3', number: '2-3', chapterNumber: 2, chapterTitle: 'الأمن السيبراني', title: 'الاستجابة للحوادث وإدارة المخاطر', startPage: 43, endPage: 47, textbookPages: [44, 49] },
  { id: 'lesson-3-1', number: '3-1', chapterNumber: 3, chapterTitle: 'تطبيقات الويب', title: 'البنية العامة لتطبيقات الويب', startPage: 48, endPage: 52, textbookPages: [50, 55] },
  { id: 'lesson-3-2', number: '3-2', chapterNumber: 3, chapterTitle: 'تطبيقات الويب', title: 'طرق اتصال تطبيقات الويب', startPage: 53, endPage: 57, textbookPages: [56, 61] },
  { id: 'lesson-3-3', number: '3-3', chapterNumber: 3, chapterTitle: 'تطبيقات الويب', title: 'أساسيات تقنية الواجهة الأمامية', startPage: 58, endPage: 62, textbookPages: [62, 67] },
  { id: 'lesson-4-1', number: '4-1', chapterNumber: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'أنواع الوسائط وخصائصها', startPage: 63, endPage: 67, textbookPages: [68, 73] },
  { id: 'lesson-4-2', number: '4-2', chapterNumber: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'تصميم المعلومات وتجربة المستخدم للمواقع الإلكترونية', startPage: 68, endPage: 74, textbookPages: [74, 80] },
  { id: 'lesson-4-3', number: '4-3', chapterNumber: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'طرق تقييم المواقع الإلكترونية', startPage: 75, endPage: 80, textbookPages: [81, 86] },
  { id: 'lesson-4-4', number: '4-4', chapterNumber: 4, chapterTitle: 'تصميم الويب والوسائط', title: 'عملية التحسين التكراري للمواقع الإلكترونية', startPage: 81, endPage: 87, textbookPages: [87, 93] },
];

function clean(l) {
  return l
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fixArabicLigatures(text) {
  if (!text) return '';
  return text
    .replace(/\bامل/g, 'الم')
    .replace(/\bاملهام\b/g, 'المهام')
    .replace(/\bاملقالية\b/g, 'المقالية')
    .replace(/\bاملوضوعية\b/g, 'الموضوعية')
    .replace(/\bاملعلومات\b/g, 'المعلومات')
    .replace(/\bفرتة\b/g, 'فترة')
    .replace(/\bالفرتة\b/g, 'الفترة')
    .replace(/\bفرتات\b/g, 'فترات')
    .replace(/\bميثل\b/g, 'يمثل')
    .replace(/\bالرتانزستورات\b/g, 'الترانزستورات')
    .replace(/\bالرتاكب\b/g, 'التراكب')
    .replace(/\bالكالسييك\b/g, 'الكلاسيكي')
    .replace(/\bع ى\b/g, 'على')
    .replace(/\bغ ر\b/g, 'غير')
    .replace(/\bللمستخدم ن\b/g, 'للمستخدمين')
    .replace(/\bكل عام ن\b/g, 'كل عامين')
    .replace(/\bعام ن\b/g, 'عامين')
    .replace(/االجت\s*ا\s*عي/g, 'الاجتماعي')
    .replace(/االجتامعي/g, 'الاجتماعي')
    .replace(/\barsh\b/g, 'اشرح')
    .replace(/\bارشح\b/g, 'اشرح')
    .replace(/\bبني\b/g, 'بين')
    .replace(/\bإىل\b/g, 'إلى')
    .replace(/\bمبصطلح\b/g, 'بمصطلح')
    .replace(/\bمبثاليني\b/g, 'بمثالين')
    .replace(/\bكام\b/g, 'كما')
    .replace(/\bرسعة\b/g, 'سرعة')
    .replace(/\bنرش\b/g, 'نشر')
    .replace(/\bرشائها\b/g, 'شرائها')
    .replace(/\bتقيض\b/g, 'تقضي')
    .replace(/\bعرب اإلنرتنت\b/g, 'عبر الإنترنت')
    .replace(/\bعرب\b/g, 'عبر')
    .replace(/\bاإلنرتنت\b/g, 'الإنترنت')
    .replace(/\bاالفرتايض\b/g, 'الافتراضي')
    .replace(/\bالفرتاضية\b/g, 'افتراضية')
    .replace(/\bافرتائي\b/g, 'افتراضي')
    .replace(/\bاألوىل\b/g, 'الأولى')
    .replace(/اإللك\s*\s*ونية/g, 'الإلكترونية')
    .replace(/اإللكرتونية/g, 'الإلكترونية')
    .replace(/التحس\s*/g, 'التحسين')
    .replace(/التشف\s*/g, 'التشفير')
    .replace(/الذكاء االصطناع\s*/g, 'الذكاء الاصطناعي')
    .replace(/الدرس الثان/g, 'الدرس الثاني')
    .replace(/الدرس الثا/g, 'الدرس الثاني')
    .replace(/الصاممات/g, 'الصمامات')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseOptionsRobust(rawLines) {
  const combined = rawLines.join(" ");

  // Case 1: Inverted format with bracket: e.g. "200 )أ 404 )ب"
  if (/([^\s()]+)\s*[)）]\s*[اأب](?:\s+|$)/.test(combined)) {
    const opts = ['', '', '', ''];
    const invRegex = /([^\s()]+(?:\s+[^\s()]+)*?)\s*[)）]\s*([اأبجد])(?:\s+|$)/g;
    let m;
    while ((m = invRegex.exec(combined)) !== null) {
      const text = m[1].replace(/^\./, '').trim();
      const letter = m[2] === 'ا' ? 'أ' : m[2];
      const idx = letter === 'أ' ? 0 : letter === 'ب' ? 1 : letter === 'ج' ? 2 : 3;
      opts[idx] = text;
    }
    if (opts.filter(o => o).length >= 3) {
      return opts;
    }
  }

  // Case 2: Inverted format with dash: e.g. "HTTPS -أ FTP -ب SMTP -ج DNS -د"
  if (/([^\s\-–]+(?:\s+[^\s\-–]+)*?)\s*[-–]\s*([اأب])(?:\s+|$)/.test(combined)) {
    const opts = ['', '', '', ''];
    const invDashRegex = /([^\s\-–]+(?:\s+[^\s\-–]+)*?)\s*[-–]\s*([اأبجد])(?:\s+|$)/g;
    let m;
    while ((m = invDashRegex.exec(combined)) !== null) {
      const text = m[1].replace(/^\./, '').trim();
      const letter = m[2] === 'ا' ? 'أ' : m[2];
      const idx = letter === 'أ' ? 0 : letter === 'ب' ? 1 : letter === 'ج' ? 2 : 3;
      opts[idx] = text;
    }
    if (opts.filter(o => o).length >= 3) {
      return opts;
    }
  }

  // Case 3: Standard format: [أبجد] followed by punctuation delimiter [-–.)\]）]
  const optRegex = /(?:^|\s+)(?:[([（]([اأبجد])[)\]）\-–.]|([اأبجد])\s*[-–.)\]）])\s*([\s\S]*?)(?=(?:\s+(?:[([（][اأبجد][)\]）\-–.]|[اأبجد]\s*[-–.)\]）]))|$)/g;
  const matches = [];
  let match;
  while ((match = optRegex.exec(combined)) !== null) {
    const letter = (match[1] || match[2]) === 'ا' ? 'أ' : (match[1] || match[2]);
    matches.push({ letter, text: match[3].trim() });
  }

  const opts = ['', '', '', ''];
  matches.forEach(m => {
    const idx = m.letter === 'أ' ? 0 : m.letter === 'ب' ? 1 : m.letter === 'ج' ? 2 : 3;
    opts[idx] = m.text;
  });

  return opts;
}

function parseLesson(def) {
  const linesWithMeta = [];
  for (let p = def.startPage; p <= def.endPage; p++) {
    const pageObj = rawPages[p - 1];
    for (const raw of pageObj.lines) {
      const l = clean(raw);
      if (!l) continue;
      if (/الفصل الدرا[يس]ى? األول|صطءا صطناال|^\d+\s*الفصل|^\s*\d+\s*$/i.test(l)) continue;
      if (/^\.{4,}$/.test(l)) continue;
      linesWithMeta.push({ page: p, text: l });
    }
  }

  let currentSectionType = "performance_task_1";
  let currentSectionNameAr = "المهام الأدائية - الفترة الأولى";
  let currentMode = "essay";
  
  const questions = [];
  let currentQuestion = null;

  function finalizeCurrentQuestion() {
    if (!currentQuestion) return;
    currentQuestion.question = fixArabicLigatures(currentQuestion.question);
    if (currentQuestion.type === "mcq") {
      if (currentQuestion.optionsRaw && currentQuestion.optionsRaw.length > 0) {
        currentQuestion.options = parseOptionsRobust(currentQuestion.optionsRaw).map(fixArabicLigatures);
        currentQuestion.optionsRaw = undefined;
      }
    }
    questions.push(currentQuestion);
    currentQuestion = null;
  }

  for (let i = 0; i < linesWithMeta.length; i++) {
    const { page, text } = linesWithMeta[i];

    if (/أوالً\s*:\s*املهام األدائية|أولاً\s*:\s*المهام الأدائية/i.test(text)) {
      finalizeCurrentQuestion();
      if (currentSectionType.includes("task_2") || currentSectionType.includes("homework")) {
        currentSectionType = "performance_task_2";
        currentSectionNameAr = "المهام الأدائية - الفترة الثانية";
      } else {
        currentSectionType = "performance_task_1";
        currentSectionNameAr = "المهام الأدائية - الفترة الأولى";
      }
      currentMode = "essay";
      continue;
    }

    if (/الفرتة الثانية|الفترة الثانية/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "performance_task_2";
      currentSectionNameAr = "المهام الأدائية - الفترة الثانية";
      currentMode = "essay";
      continue;
    }

    if (/ثانيًا\s*:\s*أداءات منزلية|ثانياً\s*:\s*أداءات منزلية|أداءات منزلية/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "homework";
      currentSectionNameAr = "أداءات منزلية (الواجب المنزلي)";
      currentMode = "essay";
      continue;
    }

    if (/الفرتة الثالثة|الفترة الثالثة|التقييامت األسبوعية|التقييمات الأسبوعية/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_a";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (A)";
      currentMode = "essay";
      continue;
    }

    if (/النموذج\s*\([Aأ]\)/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_a";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (A)";
      currentMode = "essay";
      continue;
    }

    if (/النموذج\s*\([Bب]\)/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_b";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (B)";
      currentMode = "essay";
      continue;
    }

    if (/النموذج\s*\([Cج]\)/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_c";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (C)";
      currentMode = "essay";
      continue;
    }

    if (/األسئلة املقالية|االسئلة املقالية|الأسئلة المقالية/i.test(text)) {
      finalizeCurrentQuestion();
      currentMode = "essay";
      continue;
    }

    if (/اختيار من متعدد|األسئلة املوضوعية/i.test(text)) {
      finalizeCurrentQuestion();
      currentMode = "mcq";
      continue;
    }

    if (/الوحدة\s+(األوىل|الثانية|الثالثة|الرابعة)|الدرس\s+(األول|الثاني|الثالث|الرابع)|الفرتة األوىل\s+األسبوع/i.test(text)) {
      continue;
    }

    const qMatch = text.match(/^(\d+)\s*[-–.]\s*(.*)$/);
    if (qMatch) {
      finalizeCurrentQuestion();
      const qNum = parseInt(qMatch[1], 10);
      let qBody = qMatch[2].trim();

      let inlineOpts = [];
      const inlineOptMatch = qBody.match(/(?:^|\s+)(?:[([（]([اأ])[)\]）\-–.]|([اأ])\s*[-–.)\]）])/);
      if (inlineOptMatch && currentMode === "mcq") {
        inlineOpts.push(qBody.slice(inlineOptMatch.index).trim());
        qBody = qBody.slice(0, inlineOptMatch.index).trim();
      }

      const inlineInvMatch = qBody.match(/(?:^|\s+)(?:[^\s\-–]+(?:\s+[^\s\-–]+)*?)\s*[-–]\s*[اأ](?:\s+|$)/);
      if (inlineInvMatch && currentMode === "mcq") {
        inlineOpts.push(qBody.slice(inlineInvMatch.index).trim());
        qBody = qBody.slice(0, inlineInvMatch.index).trim();
      }

      currentQuestion = {
        id: `OFFICIAL-${def.number}-${currentSectionType.toUpperCase()}-${currentMode.toUpperCase()}-${qNum}`,
        lessonId: def.id,
        lessonNumber: def.number,
        lessonTitle: def.title,
        chapterNumber: def.chapterNumber,
        chapterTitle: def.chapterTitle,
        sectionType: currentSectionType,
        sectionNameAr: currentSectionNameAr,
        type: currentMode,
        questionNumber: qNum,
        question: qBody,
        optionsRaw: currentMode === "mcq" ? [...inlineOpts] : undefined,
        options: currentMode === "mcq" ? [] : undefined,
        pageInPdf: page
      };
      continue;
    }

    if (currentQuestion) {
      if (currentQuestion.type === "mcq") {
        const isOptionToken = /(?:^|\s+)(?:[([（][اأبجد][)\]）\-–.]|[اأبجد]\s*[-–.)\]）])/.test(text) ||
            /(?:^|\s+)(?:[^\s()]+)\s*[)）]\s*[اأبجد](?:\s+|$)/.test(text) ||
            /(?:^|\s+)(?:[^\s\-–]+)\s*[-–]\s*[اأبجد](?:\s+|$)/.test(text);

        if (isOptionToken) {
          currentQuestion.optionsRaw.push(text);
        } else if (currentQuestion.optionsRaw.length === 0) {
          currentQuestion.question += " " + text;
        } else {
          currentQuestion.optionsRaw.push(text);
        }
      } else {
        currentQuestion.question += " " + text;
      }
    }
  }

  finalizeCurrentQuestion();
  return questions;
}

// Generate canonical questions
const allLessonsCanonical = [];

for (const def of LESSON_DEFS) {
  const qs = parseLesson(def);
  const lessonObj = {
    lessonId: def.id,
    lessonNumber: def.number,
    lessonTitle: def.title,
    chapterNumber: def.chapterNumber,
    chapterTitle: def.chapterTitle,
    term: 1,
    bookletPages: `${def.startPage} - ${def.endPage}`,
    textbookPages: `${def.textbookPages[0]} - ${def.textbookPages[1]}`,
    totalQuestions: qs.length,
    mcqCount: qs.filter(q => q.type === 'mcq').length,
    essayCount: qs.filter(q => q.type === 'essay').length,
    questions: qs
  };

  allLessonsCanonical.push(lessonObj);
  const outPath = path.join(CANONICAL_OUTPUT_DIR, `lesson-${def.number}.json`);
  fs.writeFileSync(outPath, JSON.stringify(lessonObj, null, 2), 'utf8');
  console.log(`Saved ${outPath} (${qs.length} questions: ${lessonObj.mcqCount} MCQ, ${lessonObj.essayCount} Essay)`);
}

// Master all-assessments.json
const masterPath = path.join(CANONICAL_OUTPUT_DIR, 'all-assessments.json');
fs.writeFileSync(masterPath, JSON.stringify(allLessonsCanonical, null, 2), 'utf8');
console.log(`✅ Master file saved: ${masterPath} (Total ${allLessonsCanonical.reduce((a, b) => a + b.totalQuestions, 0)} questions across 14 lessons)`);
