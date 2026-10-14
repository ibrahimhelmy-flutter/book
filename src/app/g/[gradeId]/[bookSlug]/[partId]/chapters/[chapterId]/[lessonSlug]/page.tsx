import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  chapterHref,
  findLessonRef,
  getDeepQuestions,
  getGlossary,
  getLesson,
  getLessonNav,
  getSimulatorsForLesson,
  lessonHref,
  requirePart,
  staticParams,
  type PartRouteParams,
} from "@/content";
import { countQuestionsPerSection } from "@/lib/comprehension-matcher";
import { breadcrumbJsonLd, lessonJsonLd, pageMetadata, partTrail } from "@/lib/seo";
import { LessonContent, type LessonQuizSummary } from "@/components/lesson/LessonContent";
import { JsonLd } from "@/components/seo/JsonLd";

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

function describe(lesson: NonNullable<ReturnType<typeof load>["lesson"]>): string {
  return Array.isArray(lesson.summary) && lesson.summary.length ? lesson.summary.slice(0, 2).join(" ") : lesson.coreIdea || lesson.title;
}

function keywordsOf(lesson: NonNullable<ReturnType<typeof load>["lesson"]>, chapterTitle: string): string[] {
  return [lesson.title, lesson.englishTitle, chapterTitle, ...lesson.keyConcepts.map((k) => k.termAr)];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part, lesson, chapter } = load(await params);
  if (!lesson || !chapter) return { title: "الدرس غير موجود" };
  return pageMetadata({
    title: `${lesson.title} (${lesson.number}) | ${part.bookTitle} — ${part.partShortTitle}`,
    description: describe(lesson),
    keywords: keywordsOf(lesson, chapter.title),
    path: lessonHref(part.key, chapter.id, lesson.slug),
    type: "article",
  });
}

export default async function LessonPage({ params }: Props) {
  const { part, lesson, chapter } = load(await params);
  if (!lesson || !chapter) notFound();
  const path = lessonHref(part.key, chapter.id, lesson.slug);
  const trail = [
    ...partTrail(part),
    { name: `الفصل ${chapter.number}: ${chapter.title}`, path: chapterHref(part.key, chapter.id) },
    { name: `${lesson.title} (${lesson.number})`, path },
  ];

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
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(trail),
          lessonJsonLd({
            part,
            path,
            title: lesson.title,
            englishTitle: lesson.englishTitle,
            description: describe(lesson),
            objectives: lesson.learningObjectives,
            keywords: keywordsOf(lesson, chapter.title),
          }),
        ]}
      />
      <LessonContent
        lesson={lesson}
        prevLesson={prev}
        nextLesson={next}
        simulators={getSimulatorsForLesson(part.key, lesson)}
        glossary={glossary}
        quiz={quiz}
      />
    </>
  );
}
