"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ensureMigrated, glossaryBookmarksKey } from "@/lib/storage";
import type { PartKey } from "@/types/catalog";

function readBookmarks(partKey: PartKey): string[] {
  ensureMigrated();
  try {
    const saved = localStorage.getItem(glossaryBookmarksKey(partKey));
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Glossary term bookmarks for one book part, persisted in localStorage. */
export function useGlossaryBookmarks(partKey: PartKey) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(readBookmarks(partKey));
  }, [partKey]);

  const toggleBookmark = useCallback(
    (id: string) => {
      setBookmarkedIds((prev) => {
        const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        try {
          localStorage.setItem(glossaryBookmarksKey(partKey), JSON.stringify(updated));
        } catch {
          // ignore (private mode / quota)
        }
        return updated;
      });
    },
    [partKey]
  );

  const bookmarkedSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  return { bookmarkedIds, bookmarkedSet, toggleBookmark };
}
