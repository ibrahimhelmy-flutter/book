import { LessonStoryline } from "@/types/storyline";
import { CHAPTER_2_STORYLINES } from "./chapter-2";
import { GLOSSARY_DATA } from "@/data/glossary";
import { GlossaryTerm } from "@/types";

const ALL_STORYLINES: Record<string, Record<string, LessonStoryline>> = {
  "chapter-2": CHAPTER_2_STORYLINES,
};

export function getStorylineForLesson(
  chapterId: string,
  lessonSlugOrId: string
): LessonStoryline | null {
  const chapterStories = ALL_STORYLINES[chapterId];
  if (!chapterStories) return null;

  // Find by lessonId or lessonSlug
  for (const story of Object.values(chapterStories)) {
    if (story.lessonId === lessonSlugOrId || story.lessonSlug === lessonSlugOrId) {
      return story;
    }
  }

  return null;
}

export function getAllStorylinesList() {
  const list: { chapterId: string; lessonSlug: string; title: string; lessonNumber: string }[] = [];
  for (const [chId, chapterStories] of Object.entries(ALL_STORYLINES)) {
    for (const story of Object.values(chapterStories)) {
      list.push({
        chapterId: chId,
        lessonSlug: story.lessonSlug,
        title: story.title,
        lessonNumber: story.lessonNumber,
      });
    }
  }
  return list;
}

export function getLessonGlossaryTerms(lessonNumber: string): GlossaryTerm[] {
  return GLOSSARY_DATA.filter((term) => term.lessonNumber === lessonNumber);
}

export function getGlossaryTermsByIds(ids: string[]): GlossaryTerm[] {
  if (!ids || ids.length === 0) return [];
  const set = new Set(ids);
  return GLOSSARY_DATA.filter((term) => set.has(term.id));
}
