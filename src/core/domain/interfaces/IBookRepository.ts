import { Book } from "../entities/Book";

export interface IBookRepository {
  getAll(): Promise<Book[]>;
  getById(id: string): Promise<Book | null>;
  save(book: Book): Promise<void>;
  exists(id: string): Promise<boolean>;
}
