"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Type,
  MousePointer2,
  Sparkles,
  Check,
  Palette,
  Maximize2,
  Minimize2,
  Grid,
  Square,
  Circle,
  ArrowRight,
  Minus,
  StickyNote,
  Smile,
  X,
  Plus,
  ChevronDown
} from "lucide-react";

interface TeacherWhiteboardModalProps {
  isOpen: boolean;
  lessonTitle: string;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface DrawStroke {
  tool: "pen" | "highlighter" | "eraser" | "line" | "arrow" | "rect" | "circle";
  color: string;
  size: number;
  points: Point[];
}

interface StickyNoteItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: "yellow" | "cyan" | "green" | "pink";
}

interface StampItem {
  id: string;
  x: number;
  y: number;
  emoji: string;
  label: string;
}

export function TeacherWhiteboardModal({
  isOpen,
  lessonTitle,
  onClose,
}: TeacherWhiteboardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Background style: white, chalkboard, math grid, dot grid, ruled (Default is chalkboard)
  const [boardTheme, setBoardTheme] = useState<"white" | "chalkboard" | "grid" | "dots" | "ruled">("chalkboard");

  // Tools state
  const [activeTool, setActiveTool] = useState<
    "pointer" | "pen" | "highlighter" | "eraser" | "line" | "arrow" | "rect" | "circle" | "text" | "sticky" | "stamp"
  >("pen");

  const [color, setColor] = useState<string>("#ffffff");
  const [size, setSize] = useState<number>(3.5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Strokes history & Redo (using ref for 60fps lag-free rendering)
  const strokesRef = useRef<DrawStroke[]>([]);
  const undoStackRef = useRef<DrawStroke[][]>([]);
  const redoStackRef = useRef<DrawStroke[][]>([]);
  const [, setForceRender] = useState<number>(0);

  // Floating Sticky Notes & Stamps
  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>([]);
  const [stamps, setStamps] = useState<StampItem[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<string>("⭐");
  const [showStampPicker, setShowStampPicker] = useState<boolean>(false);
  const [showShapesPicker, setShowShapesPicker] = useState<boolean>(false);

  // Colors
  const presetColors = [
    { name: "أزرق ملكي", value: "#1e40af" },
    { name: "كحلي داكن", value: "#0f172a" },
    { name: "أحمر احترافي", value: "#dc2626" },
    { name: "أخضر زمردي", value: "#16a34a" },
    { name: "أصفر تظليل", value: "#f59e0b" },
    { name: "بنفسجي", value: "#7c3aed" },
    { name: "وردي", value: "#ec4899" },
    { name: "أبيض", value: "#ffffff" },
  ];

  // Thickness presets
  const sizePresets = [
    { label: "دقيق", val: 2 },
    { label: "متوسط", val: 4 },
    { label: "عريض", val: 7 },
    { label: "عريض جداً", val: 12 },
  ];

  // Redraw Canvas with smooth Bézier curves
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const currentStrokes = strokesRef.current;

    for (const stroke of currentStrokes) {
      if (stroke.points.length === 0) continue;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "highlighter") {
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.38;
        ctx.lineWidth = stroke.size * 5.5;
        ctx.globalCompositeOperation = "source-over";
      } else if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = stroke.size * 8;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.size;
        ctx.globalCompositeOperation = "source-over";
      }

      const p0 = stroke.points[0];
      const pLast = stroke.points[stroke.points.length - 1];

      if (stroke.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();
      } else if (stroke.tool === "arrow") {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pLast.x, pLast.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(pLast.y - p0.y, pLast.x - p0.x);
        const headlen = 14 + stroke.size * 1.5;
        ctx.beginPath();
        ctx.moveTo(pLast.x, pLast.y);
        ctx.lineTo(
          pLast.x - headlen * Math.cos(angle - Math.PI / 6),
          pLast.y - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(pLast.x, pLast.y);
        ctx.lineTo(
          pLast.x - headlen * Math.cos(angle + Math.PI / 6),
          pLast.y - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (stroke.tool === "rect") {
        ctx.beginPath();
        const width = pLast.x - p0.x;
        const height = pLast.y - p0.y;
        ctx.strokeRect(p0.x, p0.y, width, height);
      } else if (stroke.tool === "circle") {
        ctx.beginPath();
        const rx = Math.abs(pLast.x - p0.x) / 2;
        const ry = Math.abs(pLast.y - p0.y) / 2;
        const cx = (p0.x + pLast.x) / 2;
        const cy = (p0.y + pLast.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        // Freehand pen, highlighter, or eraser
        ctx.beginPath();
        if (stroke.points.length === 1) {
          ctx.arc(p0.x, p0.y, stroke.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        } else if (stroke.points.length === 2) {
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(pLast.x, pLast.y);
          ctx.stroke();
        } else {
          ctx.moveTo(p0.x, p0.y);
          for (let i = 1; i < stroke.points.length - 1; i++) {
            const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
            const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
          }
          ctx.lineTo(pLast.x, pLast.y);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }, []);

  // Sync canvas size with container & DPR
  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    redraw();
  }, [redraw]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(syncCanvas, 30);
      const handleResize = () => syncCanvas();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isOpen, syncCanvas]);

  // Whiteboard Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "z" || e.code === "KeyZ")) {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || e.code === "KeyY")) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        setActiveTool("pen");
      } else if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        setActiveTool("highlighter");
      } else if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        setActiveTool("eraser");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

    if (activeTool === "sticky") {
      setStickyNotes((prev) => [
        ...prev,
        {
          id: `sticky-${Date.now()}`,
          x: pt.x,
          y: pt.y,
          text: "اكتب الملاحظة هنا...",
          color: "yellow",
        },
      ]);
      setActiveTool("pointer");
      return;
    }

    if (activeTool === "stamp") {
      setStamps((prev) => [
        ...prev,
        {
          id: `stamp-${Date.now()}`,
          x: pt.x,
          y: pt.y,
          emoji: selectedStamp,
          label: "تقييم صفي",
        },
      ]);
      return;
    }

    if (activeTool === "text") {
      setStickyNotes((prev) => [
        ...prev,
        {
          id: `sticky-${Date.now()}`,
          x: pt.x,
          y: pt.y,
          text: "ملاحظة توضيحية...",
          color: "cyan",
        },
      ]);
      setActiveTool("pointer");
      return;
    }

    // Normal stroke
    undoStackRef.current.push([...strokesRef.current]);
    redoStackRef.current = [];
    setStartPoint(pt);
    setIsDrawing(true);

    const actualColor = boardTheme === "chalkboard" && color === "#0f172a" ? "#ffffff" : color;

    const newStroke: DrawStroke = {
      tool: activeTool,
      color: actualColor,
      size,
      points: [pt],
    };

    strokesRef.current.push(newStroke);
    redraw();

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === "pointer" || activeTool === "sticky" || activeTool === "text" || activeTool === "stamp") return;
    const pt = getCanvasCoords(e);

    const currentStrokes = strokesRef.current;
    if (currentStrokes.length === 0) return;

    const current = currentStrokes[currentStrokes.length - 1];

    if (
      current.tool === "line" ||
      current.tool === "arrow" ||
      current.tool === "rect" ||
      current.tool === "circle"
    ) {
      current.points = [startPoint || current.points[0], pt];
    } else {
      current.points.push(pt);
    }

    redraw();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      redraw();
      setForceRender((v) => v + 1);

      const canvas = canvasRef.current;
      if (canvas) {
        try {
          if (canvas.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore
        }
      }
    }
  };

  const handleUndo = () => {
    if (undoStackRef.current.length > 0) {
      const prevState = undoStackRef.current.pop() || [];
      redoStackRef.current.push([...strokesRef.current]);
      strokesRef.current = prevState;
      redraw();
      setForceRender((v) => v + 1);
    } else if (strokesRef.current.length > 0) {
      redoStackRef.current.push([...strokesRef.current]);
      strokesRef.current.pop();
      redraw();
      setForceRender((v) => v + 1);
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const nextState = redoStackRef.current.pop() || [];
    undoStackRef.current.push([...strokesRef.current]);
    strokesRef.current = nextState;
    redraw();
    setForceRender((v) => v + 1);
  };

  const handleClearAll = () => {
    undoStackRef.current.push([...strokesRef.current]);
    redoStackRef.current = [];
    strokesRef.current = [];
    setStickyNotes([]);
    setStamps([]);
    redraw();
    setForceRender((v) => v + 1);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Background CSS pattern
  const getBoardBgStyle = () => {
    switch (boardTheme) {
      case "chalkboard":
        return "bg-slate-900 text-white";
      case "grid":
        return "bg-slate-50 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] [background-size:24px_24px]";
      case "dots":
        return "bg-slate-50 bg-[radial-gradient(#64748b_1.8px,transparent_1.8px)] [background-size:28px_28px]";
      case "ruled":
        return "bg-slate-50 bg-[linear-gradient(transparent_27px,#cbd5e1_28px)] [background-size:100%_28px]";
      case "white":
      default:
        return "bg-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md select-none animate-fadeIn" dir="rtl">
      {/* Top Whiteboard Command Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-50 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30">
            🖍️
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>السبورة الرقمية التفاعلية للمعلم</span>
              <span className="text-[11px] font-normal text-slate-400">({lessonTitle})</span>
            </h3>
          </div>
        </div>

        {/* Board Background Chooser */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setBoardTheme("white")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              boardTheme === "white" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            بيضاء ⚪
          </button>
          <button
            onClick={() => setBoardTheme("chalkboard")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              boardTheme === "chalkboard" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            سوداء ⚫
          </button>
          <button
            onClick={() => setBoardTheme("grid")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              boardTheme === "grid" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            شبكة مربعات 📐
          </button>
          <button
            onClick={() => setBoardTheme("dots")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              boardTheme === "dots" ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            نقاط 🔘
          </button>
          <button
            onClick={() => setBoardTheme("ruled")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              boardTheme === "ruled" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            مسطرة 📝
          </button>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="تصدير صورة السبورة PNG"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-600/20"
          >
            <X className="w-4 h-4" />
            <span>إغلاق والعودة للشرائح</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas Container */}
      <div ref={containerRef} className={`relative flex-1 w-full h-full overflow-hidden ${getBoardBgStyle()}`}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`absolute inset-0 w-full h-full touch-none select-none ${
            activeTool === "pointer"
              ? "pointer-events-none"
              : activeTool === "sticky" || activeTool === "text"
              ? "cursor-text pointer-events-auto"
              : activeTool === "stamp"
              ? "cursor-copy pointer-events-auto"
              : activeTool === "eraser"
              ? "cursor-cell pointer-events-auto"
              : "cursor-crosshair pointer-events-auto"
          }`}
        />

        {/* Render Sticky Notes */}
        {stickyNotes.map((note) => (
          <div
            key={note.id}
            style={{ left: `${note.x}px`, top: `${note.y}px` }}
            className={`absolute z-40 w-56 p-3 rounded-2xl shadow-2xl border ${
              note.color === "yellow"
                ? "border-amber-300 bg-amber-100/95 text-slate-900"
                : note.color === "cyan"
                ? "border-sky-300 bg-sky-100/95 text-slate-900"
                : note.color === "green"
                ? "border-emerald-300 bg-emerald-100/95 text-slate-900"
                : "border-pink-300 bg-pink-100/95 text-slate-900"
            } text-xs font-semibold animate-fadeIn`}
          >
            <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-black/10">
              <span className="text-[10px] font-bold opacity-80">📌 ورقة ملاحظة تفاعلية</span>
              <button
                onClick={() => setStickyNotes((prev) => prev.filter((n) => n.id !== note.id))}
                className="text-slate-500 hover:text-rose-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
            <textarea
              defaultValue={note.text}
              className="w-full bg-transparent border-none outline-none resize-none text-xs leading-relaxed text-slate-800 placeholder-slate-500 font-bold"
              rows={3}
              placeholder="اكتب ملاحظاتك..."
            />
          </div>
        ))}

        {/* Render Stamps */}
        {stamps.map((st) => (
          <div
            key={st.id}
            style={{ left: `${st.x}px`, top: `${st.y}px` }}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 text-3xl select-none animate-bounce cursor-pointer hover:scale-125 transition-transform"
            onClick={() => setStamps((prev) => prev.filter((s) => s.id !== st.id))}
            title="انقر للحذف"
          >
            {st.emoji}
          </div>
        ))}

        {/* Floating Tools Dock */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl text-white animate-fadeIn">
          <button
            onClick={() => setActiveTool("pointer")}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeTool === "pointer" ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-900"
            }`}
            title="مؤشر عادي"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* Pen */}
          <button
            onClick={() => setActiveTool("pen")}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeTool === "pen" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:bg-slate-900"
            }`}
            title="قلم كتابة حر (P)"
          >
            <Pen className="w-4 h-4" />
          </button>

          {/* Highlighter */}
          <button
            onClick={() => setActiveTool("highlighter")}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeTool === "highlighter" ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-900"
            }`}
            title="قلم تظليل شفاف (H)"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Shapes Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShapesPicker(!showShapesPicker);
                setShowStampPicker(false);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                ["arrow", "rect", "circle", "line"].includes(activeTool)
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-900"
              }`}
              title="الأشكال الهندسية والأسهم"
            >
              <ArrowRight className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showShapesPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setActiveTool("arrow");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    activeTool === "arrow" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                  title="سهم توضيحي ➔"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveTool("rect");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    activeTool === "rect" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                  title="مستطيل ▢"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveTool("circle");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    activeTool === "circle" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                  title="دائرة ◯"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveTool("line");
                    setShowShapesPicker(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    activeTool === "line" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                  title="خط مستقيم ─"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sticky Notes */}
          <button
            onClick={() => setActiveTool("sticky")}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeTool === "sticky" ? "bg-yellow-500 text-slate-950" : "text-slate-400 hover:bg-slate-900"
            }`}
            title="إضافة ورقة ملاحظات لاصقة"
          >
            <StickyNote className="w-4 h-4" />
          </button>

          {/* Stamps */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStampPicker(!showStampPicker);
                setShowShapesPicker(false);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                activeTool === "stamp" ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-900"
              }`}
              title="أختام التقييم الصفي"
            >
              <Smile className="w-4 h-4" />
              <span className="text-xs">{selectedStamp}</span>
            </button>

            {showStampPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 z-50 animate-fadeIn">
                {["⭐", "✔️", "❌", "💡", "🎯", "⚠️", "❓", "👏", "🔥"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStamp(st);
                      setActiveTool("stamp");
                      setShowStampPicker(false);
                    }}
                    className="text-lg p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-transform hover:scale-125"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Eraser */}
          <button
            onClick={() => setActiveTool("eraser")}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeTool === "eraser" ? "bg-rose-600 text-white" : "text-slate-400 hover:bg-slate-900"
            }`}
            title="ممحاة (E)"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* Color palette */}
          <div className="flex items-center gap-1 px-1">
            {presetColors.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setColor(c.value);
                  if (activeTool === "pointer" || activeTool === "eraser") setActiveTool("pen");
                }}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                  color === c.value ? "scale-125 border-white shadow-sm ring-2 ring-blue-500/30" : "border-slate-700 opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {color === c.value && <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Thickness */}
          <div className="flex items-center gap-0.5 px-0.5">
            {sizePresets.map((sp) => (
              <button
                key={sp.val}
                onClick={() => setSize(sp.val)}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  size === sp.val ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={undoStackRef.current.length === 0}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            title="تراجع (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStackRef.current.length === 0}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            title="إعادة (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearAll}
            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
            title="مسح كامل السبورة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
