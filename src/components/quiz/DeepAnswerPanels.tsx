"use client";

import React from "react";
import { Check, X, Eye, ListChecks } from "lucide-react";
import type { FillBlank } from "@/types/deep-questions";
import { isBlankCorrect, splitBlanks } from "@/lib/deep-question-kinds";

/** The fill_blank sentence with one inline input per `____` gap. */
export function FillBlankSentence({
  text,
  blanks,
  inputs,
  checked,
  revealed = false,
  onChange,
}: {
  text: string;
  blanks: FillBlank[];
  inputs: string[];
  checked: boolean;
  /** The answer was shown instead of checked: gaps that aren't right stay neutral rather than red. */
  revealed?: boolean;
  onChange: (index: number, value: string) => void;
}) {
  const parts = splitBlanks(text);
  return (
    <p className="text-base sm:text-lg font-bold text-white leading-[2.6] sm:leading-[2.6] whitespace-pre-line">
      {parts.map((part, i) => {
        const blank = blanks[i];
        if (i === parts.length - 1 || !blank) return <span key={i}>{part}</span>;
        const value = inputs[i] || "";
        const right = checked && isBlankCorrect(value, blank);
        const stateClass = !checked
          ? "border-indigo-500/50 focus:border-indigo-400 bg-slate-950"
          : right
          ? "border-emerald-500 bg-emerald-950/60 text-emerald-200"
          : revealed
          ? "border-slate-600 bg-slate-950 text-slate-300"
          : "border-rose-500 bg-rose-950/60 text-rose-200";
        return (
          <React.Fragment key={i}>
            <span>{part}</span>
            <span className="inline-flex flex-col align-middle mx-1">
              <input
                type="text"
                dir="auto"
                value={value}
                readOnly={checked}
                onChange={(e) => onChange(i, e.target.value)}
                aria-label={`الفراغ ${i + 1}`}
                placeholder={`(${i + 1})`}
                className={`w-36 sm:w-44 px-2 py-0.5 rounded-lg border-2 border-dashed text-sm sm:text-base font-semibold text-center outline-none transition-colors ${stateClass}`}
              />
              {checked && !right && (
                <span className="text-[11px] sm:text-xs font-bold text-emerald-300 leading-tight text-center mt-0.5">
                  {blank.answer}
                </span>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </p>
  );
}

export function FillBlankActions({
  canCheck,
  onCheck,
  onReveal,
}: {
  canCheck: boolean;
  onCheck: () => void;
  onReveal: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
      <button
        type="button"
        disabled={!canCheck}
        onClick={onCheck}
        className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
      >
        <Check className="w-4 h-4" />
        <span>تحقق من إجابتي</span>
      </button>
      <button
        type="button"
        onClick={onReveal}
        className="h-11 px-5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-slate-500" />
        <span>إظهار الإجابة</span>
      </button>
    </div>
  );
}

export function EssayDraft({
  value,
  revealed,
  onChange,
  onReveal,
}: {
  value: string;
  revealed: boolean;
  onChange: (value: string) => void;
  onReveal: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="اكتب إجابتك هنا بأسلوبك (اختياري)، ثم قارنها بالإجابة النموذجية..."
        aria-label="إجابتك"
        className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border-2 border-slate-800 focus:border-indigo-500/60 text-slate-100 text-sm sm:text-base leading-relaxed outline-none resize-y transition-colors"
      />
      {!revealed && (
        <button
          type="button"
          onClick={onReveal}
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span>اعرض الإجابة النموذجية وقيّم نفسك</span>
        </button>
      )}
    </div>
  );
}

/** Self-assessment: the learner ticks each key point their answer covered. */
export function EssayChecklist({
  keyPoints,
  covered,
  onToggle,
}: {
  keyPoints: string[];
  covered: number[];
  onToggle: (index: number) => void;
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-700/60 space-y-2.5">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2 font-bold text-slate-200 text-xs sm:text-sm">
          <ListChecks className="w-4 h-4 text-indigo-400 shrink-0" />
          قيّم إجابتك: علّم النقاط التي ذكرتها
        </span>
        <span className="font-mono text-xs font-bold text-indigo-300 shrink-0">
          {covered.length} / {keyPoints.length}
        </span>
      </div>
      <ul className="space-y-1.5" aria-label="النقاط الأساسية">
        {keyPoints.map((point, i) => {
          const isOn = covered.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onToggle(i)}
                aria-pressed={isOn}
                className={`w-full p-2.5 rounded-xl border text-right flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed transition-colors cursor-pointer ${
                  isOn
                    ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-100"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isOn ? "bg-emerald-600 border-emerald-500 text-white" : "border-slate-600"
                  }`}
                >
                  {isOn ? <Check className="w-3.5 h-3.5" /> : null}
                </span>
                <span className="flex-1">{point}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TrueFalseButtons({
  options,
  selected,
  answer,
  onSelect,
}: {
  options: string[];
  selected: string | undefined;
  answer: string;
  onSelect: (option: string) => void;
}) {
  const answered = selected !== undefined;
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 animate-fadeIn">
      {options.map((opt, i) => {
        const isTrue = i === 0;
        let style = isTrue
          ? "bg-slate-950/70 border-slate-800 text-slate-100 hover:border-emerald-500/50 hover:bg-emerald-950/20"
          : "bg-slate-950/70 border-slate-800 text-slate-100 hover:border-rose-500/50 hover:bg-rose-950/20";
        if (answered) {
          if (opt === answer) style = "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
          else if (opt === selected) style = "bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40";
          else style = "bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60";
        }
        return (
          <button
            key={opt}
            type="button"
            disabled={answered}
            onClick={() => onSelect(opt)}
            className={`min-h-[56px] rounded-xl sm:rounded-2xl border-2 text-base sm:text-lg font-black flex items-center justify-center gap-2 transition-all ${
              answered ? "cursor-default" : "cursor-pointer active:scale-95"
            } ${style}`}
          >
            {isTrue ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{opt}</span>
            <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
              {i + 1}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}
