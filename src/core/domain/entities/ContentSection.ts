/**
 * Generic Content Section Entity
 */

export interface ContentSection {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  order: number;
  pageNumber?: string | number;
  table?: {
    headers: string[];
    rows: string[][];
  };
  subsections?: {
    title: string;
    content: string;
  }[];
}
