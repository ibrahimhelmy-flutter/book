import "server-only";
import { notFound } from "next/navigation";
import type { CompanionManifest, PartManifest } from "@/types/catalog";
import { findPart, getPartManifest } from "./reader";

export type PartRouteParams = { gradeId: string; bookSlug: string; partId: string };

/** Resolves a part route's params to its manifest (404 for unknown or coming-soon parts). */
export function requirePart(ref: PartRouteParams): PartManifest {
  const found = findPart(ref);
  if (!found || found.part.status !== "available") notFound();
  return getPartManifest(found.part.key);
}

/** Resolves a companion-book route (e.g. ".../term-1/assessments/...") to its part and companion manifest. */
export function requireCompanion(params: PartRouteParams & { companionSlug: string }): {
  part: PartManifest;
  companion: CompanionManifest;
} {
  const { companionSlug, ...ref } = params;
  const part = requirePart(ref);
  const companion = part.companions.find((c) => c.slug === companionSlug && c.status === "available");
  if (!companion) notFound();
  return { part, companion };
}
