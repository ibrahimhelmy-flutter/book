import { Lesson } from "./Lesson";

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  number: number;
  order: number;
  description?: string;
  pageStart?: number;
  pageEnd?: number;
  lessons: Lesson[];
}
