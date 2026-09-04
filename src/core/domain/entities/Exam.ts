import { Question } from "./Question";
import { ExamBlueprint } from "./ExamBlueprint";

export interface ExamSectionEntity {
  id: string;
  sectionKey: "A" | "B" | "C" | "D" | "E";
  title: string;
  subtitle: string;
  marks: number;
  questions: Question[];
}

export interface Exam {
  id: string;
  modelLetter: string; // أ، ب، جـ، د، هـ
  modelCode: string; // EXAM-2026-A
  title: string;
  bookId: string;
  subjectName: string;
  gradeName: string;
  academicYear?: string;
  durationMinutes: number;
  totalMarks: number;
  seed?: string;
  blueprint: ExamBlueprint;
  sections: ExamSectionEntity[];
  allQuestions: Question[];
  createdAt: string | Date;
}
