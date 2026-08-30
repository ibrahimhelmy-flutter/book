"use client";

import React, { useState, useMemo } from "react";
import { QuestionItem } from "@/types";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ListFilter,
  Lightbulb,
  BookOpen,
  Send,
  Eye,
  Check,
  X
} from "lucide-react";
import { saveQuizScore } from "@/lib/storage";
import { fireConfetti } from "@/lib/confetti";

interface Props {
  lessonId: string;
  questions: QuestionItem[];
}

// Smart Arabic text normalizer for fill-in-the-blank grading
function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    // Remove Tashkeel (diacritics)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize Alef
    .replace(/[أإآ]/g, "ا")
    // Normalize Taa Marbuta / Haa
    .replace(/ة/g, "ه")
    // Normalize Yaa / Alef Maksura
    .replace(/ى/g, "ي")
    // Remove tatweel
    .replace(/ـ/g, "")
    // Remove punctuation & extra whitespace
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟"']/g, "")
    .replace(/\s+/g, " ");
}

export function QuizEngine({ lessonId, questions }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [filterReviewOnlyMistakes, setFilterReviewOnlyMistakes] = useState<boolean>(false);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Filtered questions based on selected category
  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    if (activeCategory === "ALL") return questions;
    return questions.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  if (!questions || questions.length === 0) return null;

  const totalQuestions = filteredQuestions.length;
  // Ensure currentIndex stays within bounds if category filter changes
  const safeIndex = Math.min(currentIndex, Math.max(0, totalQuestions - 1));
  const currentQ = filteredQuestions[safeIndex] || questions[0];

  const handleSelectOption = (questionId: string, value: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleToggleHint = (qId: string) => {
    setShowHint((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleToggleRevealAnswer = (qId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const checkIsCorrect = (q: QuestionItem): boolean => {
    const ans = userAnswers[q.id];
    if (!ans) return false;

    if (q.type === "mcq" || q.type === "true_false") {
      return ans === String(q.correctAnswer);
    } else if (q.type === "fill_blank") {
      const userNorm = normalizeArabicText(ans);
      if (Array.isArray(q.correctAnswer)) {
        return q.correctAnswer.some((cand) => normalizeArabicText(cand) === userNorm);
      }
      const correctNorm = normalizeArabicText(String(q.correctAnswer));
      return userNorm === correctNorm || userNorm.includes(correctNorm) || correctNorm.includes(userNorm);
    } else if (q.type === "essay") {
      return ans.trim().length > 10;
    }
    return false;
  };

  const handleFinishQuiz = () => {
    let correctCount = 0;
    filteredQuestions.forEach((q) => {
      if (checkIsCorrect(q)) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);
    saveQuizScore(lessonId, correctCount, totalQuestions);

    if (correctCount === totalQuestions || correctCount >= totalQuestions * 0.7) {
      fireConfetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setShowHint({});
    setRevealedAnswers({});
    setCurrentIndex(0);
    setScore(0);
    setFilterReviewOnlyMistakes(false);
  };

  // Category counts for quick tabs
  const categoryCounts = useMemo(() => {
    return {
      ALL: questions.length,
      check_understanding: questions.filter((q) => q.category === "check_understanding").length,
      practice: questions.filter((q) => q.category === "practice").length,
      exam_style: questions.filter((q) => q.category === "exam_style").length,
    };
  }, [questions]);

  return (
    <div className="w-full max-w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl my-8 box-border min-w-0">
      {/* Header Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-inner shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                بنك الأسئلة الشامل والتدريبات التفاعلية
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                {questions.length} سؤالاً
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              أسئلة الفهم، الاختيار من متعدد، الصواب والخطأ، ونماذج امتحانات الثانوية العامة مع التصحيح الفوري
            </p>
          </div>
        </div>

        {!submitted ? (
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Instant Feedback Mode Toggle */}
            <button
              type="button"
              onClick={() => setInstantFeedback(!instantFeedback)}
              title="تفعيل أو تعطيل كشف الإجابة والتصحيح مباشرة بعد الاختيار"
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                instantFeedback
                  ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/40"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>التصحيح بعد الاختيار: {instantFeedback ? "مفعل ⚡" : "مغلق"}</span>
            </button>

            <span className="text-xs font-mono px-3.5 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold">
              السؤال {safeIndex + 1} من {totalQuestions}
            </span>
          </div>
        ) : (
          <button
            onClick={resetQuiz}
            className="text-xs font-bold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-slate-700 hover:border-slate-600 shadow-md"
          >
            <RotateCcw className="w-4 h-4 text-indigo-400" /> إعادة الاختبار
          </button>
        )}
      </div>

      {/* Category Tabs / Filters */}
      {!submitted && (
        <div className="w-full flex flex-wrap gap-2 mb-6 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => {
              setActiveCategory("ALL");
              setCurrentIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            جميع الأسئلة ({categoryCounts.ALL})
          </button>

          {categoryCounts.check_understanding > 0 && (
            <button
              onClick={() => {
                setActiveCategory("check_understanding");
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === "check_understanding"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              اختبر فهمك والمفاهيم ({categoryCounts.check_understanding})
            </button>
          )}

          {categoryCounts.practice > 0 && (
            <button
              onClick={() => {
                setActiveCategory("practice");
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === "practice"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              تدرب وطبق ({categoryCounts.practice})
            </button>
          )}

          {categoryCounts.exam_style > 0 && (
            <button
              onClick={() => {
                setActiveCategory("exam_style");
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === "exam_style"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              نمط الامتحان الوزاري ({categoryCounts.exam_style})
            </button>
          )}
        </div>
      )}

      {/* Interactive Question Jump Strip */}
      {!submitted && totalQuestions > 1 && (
        <div className="w-full mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">خريطة التنقل السريع بين الأسئلة:</span>
            <span>
              تمت الإجابة على{" "}
              <strong className="text-emerald-400">
                {filteredQuestions.filter((q) => !!userAnswers[q.id]).length}
              </strong>{" "}
              من {totalQuestions}
            </span>
          </div>
          <div className="w-full flex flex-wrap gap-1.5">
            {filteredQuestions.map((q, idx) => {
              const isCurrent = idx === safeIndex;
              const hasAnswered = !!userAnswers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md shadow-indigo-600/30 scale-105"
                      : hasAnswered
                      ? "bg-emerald-950/70 border border-emerald-500/50 text-emerald-300"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  }`}
                  title={`السؤال ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!submitted ? (
        <div className="w-full">
          {/* Question Category, Type Badge, and Actions */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-lg font-mono border ${
                  currentQ.category === "exam_style"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : currentQ.category === "check_understanding"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {currentQ.category === "exam_style"
                  ? "سؤال على نمط الامتحان الرسمي [6 درجات]"
                  : currentQ.category === "check_understanding"
                  ? "اختبر فهمك للمفاهيم"
                  : "تدريب وتطبيق عملي"}
              </span>

              <span className="text-[11px] font-mono px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                {currentQ.type === "mcq"
                  ? "اختيار من متعدد"
                  : currentQ.type === "true_false"
                  ? "صواب أم خطأ"
                  : currentQ.type === "fill_blank"
                  ? "إكمال الفراغ بالمصطلح"
                  : "سؤال تحليلي / مقالي"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Show / Hide Answer Button */}
              <button
                type="button"
                onClick={() => handleToggleRevealAnswer(currentQ.id)}
                className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer border ${
                  revealedAnswers[currentQ.id]
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                    : "text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>{revealedAnswers[currentQ.id] ? "إخفاء الإجابة" : "إظهار الإجابة والشرح 👁️"}</span>
              </button>

              {currentQ.explanation && (
                <button
                  type="button"
                  onClick={() => handleToggleHint(currentQ.id)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg transition-all cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint[currentQ.id] ? "إخفاء التلميح" : "تلميح"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Hint callout if toggled */}
          {showHint[currentQ.id] && currentQ.explanation && (
            <div className="w-full p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl mb-5 text-xs text-amber-200 leading-relaxed animate-fadeIn box-border">
              <strong className="block mb-1 text-amber-300 font-bold">💡 تلميح للمساعدة في الحل:</strong>
              {currentQ.explanation}
            </div>
          )}

          {/* Question Text with Fixed Minimum Height & Strict Full Width */}
          <div className="w-full min-w-full bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/90 mb-6 min-h-[90px] flex items-center box-border">
            <p className="w-full text-base sm:text-lg font-bold text-slate-100 leading-relaxed break-words">
              {currentQ.questionText}
            </p>
          </div>

          {/* Question Answer Inputs by Type */}
          {(() => {
            const isUserAnswered = !!userAnswers[currentQ.id];
            const isRevealed = !!revealedAnswers[currentQ.id];
            const shouldShowFeedback = (instantFeedback && isUserAnswered) || isRevealed;
            const isCurrentCorrect = checkIsCorrect(currentQ);

            return (
              <div className="w-full space-y-6">
                {/* 1. MCQ */}
                {currentQ.type === "mcq" && currentQ.options && (
                  <div className="w-full space-y-3">
                    {currentQ.options.map((opt) => {
                      const isSelected = userAnswers[currentQ.id] === opt.id;
                      const isCorrectOpt = opt.id === String(currentQ.correctAnswer);

                      let btnStyle = "bg-slate-950/50 hover:bg-slate-800/70 border-slate-800 text-slate-300";
                      let badgeStyle = "bg-slate-800 text-slate-400 border border-slate-700";

                      if (shouldShowFeedback) {
                        if (isCorrectOpt) {
                          btnStyle = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold shadow-lg shadow-emerald-950/60";
                          badgeStyle = "bg-emerald-600 text-white font-bold";
                        } else if (isSelected && !isCorrectOpt) {
                          btnStyle = "bg-red-950/90 border-red-500 text-red-100 ring-2 ring-red-500/50 font-bold shadow-lg shadow-red-950/60";
                          badgeStyle = "bg-red-600 text-white font-bold";
                        } else {
                          btnStyle = "bg-slate-950/30 opacity-60 border-slate-900 text-slate-500";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-950/80 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/40 font-semibold shadow-lg shadow-indigo-950/50";
                        badgeStyle = "bg-indigo-600 text-white shadow-sm";
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`w-full min-w-full p-4 rounded-2xl border text-right text-sm leading-relaxed transition-all cursor-pointer flex items-start gap-3.5 box-border ${btnStyle}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono shrink-0 ${badgeStyle}`}
                          >
                            {shouldShowFeedback && isCorrectOpt ? (
                              <Check className="w-4 h-4" />
                            ) : shouldShowFeedback && isSelected && !isCorrectOpt ? (
                              <X className="w-4 h-4" />
                            ) : (
                              opt.id.toUpperCase()
                            )}
                          </span>
                          <span className="pt-0.5 break-words flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. True / False */}
                {currentQ.type === "true_false" && (
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      const userAns = userAnswers[currentQ.id];
                      const correctAns = String(currentQ.correctAnswer).toLowerCase();
                      const isTrueCorrect = correctAns === "true" || correctAns === "t" || correctAns === "a";

                      let trueBtnClass = "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";
                      let falseBtnClass = "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";

                      if (shouldShowFeedback) {
                        if (isTrueCorrect) {
                          trueBtnClass = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold";
                          falseBtnClass = userAns === "false"
                            ? "bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 font-bold"
                            : "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                        } else {
                          falseBtnClass = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold";
                          trueBtnClass = userAns === "true"
                            ? "bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 font-bold"
                            : "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                        }
                      } else {
                        if (userAns === "true") {
                          trueBtnClass = "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30 shadow-lg";
                        } else if (userAns === "false") {
                          falseBtnClass = "bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/30 shadow-lg";
                        }
                      }

                      return (
                        <>
                          <button
                            onClick={() => handleSelectOption(currentQ.id, "true")}
                            className={`w-full p-4 rounded-2xl border text-center text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-3 box-border ${trueBtnClass}`}
                          >
                            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>صواب (○ عبارة صحيحة)</span>
                          </button>

                          <button
                            onClick={() => handleSelectOption(currentQ.id, "false")}
                            className={`w-full p-4 rounded-2xl border text-center text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-3 box-border ${falseBtnClass}`}
                          >
                            <X className="w-5 h-5 text-red-400 shrink-0" />
                            <span>خطأ (× عبارة خاطئة)</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* 3. Fill in the Blank */}
                {currentQ.type === "fill_blank" && (
                  <div className="w-full space-y-2">
                    <label className="text-xs text-slate-400 block font-semibold">
                      اكتب المصطلح أو العبارة الدقيقة في الفراغ:
                    </label>
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={userAnswers[currentQ.id] || ""}
                        onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                        placeholder="أدخل المصطلح العلمي هنا..."
                        className="w-full min-w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 box-border"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      💡 نظام التصحيح يدعم الاختلافات الإملائية الشائعة (الهمزات والتاء المربوطة) تلقائياً.
                    </p>
                  </div>
                )}

                {/* 4. Essay / Analytical Questions */}
                {currentQ.type === "essay" && (
                  <div className="w-full space-y-3">
                    <label className="text-xs text-slate-300 block font-bold">
                      اكتب إجابتك التحليلية الكاملة وفق محاور السؤال:
                    </label>
                    <textarea
                      rows={5}
                      value={userAnswers[currentQ.id] || ""}
                      onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                      placeholder="صغ إجابتك المنطقية بالاستناد للمفاهيم والمعايير العلمية الواردة بالدرس..."
                      className="w-full min-w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-y leading-relaxed box-border"
                    />
                  </div>
                )}

                {/* Instant Feedback & Model Answer Card */}
                {shouldShowFeedback && (
                  <div
                    className={`w-full p-5 sm:p-6 rounded-2xl border space-y-3 animate-fadeIn box-border ${
                      isCurrentCorrect
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-lg shadow-emerald-950/30"
                        : isUserAnswered
                        ? "bg-red-950/20 border-red-500/40 text-slate-200 shadow-lg shadow-red-950/30"
                        : "bg-slate-950/90 border-indigo-500/40 text-slate-200 shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        {isCurrentCorrect ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>إجابة صحيحة وممتازة! أحسنت 🎯</span>
                          </div>
                        ) : isUserAnswered ? (
                          <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs sm:text-sm">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span>إجابة غير صحيحة — راجع الحل المعتمد أدناه:</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs sm:text-sm">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <span>الإجابة النموذجية المعتمدة والتفسير العلمي:</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {isRevealed ? "كشف الإجابة" : "تصحيح فوري"}
                      </span>
                    </div>

                    {/* Model Answer Line */}
                    <div className="text-xs sm:text-sm space-y-1 pt-1">
                      <div className="flex items-start gap-2">
                        <strong className="text-emerald-400 shrink-0 font-bold">الإجابة النموذجية:</strong>
                        <span className="font-semibold text-emerald-200 leading-relaxed">
                          {Array.isArray(currentQ.correctAnswer)
                            ? currentQ.correctAnswer.join(" / ")
                            : typeof currentQ.correctAnswer === "object"
                            ? JSON.stringify(currentQ.correctAnswer)
                            : String(currentQ.correctAnswer)}
                        </span>
                      </div>
                    </div>

                    {/* Scientific Explanation */}
                    {currentQ.explanation && (
                      <div className="text-xs text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                        <strong className="text-indigo-300 block mb-1 font-bold">
                          📖 الشرح والتفسير العلمي:
                        </strong>
                        {currentQ.explanation}
                      </div>
                    )}

                    {/* Rubric Criteria if essay */}
                    {currentQ.rubricCriteria && (
                      <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1.5 text-amber-200">
                        <strong className="block text-amber-300 font-bold mb-1">
                          📋 معايير توزيع درجات المصحح الرسمي (Rubric):
                        </strong>
                        {currentQ.rubricCriteria.map((c, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation Controls */}
          <div className="w-full flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-slate-800">
            <button
              disabled={safeIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-slate-200"
            >
              <ChevronRight className="w-4 h-4" /> السؤال السابق
            </button>

            {safeIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-white shadow-lg shadow-indigo-600/25"
              >
                السؤال التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black rounded-xl shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2 text-white scale-105"
              >
                <Sparkles className="w-4 h-4" /> تسليم الإجابات وعرض النتيجة
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results & Answer Review View */
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="p-8 bg-gradient-to-br from-slate-950 to-indigo-950/40 rounded-3xl border border-slate-800 text-center shadow-xl">
            <div className="inline-flex p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/30">
              <Award className="w-12 h-12" />
            </div>
            <h4 className="text-2xl font-black text-white mb-1">تقرير أداء الاختبار</h4>
            <div className="flex items-center justify-center gap-2 my-3">
              <span className="text-4xl sm:text-5xl font-black text-indigo-400 font-mono">
                {score}
              </span>
              <span className="text-xl text-slate-500 font-mono">/ {totalQuestions}</span>
            </div>
            <div className="w-48 mx-auto bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((score / totalQuestions) * 100)}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {score === totalQuestions
                ? "ممتاز وعلامة كاملة! استيعاب شامل ومتقن لجميع معايير ومفاهيم الدرس 🎯"
                : score >= totalQuestions * 0.7
                ? "جيد جداً! راجع الإجابات النموذجية والشروحات بالأسفل لتثبيت المفاهيم."
                : "تحتاج إلى مراجعة أقسام الدرس وإعادة المحاولة لتحقيق التميز والإتقان."}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setFilterReviewOnlyMistakes(!filterReviewOnlyMistakes)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                  filterReviewOnlyMistakes
                    ? "bg-red-600 text-white border-red-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {filterReviewOnlyMistakes ? "عرض جميع الأسئلة" : "عرض الأخطاء فقط"}
              </button>
            </div>
          </div>

          {/* Detailed Question by Question Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h5 className="font-bold text-sm sm:text-base text-slate-200">
                مراجعة الإجابات النموذجية والتفسيرات العلمية:
              </h5>
              <span className="text-xs text-slate-400">
                {filterReviewOnlyMistakes ? "الأخطاء فقط" : `جميع الأسئلة (${filteredQuestions.length})`}
              </span>
            </div>

            {filteredQuestions
              .filter((q) => (filterReviewOnlyMistakes ? !checkIsCorrect(q) : true))
              .map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = checkIsCorrect(q);

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border space-y-3 transition-all ${
                      isCorrect
                        ? "bg-slate-950/70 border-emerald-500/30"
                        : "bg-slate-950/70 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            س{idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {q.category === "exam_style"
                              ? "امتحان رسمي"
                              : q.category === "check_understanding"
                              ? "فهم ومفاهيم"
                              : "تطبيق عملي"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>

                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>صحيحة</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 text-xs font-bold shrink-0 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                          <XCircle className="w-4 h-4" />
                          <span>خاطئة</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs space-y-2 pt-2 border-t border-slate-900">
                      <div className="flex items-start gap-2 text-slate-400">
                        <strong className="text-slate-300 shrink-0">إجابتك:</strong>
                        <span className={isCorrect ? "text-emerald-300 font-medium" : "text-red-300 font-medium"}>
                          {userAns || "لم تتم الإجابة"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-emerald-400">
                        <strong className="text-emerald-300 shrink-0">الإجابة النموذجية:</strong>
                        <span className="font-medium text-emerald-200">
                          {Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.join(" / ")
                            : typeof q.correctAnswer === "object"
                            ? JSON.stringify(q.correctAnswer)
                            : String(q.correctAnswer)}
                        </span>
                      </div>

                      {q.explanation && (
                        <div className="text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 mt-2 leading-relaxed text-xs">
                          <strong className="text-indigo-300 block mb-1 font-bold">
                            📖 الشرح والتفسير العلمي:
                          </strong>
                          {q.explanation}
                        </div>
                      )}

                      {q.rubricCriteria && (
                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1 text-amber-200">
                          <strong className="block text-amber-300 font-bold mb-1">
                            سلم الدرجات المعتمد:
                          </strong>
                          {q.rubricCriteria.map((c, i) => (
                            <div key={i}>• {c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

