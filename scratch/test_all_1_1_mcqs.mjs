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
  let currentMode = "essay";
  
  const questions = [];
  let currentQuestion = null;

  function finalizeCurrentQuestion() {
    if (!currentQuestion) return;
    if (currentQuestion.type === "mcq") {
      if (currentQuestion.optionsRaw && currentQuestion.optionsRaw.length > 0) {
        currentQuestion.options = parseOptions(currentQuestion.optionsRaw);
        currentQuestion.optionsRaw = undefined;
      }
    }
    questions.push(currentQuestion);
    currentQuestion = null;
  }

  function parseOptions(rawLines) {
    const combined = rawLines.join(" ");
    const optRegex = /(?:^|\s+)([أبجد])\s*[-–.]\s*([\s\S]*?)(?=(?:\s+[أبجد]\s*[-–.]|$))/g;
    const matches = [];
    let match;
    while ((match = optRegex.exec(combined)) !== null) {
      matches.push({ letter: match[1], text: match[2].trim() });
    }

    const opts = ['', '', '', ''];
    matches.forEach(m => {
      const idx = m.letter === 'أ' ? 0 : m.letter === 'ب' ? 1 : m.letter === 'ج' ? 2 : 3;
      opts[idx] = m.text;
    });

    return opts;
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

    if (/الوحدة\s+(األوىل|الثانية|الثالثة|الرابعة)|الدرس\s+(األول|الثاني|الثالث|الرابع)|الفرتة األوىل\s+األسبوع/i.test(text)) {
      continue;
    }

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

    if (currentQuestion) {
      if (currentQuestion.type === "mcq") {
        if (/^[أبجد]\s*[-–.]/.test(text) || text.includes(" ب-") || text.includes(" د-") || text.includes(" ب -") || text.includes(" د -")) {
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

const questions = parseLesson(3, 9, 'lesson-1-1', '1-1', 'تطور تكنولوجيا المعلومات والتحول الاجتماعي', 1, 'تكنولوجيا المعلومات والمجتمع');
const mcqs = questions.filter(q => q.type === 'mcq');
console.log('Total MCQs in 1-1:', mcqs.length);
mcqs.forEach((q, idx) => {
  console.log(`\nMCQ #${idx + 1} [${q.sectionType}] (P${q.pageInPdf}): ${q.question}`);
  q.options.forEach((opt, oIdx) => {
    const letter = ['أ', 'ب', 'ج', 'د'][oIdx];
    console.log(`  ${letter}: ${opt}`);
  });
});
