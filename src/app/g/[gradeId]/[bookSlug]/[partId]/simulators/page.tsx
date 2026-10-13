import React from "react";
import type { Metadata } from "next";
import { getSimulators, requirePart, staticParams, type PartRouteParams } from "@/content";
import { SimulatorsLab } from "@/components/simulators/SimulatorsLab";

interface Props {
  params: Promise<PartRouteParams>;
}

export function generateStaticParams() {
  return staticParams.parts();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const part = requirePart(await params);
  return { title: `المحاكيات التفاعلية | ${part.bookTitle} — ${part.partShortTitle}` };
}

export default async function SimulatorsPage({ params }: Props) {
  const part = requirePart(await params);
  return <SimulatorsLab simulators={getSimulators(part.key)} />;
}
