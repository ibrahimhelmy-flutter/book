import { IBookRepository } from "../../domain/interfaces/IBookRepository";
import { IQuestionRepository } from "../../domain/interfaces/IQuestionRepository";
import { Book } from "../../domain/entities/Book";
import { Chapter } from "../../domain/entities/Chapter";
import { Lesson } from "../../domain/entities/Lesson";
import { ContentSection } from "../../domain/entities/ContentSection";
import { Question } from "../../domain/entities/Question";

export interface RawBookImportPayload {
  id: string;
  title: string;
  englishTitle?: string;
  subjectNameAr: string;
  gradeNameAr: string;
  curriculumId?: string;
  description: string;
  version?: string;
  chapters: {
    id: string;
    number: number;
    title: string;
    description?: string;
    lessons: {
      id: string;
      number: string;
      title: string;
      pageRange?: string;
      learningObjectives?: string[];
      keyConcepts?: { termAr: string; termEn?: string; definition: string }[];
      sections?: {
        id: string;
        title: string;
        content: string;
        order?: number;
      }[];
      questions?: any[];
    }[];
  }[];
}

export class ImportBookUseCase {
  constructor(
    private bookRepository: IBookRepository,
    private questionRepository?: IQuestionRepository
  ) {}

  public async execute(payload: RawBookImportPayload): Promise<{
    book: Book;
    totalChapters: number;
    totalLessons: number;
    importedQuestionsCount: number;
  }> {
    if (!payload.id || !payload.title) {
      throw new Error("Invalid book import payload: id and title are required");
    }

    const chapters: Chapter[] = (payload.chapters || []).map((rawCh, chIdx) => {
      const lessons: Lesson[] = (rawCh.lessons || []).map((rawL, lIdx) => {
        const sections: ContentSection[] = (rawL.sections || []).map((rawS, sIdx) => ({
          id: rawS.id || `sec-${rawL.id}-${sIdx + 1}`,
          lessonId: rawL.id,
          title: rawS.title || `قسم ${sIdx + 1}`,
          content: rawS.content || "",
          order: rawS.order !== undefined ? rawS.order : sIdx + 1,
        }));

        return {
          id: rawL.id,
          chapterId: rawCh.id,
          title: rawL.title,
          number: rawL.number || `${chIdx + 1}-${lIdx + 1}`,
          order: lIdx + 1,
          pageRange: rawL.pageRange,
          learningObjectives: rawL.learningObjectives || [],
          keyConcepts: rawL.keyConcepts || [],
          sections,
        };
      });

      return {
        id: rawCh.id,
        bookId: payload.id,
        title: rawCh.title,
        number: rawCh.number || chIdx + 1,
        order: chIdx + 1,
        description: rawCh.description,
        lessons,
      };
    });

    const book: Book = {
      id: payload.id,
      title: payload.title,
      englishTitle: payload.englishTitle,
      subjectId: payload.subjectNameAr ? payload.subjectNameAr.toLowerCase() : "general",
      subjectNameAr: payload.subjectNameAr || payload.title,
      gradeId: payload.gradeNameAr ? payload.gradeNameAr.toLowerCase() : "general",
      gradeNameAr: payload.gradeNameAr || "عام",
      curriculumId: payload.curriculumId || "general-curriculum",
      language: "ar",
      description: payload.description || "",
      version: payload.version || "1.0.0",
      chapters,
    };

    // Save book entity in repository
    await this.bookRepository.save(book);

    // Extract questions if provided in raw payload
    let importedQuestionsCount = 0;
    if (this.questionRepository) {
      const extractedQuestions: Question[] = [];

      payload.chapters.forEach((ch) => {
        ch.lessons.forEach((l) => {
          if (Array.isArray(l.questions)) {
            l.questions.forEach((rawQ, qIdx) => {
              const q: Question = {
                id: rawQ.id || `Q-${payload.id}-${l.id}-${qIdx + 1}`,
                bookId: payload.id,
                chapterId: ch.id,
                lessonId: l.id,
                type: rawQ.type || "mcq",
                question: rawQ.questionText || rawQ.question || "",
                modelAnswer: Array.isArray(rawQ.correctAnswer)
                  ? rawQ.correctAnswer.join(" / ")
                  : String(rawQ.correctAnswer || rawQ.modelAnswer || ""),
                sourceText: rawQ.sourceText || rawQ.explanation,
                sourceReference: {
                  bookId: payload.id,
                  chapterId: ch.id,
                  lessonId: l.id,
                  formattedText: `${ch.title} → ${l.title}`,
                },
                difficulty: rawQ.difficulty || (qIdx < 5 ? "easy" : qIdx < 12 ? "medium" : "hard"),
                cognitiveLevel: rawQ.cognitiveLevel || (qIdx < 5 ? "recall" : qIdx < 12 ? "understanding" : "analysis"),
                marks: rawQ.marks || 2,
                options: rawQ.options,
                status: "approved",
                generationSource: "manual",
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              extractedQuestions.push(q);
            });
          }
        });
      });

      if (extractedQuestions.length > 0) {
        await this.questionRepository.saveBatch(extractedQuestions);
        importedQuestionsCount = extractedQuestions.length;
      }
    }

    const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

    return {
      book,
      totalChapters: chapters.length,
      totalLessons,
      importedQuestionsCount,
    };
  }
}
