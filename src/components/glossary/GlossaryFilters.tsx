"use client";

import { BookOpen, Brain, Layers, LayoutGrid, List, RotateCcw, Search, X } from "lucide-react";
import type { NavChapter } from "@/types/catalog";
import type { ChapterMeta, ViewMode } from "./glossary-meta";
import type { GlossaryFiltersState } from "./useGlossaryFilters";
import { ActiveFiltersBar } from "./ActiveFiltersBar";

interface GlossaryFiltersProps {
  filters: GlossaryFiltersState;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  chapters: NavChapter[];
  chapterMap: Record<string, ChapterMeta>;
  totalTerms: number;
  chapterTermCounts: Record<string, number>;
  lessonTermCounts: Record<string, number>;
}

const VIEW_MODES: { id: ViewMode; label: string; title: string; activeClass: string }[] = [
  { id: "grid", label: "بطاقات", title: "عرض بطاقات", activeClass: "bg-pink-600 text-white shadow-sm" },
  { id: "compact", label: "قائمة", title: "عرض قائمة مدمجة", activeClass: "bg-pink-600 text-white shadow-sm" },
  { id: "flashcards", label: "حفظ", title: "بطاقات الحفظ والمراجعة", activeClass: "bg-purple-600 text-white shadow-sm" },
];

function ViewModeIcon({ mode }: { mode: ViewMode }) {
  if (mode === "grid") return <LayoutGrid className="w-3.5 h-3.5" />;
  if (mode === "compact") return <List className="w-3.5 h-3.5" />;
  return <Brain className="w-3.5 h-3.5 text-purple-300" />;
}

/** Filter center for the terms tab: search, view mode, unit (multi) and lesson (multi) pickers, active-filter bar. */
export function GlossaryFilters({
  filters,
  viewMode,
  onViewModeChange,
  chapters,
  chapterMap,
  totalTerms,
  chapterTermCounts,
  lessonTermCounts,
}: GlossaryFiltersProps) {
  const {
    searchTerm,
    setSearchTerm,
    selectedChapters,
    selectedLessons,
    availableLessons,
    toggleChapter,
    toggleLesson,
    clearChapters,
    clearLessons,
    selectAllActiveLessons,
  } = filters;

  return (
    <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 space-y-4">
      {/* Top Row: Search Input + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم العربي أو الإنجليزي أو داخل التعريف..."
            className="w-full pr-10 pl-9 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 placeholder:text-slate-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onViewModeChange(mode.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === mode.id ? mode.activeClass : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              title={mode.title}
            >
              <ViewModeIcon mode={mode.id} />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Unit Filter (الوحدة أو أكثر من وحدة + الكل) */}
      <div className="space-y-2 pt-3 border-t border-slate-800/70">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>الوحدات الدراسية:</span>
            <span className="text-[11px] text-slate-400 font-normal">(اختر وحدة أو أكثر)</span>
          </div>

          {selectedChapters.length > 0 && (
            <button
              onClick={clearChapters}
              className="text-[11px] text-pink-400 hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>عرض الكل</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Button: All Units (الكل) */}
          <button
            onClick={clearChapters}
            className={`px-3 py-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              selectedChapters.length === 0
                ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/20 font-bold"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
            }`}
          >
            <span className="text-xs font-bold">الكل</span>
            <span className="text-[10px] font-mono opacity-80">{totalTerms}</span>
          </button>

          {chapters.map((chapter) => {
            const isSelected = selectedChapters.includes(chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => toggleChapter(chapter.id)}
                className={`px-3 py-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between min-w-0 ${
                  isSelected
                    ? "bg-pink-600/20 border-pink-500 text-pink-200 font-bold ring-1 ring-pink-500/50"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                }`}
              >
                <span className="text-xs truncate" title={chapter.title}>
                  و{chapter.number}: {chapter.title}
                </span>
                <span className="text-[10px] font-mono opacity-80 mr-1 flex-shrink-0">
                  {chapterTermCounts[chapter.id] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lessons Filter (الدرس أو أكثر من درس) */}
      <div className="space-y-2 pt-3 border-t border-slate-800/70">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>الدروس:</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {selectedChapters.length > 0 ? `(دروس الوحدات المختارة)` : `(اختر درساً أو أكثر)`}
            </span>
          </div>

          {selectedLessons.length > 0 ? (
            <button
              onClick={clearLessons}
              className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>كل دروس الوحدة</span>
            </button>
          ) : (
            <button
              onClick={selectAllActiveLessons}
              className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              تحديد كل الدروس
            </button>
          )}
        </div>

        {/* Lessons Pills Grid */}
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          <button
            onClick={clearLessons}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedLessons.length === 0
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <span>الكل</span>
          </button>

          {availableLessons.map((lesson) => {
            const isSelected = selectedLessons.includes(lesson.number);
            return (
              <button
                key={lesson.id}
                onClick={() => toggleLesson(lesson.number)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-sky-500/20 border-sky-400 text-sky-200 font-bold ring-1 ring-sky-400/40"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                }`}
              >
                <span className="font-mono text-sky-400 font-bold">{lesson.number}</span>
                <span className="truncate max-w-[140px]" title={lesson.title}>
                  {lesson.title}
                </span>
                <span className="text-[10px] opacity-70 font-mono">({lessonTermCounts[lesson.number] || 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      {filters.hasActiveFilters && (
        <ActiveFiltersBar filters={filters} chapterMap={chapterMap} totalTerms={totalTerms} />
      )}
    </div>
  );
}
