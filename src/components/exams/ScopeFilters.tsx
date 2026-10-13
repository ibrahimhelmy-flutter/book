"use client";

import React, { useMemo } from "react";
import { BookOpen, ListFilter, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import type { NavChapter } from "@/types/catalog";
import { NO_LESSONS, type ScopeSelection } from "./exams-logic";
import type { ExamsFilterActions } from "./use-exams-filters";

/** Unit-review shortcut (practice tab only). */
export interface ReviewPill {
  label: string;
  count: number;
  showInGrid: boolean;
  onToggle: () => void;
}

interface ScopeFiltersProps {
  isOfficial: boolean;
  chapters: NavChapter[];
  scope: ScopeSelection;
  actions: Pick<ExamsFilterActions, "toggleChapter" | "allChapters" | "toggleLesson" | "allLessons" | "clearLessons" | "reset">;
  totalCount: number;
  chapterCounts: Record<string, number>;
  lessonCounts: Record<string, number>;
  review: ReviewPill | null;
  /** Mode-specific sub-filters (official sections/types or practice difficulty) and the summary strip. */
  children: React.ReactNode;
}

const PILL_ACTIVE = "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40";
const PILL_IDLE = "bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800";

/** Filter panel shared by all tabs: chapter pills, lesson grid, then the tab's own sub-filters. */
export function ScopeFilters({
  isOfficial,
  chapters,
  scope,
  actions,
  totalCount,
  chapterCounts,
  lessonCounts,
  review,
  children,
}: ScopeFiltersProps) {
  const { chapterIds, lessonKeys, unitReviewOnly } = scope;

  // Lessons of the selected chapters (all lessons when no chapter is selected)
  const visibleLessons = useMemo(
    () => chapters.filter((ch) => chapterIds.length === 0 || chapterIds.includes(ch.id)).flatMap((ch) => ch.lessons),
    [chapters, chapterIds]
  );

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* A. Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>
            {isOfficial
              ? "تصفية وتحديد نطاق أسئلة كتاب التقييمات الرسمية للوزارة:"
              : "تصفية وتحديد نطاق الأسئلة (الوحدات والدروس):"}
          </span>
        </div>

        <button
          type="button"
          onClick={actions.reset}
          className="text-xs text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة تعيين الفلتر بالكامل</span>
        </button>
      </div>

      {/* B. Unit / Chapter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>1. اختر الوحدة / الوحدات:</span>
          </span>
          {chapterIds.length > 0 && (
            <span className="text-[11px] text-indigo-400 font-normal">
              (محدد: {chapterIds.length} من {chapters.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={actions.allChapters}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chapterIds.length === 0 ? PILL_ACTIVE : PILL_IDLE
            }`}
          >
            <span>جميع الوحدات</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">{totalCount}</span>
          </button>

          {chapters.map((ch) => (
            <button
              key={ch.id}
              type="button"
              aria-pressed={chapterIds.includes(ch.id)}
              onClick={() => actions.toggleChapter(ch.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                chapterIds.includes(ch.id) ? PILL_ACTIVE : PILL_IDLE
              }`}
            >
              <span>
                الوحدة {ch.number}: {ch.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono text-slate-300">
                {chapterCounts[ch.id] || 0}
              </span>
            </button>
          ))}

          {review && (
            <>
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <button
                type="button"
                aria-pressed={unitReviewOnly}
                onClick={review.onToggle}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
                  unitReviewOnly
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 border-amber-300 ring-2 ring-amber-400/50 scale-[1.02]"
                    : "bg-amber-950/40 text-amber-300 hover:bg-amber-950/70 border-amber-700/60 hover:text-amber-200 shadow-sm"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>⭐ مراجعة شاملة: {review.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    unitReviewOnly ? "bg-white/20 text-white" : "bg-amber-900/80 text-amber-200 border border-amber-700/60"
                  }`}
                >
                  {review.count} سؤالاً
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* C. Lesson Grid */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            <span>2. اختر الدرس / الدروس:</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={actions.allLessons}
              className="text-[11px] text-indigo-300 hover:text-white transition-colors cursor-pointer"
            >
              تحديد كل الدروس المعروضة
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={actions.clearLessons}
              className="text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {visibleLessons.map((lesson) => {
            const isSelected =
              !lessonKeys.includes(NO_LESSONS) && (lessonKeys.length === 0 || lessonKeys.includes(lesson.number));
            return (
              <button
                key={lesson.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => actions.toggleLesson(lesson.number)}
                className={`p-2.5 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500/50 text-white shadow-xs"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {lesson.number}
                  </span>
                  <span className="text-xs font-semibold truncate leading-tight">{lesson.title}</span>
                </div>

                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                  {lessonCounts[lesson.number] || 0}
                </span>
              </button>
            );
          })}

          {review?.showInGrid && (
            <button
              type="button"
              aria-pressed={unitReviewOnly}
              onClick={review.onToggle}
              className={`p-2.5 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                unitReviewOnly
                  ? "bg-gradient-to-r from-amber-950/60 to-amber-900/40 border-amber-500 text-white shadow-md ring-1 ring-amber-400/40"
                  : "bg-amber-950/20 border-amber-800/40 text-amber-300/80 hover:text-amber-200 hover:border-amber-700"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                    unitReviewOnly
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "bg-amber-950 border border-amber-700/50 text-amber-300"
                  }`}
                >
                  ★
                </span>
                <span className="text-xs font-bold truncate leading-tight">مراجعة شاملة: {review.label}</span>
              </div>

              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-amber-300 shrink-0">
                {review.count}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* D. Mode-specific sub-filters */}
      {children}
    </section>
  );
}
