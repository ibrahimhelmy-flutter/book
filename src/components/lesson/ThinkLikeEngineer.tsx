"use client";

import React, { useState } from "react";
import { EngineerChallenge } from "@/types";
import { Wrench, CheckCircle, HelpCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  challenge: EngineerChallenge;
}

export function ThinkLikeEngineer({ challenge }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  const handleSelect = (stepNum: number, opt: string) => {
    setSelectedOptions((prev) => ({ ...prev, [stepNum]: opt }));
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps((prev) => [...prev, stepNum]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl my-8">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-400 font-mono block">التطبيق العملي الهندسي</span>
          <h3 className="text-xl font-bold">{challenge.title}</h3>
        </div>
      </div>

      {/* Scenario text */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed mb-6">
        <strong className="text-white block mb-1">السيناريو والمهمة الهندسية:</strong>
        {challenge.scenario}
      </div>

      {/* Steps List */}
      <div className="space-y-4 mb-6">
        {challenge.steps.map((step) => (
          <div key={step.number} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center border border-amber-500/30">
                  {step.number}
                </span>
                <h4 className="font-bold text-sm text-white">{step.title}</h4>
              </div>
              {completedSteps.includes(step.number) && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> تم الإنجاز
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

            {/* Options if available */}
            {step.options && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-slate-400 font-medium block">اختر القرار الهندسي الأنسب:</span>
                {step.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(step.number, opt)}
                    className={`w-full p-3 rounded-lg border text-right text-xs leading-relaxed transition-all cursor-pointer ${
                      selectedOptions[step.number] === opt
                        ? "bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500/40 font-semibold"
                        : "bg-slate-950 hover:bg-slate-800/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    • {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Engineering Hint */}
      {challenge.hint && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs flex gap-2.5 items-start text-amber-200 mb-4">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-300">تلميح التفكير الهندسي:</strong>
            <p className="leading-relaxed">{challenge.hint}</p>
          </div>
        </div>
      )}

      {/* Model Answer (الإجابة والحل الهندسي النموذجي) */}
      {challenge.modelAnswer && (
        <div className="border border-emerald-500/40 rounded-xl overflow-hidden bg-emerald-950/20">
          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full p-4 flex items-center justify-between text-right text-xs font-bold text-emerald-300 hover:bg-emerald-950/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>الإجابة النموذجية والقرار الهندسي المعتمد 🏆</span>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              {showModelAnswer ? (
                <>
                  <span>إخفاء الإجابة</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>كشف الإجابة النموذجية 🔍</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </button>
          {showModelAnswer && (
            <div className="p-4 pt-0 border-t border-emerald-500/20 space-y-2 text-xs text-slate-200 animate-fadeIn">
              {challenge.modelAnswer.split("\n").map((line, idx) => (
                <p key={idx} className="leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/20">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
