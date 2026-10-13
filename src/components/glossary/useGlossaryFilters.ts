"use client";

import { useCallback, useMemo, useState } from "react";
import { matchesSearch } from "@/lib/arabic";
import type { AcronymTerm, GlossaryTerm } from "@/types";
import type { NavChapter } from "@/types/catalog";
import type { AvailableLesson, CategoryFilter, LessonMeta } from "./glossary-meta";

interface Options {
  glossary: GlossaryTerm[];
  acronyms: AcronymTerm[];
  chapters: NavChapter[];
  lessonMap: Record<string, LessonMeta>;
  bookmarkedSet: Set<string>;
}

/** Filter state (chapters, lessons, category, search, bookmarks-only) and the filtered term/acronym lists. */
export function useGlossaryFilters({ glossary, acronyms, chapters, lessonMap, bookmarkedSet }: Options) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]); // Empty = ALL
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]); // Empty = ALL within selected chapters
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

  const availableLessons = useMemo<AvailableLesson[]>(() => {
    const lessons: AvailableLesson[] = [];
    for (const chap of chapters) {
      if (selectedChapters.length > 0 && !selectedChapters.includes(chap.id)) continue;
      for (const l of chap.lessons) {
        lessons.push({ id: l.id, number: l.number, title: l.title, chapterId: chap.id, chapterNumber: chap.number });
      }
    }
    return lessons;
  }, [chapters, selectedChapters]);

  const toggleChapter = useCallback(
    (chapterId: string) => {
      const updated = selectedChapters.includes(chapterId)
        ? selectedChapters.filter((id) => id !== chapterId)
        : [...selectedChapters, chapterId];
      setSelectedChapters(updated);
      // Drop lessons that no longer belong to the selected chapters
      if (updated.length > 0) {
        setSelectedLessons((prev) =>
          prev.filter((num) => {
            const meta = lessonMap[num];
            return !!meta && updated.includes(meta.chapterId);
          })
        );
      }
    },
    [selectedChapters, lessonMap]
  );

  const toggleLesson = useCallback(
    (lessonNumber: string) => {
      if (selectedLessons.includes(lessonNumber)) {
        setSelectedLessons(selectedLessons.filter((num) => num !== lessonNumber));
        return;
      }
      const meta = lessonMap[lessonNumber];
      if (meta && selectedChapters.length > 0 && !selectedChapters.includes(meta.chapterId)) {
        setSelectedChapters([...selectedChapters, meta.chapterId]);
      }
      setSelectedLessons([...selectedLessons, lessonNumber]);
    },
    [selectedLessons, selectedChapters, lessonMap]
  );

  const clearChapters = useCallback(() => setSelectedChapters([]), []);
  const clearLessons = useCallback(() => setSelectedLessons([]), []);
  const selectAllActiveLessons = useCallback(
    () => setSelectedLessons(availableLessons.map((l) => l.number)),
    [availableLessons]
  );

  const resetAllFilters = useCallback(() => {
    setSelectedChapters([]);
    setSelectedLessons([]);
    setSelectedCategory("ALL");
    setSearchTerm("");
    setOnlyBookmarked(false);
  }, []);

  const filteredTerms = useMemo(
    () =>
      glossary.filter((item) => {
        if (selectedChapters.length > 0 && !selectedChapters.includes(item.chapterId)) return false;
        if (selectedLessons.length > 0 && !selectedLessons.includes(item.lessonNumber)) return false;
        if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
        if (onlyBookmarked && !bookmarkedSet.has(item.id)) return false;
        return (
          matchesSearch(item.termAr, searchTerm) ||
          matchesSearch(item.termEn, searchTerm) ||
          matchesSearch(item.definitionAr, searchTerm) ||
          (item.definitionEn ? matchesSearch(item.definitionEn, searchTerm) : false)
        );
      }),
    [glossary, selectedChapters, selectedLessons, selectedCategory, onlyBookmarked, bookmarkedSet, searchTerm]
  );

  const filteredAcronyms = useMemo(
    () =>
      acronyms.filter((item) => {
        if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;
        return (
          matchesSearch(item.short, searchTerm) ||
          matchesSearch(item.fullEn, searchTerm) ||
          matchesSearch(item.fullAr, searchTerm) ||
          matchesSearch(item.descriptionAr, searchTerm)
        );
      }),
    [acronyms, selectedCategory, searchTerm]
  );

  const hasActiveFilters =
    selectedChapters.length > 0 ||
    selectedLessons.length > 0 ||
    selectedCategory !== "ALL" ||
    searchTerm.trim() !== "" ||
    onlyBookmarked;

  /** Changes whenever the term filters change (bookmark toggles excluded); used to reset flashcards. */
  const filterSignature = JSON.stringify([selectedChapters, selectedLessons, selectedCategory, onlyBookmarked, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedChapters,
    selectedLessons,
    onlyBookmarked,
    setOnlyBookmarked,
    availableLessons,
    toggleChapter,
    toggleLesson,
    clearChapters,
    clearLessons,
    selectAllActiveLessons,
    resetAllFilters,
    filteredTerms,
    filteredAcronyms,
    hasActiveFilters,
    filterSignature,
  };
}

export type GlossaryFiltersState = ReturnType<typeof useGlossaryFilters>;
