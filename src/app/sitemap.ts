import type { MetadataRoute } from "next";
import { bookHref, chapterHref, companionHref, getCatalog, getPartManifest, gradeHref, lessonHref, listParts, partHref } from "@/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-curriculum.edu.eg";
  const entry = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  });

  const catalogRoutes = [
    entry("/", 1.0, "weekly"),
    ...getCatalog().grades.flatMap((g) => [entry(gradeHref(g.id), 0.9), ...g.books.map((b) => entry(bookHref(g.id, b.slug), 0.9))]),
  ];

  const partRoutes = listParts("available").flatMap(({ part }) => {
    const manifest = getPartManifest(part.key);
    return [
      entry(partHref(part.key), 1.0, "weekly"),
      entry(partHref(part.key, "exams"), 0.8),
      entry(partHref(part.key, "glossary"), 0.8),
      entry(partHref(part.key, "simulators"), 0.8),
      ...manifest.chapters.flatMap((ch) => [
        entry(chapterHref(part.key, ch.id), 0.8),
        ...ch.lessons.map((l) => entry(lessonHref(part.key, ch.id, l.slug), 0.9, "weekly")),
      ]),
      ...manifest.companions
        .filter((c) => c.status === "available")
        .flatMap((c) => [
          entry(companionHref(part.key, c.slug), 0.8),
          ...c.lessons.map((l) => entry(companionHref(part.key, c.slug, l.chapterId, l.slug), 0.8)),
        ]),
    ];
  });

  return [...catalogRoutes, ...partRoutes];
}
