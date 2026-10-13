"use client";

import React, { useMemo } from "react";
import { Award, Download, Play } from "lucide-react";
import type { OfficialAssessmentQuestion } from "@/types/assessments";
import { OfficialAssessmentCard } from "@/components/quiz/OfficialAssessmentCard";
import { PAGE_SIZE, paginate, type OfficialStats } from "./exams-logic";
import { BankLoadState, EmptyResults, Pagination, ScoreStrip } from "./ExamsCommon";
import type { BankState } from "./use-question-banks";
import type { ScoreStats } from "./use-exam-session";

interface OfficialBankTabProps {
  bank: Pick<BankState<OfficialAssessmentQuestion>, "status" | "error" | "retry">;
  /** Scope questions after section / type / search filters. */
  questions: OfficialAssessmentQuestion[];
  stats: OfficialStats;
  scopeSummary: string;
  page: number;
  onPageChange: (page: number) => void;
  score: ScoreStats;
  onAnswer: (isCorrect: boolean) => void;
  onResetScore: () => void;
  onDownload: () => void;
  onStartExam: () => void;
  onResetFilters: () => void;
}

/** Official Ministry booklet questions (كتيب التقييمات): banner, score, paginated cards. */
export function OfficialBankTab({
  bank,
  questions,
  stats,
  scopeSummary,
  page,
  onPageChange,
  score,
  onAnswer,
  onResetScore,
  onDownload,
  onStartExam,
  onResetFilters,
}: OfficialBankTabProps) {
  const ready = bank.status === "ready";
  const paged = useMemo(() => paginate(questions, page), [questions, page]);
  const firstNumber = (paged.page - 1) * PAGE_SIZE + 1;

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Official Ministry Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                كتاب التقييمات والأداءات الصفية والمنزلية المعتمد
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                وزارة التربية والتعليم
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              جميع أسئلة المهام الأدائية، الواجبات المنزلية، والتقييمات الأسبوعية الثلاثة مع الإجابات النموذجية الرسمية والاقتباس الحرفي من صفحات كتاب الوزارة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={!ready}
            onClick={onDownload}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>تحميل JSON</span>
          </button>

          {ready && stats.mcqs > 0 && (
            <button
              type="button"
              onClick={onStartExam}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>اختبار موقوت ({stats.mcqs} MCQ)</span>
            </button>
          )}
        </div>
      </div>

      <ScoreStrip score={score} onReset={onResetScore} />

      {/* List Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">عرض أسئلة التقييمات:</span>
          <span className="text-xs text-slate-300 font-medium">{scopeSummary}</span>
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>الأسئلة المطابقة:</span>
          <span className="text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
            {stats.total} سؤال
          </span>
        </div>
      </div>

      {/* Questions */}
      {!ready ? (
        <BankLoadState status={bank.status} error={bank.error} onRetry={bank.retry} />
      ) : questions.length === 0 ? (
        <EmptyResults
          title="لا توجد أسئلة رسمية تطابق الفلتر المحدد حالياً."
          hint="جرب اختيار قسم آخر أو مسح كلمة البحث أو اختيار دروس أخرى."
          onReset={onResetFilters}
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {paged.items.map((q, idx) => (
            <OfficialAssessmentCard key={q.id} question={q} indexNumber={firstNumber + idx} onAnswerSelected={onAnswer} />
          ))}
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            onChange={onPageChange}
            ariaLabel="تصفح صفحات أسئلة التقييمات الرسمية"
            summary={`${questions.length} سؤال وزاري`}
          />
        </div>
      )}
    </section>
  );
}
