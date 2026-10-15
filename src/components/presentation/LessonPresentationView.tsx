"use client";

/**
 * Classroom presentation of one lesson (teacher-paced, desktop only).
 *
 * Renders the lesson's deck from public/data/<part>/presentations/<lessonId>.json, built by
 * build-data from an audited plan (src/lib/presentation.ts): the book's own text, one idea per
 * slide, in the book's order. Each slide reveals its paragraphs / table rows one step at a time.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "@/types";
import type { DeckFigure, PresentationDeck } from "@/types/presentation";
import { slideStepCount } from "@/lib/presentation";
import { useJson } from "@/lib/fetch-json";
import { dataUrl } from "@/content/paths";
import { getAssetPath } from "@/lib/utils";
import { usePart } from "@/components/layout/PartProvider";
import { SlideAnnotationCanvas, DrawToolType } from "./SlideAnnotationCanvas";
import { Ltr, PresentationSlide, sectionHeading, slideLabel, type PresentationTheme } from "./PresentationSlide";
import {
  ChevronLeft,
  ChevronRight,
  Eraser,
  Eye,
  LayoutGrid,
  Loader2,
  Maximize2,
  Minimize2,
  Moon,
  MousePointer2,
  Pen,
  Sun,
  Trash2,
  X,
} from "lucide-react";

interface Props {
  lesson: Lesson;
  onExitPresentation?: () => void;
}

export function LessonPresentationView({ lesson, onExitPresentation }: Props) {
  const { key: partKey } = usePart();
  const deck = useJson<PresentationDeck>(dataUrl(partKey, `presentations/${lesson.id}.json`));

  if (deck.status !== "ready") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-200" dir="rtl">
        {deck.status === "loading" ? (
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        ) : (
          <p className="text-lg font-bold">تعذّر تحميل العرض التقديمي لهذا الدرس.</p>
        )}
        {onExitPresentation && (
          <button type="button" onClick={onExitPresentation} className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-bold">
            رجوع إلى الدرس
          </button>
        )}
      </div>
    );
  }
  return <DeckView lesson={lesson} deck={deck.data} onExit={onExitPresentation} />;
}

const PEN_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

/** Slide text scale steps (CSS zoom, so text re-wraps to the screen width). */
const FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];
const DEFAULT_SCALE = 1;
const SCALE_KEY = "presentation_font_scale";

function readSavedScale(): number {
  try {
    const saved = Number(window.localStorage.getItem(SCALE_KEY));
    return FONT_SCALES.includes(saved) ? saved : DEFAULT_SCALE;
  } catch {
    return DEFAULT_SCALE;
  }
}

