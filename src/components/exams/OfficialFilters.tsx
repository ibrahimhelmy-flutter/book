"use client";

import React from "react";
import { Award, Download, Filter, Timer } from "lucide-react";
import {
  OFFICIAL_SECTIONS,
  OFFICIAL_TYPES,
  type OfficialSectionFilter,
  type OfficialStats,
  type OfficialTypeFilter,
} from "./exams-logic";
import { SearchInput } from "./ExamsCommon";

interface OfficialFiltersProps {
  section: OfficialSectionFilter;
  type: OfficialTypeFilter;
  search: string;
  onSectionChange: (section: OfficialSectionFilter) => void;
  onTypeChange: (type: OfficialTypeFilter) => void;
  onSearchChange: (search: string) => void;
  scopeSummary: string;
  stats: OfficialStats;
  /** Questions of the scope are loaded (exam and download need them). */
  ready: boolean;
  onStartExam: () => void;
  onDownload: () => void;
}

/** Official tab sub-filters: booklet sections, question type, search and the scope/action strip. */
export function OfficialFilters({
  section,
  type,
  search,
  onSectionChange,
  onTypeChange,
  onSearchChange,
  scopeSummary,
  stats,
  ready,
  onStartExam,
  onDownload,
}: OfficialFiltersProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-slate-800/60">
      {/* Official Sections Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>3. أقسام التقييم في الكتاب:</span>
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {OFFICIAL_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              aria-pressed={section === sec.id}
              onClick={() => onSectionChange(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                section === sec.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Types & Search Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-slate-800/40">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 pl-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>نوع السؤال:</span>
          </span>
          {OFFICIAL_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={type === t.id}
              onClick={() => onTypeChange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === t.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <SearchInput value={search} onChange={onSearchChange} placeholder="بحث في السؤال، الإجابة، أو المرجع..." />
      </div>

      {/* Action Summary Strip */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>النطاق النشط:</span>
            <span className="text-indigo-300 font-semibold">{scopeSummary}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            متاح الآن <strong>{stats.total} سؤالاً رسمياً</strong> (اختيار من متعدد: {stats.mcqs} • أسئلة مقالية: {stats.essays}).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={!ready || stats.mcqs === 0}
            onClick={onStartExam}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            title="بدء اختبار موقوت على أسئلة الاختيار من متعدد الرسمية للوزارة"
          >
            <Timer className="w-4 h-4 text-amber-300" />
            <span>بدء اختبار موقوت ({stats.mcqs} سؤال MCQ)</span>
          </button>

          <button
            type="button"
            disabled={!ready}
            onClick={onDownload}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="تحميل الأسئلة المعروضة كملف JSON"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>تحميل JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
