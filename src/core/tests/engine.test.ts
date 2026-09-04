/**
 * Comprehensive Architectural & Domain Test Suite
 * Validates:
 * 1. Domain Validation & Difficulty rules
 * 2. Duplicate Detection
 * 3. Application Use Cases (Generate, Search, Save, Expand)
 * 4. Multi-Book Scalability (Adding Book B doesn't affect Book A)
 * 5. Deterministic Randomization with Seeds
 */

import { getExamEngineContainer } from "../infrastructure/bootstrap";
import { Question } from "../domain/entities/Question";
import { ExamGenerationRequest } from "../application/dtos/ExamGenerationDTO";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING SCALABLE EXAM ENGINE ARCHITECTURE TESTS");
  console.log("=================================================");

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failCount++;
    }
  }

  const container = getExamEngineContainer();

  // ==========================================
  // TEST SUITE 1: DOMAIN VALIDATION & QUALITY
  // ==========================================
  console.log("\n--- Suite 1: Domain Validation & Quality Rules ---");

  const validQuestion: Question = {
    id: "TEST-Q-1",
    bookId: "it-secondary-2",
    lessonId: "lesson-1-1",
    type: "mcq",
    question: "ما هو قانون مور في تطور الدوائر المتكاملة؟",
    modelAnswer: "a",
    options: [
      { id: "a", text: "تضاعف عدد الترانزستورات كل عامين" },
      { id: "b", text: "ثبات سرعة المعالجات" },
    ],
    difficulty: "easy",
    cognitiveLevel: "recall",
    marks: 1,
    status: "approved",
    generationSource: "manual",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validation1 = container.validateQuestionUseCase.execute(validQuestion);
  assert(validation1.isValid, "Valid question passes 10-point validation");

  const invalidQuestion: Question = {
    id: "TEST-Q-INVALID",
    bookId: "", // missing
    type: "mcq",
    question: "قصير",
    modelAnswer: "", // empty
    difficulty: "easy",
    cognitiveLevel: "recall",
    marks: 0,
    status: "draft",
    generationSource: "ai",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validation2 = container.validateQuestionUseCase.execute(invalidQuestion);
  assert(!validation2.isValid, "Invalid question with empty answer and missing bookId is rejected");
  assert(validation2.issues.length >= 3, "Validation accurately reports multiple issues");

  // ==========================================
  // TEST SUITE 2: DUPLICATE DETECTION
  // ==========================================
  console.log("\n--- Suite 2: Duplicate Detection ---");

  const dupCandidate: Question = {
    ...validQuestion,
    id: "TEST-Q-DUP",
    question: "ما هو قانون مور في تطور الدوائر المتكاملة ؟ ", // near identical with spaces
  };

  const dupResult = container.duplicateDetector.check(dupCandidate, [validQuestion]);
  assert(dupResult.isDuplicate, "Semantic & whitespace normalizer catches duplicate question");

  // ==========================================
  // TEST SUITE 3: REPOSITORY & SEARCH
  // ==========================================
  console.log("\n--- Suite 3: Repository & Search ---");

  const allPrimaryQuestions = await container.questionRepository.findByBook("it-secondary-2");
  assert(allPrimaryQuestions.length >= 250, "Repository contains primary book question bank (>250 questions)");

  const searchMCQ = await container.searchQuestionsUseCase.execute({
    bookId: "it-secondary-2",
    type: "mcq",
  });
  assert(searchMCQ.length > 0 && searchMCQ.every((q) => q.type === "mcq"), "Search by type accurately filters MCQs");

  // ==========================================
  // TEST SUITE 4: QUESTION BANK ANALYSIS & GAPS
  // ==========================================
  console.log("\n--- Suite 4: Question Bank Coverage Analysis ---");

  const analysisReport = await container.analyzeQuestionBankUseCase.execute("it-secondary-2");
  assert(analysisReport.totalQuestions >= 250, "Coverage report correctly tallies total questions");
  assert(analysisReport.coveragePercentage > 90, "Primary book has >90% curriculum coverage");
  assert(analysisReport.difficultyCounts.easy > 0, "Coverage tracks easy difficulty questions");
  assert(analysisReport.difficultyCounts.medium > 0, "Coverage tracks medium difficulty questions");
  assert(analysisReport.difficultyCounts.hard > 0, "Coverage tracks hard difficulty questions");

  // ==========================================
  // TEST SUITE 5: EXAM GENERATION & MULTI-MODELS
  // ==========================================
  console.log("\n--- Suite 5: Exam Generation Engine ---");

  const examReq: ExamGenerationRequest = {
    bookId: "it-secondary-2",
    scope: { type: "curriculum", bookId: "it-secondary-2" },
    questionCount: 30,
    examCount: 3,
    questionTypes: "all",
    difficultyDistribution: { easy: 25, medium: 40, hard: 25, advanced: 10 },
    durationMinutes: 60,
    totalMarks: 60,
    includeAnswers: true,
    includeSourceReferences: true,
    allowAiGeneration: false,
    saveGeneratedQuestions: false,
    seed: "FIXED-SEED-2026",
  };

  const examResult = await container.generateExamUseCase.execute(examReq);
  assert(examResult.exams.length === 3, "Successfully generates 3 parallel exam models");
  assert(examResult.exams[0].allQuestions.length === 30, "Model A has exact requested 30 questions");
  assert(examResult.exams[1].allQuestions.length === 30, "Model B has exact requested 30 questions");
  assert(examResult.exams[0].sections.length >= 3, "Exam has categorized sections (A, B, C...)");

  // Deterministic Seed Verification: Same seed -> identical first question
  const repeatExamResult = await container.generateExamUseCase.execute(examReq);
  assert(
    examResult.exams[0].allQuestions[0].id === repeatExamResult.exams[0].allQuestions[0].id,
    "Deterministic seed produces reproducible exam questions"
  );

  // ==========================================
  // TEST SUITE 6: MULTI-BOOK & REGRESSION
  // ==========================================
  console.log("\n--- Suite 6: Multi-Book Support & Zero Hardcoding Regression ---");

  const books = await container.bookRepository.getAll();
  assert(books.length >= 2, "System supports multiple books simultaneously in registry");

  const secondBookId = "cs-foundations-grade1";
  const secondBookQuestions = await container.questionRepository.findByBook(secondBookId);
  assert(secondBookQuestions.length > 0, "Second book has its own independent question bank");

  // Generate exam for Second Book using the exact same engine
  const secondBookExamReq: ExamGenerationRequest = {
    bookId: secondBookId,
    scope: { type: "book", bookId: secondBookId },
    questionCount: "max",
    examCount: 1,
    questionTypes: "all",
    difficultyDistribution: { easy: 50, medium: 50, hard: 0, advanced: 0 },
    includeAnswers: true,
    includeSourceReferences: true,
    allowAiGeneration: false,
    saveGeneratedQuestions: false,
  };

  const secondExamResult = await container.generateExamUseCase.execute(secondBookExamReq);
  assert(secondExamResult.exams.length === 1, "Same exam engine generates exam for Book 2 without code change");
  assert(secondExamResult.exams[0].bookId === secondBookId, "Exam metadata strictly matches Book 2");

  // Dynamic Book Import Test
  const importResult = await container.importBookUseCase.execute({
    id: "dynamic-imported-book",
    title: "مقرر الذكاء الاصطناعي التجريبي",
    subjectNameAr: "ذكاء تجريبي",
    gradeNameAr: "الصف الثالث",
    description: "كتاب تجريبي لاختبار استيراد البيانات دون كود.",
    chapters: [
      {
        id: "dyn-ch1",
        number: 1,
        title: "الفصل التجريبي",
        lessons: [
          {
            id: "dyn-l1",
            number: "1-1",
            title: "الدرس التجريبي",
            sections: [{ id: "s1", title: "مقدمة", content: "محتوى تجريبي للدرس" }],
            questions: [
              {
                id: "dyn-q1",
                type: "definition",
                question: "ما هو المفهوم التجريبي؟",
                correctAnswer: "مفهوم تم اختباره بنجاح",
              },
            ],
          },
        ],
      },
    ],
  });

  assert(importResult.totalChapters === 1, "Dynamic book import successfully parses chapters");
  assert(importResult.importedQuestionsCount === 1, "Dynamic book import successfully imports questions");
  const dynBook = await container.bookRepository.getById("dynamic-imported-book");
  assert(dynBook !== null, "Imported book is registered and immediately queryable");

  // Final summary
  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test Suite crashed:", e);
  process.exit(1);
});
