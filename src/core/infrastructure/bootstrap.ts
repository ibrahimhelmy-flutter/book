import { InMemoryBookRepository } from "./repositories/InMemoryBookRepository";
import { InMemoryQuestionRepository } from "./repositories/InMemoryQuestionRepository";
import { InMemoryExamRepository } from "./repositories/InMemoryExamRepository";
import { DuplicateDetectorService } from "./services/DuplicateDetectorService";
import { ContentAnalyzerService } from "./services/ContentAnalyzerService";
import { RuleBasedAiQuestionGenerator } from "./ai/RuleBasedAiQuestionGenerator";
import { ValidateQuestionUseCase } from "../application/use-cases/ValidateQuestionUseCase";
import { AnalyzeQuestionBankUseCase } from "../application/use-cases/AnalyzeQuestionBankUseCase";
import { ExpandQuestionBankUseCase } from "../application/use-cases/ExpandQuestionBankUseCase";
import { GenerateExamUseCase } from "../application/use-cases/GenerateExamUseCase";
import { SearchQuestionsUseCase } from "../application/use-cases/SearchQuestionsUseCase";
import { SaveQuestionUseCase } from "../application/use-cases/SaveQuestionUseCase";
import { ImportBookUseCase } from "../application/use-cases/ImportBookUseCase";
import { Book } from "../domain/entities/Book";
import { Question } from "../domain/entities/Question";

// Curriculum Data Import
import { CURRICULUM_DATA } from "@/data/curriculum";
import { getAllCommitteeQuestions } from "@/lib/exam-generator/committeeBank";

export interface ExamEngineContainer {
  bookRepository: InMemoryBookRepository;
  questionRepository: InMemoryQuestionRepository;
  examRepository: InMemoryExamRepository;
  duplicateDetector: DuplicateDetectorService;
  contentAnalyzer: ContentAnalyzerService;
  aiGenerator: RuleBasedAiQuestionGenerator;
  validateQuestionUseCase: ValidateQuestionUseCase;
  analyzeQuestionBankUseCase: AnalyzeQuestionBankUseCase;
  expandQuestionBankUseCase: ExpandQuestionBankUseCase;
  generateExamUseCase: GenerateExamUseCase;
  searchQuestionsUseCase: SearchQuestionsUseCase;
  saveQuestionUseCase: SaveQuestionUseCase;
  importBookUseCase: ImportBookUseCase;
}

let containerInstance: ExamEngineContainer | null = null;

