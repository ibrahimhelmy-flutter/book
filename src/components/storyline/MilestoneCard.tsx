"use client";

import React, { useState } from "react";
import { StoryMilestone } from "@/types/storyline";
import { StorylineDiagram } from "./StorylineDiagram";
import {
  AlertCircle,
  Lightbulb,
  BookOpen,
  ArrowDownCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  Check,
} from "lucide-react";

interface Props {
  milestone: StoryMilestone;
  isLast: boolean;
}

export function MilestoneCard({ milestone, isLast }: Props) {
  const [isConceptExpanded, setIsConceptExpanded] = useState<boolean>(true);

  return (
    <div
      id={milestone.id}
      className="relative pl-0 sm:pr-12 md:pr-14 transition-all duration-300 scroll-mt-24"
    >
      {/* Timeline Node on Spine (Visible on larger screens) */}
      <div className="hidden sm:flex absolute right-0 top-6 w-9 h-9 rounded-full bg-slate-900 border-2 border-indigo-500 items-center justify-center text-xs font-black text-indigo-300 shadow-lg shadow-indigo-950/60 z-10">
        {milestone.stageNumber}
      </div>

      {/* Main Milestone Card */}
      <article className="rounded-2xl border border-slate-800/90 bg-slate-900/75 backdrop-blur-md p-5 sm:p-7 shadow-xl hover:border-slate-700/80 transition-all text-right space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="sm:hidden px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/30">
              {milestone.stageNumber}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-indigo-300 text-xs font-bold border border-slate-700">
              {milestone.badge}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            <span>تسلسل تفكير واقعي</span>
          </div>
        </div>

        {/* Milestone Title */}
        <h2 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
          {milestone.title}
        </h2>

        {/* Crisis Section (🔴 المعضلة الواقعية) */}
        <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>المعضلة الواقعية: {milestone.crisis.title}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {milestone.crisis.description}
          </p>
          {milestone.crisis.realWorldScenario && (
            <div className="p-3 rounded-lg bg-slate-950/70 border border-rose-500/20 text-xs text-rose-200/90 leading-relaxed">
              💡 <strong>تشبيه من واقع الحياة:</strong> {milestone.crisis.realWorldScenario}
            </div>
          )}
        </div>

        {/* Breakthrough Section (💡 شرارة الفكرة والحل الهندسي) */}
        <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <span>شرارة الحل الهندسي: {milestone.breakthrough.title}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
            {milestone.breakthrough.description}
          </p>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>المنطق الهندسي الذكي:</strong> {milestone.breakthrough.logicalInsight}
            </div>
          </div>
        </div>

        {/* Visual Diagram */}
        <StorylineDiagram
          type={milestone.diagramType}
          caption={milestone.diagramCaption}
        />

        {/* Official Curriculum Concept Spotlight (📘 مصطلح وتعريف المنهج) */}
        <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/40 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-sm">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>المصطلح الرسمي في المنهج المقرر</span>
            </div>
            {milestone.concept.officialPage && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                ص {milestone.concept.officialPage} بالكتاب
              </span>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/90 border border-indigo-500/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-black text-white">
                {milestone.concept.termAr}
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-800">
                {milestone.concept.termEn}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {milestone.concept.definition}
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-emerald-300 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{milestone.concept.howItWorks}</span>
            </div>
          </div>
        </div>

        {/* Next Dilemma Transition Hook (⚠️ المأزق التالي) */}
        {!isLast && (
          <div className="rounded-xl bg-slate-950/90 border border-dashed border-slate-700/80 p-4 text-right space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <ArrowDownCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
                {milestone.nextDilemma.title}
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">الخطوة القادمة ↓</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {milestone.nextDilemma.hook}
            </p>
          </div>
        )}
      </article>

      {/* Spine Connector Segment between cards */}
      {!isLast && (
        <div className="hidden sm:block absolute right-[17px] bottom-[-24px] w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-indigo-500/30" />
      )}
    </div>
  );
}
