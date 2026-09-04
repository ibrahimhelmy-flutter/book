/**
 * Value Object: Source Reference
 * Traceability back to exact textbook origin.
 */

export interface SourceReference {
  bookId: string;
  chapterId?: string;
  lessonId?: string;
  sectionId?: string;
  pageNumber?: string | number;
  paragraphIndex?: number;
  formattedText?: string;
}

export function formatSourceReference(ref: SourceReference): string {
  if (ref.formattedText) return ref.formattedText;
  const parts: string[] = [];
  if (ref.chapterId) parts.push(`الفصل ${ref.chapterId}`);
  if (ref.lessonId) parts.push(`الدرس ${ref.lessonId}`);
  if (ref.sectionId) parts.push(`قسم: ${ref.sectionId}`);
  if (ref.pageNumber) parts.push(`ص ${ref.pageNumber}`);
  return parts.join(" → ") || ref.bookId;
}