export function getExamEngineContainer(): ExamEngineContainer {
  if (containerInstance) {
    return containerInstance;
  }

  // 1. Build Primary Book entity from curriculum data (Data-driven)
  const primaryBookId = "it-secondary-2";
  const primaryBook: Book = {
    id: primaryBookId,
    slug: "programming-and-ai",
    title: "البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي",
    englishTitle: "Programming and Artificial Intelligence",
    subjectId: "programming-ai",
    subjectNameAr: "البرمجة والذكاء الاصطناعي",
    gradeId: "secondary-2",
    gradeNameAr: "الصف الثاني الثانوي (بكالوريا مصرية)",
    term: "الفصل الدراسي الأول",
    curriculumId: "egyptian-national-curriculum-2026",
    language: "ar",
    description: "كتاب الوزارة الرسمي لمادة البرمجة والذكاء الاصطناعي لطلاب الصف الثاني الثانوي الترم الأول.",
    version: "2026.1",
    colorTheme: "from-indigo-600 via-purple-600 to-pink-600",
    icon: "Cpu",
    chapters: CURRICULUM_DATA.map((ch) => ({
      id: ch.id,
      bookId: primaryBookId,
      title: ch.title,
      number: ch.number,
      order: ch.number,
      description: ch.description,
      pageStart: ch.pageStart,
      pageEnd: ch.pageEnd,
      lessons: ch.lessons.map((l, lIdx) => ({
        id: l.id,
        chapterId: ch.id,
        title: l.title,
        number: l.number,
        order: lIdx + 1,
        pageRange: l.pageRange,
        learningObjectives: l.learningObjectives,
        keyConcepts: l.keyConcepts,
        sections: l.sections.map((sec, sIdx) => ({
          id: sec.id,
          lessonId: l.id,
          title: sec.title,
          content: sec.content,
          order: sIdx + 1,
          table: sec.table,
        })),
        summary: l.summary,
        mainQuestion: l.keyQuestion,
        mainQuestionAnswer: l.mainQuestionAnswer,
      })),
    })),
  };

  // 2. Build Sample Second Book to prove Multi-Book architecture
  const secondBookId = "cs-foundations-grade1";
  const secondBook: Book = {
    id: secondBookId,
    slug: "cs-foundations",
    title: "مبادئ علوم الحاسب والخوارزميات — الصف الأول الثانوي",
    englishTitle: "Foundations of Computer Science and Algorithms",
    subjectId: "computer-science",
    subjectNameAr: "مبادئ علوم الحاسب",
    gradeId: "secondary-1",
    gradeNameAr: "الصف الأول الثانوي",
    term: "الفصل الدراسي الأول",
    curriculumId: "egyptian-national-curriculum-2026",
    language: "ar",
    description: "مقرر أساسيات علوم الحاسب والتفكير الحسابي وهياكل البيانات الأساسية والخوارزميات.",
    version: "2026.1",
    colorTheme: "from-teal-600 to-emerald-700",
    icon: "Code",
    chapters: [
      {
        id: "cs1-ch1",
        bookId: secondBookId,
        title: "التفكير الحسابي والخوارزميات",
        number: 1,
        order: 1,
        description: "مبادئ حل المشكلات، المخططات الانسيابية، وكتابة الخوارزميات.",
        lessons: [
          {
            id: "cs1-l1",
            chapterId: "cs1-ch1",
            title: "مفهوم الخوارزمية وخرائط التدفق",
            number: "1-1",
            order: 1,
            pageRange: "6 - 15",
            keyConcepts: [
              {
                termAr: "الخوارزمية",
                termEn: "Algorithm",
                definition: "مجموعة مرتبة من الخطوات المنطقية المتسلسلة والمحددة لحل مسألة أو إنجاز مهمة معينة.",
              },
              {
                termAr: "خريطة التدفق",
                termEn: "Flowchart",
                definition: "تمثيل بصري رسومي يوضح خطوات الخوارزمية باستخدام أشكال هندسية قياسية وأسهم اتجاه.",
              },
            ],
            sections: [
              {
                id: "cs1-sec1",
                lessonId: "cs1-l1",
                title: "1. خصائص الخوارزمية الفعالة",
                content: "تتميز الخوارزمية الفعالة بالوضوح التام، ووجود مدخلات ومخرجات محددة، والانتهاء بعد عدد محدد من الخطوات.",
                order: 1,
              },
            ],
          },
        ],
      },
    ],
  };

  // 3. Convert all curated questions into generic Question entities
  const rawQuestions = getAllCommitteeQuestions();
  const domainQuestions: Question[] = rawQuestions.map((q) => {
    let diff: any = q.difficulty;
    if (diff === "higher_order") diff = "advanced";

    let cog: any = q.cognitiveLevel;
    if (cog === "higher_order") cog = "integration";

    let qType: any = q.questionType;
    if (qType === "term") qType = "definition";

    return {
      id: q.id,
      bookId: primaryBookId,
      chapterId: q.chapterId,
      lessonId: q.lessonId,
      type: qType,
      question: q.question,
      modelAnswer: q.modelAnswer,
      sourceText: q.textbookExactAnswer || q.explanation,
      sourceReference: {
        bookId: primaryBookId,
        chapterId: q.chapterId,
        lessonId: q.lessonId,
        pageNumber: q.page,
        formattedText: q.sourceReference,
      },
      difficulty: diff,
      cognitiveLevel: cog,
      marks: q.marks || 2,
      estimatedTime: q.estimatedTimeMinutes || 2,
      options: q.options,
      matchingPairs: q.matchingPairs,
      orderItems: q.orderItems,
      oddItemData: q.oddItemData,
      classificationData: q.classificationData,
      rubricCriteria: q.rubricCriteria,
      keywords: q.keywords,
      status: "approved",
      generationSource: "manual",
      isCrossLesson: q.isCrossLesson,
      connectedLessonIds: q.connectedLessons,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Add initial questions for Book 2
  domainQuestions.push({
    id: "Q-CS1-1",
    bookId: secondBookId,
    chapterId: "cs1-ch1",
    lessonId: "cs1-l1",
    type: "definition",
    question: "اكتب المصطلح العلمي: «مجموعة مرتبة من الخطوات المنطقية المتسلسلة والمحددة لحل مسألة معينة».",
    modelAnswer: "الخوارزمية (Algorithm)",
    sourceText: "الخوارزمية: مجموعة مرتبة من الخطوات المنطقية المتسلسلة والمحددة لحل مسألة معينة.",
    sourceReference: {
      bookId: secondBookId,
      chapterId: "cs1-ch1",
      lessonId: "cs1-l1",
      pageNumber: "6 - 15",
      formattedText: "مبادئ علوم الحاسب → الدرس 1-1 → ص 6",
    },
    difficulty: "easy",
    cognitiveLevel: "recall",
    marks: 2,
    keywords: ["خوارزمية", "Algorithm"],
    status: "approved",
    generationSource: "manual",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  domainQuestions.push({
    id: "Q-CS1-2",
    bookId: secondBookId,
    chapterId: "cs1-ch1",
    lessonId: "cs1-l1",
    type: "mcq",
    question: "يُستخدم الشكل المعين (Diamond) في خرائط التدفق لتمثيل:",
    modelAnswer: "b",
    options: [
      { id: "a", text: "بداية ونهاية البرنامج" },
      { id: "b", text: "اتخاذ القرار أو المقارنة الشرطية (Decision)" },
      { id: "c", text: "إدخال وإخراج البيانات" },
      { id: "d", text: "العمليات الحسابية المباشرة" },
    ],
    sourceReference: {
      bookId: secondBookId,
      chapterId: "cs1-ch1",
      lessonId: "cs1-l1",
      pageNumber: "8",
      formattedText: "مبادئ علوم الحاسب → الدرس 1-1 → خرائط التدفق",
    },
    difficulty: "medium",
    cognitiveLevel: "understanding",
    marks: 1,
    keywords: ["خريطة تدفق", "شكل معين", "اتخاذ القرار"],
    status: "approved",
    generationSource: "manual",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 4. Instantiate Repositories
  const bookRepository = new InMemoryBookRepository([primaryBook, secondBook]);
  const questionRepository = new InMemoryQuestionRepository(domainQuestions);
  const examRepository = new InMemoryExamRepository();

  // 5. Instantiate Services
  const duplicateDetector = new DuplicateDetectorService();
  const contentAnalyzer = new ContentAnalyzerService();
  const aiGenerator = new RuleBasedAiQuestionGenerator();

  // 6. Instantiate Use Cases
  const validateQuestionUseCase = new ValidateQuestionUseCase(duplicateDetector);
  const analyzeQuestionBankUseCase = new AnalyzeQuestionBankUseCase(questionRepository, bookRepository);
  const expandQuestionBankUseCase = new ExpandQuestionBankUseCase(
    questionRepository,
    bookRepository,
    aiGenerator,
    validateQuestionUseCase
  );
  const generateExamUseCase = new GenerateExamUseCase(
    questionRepository,
    bookRepository,
    examRepository,
    expandQuestionBankUseCase
  );
  const searchQuestionsUseCase = new SearchQuestionsUseCase(questionRepository);
  const saveQuestionUseCase = new SaveQuestionUseCase(questionRepository, validateQuestionUseCase);
  const importBookUseCase = new ImportBookUseCase(bookRepository, questionRepository);

  containerInstance = {
    bookRepository,
    questionRepository,
    examRepository,
    duplicateDetector,
    contentAnalyzer,
    aiGenerator,
    validateQuestionUseCase,
    analyzeQuestionBankUseCase,
    expandQuestionBankUseCase,
    generateExamUseCase,
    searchQuestionsUseCase,
    saveQuestionUseCase,
    importBookUseCase,
  };

  return containerInstance;
}
