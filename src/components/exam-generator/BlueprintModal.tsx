"use client";

import React from "react";
import { ExamBlueprint } from "@/lib/exam-generator/types";
import { X, Layers, Brain, CheckCircle2, Clock, Award, BarChart3 } from "lucide-react";

interface BlueprintModalProps {
  blueprint: ExamBlueprint;
  isOpen: boolean;
  onClose: () => void;
}

export function BlueprintModal({ blueprint, isOpen, onClose }: BlueprintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar box-border">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                جدول المواصفات والوزن النسبي الوزاري
              </h3>
              <p className="text-xs text-slate-400 font-mono">{blueprint.scopeLabel}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">إجمالي الأسئلة</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
              {blueprint.totalQuestions}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">الدرجة الكلية</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {blueprint.totalMarks}
            </span>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">الزمن المقدر</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {blueprint.durationMinutes} د
            </span>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">الدروس المغطاة</span>
            <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
              {blueprint.lessonWeights.length}
            </span>
          </div>
        </div>

        {/* 1. Cognitive Level Matrix */}
        <div className="space-y-3 bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Brain className="w-4 h-4" />
            <span>توزيع نواتج التعلم والمستويات المعرفية (Cognitive Levels):</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(blueprint.cognitiveDistribution).map(([levelKey, val]) => {
              const labelMap: Record<string, string> = {
                recall: "المستوى 1: التذكر والاسترجاع المباشر",
                understanding: "المستوى 2: الفهم والاستيعاب والتعليل",
                application: "المستوى 3: التطبيق في مواقف وسيناريوهات",
                analysis: "المستوى 4: التحليل والمقارنة والتصنيف",
                higher_order: "المستوى 5: التفكير العليا والربط التكاملي",
              };

              const colorMap: Record<string, string> = {
                recall: "bg-blue-500",
                understanding: "bg-emerald-500",
                application: "bg-amber-500",
                analysis: "bg-purple-500",
                higher_order: "bg-rose-500",
              };

              return (
                <div key={levelKey} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{labelMap[levelKey] || levelKey}</span>
                    <span className="font-mono text-slate-400">
                      {val.count} سؤالاً ({val.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full ${colorMap[levelKey] || "bg-indigo-500"}`}
                      style={{ width: `${Math.min(100, Math.max(5, val.percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Lessons Proportional Weights */}
        <div className="space-y-3 bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Layers className="w-4 h-4" />
            <span>الأوزان النسبية للدروس المختارة في الامتحان:</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {blueprint.lessonWeights.map((lw) => (
              <div
                key={lw.lessonId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 shrink-0">
                    {lw.lessonNumber}
                  </span>
                  <span className="text-slate-200 truncate">{lw.lessonTitle}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-slate-400">
                  <span>{lw.questionCount} أسئلة</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">
                    {lw.weightPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق جدول المواصفات
          </button>
        </div>
      </div>
    </div>
  );
}
