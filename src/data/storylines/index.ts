import { LessonStoryline } from "@/types/storyline";
import { CHAPTER_1_STORYLINES } from "./chapter-1";
import { CHAPTER_2_STORYLINES } from "./chapter-2";
import { CHAPTER_3_STORYLINES } from "./chapter-3";
import { CHAPTER_4_STORYLINES } from "./chapter-4";

const ALL_STORYLINES: Record<string, Record<string, LessonStoryline>> = {
  "chapter-1": CHAPTER_1_STORYLINES,
  "chapter-2": CHAPTER_2_STORYLINES,
  "chapter-3": CHAPTER_3_STORYLINES,
  "chapter-4": CHAPTER_4_STORYLINES,
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
