/**
 * Client-safe URL helpers for catalog content. Route hrefs are passed to next/link (which adds
 * the basePath); data URLs are fetched directly, so they go through getAssetPath.
 */
import type { PartKey, PartRef } from "@/types/catalog";
import { getAssetPath } from "@/lib/utils";

export function toPartKey(ref: PartRef): PartKey {
  return `${ref.gradeId}/${ref.bookSlug}/${ref.partId}`;
}

export function parsePartKey(key: PartKey): PartRef {
  const [gradeId, bookSlug, partId] = key.split("/");
  return { gradeId, bookSlug, partId };
}

const withSlash = (p: string) => (p.endsWith("/") ? p : `${p}/`);

export const gradeHref = (gradeId: string) => `/g/${gradeId}/`;
export const bookHref = (gradeId: string, bookSlug: string) => `/g/${gradeId}/${bookSlug}/`;

/** Part-relative route, e.g. partHref(key, "exams") → "/g/secondary-2/programming-ai/term-1/exams/". */
export function partHref(key: PartKey, sub = ""): string {
  const clean = sub.replace(/^\/+/, "");
  return withSlash(`/g/${key}${clean ? `/${clean}` : ""}`);
}

export function chapterHref(key: PartKey, chapterId: string): string {
  return partHref(key, `chapters/${chapterId}`);
}

export function lessonHref(key: PartKey, chapterId: string, lessonSlug: string): string {
  return partHref(key, `chapters/${chapterId}/${lessonSlug}`);
}

export function storylineHref(key: PartKey, chapterId: string, lessonSlug: string): string {
  return partHref(key, `chapters/${chapterId}/${lessonSlug}/storyline`);
}

export function companionHref(key: PartKey, companionSlug: string, chapterId?: string, lessonSlug?: string): string {
  return partHref(key, [companionSlug, chapterId, lessonSlug].filter(Boolean).join("/"));
}

/** Absolute (basePath-aware) URL of a generated data file, e.g. dataUrl(key, "deep/1-1.json", hash). */
export function dataUrl(key: PartKey | null, file: string, version?: string): string {
  const url = getAssetPath(key ? `/data/${key}/${file}` : `/data/${file}`);
  return version ? `${url}?v=${version}` : url;
}
