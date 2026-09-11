"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Lesson } from "@/types";
import {
  get50DeepQuestionsForLesson,
  DeepChallengingQuestion,
} from "@/data/deep-questions";
import {
  CheckCircle2,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Check,
  X,
  Compass,
  AlertTriangle,
  Lightbulb,
  FileQuestion,
  Search,
  Filter,
  Brain,
  Target,
  GraduationCap,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";
import { MobileQuizNavigation } from "./MobileQuizNavigation";

interface Props {
  lesson: Lesson;
}

export function DeepComprehensionViewer({ lesson }: Props) {
  // Load the 50 deep comprehension questions for this lesson
  const allQuestions = useMemo<DeepChallengingQuestion[]>(() => {
    return get50DeepQuestionsForLesson(lesson);
  }, [lesson]);

  // View Mode: "study" (instant feedback & explanations) | "exam" (graded test)
  const [viewMode, setViewMode] = useState<"study" | "exam">("study");

  // Cognitive Level Filter
  const [selectedCognitiveLevel, setSelectedCognitiveLevel] = useState<string>("ALL");

  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Current Question Index in filtered list
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User Answers state: questionId -> selectedOptionIndex (0, 1, 2, 3)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  // Show detailed explanation & trap per question in study mode
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Exam submission state
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Quick 50-question Grid Modal open state for mobile/desktop
  const [isGridModalOpen, setIsGridModalOpen] = useState<boolean>(false);

  // Mobile Collapsible Search & Filter state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Ref for the main question card (to scroll to top on question change)
  const questionCardRef = useRef<HTMLDivElement>(null);

  // Ref for the active button in the question number jump strip (to auto-scroll into view)
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Touch tracking for swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Distinct cognitive levels present in this lesson
  const cognitiveLevelsList = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach((q) => {
      counts[q.cognitiveLevel] = (counts[q.cognitiveLevel] || 0) + 1;
    });
    return Object.entries(counts).map(([level, count]) => ({
      level,
      count,
    }));
  }, [allQuestions]);

  // Filtered questions based on selected cognitive level & search query
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesLevel =
        selectedCognitiveLevel === "ALL" || q.cognitiveLevel === selectedCognitiveLevel;
      const matchesSearch =
        !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.misconceptionTrap.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [allQuestions, selectedCognitiveLevel, searchQuery]);

  const totalFiltered = filteredQuestions.length;
  const safeIndex = Math.min(currentIndex, Math.max(0, totalFiltered - 1));
  const currentQ = filteredQuestions[safeIndex] || allQuestions[0];

  // Auto-scroll the active question button into view inside the jump strip (Desktop/Tablet only)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      activeBtnRef.current &&
      activeBtnRef.current.offsetParent !== null
    ) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [safeIndex]);

  // Smooth scroll to question card top when user navigates
  const scrollToQuestionCard = () => {
    if (questionCardRef.current) {
      const rect = questionCardRef.current.getBoundingClientRect();
      // If card top is scrolled above viewport or too low, align nicely
      if (rect.top < 60 || rect.top > 250) {
        window.scrollTo({
          top: window.scrollY + rect.top - 70,
          behavior: "smooth",
        });
      }
    }
  };

  const handleNavigate = (newIdx: number) => {
    setCurrentIndex(newIdx);
    setTimeout(() => {
      scrollToQuestionCard();
    }, 40);
  };

  // Touch Swipe Handlers for native mobile feel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect intentional horizontal swipe (>45px and dominant over vertical)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      // In Arabic RTL:
      // Swipe left (negative deltaX) advances forward to next question
      if (deltaX < 0 && safeIndex < totalFiltered - 1) {
        handleNavigate(safeIndex + 1);
      }
      // Swipe right (positive deltaX) moves back to previous question
      else if (deltaX > 0 && safeIndex > 0) {
        handleNavigate(safeIndex - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Handler for selecting an option
  const handleSelectOption = (qId: string, optIdx: number) => {
    if (viewMode === "exam" && isExamSubmitted) return;

    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));

    // In study mode, automatically reveal explanation
    if (viewMode === "study") {
      setShowExplanation((prev) => ({
        ...prev,
        [qId]: true,
      }));

      // If correct, fire celebratory confetti
      if (optIdx === currentQ?.correctAnswer) {
        fireConfetti();
      }
    }
  };

  // Reset quiz/study progress
  const handleReset = () => {
    if (typeof window !== "undefined") {
      if (!window.confirm("هل ترغب بإعادة تعيين إجاباتك والبدء من جديد؟")) return;
    }
    setUserAnswers({});
    setShowExplanation({});
    setIsExamSubmitted(false);
    setCurrentIndex(0);
  };

  // Submit Exam
  const handleSubmitExam = () => {
    setIsExamSubmitted(true);
    const correctCount = allQuestions.reduce((acc, q) => {
      return userAnswers[q.id] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    if (correctCount >= Math.round(allQuestions.length * 0.8)) {
      fireConfetti();
    }
    setTimeout(() => {
      scrollToQuestionCard();
    }, 50);
  };

  // Calculate score statistics
  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    allQuestions.forEach((q) => {
      if (userAnswers[q.id] !== undefined) {
        answered++;
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      }
    });
    return {
      answered,
      correct,
      total: allQuestions.length,
      percent: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      completionRate: Math.round((answered / (allQuestions.length || 1)) * 100),
    };
  }, [allQuestions, userAnswers]);

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        <p>لا تتوفر أسئلة فهم لهذا الدرس حالياً.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0 space-y-3 sm:space-y-6 quiz-content-padding md:pb-6" dir="rtl">
      {/* 1. Header Banner & Mode Switcher (Desktop / Tablet) */}
      <div className="hidden md:flex p-4 sm:p-5 md:p-6 bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-xl text-white flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-inner mt-0.5 sm:mt-0">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                بنك أسئلة الفهم والتحليل المعمق 🧠
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">
                {allQuestions.length} سؤالاً تحليلياً
              </span>
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white mt-1 leading-snug">
              قياس الفهم، التمييز بين المفاهيم، وحل التريكات الامتحانية
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-2 sm:line-clamp-none">
              مصممة لتمييز الفهم الحقيقي عن الحفظ المباشر، وتغطية جميع مفاهيم الدرس بنسبة 100%.
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto pt-1 md:pt-0 border-t border-purple-500/20 md:border-t-0">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold w-full md:w-auto gap-1">
            <button
              onClick={() => setViewMode("study")}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${viewMode === "study"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold">مذاكرة وتحليل</span>
            </button>
            <button
              onClick={() => setViewMode("exam")}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${viewMode === "exam"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold">اختبار تقييمي</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 sm:p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="إعادة تعيين التقدم والبدء من جديد"
            aria-label="إعادة تعيين التقدم"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Gamified Progress Bar & Cognitive Statistics (Desktop / Tablet) */}
      <div className="hidden md:block space-y-2.5">
        {/* Visual Progress Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>معدل إنجاز الأسئلة التحليلية:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-black text-xs sm:text-sm">
                {stats.answered} / {stats.total} سؤال
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                {stats.completionRate}%
              </span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-gradient-to-l from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">إجمالي الأسئلة</span>
              <span className="text-base sm:text-lg font-black text-white">{allQuestions.length}</span>
            </div>
            <FileQuestion className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 shrink-0 mr-1 sm:mr-0" />
          </div>

          <div className="p-2.5 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">تمت الإجابة</span>
              <span className="text-base sm:text-lg font-black text-white">
                {stats.answered} <span className="text-[10px] text-slate-400 font-normal">/ {stats.total}</span>
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0 mr-1 sm:mr-0" />
          </div>

          <div className="p-2.5 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">الإجابات الصحيحة</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">{stats.correct}</span>
            </div>
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0 mr-1 sm:mr-0" />
          </div>

          <div className="p-2.5 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">نسبة الإتقان</span>
              <span className="text-base sm:text-lg font-black text-amber-400">
                {stats.answered > 0 ? `${stats.percent}%` : "0%"}
              </span>
            </div>
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 mr-1 sm:mr-0" />
          </div>
        </div>
      </div>

      {/* 3. Cognitive Level Filter Pills & Search (Desktop / Tablet) */}
      <div className="hidden md:block space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>تصفية حسب المستوى الإدراكي ومجال الفهم:</span>
          </span>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="ابحث في الأسئلة والتريكات..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-8 py-2 sm:py-1.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white"
                title="مسح البحث"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Pills container on desktop */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
          <button
            onClick={() => {
              setSelectedCognitiveLevel("ALL");
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${selectedCognitiveLevel === "ALL"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
          >
            <span>الكل</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {allQuestions.length}
            </span>
          </button>

          {cognitiveLevelsList.map((item) => (
            <button
              key={item.level}
              onClick={() => {
                setSelectedCognitiveLevel(item.level);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${selectedCognitiveLevel === item.level
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
            >
              <span>{item.level}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Question Numbers Jump Strip + Quick Grid Modal Trigger (Desktop / Tablet) */}
      <div className="hidden md:flex p-2 sm:p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl items-center gap-2 shadow-inner">
        {/* Quick Grid Modal Trigger Button */}
        <button
          onClick={() => setIsGridModalOpen(true)}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-sm"
          title="فتح شبكة الـ 50 سؤالاً للاختيار السريع"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="hidden xs:inline">شبكة الأسئلة</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/30 font-black">
            {stats.answered}/50
          </span>
        </button>

        <div className="h-6 w-px bg-slate-800 shrink-0" />

        {/* Horizontal Number Scroll Strip */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {filteredQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCorrect = isAnswered && userAnswers[q.id] === q.correctAnswer;
            const isCurrent = idx === safeIndex;

            let btnClass = "bg-slate-800 text-slate-400 hover:bg-slate-700";
            if (isCurrent) {
              btnClass =
                "bg-purple-600 text-white ring-2 ring-purple-400 shadow-lg shadow-purple-600/40 font-black scale-105";
            } else if (isAnswered) {
              if (viewMode === "study" || isExamSubmitted) {
                btnClass = isCorrect
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-600/30 text-rose-300 border border-rose-500/40";
              } else {
                btnClass = "bg-indigo-600 text-white";
              }
            }

            return (
              <button
                key={q.id}
                ref={isCurrent ? activeBtnRef : undefined}
                onClick={() => handleNavigate(idx)}
                aria-current={isCurrent ? "page" : undefined}
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${btnClass}`}
                title={`سؤال ${idx + 1}: ${q.title}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* === MOBILE-FIRST SLEEK COMPACT TOP BAR (< md only) === */}
      <div className="md:hidden bg-slate-900/95 border border-purple-500/30 rounded-2xl p-2 px-2.5 space-y-2 shadow-lg min-w-0 max-w-full">
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          {/* Mode Switcher Pill */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
            <button
              onClick={() => setViewMode("study")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1 cursor-pointer ${viewMode === "study"
                  ? "bg-purple-600 text-white shadow-sm font-black"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Lightbulb className="w-3 h-3 shrink-0" />
              <span>مذاكرة</span>
            </button>
            <button
              onClick={() => setViewMode("exam")}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1 cursor-pointer ${viewMode === "exam"
                  ? "bg-indigo-600 text-white shadow-sm font-black"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Target className="w-3 h-3 shrink-0" />
              <span>اختبار</span>
            </button>
          </div>

          {/* Right Controls: Grid Trigger + Filter Toggle + Reset */}
          <div className="flex items-center gap-1.5">
            {/* Quick Grid Modal Trigger */}
            <button
              onClick={() => setIsGridModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              title="فتح شبكة الـ 50 سؤالاً"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[11px] font-black">{safeIndex + 1}/{totalFiltered}</span>
            </button>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className={`p-1.5 rounded-xl border text-xs cursor-pointer transition-all relative ${isMobileFilterOpen || selectedCognitiveLevel !== "ALL" || searchQuery
                  ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              title="البحث والتصفية"
              aria-label="تصفية الأسئلة"
            >
              <Filter className="w-3.5 h-3.5" />
              {(selectedCognitiveLevel !== "ALL" || searchQuery) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
              )}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="إعادة تعيين التقدم"
              aria-label="إعادة تعيين"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slim Progress Bar Line with percentage */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-1.5 flex-1 bg-slate-950 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-l from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-bold shrink-0">
            {stats.answered}/{stats.total} ({stats.completionRate}%)
          </span>
        </div>

        {/* Collapsible Search & Filter for Mobile */}
        {isMobileFilterOpen && (
          <div className="pt-2 border-t border-slate-800 space-y-2 animate-fadeIn">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder="ابحث في الأسئلة والتريكات..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-8 py-1.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Cognitive Level Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => {
                  setSelectedCognitiveLevel("ALL");
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${selectedCognitiveLevel === "ALL"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
              >
                الكل ({allQuestions.length})
              </button>
              {cognitiveLevelsList.map((item) => (
                <button
                  key={item.level}
                  onClick={() => {
                    setSelectedCognitiveLevel(item.level);
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${selectedCognitiveLevel === item.level
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-slate-950 text-slate-400 border border-slate-800"
                    }`}
                >
                  {item.level} ({item.count})
                </button>
              ))}
            </div>

            {(selectedCognitiveLevel !== "ALL" || searchQuery) && (
              <div className="flex justify-end pt-0.5">
                <button
                  onClick={() => {
                    setSelectedCognitiveLevel("ALL");
                    setSearchQuery("");
                    setCurrentIndex(0);
                  }}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  إلغاء كل التصفية والبحث
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Main Active Question Card with Touch Swipe Gestures */}
      {currentQ ? (
        <>
          {/* Mobile-only Top Navigation Bar — lives OUTSIDE the card so overflow-hidden never clips it */}
          <div className="md:hidden flex items-center justify-between gap-2 p-1.5 bg-slate-950/95 border border-slate-800 rounded-xl backdrop-blur shadow-lg">
            {/* Previous */}
            <button
              type="button"
              onClick={() => handleNavigate(Math.max(0, safeIndex - 1))}
              disabled={safeIndex === 0}
              className="min-h-[44px] min-w-[80px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700/60 active:scale-95 cursor-pointer"
              aria-label="السؤال السابق"
            >
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span>السابق</span>
            </button>

            {/* Center counter — tap to open grid */}
            <button
              type="button"
              onClick={() => setIsGridModalOpen(true)}
              className="min-h-[44px] flex-1 mx-1 rounded-xl bg-purple-950/80 border border-purple-500/40 hover:border-purple-400/60 text-purple-200 text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              aria-label={`السؤال ${safeIndex + 1} من ${totalFiltered}`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="font-mono font-black">{safeIndex + 1} / {totalFiltered}</span>
            </button>

            {/* Next or Submit */}
            {viewMode === "exam" && !isExamSubmitted && safeIndex >= totalFiltered - 1 ? (
              <button
                type="button"
                onClick={handleSubmitExam}
                className="min-h-[44px] min-w-[80px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span>إنهاء 🏆</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate(Math.min(totalFiltered - 1, safeIndex + 1))}
                disabled={safeIndex >= totalFiltered - 1}
                className="min-h-[44px] min-w-[80px] px-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-25 disabled:pointer-events-none text-white text-sm font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                aria-label="السؤال التالي"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>

          {/* Question Card */}
          <div
            ref={questionCardRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl relative transition-all"
          >
            {/* Top Metadata Badges Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[11px] sm:text-xs font-bold">
                  سؤال {safeIndex + 1} من {totalFiltered}
                </span>
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] sm:text-xs font-bold">
                  {currentQ.cognitiveLevel}
                </span>
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs font-bold">
                  {currentQ.difficulty === "very-hard" ? "صعب جداً 🔥" : "متوسط إلى صعب ⚡"}
                </span>
                {currentQ.type && (
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold">
                    {currentQ.type === "mcq"
                      ? "اختيار من متعدد"
                      : currentQ.type === "true_false"
                        ? "صواب أو خطأ"
                        : currentQ.type === "scenario"
                          ? "سيناريو تطبيقي"
                          : "سؤال تحليلي"}
                  </span>
                )}
              </div>

              {currentQ.source?.pages && (
                <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">مرجع الكتاب المدرسي: </span>
                  <span>ص {currentQ.source.pages.join(" - ")}</span>
                </span>
              )}
            </div>

            {/* Question Stem */}
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="text-[11px] sm:text-xs font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                <span>{currentQ.title}</span>
              </h4>
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 pt-1">
              {currentQ.options.map((optText, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                const isCorrectAnswer = currentQ.correctAnswer === optIdx;
                const isAnswered = userAnswers[currentQ.id] !== undefined;

                let optionStyle =
                  "bg-slate-950/80 border-slate-800 hover:border-purple-500/40 text-slate-200 hover:bg-slate-800/60";

                if (isSelected) {
                  optionStyle = "bg-purple-600/30 border-purple-500 text-white ring-2 ring-purple-500/40";
                }

                // Reveal correctness in study mode or after exam submission
                if (viewMode === "study" || isExamSubmitted) {
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      optionStyle =
                        "bg-emerald-950/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40 font-bold";
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyle =
                        "bg-rose-950/60 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 font-bold";
                    }
                  }
                }

                const letters = ["أ", "ب", "ج", "د"];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full min-h-[48px] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-right transition-all flex items-start gap-2.5 sm:gap-3.5 cursor-pointer text-sm sm:text-base leading-relaxed ${optionStyle}`}
                  >
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5 ${isSelected
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                          : "bg-slate-800 text-slate-300"
                        }`}
                    >
                      {letters[optIdx] || optIdx + 1}
                    </span>

                    <span className="flex-1 mt-0.5 text-sm sm:text-base font-medium">{optText}</span>

                    {/* Icon Feedback */}
                    {(viewMode === "study" || isExamSubmitted) && isAnswered && (
                      <div className="shrink-0 mt-0.5">
                        {isCorrectAnswer && <Check className="w-5 h-5 text-emerald-400" />}
                        {isSelected && !isCorrectAnswer && (
                          <X className="w-5 h-5 text-rose-400" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 6. Scientific Depth & Misconception Trap (Visible in Study mode when answered or toggled) */}
            {((viewMode === "study" &&
              (showExplanation[currentQ.id] || userAnswers[currentQ.id] !== undefined)) ||
              (viewMode === "exam" && isExamSubmitted)) && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-800 space-y-3 sm:space-y-4 animate-fadeIn">
                  {/* Scientific Depth Explanation */}
                  <div className="p-3.5 sm:p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl sm:rounded-2xl space-y-1.5 sm:space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>💡 التحليل والعمق العلمي المعتمد:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {currentQ.depthExplanation}
                    </p>
                  </div>

                  {/* Misconception Trap */}
                  {currentQ.misconceptionTrap && (
                    <div className="p-3.5 sm:p-5 bg-amber-950/30 border border-amber-500/30 rounded-xl sm:rounded-2xl space-y-1.5 sm:space-y-2 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>⚠️ الفخ المفاهيمي والتريكة الامتحانية:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        {currentQ.misconceptionTrap}
                      </p>
                    </div>
                  )}

                  {/* Teacher Discussion Prompt */}
                  {currentQ.teacherDiscussionPrompt && (
                    <div className="p-3 sm:p-4 bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px]">
                        <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>سؤال استقصائي للنقاش:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {currentQ.teacherDiscussionPrompt}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Bottom Card Desktop Navigation Buttons (Mobile uses sticky bottom bar) */}
            <div className="hidden md:flex items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-800">
              <button
                onClick={() => handleNavigate(Math.max(0, safeIndex - 1))}
                disabled={safeIndex === 0}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700/60"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                onClick={() => setIsGridModalOpen(true)}
                className="text-xs text-slate-400 hover:text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>
                  {safeIndex + 1} / {totalFiltered}
                </span>
              </button>

              <button
                onClick={() => handleNavigate(Math.min(totalFiltered - 1, safeIndex + 1))}
                disabled={safeIndex >= totalFiltered - 1}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-purple-600/30"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 sm:p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl">
          <p>لا توجد أسئلة تطابق معايير البحث الحالية.</p>
        </div>
      )}

      {/* Exam Mode Submit Action */}
      {viewMode === "exam" && !isExamSubmitted && (
        <div className="p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xl">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-white">جاهز لإنهاء الاختبار ومعرفة درجتك؟</h4>
            <p className="text-[11px] sm:text-xs text-slate-400">
              أجبت عن {stats.answered} من إجمالي {allQuestions.length} سؤالاً ({stats.completionRate}%).
            </p>
          </div>
          <button
            onClick={handleSubmitExam}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95"
          >
            اعتماد الإجابات ورؤية التقييم النهائي 🏆
          </button>
        </div>
      )}

      {/* 7. Mobile Navigation is now integrated directly at the top of the question card so button position never jumps */}

      {/* 8. Interactive 50-Question Quick Jump Sheet Modal */}
      {isGridModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setIsGridModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-purple-500/40 rounded-t-3xl sm:rounded-3xl max-h-[85vh] sm:max-h-[80vh] w-full max-w-xl flex flex-col overflow-hidden shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    خريطة الـ 50 سؤالاً التحليلية
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    انقر على أي سؤال للانتقال إليه فوراً
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGridModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="إغلاق الخريطة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-around gap-2 text-[10px] sm:text-[11px] font-bold">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-md bg-purple-600 ring-2 ring-purple-400 inline-block" />
                <span>السؤال الحالي</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-md bg-emerald-600/40 border border-emerald-500 inline-block" />
                <span>صحيح</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-3 rounded-md bg-rose-600/40 border border-rose-500 inline-block" />
                <span>خاطئ</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-md bg-slate-800 inline-block" />
                <span>لم يُجب بعد</span>
              </div>
            </div>

            {/* 50 Questions Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[55vh] custom-scrollbar">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {filteredQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCorrect = isAnswered && userAnswers[q.id] === q.correctAnswer;
                  const isCurrent = idx === safeIndex;

                  let cellClass = "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60";
                  if (isCurrent) {
                    cellClass =
                      "bg-purple-600 text-white ring-2 ring-purple-400 shadow-lg shadow-purple-600/50 font-black scale-105";
                  } else if (isAnswered) {
                    if (viewMode === "study" || isExamSubmitted) {
                      cellClass = isCorrect
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold"
                        : "bg-rose-600/30 text-rose-300 border border-rose-500/50 font-bold";
                    } else {
                      cellClass = "bg-indigo-600 text-white font-bold";
                    }
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        handleNavigate(idx);
                        setIsGridModalOpen(false);
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer ${cellClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">
                تم حل {stats.answered} من {totalFiltered}
              </span>
              <button
                onClick={() => setIsGridModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-colors"
              >
                إغلاق والعودة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
