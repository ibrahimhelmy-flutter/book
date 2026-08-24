"use client";

import React, { useState } from "react";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { Award, CheckCircle2, ChevronDown, ChevronUp, Edit3, HelpCircle, Sparkles, BookOpen } from "lucide-react";

export default function ExamsPage() {
  const [activeChapter, setActiveChapter] = useState<string>("ALL");
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Extract all essay questions of category exam_style from curriculum
  const examQuestions = CURRICULUM_DATA.flatMap((ch) =>
    ch.lessons.flatMap((l) =>
      l.questions
        .filter((q) => q.category === "exam_style")
        .map((q) => ({
          ...q,
          chapterId: ch.id,
          chapterTitle: ch.title,
          lessonNumber: l.number,
          lessonTitle: l.title,
        }))
    )
  );

  const filteredQuestions =
    activeChapter === "ALL"
      ? examQuestions
      : examQuestions.filter((q) => q.chapterId === activeChapter);

  const toggleReveal = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTextChange = (id: string, text: string) => {
    setStudentAnswers((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
          <Award className="w-4 h-4" />
          <span>مركز التدريب على امتحانات الثانوية العامة المصرية</span>
        </div>
        <h1 className="text-3xl font-black mb-2">بنك الأسئلة المقالية والتحليلية [6 درجات]</h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          جميع أسئلة نمط الامتحان الوزاري المعتمدة لتقييم الفهم العميق والتحليل الهندسي مع نماذج الإجابة الرسمية ومعايير توزيع الدرجات (Rubric).
        </p>
      </div>

      {/* Chapter Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveChapter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeChapter === "ALL"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          جميع الفصول ({examQuestions.length} سؤال)
        </button>
        {CURRICULUM_DATA.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChapter(ch.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChapter === ch.id
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            الفصل {ch.number}: {ch.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Exam Questions Cards */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => {
          const isRevealed = !!revealedAnswers[q.id];
          const hasDrafted = (studentAnswers[q.id]?.trim().length || 0) > 10;

          return (
            <div
              key={q.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4"
            >
              {/* Question Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/30">
                    سؤال الامتحان {idx + 1}
                  </span>
                  <span className="text-slate-400">الدرس {q.lessonNumber}: {q.lessonTitle}</span>
                </div>
                <span className="text-xs font-bold text-red-400 px-2.5 py-0.5 bg-red-950/60 rounded-md border border-red-500/30">
                  {q.marks || 6} درجات
                </span>
              </div>

              {/* Question Text */}
              <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                {q.questionText}
              </p>

              {/* Student Drafting Textarea */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>مسودة إجابة الطالب (اكتب حلك هنا قبل الاطلاع على نموذج الوزارة):</span>
                </label>
                <textarea
                  rows={4}
                  value={studentAnswers[q.id] || ""}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder="صغ إجابتك المنطقية بالاستناد لمفاهيم ومعايير الدرس..."
                  className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Rubric Criteria */}
              {q.rubricCriteria && (
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <span className="font-bold text-amber-400 block mb-1">
                    سلم توزيع درجات المصحح (Grading Rubric):
                  </span>
                  {q.rubricCriteria.map((crit, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Model Answer Toggle Button */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => toggleReveal(q.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isRevealed
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isRevealed ? "إخفاء الإجابة النموذجية" : "عرض الإجابة النموذجية المعتمدة 🔍"}</span>
                </button>

                {hasDrafted && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> تمت كتابة مسودة الإجابة
                  </span>
                )}
              </div>

              {/* Model Answer Box */}
              {isRevealed && (
                <div className="p-5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-xs sm:text-sm leading-relaxed text-emerald-100 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>الإجابة النموذجية الرسمية:</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {String(q.correctAnswer)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
