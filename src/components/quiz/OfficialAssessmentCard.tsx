"use client";

import React, { useState } from "react";
import { OfficialAssessmentQuestion } from "@/data/official-assessments";
import {
  Check,
  X,
  RotateCcw,
  BookOpen,
  Award,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Props {
  question: OfficialAssessmentQuestion;
  indexNumber?: number;
  onAnswerSelected?: (isCorrect: boolean) => void;
}

const SECTION_COLOR_MAP: Record<string, { badge: string; border: string }> = {
  performance_task_1: {
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    border: "border-sky-500/20",
  },
  performance_task_2: {
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/20",
  },
  homework: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    border: "border-amber-500/20",
  },
  weekly_model_a: {
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    border: "border-indigo-500/20",
  },
  weekly_model_b: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    border: "border-purple-500/20",
  },
  weekly_model_c: {
    badge: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    border: "border-fuchsia-500/20",
  },
};

const OPTION_LETTERS = ["أ", "ب", "ج", "د"];

function formatParagraphs(text: string) {
  const paragraphs = text.split("\n");
  return paragraphs.map((paragraph, pIdx) => {
    if (!paragraph.trim()) return <div key={pIdx} className="h-1" />;

    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={pIdx} className="leading-relaxed">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-bold text-slate-100">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </p>
    );
  });
}

function formatAnswerContent(text: string) {
  if (!text) return null;

  if (text.includes("```")) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return (
      <div className="space-y-3 leading-relaxed">
        {parts.map((part, idx) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const lines = part.slice(3, -3).trim().split("\n");
            const firstLine = lines[0]?.trim();
            const codeLines =
              firstLine === "text" || firstLine === "json" || firstLine === "javascript"
                ? lines.slice(1)
                : lines;
            return (
              <pre
                key={idx}
                dir="ltr"
                className="bg-slate-950/90 border border-slate-800 text-cyan-300 font-mono text-xs p-3.5 rounded-xl overflow-x-auto shadow-inner my-2 leading-tight select-all"
              >
                <code>{codeLines.join("\n")}</code>
              </pre>
            );
          }
          return (
            <div key={idx} className="space-y-2">
              {formatParagraphs(part)}
            </div>
          );
        })}
      </div>
    );
  }

  return <div className="space-y-2 leading-relaxed">{formatParagraphs(text)}</div>;
}

