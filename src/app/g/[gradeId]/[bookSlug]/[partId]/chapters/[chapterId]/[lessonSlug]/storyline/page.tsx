import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { chapterHref, findLessonRef, getStoryline, lessonHref, requirePart, staticParams, storylineHref, type PartRouteParams } from "@/content";
import { breadcrumbJsonLd, pageMetadata, partTrail } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { StorylinePageContent } from "@/components/storyline/StorylinePageContent";

interface Props {
  params: Promise<PartRouteParams & { chapterId: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return staticParams.storylines();
}

function load(params: Awaited<Props["params"]>) {
  const { chapterId, lessonSlug, ...ref } = params;
  const part = requirePart(ref);
  const lessonRef = findLessonRef(part.key, chapterId, lessonSlug);
  return { part, storyline: lessonRef ? getStoryline(part.key, lessonRef.id) : null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part, storyline } = load(await params);
  if (!storyline) return { title: "تسلسل الأفكار غير موجود" };
  return pageMetadata({
    title: `تسلسل الأفكار: ${storyline.title} (${storyline.lessonNumber})`,
    description: storyline.keyQuestion.text,
    path: storylineHref(part.key, storyline.chapterId, storyline.lessonSlug),
    type: "article",
  });
}

export default async function StorylinePage({ params }: Props) {
  const { part, storyline } = load(await params);
  if (!storyline) notFound();
  const lessonUrl = lessonHref(part.key, storyline.chapterId, storyline.lessonSlug);
  const chapter = part.chapters.find((c) => c.id === storyline.chapterId);
  const trail = [
    ...partTrail(part),
    ...(chapter ? [{ name: `الفصل ${chapter.number}: ${chapter.title}`, path: chapterHref(part.key, chapter.id) }] : []),
    { name: `${storyline.title} (${storyline.lessonNumber})`, path: lessonUrl },
    { name: "تسلسل الأفكار", path: storylineHref(part.key, storyline.chapterId, storyline.lessonSlug) },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <StorylinePageContent storyline={storyline} lessonUrl={lessonUrl} />
    </>
  );
}
