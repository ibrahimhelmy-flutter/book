"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Lesson } from "@/types";
import { SlideAnnotationCanvas, DrawToolType } from "./SlideAnnotationCanvas";
import { TeacherWhiteboardModal } from "./TeacherWhiteboardModal";
import { AIPresentationAssistant } from "./AIPresentationAssistant";
import { PresentationFlowView } from "./PresentationFlowView";
import { TeacherToolsDrawer } from "./TeacherToolsDrawer";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Pen,
  Highlighter,
  Eraser,
  MousePointer2,
  Type,
  RotateCcw,
  RotateCw,
  Trash2,
  ArrowRight,
  Square,
  Circle,
  Minus,
  ChevronDown,
  Volume2,
  Wrench,
  Search,
  Eye,
  EyeOff,
  Compass,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  X,
  LayoutGrid,
  HelpCircle,
  Zap,
  BookOpenCheck,
  CheckCircle2,
  FileCheck,
  Target,
  Lightbulb,
} from "lucide-react";
import { formatInlineText } from "../common/EyeComfortText";

interface Props {
  lesson: Lesson;
  onExitPresentation?: () => void;
}

export interface SlideItem {
  id: string;
  type: "intro" | "concepts" | "section" | "engineer" | "example" | "summary" | "ai_question";
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
  customData?: Record<string, unknown>;
}

