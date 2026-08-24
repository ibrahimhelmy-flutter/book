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
  Maximize2,
  Minimize2,
  Palette,
  Eye,
  EyeOff
} from "lucide-react";

export interface AnnotationCanvasProps {
  slideIndex: number;
  isDrawingActive: boolean;
  onToggleDrawing: () => void;
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

export function SlideAnnotationCanvas({
  slideIndex,
  isDrawingActive,
  onToggleDrawing,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools state
  const [tool, setTool] = useState<"pen" | "highlighter" | "eraser" | "text">("pen");
  const [color, setColor] = useState<string>("#1e40af"); // Default Corporate Royal Blue
  const [size, setSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Storage of strokes per slide index to persist during slide navigation
  const strokesHistoryRef = useRef<Record<number, DrawStroke[]>>({});
  const undoStackRef = useRef<Record<number, DrawStroke[][]>>({});
  const textNotesRef = useRef<Record<number, TextNote[]>>({});

  // Text tool active input
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const colors = [
    { name: "أزرق ملكي", value: "#1e40af" },
    { name: "كحلي داكن", value: "#0f172a" },
    { name: "سماوي", value: "#0284c7" },
    { name: "أحمر احترافي", value: "#dc2626" },
    { name: "أخضر زمردي", value: "#16a34a" },
    { name: "أصفر تظليل", value: "#eab308" },
    { name: "بنفسجي", value: "#7c3aed" },
    { name: "برتقالي", value: "#ea580c" },
  ];

  // Initialize or resize canvas
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
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
  }, [slideIndex]);

  // Redraw all saved strokes and notes for current slide
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
      if (stroke.points.length < 2) continue;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "highlighter") {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stroke.size * 5;
      } else if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = stroke.size * 6;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.size;
      }

      ctx.stroke();
      ctx.restore();
    }

    // Draw text notes
    const notes = textNotesRef.current[slideIndex] || [];
    for (const note of notes) {
      ctx.save();
      ctx.font = `bold ${note.fontSize}px 'Cairo', sans-serif`;
      ctx.fillStyle = note.color;
      ctx.fillText(note.text, note.x, note.y);
      ctx.restore();
    }
  }, [slideIndex]);

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [syncCanvasSize, slideIndex]);

  // Pointer drawing handlers
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
    if (!isDrawingActive) return;
    const pt = getCanvasCoords(e);

    if (tool === "text") {
      setActiveTextInput({ x: pt.x, y: pt.y, text: "" });
      return;
    }

    // Save previous state for undo
    if (!undoStackRef.current[slideIndex]) {
      undoStackRef.current[slideIndex] = [];
    }
    const currentStrokes = strokesHistoryRef.current[slideIndex] || [];
    undoStackRef.current[slideIndex].push([...currentStrokes]);

    const newStroke: DrawStroke = {
      tool,
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
    if (!isDrawing || !isDrawingActive || tool === "text") return;
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
        fontSize: size * 5 + 12,
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
      className={`absolute inset-0 pointer-events-none z-30 transition-all ${
        isDrawingActive ? "cursor-crosshair" : ""
      }`}
    >
      {/* Interactive Canvas Layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full ${
          isDrawingActive ? "pointer-events-auto touch-none" : "pointer-events-none"
        }`}
      />

      {/* Floating Text Note Input Box */}
      {activeTextInput && (
        <div
          className="absolute z-40 bg-white border-2 border-blue-600 rounded-lg p-2 shadow-2xl pointer-events-auto"
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
            placeholder="اكتب ملاحظتك واضغط Enter..."
            className="px-2 py-1 text-sm border-none outline-none font-bold text-slate-900 bg-transparent min-w-[200px]"
          />
          <div className="flex justify-end gap-1 mt-1 border-t border-slate-100 pt-1">
            <button
              onClick={() => setActiveTextInput(null)}
              className="text-[11px] px-2 py-0.5 text-slate-500 hover:bg-slate-100 rounded"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveTextNote}
              className="text-[11px] px-2 py-0.5 bg-blue-600 text-white rounded font-bold"
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* Corporate Professional Floating Annotation Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl transition-all">
        {/* Toggle Pen Mode Active */}
        <button
          onClick={onToggleDrawing}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
            isDrawingActive
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          title="تفعيل / إيقاف وضع الرسم الحر"
        >
          {isDrawingActive ? <Eye className="w-4 h-4" /> : <Pen className="w-4 h-4" />}
          <span>{isDrawingActive ? "لوحة التأشير نشطة" : "أقلام الشرح"}</span>
        </button>

        {isDrawingActive && (
          <>
            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Pen Tool */}
            <button
              onClick={() => setTool("pen")}
              className={`p-2 rounded-xl transition-colors ${
                tool === "pen"
                  ? "bg-blue-100 text-blue-800 font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="قلم الكتابة الحر"
            >
              <Pen className="w-4 h-4" />
            </button>

            {/* Highlighter Tool */}
            <button
              onClick={() => setTool("highlighter")}
              className={`p-2 rounded-xl transition-colors ${
                tool === "highlighter"
                  ? "bg-amber-100 text-amber-800 font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="قلم التظليل الشفاف (Highlighter)"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {/* Text Note Tool */}
            <button
              onClick={() => setTool("text")}
              className={`p-2 rounded-xl transition-colors ${
                tool === "text"
                  ? "bg-purple-100 text-purple-800 font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="إضافة ملاحظة نصية"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Eraser Tool */}
            <button
              onClick={() => setTool("eraser")}
              className={`p-2 rounded-xl transition-colors ${
                tool === "eraser"
                  ? "bg-rose-100 text-rose-800 font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="ممحاة"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Color Palette Selector */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title="اختر لون القلم"
              />

              {showColorPicker && (
                <div className="absolute top-10 right-0 bg-white border border-slate-200 rounded-xl p-2 shadow-2xl flex gap-1.5 z-50">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setColor(c.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 ${
                        color === c.value ? "border-slate-900 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Line Width Controls */}
            <div className="flex items-center gap-1 px-1">
              {[2, 4, 7].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    size === s ? "bg-slate-200 font-bold" : "hover:bg-slate-100"
                  }`}
                  title={`حجم الخط ${s}`}
                >
                  <div
                    className="rounded-full bg-slate-800"
                    style={{ width: `${s * 2}px`, height: `${s * 2}px` }}
                  />
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Undo */}
            <button
              onClick={handleUndo}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="تراجع عن آخر خطوة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear All */}
            <button
              onClick={handleClear}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="مسح كل الرسومات على الشريحة"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Download slide drawing */}
            <button
              onClick={handleDownloadSnapshot}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="تحميل الشريحة بالرسم كصورة"
            >
              <Download className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
