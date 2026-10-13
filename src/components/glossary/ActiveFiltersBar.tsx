"use client";

import type { ReactNode } from "react";
import { RotateCcw, Star, X } from "lucide-react";
import { getCategoryLabel, type ChapterMeta } from "./glossary-meta";
import type { GlossaryFiltersState } from "./useGlossaryFilters";

interface ActiveFiltersBarProps {
  filters: GlossaryFiltersState;
  chapterMap: Record<string, ChapterMeta>;
  totalTerms: number;
}

function FilterChip({ className, onRemove, children }: { className: string; onRemove: () => void; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${className}`}>
      {children}
      <button onClick={onRemove} className="hover:text-white">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

/** Summary of the active term filters as removable chips, with the result count and a reset button. */
export function ActiveFiltersBar({ filters, chapterMap, totalTerms }: ActiveFiltersBarProps) {
  const {
    selectedChapters,
    selectedLessons,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    onlyBookmarked,
    setOnlyBookmarked,
    toggleChapter,
    toggleLesson,
    resetAllFilters,
    filteredTerms,
  } = filters;

  return (
    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 font-medium">الفلاتر:</span>

        {selectedChapters.map((chapId) => (
          <FilterChip
            key={chapId}
            className="bg-pink-500/15 text-pink-300 border-pink-500/30"
            onRemove={() => toggleChapter(chapId)}
          >
            <span>و{chapterMap[chapId]?.number || chapId}</span>
          </FilterChip>
        ))}

        {selectedLessons.map((num) => (
          <FilterChip key={num} className="bg-sky-500/15 text-sky-300 border-sky-500/30" onRemove={() => toggleLesson(num)}>
            <span>درس {num}</span>
          </FilterChip>
        ))}

        {selectedCategory !== "ALL" && (
          <FilterChip
            className="bg-purple-500/15 text-purple-300 border-purple-500/30"
            onRemove={() => setSelectedCategory("ALL")}
          >
            <span>{getCategoryLabel(selectedCategory)}</span>
          </FilterChip>
        )}

        {searchTerm && (
          <FilterChip className="bg-slate-800 text-slate-300 border-slate-700" onRemove={() => setSearchTerm("")}>
            <span>&quot;{searchTerm}&quot;</span>
          </FilterChip>
        )}

        {onlyBookmarked && (
          <FilterChip
            className="bg-amber-500/15 text-amber-300 border-amber-500/30"
            onRemove={() => setOnlyBookmarked(false)}
          >
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            <span>المفضلة</span>
          </FilterChip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400">
          <span className="text-pink-400 font-mono font-bold">{filteredTerms.length}</span> من{" "}
          <span className="font-mono">{totalTerms}</span>
        </span>
        <button
          onClick={resetAllFilters}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] transition-all cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>مسح</span>
        </button>
      </div>
    </div>
  );
}
