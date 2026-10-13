"use client";

import React from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Layers, Loader2, RotateCcw, Search, X } from "lucide-react";
import type { ScoreStats } from "./use-exam-session";
import type { BankStatus } from "./use-question-banks";

/** Keyword search box used by both the official and the practice filter rows. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-9 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="مسح البحث"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/** Answered / correct / percentage strip, shown once the student has answered something. */
export function ScoreStrip({ score, onReset }: { score: ScoreStats; onReset: () => void }) {
  if (score.answered === 0) return null;
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap text-xs font-bold">
      <div className="flex items-center gap-4 text-slate-300 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">تمت الإجابة:</span>
          <span className="text-white font-mono text-sm">{score.answered}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">إجابات صحيحة:</span>
          <span className="text-emerald-400 font-mono text-sm">{score.correct}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">النسبة المئوية:</span>
          <span className="text-indigo-300 font-mono text-sm">
            {Math.round((score.correct / score.answered) * 100)}%
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        إعادة ضبط العداد
      </button>
    </div>
  );
}

const PAGE_BUTTON =
  "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer";

/** Previous / next pager under question lists (scrolls back up to the list on change). */
export function Pagination({
  page,
  totalPages,
  onChange,
  ariaLabel,
  summary,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  ariaLabel: string;
  summary: string;
}) {
  if (totalPages <= 1) return null;
  const go = (next: number) => {
    onChange(Math.min(totalPages, Math.max(1, next)));
    window.scrollTo({ top: 400, behavior: "smooth" });
  };
  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/70 border border-slate-800 rounded-2xl"
    >
      <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className={PAGE_BUTTON}>
        <ChevronRight className="w-4 h-4" />
        <span>الصفحة السابقة</span>
      </button>

      <span className="text-xs font-mono font-bold text-slate-300">
        صفحة {page} من {totalPages} ({summary})
      </span>

      <button type="button" disabled={page >= totalPages} onClick={() => go(page + 1)} className={PAGE_BUTTON}>
        <span>الصفحة التالية</span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    </nav>
  );
}

/** "No questions match" card with a reset-filters button. */
export function EmptyResults({ title, hint, onReset }: { title: string; hint: string; onReset: () => void }) {
  return (
    <div className="p-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
      <Layers className="w-10 h-10 text-slate-600 mx-auto" />
      <p className="font-bold text-white text-base">{title}</p>
      <p className="text-xs text-slate-500">{hint}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
      >
        إعادة تعيين الفلتر
      </button>
    </div>
  );
}

/** Compact loading skeleton, or an error card with retry; render it while a bank is not "ready". */
export function BankLoadState({
  status,
  error,
  onRetry,
}: {
  status: BankStatus;
  error: Error | null;
  onRetry: () => void;
}) {
  if (status === "error") {
    return (
      <div
        role="alert"
        className="p-8 text-center bg-rose-950/20 border border-rose-900/50 rounded-3xl space-y-3"
      >
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="font-bold text-white text-sm">تعذر تحميل الأسئلة.</p>
        <p className="text-xs text-slate-400">تحقق من اتصالك بالإنترنت ثم أعد المحاولة.</p>
        {error?.message && (
          <p className="text-[10px] text-slate-600 font-mono" dir="ltr">
            {error.message}
          </p>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 py-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        <span>جارِ تحميل الأسئلة…</span>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3 animate-pulse">
          <div className="h-3 w-1/3 bg-slate-800 rounded" />
          <div className="h-4 w-5/6 bg-slate-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-9 bg-slate-800/70 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
