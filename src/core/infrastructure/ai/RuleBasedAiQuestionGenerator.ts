import { IAiQuestionGenerator, GenerateAiQuestionsParams } from "../../domain/interfaces/IAiQuestionGenerator";
import { Question } from "../../domain/entities/Question";
import { QuestionType } from "../../config/question-types.config";
import { DifficultyLevel } from "../../config/difficulty.config";
import { CognitiveLevel } from "../../config/cognitive.config";

export class RuleBasedAiQuestionGenerator implements IAiQuestionGenerator {
  public async generateQuestions(params: GenerateAiQuestionsParams): Promise<Question[]> {
    const { book, lesson, requestedCount, missingTypes, missingDifficulties } = params;
    const generated: Question[] = [];

    const concepts = lesson.keyConcepts || [];
    const sections = lesson.sections || [];

    // Helper to get distractors from other concepts in the same book
    const allBookConcepts = book.chapters
      .flatMap((ch) => ch.lessons)
      .flatMap((l) => l.keyConcepts || []);

    let qCounter = 1;

    // 1. Generate Definition / Terminology Questions from Key Concepts
    for (const concept of concepts) {
      if (generated.length >= requestedCount) break;

      const q: Question = {
        id: `AI-Q-${book.id}-${lesson.id}-TERM-${qCounter++}`,
        bookId: book.id,
        chapterId: lesson.chapterId,
        lessonId: lesson.id,
        type: "definition",
        question: `اكتب المصطلح العلمي الدال على العبارة الآتية: «${concept.definition}»`,
        modelAnswer: concept.termAr + (concept.termEn ? ` (${concept.termEn})` : ""),
        sourceText: `${concept.termAr}: ${concept.definition}`,
        sourceReference: {
          bookId: book.id,
          chapterId: lesson.chapterId,
          lessonId: lesson.id,
          pageNumber: lesson.pageRange,
          formattedText: `${book.title} → ${lesson.title} → المفاهيم الأساسية`,
        },
        difficulty: "easy",
        cognitiveLevel: "recall",
        marks: 2,
        estimatedTime: 1.5,
        keywords: [concept.termAr, lesson.title],
        status: "approved",
        generationSource: "ai",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      generated.push(q);
    }

    // 2. Generate MCQs based on Concepts with intelligent distractors
    for (const concept of concepts) {
      if (generated.length >= requestedCount) break;

      // Pick 3 distractors from other concepts
      const distractors = allBookConcepts
        .filter((c) => c.termAr !== concept.termAr)
        .slice(0, 3)
        .map((c) => c.termAr);

      while (distractors.length < 3) {
        distractors.push(`مفهوم بديل ${distractors.length + 1}`);
      }

      const options = [
        { id: "a", text: concept.termAr },
        { id: "b", text: distractors[0] },
        { id: "c", text: distractors[1] },
        { id: "d", text: distractors[2] },
      ].sort(() => 0.5 - Math.random());

      const correctOpt = options.find((o) => o.text === concept.termAr)?.id || "a";

      const q: Question = {
        id: `AI-Q-${book.id}-${lesson.id}-MCQ-${qCounter++}`,
        bookId: book.id,
        chapterId: lesson.chapterId,
        lessonId: lesson.id,
        type: "mcq",
        question: `اختر الإجابة الصحيحة: يشير مفهوم «${concept.definition}» إلى:`,
        modelAnswer: correctOpt,
        sourceText: `${concept.termAr}: ${concept.definition}`,
        sourceReference: {
          bookId: book.id,
          chapterId: lesson.chapterId,
          lessonId: lesson.id,
          pageNumber: lesson.pageRange,
          formattedText: `${book.title} → ${lesson.title} → ص ${lesson.pageRange || ""}`,
        },
        difficulty: "medium",
        cognitiveLevel: "understanding",
        marks: 1,
        estimatedTime: 1,
        options,
        keywords: [concept.termAr, "اختيار من متعدد"],
        status: "approved",
        generationSource: "ai",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      generated.push(q);
    }

    // 3. Generate Analytical / Reasoning questions from Sections
    for (const sec of sections) {
      if (generated.length >= requestedCount) break;
      if (sec.content && sec.content.length > 30) {
        const q: Question = {
          id: `AI-Q-${book.id}-${lesson.id}-REASON-${qCounter++}`,
          bookId: book.id,
          chapterId: lesson.chapterId,
          lessonId: lesson.id,
          type: "give_reason",
          question: `علل لما يأتي بأسلوب علمي مستنداً للمنهج: ما أهمية وتأثير «${sec.title}» في سياق هذا الدرس؟`,
          modelAnswer: `الإجابة النموذجية المعتمدة: ${sec.content.slice(0, 220)}...`,
          sourceText: sec.content,
          sourceReference: {
            bookId: book.id,
            chapterId: lesson.chapterId,
            lessonId: lesson.id,
            sectionId: sec.id,
            pageNumber: sec.pageNumber || lesson.pageRange,
            formattedText: `${book.title} → ${lesson.title} → ${sec.title}`,
          },
          difficulty: "hard",
          cognitiveLevel: "analysis",
          marks: 3,
          estimatedTime: 2.5,
          keywords: [sec.title, "علل"],
          status: "approved",
          generationSource: "ai",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        generated.push(q);
      }
    }

    // 4. Generate Essay question with Rubrics if requested
    if (generated.length < requestedCount && sections.length > 0) {
      const mainSec = sections[0];
      const essayQ: Question = {
        id: `AI-Q-${book.id}-${lesson.id}-ESSAY-${qCounter++}`,
        bookId: book.id,
        chapterId: lesson.chapterId,
        lessonId: lesson.id,
        type: "essay",
        question: `سؤال مقالي تحليلي [6 درجات]: حلل مفهوم «${mainSec.title}» في ضوء ما درسته بدرس (${lesson.title})، موضحاً المبادئ الفنية وكيفية التطبيق العملي.`,
        modelAnswer: `الإجابة النموذجية:\n${mainSec.content.slice(0, 300)}`,
        sourceText: mainSec.content,
        sourceReference: {
          bookId: book.id,
          chapterId: lesson.chapterId,
          lessonId: lesson.id,
          sectionId: mainSec.id,
          pageNumber: mainSec.pageNumber || lesson.pageRange,
          formattedText: `${book.title} → ${lesson.title} → ${mainSec.title}`,
        },
        difficulty: "advanced",
        cognitiveLevel: "evaluation",
        marks: 6,
        estimatedTime: 5,
        rubricCriteria: [
          "شرح المفهوم العلمي بدقة واستخدام مصطلحات الكتاب (درجتان)",
          "تحليل العلاقات والأسباب والآثار الفنية (درجتان)",
          "ضرب أمثلة واقعية وربطها بنواتج التعلم المستهدفة (درجتان)",
        ],
        keywords: [mainSec.title, "سؤال مقالي"],
        status: "approved",
        generationSource: "ai",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      generated.push(essayQ);
    }

    return generated;
  }
}
