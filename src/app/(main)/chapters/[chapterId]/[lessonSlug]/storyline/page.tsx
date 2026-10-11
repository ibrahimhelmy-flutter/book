import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { getStorylineForLesson } from "@/data/storylines";
import { StorylinePageContent } from "@/components/storyline/StorylinePageContent";

interface Props {
  params: Promise<{
    chapterId: string;
    lessonSlug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterId, lessonSlug } = await params;
  const storyline = getStorylineForLesson(chapterId, lessonSlug);

  if (!storyline) {
    return { title: "تسلسل الأفكار غير موجود" };
  }

  const title = `تسلسل الأفكار: ${storyline.title} (${storyline.lessonNumber})`;
  const description = storyline.keyQuestion.text;

  return {
    title: `${title} | منصة التعلم الذكي`,
    description,
    openGraph: { title, description },
  };
}

export default async function StorylinePage({ params }: Props) {
  const { chapterId, lessonSlug } = await params;
  const storyline = getStorylineForLesson(chapterId, lessonSlug);
  if (!storyline) return notFound();

  return <StorylinePageContent storyline={storyline} />;
}

export function generateStaticParams() {
  return CURRICULUM_DATA.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      chapterId: chapter.id,
      lessonSlug: lesson.slug,
    }))
  );
}
