"use client";

import React, { useState, useMemo } from "react";
import { getAllCommitteeQuestions } from "@/lib/exam-generator/committeeBank";
import { CommitteeQuestion, CommitteeQuestionType, CognitiveLevel } from "@/lib/exam-generator/types";
import { CURRICULUM_DATA } from "@/data/curriculum";
import {
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  Award,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function QuestionBankExplorer() {
  const allQuestions = useMemo(() => getAllCommitteeQuestions(), []);

  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("ALL");
  const [selectedLesson, setSelectedLesson] = useState("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCognitive, setSelectedCognitive] = useState<string>("ALL");
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Filter lessons based on selected chapter
  const availableLessons = useMemo(() => {
    if (selectedChapter === "ALL") {
      return CURRICULUM_DATA.flatMap((ch) => ch.lessons);
    }
    const ch = CURRICULUM_DATA.find((c) => c.id === selectedChapter);
    return ch ? ch.lessons : [];
  }, [selectedChapter]);

  // Filtered question set
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Search
      const searchNorm = search.trim().toLowerCase();
      const matchesSearch =
        !searchNorm ||
        q.question.toLowerCase().includes(searchNorm) ||
        q.lessonTitle.toLowerCase().includes(searchNorm) ||
        q.topic.toLowerCase().includes(searchNorm) ||
        q.modelAnswer.toLowerCase().includes(searchNorm) ||
        (q.keywords && q.keywords.some((k) => k.toLowerCase().includes(searchNorm)));

      // Chapter
      const matchesChapter = selectedChapter === "ALL" || q.chapterId === selectedChapter;

      // Lesson
      const matchesLesson = selectedLesson === "ALL" || q.lessonId === selectedLesson;

      // Type
      const matchesType = selectedType === "ALL" || q.questionType === selectedType;

      // Cognitive Level
      const matchesCognitive = selectedCognitive === "ALL" || q.cognitiveLevel === selectedCognitive;

      return matchesSearch && matchesChapter && matchesLesson && matchesType && matchesCognitive;
    });
  }, [allQuestions, search, selectedChapter, selectedLesson, selectedType, selectedCognitive]);

  const toggleReveal = (qId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedChapter("ALL");
    setSelectedLesson("ALL");
    setSelectedType("ALL");
    setSelectedCognitive("ALL");
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl space-y-4 box-border">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالكلمات المفتاحية أو المفاهيم العلمية في بنك الأسئلة..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 box-border"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Chapter Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">الفصل الدراسي:</label>
            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                setSelectedLesson("ALL");
              }}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value="ALL">جميع الفصول (4 فصول)</option>
              <option value="chapter-1">الفصل 1: تكنولوجيا المعلومات والمجتمع</option>
              <option value="chapter-2">الفصل 2: الأمن السيبراني</option>
              <option value="chapter-3">الفصل 3: تطبيقات الويب</option>
              <option value="chapter-4">الفصل 4: تصميم الويب والوسائط</option>
            </select>
          </div>

          {/* Lesson Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">الدرس المحدد:</label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value="ALL">جميع الدروس ({availableLessons.length})</option>
              {availableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  الدرس {l.number}: {l.title}
                </option>
              ))}
            </select>
          </div>

          {/* Question Type Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">نوع السؤال:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value="ALL">جميع أنواع الأسئلة</option>
              <option value="mcq">اختيار من متعدد (MCQ)</option>
              <option value="true_false">صواب أم خطأ</option>
              <option value="term">المصطلح العلمي والمفاهيم</option>
              <option value="give_reason">علل واذكر السبب العلمي</option>
              <option value="explain">اشرح ووضح</option>
              <option value="compare">مقارنة في جدول</option>
              <option value="order">رتب الخطوات والأحداث</option>
              <option value="classify">صنف العناصر</option>
              <option value="odd_one_out">اختر الكلمة الشاذة</option>
              <option value="complete">إكمال الفراغات</option>
              <option value="matching">المطابقة والتوصيل</option>
              <option value="essay">أسئلة مقالية وزارية [6 درجات]</option>
              <option value="cross_lesson">ربط تكاملي بين الدروس</option>
            </select>
          </div>

          {/* Cognitive Level Filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">المستوى المعرفي:</label>
            <select
              value={selectedCognitive}
              onChange={(e) => setSelectedCognitive(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value="ALL">جميع المستويات المعرفية</option>
              <option value="recall">مستوى 1: التذكر والاسترجاع</option>
              <option value="understanding">مستوى 2: الفهم والاستيعاب</option>
              <option value="application">مستوى 3: التطبيق والمواقف</option>
              <option value="analysis">مستوى 4: التحليل والمقارنة</option>
              <option value="higher_order">مستوى 5: التفكير العليا والربط</option>
            </select>
          </div>
        </div>

        {/* Filter Stats Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>
            الأسئلة المطابقة: <strong className="text-emerald-400">{filteredQuestions.length}</strong> من أصل{" "}
            {allQuestions.length} سؤالاً
          </span>
          <button
            onClick={resetFilters}
            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="w-full space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isRevealed = !!revealedAnswers[q.id];

          return (
            <div
              key={q.id}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-3 box-border"
            >
              {/* Question Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                    سؤال #{idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    الفصل {q.chapterNumber} • الدرس {q.lessonNumber} ({q.lessonTitle})
                  </span>

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
                      ? "تذكر"
                      : q.cognitiveLevel === "understanding"
                      ? "فهم"
                      : q.cognitiveLevel === "application"
                      ? "تطبيق"
                      : q.cognitiveLevel === "analysis"
                      ? "تحليل"
                      : "تفكير عليا"}
                  </span>

                  {q.isCrossLesson && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                      ربط تكاملي 🔗
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 rounded border border-amber-500/30">
                    [{q.marks} {q.marks === 1 ? "درجة" : "درجات"}]
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                {q.question}
              </p>

              {/* MCQ Options Display if applicable */}
              {q.questionType === "mcq" && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300"
                    >
                      <strong className="font-mono text-indigo-400 ml-1.5">
                        {opt.id.toUpperCase()}:
                      </strong>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle Reveal Answer Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => toggleReveal(q.id)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isRevealed
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRevealed ? "إخفاء الإجابة النموذجية" : "عرض الإجابة النموذجية ونصوص الكتاب 🔍"}</span>
                </button>

                <span className="text-[11px] font-mono text-slate-400">
                  {q.sourceReference}
                </span>
              </div>

              {/* Expanded Answer Card */}
              {isRevealed && (
                <div className="p-4 sm:p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-xs space-y-3 text-emerald-100 animate-fadeIn">
                  <div>
                    <strong className="text-emerald-400 block mb-1 font-bold">
                      الإجابة النموذجية المعتمدة:
                    </strong>
                    <p className="whitespace-pre-line leading-relaxed text-slate-200">
                      {q.modelAnswer}
                    </p>
                  </div>

                  {q.textbookExactAnswer && (
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-500/30 space-y-1">
                      <strong className="text-indigo-300 block font-bold">
                        📖 النص الحرفي من كتاب الوزارة:
                      </strong>
                      <blockquote className="italic text-slate-300 border-r-2 border-indigo-400 pr-2">
                        «{q.textbookExactAnswer}»
                      </blockquote>
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-slate-300 bg-slate-900/70 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      <strong className="text-amber-300 block mb-0.5 font-bold">
                        الشرح والتفسير العلمي:
                      </strong>
                      {q.explanation}
                    </div>
                  )}

                  {q.rubricCriteria && (
                    <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-500/30 text-amber-200 space-y-1">
                      <strong className="text-amber-300 block font-bold mb-0.5">
                        سلم تصحيح الدرجات (Rubric):
                      </strong>
                      {q.rubricCriteria.map((c, i) => (
                        <div key={i}>• {c}</div>
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
  );
}
