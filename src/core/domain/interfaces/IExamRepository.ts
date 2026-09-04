import { Exam } from "../entities/Exam";

export interface IExamRepository {
  save(exam: Exam): Promise<void>;
  saveBatch(exams: Exam[]): Promise<void>;
  getById(id: string): Promise<Exam | null>;
  getByBook(bookId: string): Promise<Exam[]>;
}
