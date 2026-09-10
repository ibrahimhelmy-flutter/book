"use client";

import React, { useState, useMemo } from "react";
import { Lesson } from "@/types";
import {
  get50DeepQuestionsForLesson,
  DeepChallengingQuestion,
  CognitiveLevel,
} from "@/data/deep-questions";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Eye,
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
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

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
    <div className="space-y-6" dir="rtl">
      {/* 1. Header Banner & Mode Switcher */}
      <div className="p-6 bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-slate-900 border border-purple-500/30 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                بنك أسئلة الفهم والتحليل المعمق 🧠
              </span>
              <span className="text-xs text-slate-400">
                {allQuestions.length} سؤالاً تحليلياً
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              قياس الفهم، التمييز بين المفاهيم، وحل التريكات الامتحانية
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              مصممة لتمييز الفهم الحقيقي عن الحفظ المباشر، وتغطية جميع مفاهيم الدرس بنسبة 100%.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setViewMode("study")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "study"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>مذاكرة وتحليل فوري</span>
            </button>
            <button
              onClick={() => setViewMode("exam")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "exam"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>اختبار تقييمي</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="إعادة تعيين التقدم"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Progress & Cognitive Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">إجمالي الأسئلة</span>
            <span className="text-lg font-black text-white">{allQuestions.length}</span>
          </div>
          <FileQuestion className="w-6 h-6 text-indigo-400" />
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">تمت الإجابة عنها</span>
            <span className="text-lg font-black text-white">{stats.answered} / {stats.total}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-purple-400" />
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">الإجابات الصحيحة</span>
            <span className="text-lg font-black text-emerald-400">{stats.correct}</span>
          </div>
          <Award className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">نسبة الإتقان</span>
            <span className="text-lg font-black text-amber-400">
              {stats.answered > 0 ? `${stats.percent}%` : "0%"}
            </span>
          </div>
          <GraduationCap className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* 3. Cognitive Level Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>تصفية حسب المستوى الإدراكي ومجال الفهم:</span>
          </span>

          {/* Search Box */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="ابحث في نصوص الأسئلة..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCognitiveLevel("ALL");
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCognitiveLevel === "ALL"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCognitiveLevel === item.level
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

      {/* 4. Question Numbers Jump Strip */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {filteredQuestions.map((q, idx) => {
          const isAnswered = userAnswers[q.id] !== undefined;
          const isCorrect = isAnswered && userAnswers[q.id] === q.correctAnswer;
          const isCurrent = idx === safeIndex;

          let btnClass = "bg-slate-800 text-slate-400 hover:bg-slate-700";
          if (isCurrent) {
            btnClass = "bg-purple-600 text-white ring-2 ring-purple-400 shadow-md font-black scale-110";
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
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${btnClass}`}
              title={`سؤال ${idx + 1}: ${q.title}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* 5. Main Active Question Card */}
      {currentQ ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                سؤال {safeIndex + 1} من {totalFiltered}
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                {currentQ.cognitiveLevel}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                {currentQ.difficulty === "very-hard" ? "صعب جداً 🔥" : "متوسط إلى صعب ⚡"}
              </span>
              {currentQ.type && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold">
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
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>مرجع الكتاب المدرسي: صفحة {currentQ.source.pages.join(" - ")}</span>
              </span>
            )}
          </div>

          {/* Question Stem */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide">
              {currentQ.title}
            </h4>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
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
                      "bg-emerald-950/50 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40 font-bold";
                  } else if (isSelected && !isCorrectAnswer) {
                    optionStyle =
                      "bg-rose-950/50 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 font-bold";
                  }
                }
              }

              const letters = ["أ", "ب", "ج", "د"];

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-right transition-all flex items-start gap-3.5 cursor-pointer text-xs sm:text-sm leading-relaxed ${optionStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {letters[optIdx] || optIdx + 1}
                  </span>

                  <span className="flex-1 mt-0.5">{optText}</span>

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
          {((viewMode === "study" && (showExplanation[currentQ.id] || userAnswers[currentQ.id] !== undefined)) ||
            (viewMode === "exam" && isExamSubmitted)) && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
              {/* Scientific Depth Explanation */}
              <div className="p-4 sm:p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>💡 التحليل والعمق العلمي المعتمد:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentQ.depthExplanation}
                </p>
              </div>

              {/* Misconception Trap */}
              {currentQ.misconceptionTrap && (
                <div className="p-4 sm:p-5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>⚠️ الفخ المفاهيمي والتريكة الامتحانية:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentQ.misconceptionTrap}
                  </p>
                </div>
              )}

              {/* Teacher Discussion Prompt */}
              {currentQ.teacherDiscussionPrompt && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    <span>سؤال استقصائي للنقاش:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {currentQ.teacherDiscussionPrompt}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Card Navigation */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <span className="text-xs text-slate-400 font-bold">
              {safeIndex + 1} / {totalFiltered}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalFiltered - 1, prev + 1))}
              disabled={safeIndex >= totalFiltered - 1}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-purple-600/30"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
          <p>لا توجد أسئلة تطابق معايير البحث الحالية.</p>
        </div>
      )}

      {/* Exam Mode Submit Action */}
      {viewMode === "exam" && !isExamSubmitted && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-white">جاهز لإنهاء الاختبار ومعرفة درجتك؟</h4>
            <p className="text-xs text-slate-400">
              أجبت عن {stats.answered} من إجمالي {allQuestions.length} سؤالاً.
            </p>
          </div>
          <button
            onClick={handleSubmitExam}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95"
          >
            اعتماد الإجابات ورؤية التقييم النهائي 🏆
          </button>
        </div>
      )}
    </div>
  );
}
