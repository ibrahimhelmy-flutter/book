"use client";

import React, { useState, useMemo } from "react";
import { Lesson } from "@/types";
import {
  Sparkles,
  Layers,
  Zap,
  Cpu,
  Globe,
  Palette,
  Send,
  RefreshCw,
  Workflow,
  BookOpenCheck,
} from "lucide-react";

interface AIPresentationAssistantProps {
  lesson: Lesson;
  currentSlideTitle: string;
  currentSlideBullets: string[];
  currentSlideBadge: string;
  currentSlideIndex: number;
  onAddCustomSlide?: (slideData: {
    title: string;
    badge: string;
    bullets: string[];
    diagramType?: string;
  }) => void;
  onClose: () => void;
}

export function AIPresentationAssistant({
  lesson,
  currentSlideTitle,
  onAddCustomSlide,
  onClose,
}: AIPresentationAssistantProps) {
  const [activeMode, setActiveMode] = useState<"diagrams" | "custom_prompt">("diagrams");

  // --- AI DIAGRAM & VISUALIZER STATE ---
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGeneratingCustomDiagram, setIsGeneratingCustomDiagram] = useState<boolean>(false);
  const [generatedCustomDiagram, setGeneratedCustomDiagram] = useState<{
    title: string;
    nodes: { id: string; label: string; desc: string; icon: string; color: string }[];
    connections: { from: string; to: string; label: string }[];
  } | null>(null);

  // Dynamic suggestion prompts based on the current lesson
  const suggestionPrompts = useMemo(() => {
    const fromSlide = currentSlideTitle ? [`توضيح بصري معمق لـ: ${currentSlideTitle}`] : [];
    const fromConcepts = (lesson.keyConcepts || []).map((c) => `اشرح معمارية: ${c.termAr}`);
    const fromSections = (lesson.sections || []).map((s) => `مخطط تدفق لمفهوم: ${s.title}`);
    const defaultList = [
      "مخطط هرمي للعلاقة بين مفاهيم الدرس",
      "خريطة ذهنية لخطوات الحل الهندسي",
      "مقارنة بصرية بين البدائل والخيارات التقنية",
      "دورة حياة معالجة البيانات وتدفق العمليات",
    ];
    return Array.from(new Set([...fromSlide, ...fromConcepts, ...fromSections, ...defaultList])).slice(0, 4);
  }, [lesson, currentSlideTitle]);

  // Handle custom generative diagram
  const handleGenerateCustomDiagram = () => {
    if (!customPrompt.trim()) return;
    setIsGeneratingCustomDiagram(true);

    setTimeout(() => {
      const p = customPrompt.trim();
      const nodes = [
        {
          id: "1",
          label: "مرحلة الإدخال وتجميع البيانات",
          desc: `استقبال المتغيرات والمدخلات التقنية المحددة لـ (${p.slice(0, 30)}).`,
          icon: "📥",
          color: "from-blue-600 to-cyan-600",
        },
        {
          id: "2",
          label: "المعالجة وتطبيق الخوارزميات",
          desc: "تنفيذ منطق المعالجة واستخراج الأنماط وفق المعايير القياسية المعتمدة.",
          icon: "⚙️",
          color: "from-indigo-600 to-purple-600",
        },
        {
          id: "3",
          label: "التحقق وتأكيد الأمان",
          desc: "فحص مخرجات المعالجة والتأكد من مطابقتها لضوابط الموثوقية.",
          icon: "🛡️",
          color: "from-amber-600 to-orange-600",
        },
        {
          id: "4",
          label: "المخرجات والتطبيق النهائي",
          desc: "تقديم القرارات والتنبؤات النهائية في بيئة التشغيل المستهدفة.",
          icon: "🚀",
          color: "from-emerald-600 to-teal-600",
        },
      ];

      const connections = [
        { from: "1", to: "2", label: "تمرير البيانات المهيكلة" },
        { from: "2", to: "3", label: "نتائج التحليل الأولي" },
        { from: "3", to: "4", label: "اعتماد القرار النهائي" },
      ];

      setGeneratedCustomDiagram({
        title: `مخطط المعمارية البصرية: ${p}`,
        nodes,
        connections,
      });

      setIsGeneratingCustomDiagram(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ذكاء اصطناعي تفاعلي 🤖
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  مساعد المعلم الذكي: المخططات البصرية والتحليل المفاهيمي
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد فوري مرتبط ببيانات الدرس: <span className="text-slate-200 font-semibold">{lesson.number} - {lesson.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveMode("diagrams")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "diagrams"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المخططات والمفاهيم البصرية للدرس 📊</span>
          </button>

          <button
            onClick={() => setActiveMode("custom_prompt")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "custom_prompt"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>توليد مخطط حر بالبرومبت ✨</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* 1. DIAGRAMS & CONCEPTS VISUALIZER DYNAMICALLY GENERATED FROM LESSON DATA */}
          {activeMode === "diagrams" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Key Concepts Architectural Breakdown */}
                {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        مصفوفة المفاهيم الأساسية
                      </span>
                      <Cpu className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      المفاهيم والمصطلحات المركزية ({lesson.keyConcepts.length} مفاهيم)
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                      {lesson.keyConcepts.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-1.5"
                        >
                          <span className="font-bold text-white">{c.termAr}</span>
                          {c.termEn && <span className="text-[10px] text-sky-300 font-mono">({c.termEn})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Think Like an Engineer Decision Flow */}
                {lesson.engineerChallenge && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        دورة الحل الهندسي
                      </span>
                      <Workflow className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {lesson.engineerChallenge.title}
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                      {lesson.engineerChallenge.steps.map((st, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="w-5 h-5 rounded bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {st.number}
                          </span>
                          <div>
                            <strong className="text-emerald-300 block text-[11px]">{st.title}</strong>
                            <span className="text-[11px] text-slate-400 leading-relaxed">{st.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {lesson.engineerChallenge.modelAnswer && (
                      <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 space-y-1.5 text-xs text-slate-200">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>الإجابة والقرار النموذجي المعتمد:</span>
                        </div>
                        <div className="text-[11px] leading-relaxed text-slate-300 space-y-1">
                          {lesson.engineerChallenge.modelAnswer.split("\n").map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Solved Examples Model Answers in Study Guide */}
                {lesson.solvedExample && lesson.solvedExample.items && lesson.solvedExample.items.length > 0 && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-teal-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        سلم الحلول النموذجية
                      </span>
                      <BookOpenCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {lesson.solvedExample.title} ({lesson.solvedExample.items.length} تمارين)
                    </h4>
                    <div className="space-y-2 text-xs">
                      {lesson.solvedExample.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                          <strong className="text-slate-200 block text-[11px]">
                            {idx + 1}. {item.question}
                          </strong>
                          <div className="p-2.5 bg-teal-950/40 rounded-lg border border-teal-500/20 text-teal-200 text-[11px] space-y-1">
                            <span className="font-bold block text-teal-300">
                              🏆 الإجابة النموذجية: {typeof item.correctAnswer === "string" ? item.correctAnswer.toUpperCase() : JSON.stringify(item.correctAnswer)}
                            </span>
                            <span className="text-slate-300 block leading-relaxed">{item.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Section Tables or Process Pipeline */}
                {lesson.sections && lesson.sections.length > 0 && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        المحاور العلمية المتسلسلة
                      </span>
                      <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      خريطة التدفق العلمي للدرس ({lesson.sections.length} محاور)
                    </h4>
                    <div className="flex flex-col gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
                      {lesson.sections.map((sec, sIdx) => (
                        <div
                          key={sec.id}
                          className="p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-200 flex items-center justify-center font-bold text-[10px]">
                              {sIdx + 1}
                            </span>
                            <span className="font-bold text-white">{sec.title}</span>
                          </div>
                          {sec.table && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              جدول مقارنة 📊
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Pedagogical Learning Path Journey */}
                {lesson.learningPath && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-pink-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        المسار التعليمي والربط
                      </span>
                      <Palette className="w-4 h-4 text-pink-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      الفكرة الجوهرية ومسار التدرج المعرفي
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-sky-300">
                        <strong>🎯 الفكرة المحورية: </strong>
                        <span className="text-slate-300">{lesson.coreIdea}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300">
                        <strong>❓ السؤال الجوهري: </strong>
                        <span className="text-slate-300">{lesson.keyQuestion}</span>
                      </div>
                      {lesson.learningPath.next && (
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-amber-300">
                          <strong>🚀 الامتداد للدرس التالي: </strong>
                          <span className="text-slate-300">{lesson.learningPath.next}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. CUSTOM PROMPT GENERATIVE DIAGRAM */}
          {activeMode === "custom_prompt" && (
            <div className="space-y-6">
              {/* Input Prompt Box */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  اكتب أي مفهوم أو معمارية برمجية في المنهج لتوليد مخطط تدفق بصري لها:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGenerateCustomDiagram();
                    }}
                    placeholder={`مثال: ${suggestionPrompts[0] || "كيف تعمل المعالجة الطرفية في الذكاء الاصطناعي؟"}`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleGenerateCustomDiagram}
                    disabled={isGeneratingCustomDiagram || !customPrompt.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    {isGeneratingCustomDiagram ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>توليد المخطط</span>
                  </button>
                </div>

                {/* Ready-made Suggestions from Current Lesson */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">اقتراحات مستوحاة من الدرس:</span>
                  {suggestionPrompts.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomPrompt(sug);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Diagram View */}
              {generatedCustomDiagram && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{generatedCustomDiagram.title}</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      {onAddCustomSlide && (
                        <button
                          type="button"
                          onClick={() => {
                            onAddCustomSlide({
                              title: generatedCustomDiagram.title,
                              badge: "مخطط الذكاء الاصطناعي التفاعلي",
                              bullets: generatedCustomDiagram.nodes.map((n) => `${n.label}: ${n.desc}`),
                            });
                            onClose();
                          }}
                          className="text-xs px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md"
                        >
                          إضافة كشريحة تفاعلية ➕
                        </button>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        مخطط تدفق مفاهيمي متقدم
                      </span>
                    </div>
                  </div>

                  {/* Flow Nodes Pipeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                    {generatedCustomDiagram.nodes.map((node, idx) => (
                      <div
                        key={node.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:scale-[1.02] transition-transform relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center text-sm shadow-md`}>
                            {node.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            مرحلة {idx + 1}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-snug">
                          {node.label}
                        </h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {node.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Connection Summary */}
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <strong className="text-indigo-400 block mb-1">مسار نقل البيانات والأثر العلمي:</strong>
                    <div className="space-y-1.5">
                      {generatedCustomDiagram.connections.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-white">من خطوة {c.from} إلى {c.to}:</span>
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>🧠 متصل بقاعدة بيانات المنهج المركزي لتقديم تجربة تدريس تفاعلية وموثوقة</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
          >
            إغلاق المساعد
          </button>
        </div>
      </div>
    </div>
  );
}
