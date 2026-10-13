"use client";

import React, { useState } from "react";
import { Play, Timer, X } from "lucide-react";

const COUNT_CHOICES = [10, 20, 30];

/** Timed-exam setup for the current practice scope: pick 10 / 20 / 30 questions, then start. */
export function ExamConfigModal({
  scopeSummary,
  available,
  onStart,
  onClose,
}: {
  scopeSummary: string;
  available: number;
  onStart: (count: number) => void;
  onClose: () => void;
}) {
  const [count, setCount] = useState(20);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-400" />
            <h3 id="exam-config-title" className="text-base font-bold text-white">
              إعداد الاختبار الإلكتروني الموقوت
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400">النطاق المحدد للاختبار:</div>
            <div className="text-white font-bold">{scopeSummary}</div>
            <div className="text-[11px] text-indigo-400 pt-1">إجمالي الأسئلة المتاحة للاختيار منها: {available} سؤالاً</div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-300 font-bold block">اختر عدد أسئلة الاختبار:</span>
            <div className="grid grid-cols-3 gap-2">
              {COUNT_CHOICES.map((num) => (
                <button
                  key={num}
                  type="button"
                  aria-pressed={count === num}
                  disabled={available < num && available < 5}
                  onClick={() => setCount(num)}
                  className={`py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 disabled:opacity-40 ${
                    count === num
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-sm font-mono">{num} سؤال</span>
                  <span className="text-[10px] text-slate-400 font-normal">~ {Math.round(num * 1.8)} دقيقة</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onStart(count)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>ابدأ الاختبار الآن</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
