"use client";

import React, { useState } from "react";
import {
  SimpleQuestion,
  SimpleDifficulty,
  DIFFICULTY_LABELS_AR,
} from "@/lib/practice-data";
import { Check, X, RotateCcw } from "lucide-react";

interface Props {
  question: SimpleQuestion;
  questionNumber?: number;
  onAnswerSelected?: (isCorrect: boolean) => void;
}

const DIFFICULTY_STYLES: Record<
  SimpleDifficulty,
  { badge: string; dot: string }
> = {
  easy: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  medium: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  hard: {
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

const OPTION_LETTERS = ["أ", "ب", "ج", "د"];

export function SimpleQuestionCard({
  question,
  questionNumber,
  onAnswerSelected,
}: Props) {
  // Selected option text (null until student interacts)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const hasInteracted = selectedOption !== null;
  const isCorrect = selectedOption === question.answer;

  const handleSelect = (optionText: string) => {
    if (hasInteracted) return; // Locked once answered
    setSelectedOption(optionText);
    if (onAnswerSelected) {
      onAnswerSelected(optionText === question.answer);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
  };

  const diffStyle =
    DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.medium;
  const diffLabel =
    DIFFICULTY_LABELS_AR[question.difficulty] || question.difficulty;

  return (
    <article
      dir="rtl"
      className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl space-y-4 sm:space-y-5 transition-all hover:border-slate-700/80"
    >
      {/* 1. Header: Difficulty Badge + Question Number */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-3 sm:pb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold border ${diffStyle.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
          <span>{diffLabel}</span>
        </span>

        {questionNumber !== undefined && (
          <span className="text-xs font-mono font-bold text-slate-400">
            سؤال {questionNumber}
          </span>
        )}
      </div>

      {/* 2. Question Stem */}
      <div>
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* 3. Options List (4 choices) */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
        {question.options.map((optionText, idx) => {
          const isThisSelected = selectedOption === optionText;
          const isThisCorrect = optionText === question.answer;

          let btnStyle =
            "bg-slate-950/70 border-slate-800 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/60";

          if (hasInteracted) {
            if (isThisCorrect) {
              // The correct option turns green
              btnStyle =
                "bg-emerald-950/50 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/40";
            } else if (isThisSelected && !isThisCorrect) {
              // The chosen wrong option turns red
              btnStyle =
                "bg-rose-950/50 border-rose-500 text-rose-200 font-semibold ring-1 ring-rose-500/40";
            } else {
              // Other unselected options fade
              btnStyle = "bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasInteracted}
              onClick={() => handleSelect(optionText)}
              className={`w-full min-h-[44px] sm:min-h-[48px] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-right transition-all flex items-start gap-3 cursor-pointer text-sm sm:text-base leading-relaxed ${btnStyle} ${
                hasInteracted ? "cursor-default" : ""
              }`}
            >
              {/* Option Letter Circle */}
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5 transition-colors ${
                  hasInteracted && isThisCorrect
                    ? "bg-emerald-600 text-white"
                    : hasInteracted && isThisSelected && !isThisCorrect
                    ? "bg-rose-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {OPTION_LETTERS[idx] || idx + 1}
              </span>

              {/* Option Text */}
              <span className="flex-1 mt-0.5 text-sm sm:text-base font-normal sm:font-medium">
                {optionText}
              </span>

              {/* Result Icon */}
              {hasInteracted && (
                <div className="shrink-0 mt-1">
                  {isThisCorrect && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                  {isThisSelected && !isThisCorrect && (
                    <X className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Answer Feedback (Only shown AFTER student interacts) */}
      {hasInteracted ? (
        <div
          className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn ${
            isCorrect
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="shrink-0 mt-0.5 font-bold text-base">
              {isCorrect ? "✓" : "✕"}
            </span>
            <div className="text-xs sm:text-sm leading-relaxed">
              <div className="font-bold">
                {isCorrect ? "إجابة صحيحة! أحسنت 👏" : "إجابة غير صحيحة"}
              </div>
              <div className="text-slate-300 mt-0.5">
                <span className="font-bold text-white">الإجابة الصحيحة: </span>
                <span>{question.answer}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : (
        <div className="pt-1">
          <p className="text-xs text-slate-400">
            💡 اضغط على أي اختيار للتحقق من صحة الإجابة.
          </p>
        </div>
      )}
    </article>
  );
}
