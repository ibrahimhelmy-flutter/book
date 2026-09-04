import { IContentAnalyzer, ContentAnalysisReport, ExtractedConcept } from "../../domain/interfaces/IContentAnalyzer";
import { Lesson } from "../../domain/entities/Lesson";

export class ContentAnalyzerService implements IContentAnalyzer {
  public analyzeLesson(lesson: Lesson): ContentAnalysisReport {
    const concepts: ExtractedConcept[] = (lesson.keyConcepts || []).map((kc) => ({
      term: kc.termAr,
      definition: kc.definition,
      importance: "high",
    }));

    const examinablePoints: string[] = [];
    if (lesson.learningObjectives) {
      examinablePoints.push(...lesson.learningObjectives);
    }
    lesson.sections.forEach((sec) => {
      examinablePoints.push(sec.title);
    });

    const recommendedQuestionCount = Math.max(15, concepts.length * 3 + lesson.sections.length * 2);

    return {
      lessonId: lesson.id,
      title: lesson.title,
      concepts,
      factsCount: concepts.length * 2 + lesson.sections.length * 3,
      sectionsCount: lesson.sections.length,
      examinablePoints,
      recommendedQuestionCount,
    };
  }
}
