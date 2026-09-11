import { MetadataRoute } from "next";
import { CURRICULUM_DATA } from "@/data/curriculum";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-curriculum.edu.eg";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/simulators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const chapterRoutes: MetadataRoute.Sitemap = CURRICULUM_DATA.map((ch) => ({
    url: `${baseUrl}/chapters/${ch.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = CURRICULUM_DATA.flatMap((ch) =>
    ch.lessons.map((lesson) => ({
      url: `${baseUrl}/chapters/${ch.id}/${lesson.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }))
  );

  return [...staticRoutes, ...chapterRoutes, ...lessonRoutes];
}
