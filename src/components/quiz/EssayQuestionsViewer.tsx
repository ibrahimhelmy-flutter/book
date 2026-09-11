"use client";

import React, { useState, useEffect, useMemo } from "react";
import { QuestionItem } from "@/types";
import {
  CheckCircle2,
  Sparkles,
  Award,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  RotateCcw,
  PenTool
} from "lucide-react";
import { MobileQuizNavigation } from "./MobileQuizNavigation";

interface Props {
  lessonId: string;
  questions: QuestionItem[];
}

export function EssayQuestionsViewer({ lessonId, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});

  // Filter only essay questions
  const essayQuestions = useMemo(
    () => questions.filter((q) => q.type === "essay"),
    [questions]
  );

  // Load saved answers and scores from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedAnswers: Record<string, string> = {};
      const savedScores: Record<string, number> = {};
      essayQuestions.forEach((q) => {
        const ans = localStorage.getItem(`essay_ans_${lessonId}_${q.id}`);
        if (ans) savedAnswers[q.id] = ans;
        const score = localStorage.getItem(`essay_score_${lessonId}_${q.id}`);
        if (score) savedScores[q.id] = parseInt(score, 10);
      });
      setStudentAnswers(savedAnswers);
      setSelfScores(savedScores);
    } catch {
      // Ignore storage errors
    }
  }, [lessonId, essayQuestions]);

  const handleAnswerChange = (qId: string, value: string) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: value }));
    try {
      localStorage.setItem(`essay_ans_${lessonId}_${qId}`, value);
    } catch {}
  };

  const handleToggleReveal = (qId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSelfScore = (qId: string, score: number) => {
    setSelfScores((prev) => ({ ...prev, [qId]: score }));
    try {
      localStorage.setItem(`essay_score_${lessonId}_${qId}`, score.toString());
    } catch {}
  };

  const handleResetCurrent = (qId: string) => {
    setStudentAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setRevealedAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setSelfScores((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    try {
      localStorage.removeItem(`essay_ans_${lessonId}_${qId}`);
      localStorage.removeItem(`essay_score_${lessonId}_${qId}`);
    } catch {}
  };

  if (!essayQuestions || essayQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        <p className="text-sm">لا توجد أسئلة مقالية مسجلة لهذا الدرس حالياً.</p>
      </div>
    );
  }

  const currentQ = essayQuestions[currentIndex] || essayQuestions[0];
  const userText = studentAnswers[currentQ.id] || "";
  const isRevealed = !!revealedAnswers[currentQ.id];
  const currentScore = selfScores[currentQ.id];
  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3 sm:space-y-6 animate-fadeIn quiz-content-padding md:pb-6" dir="rtl">
      {/* Header Banner (Desktop / Tablet) */}
      <div className="hidden md:flex p-6 bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-3xl shadow-xl text-white flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <PenTool className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                أسئلة مقالية محتاجة كتابة ✍️
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {essayQuestions.length} أسئلة تحليلية
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              التدريب على الصياغة والتحليل ومعايير الدرجات الوزارية (Rubric)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              صيغة امتحانية رسمية (6 درجات لكل سؤال) تتطلب صياغة إجابة منظمة ومقارنتها بنموذج التصحيح.
            </p>
          </div>
        </div>

        {/* Quick Question Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {essayQuestions.map((q, idx) => {
            const hasAns = !!studentAnswers[q.id]?.trim();
            const isSelected = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span>السؤال المقالي {idx + 1}</span>
                {hasAns && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Compact Toolbar (< md) */}
      <div className="md:hidden bg-slate-950/90 border border-amber-500/30 rounded-2xl p-2 px-3 mb-2 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {essayQuestions.map((q, idx) => {
            const hasAns = !!studentAnswers[q.id]?.trim();
            const isSelected = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-current={isSelected ? "page" : undefined}
                className={`min-h-[38px] flex-1 px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-sm font-black"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                <span>سؤال {idx + 1}</span>
                {hasAns && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleResetCurrent(currentQ.id)}
          className="min-h-[38px] min-w-[38px] p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          title="مسح الإجابة"
          aria-label="مسح إجابة هذا السؤال"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Active Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 space-y-6 shadow-2xl relative">
        {/* Top Question Navigation Bar (Specially for mobile so button position never jumps with question size) */}
        <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-slate-950/90 border border-slate-800 rounded-xl sm:rounded-2xl sticky top-2 z-20 backdrop-blur-md shadow-lg">
          {/* Previous Question Button */}
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="min-h-[42px] min-w-[76px] sm:min-w-[90px] px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700/60 active:scale-95 cursor-pointer shadow-sm"
            aria-label="السؤال السابق"
          >
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span>السابق</span>
          </button>

          {/* Center: Current Index (e.g. 1 / 6) */}
          <div className="min-h-[42px] px-3.5 sm:px-5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-inner">
            <span className="font-mono tracking-wider font-black">
              {currentIndex + 1} / {essayQuestions.length}
            </span>
          </div>

          {/* Next Question Button */}
          <button
            type="button"
            disabled={currentIndex >= essayQuestions.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(essayQuestions.length - 1, prev + 1))}
            className="min-h-[42px] min-w-[76px] sm:min-w-[90px] px-3 sm:px-5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-25 disabled:pointer-events-none text-white text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/30 active:scale-95 cursor-pointer"
            aria-label="السؤال التالي"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
              السؤال {currentIndex + 1} من {essayQuestions.length}
            </span>
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              درجة السؤال: {currentQ.marks || 6} درجات
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold">
              نمط امتحان الثانوية العامة الرسمي 📝
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleResetCurrent(currentQ.id)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-800"
            title="إعادة تعيين إجابة هذا السؤال"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح الإجابة</span>
          </button>
        </div>

        {/* Question Prompt */}
        <div className="p-5 sm:p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <FileCheck className="w-4 h-4" />
            <span>نص السؤال المطلوب إجابته:</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.questionText}
          </p>
        </div>

        {/* Student Writing Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span>اكتب إجابتك التحليلية الكاملة هنا:</span>
            </label>
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span>{wordCount} كلمة</span>
              <span>•</span>
              <span className={userText.trim().length > 10 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {userText.trim().length > 10 ? "تم الحفظ تلقائياً ✓" : "في انتظار الكتابة..."}
              </span>
            </div>
          </div>

          <textarea
            rows={7}
            value={userText}
            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
            placeholder="اكتب إجابتك المنظمة هنا، مستنداً إلى المفاهيم العلمية ومحاور السؤال المطلوبة..."
            className="w-full p-4 sm:p-5 bg-slate-950 border border-slate-700 rounded-2xl text-base text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-y leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">
            💡 نصيحة: اكتب إجابتك بنفسك أولاً، ثم اضغط على زر كشف النموذج أدناه لتقييم إجابتك ومقارنتها بمعايير التصحيح الرسمية.
          </p>
        </div>

        {/* Action Button: Reveal Model Answer & Rubric */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleToggleReveal(currentQ.id)}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              isRevealed
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/25 hover:scale-105 active:scale-95"
            }`}
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>إخفاء نموذج الإجابة والروبريك</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>عرض نموذج الإجابة ومعايير توزيع الدرجات (Rubric) 👁️</span>
              </>
            )}
          </button>

          {/* Navigation between Essay Questions (Desktop / Tablet) */}
          <div className="hidden md:flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <button
              type="button"
              disabled={currentIndex >= essayQuestions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(essayQuestions.length - 1, prev + 1))}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Revealed Section: Rubric Criteria + Model Answer + Self Rating */}
        {isRevealed && (
          <div className="space-y-6 pt-6 border-t border-slate-800 animate-fadeIn">
            {/* 1. Rubric Criteria Cards */}
            {currentQ.rubricCriteria && currentQ.rubricCriteria.length > 0 && (
              <div className="p-5 sm:p-6 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <Award className="w-4 h-4" />
                  <span>معايير توزيع درجات المصحح الوزاري الرسمي (Rubric):</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {currentQ.rubricCriteria.map((criterion, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] border border-amber-500/30 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-medium">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Official Model Answer */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4" />
                <span>نموذج الإجابة المعتمد الكامل:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                {String(currentQ.correctAnswer)}
              </p>
            </div>

            {/* 3. Self-Assessment Grading Widget */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  قيّم إجابتك بنفسك مقارنة بالنموذج الرسمي:
                </span>
                <span className="text-[11px] text-slate-400">
                  حدد الدرجة التي تستحقها من 6 بناءً على استيفاء معايير الـ Rubric:
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[6, 5, 4, 3, 2, 1].map((pts) => {
                  const isMarked = currentScore === pts;
                  return (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => handleSelfScore(currentQ.id, pts)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        isMarked
                          ? pts >= 5
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                            : pts >= 3
                            ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
                            : "bg-red-600 text-white border-red-500 shadow-md"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                      }`}
                    >
                      {pts} / 6
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation is now integrated directly at top so button position never jumps */}
    </div>
  );
}
