import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  findLessonRef,
  getDeepQuestions,
  getGlossary,
  getLesson,
  getLessonNav,
  getSimulatorsForLesson,
  requirePart,
  staticParams,
  type PartRouteParams,
} from "@/content";
import { countQuestionsPerSection } from "@/lib/comprehension-matcher";
import { LessonContent, type LessonQuizSummary } from "@/components/lesson/LessonContent";

interface Props {
  params: Promise<PartRouteParams & { chapterId: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return staticParams.lessons();
}

function load(params: Awaited<Props["params"]>) {
  const { chapterId, lessonSlug, ...ref } = params;
  const part = requirePart(ref);
  const lessonRef = findLessonRef(part.key, chapterId, lessonSlug);
  const lesson = lessonRef ? getLesson(part.key, lessonRef.id) : null;
  const chapter = part.chapters.find((c) => c.id === chapterId);
  return { part, lesson, chapter };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part, lesson, chapter } = load(await params);
  if (!lesson || !chapter) return { title: "الدرس غير موجود" };
  const description = Array.isArray(lesson.summary) ? lesson.summary.slice(0, 2).join(" ") : lesson.coreIdea || lesson.title;
  return {
    title: `${lesson.title} (${lesson.number}) | ${part.bookTitle} — ${part.partShortTitle}`,
    description,
    keywords: [lesson.title, lesson.englishTitle, chapter.title, ...lesson.keyConcepts.map((k) => k.termAr)],
    openGraph: { title: `${lesson.title} - ${lesson.englishTitle}`, description },
  };
}

export default async function LessonPage({ params }: Props) {
  const { part, lesson } = load(await params);
  if (!lesson) notFound();

  const { prev, next } = getLessonNav(part.key, lesson.id);
  const companion = part.companions.find((c) => c.kind === "assessments" && c.status === "available");
  const companionLesson = companion?.lessons.find((l) => l.lessonId === lesson.id);
  const deepQuestions = getDeepQuestions(part.key, lesson.number);

  // Everything below is computed at build time so the client never loads a question bank up front.
  const quiz: LessonQuizSummary = {
    officialCount: companionLesson?.totalQuestions ?? 0,
    deepCount: deepQuestions.length,
    deepCountsBySection: countQuestionsPerSection(deepQuestions, lesson),
    companion: companion && companionLesson ? { slug: companion.slug, title: companion.title, bookletPages: companionLesson.bookletPages } : null,
  };
  const glossary = getGlossary(part.key).filter((g) => g.lessonNumber === lesson.number);

  return (
    <LessonContent
      lesson={lesson}
      prevLesson={prev}
      nextLesson={next}
      simulators={getSimulatorsForLesson(part.key, lesson)}
      glossary={glossary}
      quiz={quiz}
    />
  );
}
