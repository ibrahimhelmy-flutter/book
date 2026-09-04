"use client";

import React, { useState } from "react";
import { GeneratedExamModel, CommitteeQuestion } from "@/lib/exam-generator/types";
import {
  Printer,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  FileCheck2,
  FileText,
  Eye,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { BlueprintModal } from "./BlueprintModal";

interface ExamModelViewerProps {
  models: GeneratedExamModel[];
  onStartInteractiveExam: (model: GeneratedExamModel) => void;
}

export function ExamModelViewer({ models, onStartInteractiveExam }: ExamModelViewerProps) {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"student" | "teacher" | "answer_key">("student");
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [expandedRubrics, setExpandedRubrics] = useState<Record<string, boolean>>({});

  const activeModel = models[selectedModelIndex] || models[0];

  const handlePrint = () => {
    window.print();
  };

  const toggleRubric = (qId: string) => {
    setExpandedRubrics((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (!activeModel) {
    return null;
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Blueprint Modal */}
      <BlueprintModal
        blueprint={activeModel.blueprint}
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />

      {/* Model Selector & Control Header (Hidden when printing) */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 text-white shadow-xl space-y-4 print:hidden box-border">
        {/* Top bar: Models Switcher & Main Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Models Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">النماذج الامتحانية:</span>
            {models.map((m, idx) => (
              <button
                key={m.modelId}
                onClick={() => setSelectedModelIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  selectedModelIndex === idx
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>النموذج ({m.modelLetter})</span>
                <span className="text-[10px] font-mono opacity-80">[{m.allQuestions.length} س]</span>
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onStartInteractiveExam(activeModel)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>خوض الامتحان تفاعلياً (Start Online)</span>
            </button>

            <button
              onClick={() => setIsBlueprintOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>جدول المواصفات</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة ورقة الامتحان (Print)</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("student")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "student"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ورقة امتحان الطالب (Student Exam)</span>
            </button>

            <button
              onClick={() => setViewMode("teacher")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "teacher"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>وضع المعلم ولجنة الامتحانات (Teacher Mode)</span>
            </button>

            <button
              onClick={() => setViewMode("answer_key")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "answer_key"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>نموذج الإجابة الرسمي (Answer Key)</span>
            </button>
          </div>

          {/* Model Meta Badges */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeModel.durationMinutes} دقيقة</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeModel.totalMarks} درجة</span>
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {activeModel.modelCode}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* OFFICIAL EXAM PAPER CONTAINER (Ready for Screen & Print) */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-8 box-border print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Official Ministry Exam Header */}
        <div className="w-full border-b-2 border-indigo-500/60 pb-6 space-y-4 print:border-black">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 print:text-gray-700">
                جمهورية مصر العربية • وزارة التربية والتعليم والتعليم الفني
              </div>
              <div className="text-xs font-bold text-indigo-400 print:text-gray-900">
                الإدارة المركزية لتطوير المناهج • لجنة واضعي الامتحانات الوطنية
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-black pt-1">
                {activeModel.title}
              </h2>
              <div className="text-xs text-slate-300 print:text-gray-600">
                {activeModel.subject} — {activeModel.academicYear}
              </div>
            </div>

            {/* Exam Box: Duration & Marks */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-right shrink-0 print:border-black print:bg-gray-50">
              <div className="text-xs font-mono text-slate-400 print:text-gray-700">
                كود النموذج: <strong className="text-white print:text-black">{activeModel.modelCode}</strong>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-gray-700">
                الزمن المحدد: <strong className="text-amber-400 print:text-black">{activeModel.durationMinutes} دقيقة</strong>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-gray-700">
                الدرجة الكلية: <strong className="text-emerald-400 print:text-black">{activeModel.totalMarks} درجة</strong>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-gray-700">
                عدد الأسئلة: <strong className="text-indigo-400 print:text-black">{activeModel.allQuestions.length} سؤالاً</strong>
              </div>
            </div>
          </div>

          {/* Student Info Box (For Print / Student Booklet) */}
          <div className="w-full p-4 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700 print:border-black print:bg-transparent grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 print:text-gray-700">اسم الطالب: </span>
              <span className="border-b border-dotted border-slate-600 inline-block w-40 print:border-black">&nbsp;</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-700">رقم الجلوس: </span>
              <span className="border-b border-dotted border-slate-600 inline-block w-28 print:border-black">&nbsp;</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-700">اللجنة / المدرسة: </span>
              <span className="border-b border-dotted border-slate-600 inline-block w-36 print:border-black">&nbsp;</span>
            </div>
          </div>

          {/* Instructions Alert */}
          <div className="text-[11px] sm:text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 leading-relaxed print:text-gray-600 print:bg-gray-100 print:border-gray-300">
            <strong>تعليمات هامة للممتحن:</strong> اقرأ الأسئلة بعناية قبل البدء في الإجابة. تأكد من إجابة جميع الأقسام. الإجابة في المساحات المخصصة بالقلم الجاف. الأسئلة المقالية تتطلب إجابات علمية مستندة إلى مفاهيم الكتاب المدرسي.
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXAM CONTENT BY SECTIONS (A..E)                          */}
        {/* ======================================================== */}
        {viewMode !== "answer_key" ? (
          <div className="space-y-10">
            {activeModel.sections.map((section, sIdx) => (
              <div key={section.id} className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 print:bg-gray-100 print:border-black print:text-black">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-black text-indigo-300 print:text-black">
                      {section.title}
                    </h3>
                    <p className="text-xs text-slate-400 print:text-gray-600">{section.subtitle}</p>
                  </div>
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 print:border-black print:text-black">
                    [{section.marks} درجات]
                  </span>
                </div>

                {/* Section Questions */}
                <div className="space-y-6">
                  {section.questions.map((q, qLocalIdx) => {
                    // Calculate sequential global question number
                    const globalNumber =
                      activeModel.allQuestions.findIndex((item) => item.id === q.id) + 1;

                    return (
                      <div
                        key={q.id}
                        className="w-full bg-slate-950/60 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 box-border print:bg-white print:border-gray-300 print:text-black print:break-inside-avoid"
                      >
                        {/* Question Title & Meta Header */}
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/60 pb-3 print:border-gray-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 print:bg-black">
                              {globalNumber}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-300 print:text-gray-800">
                              الدرس {q.lessonNumber}: {q.lessonTitle}
                            </span>

                            {/* Badges in Teacher Mode */}
                            {viewMode === "teacher" && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    q.cognitiveLevel === "recall"
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : q.cognitiveLevel === "understanding"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : q.cognitiveLevel === "application"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : q.cognitiveLevel === "analysis"
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {q.cognitiveLevel === "recall"
                                    ? "مستوى 1: تذكر"
                                    : q.cognitiveLevel === "understanding"
                                    ? "مستوى 2: فهم"
                                    : q.cognitiveLevel === "application"
                                    ? "مستوى 3: تطبيق"
                                    : q.cognitiveLevel === "analysis"
                                    ? "مستوى 4: تحليل"
                                    : "مستوى 5: تفكير عليا"}
                                </span>

                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  {q.difficulty === "easy"
                                    ? "سهل"
                                    : q.difficulty === "medium"
                                    ? "متوسط"
                                    : q.difficulty === "hard"
                                    ? "صعب"
                                    : "فائقين"}
                                </span>

                                {q.isCrossLesson && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                                    ربط تكاملي 🔗
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <span className="text-xs font-mono font-bold text-amber-400 print:text-black">
                            [{q.marks} {q.marks === 1 ? "درجة" : "درجات"}]
                          </span>
                        </div>

                        {/* Question Text */}
                        <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed print:text-black">
                          {q.question}
                        </p>

                        {/* Question Options / Details by Type */}
                        {/* 1. MCQ */}
                        {q.questionType === "mcq" && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5 print:bg-white print:border-gray-300 print:text-black"
                              >
                                <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[11px] font-mono shrink-0 mt-0.5 print:border-black">
                                  {opt.id.toUpperCase()}
                                </span>
                                <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. True / False */}
                        {q.questionType === "true_false" && (
                          <div className="flex items-center gap-4 text-xs pt-1">
                            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-400 print:bg-transparent">
                              ( &nbsp;&nbsp;&nbsp;&nbsp; ) صواب
                            </span>
                            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 print:border-gray-400 print:bg-transparent">
                              ( &nbsp;&nbsp;&nbsp;&nbsp; ) خطأ
                            </span>
                          </div>
                        )}

                        {/* 3. Matching */}
                        {q.questionType === "matching" && q.matchingPairs && (
                          <div className="w-full space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-indigo-300 print:text-black block mb-1">
                                  العمود (أ):
                                </span>
                                {q.matchingPairs.map((pair, pIdx) => (
                                  <div
                                    key={pair.id}
                                    className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 print:bg-white print:border-gray-300 print:text-black"
                                  >
                                    {pair.left}
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-emerald-300 print:text-black block mb-1">
                                  العمود (ب):
                                </span>
                                {q.matchingPairs.map((pair) => (
                                  <div
                                    key={pair.id}
                                    className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 print:bg-white print:border-gray-300 print:text-black"
                                  >
                                    {pair.right}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Student Writing Lines for Written / Essay Questions */}
                        {viewMode === "student" &&
                          (q.questionType === "essay" ||
                            q.questionType === "give_reason" ||
                            q.questionType === "explain" ||
                            q.questionType === "compare" ||
                            q.questionType === "what_if" ||
                            q.questionType === "order" ||
                            q.questionType === "classify" ||
                            q.questionType === "odd_one_out" ||
                            q.questionType === "term" ||
                            q.questionType === "complete" ||
                            q.questionType === "cross_lesson") && (
                            <div className="w-full pt-2 space-y-3">
                              <div className="w-full border-b border-dotted border-slate-700 min-h-[28px] print:border-gray-400" />
                              <div className="w-full border-b border-dotted border-slate-700 min-h-[28px] print:border-gray-400" />
                              {(q.questionType === "essay" ||
                                q.questionType === "compare" ||
                                q.questionType === "cross_lesson") && (
                                <>
                                  <div className="w-full border-b border-dotted border-slate-700 min-h-[28px] print:border-gray-400" />
                                  <div className="w-full border-b border-dotted border-slate-700 min-h-[28px] print:border-gray-400" />
                                </>
                              )}
                            </div>
                          )}

                        {/* ======================================================== */}
                        {/* TEACHER MODE: OFFICIAL MODEL ANSWER & TEXTBOOK REFERENCE */}
                        {/* ======================================================== */}
                        {viewMode === "teacher" && (
                          <div className="w-full p-4 sm:p-5 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-3 mt-4 print:bg-gray-50 print:border-gray-400 box-border">
                            {/* Model Answer */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-emerald-400 print:text-green-800 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>الإجابة النموذجية المعتمدة:</span>
                              </div>
                              <p className="text-xs sm:text-sm font-semibold text-emerald-100 print:text-black leading-relaxed whitespace-pre-line">
                                {q.modelAnswer}
                              </p>
                            </div>

                            {/* Exact Textbook Wording */}
                            {q.textbookExactAnswer && (
                              <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-500/30 text-xs space-y-1 print:bg-white print:border-gray-300">
                                <div className="text-indigo-300 print:text-blue-900 font-bold flex items-center gap-1.5">
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>نص الكتاب المدرسي الحرفي (Textbook Answer):</span>
                                </div>
                                <blockquote className="italic text-slate-300 print:text-gray-800 pl-2 border-r-2 border-indigo-400 pr-2">
                                  «{q.textbookExactAnswer}»
                                </blockquote>
                              </div>
                            )}

                            {/* Source Reference */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 print:text-gray-600 pt-1 border-t border-slate-800/80 print:border-gray-300">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                <strong>مرجع الكتاب:</strong> {q.sourceReference}
                              </span>

                              {q.rubricCriteria && (
                                <button
                                  type="button"
                                  onClick={() => toggleRubric(q.id)}
                                  className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1 font-bold print:hidden"
                                >
                                  <span>سلم الدرجات ({q.rubricCriteria.length} معايير)</span>
                                  {expandedRubrics[q.id] ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Rubric Criteria for Grading */}
                            {q.rubricCriteria && (expandedRubrics[q.id] || viewMode === "teacher") && (
                              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 text-xs space-y-1 text-amber-200 print:bg-yellow-50 print:text-black print:border-yellow-300">
                                <strong className="block text-amber-300 print:text-yellow-900 font-bold mb-1">
                                  📋 سلم توزيع درجات المصحح الرسمي (Rubric):
                                </strong>
                                {q.rubricCriteria.map((crit, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-1.5">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{crit}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ======================================================== */
          /* OFFICIAL SEPARATE MODEL ANSWER SHEET                     */
          /* ======================================================== */
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 text-center space-y-1 print:bg-gray-100 print:border-black">
              <h3 className="text-base sm:text-lg font-black text-emerald-300 print:text-black">
                ورقة الإجابة النموذجية الرسمية — {activeModel.title}
              </h3>
              <p className="text-xs text-slate-300 print:text-gray-700">
                مخصصة للسادة المصححين ولجنة الامتحانات مع معايير توزيع الدرجات التفصيلية
              </p>
            </div>

            <div className="space-y-4">
              {activeModel.allQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 print:bg-white print:border-gray-300 print:text-black print:break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-gray-200">
                    <span className="text-xs font-bold font-mono">
                      السؤال #{idx + 1} ({q.lessonTitle})
                    </span>
                    <span className="text-xs font-bold text-amber-400 print:text-black">
                      [{q.marks} {q.marks === 1 ? "درجة" : "درجات"}]
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-300 print:text-gray-800">
                    {q.question}
                  </p>

                  <div className="text-xs text-emerald-200 print:text-black space-y-1 pt-1">
                    <strong className="text-emerald-400 print:text-green-800 block">
                      الحل النموذجي المعتمد:
                    </strong>
                    <p className="whitespace-pre-line leading-relaxed">{q.modelAnswer}</p>
                  </div>

                  {q.textbookExactAnswer && (
                    <div className="text-[11px] text-slate-400 print:text-gray-600 bg-slate-900 p-2 rounded-lg border border-slate-800 print:bg-gray-50">
                      <strong>نص الكتاب:</strong> «{q.textbookExactAnswer}»
                    </div>
                  )}

                  {q.rubricCriteria && (
                    <div className="text-[11px] text-amber-300 print:text-black space-y-0.5 pt-1">
                      <strong>توزيع الدرجات:</strong>
                      {q.rubricCriteria.map((c, i) => (
                        <div key={i}>• {c}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
