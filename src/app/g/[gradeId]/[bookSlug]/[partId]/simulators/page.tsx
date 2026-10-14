import React from "react";
import type { Metadata } from "next";
import { getSimulators, partHref, requirePart, staticParams, type PartRouteParams } from "@/content";
import { breadcrumbJsonLd, pageMetadata, partTrail } from "@/lib/seo";
import { SimulatorsLab } from "@/components/simulators/SimulatorsLab";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "المحاكيات التفاعلية";

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
    description: `${part.stats.totalSimulators} محاكيات تفاعلية لدروس ${part.bookTitle} — ${part.gradeTitle} (${part.partTitle}).`,
    path: partHref(part.key, "simulators"),
  });
}

export default async function SimulatorsPage({ params }: Props) {
  const part = requirePart(await params);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([...partTrail(part), { name: TITLE, path: partHref(part.key, "simulators") }])} />
      <SimulatorsLab simulators={getSimulators(part.key)} />
    </>
  );
}
