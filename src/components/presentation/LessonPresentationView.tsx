"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Lesson } from "@/types";
import { SlideAnnotationCanvas } from "./SlideAnnotationCanvas";
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Cpu,
  Target,
  ListOrdered,
  LayoutGrid
} from "lucide-react";
import { formatInlineText } from "../common/EyeComfortText";

interface Props {
  lesson: Lesson;
  onExitPresentation?: () => void;
}

interface SlideItem {
  id: string;
  type: "intro" | "concepts" | "section" | "engineer" | "example" | "summary";
  title: string;
  subtitle?: string;
  bullets: string[];
  image?: {
    src: string;
    caption: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
  badge: string;
}

export function LessonPresentationView({ lesson, onExitPresentation }: Props) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [revealedLineIndex, setRevealedLineIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSlideIndexDrawer, setShowSlideIndexDrawer] = useState<boolean>(false);
  const presentationContainerRef = useRef<HTMLDivElement | null>(null);

  // Build slides array from curriculum lesson data
  const slides: SlideItem[] = useMemo(() => {
    const list: SlideItem[] = [];

    // 1. Intro Slide: Title, Key Question, and Objectives
    list.push({
      id: "slide-intro",
      type: "intro",
      title: `${lesson.number} ${lesson.title}`,
      subtitle: lesson.englishTitle,
      badge: `الفصل ${lesson.chapterNumber}`,
      bullets: [
        `السؤال الجوهري: ${lesson.keyQuestion}`,
        `الفكرة الأساسية: ${lesson.coreIdea}`,
        ...lesson.learningObjectives.map(
          (obj, i) =>
            `الهدف ${i + 1}: ${
              typeof obj === "string" ? obj : (obj as unknown as { text: string }).text
            }`
        ),
      ],
    });

    // 2. Lesson Sections Slides
    lesson.sections.forEach((sec, idx) => {
      const lines = sec.content
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      list.push({
        id: `slide-sec-${sec.id}`,
        type: "section",
        title: sec.title,
        subtitle: `القسم ${idx + 1} من ${lesson.sections.length}`,
        badge: "المحتوى العلمي 💡",
        bullets: lines,
        image: sec.image,
        table: sec.table,
      });
    });

    // 3. Key Concepts Glossary Slide - placed after content sections
    if (lesson.keyConcepts && lesson.keyConcepts.length > 0) {
      list.push({
        id: "slide-concepts",
        type: "concepts",
        title: "المفاهيم والمصطلحات الأساسية للدرس",
        subtitle: "Key Technical Vocabulary",
        badge: "معجم المفاهيم 📖",
        bullets: lesson.keyConcepts.map(
          (c) => `**${c.termAr}** ${c.termEn ? `(${c.termEn})` : ""}: ${c.definition}`
        ),
      });
    }

    // 4. Think Like an Engineer Slide
    if (lesson.engineerChallenge) {
      list.push({
        id: "slide-engineer",
        type: "engineer",
        title: lesson.engineerChallenge.title,
        subtitle: "Engineering Problem Solving & Decisions",
        badge: "فكر كمهندس ⚙️",
        bullets: [
          `السيناريو الواقعي: ${lesson.engineerChallenge.scenario}`,
          ...lesson.engineerChallenge.steps.map(
            (st) => `خطوة ${st.number} (${st.title}): ${st.description}`
          ),
          `توجيه هندسي: ${lesson.engineerChallenge.hint}`,
        ],
      });
    }

    // 5. Solved Example Slide
    if (lesson.solvedExample && lesson.solvedExample.items && lesson.solvedExample.items.length > 0) {
      const ex = lesson.solvedExample.items[0];
      list.push({
        id: "slide-example",
        type: "example",
        title: "تطبيق محلول نموذجي مع خطوات التفكير",
        subtitle: "Model Solved Example",
        badge: "تطبيق عملي 📝",
        bullets: [
          `المسألة / السؤال: ${ex.question}`,
          `الشرح والتفسير العلمي: ${ex.explanation}`,
        ],
      });
    }

    // 6. Summary Slide
    if (lesson.summary && lesson.summary.length > 0) {
      list.push({
        id: "slide-summary",
        type: "summary",
        title: "ملخص الدرس والخلاصة التعليمية",
        subtitle: "Key Takeaways & Summary",
        badge: "الخلاصة 🎯",
        bullets: lesson.summary,
      });
    }

    return list;
  }, [lesson]);

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const totalBullets = currentSlide.bullets.length;

  // Reset line animation index when changing slides
  useEffect(() => {
    setRevealedLineIndex(0);
  }, [currentSlideIndex]);

