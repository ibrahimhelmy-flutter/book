"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GeneratedExamModel, CommitteeQuestion } from "@/lib/exam-generator/types";
import {
  Clock,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  FileCheck2,
  Bookmark,
  BookOpen,
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

interface ExamInteractiveRunnerProps {
  model: GeneratedExamModel;
  onExit: () => void;
}

// Arabic Text Normalizer for grading text questions
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟"']/g, "")
    .replace(/\s+/g, " ");
}

export function ExamInteractiveRunner({ model, onExit }: ExamInteractiveRunnerProps) {
  const questions = model.allQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(model.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewMistakesOnly, setReviewMistakesOnly] = useState(false);

  // Scroll to top when question changes or screen mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [currentIndex, isSubmitted]);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (!isSubmitted && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted, isPaused, timeLeft]);

  // Format timer as MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectAnswer = (qId: string, val: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const isQuestionCorrect = (q: CommitteeQuestion): boolean => {
    const ans = userAnswers[q.id];
    if (!ans) return false;

    if (q.questionType === "mcq") {
      // Check if user answer matches option ID or option text
      return (
        ans.toLowerCase() === q.modelAnswer.toLowerCase() ||
        q.options?.some((opt) => opt.id.toLowerCase() === ans.toLowerCase() && opt.id.toLowerCase() === q.modelAnswer.toLowerCase()) ||
        false
      );
    }

    if (q.questionType === "true_false") {
      const normUser = ans.trim().toLowerCase();
      const normCorrect = q.modelAnswer.trim().toLowerCase();
      const isTrueExpected = normCorrect === "true" || normCorrect === "صواب" || normCorrect.includes("صحيحة");
      const isFalseExpected = normCorrect === "false" || normCorrect === "خطأ" || normCorrect.includes("خاطئة");

      if (isTrueExpected && (normUser === "true" || normUser === "صواب")) return true;
      if (isFalseExpected && (normUser === "false" || normUser === "خطأ")) return true;
      return false;
    }

    if (q.questionType === "term" || q.questionType === "complete") {
      const userNorm = normalizeArabic(ans);
      const correctNorm = normalizeArabic(q.modelAnswer);
      return (
        userNorm === correctNorm ||
        userNorm.includes(correctNorm) ||
        correctNorm.includes(userNorm) ||
        (q.keywords && q.keywords.some((kw) => userNorm.includes(normalizeArabic(kw))))
      );
    }

    // For essay, short answer, explain, compare
    return ans.trim().length >= 15;
  };

  const scoreStats = useMemo(() => {
    let earnedMarks = 0;
    let totalMarks = 0;
    let correctCount = 0;

    questions.forEach((q) => {
      totalMarks += q.marks;
      if (isQuestionCorrect(q)) {
        earnedMarks += q.marks;
        correctCount++;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    return {
      earnedMarks,
      totalMarks,
      correctCount,
      totalCount: questions.length,
      percentage,
    };
  }, [questions, userAnswers]);

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    if (scoreStats.percentage >= 70) {
      fireConfetti({ particleCount: 130, spread: 95, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {!isSubmitted ? (
        /* ======================================================== */
        /* ACTIVE EXAM RUNNER VIEW                                  */
        /* ======================================================== */
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 text-white shadow-2xl space-y-6 box-border min-w-0">
          {/* Header Bar: Progress, Timer, and Controls */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  جلسة الامتحان الرسمية: {model.title}
                </h3>
                <p className="text-xs text-slate-400">
                  السؤال {currentIndex + 1} من {questions.length} • تم إجابة {Object.keys(userAnswers).length}
                </p>
              </div>
            </div>

            {/* Actions: Timer & Submit */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Instant Feedback Toggle */}
              <button
                type="button"
                onClick={() => setInstantFeedback(!instantFeedback)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  instantFeedback
                    ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>التصحيح الفوري: {instantFeedback ? "مفعل ⚡" : "معطل"}</span>
              </button>

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
                  timeLeft < 300
                    ? "bg-red-950/80 border-red-500 text-red-300 animate-pulse"
                    : "bg-slate-950 border-slate-700 text-amber-300"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formattedTime}</span>
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? "استئناف المؤقت" : "إيقاف مؤقت"}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  if (confirm("هل أنت متأكد من رغبتك في تسليم وإنهاء الامتحان الآن؟")) {
                    handleSubmitExam();
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                إنهاء وتسليم 🏁
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((Object.keys(userAnswers).length / questions.length) * 100)}%`,
              }}
            />
          </div>

          {/* 1..N Question Navigation Strip */}
          <div className="w-full flex flex-wrap gap-1.5 pb-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = !!userAnswers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md scale-105"
                      : isAnswered
                      ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Card */}
          <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  سؤال {currentIndex + 1} من {questions.length}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  الدرس {currentQ.lessonNumber}: {currentQ.lessonTitle}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRevealedAnswers((prev) => ({
                      ...prev,
                      [currentQ.id]: !prev[currentQ.id],
                    }))
                  }
                  className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer border ${
                    revealedAnswers[currentQ.id]
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : "text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {revealedAnswers[currentQ.id] ? "إخفاء الحل" : "كشف الإجابة النموذجية 👁️"}
                  </span>
                </button>

                <span className="text-xs font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 rounded border border-amber-500/30 font-mono">
                  [{currentQ.marks} {currentQ.marks === 1 ? "درجة" : "درجات"}]
                </span>
              </div>
            </div>

            {/* Question Text Box */}
            <div className="w-full bg-slate-950/90 p-5 sm:p-6 rounded-2xl border border-slate-800 min-h-[90px] flex items-center box-border">
              <p className="w-full text-base sm:text-lg font-bold text-slate-100 leading-relaxed break-words">
                {currentQ.question}
              </p>
            </div>

            {/* Inputs by Question Type */}
            {(() => {
              const isAnswered = !!userAnswers[currentQ.id];
              const isRevealed = !!revealedAnswers[currentQ.id];
              const shouldShowFeedback = (instantFeedback && isAnswered) || isRevealed;
              const isCorrect = isQuestionCorrect(currentQ);

              return (
                <div className="w-full space-y-4">
                  {/* 1. MCQ */}
                  {currentQ.questionType === "mcq" && currentQ.options && (
                    <div className="w-full space-y-3">
                      {currentQ.options.map((opt) => {
                        const isSelected = userAnswers[currentQ.id] === opt.id;
                        const isCorrectOpt =
                          opt.id.toLowerCase() === currentQ.modelAnswer.toLowerCase();

                        let btnStyle =
                          "bg-slate-950/50 hover:bg-slate-800/70 border-slate-800 text-slate-300";
                        let badgeStyle = "bg-slate-800 text-slate-400 border border-slate-700";

                        if (shouldShowFeedback) {
                          if (isCorrectOpt) {
                            btnStyle =
                              "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold shadow-lg";
                            badgeStyle = "bg-emerald-600 text-white font-bold";
                          } else if (isSelected && !isCorrectOpt) {
                            btnStyle =
                              "bg-red-950/90 border-red-500 text-red-100 ring-2 ring-red-500/50 font-bold shadow-lg";
                            badgeStyle = "bg-red-600 text-white font-bold";
                          } else {
                            btnStyle = "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                          }
                        } else if (isSelected) {
                          btnStyle =
                            "bg-indigo-950/80 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/40 font-semibold shadow-lg";
                          badgeStyle = "bg-indigo-600 text-white shadow-sm";
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
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
                  {currentQ.questionType === "true_false" && (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(() => {
                        const userAns = userAnswers[currentQ.id];
                        const normCorrect = currentQ.modelAnswer.trim().toLowerCase();
                        const isTrueCorrect =
                          normCorrect === "true" ||
                          normCorrect === "صواب" ||
                          normCorrect.includes("صحيحة");

                        let trueBtnClass =
                          "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";
                        let falseBtnClass =
                          "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";

                        if (shouldShowFeedback) {
                          if (isTrueCorrect) {
                            trueBtnClass =
                              "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold";
                            falseBtnClass =
                              userAns === "false"
                                ? "bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 font-bold"
                                : "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                          } else {
                            falseBtnClass =
                              "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold";
                            trueBtnClass =
                              userAns === "true"
                                ? "bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 font-bold"
                                : "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                          }
                        } else {
                          if (userAns === "true") {
                            trueBtnClass =
                              "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30 shadow-lg";
                          } else if (userAns === "false") {
                            falseBtnClass =
                              "bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/30 shadow-lg";
                          }
                        }

                        return (
                          <>
                            <button
                              onClick={() => handleSelectAnswer(currentQ.id, "true")}
                              className={`w-full p-4 rounded-2xl border text-center text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-3 box-border ${trueBtnClass}`}
                            >
                              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                              <span>صواب (○ عبارة صحيحة)</span>
                            </button>

                            <button
                              onClick={() => handleSelectAnswer(currentQ.id, "false")}
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

                  {/* 3. Text inputs for Term or Complete */}
                  {(currentQ.questionType === "term" || currentQ.questionType === "complete") && (
                    <div className="w-full space-y-2">
                      <label className="text-xs text-slate-400 block font-semibold">
                        اكتب المصطلح أو العبارة الدقيقة:
                      </label>
                      <input
                        type="text"
                        value={userAnswers[currentQ.id] || ""}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="اكتب الإجابة العلمية هنا..."
                        className="w-full min-w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 box-border"
                      />
                    </div>
                  )}

                  {/* 4. Textarea for Essay, Reasoning, Explanation, Compare, What-if */}
                  {(currentQ.questionType === "essay" ||
                    currentQ.questionType === "give_reason" ||
                    currentQ.questionType === "explain" ||
                    currentQ.questionType === "compare" ||
                    currentQ.questionType === "what_if" ||
                    currentQ.questionType === "order" ||
                    currentQ.questionType === "classify" ||
                    currentQ.questionType === "odd_one_out" ||
                    currentQ.questionType === "short_answer" ||
                    currentQ.questionType === "cross_lesson") && (
                    <div className="w-full space-y-2">
                      <label className="text-xs text-slate-300 block font-bold">
                        اكتب إجابتك التحليلية الكاملة:
                      </label>
                      <textarea
                        rows={5}
                        value={userAnswers[currentQ.id] || ""}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="صغ إجابتك بالاستناد لمفاهيم الكتاب المدرسي الرسمية..."
                        className="w-full min-w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-amber-500 resize-y leading-relaxed box-border"
                      />
                    </div>
                  )}

                  {/* Immediate Feedback Card if triggered */}
                  {shouldShowFeedback && (
                    <div
                      className={`w-full p-5 sm:p-6 rounded-2xl border space-y-3 animate-fadeIn box-border ${
                        isCorrect
                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-lg"
                          : isAnswered
                          ? "bg-red-950/20 border-red-500/40 text-slate-200 shadow-lg"
                          : "bg-slate-950/90 border-indigo-500/40 text-slate-200 shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span>إجابة صحيحة! أحسنت 🎯</span>
                            </div>
                          ) : isAnswered ? (
                            <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs sm:text-sm">
                              <XCircle className="w-5 h-5 text-red-400" />
                              <span>إجابة غير دقيقة — الإجابة المعتمدة أدناه:</span>
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

                      <div className="text-xs sm:text-sm space-y-1 pt-1">
                        <div className="flex items-start gap-2">
                          <strong className="text-emerald-400 shrink-0 font-bold">
                            الإجابة النموذجية:
                          </strong>
                          <span className="font-semibold text-emerald-200 leading-relaxed whitespace-pre-line">
                            {currentQ.modelAnswer}
                          </span>
                        </div>
                      </div>

                      {currentQ.textbookExactAnswer && (
                        <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                          <strong className="text-indigo-300 block mb-1 font-bold">
                            📖 نص الكتاب المدرسي:
                          </strong>
                          «{currentQ.textbookExactAnswer}»
                        </div>
                      )}

                      {currentQ.rubricCriteria && (
                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1 text-amber-200">
                          <strong className="block text-amber-300 font-bold mb-1">
                            📋 معايير توزيع درجات المصحح (Rubric):
                          </strong>
                          {currentQ.rubricCriteria.map((c, i) => (
                            <div key={i}>• {c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Navigation Buttons */}
            <div className="w-full flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-slate-800">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-slate-200"
              >
                <ChevronRight className="w-4 h-4" /> السؤال السابق
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-white shadow-lg shadow-indigo-600/25"
                >
                  السؤال التالي <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black rounded-xl shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2 text-white scale-105"
                >
                  <Sparkles className="w-4 h-4" /> إنهاء وتسليم الامتحان الرسمي 🏁
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* EXAM SCORE REPORT & DETAILED BOOKLET REVIEW              */
        /* ======================================================== */
        <div className="w-full space-y-6 animate-fadeIn">
          {/* Summary Score Card */}
          <div className="w-full p-8 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 rounded-3xl border border-slate-800 text-center shadow-2xl space-y-4 box-border">
            <div className="inline-flex p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Award className="w-12 h-12" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              نتيجة امتحان {model.title}
            </h3>

            <div className="flex items-center justify-center gap-3 my-2">
              <span className="text-5xl font-black text-indigo-400 font-mono">
                {scoreStats.percentage}%
              </span>
              <span className="text-lg text-slate-400 font-mono">
                ({scoreStats.earnedMarks} من {scoreStats.totalMarks} درجة)
              </span>
            </div>

            <div className="w-64 mx-auto bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${scoreStats.percentage}%` }}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {scoreStats.percentage >= 85
                ? "ممتاز ومرتبة شرف! أداء استثنائي يعكس استيعاباً فائقاً لكافة مخرجات المنهج 🏆"
                : scoreStats.percentage >= 65
                ? "جيد جداً! راجع الأسئلة ونموذج الإجابة الرسمي بالأسفل لتعزيز النقاط الدقيقة."
                : "تحتاج إلى مزيد من المراجعة والتدريب على بنك الأسئلة لإتقان المعايير."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setReviewMistakesOnly(!reviewMistakesOnly)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  reviewMistakesOnly
                    ? "bg-red-600 text-white border-red-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {reviewMistakesOnly ? "عرض جميع الأسئلة" : "عرض الأسئلة غير المكتملة فقط"}
              </button>

              <button
                onClick={() => {
                  setUserAnswers({});
                  setTimeLeft(model.durationMinutes * 60);
                  setIsSubmitted(false);
                  setCurrentIndex(0);
                }}
                className="text-xs font-bold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
              >
                <RotateCcw className="w-4 h-4" /> إعادة محاولة الامتحان
              </button>

              <button
                onClick={onExit}
                className="text-xs font-bold px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
              >
                العودة للوحة الامتحان
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-base text-slate-200">
                مراجعة ورقة الإجابة ونموذج الوزارة الرسمي:
              </h4>
              <span className="text-xs text-slate-400">
                {reviewMistakesOnly
                  ? "الأسئلة غير الصحيحة فقط"
                  : `جميع الأسئلة (${questions.length})`}
              </span>
            </div>

            {questions
              .filter((q) => (reviewMistakesOnly ? !isQuestionCorrect(q) : true))
              .map((q, idx) => {
                const isCorrect = isQuestionCorrect(q);
                const userAns = userAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className={`w-full p-5 sm:p-6 rounded-2xl border space-y-3 box-border ${
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
                          <span className="text-xs text-slate-400 font-mono">
                            {q.lessonTitle}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                          {q.question}
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
                          <span>تحتاج لمراجعة</span>
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
                        <strong className="text-emerald-300 shrink-0">
                          الإجابة النموذجية المعتمدة:
                        </strong>
                        <span className="font-medium text-emerald-200 whitespace-pre-line">
                          {q.modelAnswer}
                        </span>
                      </div>

                      {q.textbookExactAnswer && (
                        <div className="text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-2 leading-relaxed text-xs">
                          <strong className="text-indigo-300 block mb-1 font-bold">
                            📖 النص الحرفي من كتاب الوزارة:
                          </strong>
                          «{q.textbookExactAnswer}»
                        </div>
                      )}

                      {q.sourceReference && (
                        <div className="text-[11px] text-slate-400 pt-1">
                          <strong>مرجع الكتاب:</strong> {q.sourceReference}
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
