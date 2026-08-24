"use client";

import React, { useState } from "react";
import { SolvedExample } from "@/types";
import { BookOpenCheck, ChevronDown, ChevronUp, CheckCircle, HelpCircle } from "lucide-react";

interface Props {
  example: SolvedExample;
}

export function SolvedExampleAccordion({ example }: Props) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    [example.items[0]?.id || ""]: true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl my-8">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <BookOpenCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-400 font-mono block">التدريب والحل النموذجي</span>
          <h3 className="text-xl font-bold">{example.title}</h3>
        </div>
      </div>

      <div className="space-y-4">
        {example.items.map((item, index) => {
          const isOpen = !!openItems[item.id];
          return (
            <div key={item.id} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 text-right flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center border border-slate-700">
                    {index + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-200">{item.question}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 border-t border-slate-900 space-y-3 text-xs leading-relaxed animate-fadeIn">
                  {/* Options if MCQ */}
                  {item.options && (
                    <div className="space-y-2 py-2">
                      {item.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                            opt.id === item.correctAnswer
                              ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold"
                              : "bg-slate-900/50 border-slate-800/80 text-slate-400"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-[10px]">
                            {opt.id.toUpperCase()}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Pairs if Matching */}
                  {item.matchingPairs && (
                    <div className="space-y-1.5 py-2">
                      {item.matchingPairs.map((pair, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center text-slate-300">
                          <span>{pair.left}</span>
                          <span className="text-emerald-400 font-bold">← {pair.right}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explanation Box */}
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1 text-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>خطوات الحل والتعليل النموذجي:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
