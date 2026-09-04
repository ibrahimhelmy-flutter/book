"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getExamEngineContainer } from "@/core/infrastructure/bootstrap";
import { Book } from "@/core/domain/entities/Book";
import { Exam } from "@/core/domain/entities/Exam";
import { EngineBookSelector } from "@/components/exam-engine/BookSelector";
import { QuestionBankDashboard } from "@/components/exam-engine/QuestionBankDashboard";
import { ImportBookModal } from "@/components/exam-engine/ImportBookModal";
import { ExamGeneratorStudio } from "@/components/exam-generator/ExamGeneratorStudio";
import { ExamModelViewer } from "@/components/exam-generator/ExamModelViewer";
import { ExamInteractiveRunner } from "@/components/exam-generator/ExamInteractiveRunner";
import { QuestionBankExplorer } from "@/components/exam-generator/QuestionBankExplorer";
import { ExamGenerationConfig, GeneratedExamModel } from "@/lib/exam-generator/types";
import { generateExamSystem } from "@/lib/exam-generator/pipeline";
import {
  Award,
  BookOpen,
  Sparkles,
  Timer,
  BarChart3,
  Layers,
  RotateCcw,
  Clock,
  Play,
  CheckCircle2,
  Upload,
} from "lucide-react";

export default function ExamsPage() {
  // Book Selection State (Book-Agnostic)
  const [selectedBookId, setSelectedBookId] = useState<string>("it-secondary-2");
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Main Page Tabs: "generator" | "dashboard" | "bank" | "quick_presets"
  const [activeTab, setActiveTab] = useState<"generator" | "dashboard" | "bank" | "quick_presets">("generator");

  // Generated Exam State
  const [generatedExamModels, setGeneratedExamModels] = useState<GeneratedExamModel[] | null>(null);

  // Interactive Live Session State
  const [activeInteractiveModel, setActiveInteractiveModel] = useState<GeneratedExamModel | null>(null);

  // Load active book details when bookId changes
  const loadBook = useCallback(async (bookId: string) => {
    const container = getExamEngineContainer();
    const book = await container.bookRepository.getById(bookId);
    if (book) {
      setActiveBook(book);
    }
  }, []);

  useEffect(() => {
    loadBook(selectedBookId);
    setGeneratedExamModels(null);
    setActiveInteractiveModel(null);
  }, [selectedBookId, loadBook]);

  // Initial generation for active book
  useEffect(() => {
    if (!activeBook) return;
    const defaultConfig: ExamGenerationConfig = {
      scope: "curriculum",
      lessonIds: activeBook.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)),
      questionCount: 30,
      examCount: 2,
      questionTypes: "all",
      difficultyPreset: "balanced",
      difficultyDistribution: { easy: 25, medium: 40, hard: 25, higherOrder: 10 },
      durationMinutes: 60,
      totalMarks: 60,
      includeAnswers: true,
      includeSourceReferences: true,
      useExactBookAnswers: true,
      randomizeQuestions: true,
      randomizeOptions: true,
      selectedProfile: "final_exam",
    };
    const initialResult = generateExamSystem(defaultConfig);
    setGeneratedExamModels(initialResult.models);
  }, [activeBook]);

  // Handle generation from studio
  const handleStudioGenerate = (config: ExamGenerationConfig) => {
    const result = generateExamSystem(config);
    setGeneratedExamModels(result.models);
    setActiveInteractiveModel(null);
    setActiveTab("generator");
  };

  // Launch Quick Preset
  const handleLaunchQuickPreset = (presetKey: string) => {
    if (!activeBook) return;
    let cfg: ExamGenerationConfig;

    if (presetKey === "FINAL") {
      cfg = {
        scope: "curriculum",
        lessonIds: activeBook.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)),
        questionCount: 30,
        examCount: 1,
        questionTypes: "all",
        difficultyPreset: "balanced",
        difficultyDistribution: { easy: 25, medium: 40, hard: 25, higherOrder: 10 },
        durationMinutes: 60,
        totalMarks: 60,
        includeAnswers: true,
        includeSourceReferences: true,
        useExactBookAnswers: true,
        randomizeQuestions: true,
        randomizeOptions: true,
      };
    } else {
      const ch = activeBook.chapters.find((c) => c.id === presetKey);
      const lIds = ch ? ch.lessons.map((l) => l.id) : [];

      cfg = {
        scope: "chapter",
        chapterId: presetKey,
        lessonIds: lIds,
        questionCount: 18,
        examCount: 1,
        questionTypes: "all",
        difficultyPreset: "balanced",
        difficultyDistribution: { easy: 25, medium: 45, hard: 20, higherOrder: 10 },
        durationMinutes: 35,
        totalMarks: 40,
        includeAnswers: true,
        includeSourceReferences: true,
        useExactBookAnswers: true,
        randomizeQuestions: true,
        randomizeOptions: true,
      };
    }

    const res = generateExamSystem(cfg);
    setGeneratedExamModels(res.models);
    if (res.models[0]) {
      setActiveInteractiveModel(res.models[0]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 min-w-0 box-border overflow-x-hidden">
      {/* Import Book Modal */}
      <ImportBookModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onBookImported={(newBookId) => {
          setSelectedBookId(newBookId);
          loadBook(newBookId);
        }}
      />

      {/* Top Banner (Hidden when printing) */}
      <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 text-white shadow-2xl mb-6 sm:mb-8 box-border min-w-0 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold">
              منظومة إعداد الامتحانات وبنوك الأسئلة المعيارية بالذكاء الاصطناعي
            </span>
          </div>

          {/* Book Selector Dropdown & Import Book Button */}
          <EngineBookSelector
            selectedBookId={selectedBookId}
            onSelectBook={(bId) => setSelectedBookId(bId)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        </div>

        <h1 className="text-xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight">
          {activeBook ? activeBook.title : "مولد الامتحانات وبنك الأسئلة المتكامل"} 🎯
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
          منظومة امتحانية قائمة على المعمارية النظيفة (Clean Architecture) وفصل منطق المحرك عن بيانات المناهج.
          تدعم تعدد الكتب والصفوف والمناهج وتخزين الأسئلة، مع تغذية وسد الفجوات بالذكاء الاصطناعي وتوليد نماذج امتحانية متكافئة.
        </p>

        {/* Dynamic Book Metadata Stats */}
        {activeBook && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-indigo-400 font-mono block">
                {activeBook.chapters.length}
              </span>
              <span className="text-[11px] text-slate-400">الفصول الدراسية</span>
            </div>

            <div className="bg-slate-950/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono block">
                {activeBook.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}
              </span>
              <span className="text-[11px] text-slate-400">الدروس التعليمية</span>
            </div>

            <div className="bg-slate-950/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono block">
                {activeBook.gradeNameAr}
              </span>
              <span className="text-[11px] text-slate-400">المرحلة الدراسية</span>
            </div>

            <div className="bg-slate-950/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-center sm:text-right">
              <span className="text-lg sm:text-2xl font-black text-purple-400 font-mono block">
                معمارية مستقلة
              </span>
              <span className="text-[11px] text-slate-400">Clean Architecture</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs (Hidden during active test session or printing) */}
      {!activeInteractiveModel && (
        <div className="w-full flex flex-wrap gap-2 mb-6 sm:mb-8 bg-slate-950 p-1.5 sm:p-2 rounded-2xl border border-slate-800 box-border print:hidden">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex-1 min-w-[130px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "generator"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>مولد ونماذج الامتحانات</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 min-w-[130px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "dashboard"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>لوحة التغطية والذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`flex-1 min-w-[130px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "bank"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مستكشف بنك الأسئلة</span>
          </button>

          <button
            onClick={() => setActiveTab("quick_presets")}
            className={`flex-1 min-w-[130px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "quick_presets"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>نماذج البوكليت السريعة</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 1: ACTIVE INTERACTIVE EXAM SESSION                  */}
      {/* ======================================================== */}
      {activeInteractiveModel && (
        <div className="w-full">
          <ExamInteractiveRunner
            model={activeInteractiveModel}
            onExit={() => setActiveInteractiveModel(null)}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: EXAM GENERATOR STUDIO & MODEL VIEWER             */}
      {/* ======================================================== */}
      {!activeInteractiveModel && activeTab === "generator" && (
        <div className="w-full space-y-8">
          {generatedExamModels && generatedExamModels.length > 0 ? (
            <div className="space-y-6">
              {/* Reset / Edit Configuration Bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs print:hidden">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    تم توليد <strong>{generatedExamModels.length} نماذج امتحانية</strong> متكافئة لكتاب «{activeBook?.title}»
                  </span>
                </div>

                <button
                  onClick={() => setGeneratedExamModels(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تخصيص وضبط إعدادات التوليد</span>
                </button>
              </div>

              {/* Models Viewer with Student / Teacher / Answer Key modes & Print */}
              <ExamModelViewer
                models={generatedExamModels}
                onStartInteractiveExam={(m) => setActiveInteractiveModel(m)}
              />
            </div>
          ) : (
            /* Studio Control Panel to Configure & Generate */
            <ExamGeneratorStudio onGenerate={handleStudioGenerate} />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: QUESTION BANK DASHBOARD & AI EXPANSION           */}
      {/* ======================================================== */}
      {!activeInteractiveModel && activeTab === "dashboard" && (
        <div className="w-full">
          <QuestionBankDashboard bookId={selectedBookId} />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: COMPREHENSIVE QUESTION BANK EXPLORER             */}
      {/* ======================================================== */}
      {!activeInteractiveModel && activeTab === "bank" && (
        <div className="w-full">
          <QuestionBankExplorer />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: QUICK READY-MADE PRESETS & LAUNCHERS             */}
      {/* ======================================================== */}
      {!activeInteractiveModel && activeTab === "quick_presets" && activeBook && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2 box-border">
            <h3 className="text-xl sm:text-2xl font-black">
              نماذج البوكليت الامتحانية الجاهزة للبدء الفوري — {activeBook.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              اختر أحد النماذج المعتمدة أدناه لخوض اختبار إلكتروني فوري مع مؤقت زمني وتصحيح آلي فوري وسلالم التقدير.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Final Full Exam */}
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
                  امتحان البوكليت الشامل لكامل كتاب «{activeBook.title}»
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  30 سؤالاً متوازناً تغطي كافة فصول الكتاب بنسب مدروسة بدقة، مع الأسئلة المقالية وأسئلة التفكير العليا.
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

            {/* Chapters Presets */}
            {activeBook.chapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => handleLaunchQuickPreset(ch.id)}
                className="p-6 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      امتحان الفصل {ch.number}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> 35 دقيقة
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {ch.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ch.description || `18 سؤالاً مركزاً تغطي دروس الفصل ${ch.number}.`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-blue-400">18 سؤالاً • 40 درجة</span>
                  <span className="px-4 py-2 bg-slate-800 group-hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>بدء الاختبار</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
