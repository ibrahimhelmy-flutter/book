"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Lesson, KeyConcept } from "@/types";
import {
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  GitBranch,
  BookOpen,
} from "lucide-react";

interface Props {
  lesson: Lesson;
}

export function LessonConceptMap({ lesson }: Props) {
  const [viewMode, setViewMode] = useState<"tree" | "flow">("tree");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Map concepts to their matching sections based on section title & content
  const { sectionMap, unassignedConcepts } = useMemo(() => {
    const map: Record<string, KeyConcept[]> = {};
    const unassigned: KeyConcept[] = [];

    lesson.sections.forEach((sec) => {
      map[sec.id] = [];
    });

    (lesson.keyConcepts || []).forEach((concept) => {
      let matched = false;
      const termArClean = concept.termAr.replace(/[()]/g, "").trim().toLowerCase();
      const termWords = termArClean.split(/\s+/).filter((w) => w.length > 2);
      const termEnClean = (concept.termEn || "").replace(/[()]/g, "").trim().toLowerCase();

      for (const sec of lesson.sections) {
        const text = (sec.title + " " + (sec.content || "")).toLowerCase();
        // Check exact match, partial words match, or english match
        const hasArMatch =
          text.includes(termArClean) ||
          (termWords.length > 0 && termWords.every((w) => text.includes(w)));
        const hasEnMatch = termEnClean && text.includes(termEnClean);

        if (hasArMatch || hasEnMatch) {
          map[sec.id].push(concept);
          matched = true;
          break;
        }
      }

      if (!matched) {
        unassigned.push(concept);
      }
    });

    return { sectionMap: map, unassignedConcepts: unassigned };
  }, [lesson]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden my-8">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-1/4 w-96 h-36 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-36 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitBranch className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              الخريطة التخطيطية للدرس 🗺️
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              رسم هيكلي مبسط
            </span>
          </div>
          <p className="text-xs text-slate-400">
            ترابط بصري يجمع الفكرة الأساسية ومحاور الدرس بمفاهيمها العلمية المعتمدة
          </p>
        </div>

        {/* View Switcher & Glossary Link */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "tree"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>مخطط شجري</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("flow")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "flow"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مسار انسيابي</span>
            </button>
          </div>

          <Link
            href="/glossary"
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
            title="فتح القاموس الشامل للمفاهيم والمصطلحات"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">القاموس</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Root Node: Core Idea */}
      <div className="relative z-10 max-w-2xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-indigo-950/90 via-slate-950 to-purple-950/90 border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-xl text-center space-y-2 relative group hover:border-indigo-400 transition-all">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>الفكرة الأساسية للدرس</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
            {lesson.coreIdea}
          </p>
        </div>

        {/* Central Connecting Branch Line */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500/80 to-slate-700 mx-auto" />
        <div className="w-3 h-3 rounded-full bg-indigo-500 mx-auto -mt-1 ring-4 ring-slate-900" />
      </div>

      {/* VIEW MODE 1: Tree Schematic Grid */}
      {viewMode === "tree" && (
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lesson.sections.map((sec, idx) => {
              const concepts = sectionMap[sec.id] || [];
              const isSelected = selectedSectionId === sec.id;

              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(isSelected ? null : sec.id)}
                  className={`bg-slate-950/80 border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? "border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg bg-slate-900"
                      : "border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/60"
                  }`}
                >
                  {/* Section Title Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                        المحور {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToSection(sec.id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors group-hover:text-white"
                        title="انتقل إلى موضع الشرح في الصفحة"
                      >
                        <span>انتقل للشرح</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </button>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                      {sec.title}
                    </h4>
                  </div>

                  {/* Section Concepts Badges */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>المفاهيم التابعة ({concepts.length}):</span>
                    </div>

                    {concepts.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {concepts.map((concept, cIdx) => (
                          <div
                            key={cIdx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] text-slate-200 hover:border-amber-400/50 hover:bg-slate-800 transition-colors"
                          >
                            <span className="font-bold text-amber-200">{concept.termAr}</span>
                            {concept.termEn && (
                              <span className="text-[10px] text-sky-400 font-mono dir-ltr opacity-80">
                                ({concept.termEn})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        محور تطبيقي وشرح تفصيلي للموضوع.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unassigned / Additional Lesson Concepts if any */}
          {unassignedConcepts.length > 0 && (
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold ml-2">مفاهيم ومصطلحات تكميلية للدرس:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1.5">
                {unassignedConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-medium text-[11px]"
                  >
                    {concept.termAr}
                    {concept.termEn ? ` (${concept.termEn})` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Sequential Flow Timeline */}
      {viewMode === "flow" && (
        <div className="relative z-10 space-y-3">
          <div className="relative border-r-2 border-indigo-500/30 mr-4 pr-6 space-y-6">
            {lesson.sections.map((sec, idx) => {
              const concepts = sectionMap[sec.id] || [];

              return (
                <div key={sec.id} className="relative group">
                  {/* Step Node Marker */}
                  <div className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-950 ring-4 ring-indigo-500/20 group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 hover:border-indigo-500/40 transition-all space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">
                          الخطوة {idx + 1}:
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{sec.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
                      >
                        <span>قراءة الشرح</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </button>
                    </div>

                    {concepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {concepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[11px] font-medium text-amber-200"
                          >
                            {concept.termAr}
                            {concept.termEn && (
                              <span className="text-sky-300 font-mono text-[10px] mr-1">
                                [{concept.termEn}]
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info Box */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            المفاهيم مطابقة لخريطة الدرس في كتاب الوزارة الرسمي، والشروح الكاملة متاحة داخل فقرات الدرس وبالقاموس.
          </span>
        </div>
        <Link
          href="/glossary"
          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-[11px] shrink-0"
        >
          <span>تصفح القاموس الشامل</span>
          <ArrowRight className="w-3 h-3 rotate-180" />
        </Link>
      </div>
    </div>
  );
}
