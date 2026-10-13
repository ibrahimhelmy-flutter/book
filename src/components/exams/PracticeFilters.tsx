"use client";

import React from "react";
import { Award, Filter, Timer } from "lucide-react";
import type { DifficultyCounts, DifficultyFilter } from "./exams-logic";
import { SearchInput } from "./ExamsCommon";

interface PracticeFiltersProps {
  difficulty: DifficultyFilter;
  counts: DifficultyCounts;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  scopeSummary: string;
  available: number;
  /** Questions of the scope are loaded (the timed exam needs them). */
  ready: boolean;
  onOpenExamConfig: () => void;
  isPresetsTab: boolean;
  onShowPresets: () => void;
}

const DIFFICULTY_BUTTONS: { id: DifficultyFilter; label: string; active: string }[] = [
  { id: "all", label: "الكل", active: "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" },
  { id: "easy", label: "سهل", active: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" },
  { id: "medium", label: "متوسط", active: "bg-amber-600 text-white shadow-md shadow-amber-600/30" },
  { id: "hard", label: "صعب", active: "bg-rose-600 text-white shadow-md shadow-rose-600/30" },
];

/** Practice / presets sub-filters: difficulty (with counts), search and the scope/action strip. */
export function PracticeFilters({
  difficulty,
  counts,
  onDifficultyChange,
  search,
  onSearchChange,
  scopeSummary,
  available,
  ready,
  onOpenExamConfig,
  isPresetsTab,
  onShowPresets,
}: PracticeFiltersProps) {
  return (
    <>
      {/* Difficulty & Search Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 pl-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>الصعوبة:</span>
          </span>
          {DIFFICULTY_BUTTONS.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={difficulty === d.id}
              onClick={() => onDifficultyChange(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                difficulty === d.id ? d.active : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>{d.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">{counts[d.id]}</span>
            </button>
          ))}
        </div>

        <SearchInput value={search} onChange={onSearchChange} placeholder="بحث في نص السؤال أو الخيارات..." />
      </div>

      {/* Action Summary Strip */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>النطاق النشط:</span>
            <span className="text-indigo-300 font-semibold">{scopeSummary}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            متاح الآن <strong>{available} سؤالاً</strong> مطابقاً للتصفية الحالية.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={!ready || available === 0}
            onClick={onOpenExamConfig}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Timer className="w-4 h-4 text-amber-300" />
            <span>بدء اختبار موقوت على المحدد</span>
          </button>

          <button
            type="button"
            onClick={onShowPresets}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isPresetsTab
                ? "bg-amber-600 text-white border-amber-500"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>نماذج البوكليت الجاهزة</span>
          </button>
        </div>
      </div>
    </>
  );
}
