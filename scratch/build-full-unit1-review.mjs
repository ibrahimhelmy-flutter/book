import fs from 'fs';

const rawJson = JSON.parse(
  fs.readFileSync('book-sources/term-1/05-canonical-data/authored/chapter1.json', 'utf8')
);

console.log('Total questions in chapter1.json:', rawJson.questions.length);

const deepQuestions = rawJson.questions.map((q, idx) => {
  const isCrossLesson = q.id >= 'Q061' && q.id <= 'Q090';
  const isTF = q.type === 'true_false';
  const isEssay = q.type === 'essay';

  let cognitiveLevel = 'تحليل وربط';
  if (isTF) cognitiveLevel = 'فهم مباشر عميق';
  if (isEssay) cognitiveLevel = 'تقييم واتخاذ قرار';

  const options = Array.isArray(q.options) ? q.options : [];
  const answer = q.answer || q.modelAnswer || '';

  return {
    id: `deep-1-review-${idx + 1}`,
    authoredId: q.id,
    lessonId: "chapter-1-review",
    lessonNumber: "1-review",
    index: idx + 1,
    title: `مراجعة الوحدة الأولى - ${q.id} (${q.type === 'mcq' ? 'اختيار من متعدد' : q.type === 'true_false' ? 'صواب وخطأ' : 'سؤال مقالي'})`,
    cognitiveLevel,
    difficulty: "hard",
    type: q.type,
    conceptIds: q.lessons.map(l => `concept-${l}`),
    secondaryConceptIds: q.lessons,
    contentOrigin: "authored",
    question: q.question,
    options: options,
    answer: answer,
    correctAnswer: options.length > 0 && answer ? options.indexOf(answer) : undefined,
    correctAnswerText: answer,
    modelAnswer: q.modelAnswer || undefined,
    depthExplanation: q.explanation || q.modelAnswer || 'مراجعة شاملة لمفاهيم الوحدة الأولى من كتاب تكنولوجيا المعلومات.',
    teacherDiscussionPrompt: `كيف توضح للطلاب المفهوم العلمي في السؤال (${q.id})؟`,
    isExamLikely: true,
    isUnitReview: true,
    source: {
      term: 1,
      lessonId: "chapter-1-review",
      pages: [4, 30],
      primaryPage: 4,
      sourceType: "authored-unit-review",
      sourceFile: "chapter1.json",
      authoredQuestionId: q.id,
    }
  };
});

fs.writeFileSync(
  'book-sources/term-1/05-canonical-data/authored/deep-questions/chapter-1/unit-1-review.json',
  JSON.stringify(deepQuestions, null, 2),
  'utf8'
);

console.log('Successfully wrote 115 questions to unit-1-review.json!');
