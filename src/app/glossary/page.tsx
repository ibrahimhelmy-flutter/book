import React from "react";
import type { Metadata } from "next";
import { getLegacyPartKey, partHref } from "@/content";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";

export const metadata: Metadata = { robots: { index: false } };

/** Pre-catalog URL kept for old links and bookmarks; points at the first book part. */
export default function LegacyPage() {
  return <LegacyRedirect to={partHref(getLegacyPartKey(), "glossary")} />;
}
