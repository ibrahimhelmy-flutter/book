import { IExamRepository } from "../../domain/interfaces/IExamRepository";
import { Exam } from "../../domain/entities/Exam";

export class InMemoryExamRepository implements IExamRepository {
  private exams: Map<string, Exam> = new Map();

  public async save(exam: Exam): Promise<void> {
    this.exams.set(exam.id, exam);
  }

  public async saveBatch(exams: Exam[]): Promise<void> {
    exams.forEach((e) => this.exams.set(e.id, e));
  }

  public async getById(id: string): Promise<Exam | null> {
    return this.exams.get(id) || null;
  }

  public async getByBook(bookId: string): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter((e) => e.bookId === bookId);
  }
}
