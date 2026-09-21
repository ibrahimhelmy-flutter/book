import fs from 'fs';

const rawPages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

function clean(l) {
  return l
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLesson(startPage, endPage, lessonId, lessonNumber, lessonTitle, chapterNumber, chapterTitle) {
  const linesWithMeta = [];
  for (let p = startPage; p <= endPage; p++) {
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
  let currentMode = "essay"; // 'essay' or 'mcq'
  
  const questions = [];
  let currentQuestion = null;

  function finalizeCurrentQuestion() {
    if (!currentQuestion) return;
    if (currentQuestion.type === "mcq") {
      // Clean up options
      if (currentQuestion.optionsRaw && currentQuestion.optionsRaw.length > 0) {
        const parsedOptions = parseOptions(currentQuestion.optionsRaw);
        currentQuestion.options = parsedOptions.options;
        currentQuestion.optionsRaw = undefined;
      }
    }
    questions.push(currentQuestion);
    currentQuestion = null;
  }

  function parseOptions(rawLines) {
    const combined = rawLines.join(" ");
    // Pattern looking for options: أ- ... ب- ... ج- ... د- ...
    // or أ - ... ب - ...
    const optRegex = /([أ-د])\s*[-–.]\s*([^أ-د\-–.]+)/g;
    const matches = [];
    let match;
    while ((match = optRegex.exec(combined)) !== null) {
      matches.push({ letter: match[1], text: match[2].trim() });
    }

    if (matches.length >= 4) {
      return {
        options: [
          matches.find(m => m.letter === 'أ')?.text || '',
          matches.find(m => m.letter === 'ب')?.text || '',
          matches.find(m => m.letter === 'ج')?.text || '',
          matches.find(m => m.letter === 'د')?.text || ''
        ]
      };
    }

    // Fallback: split by lines if each line is an option
    const opts = ['', '', '', ''];
    rawLines.forEach(l => {
      const m = l.match(/^([أ-د])\s*[-–.]\s*(.*)$/);
      if (m) {
        const idx = m[1] === 'أ' ? 0 : m[1] === 'ب' ? 1 : m[1] === 'ج' ? 2 : 3;
        opts[idx] = m[2].trim();
      }
    });

    return { options: opts };
  }

  for (let i = 0; i < linesWithMeta.length; i++) {
    const { page, text } = linesWithMeta[i];

    // Detect section headers
    if (/أوالً\s*:\s*املهام األدائية|أولاً\s*:\s*المهام الأدائية/i.test(text)) {
      finalizeCurrentQuestion();
      if (currentSectionType.includes("task_2") || currentSectionType.includes("homework")) {
        currentSectionType = "performance_task_2";
        currentSectionNameAr = "المهام الأدائية - الفترة الثانية";
      } else {
        currentSectionType = "performance_task_1";
        currentSectionNameAr = "المهام الأدائية - الفترة الأولى";
      }
      continue;
    }

    if (/الفرتة الثانية|الفترة الثانية/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "performance_task_2";
      currentSectionNameAr = "المهام الأدائية - الفترة الثانية";
      continue;
    }

    if (/ثانيًا\s*:\s*أداءات منزلية|ثانياً\s*:\s*أداءات منزلية|أداءات منزلية/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "homework";
      currentSectionNameAr = "أداءات منزلية (الواجب المنزلي)";
      continue;
    }

    if (/الفرتة الثالثة|الفترة الثالثة|التقييامت األسبوعية|التقييمات الأسبوعية/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_a";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (A)";
      continue;
    }

    if (/النموذج\s*\([Aأ]\)/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_a";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (A)";
      continue;
    }

    if (/النموذج\s*\([Bب]\)/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_b";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (B)";
      continue;
    }

    if (/النموذج\s*\([Cج]\)/i.test(text)) {
      finalizeCurrentQuestion();
      currentSectionType = "weekly_model_c";
      currentSectionNameAr = "التقييمات الأسبوعية - النموذج (C)";
      continue;
    }

    if (/األسئلة املقالية|االسئلة املقالية|الأسئلة المقالية/i.test(text)) {
      finalizeCurrentQuestion();
      currentMode = "essay";
      continue;
    }

    if (/اختيار من متعدد/i.test(text)) {
      finalizeCurrentQuestion();
      currentMode = "mcq";
      continue;
    }

    // Skip lesson title / unit banner lines
    if (/الوحدة\s+(األوىل|الثانية|الثالثة|الرابعة)|الدرس\s+(األول|الثاني|الثالث|الرابع)|الفرتة األوىل\s+األسبوع/i.test(text)) {
      continue;
    }

    // Check for question start: e.g. "1-", "2-", "3-", "4-"
    const qMatch = text.match(/^(\d+)\s*[-–.]\s*(.*)$/);
    if (qMatch) {
      finalizeCurrentQuestion();
      const qNum = parseInt(qMatch[1], 10);
      const qBody = qMatch[2].trim();

      currentQuestion = {
        id: `OFFICIAL-${lessonNumber}-${currentSectionType.toUpperCase()}-${currentMode.toUpperCase()}-${qNum}`,
        lessonId,
        lessonNumber,
        lessonTitle,
        chapterNumber,
        chapterTitle,
        sectionType: currentSectionType,
        sectionNameAr: currentSectionNameAr,
        type: currentMode,
        questionNumber: qNum,
        question: qBody,
        optionsRaw: currentMode === "mcq" ? [] : undefined,
        options: currentMode === "mcq" ? [] : undefined,
        pageInPdf: page
      };
      continue;
    }

    // Continuation of question or option
    if (currentQuestion) {
      if (currentQuestion.type === "mcq") {
        if (/^[أ-د]\s*[-–.]/.test(text) || text.includes(" ب-") || text.includes(" د-")) {
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

const q1 = parseLesson(3, 9, 'lesson-1-1', '1-1', 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', 1, 'تكنولوجيا المعلومات والمجتمع');
console.log(`Parsed ${q1.length} questions for Lesson 1-1`);
console.log('Sample MCQ:');
console.log(JSON.stringify(q1.find(q => q.type === 'mcq'), null, 2));
console.log('Sample Essay:');
console.log(JSON.stringify(q1.find(q => q.type === 'essay'), null, 2));
