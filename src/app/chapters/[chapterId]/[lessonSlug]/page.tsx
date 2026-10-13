import React from "react";
import type { Metadata } from "next";
import { getLegacyPartKey, getPartManifest, lessonHref } from "@/content";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return getPartManifest(getLegacyPartKey()).chapters.flatMap((c) => c.lessons.map((l) => ({ chapterId: c.id, lessonSlug: l.slug })));
}

export default async function LegacyLessonPage({ params }: { params: Promise<{ chapterId: string; lessonSlug: string }> }) {
  const { chapterId, lessonSlug } = await params;
  return <LegacyRedirect to={lessonHref(getLegacyPartKey(), chapterId, lessonSlug)} />;
}
