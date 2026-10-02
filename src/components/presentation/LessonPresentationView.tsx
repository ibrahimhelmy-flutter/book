"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Lesson, LessonSection, KeyConcept } from "@/types";
import { SlideAnnotationCanvas, DrawToolType } from "./SlideAnnotationCanvas";
import { formatInlineText } from "../common/EyeComfortText";
import { getAssetPath } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  X,
  LayoutGrid,
  HelpCircle,
  Lightbulb,
  Target,
  BookOpen,
  Sparkles,
  Pen,
  Eraser,
  MousePointer2,
  Trash2,
  Volume2,
  CheckCircle2,
  Image as ImageIcon,
  Table as TableIcon,
  Layers,
  Search,
  ZoomIn,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * SlideItem interface maintained for backward compatibility with external views
 */
export interface SlideItem {
  id: string;
  type: "intro" | "section" | "concepts" | "engineer" | "example" | "summary" | "callout" | "applied_task";
  title: string;
  subtitle?: string;
  badge: string;
  bullets: string[];
  image?: { src: string; caption: string; alt?: string };
  table?: { headers: string[]; rows: string[][] };
  sectionIndex?: number;
  stageIndex?: number;
  customData?: Record<string, unknown>;
}

interface Props {
  lesson: Lesson;
  onExitPresentation?: () => void;
}

export interface ParsedSection {
  id: string;
  title: string;
  index: number;
  conceptIntro: string;
  detailedPoints: string[];
  image?: { src: string; caption: string; alt?: string };
  table?: { headers: string[]; rows: string[][] };
  keyConcepts: KeyConcept[];
}

export type SectionStepItem =
  | { id: string; type: "detailed_point"; index: number; label: string }
  | { id: string; type: "image"; label: string }
  | { id: string; type: "table_row"; index: number; label: string }
  | { id: string; type: "key_concepts"; label: string };

/**
 * Helper to speak Arabic/English text using Web Speech API
 */
function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_()]/g, "").trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = /^[A-Za-z0-9\s.,!?-]+$/.test(cleanText) ? "en-US" : "ar-SA";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis failures
  }
}

/**
 * Parses a textbook section into concept intro, detailed points, and visual artifacts
 */
function parseSectionStoryline(sec: LessonSection, secIndex: number, allConcepts: KeyConcept[] = []): ParsedSection {
  const rawLines = sec.content.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let conceptIntro = rawLines[0] || "";
  const detailedPoints = rawLines.slice(1);

  if (sec.subsections && sec.subsections.length > 0) {
    sec.subsections.forEach((sub) => detailedPoints.push(`**${sub.title}:** ${sub.content}`));
  }

  if (detailedPoints.length === 0 && conceptIntro.length > 120) {
    const sentences = conceptIntro.split(/(?<=[.؛])\s+/);
    if (sentences.length > 1) {
      conceptIntro = sentences[0];
      detailedPoints.push(...sentences.slice(1));
    }
  }

  const titleLower = sec.title.toLowerCase();
  const contentLower = sec.content.toLowerCase();
  const keyConcepts = allConcepts.filter((c) => {
    const ar = c.termAr.toLowerCase();
    const en = (c.termEn || "").toLowerCase();
    return titleLower.includes(ar) || contentLower.includes(ar) || (en.length > 3 && (titleLower.includes(en) || contentLower.includes(en)));
  });

  return { id: sec.id, title: sec.title, index: secIndex, conceptIntro, detailedPoints, image: sec.image, table: sec.table, keyConcepts };
}

