import { ContentSection } from "./ContentSection";

export interface KeyConceptEntity {
  termAr: string;
  termEn?: string;
  definition: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  number: string;
  order: number;
  pageRange?: string;
  learningObjectives?: string[];
  keyConcepts?: KeyConceptEntity[];
  sections: ContentSection[];
  summary?: string[];
  mainQuestion?: string;
  mainQuestionAnswer?: string;
}
