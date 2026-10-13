"use client";

import React, { useMemo } from "react";
import { Compass, ListFilter, Loader2, Sparkles, Timer } from "lucide-react";
import type { EnrichedSimpleQuestion } from "@/lib/practice";
import { SimpleQuestionCard } from "@/components/quiz/SimpleQuestionCard";
import { SingleQuestionPlayer } from "@/components/quiz/SingleQuestionPlayer";
import { PAGE_SIZE, paginate } from "./exams-logic";
import { BankLoadState, EmptyResults, Pagination, ScoreStrip } from "./ExamsCommon";
import type { BankState } from "./use-question-banks";
import type { PracticeDisplayMode, PracticeSession } from "./use-exam-session";

/** Banner shown while "unit review only" is active. */
export interface ReviewBanner {
  label: string;
  launching: boolean;
  onLaunchExam: () => void;
  onExit: () => void;
}

interface PracticeTabProps {
  bank: Pick<BankState<EnrichedSimpleQuestion>, "status" | "error" | "retry">;
  /** Scope questions after difficulty / search filters. */
  questions: EnrichedSimpleQuestion[];
  page: number;
  onPageChange: (page: number) => void;
  questionIndex: number;
  onQuestionIndexChange: (index: number) => void;
  session: PracticeSession;
  reviewBanner: ReviewBanner | null;
  onResetFilters: () => void;
}

const MODES: { id: PracticeDisplayMode; label: string; Icon: typeof Compass }[] = [
  { id: "single", label: "سؤال بسؤال (مريح وثابت)", Icon: Compass },
  { id: "list", label: "عرض كقائمة", Icon: ListFilter },
];

/** Direct practice bank: single-question player or paginated list of SimpleQuestionCards. */
export function PracticeTab({
  bank,
  questions,
  page,
  onPageChange,
  questionIndex,
  onQuestionIndexChange,
  session,
  reviewBanner,
  onResetFilters,
}: PracticeTabProps) {
  const ready = bank.status === "ready";
  const paged = useMemo(() => paginate(questions, page), [questions, page]);

  return (
    <section className="space-y-6">
      {reviewBanner && (
        <div className="p-4 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-amber-200 flex-wrap animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>
                  أسئلة المراجعة الشاملة على {reviewBanner.label} ({questions.length} سؤالاً)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  أسئلة الربط والتحليل
                </span>
              </h4>
              <p className="text-xs text-amber-300/80">
                أسئلة الربط والتحليل الشاملة لكافة مفاهيم ودروس {reviewBanner.label} مع تفسير تفصيلي لكل خيار.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={reviewBanner.launching}
              onClick={reviewBanner.onLaunchExam}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {reviewBanner.launching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Timer className="w-3.5 h-3.5" />}
              <span>خوضها كامتحان موقوت</span>
            </button>
            <button
              type="button"
              onClick={reviewBanner.onExit}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-800"
            >
              عرض كل الأسئلة
            </button>
          </div>
        </div>
      )}

      <ScoreStrip score={session.score} onReset={session.resetScore} />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">طريقة التصفح:</span>
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            {MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={session.displayMode === id}
                onClick={() => session.setDisplayMode(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  session.displayMode === id
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {ready && (
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>الأسئلة المطابقة:</span>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
              {questions.length} سؤال
            </span>
          </div>
        )}
      </div>

      {/* Questions */}
      {!ready ? (
        <BankLoadState status={bank.status} error={bank.error} onRetry={bank.retry} />
      ) : questions.length === 0 ? (
        <EmptyResults
          title="لا توجد أسئلة تطابق الفلتر المحدد حالياً."
          hint="جرب تغيير تحديد الدروس أو اختيار مستوى صعوبة آخر أو مسح كلمة البحث."
          onReset={onResetFilters}
        />
      ) : session.displayMode === "single" ? (
        <SingleQuestionPlayer
          questions={questions}
          currentIndex={questionIndex}
          onIndexChange={onQuestionIndexChange}
          userAnswers={session.answers}
          onAnswerSelected={session.answerSingle}
          onResetQuestion={session.resetQuestion}
          onResetAll={session.resetAll}
          onSwitchToListMode={() => session.setDisplayMode("list")}
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {paged.items.map((q, idx) => (
            <SimpleQuestionCard
              key={`${paged.page}-${q.id}-${idx}`}
              question={q}
              questionNumber={(paged.page - 1) * PAGE_SIZE + idx + 1}
              lessonBadge={q.isUnitReview ? "مراجعة شاملة" : `درس ${q.lessonKey}: ${q.lessonTitle}`}
              chapterBadge={`الوحدة ${q.chapterNumber}`}
              isUnitReview={q.isUnitReview}
              onAnswerSelected={session.recordListAnswer}
            />
          ))}
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            onChange={onPageChange}
            ariaLabel="تصفح صفحات الأسئلة"
            summary={`${questions.length} سؤال`}
          />
        </div>
      )}
    </section>
  );
}
