import type { LessonSection } from "@/types";

/** Sections the book prints as headings of their own (sub-items carry `parentId`). */
export function topLevelSections(sections: LessonSection[]): LessonSection[] {
  return sections.filter((s) => !s.parentId);
}

/** Display numbers that follow the book's headings: "1", "2", then "2.1", "2.2" for a heading's sub-items. */
export function sectionNumbers(sections: LessonSection[]): Map<string, string> {
  const numbers = new Map<string, string>();
  const childCounts = new Map<string, number>();
  let top = 0;
  for (const sec of sections) {
    const parent = sec.parentId ? numbers.get(sec.parentId) : undefined;
    if (parent) {
      const k = (childCounts.get(sec.parentId!) || 0) + 1;
      childCounts.set(sec.parentId!, k);
      numbers.set(sec.id, `${parent}.${k}`);
    } else {
      numbers.set(sec.id, String(++top));
    }
  }
  return numbers;
}
