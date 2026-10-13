import React from "react";
import type { Metadata } from "next";
import { getPartManifest, listParts } from "@/content";
import { DashboardView, type DashboardPart } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "لوحة الإنجاز" };

/** Progress across every available part; only the parts' light TOCs are passed to the client. */
export default function DashboardPage() {
  const parts: DashboardPart[] = listParts("available").map(({ part, book }) => {
    const manifest = getPartManifest(part.key);
    return {
      key: part.key,
      title: `${book.title} — ${part.shortTitle}`,
      chapters: manifest.chapters,
      totalLessons: manifest.stats.totalLessons,
    };
  });
  return <DashboardView parts={parts} />;
}
