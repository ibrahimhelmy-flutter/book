import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonRef, getStoryline, lessonHref, requirePart, staticParams, type PartRouteParams } from "@/content";
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
  const { storyline } = load(await params);
  if (!storyline) return { title: "تسلسل الأفكار غير موجود" };
  const title = `تسلسل الأفكار: ${storyline.title} (${storyline.lessonNumber})`;
  const description = storyline.keyQuestion.text;
  return { title, description, openGraph: { title, description } };
}

export default async function StorylinePage({ params }: Props) {
  const { part, storyline } = load(await params);
  if (!storyline) notFound();
  return <StorylinePageContent storyline={storyline} lessonUrl={lessonHref(part.key, storyline.chapterId, storyline.lessonSlug)} />;
}
