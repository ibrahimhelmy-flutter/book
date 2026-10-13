import React from "react";
import type { Metadata } from "next";
import { getExamsIndex, requirePart, staticParams, type PartRouteParams } from "@/content";
import { ExamsView } from "@/components/exams/ExamsView";

interface Props {
  params: Promise<PartRouteParams>;
}

export function generateStaticParams() {
  return staticParams.parts();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const part = requirePart(await params);
  return { title: `بنك الأسئلة والامتحانات | ${part.bookTitle} — ${part.partShortTitle}` };
}

/** Counts render immediately from exams-index.json; the question banks are fetched per tab and scope. */
export default async function ExamsPage({ params }: Props) {
  const part = requirePart(await params);
  const official = part.companions.find((c) => c.kind === "assessments" && c.status === "available");
  return (
    <ExamsView
      partKey={part.key}
      chapters={part.chapters}
      examsIndex={getExamsIndex(part.key)}
      officialCompanionSlug={official?.slug ?? null}
    />
  );
}
