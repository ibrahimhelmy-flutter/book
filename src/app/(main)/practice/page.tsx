"use client";

import React, { useState, useMemo } from "react";
import {
  getAllSimpleQuestions,
  filterSimpleQuestionsByDifficulty,
  SimpleDifficulty,
} from "@/lib/practice-data";
import { SimpleQuestionCard } from "@/components/quiz/SimpleQuestionCard";
import {
  HelpCircle,
  Copy,
  Check,
  Code,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
} from "lucide-react";

export default function PracticePage() {
  // 1. Questions data
  const allQuestions = useMemo(() => getAllSimpleQuestions(), []);

  // 2. Filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    SimpleDifficulty | "all"
  >("all");

  // 3. User score tracking
  const [scoreStats, setScoreStats] = useState<{
    answered: number;
    correct: number;
  }>({
    answered: 0,
    correct: 0,
  });

  // 4. Pagination state
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // 5. JSON viewer modal state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return filterSimpleQuestionsByDifficulty(allQuestions, selectedDifficulty);
  }, [allQuestions, selectedDifficulty]);

  // Paginated questions
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const safePage = Math.min(page, totalPages);
  const paginatedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, safePage, pageSize]);

  // Counts per difficulty
  const counts = useMemo(() => {
    return {
      all: allQuestions.length,
      easy: allQuestions.filter((q) => q.difficulty === "easy").length,
      medium: allQuestions.filter((q) => q.difficulty === "medium").length,
      hard: allQuestions.filter((q) => q.difficulty === "hard").length,
    };
  }, [allQuestions]);

  const handleDifficultyChange = (diff: SimpleDifficulty | "all") => {
    setSelectedDifficulty(diff);
    setPage(1);
  };

  const handleAnswerSelected = (isCorrect: boolean) => {
    setScoreStats((prev) => ({
      answered: prev.answered + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
    }));
  };

  const handleCopyJson = async () => {
    const jsonStr = JSON.stringify(filteredQuestions, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = jsonStr;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* === Top Hero Header === */}
        <header className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>تدريبات المنهج التفاعلية</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                أسئلة وتدريبات الفهم المبسطة
              </h1>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                مجموعة أسئلة منتقاة من صميم كتاب الوزارة بهيكل قياسي مبسط (سؤال، 4 اختيارات، الإجابة، ومستوى الصعوبة) مع تصحيح فوري عند التفاعل.
              </p>
            </div>

            {/* JSON Export Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                title="نسخ الأسئلة بصيغة JSON القياسية (4 حقول)"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>نسخ JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsJsonModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                title="معاينة كود JSON"
              >
                <Code className="w-4 h-4 text-indigo-400" />
                <span>معاينة JSON</span>
              </button>
            </div>
          </div>

          {/* Stats strip */}
          {scoreStats.answered > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">تمت الإجابة:</span>
                <span className="font-bold text-white font-mono">{scoreStats.answered}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">إجابات صحيحة:</span>
                <span className="font-bold text-emerald-400 font-mono">{scoreStats.correct}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">النسبة:</span>
                <span className="font-bold text-indigo-300 font-mono">
                  {Math.round((scoreStats.correct / scoreStats.answered) * 100)}%
                </span>
              </div>
            </div>
          )}
        </header>

        {/* === Filter Pills === */}
        <section className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/60 p-2 sm:p-2.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>الصعوبة:</span>
            </span>

            <button
              type="button"
              onClick={() => handleDifficultyChange("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedDifficulty === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>الكل</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDifficultyChange("easy")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedDifficulty === "easy"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>سهل</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                {counts.easy}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDifficultyChange("medium")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedDifficulty === "medium"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>متوسط</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                {counts.medium}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDifficultyChange("hard")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedDifficulty === "hard"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>صعب</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                {counts.hard}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono px-2 hidden sm:block">
            عرض {paginatedQuestions.length} من {filteredQuestions.length} سؤالاً
          </div>
        </section>

        {/* === Questions List === */}
        <section className="space-y-4 sm:space-y-6">
          {paginatedQuestions.map((q, idx) => {
            const questionNumber = (safePage - 1) * pageSize + idx + 1;
            return (
              <SimpleQuestionCard
                key={`${safePage}-${idx}-${q.question.slice(0, 20)}`}
                question={q}
                questionNumber={questionNumber}
                onAnswerSelected={handleAnswerSelected}
              />
            );
          })}

          {paginatedQuestions.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-bold text-white">لا توجد أسئلة تطابق هذا التصنيف حالياً.</p>
              <p className="text-xs text-slate-500">جرب اختيار تصنيف صعوبة آخر.</p>
            </div>
          )}
        </section>

        {/* === Pagination Controls === */}
        {totalPages > 1 && (
          <nav
            aria-label="تصفح صفحات الأسئلة"
            className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 border border-slate-800 rounded-2xl"
          >
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الصفحة السابقة</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-300">
              صفحة {safePage} من {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>الصفحة التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>

      {/* === JSON Modal Preview === */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  معاينة كود JSON (4 حقول فقط)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكل</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsJsonModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed custom-scrollbar flex-1" dir="ltr">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(filteredQuestions.slice(0, 15), null, 2)}
              </pre>
              {filteredQuestions.length > 15 && (
                <div className="p-2 text-center text-slate-500 italic mt-2 border-t border-slate-800">
                  ... تم عرض أول 15 سؤالاً من إجمالي {filteredQuestions.length} سؤالاً (استخدم زر "نسخ الكل" لنسخ المصفوفة كاملة).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
