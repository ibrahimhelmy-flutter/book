import React from "react";
import type { Metadata } from "next";
import { chapterHref, getLegacyPartKey, getPartManifest } from "@/content";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return getPartManifest(getLegacyPartKey()).chapters.map((c) => ({ chapterId: c.id }));
}

export default async function LegacyChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  return <LegacyRedirect to={chapterHref(getLegacyPartKey(), chapterId)} />;
}
