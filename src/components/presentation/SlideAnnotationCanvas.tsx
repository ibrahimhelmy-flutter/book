"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  Trash2,
  Download,
  Type,
  MousePointer2,
  Sparkles,
  Check,
  Palette
} from "lucide-react";

export interface AnnotationCanvasProps {
  slideIndex: number;
}

interface Point {
  x: number;
  y: number;
}

interface DrawStroke {
  tool: "pen" | "highlighter" | "eraser";
  color: string;
  size: number;
  points: Point[];
}

interface TextNote {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export function SlideAnnotationCanvas({ slideIndex }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools state - Pen is selected by default so writing is available all the time!
  const [activeTool, setActiveTool] = useState<"pointer" | "pen" | "highlighter" | "eraser" | "text">("pen");
  const [color, setColor] = useState<string>("#1e40af"); // Executive Royal Blue
  const [size, setSize] = useState<number>(3.5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Persistent history across slide changes
  const strokesHistoryRef = useRef<Record<number, DrawStroke[]>>({});
  const undoStackRef = useRef<Record<number, DrawStroke[][]>>({});
  const textNotesRef = useRef<Record<number, TextNote[]>>({});

  // Active floating text note state
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // Executive corporate color palette
  const presetColors = [
    { name: "أزرق ملكي", value: "#1e40af" },
    { name: "كحلي داكن", value: "#0f172a" },
    { name: "أحمر احترافي", value: "#dc2626" },
    { name: "أخضر زمردي", value: "#16a34a" },
    { name: "أصفر تظليل", value: "#d97706" },
    { name: "بنفسجي", value: "#7c3aed" },
  ];

  // Size presets
  const sizePresets = [
    { label: "دقيق", val: 2 },
    { label: "متوسط", val: 4 },
    { label: "عريض", val: 7 },
  ];

  // Redraw canvas with smooth quadratic Bézier curve interpolation
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const slideStrokes = strokesHistoryRef.current[slideIndex] || [];

    for (const stroke of slideStrokes) {
      if (stroke.points.length === 0) continue;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "highlighter") {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stroke.size * 5.5;
        ctx.globalCompositeOperation = "source-over";
      } else if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = stroke.size * 6;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.size;
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.beginPath();
      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else if (stroke.points.length === 2) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
        ctx.stroke();
      } else {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        ctx.lineTo(
          stroke.points[stroke.points.length - 1].x,
          stroke.points[stroke.points.length - 1].y
        );
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw persistent text notes on this slide
    const notes = textNotesRef.current[slideIndex] || [];
    for (const note of notes) {
      ctx.save();
      ctx.font = `bold ${note.fontSize}px 'Cairo', sans-serif`;
      ctx.fillStyle = note.color;
      ctx.fillText(note.text, note.x, note.y);
      ctx.restore();
    }
  }, [slideIndex]);