export function OfficialAssessmentCard({
  question,
  indexNumber,
  onAnswerSelected,
}: Props) {
  // MCQ state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // Essay model answer toggle state
  const [isAnswerExpanded, setIsAnswerExpanded] = useState<boolean>(false);
  // Copy state
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const isMcq = question.type === "mcq";
  const hasInteracted = selectedOption !== null;
  const isCorrect = selectedOption === question.correctAnswer;

  const handleSelectOption = (opt: string) => {
    if (hasInteracted) return;
    setSelectedOption(opt);
    if (onAnswerSelected) {
      onAnswerSelected(opt === question.correctAnswer);
    }
  };

  const handleResetMcq = () => {
    setSelectedOption(null);
  };

  const handleCopy = async () => {
    let copyText = `سؤال وزاري رسمي (${question.sectionNameAr} - ${question.lessonTitle}):\n${question.question}\n`;
    if (isMcq && question.options) {
      copyText += `\nالخيارات:\n` + question.options.map((o, i) => `${OPTION_LETTERS[i]}- ${o}`).join("\n");
      copyText += `\n\nالإجابة الصحيحة: ${question.correctAnswer}`;
    }
    copyText += `\n\nالإجابة النموذجية المعتمدة:\n${question.modelAnswer}`;
    copyText += `\n\nمرجع كتاب الوزارة:\nصفحة ${question.textbookCitation.page} — «${question.textbookCitation.exactText}»`;

    try {
      await navigator.clipboard.writeText(copyText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = copyText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const sectionStyle =
    SECTION_COLOR_MAP[question.sectionType] || {
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      border: "border-slate-800",
    };

  return (
    <article
      dir="rtl"
      className={`bg-slate-900/90 border ${sectionStyle.border} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl space-y-4 sm:space-y-5 transition-all hover:border-slate-700/80`}
    >
      {/* 1. Header Badges & Actions */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-3 sm:pb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Official Ministry Seal */}
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
            <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>كتاب التقييمات الرسمي</span>
          </span>

          {/* Section Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${sectionStyle.badge}`}
          >
            <span>{question.sectionNameAr}</span>
          </span>

          {/* Question Type Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {isMcq ? (
              <>
                <FileText className="w-3 h-3 text-cyan-400" />
                <span>اختيار من متعدد</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3 h-3 text-violet-400" />
                <span>سؤال مقالي</span>
              </>
            )}
          </span>

          {/* Booklet Page */}
          <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
            كتاب التقييمات ص {question.pageInPdf}
          </span>
        </div>

        {/* Index number & Copy action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="نسخ السؤال والإجابة النموذجية"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-300 font-bold">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">نسخ</span>
              </>
            )}
          </button>

          {typeof indexNumber === "number" && (
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
              #{indexNumber}
            </span>
          )}
        </div>
      </div>

      {/* 2. Question Text */}
      <div className="space-y-1">
        <div className="text-xs text-indigo-400 font-medium">
          الدرس {question.lessonNumber}: {question.lessonTitle}
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-100 leading-relaxed sm:leading-8">
          {question.question}
        </h3>
      </div>

      {/* 3. MCQ Options (if type === "mcq") */}
      {isMcq && question.options && question.options.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {question.options.map((opt, optIndex) => {
              const letter = OPTION_LETTERS[optIndex] || String(optIndex + 1);
              const isOptionSelected = selectedOption === opt;
              const isOptionCorrect = opt === question.correctAnswer;

              let btnClasses =
                "relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-right cursor-pointer border w-full text-slate-200 bg-slate-950/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900";

              let badgeClasses =
                "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all bg-slate-800 text-slate-300 border border-slate-700";

              if (hasInteracted) {
                if (isOptionCorrect) {
                  btnClasses =
                    "relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-right border w-full bg-emerald-500/10 border-emerald-500/60 text-emerald-200 shadow-md";
                  badgeClasses =
                    "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-emerald-500 text-slate-950 border border-emerald-400";
                } else if (isOptionSelected) {
                  btnClasses =
                    "relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-right border w-full bg-rose-500/10 border-rose-500/60 text-rose-200 shadow-md";
                  badgeClasses =
                    "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-rose-500 text-white border border-rose-400";
                } else {
                  btnClasses =
                    "relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-right border w-full opacity-40 bg-slate-950/40 border-slate-800/80 text-slate-400 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={optIndex}
                  type="button"
                  disabled={hasInteracted}
                  onClick={() => handleSelectOption(opt)}
                  className={btnClasses}
                >
                  <span className={badgeClasses}>{letter}</span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {hasInteracted && isOptionCorrect && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                  )}
                  {hasInteracted && isOptionSelected && !isOptionCorrect && (
                    <X className="w-4 h-4 text-rose-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Reset button if answered */}
          {hasInteracted && (
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleResetMcq}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium cursor-pointer transition-colors px-2.5 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. MCQ Answer Feedback & Textbook Model Answer (Shown after interaction OR toggled) */}
      {isMcq && (hasInteracted || isAnswerExpanded) && (
        <div
          className={`rounded-2xl p-4 sm:p-5 border text-xs sm:text-sm space-y-3 transition-all ${
            hasInteracted
              ? isCorrect
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/20 border-rose-500/30 text-slate-200"
              : "bg-slate-950/80 border-slate-800 text-slate-200"
          }`}
        >
          {hasInteracted && (
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">إجابة صحيحة وفقاً لكتاب الوزارة!</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300">
                    إجابة غير دقيقة. الخيار الصحيح هو: «{question.correctAnswer}»
                  </span>
                </>
              )}
            </div>
          )}

          {/* Model Answer from Textbook */}
          <div className="space-y-1.5 text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2.5">
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>الإجابة النموذجية وتفسير كتاب الوزارة:</span>
            </div>
            <div className="pr-4 border-r-2 border-indigo-500/40 text-slate-200">
              {formatAnswerContent(question.modelAnswer)}
            </div>
          </div>

          {/* Citation Box */}
          {question.textbookCitation && (
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] sm:text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>كتاب الشرح المدرسي الأصلي — ص {question.textbookCitation.page}</span>
              </div>
              <p className="text-slate-300/90 italic font-mono text-[11px]">
                «{question.textbookCitation.exactText}»
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Essay Question: Model Answer Toggle & Content */}
      {!isMcq && (
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => setIsAnswerExpanded((prev) => !prev)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isAnswerExpanded
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-200"
                : "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>
                {isAnswerExpanded
                  ? "إخفاء الإجابة النموذجية المعتمدة"
                  : "عرض الإجابة النموذجية المعتمدة من كتاب الوزارة"}
              </span>
            </div>
            {isAnswerExpanded ? (
              <ChevronUp className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isAnswerExpanded && (
            <div className="rounded-2xl p-4 sm:p-5 border bg-slate-950/80 border-indigo-500/30 text-xs sm:text-sm space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>الإجابة النموذجية المعتمدة:</span>
              </div>
              <div className="text-slate-200 text-sm pr-3 border-r-2 border-emerald-500/50">
                {formatAnswerContent(question.modelAnswer)}
              </div>

              {/* Textbook Exact Citation */}
              {question.textbookCitation && (
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] sm:text-xs space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>مرجع كتاب الشرح المدرسي — ص {question.textbookCitation.page}</span>
                  </div>
                  <p className="text-slate-300 italic">
                    «{question.textbookCitation.exactText}»
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