  // Step-by-step next reveal or advance slide
  const handleNextStep = useCallback(() => {
    if (revealedLineIndex < totalBullets - 1) {
      setRevealedLineIndex((prev) => prev + 1);
    } else if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [revealedLineIndex, totalBullets, currentSlideIndex, slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const handleRevealAllLines = () => {
    setRevealedLineIndex(totalBullets - 1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a text input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft" || e.key === " ") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextStep, handlePrevSlide, isFullscreen]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!presentationContainerRef.current) return;
    if (!document.fullscreenElement) {
      presentationContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div
      ref={presentationContainerRef}
      className={`relative w-full bg-slate-100 flex flex-col font-sans transition-all select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen p-0 m-0 bg-slate-900"
          : "rounded-3xl border border-slate-300 shadow-2xl overflow-hidden my-6 min-h-[680px]"
      }`}
      dir="rtl"
    >
      {/* Executive Clean Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-40">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
            {lesson.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                {currentSlide.badge}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {currentSlide.title}
              </h2>
            </div>
            {currentSlide.subtitle && (
              <p className="text-[11px] text-slate-500 font-mono dir-ltr text-right mt-0.5">
                {currentSlide.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Slide Counter & Header Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Slide Drawer Toggle */}
          <button
            onClick={() => setShowSlideIndexDrawer(!showSlideIndexDrawer)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="فهرس الشرائح"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {currentSlideIndex + 1} / {slides.length}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title={isFullscreen ? "إنهاء ملء الشاشة (Esc)" : "عرض بملء الشاشة"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Presentation */}
          {onExitPresentation && (
            <button
              onClick={onExitPresentation}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              إغلاق ✕
            </button>
          )}
        </div>
      </div>

      {/* Slide Thumbnails Drawer Modal */}
      {showSlideIndexDrawer && (
        <div className="absolute top-14 left-6 z-50 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl w-80 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-900">فهرس شرائح الدرس</span>
            <button
              onClick={() => setShowSlideIndexDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setShowSlideIndexDrawer(false);
                }}
                className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  currentSlideIndex === idx
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="truncate flex-1">
                  <span className="opacity-70 ml-1">{idx + 1}.</span> {s.title}
                </div>
                <span className="text-[10px] opacity-75">{s.badge}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Slide Card Area (Pure Corporate White Aesthetic) */}
      <div className="relative flex-1 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar">
        {/* Permanent, Always-Ready Vector Drawing & Highlighting Canvas */}
        <SlideAnnotationCanvas slideIndex={currentSlideIndex} />

        {/* Slide Content Layout */}
        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6 pb-20">
          {/* Section Diagram Image from PDF if available */}
          {currentSlide.image && (
            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/90 shadow-sm flex flex-col items-center">
              <div className="max-h-72 flex items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200 p-2">
                <img
                  src={currentSlide.image.src}
                  alt={currentSlide.image.caption}
                  className="max-h-64 w-auto object-contain rounded"
                  loading="lazy"
                />
              </div>
              <p className="text-xs font-bold text-blue-900 mt-2 text-center">
                📊 {currentSlide.image.caption}
              </p>
            </div>
          )}

          {/* Table Data Visualization if present */}
          {currentSlide.table && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-right text-xs">
                <thead className="bg-blue-50 text-blue-900 font-bold border-b border-blue-200">
                  <tr>
                    {currentSlide.table.headers.map((h, i) => (
                      <th key={i} className="p-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {currentSlide.table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 leading-relaxed font-medium">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Smooth Line-by-Line Animated Bullet Points */}
          <div className="space-y-3.5">
            {currentSlide.bullets.map((bullet, idx) => {
              const isRevealed = idx <= revealedLineIndex;
              const isLatestRevealed = idx === revealedLineIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-500 ease-out ${
                    isRevealed
                      ? isLatestRevealed
                        ? "bg-blue-50/90 border-blue-300 shadow-md scale-[1.01]"
                        : "bg-slate-50/70 border-slate-200/80 shadow-sm"
                      : "opacity-0 translate-y-3 pointer-events-none"
                  }`}
                >
                  {/* Corporate Blue Dot / Bullet Number */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                      isLatestRevealed
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Bullet Text */}
                  <div className="flex-1 text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    {formatInlineText(bullet, "light")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide Bottom Action Bar */}
        <div className="relative z-20 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white/95">
          {/* Next Step / Reveal Bullet Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105"
            >
              <span>
                {revealedLineIndex < totalBullets - 1
                  ? "السطر التالي ⮞"
                  : currentSlideIndex < slides.length - 1
                  ? "الشريحة التالية ⮞"
                  : "تم إكمال الدرس 🎉"}
              </span>
            </button>

            {revealedLineIndex < totalBullets - 1 && (
              <button
                onClick={handleRevealAllLines}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                كشف كامل النقاط
              </button>
            )}
          </div>

          {/* Slide Switcher Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="الشريحة السابقة (السهم الأيمن)"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابقة</span>
            </button>

            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-40 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="الشريحة التالية (السهم الأيسر / المسافة)"
            >
              <span>التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Corporate Blue Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 z-20">
        <div
          className="bg-blue-600 h-full transition-all duration-300 shadow-sm"
          style={{
            width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