export function LessonPresentationView({ lesson, onExitPresentation }: Props) {
  // Navigation & Animation State
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [revealedLineIndex, setRevealedLineIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSlideIndexDrawer, setShowSlideIndexDrawer] = useState<boolean>(false);
  const [searchSlideQuery, setSearchSlideQuery] = useState<string>("");

  // Smooth Zoom & Panning State (50% to 400%)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [showZoomMenu, setShowZoomMenu] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);

  // Presentation Modes: "slides" | "flow"
  const [presentationMode, setPresentationMode] = useState<"slides" | "flow">("slides");

  // Presentation Themes: "light" | "dark" (Default is Dark)
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Font Size Scaling: "normal" | "large" | "xlarge"
  const [fontSizeLevel] = useState<"normal" | "large" | "xlarge">("large");

  // Auto-play slideshow
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Drawers
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isTeacherToolsOpen, setIsTeacherToolsOpen] = useState<boolean>(false);

  // Drawing Tools State (Unified in Floating Center Pill)
  const [activeDrawTool, setActiveDrawTool] = useState<DrawToolType>("pointer");
  const [drawColor, setDrawColor] = useState<string>("#2563eb");
  const [drawSize, setDrawSize] = useState<number>(3.5);
  const [showShapesPicker, setShowShapesPicker] = useState<boolean>(false);

  const undoRef = useRef<(() => void) | null>(null);
  const redoRef = useRef<(() => void) | null>(null);
  const clearRef = useRef<(() => void) | null>(null);
  const downloadRef = useRef<(() => void) | null>(null);

  // Dynamic custom slides injected by AI Assistant
  const [customSlides, setCustomSlides] = useState<SlideItem[]>([]);

  const presentationContainerRef = useRef<HTMLDivElement | null>(null);

  // Smooth zoom handlers (50% to 400%)
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(4.0, +(prev + (prev >= 2.0 ? 0.5 : 0.25)).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(0.5, +(prev - (prev > 2.0 ? 0.5 : 0.25)).toFixed(2)));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setShowZoomMenu(false);
  }, []);

  const handleSetZoom = useCallback((zoom: number) => {
    setZoomLevel(Math.max(0.5, Math.min(4.0, +zoom.toFixed(2))));
    if (zoom === 1.0) {
      setPanOffset({ x: 0, y: 0 });
    }
    setShowZoomMenu(false);
  }, []);

  // Reset pan offset when slide changes
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [currentSlideIndex]);

  // Viewport Pan/Drag handlers to move page anywhere
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isInteractive = (e.target as HTMLElement).closest(
      "button, input, textarea, a, select, [role='button'], [data-no-pan]"
    );
    if (isInteractive) return;

    if (activeDrawTool === "pointer" || e.button === 1) {
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        originX: panOffset.x,
        originY: panOffset.y,
      };
      setIsPanning(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning || !panStartRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPanOffset({
      x: Math.round(panStartRef.current.originX + dx),
      y: Math.round(panStartRef.current.originY + dy),
    });
  };

  const handleViewportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Dedicated Non-Passive Wheel & Gesture Listener to stop browser page-zoom on trackpad pinch
  useEffect(() => {
    const handleWheelCapture = (e: WheelEvent) => {
      // 1. Touchpad Pinch or Ctrl + Wheel -> Scale zoom of slide ONLY
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        // Continuous smooth zoom delta proportional to touchpad pinch intensity
        const zoomDelta = -e.deltaY * 0.005;
        setZoomLevel((prev) => {
          const next = +(prev + zoomDelta).toFixed(3);
          return Math.max(0.5, Math.min(4.0, next));
        });
      }
      // 2. Touchpad 2-finger Pan or regular wheel scroll when zoomed/panned
      else if (zoomLevel > 1.0 || panOffset.x !== 0 || panOffset.y !== 0) {
        const target = e.target as HTMLElement;
        if (target && target.closest("[data-scrollable], .overflow-y-auto")) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        setPanOffset((prev) => ({
          x: Math.round(prev.x - (e.shiftKey ? e.deltaY : e.deltaX)),
          y: Math.round(prev.y - (e.shiftKey ? 0 : e.deltaY)),
        }));
      }
    };

    // Prevent browser zoom with Ctrl + (+/- / 0)
    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "_" || e.key === "0")
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "+" || e.key === "=") handleZoomIn();
        else if (e.key === "-" || e.key === "_") handleZoomOut();
        else if (e.key === "0") handleZoomReset();
      }
    };

    // Safari Gesture events for trackpad pinch
    const handleGesture = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Touch pinch-to-zoom support for mobile/touchscreen trackpads
    let touchStartDistance = 0;
    let touchStartZoom = zoomLevel;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.hypot(dx, dy);
        touchStartZoom = zoomLevel;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistance > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scaleFactor = dist / touchStartDistance;
        setZoomLevel(Math.max(0.5, Math.min(4.0, +(touchStartZoom * scaleFactor).toFixed(2))));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartDistance = 0;
      }
    };

    // Attach with { passive: false, capture: true } on window and document to intercept before browser engine zoom
    window.addEventListener("wheel", handleWheelCapture, { passive: false, capture: true });
    document.addEventListener("wheel", handleWheelCapture, { passive: false, capture: true });
    window.addEventListener("keydown", handleKeyDownCapture, { capture: true });
    window.addEventListener("gesturestart", handleGesture, { passive: false, capture: true });
    window.addEventListener("gesturechange", handleGesture, { passive: false, capture: true });
    window.addEventListener("gestureend", handleGesture, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheelCapture, { capture: true });
      document.removeEventListener("wheel", handleWheelCapture, { capture: true });
      window.removeEventListener("keydown", handleKeyDownCapture, { capture: true });
      window.removeEventListener("gesturestart", handleGesture, { capture: true });
      window.removeEventListener("gesturechange", handleGesture, { capture: true });
      window.removeEventListener("gestureend", handleGesture, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, { capture: true });
      window.removeEventListener("touchmove", handleTouchMove, { capture: true });
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [zoomLevel, panOffset, handleZoomIn, handleZoomOut, handleZoomReset]);

  // Theme toggle: Light / Dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Speech synthesis for English terms
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined") {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore speech synthesis errors gracefully
      }
    }
  };

  // Build master slides array from curriculum lesson data
  const baseSlides: SlideItem[] = useMemo(() => {
    const list: SlideItem[] = [];

    // 1. Intro Slide: Title, Key Question, and Objectives
    list.push({
      id: "slide-intro",
      type: "intro",
      title: `${lesson.number} ${lesson.title}`,
      subtitle: lesson.englishTitle,
      badge: `الفصل ${lesson.chapterNumber} — تمهيد الدرس 🚀`,
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
        subtitle: `المحور العلمي ${idx + 1} من ${lesson.sections.length}`,
        badge: "المحتوى العلمي 💡",
        bullets: lines,
        image: sec.image,
        table: sec.table,
      });
    });

    // 3. Key Concepts Glossary Slide
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
      const bullets = [
        `السيناريو الواقعي: ${lesson.engineerChallenge.scenario}`,
        ...lesson.engineerChallenge.steps.map(
          (st) => `خطوة ${st.number} (${st.title}): ${st.description}`
        ),
        `توجيه هندسي: ${lesson.engineerChallenge.hint}`,
      ];
      if (lesson.engineerChallenge.modelAnswer) {
        bullets.push(`الإجابة والقرار الهندسي النموذجي: ${lesson.engineerChallenge.modelAnswer}`);
      }

      list.push({
        id: "slide-engineer",
        type: "engineer",
        title: lesson.engineerChallenge.title,
        subtitle: "Engineering Problem Solving & Decisions",
        badge: "فكر كمهندس ⚙️",
        bullets,
      });
    }

    // 5. Solved Example Slides
    if (lesson.solvedExample && lesson.solvedExample.items && lesson.solvedExample.items.length > 0) {
      lesson.solvedExample.items.forEach((ex, exIdx) => {
        const bullets: string[] = [
          `المسألة / السؤال: ${ex.question}`,
        ];
        if (ex.options && ex.options.length > 0) {
          bullets.push(`الخيارات المتاحة: ${ex.options.map((o) => `${o.id.toUpperCase()}) ${o.text}`).join(" | ")}`);
        }
        if (ex.matchingPairs && ex.matchingPairs.length > 0) {
          bullets.push(`العبارات والمطابقة: ${ex.matchingPairs.map((p) => `${p.left} ← ${p.right}`).join(" | ")}`);
        }
        const answerLabel =
          typeof ex.correctAnswer === "string"
            ? ex.correctAnswer
            : JSON.stringify(ex.correctAnswer);
        bullets.push(`🏆 الإجابة النموذجية المعتمدة: ${answerLabel}`);
        bullets.push(`💡 خطوات الحل والتعليل العلمي: ${ex.explanation}`);

        list.push({
          id: `slide-example-${exIdx}`,
          type: "example",
          title:
            lesson.solvedExample.items.length > 1
              ? `تطبيق محلول نموذجي (${exIdx + 1} من ${lesson.solvedExample.items.length})`
              : "تطبيق محلول نموذجي مع خطوات التفكير",
          subtitle: "Model Solved Example",
          badge: `تطبيق عملي ${exIdx + 1} 📝`,
          bullets,
        });
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

  // Combined slides including any AI-generated custom slides
  const slides: SlideItem[] = useMemo(() => {
    return [...baseSlides, ...customSlides];
  }, [baseSlides, customSlides]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const exampleItemIndex = useMemo(() => {
    if (currentSlide.type !== "example") return 0;
    const match = currentSlide.id.match(/slide-example-(\d+)/);
    if (match) return parseInt(match[1], 10);
    return 0;
  }, [currentSlide.id, currentSlide.type]);

  const currentExampleItem = useMemo(() => {
    return lesson.solvedExample?.items?.[exampleItemIndex] || lesson.solvedExample?.items?.[0];
  }, [lesson.solvedExample, exampleItemIndex]);

  // Helper to compute total reveal steps on any slide index
  const getSlideTotalSteps = useCallback(
    (slideIdx: number) => {
      const targetSlide = slides[slideIdx];
      if (!targetSlide) return 1;
      if (targetSlide.type === "concepts" && lesson.keyConcepts && lesson.keyConcepts.length > 0) {
        return lesson.keyConcepts.length;
      }
      const bCount = targetSlide.bullets.length;
      const rCount = targetSlide.table ? targetSlide.table.rows.length : 0;
      return Math.max(1, bCount + rCount);
    },
    [slides, lesson.keyConcepts]
  );

  // Total steps for current slide
  const totalSteps = useMemo(() => {
    return getSlideTotalSteps(currentSlideIndex);
  }, [getSlideTotalSteps, currentSlideIndex]);

  // Font styling dynamic classes for pristine legibility
  const fontStyles = useMemo(() => {
    switch (fontSizeLevel) {
      case "xlarge":
        return {
          slideTitle: "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight",
          bulletText: "text-xl sm:text-2xl lg:text-3xl leading-loose font-bold",
          conceptText: "text-base sm:text-lg lg:text-xl leading-relaxed font-semibold",
          tableHead: "text-base sm:text-lg font-black",
          tableCell: "text-base sm:text-lg font-bold",
          badge: "text-xs sm:text-sm font-extrabold",
        };
      case "normal":
        return {
          slideTitle: "text-lg sm:text-xl font-extrabold tracking-tight",
          bulletText: "text-base sm:text-lg leading-relaxed font-semibold",
          conceptText: "text-sm sm:text-base leading-relaxed font-medium",
          tableHead: "text-xs sm:text-sm font-bold",
          tableCell: "text-xs sm:text-sm font-medium",
          badge: "text-[11px] font-bold",
        };
      case "large":
      default:
        return {
          slideTitle: "text-xl sm:text-2xl lg:text-3xl font-black tracking-tight",
          bulletText: "text-lg sm:text-xl lg:text-2xl leading-relaxed font-bold",
          conceptText: "text-base sm:text-lg leading-relaxed font-semibold",
          tableHead: "text-sm sm:text-base font-bold",
          tableCell: "text-sm sm:text-base font-semibold",
          badge: "text-xs font-bold",
        };
    }
  }, [fontSizeLevel]);

  // Filtered slides for slide drawer search
  const filteredSlides = useMemo(() => {
    if (!searchSlideQuery.trim()) return slides;
    const q = searchSlideQuery.toLowerCase();
    return slides.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q) ||
        s.bullets.some((b) => b.toLowerCase().includes(q))
    );
  }, [slides, searchSlideQuery]);

  // Step-by-step Next navigation: reveals bullet/row, then advances slide
  const handleNextStep = useCallback(() => {
    const currentTotal = getSlideTotalSteps(currentSlideIndex);
    if (revealedLineIndex < currentTotal - 1) {
      setRevealedLineIndex((prev) => prev + 1);
    } else if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setRevealedLineIndex(0);
    }
  }, [revealedLineIndex, currentSlideIndex, slides.length, getSlideTotalSteps]);

  // Step-by-step Back navigation: reverses revealed step, or moves to previous slide's end
  const handlePrevStep = useCallback(() => {
    if (revealedLineIndex > 0) {
      setRevealedLineIndex((prev) => prev - 1);
    } else if (currentSlideIndex > 0) {
      const prevSlideIdx = currentSlideIndex - 1;
      const prevSteps = getSlideTotalSteps(prevSlideIdx);
      setCurrentSlideIndex(prevSlideIdx);
      setRevealedLineIndex(prevSteps - 1);
    }
  }, [revealedLineIndex, currentSlideIndex, getSlideTotalSteps]);

  // Direct slide jumping
  const handlePrevSlideDirect = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setRevealedLineIndex(0);
    }
  }, [currentSlideIndex]);

  const handleNextSlideDirect = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setRevealedLineIndex(0);
    }
  }, [currentSlideIndex, slides.length]);

  // Reveal all or reset steps on this slide
  const handleRevealAllLines = () => {
    setRevealedLineIndex(totalSteps - 1);
  };

  const handleResetSlideLines = () => {
    setRevealedLineIndex(0);
  };

  // Auto-play slideshow logic
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayTimerRef.current = setInterval(() => {
        setRevealedLineIndex((prev) => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setCurrentSlideIndex((slidePrev) => {
              if (slidePrev < slides.length - 1) {
                return slidePrev + 1;
              } else {
                setIsAutoPlay(false);
                return slidePrev;
              }
            });
            return 0;
          }
        });
      }, 3500);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, totalSteps, slides.length]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!presentationContainerRef.current) return;
    if (!document.fullscreenElement) {
      presentationContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Undo / Redo Shortcuts: Ctrl + Z / Cmd + Z, Ctrl + Y / Cmd + Y
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "z" || e.code === "KeyZ")) {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          if (redoRef.current) redoRef.current();
        } else {
          if (undoRef.current) undoRef.current();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || e.code === "KeyY")) {
        e.preventDefault();
        e.stopPropagation();
        if (redoRef.current) redoRef.current();
        return;
      }

      // Zoom Shortcuts: + / = to zoom in, - to zoom out, 0 to reset
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        handleZoomReset();
        return;
      }

      // Step Backward: Right Arrow / Up Arrow / Backspace
      if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "Backspace") {
        e.preventDefault();
        handlePrevStep();
      }
      // Step Forward: Left Arrow / Space / Down Arrow / Enter
      else if (e.key === "ArrowLeft" || e.key === " " || e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        handleNextStep();
      }
      // Direct Prev Slide: PageUp / Shift+Right
      else if (e.key === "PageUp" || (e.shiftKey && e.key === "ArrowRight")) {
        e.preventDefault();
        handlePrevSlideDirect();
      }
      // Direct Next Slide: PageDown / Shift+Left
      else if (e.key === "PageDown" || (e.shiftKey && e.key === "ArrowLeft")) {
        e.preventDefault();
        handleNextSlideDirect();
      }
      // Drawing Pen: 'P' or 'D'
      else if (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "d") {
        e.preventDefault();
        setActiveDrawTool("pen");
      }
      // Highlighter: 'H'
      else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        setActiveDrawTool("highlighter");
      }
      // Laser: 'L'
      else if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        setActiveDrawTool("laser");
      }
      // Eraser: 'E'
      else if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        setActiveDrawTool("eraser");
      }
      // Pointer: 'V'
      else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        setActiveDrawTool("pointer");
      }
      // Fullscreen: 'F'
      else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
      // Whiteboard: 'W'
      else if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        setIsWhiteboardOpen((prev) => !prev);
      }
      // AI Assistant: 'Q'
      else if (e.key.toLowerCase() === "q") {
        e.preventDefault();
        setIsAIAssistantOpen((prev) => !prev);
      }
      // Teacher Tools: 'T'
      else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setIsTeacherToolsOpen((prev) => !prev);
      }
      // Reveal/Reset: 'R'
      else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (revealedLineIndex >= totalSteps - 1) {
          handleResetSlideLines();
        } else {
          handleRevealAllLines();
        }
      }
      // Escape
      else if (e.key === "Escape") {
        if (isWhiteboardOpen) setIsWhiteboardOpen(false);
        else if (isAIAssistantOpen) setIsAIAssistantOpen(false);
        else if (isTeacherToolsOpen) setIsTeacherToolsOpen(false);
        else if (showSlideIndexDrawer) setShowSlideIndexDrawer(false);
        else if (onExitPresentation) onExitPresentation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNextStep,
    handlePrevStep,
    handlePrevSlideDirect,
    handleNextSlideDirect,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    isWhiteboardOpen,
    isAIAssistantOpen,
    isTeacherToolsOpen,
    showSlideIndexDrawer,
    revealedLineIndex,
    totalSteps,
    onExitPresentation,
  ]);

  // Add custom AI question slide handler
  const handleAddCustomSlide = (slideData: {
    title: string;
    badge: string;
    bullets: string[];
  }) => {
    const newSlide: SlideItem = {
      id: `slide-ai-custom-${Date.now()}`,
      type: "ai_question",
      title: slideData.title,
      subtitle: "AI Generated Classroom Challenge",
      badge: slideData.badge,
      bullets: slideData.bullets,
    };
    setCustomSlides((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
    setRevealedLineIndex(0);
  };

  // Theme styling helpers: Light & Dark
  const themeStyles = useMemo(() => {
    if (theme === "light") {
      return {
        container: "bg-slate-100 text-slate-900",
        header: "bg-white/95 border-slate-200 text-slate-900 shadow-md",
        slideCard: "bg-slate-100 text-slate-900",
        bulletLatest: "bg-white border-blue-500 text-slate-900 shadow-lg ring-2 ring-blue-400/40 scale-[1.01]",
        bulletNormal: "bg-white/90 border-slate-200/90 text-slate-800 shadow-xs",
        textPrimary: "text-slate-900",
        textSecondary: "text-slate-600",
        dotLatest: "bg-blue-600 text-white ring-2 ring-blue-300 shadow-md",
        dotNormal: "bg-blue-100 text-blue-800",
        tableHead: "bg-blue-50 text-blue-900 border-blue-200",
        tableRowLatest: "bg-blue-50 font-bold ring-1 ring-blue-400",
        tableRowNormal: "hover:bg-slate-100/60",
        tableBorder: "border-slate-200",
        floatingPill: "bg-white/95 border-slate-300 text-slate-900 shadow-2xl shadow-slate-900/15",
        activeTool: "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 ring-1 ring-blue-400",
        inactiveTool: "text-slate-700 hover:text-slate-950 hover:bg-slate-100",
        navBtn: "text-slate-700 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30",
        divider: "bg-slate-200",
        floatingPopup: "bg-white/95 border-slate-200 text-slate-900",
      };
    }

    // Default: Dark Theme
    return {
      container: "bg-slate-950 text-slate-100",
      header: "bg-slate-900/90 border-slate-800 text-white shadow-lg",
      slideCard: "bg-slate-950 text-slate-100",
      bulletLatest: "bg-indigo-950/70 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-400/40 scale-[1.01]",
      bulletNormal: "bg-slate-900/80 border-slate-800/90 text-slate-200 shadow-sm",
      textPrimary: "text-white",
      textSecondary: "text-slate-400",
      dotLatest: "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md",
      dotNormal: "bg-slate-800 text-slate-300",
      tableHead: "bg-slate-900 text-indigo-300 border-slate-800",
      tableRowLatest: "bg-indigo-950/80 font-bold ring-1 ring-indigo-500",
      tableRowNormal: "hover:bg-slate-900/40",
      tableBorder: "border-slate-800",
      floatingPill: "bg-slate-900/95 border-slate-700/80 text-white shadow-2xl shadow-black/60",
      activeTool: "bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105 ring-1 ring-blue-400",
      inactiveTool: "text-slate-200 hover:text-white hover:bg-slate-800",
      navBtn: "text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30",
      divider: "bg-slate-700/80",
      floatingPopup: "bg-slate-900/95 border-slate-700 text-white",
    };
  }, [theme]);

  return (
    <div
      ref={presentationContainerRef}
      className={`fixed inset-0 z-50 h-screen w-screen flex flex-col font-sans select-none overflow-hidden touch-none ${themeStyles.container}`}
      style={{ touchAction: "none" }}
      dir="rtl"
    >
      {/* 0. Top Progress Bar */}
      <div className="fixed top-0 inset-x-0 h-1 bg-slate-200/50 dark:bg-slate-800 shrink-0 overflow-hidden z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* 1. Floating Fixed Top Bar (Outside zoom area, never scales) */}
      <div className="fixed top-3 left-3 right-3 sm:left-6 sm:right-6 z-50 flex items-center justify-between pointer-events-none select-none">
        {/* Right side: Lesson badge, number, slide title, slide drawer */}
        <div className={`flex items-center gap-2 sm:gap-3 p-1.5 px-3 sm:px-4 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto max-w-[70vw] sm:max-w-2xl ${themeStyles.floatingPill}`}>
          <span className="shrink-0 px-2.5 py-0.5 rounded-xl bg-blue-600 text-white font-black text-xs shadow-xs">
            {lesson.number}
          </span>
          <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20 hidden md:inline-block">
            {currentSlide.badge}
          </span>
          <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight break-words">
            {currentSlide.title}
          </h1>
          <button
            onClick={() => setShowSlideIndexDrawer(!showSlideIndexDrawer)}
            className="px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
            title="فهرس جميع الشرائح"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {currentSlideIndex + 1}/{slides.length}
            </span>
          </button>
        </div>

        {/* Left side: Header Actions */}
        <div className={`flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto ${themeStyles.floatingPill}`}>
          {/* Mode Switcher: Slides vs Flow */}
          <button
            onClick={() => setPresentationMode(presentationMode === "slides" ? "flow" : "slides")}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              presentationMode === "flow"
                ? "bg-blue-600 text-white shadow-md"
                : themeStyles.inactiveTool
            }`}
            title={presentationMode === "slides" ? "التبديل إلى خريطة التدفق (Flow)" : "التبديل إلى عرض الشرائح"}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Theme Switcher: Light / Dark */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.inactiveTool}`}
            title={theme === "dark" ? "التبديل إلى المظهر الفاتح (Light)" : "التبديل إلى المظهر الداكن (Dark)"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {/* Dedicated Digital Whiteboard */}
          <button
            onClick={() => setIsWhiteboardOpen(true)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.inactiveTool}`}
            title="السبورة الرقمية الكاملة (W)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* AI Assistant */}
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
            title="مساعد الذكاء الاصطناعي (Q)"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Teacher Toolbox (Timer & Randomizer) */}
          <button
            onClick={() => setIsTeacherToolsOpen(true)}
            className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
            title="صندوق أدوات المعلم (T)"
          >
            <Wrench className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.inactiveTool}`}
            title={isFullscreen ? "إنهاء ملء الشاشة (F)" : "عرض بملء الشاشة (F)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit / Close Presentation */}
          {onExitPresentation && (
            <button
              onClick={onExitPresentation}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="إغلاق العرض (Esc)"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Slide Thumbnails Drawer Modal */}
      {showSlideIndexDrawer && (
        <div className="fixed top-14 right-4 sm:right-6 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl w-84 max-h-[75vh] overflow-y-auto custom-scrollbar animate-fadeIn text-right">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">فهرس شرائح الدرس</span>
            <button
              onClick={() => setShowSlideIndexDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="relative mb-3">
            <input
              type="text"
              value={searchSlideQuery}
              onChange={(e) => setSearchSlideQuery(e.target.value)}
              placeholder="بحث في الشرائح..."
              className="w-full text-xs px-3 py-2 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
          </div>

          <div className="space-y-1.5">
            {filteredSlides.map((s) => {
              const originalIndex = slides.findIndex((orig) => orig.id === s.id);
              const isActive = currentSlideIndex === originalIndex;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSlideIndex(originalIndex);
                    setRevealedLineIndex(0);
                    setShowSlideIndexDrawer(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex-1 leading-normal">
                    <span className="opacity-70 ml-1">{originalIndex + 1}.</span> {s.title}
                  </div>
                  <span className="text-[10px] opacity-75 shrink-0 mr-2">{s.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Main Slide Presentation View Area with Smooth Zoom (50%-400%) and Free Panning */}
      {presentationMode === "slides" ? (
        <main
          className={`relative flex-1 w-full h-full overflow-hidden select-none flex flex-col justify-center pt-16 sm:pt-20 pb-20 sm:pb-24 ${
            themeStyles.slideCard
          } ${
            activeDrawTool === "pointer"
              ? isPanning
                ? "cursor-grabbing"
                : "cursor-grab"
              : ""
          }`}
          onPointerDown={handleViewportPointerDown}
          onPointerMove={handleViewportPointerMove}
          onPointerUp={handleViewportPointerUp}
          onPointerCancel={handleViewportPointerUp}
        >
          {/* Slide Annotation Canvas */}
          <SlideAnnotationCanvas
            slideIndex={currentSlideIndex}
            activeTool={activeDrawTool}
            color={drawColor}
            size={drawSize}
            undoRef={undoRef}
            redoRef={redoRef}
            clearRef={clearRef}
            downloadRef={downloadRef}
          />

          {/* Smooth Zoom Scaled & Panned Slide Content Container */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-12 py-8 sm:py-12 flex-1 flex flex-col justify-center pointer-events-none">
            <div
              className="w-full space-y-6 will-change-transform pointer-events-auto"
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)",
              }}
            >
              {/* Prominent Full Slide Title & Badge Header (Shows complete slide title inside canvas) */}
              {currentSlide.type !== "intro" && (
                <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-200/80 dark:border-slate-800/80 animate-fadeIn">
                  <span className="px-3 py-1 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-xs sm:text-sm font-black shrink-0 shadow-xs">
                    {currentSlide.badge}
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-relaxed">
                    {currentSlide.title}
                  </h2>
                </div>
              )}

              {/* 1. Intro Slide: Enhanced Question & Learning Path */}
              {currentSlide.type === "intro" && (
                <div className="space-y-6 animate-fadeIn">
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border-2 flex items-start gap-4 shadow-lg backdrop-blur-sm ${
                      theme === "light"
                        ? "bg-white border-blue-300 text-slate-950 shadow-md"
                        : "bg-blue-500/10 border-blue-500/30 text-white"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        theme === "light"
                          ? "bg-blue-50 border border-blue-200 text-blue-600"
                          : "bg-blue-600/20 border border-blue-500/40 text-blue-400"
                      }`}
                    >
                      <HelpCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3
                        className={`text-xs sm:text-sm font-bold mb-1.5 uppercase tracking-wide ${
                          theme === "light" ? "text-blue-800" : "text-blue-300"
                        }`}
                      >
                        السؤال الجوهري للدرس:
                      </h3>
                      <p
                        className={`text-xl sm:text-3xl font-black leading-relaxed ${
                          theme === "light" ? "text-slate-950" : "text-white"
                        }`}
                      >
                        {lesson.keyQuestion}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-6 sm:p-7 rounded-3xl border-2 flex items-start gap-4 shadow-md backdrop-blur-sm ${
                      theme === "light"
                        ? "bg-white border-indigo-200 text-slate-900 shadow-sm"
                        : "bg-indigo-500/10 border-indigo-500/30 text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        theme === "light"
                          ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                          : "bg-indigo-600/20 border border-indigo-500/40 text-indigo-400"
                      }`}
                    >
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold mb-1 uppercase tracking-wide ${
                          theme === "light" ? "text-indigo-800" : "text-indigo-300"
                        }`}
                      >
                        الفكرة الأساسية ومسار التعلم:
                      </h4>
                      <p
                        className={`text-lg sm:text-xl font-bold leading-relaxed ${
                          theme === "light" ? "text-slate-800" : "text-slate-200"
                        }`}
                      >
                        {lesson.coreIdea}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Diagram Image from PDF if available */}
              {currentSlide.image && (
                <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center backdrop-blur-sm">
                  <div className="max-h-84 flex items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 shadow-inner">
                    <img
                      src={currentSlide.image.src}
                      alt={currentSlide.image.caption}
                      className="max-h-76 w-auto object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300 mt-3 text-center">
                    📊 {currentSlide.image.caption}
                  </p>
                </div>
              )}

              {/* Table Data Visualization with Progressive Row-by-Row Reveal */}
              {currentSlide.table && (
                <div
                  className={`overflow-x-auto rounded-3xl ${
                    theme === "light"
                      ? "border-2 border-slate-300 bg-white shadow-md"
                      : "border-2 border-slate-800 bg-slate-950 shadow-lg"
                  } my-4`}
                >
                  <table className="w-full text-right border-collapse">
                    <thead
                      className={`border-b-2 ${
                        theme === "light"
                          ? "bg-slate-100/90 text-slate-950 border-slate-300"
                          : "bg-slate-900 text-indigo-300 border-slate-800"
                      }`}
                    >
                      <tr>
                        {currentSlide.table.headers.map((h, i) => (
                          <th
                            key={i}
                            className={`p-4 sm:p-5 font-black text-sm sm:text-base ${
                              theme === "light" ? "text-slate-950" : "text-indigo-200"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody
                      className={`${
                        theme === "light"
                          ? "divide-y divide-slate-200 text-slate-950"
                          : "divide-y divide-slate-800 text-slate-100"
                      }`}
                    >
                      {currentSlide.table.rows.map((row, rIdx) => {
                        const rowStepIndex = currentSlide.bullets.length + rIdx;
                        const isRowRevealed = rowStepIndex <= revealedLineIndex;
                        const isLatestRow = rowStepIndex === revealedLineIndex;

                        return (
                          <tr
                            key={rIdx}
                            className={`transition-all duration-300 ${
                              isRowRevealed
                                ? isLatestRow
                                  ? theme === "light"
                                    ? "bg-blue-50/95 font-bold text-slate-950 ring-2 ring-blue-500/30"
                                    : "bg-indigo-950/80 font-bold text-white ring-1 ring-indigo-500"
                                  : theme === "light"
                                    ? "hover:bg-slate-50/90 text-slate-900"
                                    : "hover:bg-slate-900/40 text-slate-200"
                                : "opacity-0 translate-y-3 pointer-events-none"
                            }`}
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-4 sm:p-5 leading-relaxed font-bold text-sm sm:text-base ${
                                  theme === "light" ? "text-slate-950" : "text-slate-100"
                                }`}
                              >
                                {formatInlineText(cell, theme === "light" ? "light" : "dark")}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 1. Intro Slide: Clean, Simple & High-Impact Horizontal Layout */}
              {currentSlide.type === "intro" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Top Horizontal Row: Key Question & Core Idea Side-by-Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                    {/* 1.1 Key Question Card (السؤال الجوهري) */}
                    <div
                      className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-md flex flex-col justify-between ${
                        theme === "light"
                          ? "bg-gradient-to-br from-blue-50/95 via-sky-50/70 to-white border-blue-300 text-blue-950 shadow-blue-500/5"
                          : "bg-gradient-to-br from-blue-950/40 via-slate-900 to-sky-950/40 border-blue-500/40 text-blue-100 shadow-blue-950/20"
                      } ${
                        revealedLineIndex === 0
                          ? theme === "light"
                            ? "ring-2 ring-blue-400/50 scale-[1.01]"
                            : "ring-2 ring-blue-500/50 scale-[1.01]"
                          : "opacity-95"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                              theme === "light"
                                ? "bg-blue-100 text-blue-900 border-blue-200"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>السؤال الجوهري المحفّز ❓</span>
                          </span>
                          <button
                            onClick={() => speakText(lesson.keyQuestion)}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              theme === "light"
                                ? "hover:bg-blue-100 text-blue-700"
                                : "hover:bg-slate-800 text-blue-400"
                            }`}
                            title="استماع للسؤال الجوهري"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p
                          className={`font-black text-base sm:text-lg lg:text-xl leading-relaxed ${
                            theme === "light" ? "text-blue-950" : "text-white"
                          }`}
                        >
                          {lesson.keyQuestion}
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-blue-200/60 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <span>نقطة الانطلاق والتفكير الصفي</span>
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>

                    {/* 1.2 Core Idea Card (الفكرة الأساسية) */}
                    <div
                      className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-md flex flex-col justify-between ${
                        theme === "light"
                          ? "bg-gradient-to-br from-indigo-50/95 via-purple-50/70 to-white border-indigo-300 text-indigo-950 shadow-indigo-500/5"
                          : "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border-indigo-500/40 text-indigo-100 shadow-indigo-950/20"
                      } ${
                        revealedLineIndex >= 1
                          ? revealedLineIndex === 1
                            ? theme === "light"
                              ? "ring-2 ring-indigo-400/50 scale-[1.01]"
                              : "ring-2 ring-indigo-500/50 scale-[1.01]"
                            : "opacity-95"
                          : "opacity-60"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                              theme === "light"
                                ? "bg-indigo-100 text-indigo-900 border-indigo-200"
                                : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            }`}
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>الفكرة الأساسية والمحورية 💡</span>
                          </span>
                          <button
                            onClick={() => speakText(lesson.coreIdea)}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              theme === "light"
                                ? "hover:bg-indigo-100 text-indigo-700"
                                : "hover:bg-slate-800 text-indigo-400"
                            }`}
                            title="استماع للفكرة الأساسية"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p
                          className={`font-black text-base sm:text-lg lg:text-xl leading-relaxed ${
                            theme === "light" ? "text-indigo-950" : "text-white"
                          }`}
                        >
                          {lesson.coreIdea}
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-indigo-200/60 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span>الجوهر المعرفي المستهدف</span>
                        <Compass className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Horizontal Row: Learning Objectives (نواتج التعلم المستهدفة) */}
                  {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                    <div
                      className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-md ${
                        theme === "light"
                          ? "bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-500/5"
                          : "bg-slate-900/90 border-emerald-500/30 text-white shadow-emerald-950/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
                              theme === "light"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            }`}
                          >
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <span
                              className={`text-xs font-black uppercase tracking-wide ${
                                theme === "light" ? "text-emerald-700" : "text-emerald-400"
                              }`}
                            >
                              أهداف ونواتج التعلم المستهدفة:
                            </span>
                            <h4
                              className={`text-sm sm:text-base font-black ${
                                theme === "light" ? "text-slate-900" : "text-white"
                              }`}
                            >
                              ما سيكتسبه الطالب بنهاية هذا الدرس ({lesson.learningObjectives.length} أهداف)
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Horizontal Grid of Learning Objective Cards */}
                      <div
                        className={`grid grid-cols-1 ${
                          lesson.learningObjectives.length === 2
                            ? "md:grid-cols-2"
                            : lesson.learningObjectives.length >= 3
                              ? "md:grid-cols-3"
                              : "grid-cols-1"
                        } gap-3.5`}
                      >
                        {lesson.learningObjectives.map((obj, i) => {
                          const objText =
                            typeof obj === "string" ? obj : (obj as unknown as { text: string }).text;
                          const objStepIndex = 2 + i;
                          const isRevealed = objStepIndex <= revealedLineIndex;
                          const isLatest = objStepIndex === revealedLineIndex;

                          return (
                            <div
                              key={i}
                              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-3 ${
                                isRevealed
                                  ? isLatest
                                    ? theme === "light"
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-md scale-[1.02] ring-2 ring-emerald-400/30"
                                      : "bg-emerald-950/60 border-emerald-400 text-emerald-100 font-bold shadow-md scale-[1.02] ring-1 ring-emerald-400"
                                    : theme === "light"
                                      ? "bg-slate-50/90 border-slate-200 text-slate-800"
                                      : "bg-slate-950/80 border-slate-800 text-slate-200"
                                  : "opacity-40 translate-y-1"
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                                  isRevealed && isLatest
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : theme === "light"
                                      ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                }`}
                              >
                                {i + 1}
                              </span>
                              <p className="flex-1 text-xs sm:text-sm leading-relaxed font-bold">
                                {formatInlineText(objText, theme === "light" ? "light" : "dark")}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Concepts Slide: Interactive Concept Cards with Audio TTS */}
              {currentSlide.type === "concepts" && lesson.keyConcepts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {lesson.keyConcepts.map((concept, cIdx) => {
                    const isRevealed = cIdx <= revealedLineIndex;
                    const isLatest = cIdx === revealedLineIndex;

                    return (
                      <div
                        key={cIdx}
                        className={`p-6 rounded-3xl border-2 transition-all duration-300 space-y-3 ${
                          isRevealed
                            ? isLatest
                              ? theme === "light"
                                ? "bg-white border-purple-600 shadow-xl ring-2 ring-purple-400/20 scale-[1.02]"
                                : "bg-purple-500/15 border-purple-500 shadow-xl scale-[1.02]"
                              : theme === "light"
                                ? "bg-white/95 border-purple-200 shadow-xs opacity-95"
                                : "bg-purple-500/10 border-purple-500/30 opacity-90"
                            : "opacity-0 translate-y-4 pointer-events-none"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-black text-sm sm:text-base px-3.5 py-1.5 rounded-xl border ${
                              theme === "light"
                                ? "bg-purple-50 text-purple-950 border-purple-200"
                                : "text-purple-300 bg-purple-500/20 border-purple-500/30"
                            }`}
                          >
                            {concept.termAr}
                          </span>
                          {concept.termEn && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs sm:text-sm font-mono font-bold dir-ltr ${
                                  theme === "light" ? "text-indigo-800" : "text-sky-300"
                                }`}
                              >
                                {concept.termEn}
                              </span>
                              <button
                                onClick={() => speakText(concept.termEn || "")}
                                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                                title="نطق المصطلح بالإنجليزية"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p
                          className={`leading-relaxed font-semibold ${
                            theme === "light" ? "text-slate-800" : "text-slate-300"
                          } ${fontStyles.conceptText}`}
                        >
                          {concept.definition}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. Think Like an Engineer Slide: Dedicated Engineering Challenge & Model Answer UI */}
              {currentSlide.type === "engineer" && lesson.engineerChallenge && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Scenario & Challenge Header */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border-2 transition-all shadow-md backdrop-blur-sm ${
                      theme === "light"
                        ? "bg-amber-50/90 border-amber-300 text-amber-950"
                        : "bg-amber-950/30 border-amber-500/40 text-amber-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                            theme === "light"
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-extrabold uppercase tracking-wide ${
                              theme === "light" ? "text-amber-800" : "text-amber-300"
                            }`}
                          >
                            السيناريو والمهمة الهندسية الواقعية:
                          </span>
                          <h3
                            className={`text-lg sm:text-xl font-black ${
                              theme === "light" ? "text-amber-950" : "text-white"
                            }`}
                          >
                            {lesson.engineerChallenge.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <p
                      className={`leading-relaxed font-bold text-sm sm:text-base ${
                        theme === "light" ? "text-amber-900" : "text-amber-200"
                      }`}
                    >
                      {lesson.engineerChallenge.scenario}
                    </p>
                  </div>

                  {/* Engineering Steps with Progressive Step Reveal */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lesson.engineerChallenge.steps.map((st, sIdx) => {
                      const isRevealed = sIdx <= revealedLineIndex;
                      const isLatest = sIdx === revealedLineIndex;

                      return (
                        <div
                          key={sIdx}
                          className={`p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-3 ${
                            isRevealed
                              ? isLatest
                                ? theme === "light"
                                  ? "bg-white border-amber-500 shadow-xl ring-2 ring-amber-400/30 scale-[1.02]"
                                  : "bg-amber-950/50 border-amber-400 shadow-xl scale-[1.02]"
                                : theme === "light"
                                  ? "bg-white/95 border-amber-200 shadow-xs opacity-95"
                                  : "bg-slate-900/90 border-slate-800 opacity-90"
                              : "opacity-0 translate-y-4 pointer-events-none"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                                  theme === "light"
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                }`}
                              >
                                {st.number}
                              </span>
                              <h4
                                className={`font-black text-sm sm:text-base ${
                                  theme === "light" ? "text-slate-900" : "text-white"
                                }`}
                              >
                                {st.title}
                              </h4>
                            </div>
                            <p
                              className={`text-xs sm:text-sm leading-relaxed font-semibold ${
                                theme === "light" ? "text-slate-700" : "text-slate-300"
                              }`}
                            >
                              {st.description}
                            </p>
                          </div>

                          {st.options && st.options.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                                الخيارات المتاحة:
                              </span>
                              {st.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-xl text-xs font-semibold ${
                                    theme === "light"
                                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                                      : "bg-slate-950 text-amber-200 border border-amber-500/20"
                                  }`}
                                >
                                  • {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Engineering Guidance Hint */}
                  {lesson.engineerChallenge.hint && (
                    <div
                      className={`p-5 rounded-3xl border-2 transition-all flex items-start gap-3.5 ${
                        theme === "light"
                          ? "bg-blue-50/90 border-blue-200 text-blue-950 shadow-xs"
                          : "bg-blue-950/30 border-blue-500/40 text-blue-200"
                      } ${
                        revealedLineIndex >= lesson.engineerChallenge.steps.length
                          ? "opacity-100 scale-100"
                          : "opacity-0 translate-y-3 pointer-events-none"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          theme === "light"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <strong
                          className={`text-xs sm:text-sm font-black block mb-0.5 ${
                            theme === "light" ? "text-blue-900" : "text-blue-300"
                          }`}
                        >
                          توجيه التفكير الهندسي:
                        </strong>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed font-bold ${
                            theme === "light" ? "text-blue-950" : "text-slate-200"
                          }`}
                        >
                          {lesson.engineerChallenge.hint}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MODEL ANSWER & STANDARD SOLUTION (الإجابة والقرار الهندسي النموذجي) */}
                  {lesson.engineerChallenge.modelAnswer && (
                    <div
                      className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-xl ${
                        theme === "light"
                          ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-400 text-emerald-950 shadow-emerald-500/10"
                          : "bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/60 text-white shadow-emerald-950/40"
                      } ${
                        revealedLineIndex >= lesson.engineerChallenge.steps.length + 1
                          ? "opacity-100 scale-100 ring-2 ring-emerald-500/30"
                          : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-300/40 dark:border-emerald-700/50 pb-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                              theme === "light"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            }`}
                          >
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 block">
                              الحل والقرار المنهجي المعتمد 🏆
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200">
                              الإجابة النموذجية للتحدي الهندسي
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold border ${
                              theme === "light"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            معايير الكتاب المدرسي
                          </span>
                          <button
                            onClick={() => speakText(lesson.engineerChallenge.modelAnswer || "")}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              theme === "light"
                                ? "hover:bg-emerald-100 text-emerald-800"
                                : "hover:bg-slate-800 text-emerald-400"
                            }`}
                            title="استماع للإجابة النموذجية"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Model Answer Body */}
                      <div className="space-y-3">
                        {lesson.engineerChallenge.modelAnswer.split("\n").map((line, lIdx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;
                          return (
                            <div
                              key={lIdx}
                              className={`p-3.5 sm:p-4 rounded-2xl border leading-relaxed font-bold text-xs sm:text-sm sm:leading-relaxed ${
                                theme === "light"
                                  ? "bg-white/90 border-emerald-200 text-slate-900 shadow-xs"
                                  : "bg-slate-950/80 border-emerald-500/30 text-slate-100 shadow-inner"
                              }`}
                            >
                              {formatInlineText(trimmed, theme === "light" ? "light" : "dark")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Solved Example Slide: Dedicated Model Solved Example UI with Model Answer & Scientific Reasoning */}
              {currentSlide.type === "example" && currentExampleItem && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Question Header Card */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border-2 transition-all shadow-md backdrop-blur-sm ${
                      theme === "light"
                        ? "bg-teal-50/90 border-teal-300 text-teal-950"
                        : "bg-teal-950/30 border-teal-500/40 text-teal-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                            theme === "light"
                              ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                              : "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                          }`}
                        >
                          <BookOpenCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-extrabold uppercase tracking-wide ${
                              theme === "light" ? "text-teal-800" : "text-teal-300"
                            }`}
                          >
                            المسألة والتطبيق العملي من الكتاب المدرسي:
                          </span>
                          <h3
                            className={`text-lg sm:text-xl font-black ${
                              theme === "light" ? "text-teal-950" : "text-white"
                            }`}
                          >
                            {lesson.solvedExample?.title || "تطبيق محلول نموذجي"}
                          </h3>
                        </div>
                      </div>

                      {lesson.solvedExample?.items && lesson.solvedExample.items.length > 1 && (
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            theme === "light"
                              ? "bg-teal-100 text-teal-900 border-teal-300"
                              : "bg-teal-500/20 text-teal-300 border-teal-500/30"
                          }`}
                        >
                          تطبيق {exampleItemIndex + 1} من {lesson.solvedExample.items.length}
                        </span>
                      )}
                    </div>

                    <p
                      className={`leading-relaxed font-bold text-base sm:text-lg ${
                        theme === "light" ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {currentExampleItem.question}
                    </p>
                  </div>

                  {/* MCQ Options Display (with Correct Answer Highlighting when revealed) */}
                  {currentExampleItem.options && currentExampleItem.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentExampleItem.options.map((opt) => {
                        const isCorrect =
                          opt.id.toLowerCase() === String(currentExampleItem.correctAnswer).toLowerCase() ||
                          opt.text === currentExampleItem.correctAnswer;
                        const isAnswerRevealed = revealedLineIndex >= 1;

                        return (
                          <div
                            key={opt.id}
                            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-3 ${
                              isAnswerRevealed && isCorrect
                                ? theme === "light"
                                  ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400/30 text-emerald-950 font-bold scale-[1.01]"
                                  : "bg-emerald-950/60 border-emerald-400 shadow-lg ring-1 ring-emerald-400 text-emerald-100 font-bold scale-[1.01]"
                                : theme === "light"
                                  ? "bg-white/95 border-slate-200 text-slate-800 shadow-xs"
                                  : "bg-slate-900/80 border-slate-800 text-slate-300"
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                                isAnswerRevealed && isCorrect
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {opt.id.toUpperCase()}
                            </span>
                            <div className="flex-1 leading-relaxed text-xs sm:text-sm font-semibold">
                              {opt.text}
                            </div>
                            {isAnswerRevealed && isCorrect && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold shrink-0 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>الإجابة النموذجية</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Matching Pairs / True-False Table Display */}
                  {currentExampleItem.matchingPairs && currentExampleItem.matchingPairs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentExampleItem.matchingPairs.map((pair, pIdx) => {
                        const isRevealed = pIdx <= revealedLineIndex;
                        return (
                          <div
                            key={pIdx}
                            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                              theme === "light"
                                ? "bg-white border-slate-200 text-slate-900 shadow-xs"
                                : "bg-slate-900 border-slate-800 text-slate-200"
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-bold leading-relaxed">{pair.left}</span>
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                                pair.right.includes("○") || pair.right.includes("صح") || pair.right.includes("true")
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : pair.right.includes("×") || pair.right.includes("خطأ") || pair.right.includes("false")
                                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                    : "bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30"
                              }`}
                            >
                              {pair.right}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MODEL ANSWER & REASONING CARD (الإجابة النموذجية والتعليل العلمي المعتمد) */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border-2 transition-all duration-300 shadow-xl ${
                      theme === "light"
                        ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-400 text-emerald-950 shadow-emerald-500/10"
                        : "bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/60 text-white shadow-emerald-950/40"
                    } ${
                      revealedLineIndex >= 1
                        ? "opacity-100 scale-100 ring-2 ring-emerald-500/30"
                        : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-300/40 dark:border-emerald-700/50 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                            theme === "light"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          }`}
                        >
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 block">
                            سلم التصحيح والحل النموذجي 🏆
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200">
                            الإجابة النموذجية والتعليل العلمي المعتمد
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold border ${
                            theme === "light"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {typeof currentExampleItem.correctAnswer === "string" && currentExampleItem.options
                            ? `الخيار الصحيح: (${currentExampleItem.correctAnswer.toUpperCase()})`
                            : "معتمد وفق سلم التصحيح"}
                        </span>
                        <button
                          onClick={() => speakText(currentExampleItem.explanation)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            theme === "light"
                              ? "hover:bg-emerald-100 text-emerald-800"
                              : "hover:bg-slate-800 text-emerald-400"
                          }`}
                          title="استماع للشرح والتعليل العلمي"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Explanation Steps */}
                    <div className="space-y-3">
                      <div
                        className={`p-4 rounded-2xl border leading-relaxed font-bold text-xs sm:text-sm sm:leading-relaxed ${
                          theme === "light"
                            ? "bg-white/90 border-emerald-200 text-slate-900 shadow-xs"
                            : "bg-slate-950/80 border-emerald-500/30 text-slate-100 shadow-inner"
                        }`}
                      >
                        <strong className="text-emerald-600 dark:text-emerald-400 block mb-1">
                          خطوات الحل والتفسير العلمي:
                        </strong>
                        <p>{formatInlineText(currentExampleItem.explanation, theme === "light" ? "light" : "dark")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Progressive Bullet Points (For Sections, Summary, Custom Slides) */}
              {currentSlide.type !== "intro" && currentSlide.type !== "concepts" && currentSlide.type !== "engineer" && currentSlide.type !== "example" && (
                <div className="space-y-4">
                  {currentSlide.bullets.map((bullet, idx) => {
                    const isRevealed = idx <= revealedLineIndex;
                    const isLatestRevealed = idx === revealedLineIndex;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 ease-out ${
                          isRevealed
                            ? isLatestRevealed
                              ? themeStyles.bulletLatest
                              : themeStyles.bulletNormal
                            : "opacity-0 translate-y-3 pointer-events-none"
                        }`}
                      >
                        {/* Subtle clean bullet point dot */}
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-2.5 sm:mt-3 transition-all ${
                            isLatestRevealed
                              ? "bg-blue-600 ring-4 ring-blue-500/20 scale-125 shadow-xs"
                              : "bg-slate-300 dark:bg-slate-700 opacity-60"
                          }`}
                        />

                        {/* Large, crystal-clear bullet text */}
                        <div className={`flex-1 ${fontStyles.bulletText}`}>
                          {formatInlineText(bullet, theme === "light" ? "light" : "dark")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* Flow Mode: Interactive Mindmap Pipeline */
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar pb-28">
          <PresentationFlowView
            lesson={lesson}
            onSelectSlide={(targetIdx) => {
              setCurrentSlideIndex(targetIdx);
              setRevealedLineIndex(0);
              setPresentationMode("slides");
            }}
            currentSlideIndex={currentSlideIndex}
          />
        </main>
      )}

      {/* 3. Fixed Bottom Docked Bar (Pinned to the exact bottom edge) */}
      <footer
        className={`fixed bottom-0 inset-x-0 w-full z-50 h-14 sm:h-16 px-3 sm:px-6 border-t backdrop-blur-xl transition-colors flex items-center justify-between select-none shadow-2xl ${
          theme === "light"
            ? "bg-white/95 border-slate-200 text-slate-900 shadow-md"
            : "bg-slate-900/95 border-slate-800 text-white shadow-2xl"
        }`}
      >
        {/* Right side: Prev Slide / Prev Step + Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handlePrevSlideDirect}
            disabled={currentSlideIndex === 0}
            className={`p-2 rounded-xl transition-all cursor-pointer ${themeStyles.navBtn}`}
            title="الشريحة السابقة مباشرة (PageUp)"
          >
            <ChevronsRight className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={handlePrevStep}
            disabled={currentSlideIndex === 0 && revealedLineIndex === 0}
            className={`p-2 rounded-xl transition-all cursor-pointer ${themeStyles.navBtn}`}
            title="الخطوة السابقة (السهم الأيمن / Backspace)"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>

          <div className={`h-5 w-px mx-0.5 sm:mx-1 ${themeStyles.divider}`} />

          {/* Smooth Zoom Controls (50% to 400%) */}
          <div className="relative flex items-center bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-xl">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="تصغير الشاشة إلى 50% (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowZoomMenu((prev) => !prev)}
              className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-blue-500 hover:bg-white/80 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer flex items-center gap-0.5"
              title="خيارات التكبير (50% - 400%) • انقر للاختيار"
            >
              <span>{Math.round(zoomLevel * 100)}%</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4.0}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="تكبير الشاشة حتى 400% (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Quick Reset Button if Zoomed or Panned */}
            {(zoomLevel !== 1.0 || panOffset.x !== 0 || panOffset.y !== 0) && (
              <button
                onClick={handleZoomReset}
                className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors cursor-pointer ml-0.5"
                title="إعادة ضبط الحجم الطبيعي 100% والموضع (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Zoom Presets Dropdown */}
            {showZoomMenu && (
              <div
                className="absolute bottom-full mb-2.5 right-0 py-1 px-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl z-50 min-w-[120px] text-xs font-bold space-y-0.5 animate-fadeIn"
                dir="rtl"
              >
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSetZoom(preset)}
                    className={`w-full px-2.5 py-1 text-right flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                      Math.abs(zoomLevel - preset) < 0.01
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{Math.round(preset * 100)}%</span>
                    {preset === 1.0 && <span className="text-[10px] opacity-75">(100%)</span>}
                  </button>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={handleZoomReset}
                    className="w-full px-2.5 py-1 text-right flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط الحجم والموضع</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Drawing Tools Toolbar */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar max-w-[50vw] sm:max-w-none px-1">
          {/* Pointer / Drag Mode */}
          <button
            onClick={() => setActiveDrawTool("pointer")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawTool === "pointer"
                ? themeStyles.activeTool
                : themeStyles.inactiveTool
            }`}
            title="مؤشر التفاعل وسحب الصفحة في أي اتجاه (V)"
          >
            <MousePointer2 className="w-4.5 h-4.5" />
          </button>

          {/* Pen */}
          <button
            onClick={() => setActiveDrawTool("pen")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawTool === "pen"
                ? themeStyles.activeTool
                : themeStyles.inactiveTool
            }`}
            title="قلم كتابة حر (P)"
          >
            <Pen className="w-4.5 h-4.5" />
          </button>

          {/* Highlighter */}
          <button
            onClick={() => setActiveDrawTool("highlighter")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawTool === "highlighter"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                : themeStyles.inactiveTool
            }`}
            title="قلم تظليل شفاف (H)"
          >
            <Highlighter className="w-4.5 h-4.5" />
          </button>

          {/* Laser */}
          <button
            onClick={() => setActiveDrawTool("laser")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawTool === "laser"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105 animate-pulse"
                : themeStyles.inactiveTool
            }`}
            title="مؤشر ليزري (L)"
          >
            <Zap className="w-4.5 h-4.5" />
          </button>

          {/* Shapes Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowShapesPicker(!showShapesPicker)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-0.5 ${
                ["arrow", "rect", "circle", "line"].includes(activeDrawTool)
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                  : themeStyles.inactiveTool
              }`}
              title="أشكال هندسية"
            >
              <ArrowRight className="w-4.5 h-4.5" />
              <ChevronDown className="w-3 h-3 opacity-75" />
            </button>

            {showShapesPicker && (
              <div className={`absolute bottom-full mb-2.5 right-0 border rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 z-50 animate-fadeIn ${themeStyles.floatingPopup}`}>
                <button
                  onClick={() => {
                    setActiveDrawTool("arrow");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${activeDrawTool === "arrow" ? "bg-indigo-600 text-white" : themeStyles.inactiveTool}`}
                  title="سهم ➔"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveDrawTool("rect");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${activeDrawTool === "rect" ? "bg-indigo-600 text-white" : themeStyles.inactiveTool}`}
                  title="مستطيل ▢"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveDrawTool("circle");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${activeDrawTool === "circle" ? "bg-indigo-600 text-white" : themeStyles.inactiveTool}`}
                  title="دائرة ◯"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveDrawTool("line");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${activeDrawTool === "line" ? "bg-indigo-600 text-white" : themeStyles.inactiveTool}`}
                  title="خط مستقيم ─"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Text Note Tool */}
          <button
            onClick={() => setActiveDrawTool("text")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawTool === "text"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                : themeStyles.inactiveTool
            }`}
            title="إضافة ملاحظة نصية"
          >
            <Type className="w-4.5 h-4.5" />
          </button>

          {/* Eraser */}
          <button
            onClick={() => setActiveDrawTool("eraser")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeDrawTool === "eraser"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105"
                : themeStyles.inactiveTool
            }`}
            title="ممحاة (E)"
          >
            <Eraser className="w-4.5 h-4.5" />
          </button>

          <div className={`h-5 w-px mx-0.5 ${themeStyles.divider}`} />

          {/* Color Palette Dots */}
          <div className="flex items-center gap-1.5 px-1">
            {[
              { name: "أزرق", value: "#2563eb" },
              { name: "أحمر", value: "#dc2626" },
              { name: "أخضر", value: "#16a34a" },
              { name: "أصفر", value: "#f59e0b" },
              { name: "بنفسجي", value: "#9333ea" },
              { name: "أبيض/أسود", value: theme === "light" ? "#0f172a" : "#ffffff" },
            ].map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setDrawColor(c.value);
                  if (activeDrawTool === "pointer" || activeDrawTool === "eraser") {
                    setActiveDrawTool("pen");
                  }
                }}
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full transition-all cursor-pointer flex items-center justify-center border-2 border-white/20 shadow-xs ${
                  drawColor === c.value
                    ? "scale-125 ring-2 ring-blue-400 border-white"
                    : "hover:scale-110 opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          <div className={`h-5 w-px mx-0.5 hidden md:block ${themeStyles.divider}`} />

          {/* Stroke Sizes */}
          <div className="hidden md:flex items-center gap-1 px-0.5">
            {[
              { label: "رفيع", val: 2.5, dotSize: "w-1.5 h-1.5" },
              { label: "متوسط", val: 5, dotSize: "w-2.5 h-2.5" },
              { label: "عريض", val: 9, dotSize: "w-3.5 h-3.5" },
            ].map((sp) => (
              <button
                key={sp.val}
                onClick={() => setDrawSize(sp.val)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                  drawSize === sp.val
                    ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-400/40"
                    : "text-slate-400 hover:text-white"
                }`}
                title={sp.label}
              >
                <span
                  className={`${sp.dotSize} rounded-full ${
                    drawSize === sp.val ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-500"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className={`h-5 w-px mx-0.5 ${themeStyles.divider}`} />

          {/* Undo / Redo / Clear */}
          <button
            onClick={() => undoRef.current && undoRef.current()}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.inactiveTool}`}
            title="تراجع (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => redoRef.current && redoRef.current()}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.inactiveTool}`}
            title="إعادة (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => clearRef.current && clearRef.current()}
            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
            title="مسح كامل الرسومات"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Left side: Next Step / Slide / Reveal / AutoPlay */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="text-xs font-mono font-bold px-2 hidden lg:inline-block opacity-80">
            {revealedLineIndex + 1}/{totalSteps}
          </span>

          {/* Reveal All / Reset */}
          {totalSteps > 1 && (
            <button
              onClick={revealedLineIndex >= totalSteps - 1 ? handleResetSlideLines : handleRevealAllLines}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.navBtn}`}
              title={revealedLineIndex >= totalSteps - 1 ? "إعادة إخفاء النقاط (R)" : "كشف كامل نقاط الشريحة (R)"}
            >
              {revealedLineIndex >= totalSteps - 1 ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          )}

          {/* Auto Play */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isAutoPlay
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 animate-pulse"
                : themeStyles.navBtn
            }`}
            title={isAutoPlay ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي للشرائح"}
          >
            {isAutoPlay ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
          </button>

          {/* Next Step */}
          <button
            onClick={handleNextStep}
            disabled={currentSlideIndex === slides.length - 1 && revealedLineIndex === totalSteps - 1}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow-md shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="الخطوة التالية (السهم الأيسر / المسافة)"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          {/* Next Slide */}
          <button
            onClick={handleNextSlideDirect}
            disabled={currentSlideIndex === slides.length - 1}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${themeStyles.navBtn}`}
            title="الشريحة التالية مباشرة (PageDown)"
          >
            <ChevronsLeft className="w-4.5 h-4.5" />
          </button>
        </div>
      </footer>

      {/* Progress Bar along the very bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-800/40 h-1 z-50 pointer-events-none">
        <div
          className="bg-blue-600 h-full transition-all duration-300 shadow-sm"
          style={{
            width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {/* Modals & Drawers */}
      {isAIAssistantOpen && (
        <AIPresentationAssistant
          lesson={lesson}
          currentSlideTitle={currentSlide.title}
          currentSlideBullets={currentSlide.bullets}
          currentSlideBadge={currentSlide.badge}
          currentSlideIndex={currentSlideIndex}
          onAddCustomSlide={handleAddCustomSlide}
          onClose={() => setIsAIAssistantOpen(false)}
        />
      )}

      <TeacherWhiteboardModal
        isOpen={isWhiteboardOpen}
        lessonTitle={lesson.title}
        onClose={() => setIsWhiteboardOpen(false)}
      />

      <TeacherToolsDrawer
        isOpen={isTeacherToolsOpen}
        onClose={() => setIsTeacherToolsOpen(false)}
        currentSlideIndex={currentSlideIndex}
        currentSlideTitle={currentSlide.title}
        totalSlides={slides.length}
        slideType={currentSlide.type}
        engineerModelAnswer={lesson.engineerChallenge?.modelAnswer}
        solvedExampleModelAnswer={
          currentExampleItem
            ? `${typeof currentExampleItem.correctAnswer === "string" ? `الإجابة الصحيحة: (${currentExampleItem.correctAnswer.toUpperCase()})\n` : ""}${currentExampleItem.explanation}`
            : undefined
        }
      />
    </div>
  );
}
