import React from "react";
import type { Metadata } from "next";
import { getExamsIndex, partHref, requirePart, staticParams, type PartRouteParams } from "@/content";
import { breadcrumbJsonLd, pageMetadata, partTrail } from "@/lib/seo";
import { ExamsView } from "@/components/exams/ExamsView";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "بنك الأسئلة والامتحانات";

interface Props {
  params: Promise<PartRouteParams>;
}

export function generateStaticParams() {
  return staticParams.parts();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const part = requirePart(await params);
  return pageMetadata({
    title: `${TITLE} | ${part.bookTitle} — ${part.partShortTitle}`,
    description: `أسئلة تدريب واختبارات على دروس ${part.bookTitle} — ${part.gradeTitle} (${part.partTitle}).`,
    path: partHref(part.key, "exams"),
  });
}

/** Counts render immediately from exams-index.json; the question banks are fetched per tab and scope. */
export default async function ExamsPage({ params }: Props) {
  const part = requirePart(await params);
  const official = part.companions.find((c) => c.kind === "assessments" && c.status === "available");
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([...partTrail(part), { name: TITLE, path: partHref(part.key, "exams") }])} />
      <ExamsView
        partKey={part.key}
        chapters={part.chapters}
        examsIndex={getExamsIndex(part.key)}
        officialCompanionSlug={official?.slug ?? null}
      />
    </>
  );
}
