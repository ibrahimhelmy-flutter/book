"use client";

import React from "react";
import { Check, Code, Copy, Download, Sparkles } from "lucide-react";

interface ExamsHeaderProps {
  showOfficial: boolean;
  isOfficialTab: boolean;
  officialTotal: number;
  practiceTotal: number;
  lessonCount: number;
  /** False while the active tab's questions are still loading (JSON actions need them). */
  canExport: boolean;
  isCopied: boolean;
  onDownloadOfficial: () => void;
  onCopyJson: () => void;
  onPreviewJson: () => void;
}

const ACTION_BUTTON =
  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none";

/** Hero header: title, JSON quick actions and the totals strip (all counts from the exams index). */
export function ExamsHeader({
  showOfficial,
  isOfficialTab,
  officialTotal,
  practiceTotal,
  lessonCount,
  canExport,
  isCopied,
  onDownloadOfficial,
  onCopyJson,
  onPreviewJson,
}: ExamsHeaderProps) {
  const stats = [
    ...(showOfficial ? [{ value: officialTotal, label: "سؤالاً بكتاب تقييمات الوزارة", color: "text-indigo-400" }] : []),
    { value: practiceTotal, label: "سؤال تدريب تفاعلي", color: "text-emerald-400" },
    { value: `${lessonCount} درساً`, label: "تغطية شاملة لكل الوحدات", color: "text-amber-400" },
    { value: "100%", label: "موثق بنص كتاب الوزارة", color: "text-purple-400" },
  ];

  return (
    <header className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>المنظومة الموحدة للأسئلة والامتحانات</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            بنك الأسئلة والامتحانات التفاعلية 🎯
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            صفحة واحدة متكاملة تجمع أسئلة الدروس والامتحانات الموقوتة. حدد أي درس أو عدة دروس، أو وحدة كاملة، وتدرّب عليها فورياً أو اخض اختباراً إلكترونياً مع مؤقت وتصحيح ذكي.
          </p>
        </div>

        {/* Quick Actions Strip */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {isOfficialTab && (
            <button
              type="button"
              disabled={!canExport}
              onClick={onDownloadOfficial}
              className={`${ACTION_BUTTON} bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30`}
              title="تحميل أسئلة التقييمات الرسمية المحددة كملف JSON"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>تحميل JSON</span>
            </button>
          )}

          <button
            type="button"
            disabled={!canExport}
            onClick={onCopyJson}
            className={`${ACTION_BUTTON} bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700`}
            title="نسخ الأسئلة الحالية بصيغة JSON"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>نسخ JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!canExport}
            onClick={onPreviewJson}
            className={`${ACTION_BUTTON} bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30`}
            title="معاينة كود JSON"
          >
            <Code className="w-4 h-4 text-indigo-400" />
            <span>معاينة JSON</span>
          </button>
        </div>
      </div>

      {/* Dynamic Overview Strip */}
      <div
        className={`grid grid-cols-2 ${stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-slate-800/80`}
      >
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center sm:text-right">
            <span className={`text-lg sm:text-2xl font-black ${s.color} font-mono block`}>{s.value}</span>
            <span className="text-[11px] text-slate-400">{s.label}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
