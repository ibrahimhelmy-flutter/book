import { IQuestionRepository } from "../../domain/interfaces/IQuestionRepository";
import { IBookRepository } from "../../domain/interfaces/IBookRepository";
import { IExamRepository } from "../../domain/interfaces/IExamRepository";
import { ExpandQuestionBankUseCase } from "./ExpandQuestionBankUseCase";
import { ExamGenerationRequest } from "../dtos/ExamGenerationDTO";
import { Exam, ExamSectionEntity } from "../../domain/entities/Exam";
import { ExamBlueprint, LessonWeightItem } from "../../domain/entities/ExamBlueprint";
import { Question } from "../../domain/entities/Question";
import { DifficultyLevel } from "../../config/difficulty.config";
import { CognitiveLevel } from "../../config/cognitive.config";

// Simple Seeded Pseudo-Random Number Generator (PRNG) for deterministic exams
function createPRNG(seedString?: string) {
  if (!seedString) {
    return () => Math.random();
  }
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const MODEL_LETTERS = ["أ", "ب", "جـ", "د", "هـ", "و", "ز", "ح", "ط", "ي"];

export interface GenerateExamResult {
  exams: Exam[];
  blueprint: ExamBlueprint;
  totalCandidateQuestions: number;
  aiGeneratedCount: number;
  generatedAt: string;
}

export class GenerateExamUseCase {
  constructor(
    private questionRepository: IQuestionRepository,
    private bookRepository: IBookRepository,
    private examRepository?: IExamRepository,
    private expandQuestionBankUseCase?: ExpandQuestionBankUseCase
  ) {}

  public async execute(request: ExamGenerationRequest): Promise<GenerateExamResult> {
    const book = await this.bookRepository.getById(request.bookId);
    if (!book) {
      throw new Error(`Book with id ${request.bookId} not found`);
    }

    // 1. Fetch available questions for this scope
    let availableQuestions = await this.questionRepository.findByScope(request.scope);

    // Filter by allowed question types if specified
    if (request.questionTypes !== "all" && Array.isArray(request.questionTypes) && request.questionTypes.length > 0) {
      availableQuestions = availableQuestions.filter((q) =>
        (request.questionTypes as string[]).includes(q.type)
      );
    }

    let aiGeneratedCount = 0;
    const targetPerExam =
      request.questionCount === "max"
        ? Math.min(availableQuestions.length, 100)
        : request.questionCount;
    const totalQuestionsNeeded = targetPerExam * (request.examCount || 1);

    // 2. AI Fallback: If not enough questions and AI generation allowed, expand question bank
    if (
      availableQuestions.length < totalQuestionsNeeded &&
      request.allowAiGeneration &&
      this.expandQuestionBankUseCase
    ) {
      const deficit = totalQuestionsNeeded - availableQuestions.length;
      const expansionResult = await this.expandQuestionBankUseCase.execute({
        bookId: request.bookId,
        requestedCount: Math.min(deficit + 10, 40),
      });

      aiGeneratedCount = expansionResult.addedQuestions.length;
      // Re-fetch pool after expansion
      availableQuestions = await this.questionRepository.findByScope(request.scope);
      if (request.questionTypes !== "all" && Array.isArray(request.questionTypes)) {
        availableQuestions = availableQuestions.filter((q) =>
          (request.questionTypes as string[]).includes(q.type)
        );
      }
    }

    if (availableQuestions.length === 0) {
      throw new Error("No approved questions found for the selected scope. Please generate questions first.");
    }

    const actualCountPerExam =
      request.questionCount === "max"
        ? Math.min(availableQuestions.length, 60)
        : Math.min(request.questionCount, availableQuestions.length);

    // 3. Create Exam Blueprint
    const allBookLessons = book.chapters.flatMap((ch) => ch.lessons);
    const targetLessons =
      request.scope.type === "lesson" && request.scope.lessonIds?.[0]
        ? allBookLessons.filter((l) => l.id === request.scope.lessonIds![0])
        : request.scope.type === "lessons" && request.scope.lessonIds
        ? allBookLessons.filter((l) => request.scope.lessonIds!.includes(l.id))
        : request.scope.type === "chapter" && request.scope.chapterId
        ? allBookLessons.filter((l) => l.chapterId === request.scope.chapterId)
        : allBookLessons;

    const lessonWeights: LessonWeightItem[] = targetLessons.map((l) => {
      const weightRatio = targetLessons.length > 0 ? 1 / targetLessons.length : 1;
      return {
        lessonId: l.id,
        lessonNumber: l.number,
        lessonTitle: l.title,
        weightPercent: Math.round(weightRatio * 100),
        questionCount: Math.max(1, Math.round(actualCountPerExam * weightRatio)),
      };
    });

    const dist = request.difficultyDistribution;
    const cognitiveDist: Record<CognitiveLevel, { count: number; percentage: number }> = {
      recall: { count: Math.round(actualCountPerExam * (dist.easy / 100)), percentage: dist.easy },
      understanding: { count: Math.round(actualCountPerExam * (dist.medium / 100)), percentage: dist.medium },
      application: { count: Math.round(actualCountPerExam * ((dist.hard * 0.5) / 100)), percentage: Math.round(dist.hard * 0.5) },
      analysis: { count: Math.round(actualCountPerExam * ((dist.hard * 0.5) / 100)), percentage: Math.round(dist.hard * 0.5) },
      evaluation: { count: Math.round(actualCountPerExam * ((dist.advanced * 0.5) / 100)), percentage: Math.round(dist.advanced * 0.5) },
      integration: { count: Math.max(1, Math.round(actualCountPerExam * ((dist.advanced * 0.5) / 100))), percentage: Math.round(dist.advanced * 0.5) },
    };

    const diffDist: Record<DifficultyLevel, { count: number; percentage: number }> = {
      easy: { count: Math.round(actualCountPerExam * (dist.easy / 100)), percentage: dist.easy },
      medium: { count: Math.round(actualCountPerExam * (dist.medium / 100)), percentage: dist.medium },
      hard: { count: Math.round(actualCountPerExam * (dist.hard / 100)), percentage: dist.hard },
      advanced: { count: Math.round(actualCountPerExam * (dist.advanced / 100)), percentage: dist.advanced },
    };

    const blueprint: ExamBlueprint = {
      title: `جدول مواصفات الامتحان — ${book.title}`,
      scopeDescription:
        request.scope.type === "lesson"
          ? `درس: ${targetLessons[0]?.title || ""}`
          : request.scope.type === "chapter"
          ? `فصل: ${request.scope.chapterId || ""}`
          : request.scope.type === "lessons"
          ? `${targetLessons.length} دروس مختارة`
          : `كامل المنهج (${book.title})`,
      totalQuestions: actualCountPerExam,
      totalMarks: request.totalMarks || actualCountPerExam * 2,
      durationMinutes: request.durationMinutes || Math.max(15, Math.round(actualCountPerExam * 1.5)),
      lessonWeights,
      cognitiveDistribution: cognitiveDist,
      difficultyDistribution: diffDist,
      typeDistribution: {},
    };

    // 4. Generate Multiple Exam Models using PRNG (Deterministic if seed provided)
    const rng = createPRNG(request.seed);
    const modelsCount = Math.max(1, Math.min(request.examCount || 1, 10));
    const exams: Exam[] = [];
    const questionUsageCount: Record<string, number> = {};

    availableQuestions.forEach((q) => {
      questionUsageCount[q.id] = 0;
    });

    for (let m = 0; m < modelsCount; m++) {
      const letter = MODEL_LETTERS[m] || `نموذج ${m + 1}`;
      const code = `EXAM-${book.id.toUpperCase()}-M${m + 1}`;
      const examQuestions: Question[] = [];

      // Sort by least usage across prior models
      const sortedPool = [...availableQuestions].sort((a, b) => {
        const usageDiff = (questionUsageCount[a.id] || 0) - (questionUsageCount[b.id] || 0);
        if (usageDiff !== 0) return usageDiff;
        return 0.5 - rng();
      });

      // Distribute across lessons proportionally
      for (const lw of lessonWeights) {
        const lessonPool = sortedPool.filter(
          (q) => q.lessonId === lw.lessonId && !examQuestions.some((exQ) => exQ.id === q.id)
        );
        const takeCount = Math.min(lw.questionCount, lessonPool.length);
        const taken = lessonPool.slice(0, takeCount);
        taken.forEach((q) => {
          examQuestions.push(q);
          questionUsageCount[q.id] = (questionUsageCount[q.id] || 0) + 1;
        });
      }

      // Fill remaining if needed
      for (const q of sortedPool) {
        if (examQuestions.length >= actualCountPerExam) break;
        if (!examQuestions.some((exQ) => exQ.id === q.id)) {
          examQuestions.push(q);
          questionUsageCount[q.id] = (questionUsageCount[q.id] || 0) + 1;
        }
      }

      // Group into official sections
      const secA = examQuestions.filter((q) => q.type === "mcq" || q.type === "definition");
      const secB = examQuestions.filter((q) => q.type === "true_false" || q.type === "complete" || q.type === "matching");
      const secC = examQuestions.filter((q) => q.type === "give_reason" || q.type === "explain" || q.type === "compare");
      const secD = examQuestions.filter((q) => q.type === "what_if" || q.type === "order" || q.type === "classify" || q.type === "odd_one_out" || q.type === "short_answer");
      const secE = examQuestions.filter((q) => q.type === "essay" || q.type === "scenario" || q.type === "integrated" || q.isCrossLesson);

      const sections: ExamSectionEntity[] = [];

      if (secA.length > 0) {
        sections.push({
          id: `sec-A-${m}`,
          sectionKey: "A",
          title: "القسم الأول (أ): أسئلة الاختيار من متعدد والمصطلحات العلمية",
          subtitle: "اختر الإجابة الصحيحة أو اكتب المصطلح العلمي الدال على كل عبارة",
          marks: secA.reduce((sum, q) => sum + q.marks, 0),
          questions: secA,
        });
      }

      if (secB.length > 0) {
        sections.push({
          id: `sec-B-${m}`,
          sectionKey: "B",
          title: "القسم الثاني (ب): أسئلة الصواب والخطأ وإكمال الفراغات والمطابقة",
          subtitle: "أجب عن عبارات الصواب والخطأ مع تصحيح الخطأ، وأكمل الفراغات التالية",
          marks: secB.reduce((sum, q) => sum + q.marks, 0),
          questions: secB,
        });
      }

      if (secC.length > 0) {
        sections.push({
          id: `sec-C-${m}`,
          sectionKey: "C",
          title: "القسم الثالث (جـ): أسئلة التعليل والتفسير العلمي والمقارنة",
          subtitle: "علل بأسلوب علمي دقيق وقارن بين المفاهيم المحددة في الجدول",
          marks: secC.reduce((sum, q) => sum + q.marks, 0),
          questions: secC,
        });
      }

      if (secD.length > 0) {
        sections.push({
          id: `sec-D-${m}`,
          sectionKey: "D",
          title: "القسم الرابع (د): أسئلة التطبيق والترتيب والتصنيف وحل المشكلات",
          subtitle: "طبق القواعد ورتب الخطوات وصنف العناصر التالية",
          marks: secD.reduce((sum, q) => sum + q.marks, 0),
          questions: secD,
        });
      }

      if (secE.length > 0) {
        sections.push({
          id: `sec-E-${m}`,
          sectionKey: "E",
          title: "القسم الخامس (هـ): الأسئلة المقالية ومستويات التفكير العليا والتكامل",
          subtitle: "أجب عن الأسئلة التحليلية وأسئلة الربط التكاملي بين المفاهيم",
          marks: secE.reduce((sum, q) => sum + q.marks, 0),
          questions: secE,
        });
      }

      if (sections.length === 0) {
        sections.push({
          id: `sec-all-${m}`,
          sectionKey: "A",
          title: "كافة أسئلة الامتحان",
          subtitle: "أجب عن كافة الأسئلة التالية",
          marks: examQuestions.reduce((sum, q) => sum + q.marks, 0),
          questions: examQuestions,
        });
      }

      const totalCalculatedMarks = examQuestions.reduce((sum, q) => sum + q.marks, 0);

      const exam: Exam = {
        id: `exam-${book.id}-${m + 1}-${Date.now()}`,
        modelLetter: letter,
        modelCode: code,
        title: `امتحان مادة ${book.subjectNameAr || book.title} — النموذج (${letter})`,
        bookId: book.id,
        subjectName: book.subjectNameAr || book.title,
        gradeName: book.gradeNameAr,
        academicYear: "2026 / 2027",
        durationMinutes: blueprint.durationMinutes,
        totalMarks: totalCalculatedMarks,
        seed: request.seed,
        blueprint,
        sections,
        allQuestions: examQuestions,
        createdAt: new Date(),
      };

      exams.push(exam);
    }

    // Save exams if repository provided
    if (this.examRepository) {
      await this.examRepository.saveBatch(exams);
    }

    return {
      exams,
      blueprint,
      totalCandidateQuestions: availableQuestions.length,
      aiGeneratedCount,
      generatedAt: new Date().toISOString(),
    };
  }
}
