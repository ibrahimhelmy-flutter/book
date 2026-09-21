"use client";

import React, { useState, useMemo } from "react";
import { Lesson } from "@/types";
import {
  OfficialLessonAssessments,
  OfficialAssessmentQuestion,
  OfficialAssessmentSectionType,
} from "@/data/official-assessments";
import { OfficialAssessmentCard } from "./OfficialAssessmentCard";
import { matchesSearch } from "@/lib/arabic";
import {
  Award,
  BookOpen,
  Filter,
  Search,
  Check,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Eye,
  EyeOff,
  FileText,
  X,
} from "lucide-react";

interface Props {
  lesson: Lesson;
  assessments?: OfficialLessonAssessments;
}

const SECTION_FILTERS: { id: OfficialAssessmentSectionType | "all" | "weekly_all"; label: string; shortLabel: string }[] = [
  { id: "all", label: "جميع أقسام التقييم", shortLabel: "الكل" },
  { id: "performance_task_1", label: "المهام الأدائية (الفترة الأولى)", shortLabel: "مهام أدائية ف1" },
  { id: "performance_task_2", label: "المهام الأدائية (الفترة الثانية)", shortLabel: "مهام أدائية ف2" },
  { id: "homework", label: "أداءات منزلية (الواجب المنزلي)", shortLabel: "واجب منزلي" },
  { id: "weekly_all", label: "التقييمات الأسبوعية (A/B/C)", shortLabel: "تقييم أسبوعي" },
];

