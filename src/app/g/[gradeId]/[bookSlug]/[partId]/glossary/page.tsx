import React from "react";
import type { Metadata } from "next";
import { getAcronyms, getGlossary, requirePart, staticParams, type PartRouteParams } from "@/content";
import { GlossaryView } from "@/components/glossary/GlossaryView";

interface Props {
  params: Promise<PartRouteParams>;
}

export function generateStaticParams() {
  return staticParams.parts();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const part = requirePart(await params);
  return { title: `معجم المصطلحات والاختصارات | ${part.bookTitle} — ${part.partShortTitle}` };
}

export default async function GlossaryPage({ params }: Props) {
  const part = requirePart(await params);
  return <GlossaryView partKey={part.key} glossary={getGlossary(part.key)} acronyms={getAcronyms(part.key)} chapters={part.chapters} />;
}
