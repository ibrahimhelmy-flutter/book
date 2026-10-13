import React from "react";
import type { Metadata } from "next";
import { getLegacyPartKey, getPartManifest, storylineHref } from "@/content";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  const manifest = getPartManifest(getLegacyPartKey());
  const ids = new Set(manifest.storylineLessonIds);
  return manifest.chapters.flatMap((c) => c.lessons.filter((l) => ids.has(l.id)).map((l) => ({ chapterId: c.id, lessonSlug: l.slug })));
}

export default async function LegacyStorylinePage({ params }: { params: Promise<{ chapterId: string; lessonSlug: string }> }) {
  const { chapterId, lessonSlug } = await params;
  return <LegacyRedirect to={storylineHref(getLegacyPartKey(), chapterId, lessonSlug)} />;
}
