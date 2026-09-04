import { Chapter } from "./Chapter";

export interface Book {
  id: string;
  slug?: string;
  title: string;
  englishTitle?: string;
  subjectId: string;
  subjectNameAr: string;
  gradeId: string;
  gradeNameAr: string;
  term?: string;
  curriculumId: string;
  language: string;
  description: string;
  version: string;
  chapters: Chapter[];
  colorTheme?: string;
  icon?: string;
}
