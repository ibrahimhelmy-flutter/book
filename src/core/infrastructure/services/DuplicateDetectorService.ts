import { IDuplicateDetector, DuplicateCheckResult } from "../../domain/interfaces/IDuplicateDetector";
import { Question } from "../../domain/entities/Question";

function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // Diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟"']/g, "")
    .replace(/\s+/g, " ");
}

export class DuplicateDetectorService implements IDuplicateDetector {
  public check(candidate: Question, existingQuestions: Question[]): DuplicateCheckResult {
    const candNorm = normalizeArabic(candidate.question);
    const candAnswer = normalizeArabic(candidate.modelAnswer);

    for (const item of existingQuestions) {
      if (item.id === candidate.id) {
        return { isDuplicate: true, confidence: 1.0, matchedQuestionId: item.id, reason: "نفس المعرف المكرر (Duplicate ID)" };
      }

      const itemNorm = normalizeArabic(item.question);

      // 1. Exact string match after normalization
      if (candNorm === itemNorm) {
        return {
          isDuplicate: true,
          confidence: 1.0,
          matchedQuestionId: item.id,
          reason: "تطابق حرفي تام في نص السؤال",
        };
      }

      // 2. High substring overlap
      if (candNorm.length > 20 && itemNorm.length > 20) {
        if (candNorm.includes(itemNorm) || itemNorm.includes(candNorm)) {
          return {
            isDuplicate: true,
            confidence: 0.9,
            matchedQuestionId: item.id,
            reason: "تطابق جوهري في صياغة السؤال",
          };
        }
      }

      // 3. Same lesson, same type, same answer
      if (
        item.lessonId === candidate.lessonId &&
        item.type === candidate.type &&
        candAnswer.length > 5 &&
        candAnswer === normalizeArabic(item.modelAnswer)
      ) {
        return {
          isDuplicate: true,
          confidence: 0.95,
          matchedQuestionId: item.id,
          reason: "تكرار نفس الإجابة النموذجية لنفس نوع السؤال في ذات الدرس",
        };
      }
    }

    return { isDuplicate: false, confidence: 0 };
  }
}
