"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AcronymTerm, GlossaryTerm } from "@/types";
import type { NavChapter } from "@/types/catalog";
import { buildChapterMap, buildLessonMap, countBy, type ActiveTab, type ViewMode } from "./glossary-meta";
import { useGlossaryBookmarks } from "./useGlossaryBookmarks";
import { useCopyTerm, useSpeech } from "./useGlossaryActions";
import { useGlossaryFilters } from "./useGlossaryFilters";
import { GlossaryHeader } from "./GlossaryHeader";
import { GlossaryFilters } from "./GlossaryFilters";
import { GlossaryTermGrid, AcronymGrid } from "./GlossaryLists";
import { GlossaryTermTable } from "./GlossaryTermTable";
import { GlossaryFlashcards, type FlashcardState } from "./GlossaryFlashcards";

export interface GlossaryViewProps {
  partKey: string;
  glossary: GlossaryTerm[];
  acronyms: AcronymTerm[];
  chapters: NavChapter[];
}

const INITIAL_FLASHCARD: FlashcardState = { index: 0, flipped: false };

/** Glossary page for one book part: terms (grid / compact / flashcards) and acronyms tabs. */
export function GlossaryView({ partKey, glossary, acronyms, chapters }: GlossaryViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("terms");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [flashcard, setFlashcard] = useState<FlashcardState>(INITIAL_FLASHCARD);

  const chapterMap = useMemo(() => buildChapterMap(chapters), [chapters]);
  const lessonMap = useMemo(() => buildLessonMap(chapters), [chapters]);
  const chapterTermCounts = useMemo(() => countBy(glossary, (t) => t.chapterId), [glossary]);
  const lessonTermCounts = useMemo(() => countBy(glossary, (t) => t.lessonNumber), [glossary]);

  const { bookmarkedIds, bookmarkedSet, toggleBookmark } = useGlossaryBookmarks(partKey);
  const { playingId, speak } = useSpeech();
  const { copiedId, copyTerm } = useCopyTerm(chapterMap, lessonMap);
  const filters = useGlossaryFilters({ glossary, acronyms, chapters, lessonMap, bookmarkedSet });
  const { filteredTerms, filteredAcronyms, filterSignature, setOnlyBookmarked, resetAllFilters } = filters;

  // Restart the flashcard deck whenever the term filters change.
  useEffect(() => {
    setFlashcard(INITIAL_FLASHCARD);
  }, [filterSignature]);

  const toggleOnlyBookmarked = useCallback(() => setOnlyBookmarked((v) => !v), [setOnlyBookmarked]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <GlossaryHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        termsCount={glossary.length}
        acronymsCount={acronyms.length}
        bookmarkCount={bookmarkedIds.length}
        onlyBookmarked={filters.onlyBookmarked}
        onToggleOnlyBookmarked={toggleOnlyBookmarked}
      />

      {activeTab === "terms" && (
        <>
          <GlossaryFilters
            filters={filters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            chapters={chapters}
            chapterMap={chapterMap}
            totalTerms={glossary.length}
            chapterTermCounts={chapterTermCounts}
            lessonTermCounts={lessonTermCounts}
          />

          {viewMode === "grid" && (
            <GlossaryTermGrid
              terms={filteredTerms}
              chapterMap={chapterMap}
              bookmarkedSet={bookmarkedSet}
              copiedId={copiedId}
              playingId={playingId}
              onResetFilters={resetAllFilters}
              onSpeak={speak}
              onCopy={copyTerm}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {viewMode === "compact" && (
            <GlossaryTermTable
              terms={filteredTerms}
              chapterMap={chapterMap}
              bookmarkedSet={bookmarkedSet}
              copiedId={copiedId}
              playingId={playingId}
              onSpeak={speak}
              onCopy={copyTerm}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {viewMode === "flashcards" && (
            <GlossaryFlashcards
              terms={filteredTerms}
              chapterMap={chapterMap}
              bookmarkedSet={bookmarkedSet}
              state={flashcard}
              onStateChange={setFlashcard}
              onSpeak={speak}
              onToggleBookmark={toggleBookmark}
            />
          )}
        </>
      )}

      {activeTab === "acronyms" && <AcronymGrid acronyms={filteredAcronyms} playingId={playingId} onSpeak={speak} />}
    </div>
  );
}