  // Sync canvas dimensions with device pixel ratio
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      redrawCanvas();
    }
  }, [redrawCanvas]);

  useEffect(() => {
    syncCanvasSize();
    const handleResize = () => syncCanvasSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [syncCanvasSize, slideIndex]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === "pointer") return;

    const pt = getCanvasCoords(e);

    if (activeTool === "text") {
      setActiveTextInput({ x: pt.x, y: pt.y, text: "" });
      return;
    }

    // Save previous state for undo
    if (!undoStackRef.current[slideIndex]) {
      undoStackRef.current[slideIndex] = [];
    }
    const current = strokesHistoryRef.current[slideIndex] || [];
    undoStackRef.current[slideIndex].push([...current]);

    const newStroke: DrawStroke = {
      tool: activeTool,
      color,
      size,
      points: [pt],
    };

    if (!strokesHistoryRef.current[slideIndex]) {
      strokesHistoryRef.current[slideIndex] = [];
    }
    strokesHistoryRef.current[slideIndex].push(newStroke);
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === "pointer" || activeTool === "text") return;
    const pt = getCanvasCoords(e);

    const slideStrokes = strokesHistoryRef.current[slideIndex];
    if (!slideStrokes || slideStrokes.length === 0) return;

    const currentStroke = slideStrokes[slideStrokes.length - 1];
    currentStroke.points.push(pt);

    redrawCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    }
  };

  const handleUndo = () => {
    const stack = undoStackRef.current[slideIndex];
    if (stack && stack.length > 0) {
      const prevState = stack.pop() || [];
      strokesHistoryRef.current[slideIndex] = prevState;
      redrawCanvas();
    }
  };

  const handleClear = () => {
    if (!undoStackRef.current[slideIndex]) {
      undoStackRef.current[slideIndex] = [];
    }
    const current = strokesHistoryRef.current[slideIndex] || [];
    undoStackRef.current[slideIndex].push([...current]);

    strokesHistoryRef.current[slideIndex] = [];
    textNotesRef.current[slideIndex] = [];
    redrawCanvas();
  };

  const handleSaveTextNote = () => {
    if (activeTextInput && activeTextInput.text.trim()) {
      if (!textNotesRef.current[slideIndex]) {
        textNotesRef.current[slideIndex] = [];
      }
      textNotesRef.current[slideIndex].push({
        x: activeTextInput.x,
        y: activeTextInput.y,
        text: activeTextInput.text,
        color,
        fontSize: size * 4 + 14,
      });
      redrawCanvas();
    }
    setActiveTextInput(null);
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `slide_${slideIndex + 1}_annotations.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-30 transition-all ${
        activeTool === "pointer"
          ? "pointer-events-none"
          : "pointer-events-auto cursor-crosshair"
      }`}
    >
      {/* High-Precision Vector Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full touch-none select-none ${
          activeTool === "pointer" ? "pointer-events-none" : "pointer-events-auto"
        }`}
      />

      {/* Floating Text Note Input Box */}
      {activeTextInput && (
        <div
          className="absolute z-50 bg-white border-2 border-blue-600 rounded-xl p-2.5 shadow-2xl pointer-events-auto"
          style={{
            left: `${activeTextInput.x}px`,
            top: `${activeTextInput.y}px`,
            transform: "translate(-10%, -50%)",
          }}
        >
          <input
            type="text"
            autoFocus
            value={activeTextInput.text}
            onChange={(e) =>
              setActiveTextInput({ ...activeTextInput, text: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTextNote();
              if (e.key === "Escape") setActiveTextInput(null);
            }}
            placeholder="اكتب ملاحظة واضغط Enter..."
            className="px-2.5 py-1 text-sm border-none outline-none font-bold text-slate-900 bg-transparent min-w-[220px]"
          />
          <div className="flex justify-end gap-1.5 mt-1.5 border-t border-slate-100 pt-1.5">
            <button
              onClick={() => setActiveTextInput(null)}
              className="text-[11px] px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer font-semibold"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveTextNote}
              className="text-[11px] px-3 py-1 bg-blue-600 text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700"
            >
              حفظ الملاحظة
            </button>
          </div>
        </div>
      )}

      {/* Executive Clean Floating Annotation Dock (Always Accessible) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 transition-all">
        {/* Pointer / Cursor Mode */}
        <button
          onClick={() => setActiveTool("pointer")}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "pointer"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          title="مؤشر عادي للتفاعل"
        >
          <MousePointer2 className="w-4 h-4" />
          <span className="hidden sm:inline">مؤشر</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Pen Tool (Default) */}
        <button
          onClick={() => setActiveTool("pen")}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "pen"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="قلم كتابة حر (نشط دائماً)"
        >
          <Pen className="w-4 h-4" />
          <span className="hidden sm:inline">قلم</span>
        </button>

        {/* Highlighter Tool */}
        <button
          onClick={() => setActiveTool("highlighter")}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "highlighter"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="قلم تظليل شفاف"
        >
          <Highlighter className="w-4 h-4" />
          <span className="hidden sm:inline">تظليل</span>
        </button>

        {/* Text Note Tool */}
        <button
          onClick={() => setActiveTool("text")}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "text"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="إضافة نص وملاحظة"
        >
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">نص</span>
        </button>

        {/* Eraser Tool */}
        <button
          onClick={() => setActiveTool("eraser")}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "eraser"
              ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="ممحاة الرسم"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">ممحاة</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* 1-Click Preset Colors */}
        <div className="flex items-center gap-1.5 px-1">
          {presetColors.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setColor(c.value);
                if (activeTool === "pointer" || activeTool === "eraser") {
                  setActiveTool("pen");
                }
              }}
              className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                color === c.value
                  ? "scale-125 border-slate-900 shadow-sm"
                  : "border-transparent hover:scale-110 opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {color === c.value && <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Stroke Thickness */}
        <div className="flex items-center gap-1 px-1">
          {sizePresets.map((sp) => (
            <button
              key={sp.val}
              onClick={() => setSize(sp.val)}
              className={`px-1.5 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                size === sp.val ? "bg-slate-200 text-slate-900" : "text-slate-400 hover:text-slate-700"
              }`}
              title={`سمك الخط ${sp.label}`}
            >
              {sp.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Undo */}
        <button
          onClick={handleUndo}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="تراجع (Undo)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="مسح كل رسومات الشريحة"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Download Snapshot */}
        <button
          onClick={handleDownloadSnapshot}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="حفظ الشريحة بالرسم كصورة PNG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
