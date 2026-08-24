import React from "react";
import { notFound } from "next/navigation";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { LessonContent } from "@/components/lesson/LessonContent";

interface Props {
  params: Promise<{
    chapterId: string;
    lessonSlug: string;
  }>;
}

export default async function LessonPage({ params }: Props) {
  const resolvedParams = await params;
  const { chapterId, lessonSlug } = resolvedParams;

  const chapter = CURRICULUM_DATA.find((c) => c.id === chapterId);
  if (!chapter) return notFound();

  const lessonIndex = chapter.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return notFound();

  const lesson = chapter.lessons[lessonIndex];

  // Calculate previous and next lessons across all chapters
  const allLessons = CURRICULUM_DATA.flatMap((ch) =>
    ch.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      number: l.number,
      chapterId: ch.id,
      slug: l.slug,
    }))
  );

  const globalIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = globalIndex > 0 ? allLessons[globalIndex - 1] : undefined;
  const nextLesson = globalIndex < allLessons.length - 1 ? allLessons[globalIndex + 1] : undefined;

  return (
    <LessonContent
      lesson={lesson}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}

export function generateStaticParams() {
  return CURRICULUM_DATA.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      chapterId: chapter.id,
      lessonSlug: lesson.slug,
    }))
  );
}
