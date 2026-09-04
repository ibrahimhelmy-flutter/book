"use client";

import React, { useState } from "react";
import { Lesson } from "@/types";
import {
  HelpCircle,
  BookOpen,
  Cpu,
  Shield,
  Lightbulb,
  CheckSquare,
  Award,
  Sparkles,
  ArrowDown,
  ArrowLeft,
  Play,
  Layers,
  ChevronLeft,
  Compass,
  CheckCircle2,
  FileCheck
} from "lucide-react";

interface PresentationFlowViewProps {
  lesson: Lesson;
  onSelectSlide: (slideIndex: number) => void;
  currentSlideIndex: number;
}

interface FlowNode {
  id: string;
  slideTargetIndex: number;
  stageNumber: number;
  stageName: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    badgeText: string;
    gradient: string;
  };
  details: string[];
}

export function PresentationFlowView({
  lesson,
  onSelectSlide,
  currentSlideIndex,
}: PresentationFlowViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Construct Pedagogical Flow Stages
  const flowStages: FlowNode[] = [
    // 1. Exploration & Key Question
    {
      id: "flow-intro",
      slideTargetIndex: 0,
      stageNumber: 1,
      stageName: "التمهيد والهدف الجوهري",
      title: lesson.keyQuestion,
      description: lesson.coreIdea,
      icon: <Compass className="w-5 h-5" />,
      colorTheme: {
        bg: "bg-blue-950/40 hover:bg-blue-950/70",
        border: "border-blue-500/40",
        text: "text-blue-300",
        badge: "bg-blue-500/20",
        badgeText: "text-blue-300",
        gradient: "from-blue-600 to-indigo-600",
      },
      details: lesson.learningObjectives.map((o, i) => `الهدف ${i + 1}: ${typeof o === "string" ? o : (o as { text: string }).text}`),
    },

    // 2. Sections (Deep Dive)
    ...lesson.sections.map((sec, idx) => ({
      id: `flow-sec-${sec.id}`,
      slideTargetIndex: idx + 1,
      stageNumber: idx + 2,
      stageName: `المحور العلمي (${idx + 1}/${lesson.sections.length})`,
      title: sec.title,
      description: sec.content.slice(0, 140) + "...",
      icon: <Layers className="w-5 h-5" />,
      colorTheme: {
        bg: "bg-indigo-950/40 hover:bg-indigo-950/70",
        border: "border-indigo-500/40",
        text: "text-indigo-300",
        badge: "bg-indigo-500/20",
        badgeText: "text-indigo-300",
        gradient: "from-indigo-600 to-purple-600",
      },
      details: sec.content.split("\n").filter((l) => l.trim().length > 0).slice(0, 4),
    })),

    // 3. Key Concepts
    ...(lesson.keyConcepts && lesson.keyConcepts.length > 0
      ? [
          {
            id: "flow-concepts",
            slideTargetIndex: lesson.sections.length + 1,
            stageNumber: lesson.sections.length + 2,
            stageName: "خريطة المفاهيم",
            title: "خريطة المفاهيم والروابط الهيكلية للدرس",
            description: `يشمل ${lesson.keyConcepts.length} مفاهيم ومصطلحات موزعة على محاور الدرس.`,
            icon: <BookOpen className="w-5 h-5" />,
            colorTheme: {
              bg: "bg-purple-950/40 hover:bg-purple-950/70",
              border: "border-purple-500/40",
              text: "text-purple-300",
              badge: "bg-purple-500/20",
              badgeText: "text-purple-300",
              gradient: "from-purple-600 to-pink-600",
            },
            details: lesson.keyConcepts.map((c) =>
              c.termEn ? `${c.termAr} (${c.termEn})` : c.termAr
            ),
          },
        ]
      : []),

    // 4. Think Like an Engineer
    ...(lesson.engineerChallenge
      ? [
          {
            id: "flow-engineer",
            slideTargetIndex: lesson.sections.length + 2,
            stageNumber: lesson.sections.length + 3,
            stageName: "التطبيق الهندسي والقرار",
            title: lesson.engineerChallenge.title,
            description: lesson.engineerChallenge.scenario,
            icon: <Lightbulb className="w-5 h-5" />,
            colorTheme: {
              bg: "bg-amber-950/40 hover:bg-amber-950/70",
              border: "border-amber-500/40",
              text: "text-amber-300",
              badge: "bg-amber-500/20",
              badgeText: "text-amber-300",
              gradient: "from-amber-600 to-orange-600",
            },
            details: [
              ...lesson.engineerChallenge.steps.map((st) => `خطوة ${st.number} (${st.title}): ${st.description}`),
              ...(lesson.engineerChallenge.hint ? [`💡 توجيه هندسي: ${lesson.engineerChallenge.hint}`] : []),
              ...(lesson.engineerChallenge.modelAnswer ? [`🏆 الإجابة النموذجية والقرار المعتمد: ${lesson.engineerChallenge.modelAnswer}`] : []),
            ],
          },
        ]
      : []),

    // 5. Solved Example
    ...(lesson.solvedExample && lesson.solvedExample.items && lesson.solvedExample.items.length > 0
      ? [
          {
            id: "flow-example",
            slideTargetIndex: lesson.sections.length + 3,
            stageNumber: lesson.sections.length + 4,
            stageName: "النمذجة والحل النموذجي",
            title: "تطبيق محلول خطوة بخطوة",
            description: lesson.solvedExample.items[0]?.question || "مثال تطبيقي يوضح منهجية التفكير",
            icon: <FileCheck className="w-5 h-5" />,
            colorTheme: {
              bg: "bg-teal-950/40 hover:bg-teal-950/70",
              border: "border-teal-500/40",
              text: "text-teal-300",
              badge: "bg-teal-500/20",
              badgeText: "text-teal-300",
              gradient: "from-teal-600 to-emerald-600",
            },
            details: lesson.solvedExample.items.map((item, idx) => [
              `المسألة (${idx + 1}): ${item.question}`,
              `🏆 الإجابة النموذجية المعتمدة: ${typeof item.correctAnswer === "string" ? item.correctAnswer : JSON.stringify(item.correctAnswer)}`,
              `💡 خطوات الحل والتعليل العلمي: ${item.explanation}`,
            ]).flat(),
          },
        ]
      : []),

    // 6. Summary & Takeaways
    {
      id: "flow-summary",
      slideTargetIndex: lesson.sections.length + 4,
      stageNumber: lesson.sections.length + 5,
      stageName: "الخلاصة والتقييم الصفي",
      title: "الخلاصة وبنك التمارين التفاعلية",
      description: `ملخص يثبت المفاهيم الأساسية واختبار لقياس نواتج التعلم المستهدفة.`,
      icon: <Award className="w-5 h-5" />,
      colorTheme: {
        bg: "bg-emerald-950/40 hover:bg-emerald-950/70",
        border: "border-emerald-500/40",
        text: "text-emerald-300",
        badge: "bg-emerald-500/20",
        badgeText: "text-emerald-300",
        gradient: "from-emerald-600 to-teal-600",
      },
      details: lesson.summary,
    },
  ];

  return (
    <div className="p-6 sm:p-8 bg-slate-950 rounded-3xl border border-slate-800 text-white space-y-8 animate-fadeIn" dir="rtl">
      {/* Flow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              طريقة تدفق الأفكار والمخططات 🌊
            </span>
            <span className="text-xs text-slate-400">
              {flowStages.length} محطات تعلم متسلسلة
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            خريطة التدفق التعليمي المترابط: {lesson.title}
          </h3>
        </div>

        <p className="text-xs text-slate-400 max-w-sm">
          💡 انقر على أي محطة للانتقال مباشرة إلى الشريحة التفاعلية الخاصة بها أو مراجعة أفكارها.
        </p>
      </div>

      {/* Vertical Interactive Flow Pipeline */}
      <div className="relative space-y-6 max-w-4xl mx-auto">
        {/* Continuous Connecting Pipeline Line */}
        <div className="absolute top-8 bottom-8 right-6 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 rounded-full hidden sm:block opacity-40" />

        {flowStages.map((stage, idx) => {
          const isSelected = selectedNodeId === stage.id;
          const isCurrentActiveSlide = currentSlideIndex === stage.slideTargetIndex;

          return (
            <div
              key={stage.id}
              className={`relative flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${stage.colorTheme.bg} ${
                isCurrentActiveSlide
                  ? "border-blue-400 shadow-xl shadow-blue-900/30 scale-[1.01]"
                  : `${stage.colorTheme.border} hover:border-slate-600`
              }`}
            >
              {/* Stage Number Node Badge */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stage.colorTheme.gradient} text-white font-bold text-base flex items-center justify-center shrink-0 shadow-lg relative z-10`}
              >
                {stage.icon}
              </div>

              {/* Main Stage Content */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${stage.colorTheme.badge} ${stage.colorTheme.badgeText}`}>
                      المحطة {stage.stageNumber}: {stage.stageName}
                    </span>
                    {isCurrentActiveSlide && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500 text-white animate-pulse">
                        الشريحة المعروضة حالياً ⮜
                      </span>
                    )}
                  </div>

                  {/* Jump to Slide Button */}
                  <button
                    onClick={() => onSelectSlide(stage.slideTargetIndex)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                  >
                    <Play className="w-3 h-3 text-blue-400" />
                    <span>عرض الشريحة</span>
                  </button>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {stage.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {stage.description}
                </p>

                {/* Expandable Bullet Details */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="space-y-1.5">
                    {stage.details.slice(0, 3).map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