export function LessonOfficialAssessments({ lesson, assessments }: Props) {
  const allQuestions: OfficialAssessmentQuestion[] = assessments?.questions || [];

  // Filter states
  const [sectionFilter, setSectionFilter] = useState<OfficialAssessmentSectionType | "all" | "weekly_all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "mcq" | "essay">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [showAllInOnePage, setShowAllInOnePage] = useState<boolean>(false);
  const pageSize = 8;

  // Score stats for MCQs
  const [scoreStats, setScoreStats] = useState<{ answered: number; correct: number }>({
    answered: 0,
    correct: 0,
  });

  // Copy all state
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleAnswerSelected = (isCorrect: boolean) => {
    setScoreStats((prev) => ({
      answered: prev.answered + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
    }));
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Section filter
      if (sectionFilter === "weekly_all") {
        if (!q.sectionType.startsWith("weekly_model")) return false;
      } else if (sectionFilter !== "all" && q.sectionType !== sectionFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && q.type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        const matchQ = matchesSearch(q.question, query);
        const matchAns = matchesSearch(q.modelAnswer, query);
        const matchCit = q.textbookCitation ? matchesSearch(q.textbookCitation.exactText, query) : false;
        const matchOpts = q.options?.some((opt) => matchesSearch(opt, query)) || false;
        if (!matchQ && !matchAns && !matchCit && !matchOpts) {
          return false;
        }
      }

      return true;
    });
  }, [allQuestions, sectionFilter, typeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const safePage = Math.min(page, totalPages);
  const displayedQuestions = useMemo(() => {
    if (showAllInOnePage || filteredQuestions.length <= pageSize) {
      return filteredQuestions;
    }
    const start = (safePage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, safePage, pageSize, showAllInOnePage]);

  // Counts by section
  const sectionCounts = useMemo(() => {
    return {
      all: allQuestions.length,
      p1: allQuestions.filter((q) => q.sectionType === "performance_task_1").length,
      p2: allQuestions.filter((q) => q.sectionType === "performance_task_2").length,
      hw: allQuestions.filter((q) => q.sectionType === "homework").length,
      weekly: allQuestions.filter((q) => q.sectionType.startsWith("weekly_model")).length,
      mcq: allQuestions.filter((q) => q.type === "mcq").length,
      essay: allQuestions.filter((q) => q.type === "essay").length,
    };
  }, [allQuestions]);

  const handleCopyAll = async () => {
    let fullText = `=== أسئلة التقييمات الرسمية للوزارة: الدرس ${lesson.number} (${lesson.title}) ===\n\n`;
    filteredQuestions.forEach((q, idx) => {
      fullText += `[س${idx + 1}] (${q.sectionNameAr} - كتاب التقييمات ص ${q.pageInPdf}):\n${q.question}\n`;
      if (q.type === "mcq" && q.options) {
        fullText += q.options.map((opt, i) => `   ${["أ", "ب", "ج", "د"][i]}- ${opt}`).join("\n") + "\n";
        fullText += `   الإجابة الصحيحة: ${q.correctAnswer}\n`;
      }
      fullText += `   الإجابة النموذجية: ${q.modelAnswer}\n`;
      fullText += `   مرجع كتاب الوزارة: ص ${q.textbookCitation.page} — «${q.textbookCitation.exactText}»\n\n`;
    });

    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fullText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(filteredQuestions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `official-assessments-lesson-${lesson.number}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSectionFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  if (allQuestions.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3" dir="rtl">
        <Award className="w-10 h-10 text-slate-600 mx-auto" />
        <h4 className="font-bold text-white text-base">لا توجد أسئلة تقييمات رسمية مسجلة لهذا الدرس حالياً.</h4>
        <p className="text-xs text-slate-500">
          يمكنك الاطلاع على أسئلة الكتاب المدرسي وأسئلة الفهم في التبويبات المجاورة.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6" dir="rtl">
      {/* 1. Official Header Banner (Clean & Simple) */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">
                  التقييمات الرسمية للوزارة 🏛️
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  كتاب الأداءات والتقييمات 2025/2026
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                أسئلة المهام الأدائية، الواجبات المنزلية، والتقييمات الأسبوعية الثلاثة مع نماذج الإجابة المعتمدة والتوثيق الحرفي لصفحات كتاب الوزارة.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="نسخ جميع أسئلة التقييم لهذا الدرس مع الإجابات"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>نسخ الأسئلة</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="تحميل الأسئلة كملف JSON"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>تحميل JSON</span>
            </button>
          </div>
        </div>

        {/* Booklet Reference Bar */}
        {assessments && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>نطاق صفحات كتاب التقييمات:</span>
              <strong className="text-indigo-300 font-mono">{assessments.bookletPages}</strong>
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>مراجع كتاب الشرح الأصلي:</span>
              <strong className="text-emerald-300 font-mono">{assessments.textbookPages}</strong>
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span>
              إجمالي: <strong className="text-white font-mono">{assessments.totalQuestions} سؤالاً</strong> ({assessments.mcqCount} اختيار من متعدد • {assessments.essayCount} مقالي)
            </span>
          </div>
        )}
      </div>

      {/* 2. Interactive Filter Strip (Simple, Clean, One Row) */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 sm:p-4 space-y-3 shadow-md">
        {/* Row A: Section Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 pl-1 flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
              <span>القسم:</span>
            </span>

            {SECTION_FILTERS.map((s) => {
              const isSelected = sectionFilter === s.id;
              const count =
                s.id === "all"
                  ? sectionCounts.all
                  : s.id === "performance_task_1"
                  ? sectionCounts.p1
                  : s.id === "performance_task_2"
                  ? sectionCounts.p2
                  : s.id === "homework"
                  ? sectionCounts.hw
                  : sectionCounts.weekly;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSectionFilter(s.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <span>{s.shortLabel}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(sectionFilter !== "all" || typeFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>

        {/* Row B: Type Filter & Keyword Search */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 pl-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>النوع:</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              الكل ({sectionCounts.all})
            </button>

            <button
              type="button"
              onClick={() => {
                setTypeFilter("mcq");
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "mcq"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              اختيار من متعدد ({sectionCounts.mcq})
            </button>

            <button
              type="button"
              onClick={() => {
                setTypeFilter("essay");
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "essay"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              أسئلة مقالية ({sectionCounts.essay})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="بحث في أسئلة الدرس..."
              className="w-full pl-7 pr-8 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Score Tracker (When student answers an MCQ) */}
      {scoreStats.answered > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:px-4 flex items-center justify-between gap-3 flex-wrap text-xs font-bold shadow-md">
          <div className="flex items-center gap-3 text-slate-300 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">تمت الإجابة:</span>
              <span className="text-white font-mono">{scoreStats.answered}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">إجابات صحيحة:</span>
              <span className="text-emerald-400 font-mono">{scoreStats.correct}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">النسبة المئوية:</span>
              <span className="text-indigo-300 font-mono">
                {Math.round((scoreStats.correct / scoreStats.answered) * 100)}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScoreStats({ answered: 0, correct: 0 })}
            className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            إعادة ضبط العداد
          </button>
        </div>
      )}

      {/* 4. Display Controls Bar */}
      <div className="flex items-center justify-between gap-2 px-1 text-xs text-slate-400 flex-wrap">
        <span>
          عرض <strong>{displayedQuestions.length}</strong> من إجمالي <strong>{filteredQuestions.length}</strong> سؤالاً مطابقاً
        </span>

        {filteredQuestions.length > pageSize && (
          <button
            type="button"
            onClick={() => setShowAllInOnePage((prev) => !prev)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            {showAllInOnePage ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>تقسيم إلى صفحات ({pageSize} لكل صفحة)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>عرض جميع الأسئلة في صفحة واحدة</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 5. Questions List */}
      {displayedQuestions.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-sm">لا توجد أسئلة تطابق الفلتر المحدد.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-indigo-400 hover:underline cursor-pointer"
          >
            إعادة تعيين الفلتر
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedQuestions.map((q, idx) => {
            const questionNumber = showAllInOnePage ? idx + 1 : (safePage - 1) * pageSize + idx + 1;
            return (
              <OfficialAssessmentCard
                key={q.id}
                question={q}
                indexNumber={questionNumber}
                onAnswerSelected={handleAnswerSelected}
              />
            );
          })}

          {/* Pagination (if not showing all) */}
          {!showAllInOnePage && totalPages > 1 && (
            <nav
              aria-label="تصفح صفحات أسئلة الدرس"
              className="flex items-center justify-between gap-2 p-2 bg-slate-900/70 border border-slate-800 rounded-2xl mt-4"
            >
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-300">
                صفحة {safePage} من {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