export function LessonPresentationView({ lesson, onExitPresentation }: Props) {
  // Navigation State (Slide 0: Cover, Slide 1..N: Official Section Slides)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [revealedIntroStep, setRevealedIntroStep] = useState<number>(0);
  const [revealedSectionStep, setRevealedSectionStep] = useState<number>(0);
  const [isAllRevealed, setIsAllRevealed] = useState<boolean>(false);

  // UI Modes & Modals
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSlideDrawer, setShowSlideDrawer] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zoomedImage, setZoomedImage] = useState<{ src: string; caption: string } | null>(null);
  const [isImageMinimized, setIsImageMinimized] = useState<boolean>(false);

  // Drawing Tools State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [activeDrawTool, setActiveDrawTool] = useState<DrawToolType>("pointer");
  const [drawColor, setDrawColor] = useState<string>("#3b82f6");
  const [drawSize] = useState<number>(3.5);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stepperRef = useRef<HTMLDivElement | null>(null);
  const clearCanvasRef = useRef<(() => void) | null>(null);
  const undoCanvasRef = useRef<(() => void) | null>(null);

  // Parse sections according to Storyline
  const parsedSections = useMemo<ParsedSection[]>(
    () => (lesson.sections || []).map((sec, idx) => parseSectionStoryline(sec, idx, lesson.keyConcepts || [])),
    [lesson.sections, lesson.keyConcepts]
  );

  // Stations for Storyline Stepper
  const stations = useMemo(() => {
    const list = [{ index: 0, id: "station-intro", number: "01", label: "تمهيد الدرس", badge: "الغلاف والأساسيات" }];
    parsedSections.forEach((sec, idx) => {
      const numStr = (idx + 2).toString().padStart(2, "0");
      list.push({ index: idx + 1, id: `station-sec-${sec.id}`, number: numStr, label: sec.title.replace(/^\d+[\s.-]*/, ""), badge: `المحور ${idx + 1}` });
    });
    return list;
  }, [parsedSections]);

  const totalStations = stations.length;
  const currentSection = currentSlideIndex > 0 ? parsedSections[currentSlideIndex - 1] : null;

  // Ordered progressive reveal steps for current section
  const sectionSteps = useMemo<SectionStepItem[]>(() => {
    if (!currentSection) return [];
    const steps: SectionStepItem[] = [];

    // 1. Detailed explanation points
    currentSection.detailedPoints.forEach((_, idx) => {
      steps.push({
        id: `pt-${idx}`,
        type: "detailed_point",
        index: idx,
        label: `نقطة ${idx + 1}`,
      });
    });

    // 2. Visual Diagram Image (if present)
    if (currentSection.image) {
      steps.push({
        id: "sec-image",
        type: "image",
        label: "المخطط البياني",
      });
    }

    // 3. Official Table Rows (if present)
    if (currentSection.table && currentSection.table.rows.length > 0) {
      currentSection.table.rows.forEach((_, rIdx) => {
        steps.push({
          id: `tbl-row-${rIdx}`,
          type: "table_row",
          index: rIdx,
          label: `الجدول: صف ${rIdx + 1}`,
        });
      });
    }

    // 4. Linked Key Concepts (if present)
    if (currentSection.keyConcepts.length > 0) {
      steps.push({
        id: "sec-concepts",
        type: "key_concepts",
        label: "المفاهيم المرتبطة",
      });
    }

    return steps;
  }, [currentSection]);

  const isPointRevealed = useCallback((pIdx: number) => {
    if (isAllRevealed) return true;
    const stepIdx = sectionSteps.findIndex((s) => s.type === "detailed_point" && s.index === pIdx);
    return stepIdx !== -1 && stepIdx < revealedSectionStep;
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const isPointCurrent = useCallback((pIdx: number) => {
    if (isAllRevealed) return false;
    const activeStep = sectionSteps[revealedSectionStep - 1];
    return activeStep?.type === "detailed_point" && activeStep?.index === pIdx;
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const isImageRevealed = useMemo(() => {
    if (isAllRevealed) return true;
    const stepIdx = sectionSteps.findIndex((s) => s.type === "image");
    return stepIdx !== -1 && stepIdx < revealedSectionStep;
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const isImageCurrent = useMemo(() => {
    if (isAllRevealed) return false;
    const activeStep = sectionSteps[revealedSectionStep - 1];
    return activeStep?.type === "image";
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const isTableRowRevealed = useCallback((rIdx: number) => {
    if (isAllRevealed) return true;
    const stepIdx = sectionSteps.findIndex((s) => s.type === "table_row" && s.index === rIdx);
    return stepIdx !== -1 && stepIdx < revealedSectionStep;
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const isTableRowCurrent = useCallback((rIdx: number) => {
    if (isAllRevealed) return false;
    const activeStep = sectionSteps[revealedSectionStep - 1];
    return activeStep?.type === "table_row" && activeStep?.index === rIdx;
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const areConceptsRevealed = useMemo(() => {
    if (isAllRevealed) return true;
    const stepIdx = sectionSteps.findIndex((s) => s.type === "key_concepts");
    return stepIdx !== -1 && stepIdx < revealedSectionStep;
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const isConceptsCurrent = useMemo(() => {
    if (isAllRevealed) return false;
    const activeStep = sectionSteps[revealedSectionStep - 1];
    return activeStep?.type === "key_concepts";
  }, [isAllRevealed, sectionSteps, revealedSectionStep]);

  const revealImageNow = useCallback(() => {
    const imgStepIdx = sectionSteps.findIndex((s) => s.type === "image");
    if (imgStepIdx !== -1) {
      setRevealedSectionStep((prev) => Math.max(prev, imgStepIdx + 1));
    }
  }, [sectionSteps]);

  const revealUpToTableRow = useCallback((rIdx: number) => {
    const stepIdx = sectionSteps.findIndex((s) => s.type === "table_row" && s.index === rIdx);
    if (stepIdx !== -1) {
      setRevealedSectionStep((prev) => Math.max(prev, stepIdx + 1));
    }
  }, [sectionSteps]);

  const revealAllTableRows = useCallback(() => {
    const lastTableStepIdx = sectionSteps.reduce((acc, s, idx) => (s.type === "table_row" ? idx : acc), -1);
    if (lastTableStepIdx !== -1) {
      setRevealedSectionStep((prev) => Math.max(prev, lastTableStepIdx + 1));
    }
  }, [sectionSteps]);

  useEffect(() => {
    setRevealedIntroStep(0);
    setRevealedSectionStep(0);
    setIsAllRevealed(false);
    setIsImageMinimized(false);
  }, [currentSlideIndex]);

  useEffect(() => {
    if (!stepperRef.current) return;
    const activeEl = stepperRef.current.querySelector<HTMLElement>("[data-active='true']");
    if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentSlideIndex]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  const goToStation = useCallback((slideIdx: number) => {
    setCurrentSlideIndex(Math.max(0, Math.min(slideIdx, totalStations - 1)));
    setRevealedSectionStep(0);
    setIsAllRevealed(false);
    setShowSlideDrawer(false);
  }, [totalStations]);

  const handleNext = useCallback(() => {
    // 1. Slide 0 (Intro)
    if (currentSlideIndex === 0) {
      const maxIntroSteps = (lesson.learningObjectives?.length || 0) + 1;
      if (!isAllRevealed && revealedIntroStep < maxIntroSteps) {
        setRevealedIntroStep((prev) => prev + 1);
        return;
      }
      if (totalStations > 1) goToStation(1);
      return;
    }

    // 2. Section Slide
    if (currentSection) {
      const maxSteps = sectionSteps.length;
      if (!isAllRevealed && revealedSectionStep < maxSteps) {
        setRevealedSectionStep((prev) => prev + 1);
        return;
      }
      if (currentSlideIndex < totalStations - 1) {
        goToStation(currentSlideIndex + 1);
      }
    }
  }, [currentSlideIndex, isAllRevealed, revealedIntroStep, revealedSectionStep, lesson.learningObjectives, totalStations, currentSection, sectionSteps.length, goToStation]);

  const handlePrev = useCallback(() => {
    // 1. Slide 0 (Intro)
    if (currentSlideIndex === 0) {
      if (revealedIntroStep > 0 && !isAllRevealed) {
        setRevealedIntroStep((prev) => prev - 1);
      }
      return;
    }

    // 2. Section Slide
    if (currentSection) {
      if (revealedSectionStep > 0 && !isAllRevealed) {
        setRevealedSectionStep((prev) => prev - 1);
        return;
      }
      if (currentSlideIndex > 0) {
        goToStation(currentSlideIndex - 1);
      }
    }
  }, [currentSlideIndex, isAllRevealed, revealedIntroStep, revealedSectionStep, currentSection, goToStation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowRight" || e.key === "Backspace" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToStation(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToStation(totalStations - 1);
      } else if (e.key === "Escape") {
        if (zoomedImage) setZoomedImage(null);
        else if (showSlideDrawer) setShowSlideDrawer(false);
        else if (onExitPresentation) onExitPresentation();
      } else if (e.key.toLowerCase() === "f") toggleFullscreen();
      else if (e.key.toLowerCase() === "t") setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      else if (e.key.toLowerCase() === "r") setIsAllRevealed((prev) => !prev);
      else if (e.key.toLowerCase() === "d") setIsDrawingMode((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, goToStation, totalStations, zoomedImage, showSlideDrawer, onExitPresentation, toggleFullscreen]);

  const themeClasses = useMemo(() => {
    const isDark = theme === "dark";
    return {
      root: isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
      topBar: isDark ? "bg-slate-900/95 border-slate-800 text-white shadow-2xl shadow-black/50" : "bg-white/95 border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50",
      card: isDark ? "bg-slate-900/80 border-slate-800 text-slate-100 shadow-xl" : "bg-white border-slate-200 text-slate-900 shadow-lg shadow-slate-100",
      cardHighlight: isDark ? "bg-indigo-950/40 border-indigo-500/50 text-white shadow-xl shadow-indigo-950/20" : "bg-blue-50/70 border-blue-200 text-blue-950 shadow-md",
      textSubtle: isDark ? "text-slate-400" : "text-slate-500",
      pillInactive: isDark ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950",
      btnSecondary: isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      tableHeader: isDark ? "bg-slate-900 text-indigo-300 border-slate-800" : "bg-blue-50 text-blue-900 border-blue-200",
      tableRow: isDark ? "border-slate-800/80 hover:bg-slate-900/40" : "border-slate-200 hover:bg-slate-50",
      tooltip: isDark ? "bg-slate-900/95 border-indigo-500/50 text-white shadow-2xl shadow-black/80" : "bg-white/95 border-indigo-200 text-slate-900 shadow-2xl shadow-indigo-500/15",
      floatingPill: isDark ? "bg-slate-900/95 border-slate-700/80 text-white shadow-2xl shadow-black/80" : "bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-900/15",
    };
  }, [theme]);

  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    const q = searchQuery.toLowerCase();
    return stations.filter((s) => s.label.toLowerCase().includes(q) || s.badge.toLowerCase().includes(q) || s.number.includes(q));
  }, [stations, searchQuery]);

  return (
    <div ref={containerRef} className={`fixed inset-0 z-50 h-screen w-screen flex flex-col font-sans select-none overflow-hidden ${themeClasses.root}`} dir="rtl">
      {/* 1. TOP STORYLINE STEPPER */}
      <header className={`shrink-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${themeClasses.topBar}`}>
        <div className="h-1 w-full bg-slate-200/40 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${((currentSlideIndex + 1) / totalStations) * 100}%` }}
          />
        </div>

        <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>الدرس {lesson.number}</span>
            </div>

            {/* Storyline Stepper Ribbon */}
            <div ref={stepperRef} className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-full">
              {stations.map((st, idx) => {
                const isActive = st.index === currentSlideIndex;
                const isPast = st.index < currentSlideIndex;
                return (
                  <React.Fragment key={st.id}>
                    {idx > 0 && (
                      <span className={`shrink-0 text-xs font-black transition-colors ${isPast ? "text-blue-500 dark:text-blue-400" : themeClasses.textSubtle}`}>
                        ──▶
                      </span>
                    )}
                    <button
                      type="button"
                      data-active={isActive}
                      onClick={() => goToStation(st.index)}
                      className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/40 scale-[1.02]"
                          : isPast
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20"
                          : themeClasses.pillInactive
                      }`}
                      title={`${st.number} ${st.label}`}
                    >
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[11px] font-black shrink-0 ${
                        isActive ? "bg-white text-blue-700 shadow-xs" : isPast ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                        {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.number}
                      </span>
                      <span className="truncate max-w-[130px] sm:max-w-[200px] text-right">{st.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSlideDrawer(true)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
              title="فهرس محطات الدرس"
            >
              <LayoutGrid className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">{currentSlideIndex + 1}/{totalStations}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDrawingMode((prev) => !prev);
                if (!isDrawingMode && activeDrawTool === "pointer") setActiveDrawTool("pen");
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${isDrawingMode ? "bg-blue-600 text-white border-blue-500 shadow-md" : themeClasses.btnSecondary}`}
              title={isDrawingMode ? "إغلاق لوحة الرسم" : "تفعيل قلم التعليق (D)"}
            >
              <Pen className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
              title="تبديل المظهر النهاري/الليلي (T)"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
              title="ملء الشاشة (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {onExitPresentation && (
              <button
                type="button"
                onClick={onExitPresentation}
                className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                title="إنهاء العرض (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN SLIDE VIEWPORT (WIDESCREEN LAPTOP OPTIMIZED) */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-7 pb-20 sm:pb-24 flex flex-col justify-center items-center">
        {isDrawingMode && (
          <div className="absolute inset-0 z-30 pointer-events-auto">
            <SlideAnnotationCanvas
              slideIndex={currentSlideIndex}
              activeTool={activeDrawTool}
              color={drawColor}
              size={drawSize}
              clearRef={clearCanvasRef}
              undoRef={undoCanvasRef}
            />
          </div>
        )}

        <div className="w-full max-w-[96vw] xl:max-w-[1550px] mx-auto my-auto relative z-10 animate-fadeIn">
          {/* SLIDE 0: COVER & TEXTBOOK SCOPE */}
          {currentSlideIndex === 0 && (
            <div className="space-y-6 sm:space-y-7">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>الفصل {lesson.chapterNumber} — الدرس الرسمي في الكتاب المدرسي</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  {lesson.number} {lesson.title}
                </h1>
                {lesson.englishTitle && (
                  <p className="text-sm sm:text-base font-mono text-slate-500 dark:text-slate-400 dir-ltr">
                    {lesson.englishTitle}
                  </p>
                )}
              </div>

              {/* Key Question & Core Idea (Side-by-side Widescreen) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between ${themeClasses.cardHighlight} ${revealedIntroStep >= 0 ? "opacity-100" : "opacity-40"}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-600 text-white shadow-xs">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>السؤال الجوهري المحفّز</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(lesson.keyQuestion)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
                        title="استماع"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-base sm:text-xl lg:text-2xl font-black leading-relaxed">{lesson.keyQuestion}</p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
                    نقطة الانطلاق والتفكير الصفي
                  </div>
                </div>

                <div className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between ${themeClasses.card} ${revealedIntroStep >= 1 ? "opacity-100" : "opacity-40"}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-xs">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>الفكرة الأساسية للدرس</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(lesson.coreIdea)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
                        title="استماع"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-base sm:text-lg lg:text-xl font-bold leading-relaxed">{lesson.coreIdea}</p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-slate-700/30 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                    الجوهر المعرفي المستهدف
                  </div>
                </div>
              </div>

              {/* Textbook Official Learning Objectives Only */}
              {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                <div className={`p-6 sm:p-7 rounded-3xl border-2 ${themeClasses.card}`}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black">
                          أهداف ونواتج التعلم المعتمدة في الكتاب المدرسي ({lesson.learningObjectives.length} أهداف)
                        </h3>
                        <p className={`text-xs ${themeClasses.textSubtle}`}>المعارف والمهارات المعتمدة للدرس</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAllRevealed((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAllRevealed
                          ? "bg-slate-500/10 text-slate-400 border-slate-700/60 hover:text-white"
                          : "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25 hover:brightness-110 active:scale-95"
                      }`}
                      title={isAllRevealed ? "إعادة التدرج خطوة بخطوة (R)" : "كشف كافة أهداف الدرس دفعة واحدة (R)"}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAllRevealed ? "إعادة التدرج ⏱️" : "كشف الكل ⚡"}</span>
                    </button>
                  </div>

                  <div className={`grid grid-cols-1 ${lesson.learningObjectives.length === 2 ? "md:grid-cols-2" : lesson.learningObjectives.length >= 3 ? "md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-3`}>
                    {lesson.learningObjectives.map((obj, i) => {
                      const text = typeof obj === "string" ? obj : (obj as unknown as { text: string }).text;
                      const isRevealed = isAllRevealed || revealedIntroStep >= 2 + i || revealedIntroStep >= lesson.learningObjectives.length;
                      return (
                        <div key={i} className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${isRevealed ? "border-emerald-500/40 bg-emerald-500/5 font-bold animate-fadeIn" : "opacity-40 border-slate-700/30"}`}>
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono text-xs font-black shrink-0 mt-0.5 shadow-xs">
                            {i + 1}
                          </span>
                          <p className="text-xs sm:text-sm leading-relaxed">{formatInlineText(text, theme)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OFFICIAL SECTION SLIDES (WIDESCREEN FULL SECTION VIEW ONLY) */}
          {currentSection && (
            <div className="space-y-4 sm:space-y-5">
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-700/40">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs shadow-sm shadow-blue-500/20">
                    المحور {currentSection.index + 1} من {parsedSections.length}
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">{currentSection.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAllRevealed((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAllRevealed
                        ? "bg-slate-500/10 text-slate-400 border-slate-700/60 hover:text-white"
                        : "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 hover:brightness-110 active:scale-95"
                    }`}
                    title={isAllRevealed ? "إعادة التدرج خطوة بخطوة (R)" : "كشف كافة نقاط المحور دفعة واحدة (R)"}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAllRevealed ? "إعادة التدرج ⏱️" : "كشف الكل ⚡"}</span>
                  </button>
                </div>
              </div>

              {/* Full Widescreen Grid: Adapts cleanly based on visuals */}
              <div className={`grid grid-cols-1 ${currentSection.image || currentSection.table ? "lg:grid-cols-12" : "lg:grid-cols-2"} gap-5 sm:gap-6 items-start animate-fadeIn`}>
                {/* Column 1: Core Concept & Detailed Explanation Breakdown */}
                <div className={`${currentSection.image || currentSection.table ? "lg:col-span-7" : "lg:col-span-1"} space-y-4`}>
                  {/* Concept Intro Card */}
                  <div className={`p-5 sm:p-6 rounded-2xl border-2 space-y-3 ${themeClasses.cardHighlight}`}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-600 text-white shadow-xs">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>مدخل المفهوم وتأسيس الفكرة</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(currentSection.conceptIntro)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
                        title="استماع"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg font-bold leading-relaxed">
                      {formatInlineText(currentSection.conceptIntro, theme)}
                    </p>
                  </div>

                  {/* Detailed Points with Progressive Step Reveal */}
                  {currentSection.detailedPoints.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-black text-indigo-500">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" />
                          <span>الشرح التفصيلي والآلية المعرفية:</span>
                        </div>
                        {!isAllRevealed && (
                          <span className="text-[11px] text-slate-400 font-normal">
                            (المسطرة / التالي للكشف نقطة بنقطة)
                          </span>
                        )}
                      </div>

                      {currentSection.detailedPoints.map((pt, pIdx) => {
                        const isRevealed = isPointRevealed(pIdx);
                        const isCurrent = isPointCurrent(pIdx);

                        if (!isRevealed) return null;

                        return (
                          <div
                            key={pIdx}
                            className={`p-4 sm:p-4.5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-3.5 animate-fadeIn ${
                              isCurrent
                                ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-400/30 scale-[1.01]"
                                : themeClasses.card
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 mt-0.5 ${
                                isCurrent
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                              }`}
                            >
                              {pIdx + 1}
                            </span>
                            <div className="text-xs sm:text-sm lg:text-base leading-relaxed font-medium flex-1">
                              {formatInlineText(pt, theme)}
                            </div>
                            {isCurrent && (
                              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-black animate-pulse">
                                النقطة الحالية
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Linked Key Concepts with Full Definition on Hover */}
                  {currentSection.keyConcepts.length > 0 && areConceptsRevealed && (
                    <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                      isConceptsCurrent ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-400/30 shadow-lg" : themeClasses.card
                    } space-y-2.5 animate-fadeIn`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          <span>المفاهيم والمصطلحات المرتبطة بالمحور (مرّر الفأرة لعرض التعريف المعتمد):</span>
                        </span>
                        {isConceptsCurrent && (
                          <span className="shrink-0 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-black animate-pulse">
                            التركيز الحالي
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {currentSection.keyConcepts.map((c, cIdx) => (
                          <div key={cIdx} className="relative group inline-block">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs font-bold hover:border-indigo-400 hover:bg-indigo-500/20 transition-all cursor-help shadow-xs">
                              <span className="text-indigo-400 font-extrabold">{c.termAr}</span>
                              {c.termEn && <span className="font-mono text-[11px] opacity-75 dir-ltr">({c.termEn})</span>}
                              {c.termEn && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(c.termEn || "");
                                  }}
                                  className="p-0.5 rounded hover:bg-indigo-500/30 text-indigo-300"
                                  title="نطق المصطلح"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Floating Full Definition on Hover */}
                            {c.definition && (
                              <div className={`absolute bottom-full mb-2 right-0 w-72 sm:w-84 p-3.5 rounded-2xl border z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0 text-right backdrop-blur-xl ${themeClasses.tooltip}`}>
                                <div className="flex items-center justify-between border-b border-indigo-500/30 pb-1.5 mb-2">
                                  <span className="text-xs font-black text-indigo-400">{c.termAr}</span>
                                  {c.termEn && <span className="text-[11px] font-mono text-slate-400 dir-ltr">{c.termEn}</span>}
                                </div>
                                <p className="text-xs leading-relaxed font-medium">
                                  {c.definition}
                                </p>
                                <div className="absolute -bottom-1.5 right-6 w-3 h-3 border-b border-r border-inherit rotate-45 transform bg-inherit" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Visual Artifacts (Diagram & Official Table with Progressive Reveal) */}
                {(currentSection.image || currentSection.table) && (
                  <div className="lg:col-span-5 space-y-4">
                    {/* Diagram Display with Progressive Reveal & Minimize / Expand Toggle */}
                    {currentSection.image && (
                      !isImageRevealed ? (
                        /* Teaser banner before image is reached */
                        <div
                          onClick={revealImageNow}
                          className={`p-4 rounded-3xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/70 transition-all cursor-pointer flex items-center justify-between gap-3 group animate-fadeIn`}
                          title="انقر لكشف المخطط البياني الآن"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <ImageIcon className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 text-right">
                              <span className="text-[11px] font-black text-indigo-400 block">المخطط البياني المعتمد (الخطوة التالية)</span>
                              <h4 className="text-xs sm:text-sm font-bold truncate text-slate-700 dark:text-slate-300">
                                {currentSection.image.caption}
                              </h4>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              revealImageNow();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>كشف المخطط ⚡</span>
                          </button>
                        </div>
                      ) : isImageMinimized ? (
                        /* Minimized: Compact banner with icon and title only */
                        <div
                          onClick={() => setIsImageMinimized(false)}
                          className={`p-3.5 px-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                            isImageCurrent ? "border-indigo-500 ring-2 ring-indigo-400/30 bg-indigo-500/10" : themeClasses.card
                          } shadow-xs hover:border-blue-500/50 cursor-pointer group`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 text-right">
                              <span className="text-[11px] font-bold text-blue-500 block">المخطط البياني المعتمد (مطوي)</span>
                              <h4 className="text-xs sm:text-sm font-bold truncate text-slate-800 dark:text-slate-200">
                                {currentSection.image.caption}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isImageCurrent && (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black animate-pulse">
                                التركيز الحالي
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsImageMinimized(false);
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${themeClasses.btnSecondary}`}
                              title="إظهار المخطط بالكامل"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>إظهار المخطط</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Expanded: Full diagram card with active focus ring when current */
                        <div className={`p-4 sm:p-5 rounded-3xl border-2 text-center space-y-2.5 transition-all duration-300 ${
                          isImageCurrent
                            ? "border-indigo-500 ring-2 ring-indigo-400/40 shadow-xl shadow-indigo-500/20 bg-indigo-500/5"
                            : themeClasses.card
                        }`}>
                          <div className="flex items-center justify-between text-xs font-black px-1">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 text-blue-500">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>المخطط البياني المعتمد</span>
                              </span>
                              {isImageCurrent && (
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black animate-pulse shadow-xs">
                                  التركيز الحالي
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] opacity-75 hidden sm:inline text-slate-400">انقر للتكبير</span>
                              <button
                                type="button"
                                onClick={() => setIsImageMinimized(true)}
                                className={`p-1 px-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${themeClasses.btnSecondary}`}
                                title="طي المخطط إلى عنوان فقط"
                              >
                                <EyeOff className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500" />
                                <span>تصغير</span>
                              </button>
                            </div>
                          </div>

                          <div
                            onClick={() => setZoomedImage(currentSection.image || null)}
                            className="relative inline-block max-w-full rounded-2xl overflow-hidden border border-slate-700/40 shadow-lg cursor-zoom-in group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getAssetPath(currentSection.image.src)}
                              alt={currentSection.image.caption}
                              className="max-h-[320px] sm:max-h-[380px] w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                              <ZoomIn className="w-5 h-5" />
                              <span>معاينة مكبرة كاملة</span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                            {currentSection.image.caption}
                          </p>
                        </div>
                      )
                    )}

                    {/* Table Display with Progressive Row-by-Row Reveal & Active Focus */}
                    {currentSection.table && (
                      <div className={`p-4 rounded-3xl border-2 overflow-hidden space-y-2.5 transition-all duration-300 ${
                        sectionSteps[revealedSectionStep - 1]?.type === "table_row" && !isAllRevealed
                          ? "border-blue-500/80 ring-2 ring-blue-400/30 shadow-xl shadow-blue-500/15"
                          : themeClasses.card
                      }`}>
                        <div className="flex items-center justify-between text-xs font-black px-1 border-b border-slate-700/20 dark:border-slate-800/40 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-indigo-500">
                              <TableIcon className="w-3.5 h-3.5" />
                              <span>الجدول التوثيقي المعتمد</span>
                            </span>
                            {currentSection.table.rows.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-400 font-bold">
                                {isAllRevealed
                                  ? `كافة الصفوف (${currentSection.table.rows.length})`
                                  : `تم كشف ${currentSection.table.rows.filter((_, idx) => isTableRowRevealed(idx)).length} من ${currentSection.table.rows.length} صفوف`}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!isAllRevealed && currentSection.table.rows.some((_, idx) => !isTableRowRevealed(idx)) ? (
                              <button
                                type="button"
                                onClick={revealAllTableRows}
                                className={`p-1 px-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${themeClasses.btnSecondary} hover:border-indigo-400 hover:text-indigo-400`}
                                title="كشف كافة صفوف هذا الجدول دفعة واحدة"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>كشف الجدول كاملاً ⚡</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>الجدول مكشوف بالكامل</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-xl">
                          <table className="w-full text-right text-xs sm:text-sm border-collapse">
                            <thead className="sticky top-0 z-10">
                              <tr className={themeClasses.tableHeader}>
                                {currentSection.table.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="p-2.5 sm:p-3 font-black border-b border-inherit">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentSection.table.rows.map((row, rIdx) => {
                                const isRevealed = isTableRowRevealed(rIdx);
                                const isCurrent = isTableRowCurrent(rIdx);

                                if (isRevealed) {
                                  return (
                                    <tr
                                      key={rIdx}
                                      className={`border-b transition-all duration-300 animate-fadeIn ${
                                        isCurrent
                                          ? "bg-blue-600/20 dark:bg-blue-500/25 border-blue-500 font-bold shadow-xs ring-1 ring-blue-500/40"
                                          : themeClasses.tableRow
                                      }`}
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-2.5 sm:p-3 leading-relaxed">
                                          {cIdx === 0 && isCurrent && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black shrink-0 ml-1.5 shadow-xs animate-pulse">
                                              الصف النشط
                                            </span>
                                          )}
                                          {formatInlineText(cell, theme)}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                }

                                /* Unrevealed row: veiled placeholder keeping table layout 100% stable */
                                return (
                                  <tr
                                    key={rIdx}
                                    onClick={() => revealUpToTableRow(rIdx)}
                                    className="border-b border-slate-700/20 dark:border-slate-800/40 opacity-25 blur-[1px] hover:opacity-50 hover:blur-none transition-all cursor-pointer group"
                                    title="انقر لكشف هذا الصف الآن"
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5 sm:p-3 leading-relaxed select-none">
                                        {cIdx === 0 && (
                                          <span className="text-[10px] text-slate-400 group-hover:text-blue-400 font-mono ml-1.5">
                                            [صف {rIdx + 1}]
                                          </span>
                                        )}
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. FLOATING NAVIGATION & TOOLS DOCK (Zero layout footprint) */}
      <aside aria-label="أدوات التنقل السريع" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 px-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 pointer-events-auto select-none ${themeClasses.floatingPill}`}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentSlideIndex === 0 && revealedIntroStep === 0}
          className="p-2 rounded-xl hover:bg-slate-500/20 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="السابق (ArrowRight)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-500/15">
          {currentSlideIndex + 1} / {totalStations}
        </span>

        {/* Dynamic step indicator in section */}
        {currentSection && !isAllRevealed && sectionSteps.length > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/25 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>
              {revealedSectionStep === 0
                ? "مدخل المفهوم"
                : `${sectionSteps[revealedSectionStep - 1]?.label || "خطوة"} (${revealedSectionStep}/${sectionSteps.length})`}
            </span>
          </div>
        )}
        {currentSection && isAllRevealed && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            كافة العناصر مكشوفة ⚡
          </span>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentSlideIndex === totalStations - 1}
          className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-25 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          title="التالي (Space / ArrowLeft)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Integrated Floating Drawing Palette */}
        {isDrawingMode && (
          <>
            <div className="h-4 w-[1px] bg-slate-500/30 mx-1" />
            <button
              type="button"
              onClick={() => setActiveDrawTool("pointer")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                activeDrawTool === "pointer" ? "bg-blue-600 text-white" : "hover:bg-slate-500/20"
              }`}
              title="مؤشر"
            >
              <MousePointer2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawTool("pen")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                activeDrawTool === "pen" ? "bg-blue-600 text-white" : "hover:bg-slate-500/20"
              }`}
              title="قلم"
            >
              <Pen className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawTool("eraser")}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                activeDrawTool === "eraser" ? "bg-blue-600 text-white" : "hover:bg-slate-500/20"
              }`}
              title="ممحاة"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-[1px] bg-slate-500/30 mx-1" />
            {["#3b82f6", "#ef4444", "#10b981", "#f59e0b"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setDrawColor(c)}
                className={`w-4 h-4 rounded-full border-2 transition-transform cursor-pointer ${
                  drawColor === c ? "scale-125 border-white shadow-xs" : "border-transparent opacity-80"
                }`}
                style={{ backgroundColor: c }}
                title="لون"
              />
            ))}
            <div className="h-4 w-[1px] bg-slate-500/30 mx-1" />
            <button
              type="button"
              onClick={() => clearCanvasRef.current?.()}
              className="p-1.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="مسح الرسومات"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </aside>

      {/* 4. MODAL: SLIDE INDEX DRAWER */}
      {showSlideDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowSlideDrawer(false)}>
          <div className={`w-full max-w-2xl rounded-3xl border p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col ${themeClasses.card}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-500" />
                <h3 className="text-base sm:text-lg font-black">فهرس محطات الدرس ({stations.length} محطة معتمدة)</h3>
              </div>
              <button type="button" onClick={() => setShowSlideDrawer(false)} className="p-1.5 rounded-xl hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في محطات وأقسام الدرس..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredStations.map((st) => {
                const isActive = st.index === currentSlideIndex;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => goToStation(st.index)}
                    className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive ? "bg-blue-600 text-white border-blue-500 shadow-md scale-[1.01]" : "hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 ${isActive ? "bg-white text-blue-600" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                        {st.number}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold">{st.label}</h4>
                        <span className="text-[11px] opacity-75">{st.badge}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold opacity-60">{isActive ? "المحطة الحالية" : "انتقال سريع ──▶"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: ZOOMED HIGH-RES IMAGE VIEWER */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn" onClick={() => setZoomedImage(null)}>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button type="button" onClick={() => setZoomedImage(null)} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer" title="إغلاق">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center space-y-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getAssetPath(zoomedImage.src)} alt={zoomedImage.caption} className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10" />
            <p className="text-white text-xs sm:text-sm font-bold text-center px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700">{zoomedImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
