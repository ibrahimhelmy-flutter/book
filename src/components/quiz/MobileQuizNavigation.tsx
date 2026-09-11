"use client";

import React from "react";
import { ChevronRight, ChevronLeft, LayoutGrid } from "lucide-react";

interface Props {
  currentIndex: number;
  totalQuestions: number;
  onNavigate: (newIndex: number) => void;
  onOpenGridModal?: () => void;
  isExamMode?: boolean;
  isSubmitted?: boolean;
  onSubmitExam?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  accentColor?: "indigo" | "purple" | "amber" | "emerald";
}

export function MobileQuizNavigation({
  currentIndex,
  totalQuestions,
  onNavigate,
  onOpenGridModal,
  isExamMode = false,
  isSubmitted = false,
  onSubmitExam,
  prevLabel = "السابق",
  nextLabel = "التالي",
  submitLabel = "إنهاء 🏆",
  accentColor = "indigo",
}: Props) {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= totalQuestions - 1;
  const showSubmit = isExamMode && !isSubmitted && isLast && onSubmitExam;

  // Accent styles for active states
  const accentClasses = {
    indigo: {
      center: "bg-indigo-950/60 border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/60",
      next: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30",
      gridIcon: "text-indigo-400",
    },
    purple: {
      center: "bg-purple-950/60 border-purple-500/40 text-purple-200 hover:bg-purple-900/60",
      next: "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30",
      gridIcon: "text-purple-400",
    },
    amber: {
      center: "bg-amber-950/60 border-amber-500/40 text-amber-200 hover:bg-amber-900/60",
      next: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30",
      gridIcon: "text-amber-400",
    },
    emerald: {
      center: "bg-emerald-950/60 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60",
      next: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30",
      gridIcon: "text-emerald-400",
    },
  }[accentColor];

  return (
    <nav
      aria-label="التنقل بين الأسئلة"
      className="md:hidden fixed bottom-2 inset-x-2 sm:inset-x-4 z-40"
    >
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-1.5 px-2.5 shadow-2xl shadow-slate-950/90 flex items-center justify-between gap-2 safe-area-bottom">
        {/* Previous Question Button */}
        <button
          type="button"
          onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
          disabled={isFirst}
          className="min-h-[44px] min-w-[76px] px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-800 active:scale-95"
        >
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span>{prevLabel}</span>
        </button>

        {/* Center: Current Index & Grid Sheet Trigger */}
        {onOpenGridModal ? (
          <button
            type="button"
            onClick={onOpenGridModal}
            className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-inner ${accentClasses.center}`}
            title="فتح خريطة الأسئلة"
            aria-label={`السؤال ${currentIndex + 1} من إجمالي ${totalQuestions}. انقر لفتح خريطة الأسئلة`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 shrink-0 ${accentClasses.gridIcon}`} />
            <span>
              {currentIndex + 1} / {totalQuestions}
            </span>
          </button>
        ) : (
          <div className="min-h-[44px] px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
            <span>
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        )}

        {/* Next Question or Submit Exam Button */}
        {showSubmit ? (
          <button
            type="button"
            onClick={onSubmitExam}
            className="min-h-[44px] min-w-[76px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-600/30 active:scale-95"
          >
            <span>{submitLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate(Math.min(totalQuestions - 1, currentIndex + 1))}
            disabled={isLast}
            className={`min-h-[44px] min-w-[76px] px-3.5 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md active:scale-95 ${accentClasses.next}`}
          >
            <span>{nextLabel}</span>
            <ChevronLeft className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>
    </nav>
  );
}
