"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QuestionBankCoverageReport } from "@/core/application/dtos/ExamGenerationDTO";
import { getExamEngineContainer } from "@/core/infrastructure/bootstrap";
import {
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

interface QuestionBankDashboardProps {
  bookId: string;
  onQuestionsUpdated?: () => void;
}

export function QuestionBankDashboard({ bookId, onQuestionsUpdated }: QuestionBankDashboardProps) {
  const [report, setReport] = useState<QuestionBankCoverageReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expansionStatus, setExpansionStatus] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const container = getExamEngineContainer();
      const rep = await container.analyzeQuestionBankUseCase.execute(bookId);
      setReport(rep);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExpandMissingQuestions = async (lessonId?: string) => {
    setIsExpanding(true);
    setExpansionStatus("جاري استخلاص نصوص المحتوى وتوليد الأسئلة الناقصة وفحص جودتها...");
    try {
      const container = getExamEngineContainer();
      const result = await container.expandQuestionBankUseCase.execute({
        bookId,
        lessonId,
        requestedCount: 10,
      });

      setExpansionStatus(
        `تم بنجاح توليد واعتماد ${result.addedQuestions.length} سؤالاً جديداً وتخزينها بالبنك!`
      );
      fireConfetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      await loadReport();
      if (onQuestionsUpdated) {
        onQuestionsUpdated();
      }
    } catch (err: any) {
      setExpansionStatus(`تعذر التوليد: ${err.message}`);
    } finally {
      setIsExpanding(false);
      setTimeout(() => setExpansionStatus(null), 5000);
    }
  };

  if (isLoading && !report) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        جاري تحليل بنك الأسئلة ومطابقة مؤشرات التغطية...
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">إجمالي الأسئلة المخزنة</span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
            {report.totalQuestions}
          </span>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">نسبة التغطية المعيارية</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {report.coveragePercentage}%
          </span>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">الأسئلة التحليلية والصعبة</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {report.difficultyCounts.hard + report.difficultyCounts.advanced}
          </span>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block mb-1">الدروس المغطاة</span>
          <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            {report.lessonCoverage.filter((l) => l.questionCount > 0).length} / {report.lessonCoverage.length}
          </span>
        </div>
      </div>

      {/* Difficulty & Cognitive Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Difficulty Breakdown */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">توزيع الصعوبة (Difficulty):</span>
            <span className="text-[11px] font-mono text-slate-400">{report.totalQuestions} سؤالاً</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-400">سهل (Easy)</span>
              <span className="font-mono text-slate-300">{report.difficultyCounts.easy}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${report.totalQuestions > 0 ? (report.difficultyCounts.easy / report.totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-emerald-400">متوسط (Medium)</span>
              <span className="font-mono text-slate-300">{report.difficultyCounts.medium}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{
                  width: `${report.totalQuestions > 0 ? (report.difficultyCounts.medium / report.totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-amber-400">صعب (Hard)</span>
              <span className="font-mono text-slate-300">{report.difficultyCounts.hard}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{
                  width: `${report.totalQuestions > 0 ? (report.difficultyCounts.hard / report.totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-rose-400">فائقين ومستويات عليا (Advanced)</span>
              <span className="font-mono text-slate-300">{report.difficultyCounts.advanced}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-2 rounded-full"
                style={{
                  width: `${report.totalQuestions > 0 ? (report.difficultyCounts.advanced / report.totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. Cognitive Levels Breakdown */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">المستويات المعرفية (Cognitive Levels):</span>
            <span className="text-[11px] font-mono text-indigo-400">تصنيف بلوم المطور</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>تذكر واسترجاع (Recall)</span>
              <span className="font-mono">{report.cognitiveCounts.recall}</span>
            </div>
            <div className="flex justify-between">
              <span>فهم واستيعاب وتعليل (Understanding)</span>
              <span className="font-mono">{report.cognitiveCounts.understanding}</span>
            </div>
            <div className="flex justify-between">
              <span>تطبيق ومواقف (Application)</span>
              <span className="font-mono">{report.cognitiveCounts.application}</span>
            </div>
            <div className="flex justify-between">
              <span>تحليل ومقارنة (Analysis)</span>
              <span className="font-mono">{report.cognitiveCounts.analysis}</span>
            </div>
            <div className="flex justify-between">
              <span>تقييم وتكامل بين الدروس (Integration)</span>
              <span className="font-mono">{report.cognitiveCounts.integration + report.cognitiveCounts.evaluation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Gaps & AI Smart Expansion Box */}
      <div className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>تحليل الفجوات المعرفية والأسئلة المقترحة:</span>
            </div>
            <p className="text-xs text-slate-300">
              تحدد المنظومة نواتج التعلم أو الدروس التي تحتاج إلى تغطية إضافية لضمان توازن البنك.
            </p>
          </div>

          <button
            disabled={isExpanding}
            onClick={() => handleExpandMissingQuestions()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            {isExpanding ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>توليد وتغذية الأسئلة الناقصة بالذكاء الاصطناعي</span>
          </button>
        </div>

        {/* Status Message */}
        {expansionStatus && (
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-amber-300 animate-fadeIn">
            {expansionStatus}
          </div>
        )}

        {/* Missing Gaps List */}
        {report.missingGaps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar pt-2">
            {report.missingGaps.slice(0, 6).map((gap) => (
              <div
                key={gap.lessonId}
                className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1"
              >
                <span className="font-bold text-slate-200 block truncate">{gap.lessonTitle}</span>
                <span className="text-[11px] text-amber-400/90 block">{gap.recommendation}</span>
                <button
                  onClick={() => handleExpandMissingQuestions(gap.lessonId)}
                  className="text-[11px] text-indigo-400 hover:underline pt-1 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <span>توليد لهذا الدرس فقط</span>
                  <ArrowRight className="w-3 h-3 rotate-180" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-emerald-400 flex items-center gap-2 pt-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>كافة الدروس مغطاة بتوازن تام طبقاً للمعايير الرسمية.</span>
          </div>
        )}
      </div>
    </div>
  );
}
