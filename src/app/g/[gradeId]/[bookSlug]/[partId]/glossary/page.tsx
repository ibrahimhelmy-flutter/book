import React from "react";
import type { Metadata } from "next";
import { getAcronyms, getGlossary, partHref, requirePart, staticParams, type PartRouteParams } from "@/content";
import { breadcrumbJsonLd, pageMetadata, partTrail } from "@/lib/seo";
import { GlossaryView } from "@/components/glossary/GlossaryView";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "معجم المصطلحات والاختصارات";

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
    description: `${part.stats.totalGlossaryTerms} مصطلحًا مع الاختصارات من ${part.bookTitle} — ${part.gradeTitle} (${part.partTitle}).`,
    path: partHref(part.key, "glossary"),
  });
}

export default async function GlossaryPage({ params }: Props) {
  const part = requirePart(await params);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([...partTrail(part), { name: TITLE, path: partHref(part.key, "glossary") }])} />
      <GlossaryView partKey={part.key} glossary={getGlossary(part.key)} acronyms={getAcronyms(part.key)} chapters={part.chapters} />
    </>
  );
}
