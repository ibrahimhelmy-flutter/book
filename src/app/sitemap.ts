import type { MetadataRoute } from "next";
import {
  bookHref,
  chapterHref,
  companionHref,
  getCatalog,
  getPartManifest,
  gradeHref,
  lessonHref,
  listParts,
  partHref,
  storylineHref,
} from "@/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// No lastModified: the build date isn't when a page's content changed, and a wrong date is worse than none.
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  });

  const catalogRoutes = [
    entry("/", 1.0, "weekly"),
    ...getCatalog().grades.flatMap((g) => [entry(gradeHref(g.id), 0.9), ...g.books.map((b) => entry(bookHref(g.id, b.slug), 0.9))]),
  ];

  const partRoutes = listParts("available").flatMap(({ part }) => {
    const manifest = getPartManifest(part.key);
    const storylines = new Set(manifest.storylineLessonIds);
    return [
      entry(partHref(part.key), 1.0, "weekly"),
      entry(partHref(part.key, "exams"), 0.8),
      entry(partHref(part.key, "glossary"), 0.8),
      entry(partHref(part.key, "simulators"), 0.8),
      ...manifest.chapters.flatMap((ch) => [
        entry(chapterHref(part.key, ch.id), 0.8),
        ...ch.lessons.map((l) => entry(lessonHref(part.key, ch.id, l.slug), 0.9, "weekly")),
        ...ch.lessons.filter((l) => storylines.has(l.id)).map((l) => entry(storylineHref(part.key, ch.id, l.slug), 0.7)),
      ]),
      ...manifest.companions
        .filter((c) => c.status === "available")
        .flatMap((c) => [
          entry(companionHref(part.key, c.slug), 0.8),
          ...[...new Set(c.lessons.map((l) => l.chapterId))].map((chapterId) => entry(companionHref(part.key, c.slug, chapterId), 0.7)),
          ...c.lessons.map((l) => entry(companionHref(part.key, c.slug, l.chapterId, l.slug), 0.8)),
        ]),
    ];
  });

  return [...catalogRoutes, ...partRoutes];
}
