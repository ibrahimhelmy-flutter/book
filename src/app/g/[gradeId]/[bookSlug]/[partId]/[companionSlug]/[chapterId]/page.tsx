import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { companionHref, partHref, requireCompanion, staticParams, type PartRouteParams } from "@/content";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CompanionToc } from "@/components/companion/CompanionToc";

interface Props {
  params: Promise<PartRouteParams & { companionSlug: string; chapterId: string }>;
}

export function generateStaticParams() {
  return staticParams.companionChapters();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterId, ...rest } = await params;
  const { part, companion } = requireCompanion(rest);
  const chapter = part.chapters.find((c) => c.id === chapterId);
  return { title: `${companion.title}: ${chapter?.title ?? ""} | ${part.bookTitle}` };
}

export default async function CompanionChapterPage({ params }: Props) {
  const { chapterId, ...rest } = await params;
  const { part, companion } = requireCompanion(rest);
  const chapter = part.chapters.find((c) => c.id === chapterId);
  if (!chapter) notFound();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: `${part.bookTitle} — ${part.partShortTitle}`, href: partHref(part.key) },
          { label: companion.title, href: companionHref(part.key, companion.slug) },
          { label: `الفصل ${chapter.number}` },
        ]}
      />
      <CompanionToc partKey={part.key} companion={companion} chapters={[chapter]} />
    </div>
  );
}
