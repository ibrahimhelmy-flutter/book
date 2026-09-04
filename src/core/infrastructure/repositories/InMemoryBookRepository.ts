import { IBookRepository } from "../../domain/interfaces/IBookRepository";
import { Book } from "../../domain/entities/Book";

export class InMemoryBookRepository implements IBookRepository {
  private books: Map<string, Book> = new Map();

  constructor(initialBooks: Book[] = []) {
    initialBooks.forEach((b) => this.books.set(b.id, b));
  }

  public async getAll(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  public async getById(id: string): Promise<Book | null> {
    const book = this.books.get(id);
    if (book) return book;
    // Also try finding by slug
    for (const b of this.books.values()) {
      if (b.slug === id) return b;
    }
    return null;
  }

  public async save(book: Book): Promise<void> {
    this.books.set(book.id, book);
  }

  public async exists(id: string): Promise<boolean> {
    return this.books.has(id);
  }
}
