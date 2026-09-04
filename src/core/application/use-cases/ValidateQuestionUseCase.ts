import { Question } from "../../domain/entities/Question";
import { IDuplicateDetector } from "../../domain/interfaces/IDuplicateDetector";
import { QUESTION_TYPES_CONFIG } from "../../config/question-types.config";
import { DIFFICULTY_CONFIG } from "../../config/difficulty.config";
import { COGNITIVE_CONFIG } from "../../config/cognitive.config";

export interface QuestionValidationResult {
  isValid: boolean;
  score: number; // 0 to 10
  issues: string[];
}

export class ValidateQuestionUseCase {
  constructor(private duplicateDetector?: IDuplicateDetector) {}

  public execute(question: Question, existingQuestions: Question[] = []): QuestionValidationResult {
    const issues: string[] = [];
    let score = 10;

    // 1. Question text non-empty and sufficient
    if (!question.question || question.question.trim().length < 8) {
      issues.push("نص السؤال قصير جداً أو غير مكتمل");
      score -= 3;
    }

    // 2. Model answer present and sufficient
    if (!question.modelAnswer || question.modelAnswer.trim().length === 0) {
      issues.push("الإجابة النموذجية مفقودة");
      score -= 3;
    }

    // 3. Question type valid
    if (!question.type || !QUESTION_TYPES_CONFIG[question.type]) {
      issues.push("نوع السؤال غير معتمد في المنظومة");
      score -= 2;
    }

    // 4. Difficulty valid
    if (!question.difficulty || !DIFFICULTY_CONFIG[question.difficulty]) {
      issues.push("مستوى الصعوبة غير قياسي");
      score -= 1;
    }

    // 5. Cognitive level valid
    if (!question.cognitiveLevel || !COGNITIVE_CONFIG[question.cognitiveLevel]) {
      issues.push("المستوى المعرفي غير قياسي");
      score -= 1;
    }

    // 6. MCQ specific validation
    if (question.type === "mcq") {
      if (!question.options || question.options.length < 2) {
        issues.push("سؤال الاختيار من متعدد يحتاج إلى خيارين على الأقل");
        score -= 2;
      }
    }

    // 7. Source Reference presence
    if (!question.bookId) {
      issues.push("الكتاب المصدر غير محدد (Missing bookId)");
      score -= 2;
    }

    // 8. Marks validity
    if (typeof question.marks !== "number" || question.marks <= 0) {
      issues.push("درجة السؤال يجب أن تكون أكبر من صفر");
      score -= 1;
    }

    // 9. Duplicate detection
    if (this.duplicateDetector && existingQuestions.length > 0) {
      const dupCheck = this.duplicateDetector.check(question, existingQuestions);
      if (dupCheck.isDuplicate) {
        issues.push(`تم اكتشاف تكرار دلالي مع سؤال سابق: ${dupCheck.reason || ""}`);
        score -= 4;
      }
    }

    const isValid = score >= 7;

    return {
      isValid,
      score: Math.max(0, score),
      issues,
    };
  }
}