function DeckView({ lesson, deck, onExit }: { lesson: Lesson; deck: PresentationDeck; onExit?: () => void }) {
  const slides = deck.slides;
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(1);
  const [revealAll, setRevealAll] = useState(false);
  const [theme, setTheme] = useState<PresentationTheme>("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [zoomed, setZoomed] = useState<DeckFigure | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTool, setDrawTool] = useState<DrawToolType>("pen");
  const [drawColor, setDrawColor] = useState(PEN_COLORS[0]);
  const [fontScale, setFontScale] = useState(readSavedScale);

  const changeScale = useCallback((direction: -1 | 0 | 1) => {
    setFontScale((current) => {
      const i = FONT_SCALES.indexOf(current);
      return direction === 0 ? DEFAULT_SCALE : FONT_SCALES[Math.max(0, Math.min(FONT_SCALES.length - 1, i + direction))];
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCALE_KEY, String(fontScale));
    } catch {
      // Storage unavailable (private window): the size just isn't remembered.
    }
  }, [fontScale]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const clearCanvasRef = useRef<(() => void) | null>(null);
  const undoCanvasRef = useRef<(() => void) | null>(null);

  const slide = slides[index];
  const stepCount = slideStepCount(slide);
  const shownSteps = revealAll ? stepCount : step;

  const goTo = useCallback(
    (i: number, atEnd = false) => {
      const target = Math.max(0, Math.min(i, total - 1));
      setIndex(target);
      setStep(atEnd ? slideStepCount(slides[target]) : 1);
      setShowOverview(false);
      mainRef.current?.scrollTo({ top: 0 });
    },
    [slides, total]
  );

  const next = useCallback(() => {
    if (!revealAll && step < stepCount) setStep(step + 1);
    else if (index < total - 1) goTo(index + 1);
  }, [revealAll, step, stepCount, index, total, goTo]);

  const prev = useCallback(() => {
    if (!revealAll && step > 1) setStep(step - 1);
    else if (index > 0) goTo(index - 1, true);
  }, [revealAll, step, index, goTo]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setIsFullscreen((v) => !v);
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // The presentation owns the keyboard while open: it listens in the capture phase and stops the keys it
  // handles, so the lesson page underneath (font size +/-, search, drawers) doesn't react behind it.
  // Ctrl/Cmd/Alt combinations pass through (e.g. the annotation canvas's Ctrl+Z).
  useEffect(() => {
    const actions: Record<string, () => void> = {
      arrowleft: next,
      " ": next,
      pagedown: next,
      enter: next,
      arrowright: prev,
      backspace: prev,
      pageup: prev,
      home: () => goTo(0),
      end: () => goTo(total - 1, true),
      escape: () => {
        if (zoomed) setZoomed(null);
        else if (showOverview) setShowOverview(false);
        else if (isDrawing) setIsDrawing(false);
        else onExit?.();
      },
      f: toggleFullscreen,
      t: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      r: () => setRevealAll((v) => !v),
      d: () => setIsDrawing((v) => !v),
      g: () => setShowOverview((v) => !v),
      "+": () => changeScale(1),
      "=": () => changeScale(1),
      "-": () => changeScale(-1),
      "0": () => changeScale(0),
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || e.ctrlKey || e.metaKey || e.altKey) return;
      const action = actions[e.key.toLowerCase()];
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      action();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [next, prev, goTo, total, zoomed, showOverview, isDrawing, onExit, toggleFullscreen, changeScale]);

  const dark = theme === "dark";
  const chrome = dark ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200 text-slate-900";
  const iconButton = `p-2 rounded-xl border transition-colors cursor-pointer ${
    dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"
  }`;

  const overviewGroups = useMemo(() => {
    const groups: { title: string; items: { i: number; label: string }[] }[] = [];
    slides.forEach((s, i) => {
      const title = s.kind === "idea" ? sectionHeading(s.sectionTitle) : s.kind === "note" ? groups[groups.length - 1]?.title ?? "" : "";
      const last = groups[groups.length - 1];
      if (last && last.title === title) last.items.push({ i, label: slideLabel(s) });
      else groups.push({ title, items: [{ i, label: slideLabel(s) }] });
    });
    return groups;
  }, [slides]);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none ${dark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      <header className={`shrink-0 border-b ${chrome}`}>
        <div className="h-1 bg-slate-500/20">
          <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <div className="px-6 py-2 flex items-center gap-3">
          <span className="shrink-0 px-3 py-1 rounded-lg bg-sky-600 text-white text-sm font-black">
            الدرس <Ltr>{lesson.number}</Ltr>
          </span>
          <span className="truncate text-base font-bold opacity-80">{lesson.title}</span>
          <div className="ms-auto flex items-center gap-2">
            <button type="button" onClick={() => setShowOverview(true)} className={`${iconButton} flex items-center gap-2 text-sm font-bold`} title="كل الشرائح (G)">
              <LayoutGrid className="w-4 h-4" />
              {index + 1} من {total}
            </button>
            <div className={`flex items-center rounded-xl border ${dark ? "border-slate-700" : "border-slate-200"}`}>
              <button
                type="button"
                onClick={() => changeScale(-1)}
                disabled={fontScale === FONT_SCALES[0]}
                className="px-2.5 py-1.5 text-sm font-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="تصغير الخط (-)"
                dir="ltr"
              >
                A−
              </button>
              <button type="button" onClick={() => changeScale(0)} className="px-1 text-xs font-bold tabular-nums cursor-pointer opacity-80" title="الحجم العادي (0)">
                {Math.round(fontScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => changeScale(1)}
                disabled={fontScale === FONT_SCALES[FONT_SCALES.length - 1]}
                className="px-2.5 py-1.5 text-base font-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="تكبير الخط (+)"
                dir="ltr"
              >
                A+
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRevealAll((v) => !v)}
              className={`${iconButton} ${revealAll ? "bg-sky-600 text-white border-sky-500" : ""}`}
              title="إظهار الشريحة كاملة (R)"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDrawing((v) => !v)}
              className={`${iconButton} ${isDrawing ? "bg-sky-600 text-white border-sky-500" : ""}`}
              title="قلم التعليق (D)"
            >
              <Pen className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setTheme(dark ? "light" : "dark")} className={iconButton} title="الوضع الفاتح / الداكن (T)">
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button type="button" onClick={toggleFullscreen} className={iconButton} title="ملء الشاشة (F)">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {onExit && (
              <button type="button" onClick={onExit} className={`${iconButton} text-red-500`} title="إنهاء العرض (Esc)">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="relative flex-1 overflow-y-auto px-10 xl:px-16 pt-10 pb-28">
        {isDrawing && (
          <div className="absolute inset-0 z-30">
            <SlideAnnotationCanvas
              slideIndex={index}
              activeTool={drawTool}
              color={drawColor}
              size={3.5}
              clearRef={clearCanvasRef}
              undoRef={undoCanvasRef}
            />
          </div>
        )}
        {/* Inline term chips from formatInlineText stay in the line at projector sizes instead of wrapping as blocks. */}
        <div key={index} className="relative z-10 min-h-full flex flex-col justify-center max-w-[1500px] mx-auto animate-fadeIn [&_.inline-flex]:inline">
          {/* zoom (not transform) so enlarged text re-wraps to the screen width; the outer box keeps the centring. */}
          <div style={{ zoom: fontScale }}>
            <PresentationSlide slide={slide} step={shownSteps} focus={!revealAll} theme={theme} onZoom={setZoomed} />
          </div>
        </div>
      </main>

      <nav
        aria-label="التنقل بين الشرائح"
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-2xl backdrop-blur ${chrome}`}
      >
        <button
          type="button"
          onClick={prev}
          disabled={index === 0 && step === 1}
          className="p-2 rounded-xl hover:bg-slate-500/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          title="السابق (→)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="flex items-center gap-1 px-1" aria-label={`الخطوة ${shownSteps} من ${stepCount}`}>
          {stepCount > 1 &&
            Array.from({ length: stepCount }, (_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < shownSteps ? "bg-sky-500" : "bg-slate-500/40"}`} />
            ))}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={index === total - 1 && shownSteps >= stepCount}
          className="p-2 rounded-xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          title="التالي (← أو المسافة)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {isDrawing && (
          <>
            <span className="w-px h-5 bg-slate-500/30 mx-1" />
            {(
              [
                ["pointer", MousePointer2, "مؤشر"],
                ["pen", Pen, "قلم"],
                ["eraser", Eraser, "ممحاة"],
              ] as const
            ).map(([tool, Icon, label]) => (
              <button
                key={tool}
                type="button"
                onClick={() => setDrawTool(tool)}
                className={`p-1.5 rounded-lg cursor-pointer ${drawTool === tool ? "bg-sky-600 text-white" : "hover:bg-slate-500/20"}`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setDrawColor(c)}
                className={`w-4 h-4 rounded-full border-2 cursor-pointer ${drawColor === c ? "scale-125 border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                title="لون القلم"
              />
            ))}
            <button type="button" onClick={() => clearCanvasRef.current?.()} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer" title="مسح الرسم">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </nav>

      {showOverview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowOverview(false)}>
          <div
            className={`w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border p-6 space-y-5 ${chrome}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">شرائح الدرس ({total})</h3>
              <button type="button" onClick={() => setShowOverview(false)} className={iconButton} title="إغلاق">
                <X className="w-4 h-4" />
              </button>
            </div>
            {overviewGroups.map((g, gi) => (
              <div key={gi} className="space-y-2">
                {g.title && <p className="text-sm font-black opacity-60">{g.title}</p>}
                <div className="grid grid-cols-2 gap-2">
                  {g.items.map(({ i, label }) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-right text-sm font-bold cursor-pointer ${
                        i === index ? "bg-sky-600 text-white border-sky-500" : dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="shrink-0 w-7 text-center font-mono opacity-70">{i + 1}</span>
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center gap-4 p-8" onClick={() => setZoomed(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getAssetPath(zoomed.src)} alt={zoomed.caption} className="max-h-[80vh] max-w-full object-contain rounded-2xl bg-white" />
          <p className="text-white text-lg font-bold text-center">{zoomed.caption}</p>
        </div>
      )}
    </div>
  );
}
