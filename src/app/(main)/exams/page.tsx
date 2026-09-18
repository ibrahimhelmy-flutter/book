"use client";

import React, { useState, useMemo } from "react";
import { CURRICULUM_DATA } from "@/data/curriculum";
import {
  getAllEnrichedQuestions,
  filterEnrichedQuestions,
  createExamModelFromQuestions,
  SimpleDifficulty,
  EnrichedSimpleQuestion,
} from "@/lib/practice-data";
import { GeneratedExamModel } from "@/lib/exam-generator/types";
import { SimpleQuestionCard } from "@/components/quiz/SimpleQuestionCard";
import { ExamInteractiveRunner } from "@/components/exam-generator/ExamInteractiveRunner";
import { ComponentErrorBoundary } from "@/components/common/ComponentErrorBoundary";
import {
  Award,
  BookOpen,
  Sparkles,
  Timer,
  Clock,
  Play,
  Filter,
  Search,
  RotateCcw,
  Copy,
  Check,
  Code,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";

export default function UnifiedQuestionsAndExamsPage() {
  // 1. Load all enriched questions across the entire curriculum
  const allQuestions = useMemo(() => getAllEnrichedQuestions(), []);

  // 2. Filter states
  // selectedChapterIds: empty array = all chapters
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  // selectedLessonKeys: empty array = all lessons within selected chapters
  const [selectedLessonKeys, setSelectedLessonKeys] = useState<string[]>([]);
  // selectedDifficulty: "all" | "easy" | "medium" | "hard"
  const [selectedDifficulty, setSelectedDifficulty] = useState<SimpleDifficulty | "all">("all");
  // searchQuery for keyword filtering
  const [searchQuery, setSearchQuery] = useState<string>("");
  // isUnitReviewOnly for focusing exclusively on comprehensive unit review questions
  const [isUnitReviewOnly, setIsUnitReviewOnly] = useState<boolean>(false);

  // 3. UI View Tab: "practice" (direct cards) | "presets" (ready booklet exams)
  const [activeTab, setActiveTab] = useState<"practice" | "presets">("practice");

  // 4. Live interactive exam session model
  const [activeExamModel, setActiveExamModel] = useState<GeneratedExamModel | null>(null);

  // 5. User practice score tracker
  const [scoreStats, setScoreStats] = useState<{ answered: number; correct: number }>({
    answered: 0,
    correct: 0,
  });

  // 6. Pagination state for practice mode
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // 7. JSON modal & copy state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 8. Timed exam launch config modal
  const [isExamConfigModalOpen, setIsExamConfigModalOpen] = useState<boolean>(false);
  const [examCountChoice, setExamCountChoice] = useState<number>(20);

  // Available chapters from curriculum data
  const chapters = CURRICULUM_DATA;

  // Visible lessons based on selected chapters (if no chapter selected, all lessons)
  const visibleLessons = useMemo(() => {
    if (selectedChapterIds.length === 0) {
      return chapters.flatMap((ch) => ch.lessons);
    }
    return chapters
      .filter((ch) => selectedChapterIds.includes(ch.id))
      .flatMap((ch) => ch.lessons);
  }, [chapters, selectedChapterIds]);

  // Handle Chapter selection/toggle
  const handleToggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) => {
      let next: string[];
      if (prev.includes(chapterId)) {
        next = prev.filter((id) => id !== chapterId);
      } else {
        next = [...prev, chapterId];
      }
      // When chapters change, reset lesson selection so it defaults to all in selected
      setSelectedLessonKeys([]);
      setPage(1);
      return next;
    });
  };

  const handleSelectAllChapters = () => {
    setSelectedChapterIds([]);
    setSelectedLessonKeys([]);
    setIsUnitReviewOnly(false);
    setPage(1);
  };

  // Handle Lesson selection/toggle
  const handleToggleLesson = (lessonKey: string) => {
    setSelectedLessonKeys((prev) => {
      let next: string[];
      if (prev.includes(lessonKey)) {
        next = prev.filter((k) => k !== lessonKey);
      } else {
        next = [...prev, lessonKey];
      }
      setPage(1);
      return next;
    });
  };

  const handleSelectAllLessons = () => {
    setSelectedLessonKeys([]);
    setPage(1);
  };

  const handleClearAllLessons = () => {
    // If cleared, select nothing
    setSelectedLessonKeys(["NONE"]);
    setPage(1);
  };

  // Toggle Unit Review Only mode
  const handleToggleUnitReviewOnly = () => {
    setIsUnitReviewOnly((prev) => {
      const next = !prev;
      if (next && selectedChapterIds.length === 0) {
        setSelectedChapterIds(["chapter-1"]);
      }
      setSelectedLessonKeys([]);
      setPage(1);
      return next;
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedChapterIds([]);
    setSelectedLessonKeys([]);
    setIsUnitReviewOnly(false);
    setSelectedDifficulty("all");
    setSearchQuery("");
    setPage(1);
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (selectedLessonKeys.includes("NONE")) return [];

    return filterEnrichedQuestions(allQuestions, {
      chapterIds: selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
      lessonKeys: selectedLessonKeys.length > 0 ? selectedLessonKeys : undefined,
      difficulty: selectedDifficulty,
      searchQuery: searchQuery,
      unitReviewOnly: isUnitReviewOnly,
    });
  }, [allQuestions, selectedChapterIds, selectedLessonKeys, selectedDifficulty, searchQuery, isUnitReviewOnly]);

  // Difficulty counts for current unit/lesson scope (ignoring difficulty filter)
  const difficultyCounts = useMemo(() => {
    const scopeQuestions = filterEnrichedQuestions(allQuestions, {
      chapterIds: selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
      lessonKeys: selectedLessonKeys.length > 0 ? selectedLessonKeys : undefined,
      searchQuery: searchQuery,
      unitReviewOnly: isUnitReviewOnly,
    });

    return {
      all: scopeQuestions.length,
      easy: scopeQuestions.filter((q) => q.difficulty === "easy").length,
      medium: scopeQuestions.filter((q) => q.difficulty === "medium").length,
      hard: scopeQuestions.filter((q) => q.difficulty === "hard").length,
    };
  }, [allQuestions, selectedChapterIds, selectedLessonKeys, searchQuery, isUnitReviewOnly]);

  // Unit review questions count in current chapter scope
  const unitReviewQuestionsCount = useMemo(() => {
    return filterEnrichedQuestions(allQuestions, {
      chapterIds: selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
      unitReviewOnly: true,
    }).length;
  }, [allQuestions, selectedChapterIds]);

  // Questions count map per lesson
  const questionCountByLesson = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach((q) => {
      counts[q.lessonKey] = (counts[q.lessonKey] || 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  // Questions count map per chapter
  const questionCountByChapter = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach((q) => {
      counts[q.chapterId] = (counts[q.chapterId] || 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  // Paginated questions
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const safePage = Math.min(page, totalPages);
  const paginatedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, safePage, pageSize]);

  // Answer selection tracker
  const handleAnswerSelected = (isCorrect: boolean) => {
    setScoreStats((prev) => ({
      answered: prev.answered + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
    }));
  };

  // Launch timed interactive exam with currently filtered questions
  const handleStartExamOnFiltered = (count: number) => {
    if (filteredQuestions.length === 0) return;
    const modelTitle =
      selectedChapterIds.length === 1
        ? `اختبار ${chapters.find((c) => c.id === selectedChapterIds[0])?.title || "الفصل"}`
        : selectedLessonKeys.length === 1
        ? `اختبار الدرس ${selectedLessonKeys[0]}`
        : "اختبار تدريبي مخصص على الدروس المحددة";

    const duration = Math.max(15, Math.round(count * 1.8));
    const model = createExamModelFromQuestions(filteredQuestions, {
      title: modelTitle,
      durationMinutes: duration,
      maxQuestions: count,
      randomize: true,
    });

    setActiveExamModel(model);
    setIsExamConfigModalOpen(false);
  };

  // Launch Quick Preset Booklet
  const handleLaunchQuickPreset = (presetKey: "FINAL" | string) => {
    let presetQuestions: EnrichedSimpleQuestion[] = [];
    let title = "";
    let duration = 60;
    let maxCount = 30;

    if (presetKey === "FINAL") {
      presetQuestions = allQuestions;
      title = "امتحان البوكليت الشامل لكامل المنهج (30 سؤالاً)";
      duration = 60;
      maxCount = 30;
    } else if (presetKey === "UNIT_1_REVIEW") {
      presetQuestions = allQuestions.filter((q) => q.isUnitReview || q.lessonKey === "1-review");
      title = "امتحان مراجعة الوحدة الأولى: أسئلة الربط والتحليل (30 سؤالاً)";
      duration = 45;
      maxCount = 30;
    } else {
      const ch = chapters.find((c) => c.id === presetKey);
      if (ch) {
        presetQuestions = allQuestions.filter((q) => q.chapterId === ch.id);
        title = `امتحان بوكليت ${ch.title} (الفصل ${ch.number})`;
        duration = 35;
        maxCount = 18;
      }
    }

    if (presetQuestions.length > 0) {
      const model = createExamModelFromQuestions(presetQuestions, {
        title,
        durationMinutes: duration,
        maxQuestions: maxCount,
        randomize: true,
      });
      setActiveExamModel(model);
    }
  };

  // Copy JSON
  const handleCopyJson = async () => {
    const jsonStr = JSON.stringify(filteredQuestions, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
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

  // Scope summary text in Arabic
  const scopeSummaryText = useMemo(() => {
    if (isUnitReviewOnly) {
      if (selectedChapterIds.length === 1) {
        const ch = chapters.find((c) => c.id === selectedChapterIds[0]);
        return `مراجعة شاملة: الوحدة ${ch?.number} (${ch?.title}) • أسئلة ربط وتحليل`;
      }
      return "مراجعة شاملة على الوحدات (أسئلة ربط متقدمة بين الدروس)";
    }

    const chCount = selectedChapterIds.length;
    const lCount = selectedLessonKeys.length;

    if (chCount === 0 && lCount === 0) {
      return "كامل المنهج الدراسي (4 وحدات • 14 درساً ومراجعة شاملة)";
    }
    if (chCount === 1 && lCount === 0) {
      const ch = chapters.find((c) => c.id === selectedChapterIds[0]);
      return `الوحدة ${ch?.number}: ${ch?.title} (جميع دروسها ومراجعتها)`;
    }
    if (chCount > 1 && lCount === 0) {
      return `${chCount} وحدات محددة (جميع دروسها)`;
    }
    if (lCount === 1) {
      if (selectedLessonKeys[0] === "1-review" || selectedLessonKeys[0].endsWith("-review")) {
        return "مراجعة شاملة على الوحدة الأولى (أسئلة الربط والتحليل)";
      }
      const l = chapters.flatMap((c) => c.lessons).find((x) => x.number === selectedLessonKeys[0]);
      return `الدرس ${selectedLessonKeys[0]}: ${l?.title || ""}`;
    }
    return `${lCount} دروس ومراجعات محددة من المنهج`;
  }, [selectedChapterIds, selectedLessonKeys, chapters, isUnitReviewOnly]);

  // =========================================================================
  // VIEW: Interactive Running Exam Session
  // =========================================================================
  if (activeExamModel) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 min-w-0" dir="rtl">
        <ComponentErrorBoundary fallbackTitle="تعذر تشغيل جلسة الاختبار الإلكتروني">
          <ExamInteractiveRunner
            model={activeExamModel}
            onExit={() => setActiveExamModel(null)}
          />
        </ComponentErrorBoundary>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Unified Questions & Exams Page
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* === 1. Top Hero Header === */}
        <header className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنظومة الموحدة للأسئلة والامتحانات</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                بنك الأسئلة والامتحانات التفاعلية 🎯
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                صفحة واحدة متكاملة تجمع أسئلة الدروس والامتحانات الموقوتة. حدد أي درس أو عدة دروس، أو وحدة كاملة، وتدرّب عليها فورياً أو اخض اختباراً إلكترونياً مع مؤقت وتصحيح ذكي.
              </p>
            </div>

            {/* Quick Actions Strip */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                title="نسخ الأسئلة الحالية بصيغة JSON"
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

          {/* Dynamic Overview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-indigo-400 font-mono block">
                {allQuestions.length}
              </span>
              <span className="text-[11px] text-slate-400">إجمالي الأسئلة المتاحة</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono block">
                14
              </span>
              <span className="text-[11px] text-slate-400">درساً في 4 وحدات</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono block">
                فوري وموقوت
              </span>
              <span className="text-[11px] text-slate-400">نمطا تدريب واختبار</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-purple-400 font-mono block">
                100%
              </span>
              <span className="text-[11px] text-slate-400">مطابق لكتاب الوزارة</span>
            </div>
          </div>
        </header>

        {/* === 2. Unified Filter Section (الوحدات والدروس والصعوبة) === */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* A. Header of Filter */}
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>تصفية وتحديد نطاق الأسئلة (الوحدات والدروس):</span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الفلتر بالكامل</span>
            </button>
          </div>

          {/* B. Unit / Chapter Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>1. اختر الوحدة / الوحدات:</span>
              </span>
              {selectedChapterIds.length > 0 && (
                <span className="text-[11px] text-indigo-400 font-normal">
                  (محدد: {selectedChapterIds.length} من {chapters.length})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSelectAllChapters}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedChapterIds.length === 0
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                    : "bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800"
                }`}
              >
                <span>جميع الوحدات</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {allQuestions.length}
                </span>
              </button>

              {chapters.map((ch) => {
                const isSelected = selectedChapterIds.includes(ch.id);
                const qCount = questionCountByChapter[ch.id] || 0;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleToggleChapter(ch.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                        : "bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <span>الوحدة {ch.number}: {ch.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono text-slate-300">
                      {qCount}
                    </span>
                  </button>
                );
              })}

              {/* Unit 1 Comprehensive Review Pill */}
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <button
                type="button"
                onClick={handleToggleUnitReviewOnly}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
                  isUnitReviewOnly
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 border-amber-300 ring-2 ring-amber-400/50 scale-[1.02]"
                    : "bg-amber-950/40 text-amber-300 hover:bg-amber-950/70 border-amber-700/60 hover:text-amber-200 shadow-sm"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>⭐ مراجعة شاملة: الوحدة الأولى</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isUnitReviewOnly
                      ? "bg-white/20 text-white"
                      : "bg-amber-900/80 text-amber-200 border border-amber-700/60"
                  }`}
                >
                  {unitReviewQuestionsCount} سؤالاً
                </span>
              </button>
            </div>
          </div>

          {/* C. Lessons Filter Pills (درس أو دروس) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. اختر الدرس / الدروس:</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllLessons}
                  className="text-[11px] text-indigo-300 hover:text-white transition-colors cursor-pointer"
                >
                  تحديد كل الدروس المعروضة
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={handleClearAllLessons}
                  className="text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {visibleLessons.map((lesson) => {
                const isSelected =
                  !selectedLessonKeys.includes("NONE") &&
                  (selectedLessonKeys.length === 0 || selectedLessonKeys.includes(lesson.number));
                const count = questionCountByLesson[lesson.number] || 0;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => handleToggleLesson(lesson.number)}
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
                      <span className="text-xs font-semibold truncate leading-tight">
                        {lesson.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Unit 1 Comprehensive Review card in the lesson grid */}
              {(selectedChapterIds.length === 0 || selectedChapterIds.includes("chapter-1")) && (
                <button
                  type="button"
                  onClick={handleToggleUnitReviewOnly}
                  className={`p-2.5 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                    isUnitReviewOnly
                      ? "bg-gradient-to-r from-amber-950/60 to-amber-900/40 border-amber-500 text-white shadow-md ring-1 ring-amber-400/40"
                      : "bg-amber-950/20 border-amber-800/40 text-amber-300/80 hover:text-amber-200 hover:border-amber-700"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                        isUnitReviewOnly
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "bg-amber-950 border border-amber-700/50 text-amber-300"
                      }`}
                    >
                      ★
                    </span>
                    <span className="text-xs font-bold truncate leading-tight">
                      مراجعة شاملة: الوحدة الأولى
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-800/60 text-amber-300 shrink-0">
                    {unitReviewQuestionsCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* D. Difficulty & Search Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-slate-800/60">
            {/* Difficulty filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 pl-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>الصعوبة:</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedDifficulty("all");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDifficulty === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>الكل</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {difficultyCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDifficulty("easy");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDifficulty === "easy"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>سهل</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {difficultyCounts.easy}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDifficulty("medium");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDifficulty === "medium"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>متوسط</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {difficultyCounts.medium}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDifficulty("hard");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDifficulty === "hard"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>صعب</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {difficultyCounts.hard}
                </span>
              </button>
            </div>

            {/* Keyword search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="بحث في نص السؤال أو الخيارات..."
                className="w-full pl-8 pr-9 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* E. Action Summary Strip */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>النطاق النشط:</span>
                <span className="text-indigo-300 font-semibold">{scopeSummaryText}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                متاح الآن <strong>{filteredQuestions.length} سؤالاً</strong> مطابقاً للتصفية الحالية.
              </p>
            </div>

            {/* Launch Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={filteredQuestions.length === 0}
                onClick={() => setIsExamConfigModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Timer className="w-4 h-4 text-amber-300" />
                <span>بدء اختبار موقوت على المحدد</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("presets")}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "presets"
                    ? "bg-amber-600 text-white border-amber-500"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>نماذج البوكليت الجاهزة</span>
              </button>
            </div>
          </div>
        </section>

        {/* === 3. Main Content Views (Practice Cards vs Presets) === */}
        {activeTab === "presets" ? (
          /* PRESETS VIEW: Ready-made booklet exams */
          <section className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black">
                  نماذج البوكليت الامتحانية المعتمدة ⏱️
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  اختر أحد النماذج المعتمدة أدناه لخوض اختبار إلكتروني فوري مع مؤقت زمني وتصحيح آلي وسلالم التقدير.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("practice")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
              >
                ← العودة لبطاقات التدريب المباشر
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Comprehensive Full Exam */}
              <div
                onClick={() => handleLaunchQuickPreset("FINAL")}
                className="p-6 bg-slate-900/90 hover:bg-slate-800/80 border border-indigo-500/40 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group md:col-span-2"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      الامتحان التجريبي الشامل المعتمد
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> 60 دقيقة
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    امتحان البوكليت الشامل لكامل كتاب تكنولوجيا المعلومات
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    30 سؤالاً متوازناً تغطي كافة فصول الكتاب بنسب مدروسة بدقة، مع تصحيح آلي ومراجعة الأخطاء.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-indigo-400">30 سؤالاً • 60 درجة</span>
                  <span className="px-4 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>بدء الاختبار فوراً</span>
                  </span>
                </div>
              </div>

              {/* Unit 1 Comprehensive Review Preset */}
              <div
                onClick={() => handleLaunchQuickPreset("UNIT_1_REVIEW")}
                className="p-6 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 hover:border-amber-500/60 border border-amber-500/40 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group md:col-span-2"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      امتحان مراجعة الوحدة الأولى المعتمد
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> 45 دقيقة
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    امتحان المراجعة الشاملة لربط وتحليل مفاهيم الوحدة الأولى
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    30 سؤال اختيار من متعدد من بنك أسئلة (chapter1.md) تغطي الذكاء الاصطناعي، الرعاية الصحية، الأخلاقيات، ومجالات المستقبل مع إحصائيات فورية وتصحيح تفاعلي.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-amber-400">30 سؤالاً • 60 درجة</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>خوض الامتحان الآن</span>
                  </span>
                </div>
              </div>

              {/* Individual Chapter Presets */}
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleLaunchQuickPreset(ch.id)}
                  className="p-6 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        امتحان الوحدة {ch.number}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> 35 دقيقة
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {ch.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {ch.description || `18 سؤالاً مركزاً تغطي دروس الوحدة ${ch.number}.`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-blue-400">18 سؤالاً • 36 درجة</span>
                    <span className="px-4 py-2 bg-slate-800 group-hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>بدء الاختبار</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* PRACTICE VIEW: Direct question cards */
          <section className="space-y-6">
            {/* Unit Review Active Banner */}
            {isUnitReviewOnly && (
              <div className="p-4 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-amber-200 flex-wrap animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>أسئلة المراجعة الشاملة على الوحدة الأولى (30 سؤالاً)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        معتمدة من chapter1.md
                      </span>
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      أسئلة الربط والتحليل الشاملة لكافة مفاهيم ودروس الوحدة الأولى مع تفسير تفصيلي لكل خيار.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchQuickPreset("UNIT_1_REVIEW")}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>خوضها كامتحان موقوت</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleUnitReviewOnly}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-800"
                  >
                    عرض كل الأسئلة
                  </button>
                </div>
              </div>
            )}

            {/* Score Tracker Strip (When student starts answering) */}
            {scoreStats.answered > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap text-xs font-bold">
                <div className="flex items-center gap-4 text-slate-300 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">تمت الإجابة:</span>
                    <span className="text-white font-mono text-sm">{scoreStats.answered}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">إجابات صحيحة:</span>
                    <span className="text-emerald-400 font-mono text-sm">{scoreStats.correct}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">النسبة المئوية:</span>
                    <span className="text-indigo-300 font-mono text-sm">
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

            {/* Questions List */}
            <div className="space-y-4 sm:space-y-6">
              {paginatedQuestions.map((q, idx) => {
                const questionNumber = (safePage - 1) * pageSize + idx + 1;
                return (
                  <SimpleQuestionCard
                    key={`${safePage}-${q.id}-${idx}`}
                    question={q}
                    questionNumber={questionNumber}
                    lessonBadge={q.isUnitReview ? "مراجعة شاملة" : `درس ${q.lessonKey}: ${q.lessonTitle}`}
                    chapterBadge={`الوحدة ${q.chapterNumber}`}
                    isUnitReview={q.isUnitReview}
                    onAnswerSelected={handleAnswerSelected}
                  />
                );
              })}

              {paginatedQuestions.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-bold text-white text-base">لا توجد أسئلة تطابق الفلتر المحدد حالياً.</p>
                  <p className="text-xs text-slate-500">
                    جرب تغيير تحديد الدروس أو اختيار مستوى صعوبة آخر أو مسح كلمة البحث.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    إعادة تعيين الفلتر
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav
                aria-label="تصفح صفحات الأسئلة"
                className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/70 border border-slate-800 rounded-2xl"
              >
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الصفحة السابقة</span>
                </button>

                <span className="text-xs font-mono font-bold text-slate-300">
                  صفحة {safePage} من {totalPages} ({filteredQuestions.length} سؤال)
                </span>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>الصفحة التالية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </nav>
            )}
          </section>
        )}
      </div>

      {/* === Timed Exam Config Modal === */}
      {isExamConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">إعداد الاختبار الإلكتروني الموقوت</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExamConfigModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-400">النطاق المحدد للاختبار:</div>
                <div className="text-white font-bold">{scopeSummaryText}</div>
                <div className="text-[11px] text-indigo-400 pt-1">
                  إجمالي الأسئلة المتاحة للاختيار منها: {filteredQuestions.length} سؤالاً
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">اختر عدد أسئلة الاختبار:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 30].map((num) => {
                    const isDisabled = filteredQuestions.length < num && filteredQuestions.length < 5;
                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setExamCountChoice(num)}
                        className={`py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          examCountChoice === num
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-sm font-mono">{num} سؤال</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ~ {Math.round(num * 1.8)} دقيقة
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleStartExamOnFiltered(examCountChoice)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>ابدأ الاختبار الآن</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExamConfigModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === JSON Modal Preview === */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  معاينة كود JSON للأسئلة المفلترة
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
                  ... تم عرض أول 15 سؤالاً من إجمالي {filteredQuestions.length} سؤالاً (استخدم زر &quot;نسخ الكل&quot; لنسخ المصفوفة كاملة).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
