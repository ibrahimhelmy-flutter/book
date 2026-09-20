"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  SimpleDifficulty,
  DIFFICULTY_LABELS_AR,
  EnrichedSimpleQuestion,
} from "@/lib/practice-data";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Grid,
  HelpCircle,
  Layers,
  ListFilter,
} from "lucide-react";

export interface UserAnswerRecord {
  selectedOption: string;
  isCorrect: boolean;
}

interface SingleQuestionPlayerProps {
  questions: EnrichedSimpleQuestion[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  userAnswers: Record<string, UserAnswerRecord>;
  onAnswerSelected: (questionId: string, optionText: string, isCorrect: boolean) => void;
  onResetQuestion: (questionId: string) => void;
  onResetAll?: () => void;
  onSwitchToListMode?: () => void;
}

const DIFFICULTY_STYLES: Record<
  SimpleDifficulty,
  { badge: string; dot: string }
> = {
  easy: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
  },
  hard: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

const OPTION_LETTERS = ["أ", "ب", "ج", "د", "هـ"];

export function SingleQuestionPlayer({
  questions,
  currentIndex,
  onIndexChange,
  userAnswers,
  onAnswerSelected,
  onResetQuestion,
  onResetAll,
  onSwitchToListMode,
}: SingleQuestionPlayerProps) {
  const [isGridModalOpen, setIsGridModalOpen] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, totalQuestions - 1));
  const currentQ = questions[safeIndex];

  const currentAnswerRecord = currentQ ? userAnswers[currentQ.id] : undefined;
  const hasInteracted = !!currentAnswerRecord;
  const selectedOption = currentAnswerRecord?.selectedOption ?? null;
  const isCorrect = currentAnswerRecord?.isCorrect ?? false;

  // Handle Option Select
  const handleSelectOption = useCallback((optionText: string) => {
    if (!currentQ || hasInteracted) return;
    const correct = optionText === currentQ.answer;
    onAnswerSelected(currentQ.id, optionText, correct);
  }, [currentQ, hasInteracted, onAnswerSelected]);

  // Handle Reset Current Question
  const handleResetCurrent = () => {
    if (!currentQ) return;
    onResetQuestion(currentQ.id);
  };

  // Next Question
  const handleNext = useCallback(() => {
    if (safeIndex < totalQuestions - 1) {
      onIndexChange(safeIndex + 1);
    }
  }, [safeIndex, totalQuestions, onIndexChange]);

  // Previous Question
  const handlePrevious = useCallback(() => {
    if (safeIndex > 0) {
      onIndexChange(safeIndex - 1);
    }
  }, [safeIndex, onIndexChange]);

  // Keyboard Navigation: Left = Next (in RTL), Right = Previous (in RTL), 1-4 = Select option
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside text input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handlePrevious();
      } else if (["1", "2", "3", "4"].includes(e.key) && currentQ && !hasInteracted) {
        const optIdx = parseInt(e.key, 10) - 1;
        if (currentQ.options && currentQ.options[optIdx]) {
          e.preventDefault();
          handleSelectOption(currentQ.options[optIdx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious, currentQ, hasInteracted, handleSelectOption]);

  if (!currentQ || totalQuestions === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
        <Layers className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="font-bold text-white text-base">لا توجد أسئلة متاحة في هذا الفلتر حالياً.</p>
      </div>
    );
  }

  const diffStyle =
    DIFFICULTY_STYLES[currentQ.difficulty] || DIFFICULTY_STYLES.medium;
  const diffLabel =
    DIFFICULTY_LABELS_AR[currentQ.difficulty] || currentQ.difficulty;

  // Percentage completed through current filtered set
  const progressPercent = Math.round(((safeIndex + 1) / totalQuestions) * 100);

  return (
    <div
      dir="rtl"
      className="w-full bg-slate-900/95 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative transition-all"
    >
      {/* ========================================================
          1. TOP FIXED TOOLBAR (With quick navigation arrows)
          ======================================================== */}
      <header className="h-16 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
        {/* Right side: Question Counter Badge & Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap overflow-hidden">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold shrink-0">
            سؤال {safeIndex + 1} من {totalQuestions}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${diffStyle.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
            <span>{diffLabel}</span>
          </span>

          {currentQ.isUnitReview ? (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>مراجعة شاملة للوحدة</span>
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0 truncate max-w-[180px]">
              <span>درس {currentQ.lessonKey}</span>
            </span>
          )}
        </div>

        {/* Left side: Quick Header Navigation Arrows + Grid Navigator + View Mode */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Top Quick Navigation Buttons (Immovable at Top) */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={handlePrevious}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              title="السؤال السابق (سهم يمين)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsGridModalOpen(true)}
              className="px-2 py-0.5 text-xs font-mono font-bold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer"
              title="الانتقال السريع عبر شبكة الأسئلة"
            >
              {safeIndex + 1}/{totalQuestions}
            </button>
            <button
              type="button"
              disabled={safeIndex >= totalQuestions - 1}
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
              title="السؤال التالي (سهم يسار)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsGridModalOpen(true)}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="فتح شبكة الأسئلة للانتقال السريع"
          >
            <Grid className="w-3.5 h-3.5 text-indigo-400" />
            <span>فهرس الأسئلة</span>
          </button>

          {onSwitchToListMode && (
            <button
              type="button"
              onClick={onSwitchToListMode}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="التبديل إلى عرض القائمة المتتالية"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">عرض كقائمة</span>
            </button>
          )}
        </div>
      </header>

      {/* Thin Progress Bar (Fixed 2px line) */}
      <div className="w-full bg-slate-800/60 h-1 overflow-hidden shrink-0">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ========================================================
          2. QUESTION CONTENT & OPTIONS AREA
          ======================================================== */}
      <div className="p-4 sm:p-7 md:p-8 space-y-5">
        <div key={currentQ.id} className="space-y-5 animate-fadeIn-pure">
          {/* Question Stem */}
          <div className="space-y-2">
            <div className="text-xs text-indigo-400 font-mono font-medium flex items-center gap-1.5">
              <span>{currentQ.chapterTitle}</span>
              <span>←</span>
              <span>{currentQ.lessonTitle}</span>
            </div>
            <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed tracking-normal min-h-[50px] sm:min-h-[56px]">
              {currentQ.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 pt-1">
            {currentQ.options.map((optionText, idx) => {
              const isThisSelected = selectedOption === optionText;
              const isThisCorrect = optionText === currentQ.answer;

              let btnStyle =
                "bg-slate-950/70 border-slate-800/90 text-slate-200 hover:border-indigo-500/60 hover:bg-slate-800/50 hover:text-white";

              if (hasInteracted) {
                if (isThisCorrect) {
                  btnStyle =
                    "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/40";
                } else if (isThisSelected && !isThisCorrect) {
                  btnStyle =
                    "bg-rose-950/60 border-rose-500 text-rose-200 font-semibold ring-1 ring-rose-500/40";
                } else {
                  btnStyle = "bg-slate-950/30 border-slate-800/50 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={`${currentQ.id}-opt-${idx}`}
                  type="button"
                  disabled={hasInteracted}
                  onClick={() => handleSelectOption(optionText)}
                  className={`w-full min-h-[50px] sm:min-h-[54px] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-3 cursor-pointer text-sm sm:text-base leading-relaxed group ${btnStyle} ${
                    hasInteracted ? "cursor-default" : "active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Option Letter Icon */}
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                        hasInteracted && isThisCorrect
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : hasInteracted && isThisSelected && !isThisCorrect
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                          : "bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white"
                      }`}
                    >
                      {OPTION_LETTERS[idx] || idx + 1}
                    </span>

                    {/* Option Text */}
                    <span className="flex-1 text-sm sm:text-base font-normal sm:font-medium leading-relaxed">
                      {optionText}
                    </span>
                  </div>

                  {/* Result Indicator Badge */}
                  {hasInteracted && (
                    <div className="shrink-0">
                      {isThisCorrect && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          <Check className="w-4 h-4" />
                          <span>صحيح</span>
                        </span>
                      )}
                      {isThisSelected && !isThisCorrect && (
                        <span className="flex items-center gap-1 text-rose-400 font-bold text-xs bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                          <X className="w-4 h-4" />
                          <span>إجابتك</span>
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ========================================================
              3. PERMANENT NAVIGATION DOCK (ABOVE THE ANSWER BOX)
              Placing Next/Previous buttons HERE ensures they NEVER
              shift or jump when the correct answer & explanation appear!
              ======================================================== */}
          <div className="mt-2 py-3 px-3 sm:px-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-lg flex items-center justify-between gap-3 select-none">
            {/* Right side (in RTL): Previous Button (السابق) */}
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={handlePrevious}
              className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border border-slate-700/60 active:scale-95 shadow-sm"
              title="السؤال السابق (سهم يمين)"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
              <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                →
              </kbd>
            </button>

            {/* Center: Interactive Question Progress & Quick Navigator Pill */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGridModalOpen(true)}
                className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer group"
                title="عرض فهرس الأسئلة"
              >
                <span className="text-slate-400 group-hover:text-slate-200">سؤال</span>
                <span className="text-indigo-400 font-black">{safeIndex + 1}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{totalQuestions}</span>
                <Grid className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Left side (in RTL): Next Button (التالي) */}
            <button
              type="button"
              disabled={safeIndex >= totalQuestions - 1}
              onClick={handleNext}
              className="h-11 sm:h-12 px-5 sm:px-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-20 disabled:pointer-events-none text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 shrink-0 border border-indigo-400/30 active:scale-95"
              title="السؤال التالي (سهم يسار)"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
              <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-indigo-200 border border-white/10">
                ←
              </kbd>
            </button>
          </div>

          {/* ========================================================
              4. FEEDBACK & EXPLANATION BOX (BELOW NAVIGATION BUTTONS)
              Since this is located BELOW the navigation dock, its
              appearance expands downward and NEVER moves the buttons!
              ======================================================== */}
          {hasInteracted ? (
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fadeIn ${
                isCorrect
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="shrink-0 mt-0.5">
                    {isCorrect ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                        ✓
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                        ✕
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed space-y-1.5 flex-1">
                    <div className="font-black text-sm sm:text-base">
                      {isCorrect ? "إجابة صحيحة! أحسنت 👏" : "إجابة غير صحيحة"}
                    </div>
                    {!isCorrect && (
                      <div className="text-slate-300">
                        <span className="font-bold text-white">الإجابة الصحيحة: </span>
                        <span className="text-emerald-300 font-medium">{currentQ.answer}</span>
                      </div>
                    )}
                    {currentQ.explanation && (
                      <div className="mt-2.5 pt-2.5 border-t border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
                        <span className="font-bold text-indigo-300">💡 الشرح والتحليل: </span>
                        <span>{currentQ.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-700 shadow-xs"
                  title="إعادة المحاولة لهذا السؤال"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إعادة المحاولة</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 text-center sm:text-right">
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400/70" />
                <span>اختر إحدى الإجابات للتحقق الفوري، وستظهر النتيجة والشرح هنا بالأسفل دون التأثير على مكان الأزرار.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          5. QUESTION GRID MODAL (QUICK JUMP TO ANY QUESTION)
          ======================================================== */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  فهرس الانتقال السريع بين الأسئلة ({totalQuestions} سؤالاً)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Legend */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600" />
                <span className="text-slate-300">إجابة صحيحة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-600" />
                <span className="text-slate-300">إجابة خاطئة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700" />
                <span className="text-slate-300">لم تتم الإجابة بعد</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md ring-2 ring-indigo-400 bg-indigo-600/30" />
                <span className="text-indigo-300 font-bold">السؤال الحالي</span>
              </div>
            </div>

            {/* Modal Grid of Buttons */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {questions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isCur = idx === safeIndex;

                  let badgeColor = "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700";

                  if (ans) {
                    if (ans.isCorrect) {
                      badgeColor = "bg-emerald-600 text-white border-emerald-500 shadow-xs";
                    } else {
                      badgeColor = "bg-rose-600 text-white border-rose-500 shadow-xs";
                    }
                  }

                  if (isCur) {
                    badgeColor += " ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onIndexChange(idx);
                        setIsGridModalOpen(false);
                      }}
                      className={`h-10 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${badgeColor}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
              {onResetAll && (
                <button
                  type="button"
                  onClick={() => {
                    onResetAll();
                    setIsGridModalOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط كافة الإجابات</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer mr-auto"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
